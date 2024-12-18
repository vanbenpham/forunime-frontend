// SingleDiscussion.tsx

import {
  Box,
  IconButton,
  TextField,
  Typography,
  Paper,
  Alert,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Pagination,
  Button,
  Modal,
  SelectChangeEvent,
} from '@mui/material';
import React, { useEffect, useState, useMemo } from 'react';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import LoginBar from '../../components/appbar/LoginBar';
import { useNavigate, useParams } from 'react-router-dom';
import { useUser } from '../../components/context/UserContext';
import ReplyIcon from '@mui/icons-material/Reply';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';
import axios from 'axios';

interface User {
  user_id: number;
  username: string;
  role: string;
  profile_picture_url?: string;
}

interface Comment {
  comment_id: number;
  content: string;
  date_created: string;
  user_id: number;
  post_id: number;
  parent_comment_id: number | null;
  user: User;
  replies?: Comment[];
  parentContent?: string;
}

interface Post {
  post_id: number;
  content: string;
  date_created: string;
  user_id: number;
  user: User;
  comments: Comment[];
}

const SingleDiscussion: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const { postId } = useParams<{ postId: string }>();
  const [search, setSearch] = useState<string>('');
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [flattenedComments, setFlattenedComments] = useState<Comment[]>([]);
  const [loadingComments, setLoadingComments] = useState<boolean>(true);
  const [commentsError, setCommentsError] = useState<string | null>(null);

  // Pagination state variables
  const [commentsPerPage, setCommentsPerPage] = useState<number>(5);
  const [currentPage, setCurrentPage] = useState<number>(1);

  // New comment state variables
  const [replyToComment, setReplyToComment] = useState<Comment | null>(null);
  const [commentContent, setCommentContent] = useState<string>('');

  // Edit post state variables
  const [isEditingPost, setIsEditingPost] = useState<boolean>(false);
  const [editedPostContent, setEditedPostContent] = useState<string>('');
  const [postModalOpen, setPostModalOpen] = useState<boolean>(false);

  // Edit comment state variables
  const [isEditingComment, setIsEditingComment] = useState<boolean>(false);
  const [commentToEdit, setCommentToEdit] = useState<Comment | null>(null);
  const [editedCommentContent, setEditedCommentContent] = useState<string>('');
  const [commentModalOpen, setCommentModalOpen] = useState<boolean>(false);

  const apiUrl = import.meta.env.VITE_REACT_APP_API_URL;
  // Fetch the post data from the backend
  useEffect(() => {
    if (!user || !user.token) {
      return;
    }
    const fetchPost = async () => {
      try {
        if (!postId) {
          setError('Post ID not found in URL.');
          setLoading(false);
          return;
        }

        const response = await axios.get<Post>(`${apiUrl}/posts/${postId}`, {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        });

        setPost(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching post:', err);
        setError('Failed to fetch post');
        setLoading(false);
      }
    };

    fetchPost();
  }, [postId, user]);

  // Function to flatten nested comments
  const flattenComments = (comments: Comment[]): Comment[] => {
    const flatList: Comment[] = [];
    const commentMap = new Map<number, Comment>();

    const recursiveFlatten = (commentList: Comment[]) => {
      for (const comment of commentList) {
        // If the comment has a parent_comment_id, get the parent's content
        if (comment.parent_comment_id) {
          const parentComment = commentMap.get(comment.parent_comment_id);
          if (parentComment) {
            comment.parentContent =
              parentComment.content.substring(0, 50) +
              (parentComment.content.length > 50 ? '...' : '');
          }
        }

        flatList.push(comment);
        commentMap.set(comment.comment_id, comment);

        if (comment.replies && comment.replies.length > 0) {
          recursiveFlatten(comment.replies);
        }
      }
    };

    recursiveFlatten(comments);
    return flatList;
  };

  // Fetch comments from the backend
  useEffect(() => {
    if (!user || !user.token) {
      return;
    }
    const fetchComments = async () => {
      console.log("This is post id" + postId);
      console.log(isEditingPost,isEditingComment);

      try {
        if (!postId) {
          setCommentsError('Post ID not found in URL.');
          setLoadingComments(false);
          return;
        }

        const response = await axios.get<Comment[]>(`${apiUrl}/comments/posts/${postId}`, {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        });

        const fetchedComments = response.data;
        const flatComments = flattenComments(fetchedComments);
        setFlattenedComments(flatComments);
        setLoadingComments(false);
      } catch (err) {
        console.error('Error fetching comments:', err);
        setCommentsError('Failed to fetch comments');
        setLoadingComments(false);
      }
    };

    fetchComments();
  }, [postId, user]);

  // Handle search input change
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(event.target.value);
    setCurrentPage(1); // Reset to first page on new search
  };

  // Filter comments based on search query
  const filteredComments = useMemo(() => {
    const lowerSearch = search.toLowerCase();
    return flattenedComments.filter(
      (comment) =>
        comment.user.username.toLowerCase().includes(lowerSearch) ||
        comment.content.toLowerCase().includes(lowerSearch)
    );
  }, [search, flattenedComments]);

  // Calculate total pages based on filtered comments and commentsPerPage
  const totalPages = Math.ceil(filteredComments.length / commentsPerPage);

  // Get current comments to display
  const currentComments = useMemo(() => {
    const indexOfLastComment = currentPage * commentsPerPage;
    const indexOfFirstComment = indexOfLastComment - commentsPerPage;
    return filteredComments.slice(indexOfFirstComment, indexOfLastComment);
  }, [currentPage, commentsPerPage, filteredComments]);

  // Handle page change
  const handlePageChange = (_event: React.ChangeEvent<unknown>, value: number) => {
    setCurrentPage(value);
  };

  // Handle comments per page change
  const handleCommentsPerPageChange = (
    event: SelectChangeEvent<number>,
    _child: React.ReactNode
  ) => {
    setCommentsPerPage(Number(event.target.value));
    setCurrentPage(1); // Reset to first page
  };
  

  // Handle reply icon click
  const handleReplyClick = (comment: Comment) => {
    setReplyToComment(comment);
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
  };

  // Handle cancel reply
  const handleCancelReply = () => {
    setReplyToComment(null);
  };

  // Handle comment submission
  const handleCommentSubmit = async () => {
    if (!commentContent.trim()) return;

    try {
      const commentData = {
        content: commentContent,
        post_id: post!.post_id,
        parent_comment_id: replyToComment ? replyToComment.comment_id : null,
      };

      const response = await axios.post(
        `${apiUrl}/comments/`,
        commentData,
        {
          headers: {
            Authorization: `Bearer ${user?.token}`,
          },
        }
      );

      const newComment = response.data as Comment;

      // If the new comment has a parent_comment_id, set parentContent
      if (newComment.parent_comment_id) {
        const parentComment = flattenedComments.find(
          (c) => c.comment_id === newComment.parent_comment_id
        );
        if (parentComment) {
          newComment.parentContent =
            parentComment.content.substring(0, 50) +
            (parentComment.content.length > 50 ? '...' : '');
        }
      }

      // Update comments state
      setFlattenedComments((prevComments) => [newComment, ...prevComments]);

      setCommentContent('');
      setReplyToComment(null);
      setCurrentPage(1); // Optionally move to first page to see the new comment
    } catch (error) {
      console.error('Error submitting comment:', error);
      // Handle error (show a message to the user)
    }
  };

  // Handle delete post
  const handleDeletePost = async () => {
    try {
      if (!post) return;

      const response = await axios.delete(`${apiUrl}/posts/${post.post_id}`, {
        headers: {
          Authorization: `Bearer ${user?.token}`,
        },
      });

      if (response.status === 204) {
        navigate('/discussion'); // Navigate back or to a specific page after deletion
      } else {
        console.error('Failed to delete post:', response.data);
      }
    } catch (error) {
      console.error('Error deleting post:', error);
      // Handle error (show a message to the user)
    }
  };

  // Handle edit post
  const handleEditPost = () => {
    if (!post) return;
    setEditedPostContent(post.content);
    setIsEditingPost(true);
    setPostModalOpen(true);
  };

  const handleUpdatePost = async () => {
    try {
      if (!post) return;

      const response = await axios.put(
        `${apiUrl}/posts/${post.post_id}`,
        { content: editedPostContent },
        {
          headers: {
            Authorization: `Bearer ${user?.token}`,
          },
        }
      );

      if (response.status === 200) {
        setPost({ ...post, content: editedPostContent });
        setIsEditingPost(false);
        setPostModalOpen(false);
      } else {
        console.error('Failed to update post:', response.data);
      }
    } catch (error) {
      console.error('Error updating post:', error);
      // Handle error (show a message to the user)
    }
  };

  const handleClosePostModal = () => {
    setIsEditingPost(false);
    setPostModalOpen(false);
  };

  // Handle delete comment
  const handleDeleteComment = async (commentId: number) => {
    try {
      const response = await axios.delete(`${apiUrl}/comments/comment/${commentId}`, {
        headers: {
          Authorization: `Bearer ${user?.token}`,
        },
      });

      if (response.status === 204) {
        // Remove the deleted comment from the state
        setFlattenedComments((prevComments) =>
          prevComments.filter((comment) => comment.comment_id !== commentId)
        );
      } else {
        console.error('Failed to delete comment:', response.data);
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
      // Handle error (show a message to the user)
    }
  };

  // Handle edit comment
  const handleEditComment = (comment: Comment) => {
    setCommentToEdit(comment);
    setEditedCommentContent(comment.content);
    setIsEditingComment(true);
    setCommentModalOpen(true);
  };

  const handleUpdateComment = async () => {
    try {
      if (!commentToEdit) return;

      const response = await axios.put(
        `${apiUrl}/comments/comment/${commentToEdit.comment_id}`,
        { content: editedCommentContent },
        {
          headers: {
            Authorization: `Bearer ${user?.token}`,
          },
        }
      );

      if (response.status === 200) {
        // Update the comment in the state
        setFlattenedComments((prevComments) =>
          prevComments.map((comment) =>
            comment.comment_id === commentToEdit.comment_id
              ? { ...comment, content: editedCommentContent }
              : comment
          )
        );
        setIsEditingComment(false);
        setCommentModalOpen(false);
        setCommentToEdit(null);
      } else {
        console.error('Failed to update comment:', response.data);
      }
    } catch (error) {
      console.error('Error updating comment:', error);
      // Handle error (show a message to the user)
    }
  };

  const handleCloseCommentModal = () => {
    setIsEditingComment(false);
    setCommentModalOpen(false);
    setCommentToEdit(null);
  };

  if (!user) {
    return null;
  }

  // Handle loading and error states
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <Typography variant="h6">Loading...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box display="flex" flexDirection="column">
      {/* App Bar */}
      <LoginBar pageTitle="SINGLE DISCUSSION" />

      {/* Back Button and Search Bar */}
      <Box display="flex" justifyContent="center" alignItems="center" padding="16px">
        <IconButton onClick={() => navigate(-1)}>
          <ArrowBackIcon sx={{ color: 'white' }} />
        </IconButton>
        <TextField
          label="Search Comments"
          variant="outlined"
          value={search}
          onChange={handleSearchChange}
          sx={{ marginLeft: 2, backgroundColor: 'white', width: '50%' }}
        />
      </Box>

      {/* Post Content */}
      {post ? (
        <Box
          component={Paper}
          sx={{
            display: 'flex',
            alignItems: 'flex-start',
            padding: 2,
            marginY: '10px',
            marginX: '20px',
            border: '3px #C3C4B8 solid',
          }}
        >
          {/* Left Side: User profile photo and name */}
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 80 }}>
            <img
              src={post.user.profile_picture_url || 'https://via.placeholder.com/50'}
              alt={`${post.user.username}'s profile`}
              style={{ width: 50, height: 50, borderRadius: '50%' }}
            />
            <Typography variant="subtitle1">{post.user.username}</Typography>
          </Box>

          {/* Right Side: Post content */}
          <Box sx={{ flexGrow: 1, marginLeft: 2 }}>
            <Typography variant="h6">{post.content}</Typography>
            <Typography variant="caption" color="textSecondary">
              {new Date(post.date_created).toLocaleString()}
            </Typography>
          </Box>

          {/* Far Right: Edit and Delete icons (if applicable) */}
          <Box sx={{ marginLeft: 'auto' }}>
            {(user.user_id === post.user_id || user.role === 'admin') && (
              <>
                <IconButton size="small" onClick={handleEditPost}>
                  <EditIcon fontSize="small" />
                </IconButton>
                <IconButton size="small" onClick={handleDeletePost}>
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </>
            )}
          </Box>
        </Box>
      ) : (
        <Typography variant="body1">Post not found</Typography>
      )}

      {/* Comments Section */}
      <Box
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="stretch"
        component={Paper}
        sx={{
          backgroundColor: 'white',
          marginY: '10px',
          marginX: '20px',
          border: '3px #C3C4B8 solid',
          padding: '10px',
        }}
      >
        <Typography variant="h6" gutterBottom>
          Comments
        </Typography>

        {loadingComments ? (
          <Typography variant="body1" align="center" sx={{ marginTop: 4 }}>
            Loading comments...
          </Typography>
        ) : commentsError ? (
          <Alert severity="error">{commentsError}</Alert>
        ) : filteredComments.length === 0 ? (
          <Typography variant="body1" align="center" sx={{ marginTop: 4 }}>
            No comments found.
          </Typography>
        ) : (
          currentComments.map((comment) => (
            <CommentComponent
              key={comment.comment_id}
              comment={comment}
              onReply={handleReplyClick}
              onEdit={handleEditComment}
              onDelete={handleDeleteComment}
            />
          ))
        )}
      </Box>

      {/* Pagination Controls */}
      {filteredComments.length > 0 && (
        <Box
          display="flex"
          component={Paper}
          justifyContent="space-between"
          alignItems="center"
          padding="16px"
          flexWrap="wrap"
          sx={{
            backgroundColor: 'rgba(229, 225, 210, 0.7)',
            margin: '5px',
            border: '2px solid rgb(229, 225, 210)',
          }}
        >
          {/* Comments Per Page Selector */}
          <FormControl
            variant="outlined"
            size="small"
            sx={{ minWidth: 150, marginBottom: { xs: 2, sm: 0 } }}
          >
            <InputLabel id="comments-per-page-label">Comments per page</InputLabel>
            <Select
              labelId="comments-per-page-label"
              value={commentsPerPage}
              onChange={handleCommentsPerPageChange}
              label="Comments per page"
            >
              <MenuItem value={5}>5</MenuItem>
              <MenuItem value={10}>10</MenuItem>
              <MenuItem value={20}>20</MenuItem>
            </Select>
          </FormControl>

          {/* Pagination */}
          <Pagination
            count={totalPages}
            page={currentPage}
            onChange={handlePageChange}
            variant="outlined"
            shape="rounded"
            showFirstButton
            showLastButton
            siblingCount={1}
            boundaryCount={2}
          />
        </Box>
      )}

      {/* Comment Input Field */}
      <Box
        component={Paper}
        sx={{
          padding: 2,
          marginY: '10px',
          marginX: '20px',
          border: '3px #C3C4B8 solid',
          backgroundColor: 'rgba(229, 225, 210, 0.7)',
        }}
      >
        {replyToComment && (
          <Box display="flex" alignItems="center" marginBottom={1}>
            <Typography variant="body2">
              Replying to: {replyToComment.content.substring(0, 50)}{' '}
              {replyToComment.content.length > 50 ? '...' : ''}
            </Typography>
            <IconButton size="small" onClick={handleCancelReply}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>
        )}
        <TextField
          label="Type your comment"
          variant="outlined"
          fullWidth
          multiline
          minRows={3}
          value={commentContent}
          onChange={(e) => setCommentContent(e.target.value)}
        />
        <Button
          variant="contained"
          color="primary"
          sx={{ marginTop: 1 }}
          onClick={handleCommentSubmit}
          disabled={!commentContent.trim()}
        >
          Submit
        </Button>
      </Box>

      {/* Edit Post Modal */}
      <Modal
        open={postModalOpen}
        onClose={handleClosePostModal}
        aria-labelledby="edit-post-modal-title"
        aria-describedby="edit-post-modal-description"
      >
        <Box
          sx={{
            position: 'absolute' as 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 400,
            bgcolor: 'white',
            border: '2px solid #000',
            boxShadow: 24,
            p: 4,
          }}
        >
          <Typography id="edit-post-modal-title" variant="h6" component="h2">
            Edit Post
          </Typography>
          <TextField
            label="Post Content"
            variant="outlined"
            value={editedPostContent}
            onChange={(e) => setEditedPostContent(e.target.value)}
            fullWidth
            multiline
            rows={4}
            sx={{ mt: 2 }}
          />
          <Button
            variant="contained"
            onClick={handleUpdatePost}
            sx={{ mt: 2 }}
            disabled={!editedPostContent.trim()}
          >
            Update
          </Button>
        </Box>
      </Modal>

      {/* Edit Comment Modal */}
      <Modal
        open={commentModalOpen}
        onClose={handleCloseCommentModal}
        aria-labelledby="edit-comment-modal-title"
        aria-describedby="edit-comment-modal-description"
      >
        <Box
          sx={{
            position: 'absolute' as 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 400,
            bgcolor: 'white',
            border: '2px solid #000',
            boxShadow: 24,
            p: 4,
          }}
        >
          <Typography id="edit-comment-modal-title" variant="h6" component="h2">
            Edit Comment
          </Typography>
          <TextField
            label="Comment Content"
            variant="outlined"
            value={editedCommentContent}
            onChange={(e) => setEditedCommentContent(e.target.value)}
            fullWidth
            multiline
            rows={4}
            sx={{ mt: 2 }}
          />
          <Button
            variant="contained"
            onClick={handleUpdateComment}
            sx={{ mt: 2 }}
            disabled={!editedCommentContent.trim()}
          >
            Update
          </Button>
        </Box>
      </Modal>
    </Box>
  );
};

