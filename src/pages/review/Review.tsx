import React, { useEffect, useState } from 'react';
import {
  Box,
  IconButton,
  TextField,
  Typography,
  Paper,
  Button,
  Modal,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddIcon from '@mui/icons-material/Add';
import StarIcon from '@mui/icons-material/Star'; // Added import
import StarBorderIcon from '@mui/icons-material/StarBorder'; // Added import
import LoginBar from '../../components/appbar/LoginBar';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useUser } from '../../components/context/UserContext';

// Define the User interface to match UserOut schema
interface User {
  user_id: number;
  email: string;
  username: string;
  profile_picture_url?: string;
  date_created: string;
  role: string;
}

// Define the ReviewType enum
enum ReviewType {
  MANGA = 'manga',
  ANIME = 'anime',
  NOVEL = 'novel',
}

// Update the Review interface to match ReviewOut schema
interface Review {
  review_id: number;
  name: string;
  type: ReviewType;
  description: string;
  feedback?: string;
  date_created: string;
  feedback_owner_id: number;
  photo_url?: string;
  user: User;
  review_count: number;
  average_rate: number;
}

const Review: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [search, setSearch] = useState<string>('');
  const [openModal, setOpenModal] = useState(false);
  const [newReviewName, setNewReviewName] = useState('');
  const [newReviewType, setNewReviewType] = useState<ReviewType>(ReviewType.ANIME);
  const [newReviewDescription, setNewReviewDescription] = useState('');
  const [newReviewPhoto, setNewReviewPhoto] = useState<File | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const apiUrl = import.meta.env.VITE_REACT_APP_API_URL || 'http://127.0.0.1:8000';
  const cloudName = import.meta.env.VITE_CLOUD_NAME;
  const cloudUploadPreset = import.meta.env.VITE_KEY_NAME_CLOUDINARY;

  // Handlers for modal
  const handleOpenModal = () => {
    setNewReviewName('');
    setNewReviewType(ReviewType.ANIME);
    setNewReviewDescription('');
    setNewReviewPhoto(null);
    setErrorMessage('');
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setErrorMessage('');
  };

  // Fetch reviews from the API
  useEffect(() => {
    if (!user || !user.token) {
      return;
    }
    const fetchReviews = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get<Review[]>(`${apiUrl}/reviews/`, {
          headers: {
            Authorization: `Bearer ${user?.token}`,
          },
        });
        if (response.data.length === 0) {
          setError('No reviews available yet.');
        } else {
          setReviews(response.data);
          setError('');
        }
      } catch (error) {
        console.error('Error fetching reviews:', error);
        setError('Failed to load reviews.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchReviews();
  }, [apiUrl, user]);

  // Function to handle image change
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setNewReviewPhoto(e.target.files[0]);
    }
  };

  // Function to create a new review
  const handleCreateReview = async () => {
    if (!newReviewName.trim() || !newReviewType || !newReviewDescription.trim()) {
      setErrorMessage('Please fill in all fields correctly.');
      return;
    }

    try {
      let photoUrl = '';
      if (newReviewPhoto) {
        const formData = new FormData();
        formData.append('file', newReviewPhoto);
        formData.append('upload_preset', cloudUploadPreset || '');

        const cloudinaryResponse = await axios.post(
          `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
          formData
        );
        photoUrl = cloudinaryResponse.data.secure_url;
      }

      const newReviewData = {
        name: newReviewName,
        type: newReviewType,
        description: newReviewDescription,
        feedback: null,
        photo_url: photoUrl || null,
      };
      const response = await axios.post<Review>(`${apiUrl}/reviews/`, newReviewData, {
        headers: {
          Authorization: `Bearer ${user?.token}`,
        },
      });

      // Update the reviews list with the new review
      setReviews((prevReviews) => [...prevReviews, response.data]);
      handleCloseModal();
    } catch (error) {
      console.error('Error creating review:', error);
      setErrorMessage('Failed to create review. Please try again.');
    }
  };

  // Filter reviews based on search input
  const filteredReviews = reviews.filter((review) =>
    review.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Box display="flex" flexDirection="column">
      <LoginBar pageTitle="REVIEWS" />
      <Box display="flex" justifyContent="center" alignItems="center" padding="16px">
        <IconButton onClick={() => navigate(-1)}>
          <ArrowBackIcon sx={{ color: 'white' }} />
        </IconButton>
        <TextField
          label="Search"
          variant="outlined"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ marginLeft: 2, backgroundColor: 'white', width: '50%' }}
        />
        <IconButton onClick={handleOpenModal}>
          <AddIcon sx={{ color: 'white' }} />
        </IconButton>
      </Box>

      <Box
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        component={Paper}
        sx={{
          backgroundColor: 'white',
          marginY: '10px',
          marginX: '20px',
          border: '3px #C3C4B8 solid',
        }}
      >
        {isLoading ? (
          <Typography variant="body1" sx={{ padding: '10px' }}>
            Loading...
          </Typography>
        ) : error ? (
          <Typography variant="body1" sx={{ padding: '10px', color: 'red' }}>
            {error}
          </Typography>
        ) : filteredReviews.length > 0 ? (
          filteredReviews.map((review) => (
            <Box
              key={review.review_id}
              padding="5px"
              component={Paper}
              sx={{
                backgroundColor: 'white',
                width: '99%',
                margin: '5px',
                border: '1px #C3C4B8 solid',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <Box sx={{ paddingRight: '20px' }}>
                <img
                  src={review.photo_url || 'https://via.placeholder.com/100'}
                  alt={review.name}
                  width={100}
                />
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography
                  variant="h6"
                  gutterBottom
                  onClick={() => navigate(`/review/${review.review_id}`)}
                  sx={{ cursor: 'pointer', textDecoration: 'underline' }}
                >
                  {review.name}
                </Typography>
                <Typography variant="body1">{review.description}</Typography>
                <Typography variant="body2" color="textSecondary">
                  Reviewed by: {review.user.username}
                </Typography>
              </Box>
              {/* Display average rating */}
              <Box sx={{ paddingLeft: '20px' }}>
                {[...Array(5)].map((_, index) => (
                  <IconButton key={index} disabled>
                    {index < Math.round(review.average_rate) ? (
                      <StarIcon />
                    ) : (
                      <StarBorderIcon />
                    )}
                  </IconButton>
                ))}
              </Box>
              {/* Display review count */}
              <Box sx={{ paddingLeft: '20px' }}>
                <Typography variant="h6">
                  Reviews: {review.review_count}
                </Typography>
              </Box>
            </Box>
          ))
        ) : (
          <Typography variant="body1" sx={{ padding: '10px' }}>
            No reviews found
          </Typography>
        )}
      </Box>

      {/* Modal for creating a new review */}
      <Modal
        open={openModal}
        onClose={handleCloseModal}
        aria-labelledby="create-review-modal-title"
        aria-describedby="create-review-modal-description"
      >
        <Box
          sx={{
            position: 'absolute' as 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 400,
            bgcolor: 'background.paper',
            border: '2px solid #C3C4B8',
            boxShadow: 24,
            p: 4,
          }}
        >
          <Typography id="create-review-modal-title" variant="h6" component="h2">
            Create New Review
          </Typography>
          {errorMessage && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {errorMessage}
            </Alert>
          )}
          <TextField
            label="Review Name"
            variant="outlined"
            value={newReviewName}
            onChange={(e) => setNewReviewName(e.target.value)}
            fullWidth
            sx={{ mt: 2 }}
          />
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel id="review-type-label">Review Type</InputLabel>
            <Select
              labelId="review-type-label"
              id="review-type"
              value={newReviewType}
              label="Review Type"
              onChange={(e) => setNewReviewType(e.target.value as ReviewType)}
            >
              <MenuItem value={ReviewType.ANIME}>Anime</MenuItem>
              <MenuItem value={ReviewType.MANGA}>Manga</MenuItem>
              <MenuItem value={ReviewType.NOVEL}>Novel</MenuItem>
            </Select>
          </FormControl>
          <TextField
            label="Review Description"
            variant="outlined"
            value={newReviewDescription}
            onChange={(e) => setNewReviewDescription(e.target.value)}
            fullWidth
            multiline
            minRows={3}
            sx={{ mt: 2 }}
          />
          <Button
            variant="contained"
            component="label"
            fullWidth
            sx={{ mt: 2 }}
          >
            Upload Photo
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              hidden
            />
          </Button>
          <Button
            variant="contained"
            onClick={handleCreateReview}
            sx={{ mt: 2 }}
            disabled={
              !newReviewName.trim() ||
              !newReviewType ||
              !newReviewDescription.trim()
            }
          >
            Create
          </Button>
        </Box>
      </Modal>
    </Box>
  );
};

export default Review;
