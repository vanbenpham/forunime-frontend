import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  IconButton,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate, useParams } from 'react-router-dom';
import { useUser } from '../../components/context/UserContext';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import axios from 'axios';
import LoginBar from '../../components/appbar/LoginBar';

interface User {
  user_id: number;
  username: string;
  profile_picture_url?: string;
  role?: string;
}

interface Review {
  review_id: number;
  name: string;
  type: string;
  description: string;
  date_created: string;
  feedback_owner_id: number;
  user: User;
  photo_url?: string;
  review_count: number;
  average_rate: number;
}

interface Comment {
  comment_id: number;
  content: string;
  date_created: string;
  user: User;
  rate: number;
}

const SingleReview: React.FC = () => {
  const navigate = useNavigate();
  const { reviewId } = useParams<{ reviewId: string }>();
  const { user } = useUser();
  const [review, setReview] = useState<Review | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState<string>('');
  const [newCommentRate, setNewCommentRate] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [hasCommented, setHasCommented] = useState<boolean>(false);

  // New state variables for editing review
  const [isEditingReview, setIsEditingReview] = useState<boolean>(false);
  const [editedReviewData, setEditedReviewData] = useState<Partial<Review>>({});
  const [editedReviewPhoto, setEditedReviewPhoto] = useState<File | null>(null);

  // New state variables for editing comments
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editedCommentContent, setEditedCommentContent] = useState<string>('');
  const [editedCommentRate, setEditedCommentRate] = useState<number>(0);
  

  // Confirmation dialog state
  const [confirmDeleteReview, setConfirmDeleteReview] = useState<boolean>(false);
  const [confirmDeleteCommentId, setConfirmDeleteCommentId] = useState<number | null>(null);

  const apiUrl = import.meta.env.VITE_REACT_APP_API_URL || 'http://127.0.0.1:8000';
  
  const cloudName = import.meta.env.VITE_CLOUD_NAME;
  const cloudUploadPreset = import.meta.env.VITE_KEY_NAME_CLOUDINARY;

  useEffect(() => {
    if (!user || !user.token) {
      return;
    }
    const fetchReview = async () => {
      try {
        const response = await axios.get<Review>(
          `${apiUrl}/reviews/${reviewId}`,
          {
            headers: {
              Authorization: `Bearer ${user?.token}`,
            },
          }
        );
        setReview(response.data);
      } catch (err) {
        console.error('Failed to fetch review:', err);
        setError('Failed to fetch review');
      }
    };

    const fetchComments = async () => {
      try {
        const response = await axios.get<Comment[]>(
          `${apiUrl}/comments/reviews/${reviewId}`,
          {
            headers: {
              Authorization: `Bearer ${user?.token}`,
            },
          }
        );
        setComments(response.data);

        // Check if the current user has already commented
        const userComment = response.data.find(
          (comment) => comment.user.user_id === user?.user_id
        );
        if (userComment) {
          setHasCommented(true);
        }
      } catch (err) {
        console.error('Failed to fetch comments:', err);
        setError('Failed to fetch comments');
      } finally {
        setLoading(false);
      }
    };

    fetchReview();
    fetchComments();
  }, [apiUrl, reviewId, user]);

  // Function to handle image change
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setEditedReviewPhoto(e.target.files[0]);
    }
  };

  // Handle review edit
  const handleEditReview = () => {
    if (review) {
      setIsEditingReview(true);
      setEditedReviewData({
        name: review.name,
        type: review.type,
        description: review.description,
        photo_url: review.photo_url,
      });
    }
  };

  const handleCancelEditReview = () => {
    setIsEditingReview(false);
    setEditedReviewData({});
    setEditedReviewPhoto(null);
  };

  const handleSubmitEditReview = async () => {
    try {
      let photoUrl = editedReviewData.photo_url || '';
      if (editedReviewPhoto) {
        const formData = new FormData();
        formData.append('file', editedReviewPhoto);
        formData.append('upload_preset', cloudUploadPreset || '');

        const cloudinaryResponse = await axios.post(
          `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
          formData
        );
        photoUrl = cloudinaryResponse.data.secure_url;
      }

      const updatedReviewData = {
        ...editedReviewData,
        photo_url: photoUrl || null,
      };

      const response = await axios.put<Review>(
        `${apiUrl}/reviews/${reviewId}`,
        updatedReviewData,
        {
          headers: {
            Authorization: `Bearer ${user?.token}`,
          },
        }
      );
      setReview(response.data);
      setIsEditingReview(false);
      setEditedReviewData({});
      setEditedReviewPhoto(null);
    } catch (err) {
      console.error('Failed to update review:', err);
      setError('Failed to update review');
    }
  };

  // Handle review delete
  const handleDeleteReview = async () => {
    try {
      await axios.delete(`${apiUrl}/reviews/${reviewId}`, {
        headers: {
          Authorization: `Bearer ${user?.token}`,
        },
      });
      navigate(-1); // Go back to the previous page
    } catch (err) {
      console.error('Failed to delete review:', err);
      setError('Failed to delete review');
    }
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="100vh"
      >
        <Typography variant="h6">Loading...</Typography>
      </Box>
    );
  }

  if (error || !review) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="100vh"
      >
        <Typography variant="h6" color="error">
          {error || 'Review not found'}
        </Typography>
      </Box>
    );
  }

  // Handle comment edit
  const handleEditComment = (comment: Comment) => {
    setEditingCommentId(comment.comment_id);
    setEditedCommentContent(comment.content);
    setEditedCommentRate(comment.rate);
  };

  const handleCancelEditComment = () => {
    setEditingCommentId(null);
    setEditedCommentContent('');
    setEditedCommentRate(0);
  };

  const handleSubmitEditComment = async (commentId: number) => {
    try {
      const updatedCommentData = {
        content: editedCommentContent,
        rate: editedCommentRate,
      };
      const response = await axios.put<Comment>(
        `${apiUrl}/comments/comment/${commentId}`,
        updatedCommentData,
        {
          headers: {
            Authorization: `Bearer ${user?.token}`,
          },
        }
      );
      // Update the comments state
      setComments((prevComments) =>
        prevComments.map((comment) =>
          comment.comment_id === commentId ? response.data : comment
        )
      );
      // Refresh the review to update average_rate
      const reviewResponse = await axios.get<Review>(
        `${apiUrl}/reviews/${reviewId}`,
        {
          headers: {
            Authorization: `Bearer ${user?.token}`,
          },
        }
      );
      setReview(reviewResponse.data);
      // Reset editing state
      handleCancelEditComment();
    } catch (err) {
      console.error('Failed to update comment:', err);
      setError('Failed to update comment');
    }
  };

  // Handle comment delete
  const handleDeleteComment = async (commentId: number) => {
    try {
      await axios.delete(`${apiUrl}/comments/comment/${commentId}`, {
        headers: {
          Authorization: `Bearer ${user?.token}`,
        },
      });
      // Remove the comment from the state
      setComments((prevComments) =>
        prevComments.filter((comment) => comment.comment_id !== commentId)
      );
      setHasCommented(false);
      // Refresh the review to update average_rate
      const reviewResponse = await axios.get<Review>(
        `${apiUrl}/reviews/${reviewId}`,
        {
          headers: {
            Authorization: `Bearer ${user?.token}`,
          },
        }
      );
      setReview(reviewResponse.data);
    } catch (err) {
      console.error('Failed to delete comment:', err);
      setError('Failed to delete comment');
    }
  };

  // Handle new comment submission
  const handleSubmitComment = async () => {
    if (!newComment.trim() || newCommentRate === 0) {
      setError('Please provide a comment and a rating.');
      return;
    }

    try {
      const newCommentData = {
        content: newComment,
        rate: newCommentRate,
        review_id: Number(reviewId),
      };
      await axios.post(`${apiUrl}/comments/`, newCommentData, {
        headers: {
          Authorization: `Bearer ${user?.token}`,
        },
      });
      setNewComment('');
      setNewCommentRate(0);
      setHasCommented(true);

      // Refresh comments and review data to reflect updates
      const [commentsResponse, reviewResponse] = await Promise.all([
        axios.get<Comment[]>(`${apiUrl}/comments/reviews/${reviewId}`, {
          headers: {
            Authorization: `Bearer ${user?.token}`,
          },
        }),
        axios.get<Review>(`${apiUrl}/reviews/${reviewId}`, {
          headers: {
            Authorization: `Bearer ${user?.token}`,
          },
        }),
      ]);
      setComments(commentsResponse.data);
      setReview(reviewResponse.data);
    } catch (err) {
      console.error('Failed to submit comment:', err);
      setError('Failed to submit comment');
    }
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="100vh"
      >
        <Typography variant="h6">Loading...</Typography>
      </Box>
    );
  }

  if (error || !review) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="100vh"
      >
        <Typography variant="h6" color="error">
          {error || 'Review not found'}
        </Typography>
      </Box>
    );
  }

  return (
    <Box display="flex" flexDirection="column">
      <LoginBar pageTitle="REVIEWS" />
      {/* Confirmation Dialog for Deleting Review */}
      <Dialog
        open={confirmDeleteReview}
        onClose={() => setConfirmDeleteReview(false)}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          Are you sure you want to delete this review?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDeleteReview(false)}>Cancel</Button>
          <Button
            onClick={() => {
              setConfirmDeleteReview(false);
              handleDeleteReview();
            }}
            color="error"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Confirmation Dialog for Deleting Comment */}
      <Dialog
        open={confirmDeleteCommentId !== null}
        onClose={() => setConfirmDeleteCommentId(null)}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          Are you sure you want to delete this comment?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDeleteCommentId(null)}>Cancel</Button>
          <Button
            onClick={() => {
              if (confirmDeleteCommentId !== null) {
                handleDeleteComment(confirmDeleteCommentId);
                setConfirmDeleteCommentId(null);
              }
            }}
            color="error"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        padding="16px"
      >
        <IconButton onClick={() => navigate(-1)}>
          <ArrowBackIcon sx={{ color: 'black' }} />
        </IconButton>
      </Box>

      {/* Review Section */}
       <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        component={Paper}
        sx={{
          backgroundColor: 'white',
          marginY: '10px',
          marginX: '20px',
          border: '3px #C3C4B8 solid',
          padding: '20px',
        }}
      >
        {isEditingReview ? (
          <>
            {/* Editable fields for review */}
            <TextField
              label="Name"
              variant="outlined"
              fullWidth
              value={editedReviewData.name || ''}
              onChange={(e) =>
                setEditedReviewData((prev) => ({
                  ...prev,
                  name: e.target.value,
                }))
              }
              sx={{ marginBottom: 2 }}
            />
            <TextField
              label="Type"
              variant="outlined"
              fullWidth
              value={editedReviewData.type || ''}
              onChange={(e) =>
                setEditedReviewData((prev) => ({
                  ...prev,
                  type: e.target.value,
                }))
              }
              sx={{ marginBottom: 2 }}
            />
            <TextField
              label="Description"
              variant="outlined"
              fullWidth
              multiline
              minRows={3}
              value={editedReviewData.description || ''}
              onChange={(e) =>
                setEditedReviewData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              sx={{ marginBottom: 2 }}
            />
            <Button
              variant="contained"
              component="label"
              fullWidth
              sx={{ mt: 2, marginBottom: 2 }}
            >
              Upload Photo
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                hidden
              />
            </Button>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleSubmitEditReview}
                sx={{ marginRight: 1 }}
              >
                Save
              </Button>
              <Button variant="outlined" onClick={handleCancelEditReview}>
                Cancel
              </Button>
            </Box>
          </>
        ) : (
          <>
            <img
              src={review.photo_url || 'https://via.placeholder.com/200'}
              alt={review.name}
              style={{ width: '200px', marginBottom: '20px' }}
            />

            {/* Average Rating */}
            <Box sx={{ display: 'flex', marginBottom: '20px' }}>
              {[...Array(5)].map((_, index) =>
                index < Math.round(review.average_rate) ? (
                  <StarIcon key={index} />
                ) : (
                  <StarBorderIcon key={index} />
                )
              )}
            </Box>

            <Typography variant="h5" gutterBottom>
              {review.name}
            </Typography>

            {/* Review Owner Info and Actions */}
            <Box
              display="flex"
              alignItems="center"
              sx={{ width: '100%', marginBottom: '10px' }}
            >
              <Typography variant="subtitle1">{review.user.username}</Typography>
              {(user?.user_id === review.feedback_owner_id ||
                user?.role === 'admin') && (
                <Box sx={{ marginLeft: 'auto' }}>
                  <IconButton size="small" onClick={handleEditReview}>
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => setConfirmDeleteReview(true)}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>
              )}
            </Box>

            <Typography variant="body1" gutterBottom>
              {review.description}
            </Typography>
          </>
        )}
      </Box>

      {/* Comments Section */}
      <Box
        component={Paper}
        sx={{
          backgroundColor: 'white',
          marginY: '10px',
          marginX: '20px',
          border: '3px #C3C4B8 solid',
          padding: '20px',
        }}
      >
        <Typography variant="h6" gutterBottom>
          Comments
        </Typography>
        {comments.length > 0 ? (
          comments.map((comment) => (
            <Box key={comment.comment_id} sx={{ marginBottom: '15px' }}>
              <Box display="flex" alignItems="center">
                <img
                  src={
                    comment.user.profile_picture_url ||
                    'https://via.placeholder.com/50'
                  }
                  alt={`${comment.user.username}'s profile`}
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    marginRight: '10px',
                  }}
                />
                <Typography variant="subtitle1" gutterBottom>
                  {comment.user.username}
                </Typography>
                {(user?.user_id === comment.user.user_id ||
                  user?.role === 'admin') && (
                  <Box sx={{ marginLeft: 'auto' }}>
                    <IconButton
                      size="small"
                      onClick={() => handleEditComment(comment)}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() =>
                        setConfirmDeleteCommentId(comment.comment_id)
                      }
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                )}
              </Box>
              {editingCommentId === comment.comment_id ? (
                <>
                  {/* Editable fields for comment */}
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      marginBottom: '5px',
                    }}
                  >
                    {[...Array(5)].map((_, index) => (
                      <IconButton
                        key={index}
                        sx={{ padding: '2px' }}
                        onClick={() => setEditedCommentRate(index + 1)}
                      >
                        {index < editedCommentRate ? (
                          <StarIcon fontSize="small" />
                        ) : (
                          <StarBorderIcon fontSize="small" />
                        )}
                      </IconButton>
                    ))}
                  </Box>
                  <TextField
                    variant="outlined"
                    fullWidth
                    multiline
                    minRows={2}
                    value={editedCommentContent}
                    onChange={(e) => setEditedCommentContent(e.target.value)}
                    sx={{ marginBottom: 1 }}
                  />
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() =>
                        handleSubmitEditComment(comment.comment_id)
                      }
                      sx={{ marginRight: 1 }}
                    >
                      Save
                    </Button>
                    <Button variant="outlined" onClick={handleCancelEditComment}>
                      Cancel
                    </Button>
                  </Box>
                </>
              ) : (
                <>
                  {/* Comment Rating */}
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      marginBottom: '5px',
                    }}
                  >
                    {[...Array(5)].map((_, index) => (
                      <IconButton key={index} disabled sx={{ padding: '2px' }}>
                        {index < comment.rate ? (
                          <StarIcon fontSize="small" />
                        ) : (
                          <StarBorderIcon fontSize="small" />
                        )}
                      </IconButton>
                    ))}
                  </Box>
                  <Typography variant="body2" gutterBottom>
                    {comment.content}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    {new Date(comment.date_created).toLocaleString()}
                  </Typography>
                </>
              )}
            </Box>
          ))
        ) : (
          <Typography variant="body2">
            No comments yet. Be the first to comment!
          </Typography>
        )}
      </Box>

      {/* Comment Input Field */}
      {!hasCommented && (
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
          <Typography variant="h6" gutterBottom>
            Rate this review
          </Typography>
          <Box sx={{ display: 'flex', marginBottom: '10px' }}>
            {[...Array(5)].map((_, index) => (
              <IconButton
                key={index}
                onClick={() => setNewCommentRate(index + 1)}
              >
                {index < newCommentRate ? <StarIcon /> : <StarBorderIcon />}
              </IconButton>
            ))}
          </Box>
          <TextField
            label="Type your comment"
            variant="outlined"
            fullWidth
            multiline
            minRows={3}
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
          />
          <Button
            variant="contained"
            color="primary"
            sx={{ marginTop: 1 }}
            onClick={handleSubmitComment}
            disabled={!newComment.trim() || newCommentRate === 0}
          >
            Submit
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default SingleReview;