interface CommentProps {
  comment: Comment;
  onReply: (comment: Comment) => void;
  onEdit: (comment: Comment) => void;
  onDelete: (commentId: number) => void;
}

const CommentComponent: React.FC<CommentProps> = ({ comment, onReply, onEdit, onDelete }) => {
  const { user } = useUser();

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'flex-start',
        marginTop: 2,
        padding: 1,
        borderBottom: '1px solid #ddd',
      }}
    >
      {/* Left Side: User profile photo and name */}
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 60 }}>
        <img
          src={comment.user.profile_picture_url || 'https://via.placeholder.com/50'}
          alt={`${comment.user.username}'s profile`}
          style={{ width: 40, height: 40, borderRadius: '50%' }}
        />
        <Typography variant="caption">{comment.user.username}</Typography>
      </Box>

      {/* Right Side: Comment content and date */}
      <Box sx={{ flexGrow: 1, marginLeft: 2 }}>
        {comment.parent_comment_id && comment.parentContent && (
          <Paper sx={{ padding: 1, backgroundColor: '#f5f5f5', marginBottom: 1 }}>
            <Typography variant="caption" color="textSecondary">
              Replying to: {comment.parentContent}
            </Typography>
          </Paper>
        )}
        <Typography variant="body2">{comment.content}</Typography>
        <Typography variant="caption" color="textSecondary">
          {new Date(comment.date_created).toLocaleString()}
        </Typography>
      </Box>

      {/* Far Right: Reply, Edit, Delete icons */}
      <Box sx={{ marginLeft: 'auto' }}>
        <IconButton size="small" onClick={() => onReply(comment)}>
          <ReplyIcon fontSize="small" />
        </IconButton>
        {(user && (user.user_id === comment.user_id || user.role === 'admin')) && (
          <>
            <IconButton size="small" onClick={() => onEdit(comment)}>
              <EditIcon fontSize="small" />
            </IconButton>
            <IconButton size="small" onClick={() => onDelete(comment.comment_id)}>
              <DeleteIcon fontSize="small" />
            </IconButton>
          </>
        )}
      </Box>
    </Box>
  );
};

export default SingleDiscussion;
