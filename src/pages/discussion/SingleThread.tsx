// SingleThread.tsx

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
  Modal,
  Button,
} from '@mui/material';
import React, { useState, useEffect, useMemo } from 'react';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddIcon from '@mui/icons-material/Add';
import LoginBar from '../../components/appbar/LoginBar';
import { useNavigate, useParams } from 'react-router-dom'; // Import useParams
import { useUser } from '../../components/context/UserContext';
import axios from 'axios';

// Define the types based on your API response
interface User {
  user_id: number;
  username: string;
  email: string;
  role: string;
  date_created: string;
  profile_photo_url?: string;
}

interface Comment {
  comment_id: number;
  content: string;
  date_created: string;
  photo?: string;
  user_id: number;
  post_id: number;
  parent_comment_id?: number;
  user: User;
  replies: Comment[];
}

interface Post {
  post_id: number;
  user_id: number;
  content: string;
  date_created: string;
  photo?: string;
  user: User;
  comments: Comment[];
  thread_id?: number; // Made optional to accommodate nullable thread_id
}

const SingleThread = () => {
  const navigate = useNavigate();
  const { user } = useUser();


  // Use useParams to extract thread_id from the URL
  const { threadId } = useParams<{ threadId: string }>(); // Assuming the route parameter is named threadId
  const thread_id = threadId ? parseInt(threadId, 10) : null;

  const [search, setSearch] = useState<string>('');
  const [postsPerPage, setPostsPerPage] = useState<number>(5);
  const [currentPage, setCurrentPage] = useState<number>(1);

  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // State for modal and post creation
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [newPostContent, setNewPostContent] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const apiUrl = import.meta.env.VITE_REACT_APP_API_URL;

  // Fetch posts from the API
  useEffect(() => {
    if (!user || !user.token) {
      return;
    }
    const fetchPosts = async () => {
      try {
        let url = `${apiUrl}/posts`;

        if (thread_id !== null) {
          url += `?thread_id=${thread_id}`;
        } else {
          // Handle the case where thread_id is null
          // For example, fetch posts without a thread_id or handle accordingly
          url += '?thread_id=null';
        }

        const response = await axios.get<Post[]>(url, {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        });

        console.log('API Response:', response.data);

        if (Array.isArray(response.data)) {
          setPosts(response.data);
        } else {
          setPosts([]);
        }

        setLoading(false);
      } catch (err) {
        console.error('Error fetching posts:', err);
        setError('Failed to fetch posts');
        setLoading(false);
      }
    };

    fetchPosts();
  }, [user, thread_id]); // Include thread_id in the dependency array

  // Filter posts based on search query
  const filteredPosts = useMemo(() => {
    const lowerSearch = search.toLowerCase();
    return posts.filter(
      (post) =>
        post.user.username.toLowerCase().includes(lowerSearch) ||
        post.content.toLowerCase().includes(lowerSearch)
    );
  }, [search, posts]);

  // Calculate total pages based on filtered posts and postsPerPage
  const totalPages = Math.ceil(filteredPosts.length / postsPerPage);

  // Get current posts to display
  const currentPosts = useMemo(() => {
    const indexOfLastPost = currentPage * postsPerPage;
    const indexOfFirstPost = indexOfLastPost - postsPerPage;
    return filteredPosts.slice(indexOfFirstPost, indexOfLastPost);
  }, [currentPage, postsPerPage, filteredPosts]);

  // Handle page change
  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setCurrentPage(value);
  };

  // Handle posts per page change
  const handlePostsPerPageChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setPostsPerPage(event.target.value as number);
    setCurrentPage(1); // Reset to first page
  };

  // Handle search input change
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(event.target.value);
    setCurrentPage(1); // Reset to first page on new search
  };

  // Modal handlers
  const handleOpenModal = () => {
    setOpenModal(true);
    setErrorMessage('');
    setNewPostContent('');
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setErrorMessage('');
    setNewPostContent('');
  };

  // Handle creating a new post
  const handleCreatePost = async () => {
    try {
      const postData: any = { content: newPostContent };
      if (thread_id !== null) {
        postData.thread_id = thread_id;
      } else {
        // If thread_id is null, you might include profile_user_id or handle accordingly
        postData.profile_user_id = user.user_id;
      }

      const response = await axios.post(
        `${apiUrl}/posts`,
        postData,
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        }
      );

      if (response.status === 201) {
        // Close modal, reset error message, and refresh posts
        handleCloseModal();
        setErrorMessage('');

        // Add the new post to the posts state
        setPosts([response.data, ...posts]);
      } else {
        console.error('Failed to create post:', response.data);
      }
    } catch (error: any) {
      console.error('Error creating post:', error);
      if (axios.isAxiosError(error)) {
        if (error.response && error.response.status === 400) {
          // Display the error message from the backend
          setErrorMessage(error.response.data.detail);
        } else {
          setErrorMessage('An unexpected error occurred. Please try again.');
        }
      }
    }
  };


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
      <LoginBar pageTitle="SINGLE THREAD" />

      {/* Back Button, Search Bar, and Add Post Button */}
      <Box display="flex" justifyContent="center" alignItems="center" padding="16px">
        <IconButton onClick={() => navigate(-1)}>
          <ArrowBackIcon sx={{ color: 'white' }} />
        </IconButton>
        <TextField
          label="Search"
          variant="outlined"
          value={search}
          onChange={handleSearchChange}
          sx={{ marginLeft: 2, backgroundColor: 'white', width: '50%' }}
        />
        {/* Add Post Button */}
        <IconButton onClick={handleOpenModal}>
          <AddIcon sx={{ color: 'white' }} />
        </IconButton>
      </Box>

      {/* Display error message if any */}
      {errorMessage && (
        <Alert severity="error" sx={{ marginX: 'auto', width: '50%' }}>
          {errorMessage}
        </Alert>
      )}

      {/* Render the list of posts */}
      <Box
        component={Paper}
        sx={{
          backgroundColor: 'rgba(229, 225, 210, 0.7)',
          margin: '5px',
          border: '2px solid rgb(229, 225, 210)',
        }}
      >
        {filteredPosts.length === 0 ? (
          <Typography variant="body1" align="center" sx={{ marginTop: 4 }}>
            No posts found.
          </Typography>
        ) : (
          currentPosts.map((post) => (
            <Paper key={post.post_id} sx={{ margin: 2, padding: 2 }}>
              <Box display="flex" alignItems="flex-start">
                {/* Left Side: User profile photo and username */}
                <Box display="flex" flexDirection="column" alignItems="center" width="80px">
                  <img
                    src={post.user.profile_photo_url || '/default-profile.png'}
                    alt={post.user.username}
                    style={{ width: 50, height: 50, borderRadius: '50%' }}
                  />
                  <Typography variant="caption">{post.user.username}</Typography>
                </Box>

                {/* Middle: Post content (shortened) and date created */}
                <Box flexGrow={1} marginLeft={2}>
                  <Typography
                    variant="body2"
                    onClick={() => navigate(`/singlediscussion/${post.post_id}`)}
                    sx={{ cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
                  >
                    {post.content.length > 100
                      ? `${post.content.substring(0, 100)}...`
                      : post.content}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    {new Date(post.date_created).toLocaleDateString()}
                  </Typography>
                </Box>

                {/* Next to content on the right: Total replies */}
                <Box
                  display="flex"
                  flexDirection="column"
                  alignItems="center"
                  width="80px"
                  ml={1}
                >
                  <Typography variant="body2">Replies: {post.comments.length}</Typography>
                </Box>

                {/* Far Right: User profile photo and username again */}
                <Box display="flex" flexDirection="column" alignItems="center" width="80px">
                  <img
                    src={post.user.profile_photo_url || '/default-profile.png'}
                    alt={post.user.username}
                    style={{ width: 50, height: 50, borderRadius: '50%' }}
                  />
                  <Typography variant="caption">{post.user.username}</Typography>
                </Box>
              </Box>
            </Paper>
          ))
        )}
      </Box>

      {/* Pagination Controls */}
      {filteredPosts.length > 0 && (
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
          {/* Posts Per Page Selector */}
          <FormControl
            variant="outlined"
            size="small"
            sx={{ minWidth: 150, marginBottom: { xs: 2, sm: 0 } }}
          >
            <InputLabel id="posts-per-page-label">Posts per page</InputLabel>
            <Select
              labelId="posts-per-page-label"
              value={postsPerPage}
              onChange={handlePostsPerPageChange}
              label="Posts per page"
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

      {/* Modal for creating a new post */}
      <Modal
        open={openModal}
        onClose={handleCloseModal}
        aria-labelledby="create-post-modal-title"
        aria-describedby="create-post-modal-description"
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
          <Typography id="create-post-modal-title" variant="h6" component="h2">
            Create New Post
          </Typography>
          {errorMessage && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {errorMessage}
            </Alert>
          )}
          <TextField
            label="Post Content"
            variant="outlined"
            value={newPostContent}
            onChange={(e) => setNewPostContent(e.target.value)}
            fullWidth
            multiline
            rows={4}
            sx={{ mt: 2 }}
          />
          <Button
            variant="contained"
            onClick={handleCreatePost}
            sx={{ mt: 2 }}
            disabled={!newPostContent.trim()}
          >
            Create
          </Button>
        </Box>
      </Modal>
    </Box>
  );
};

export default SingleThread;
