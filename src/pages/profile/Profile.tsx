import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import LoginBar from '../../components/appbar/LoginBar';
import { Card, CardContent, CardMedia, Typography, Box, TextField, Button, CircularProgress } from '@mui/material';
import { useUser } from '../../components/context/UserContext';
import PostList from '../../components/feature/PostList';
import axios from 'axios';

// Define the user type for the profile being visited
interface ProfileUser {
    profile_picture_url: string;
    email: string;
    date_created: string;
    username: string;
}

// Define the user type for the user of a comment/post
interface UserType {
    user_id: number;
    email: string;
    username: string;
    date_created: string;
    profile_picture_url: string;
}

// Define the types for posts/comments
interface Comment {
    post_id: number;
    content: string;
    photo?: string;
    profile_user_id?: number; // Make this optional
    thread_id: number;
    date_created: string;
    user: UserType;
}

// Updated Profile component
const Profile: React.FC = () => {
    const { id } = useParams<{ id: string }>(); // Extract profile ID from the URL
    const visitedProfileId = parseInt(id as string, 10); // Parse `id` from params to number
    
    const { user } = useUser() as { user: { username: string } | null };

    const [profileUser, setProfileUser] = useState<ProfileUser | null>(null); // State for storing visited profile data
    const [loading, setLoading] = useState<boolean>(true); // State to manage loading
    const [error, setError] = useState<string | null>(null); // State to handle errors

    const [comments, setComments] = useState<Comment[]>([]); // Initialize comments state with an empty array
    const [newComment, setNewComment] = useState(''); // State for storing the typed comment

    // Fetch the profile data of the visited user
    useEffect(() => {
        const fetchProfileAndPosts = async () => {
            try {
                setLoading(true);
        
                const token = localStorage.getItem('token');
                if (!token) {
                    throw new Error("No authentication token found");
                }
        
                const config = {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                };
        
                const profileResponse = await axios.get(`http://127.0.0.1:8000/users/${visitedProfileId}`, config);
                setProfileUser(profileResponse.data);
        
                const postsResponse = await axios.get(`http://127.0.0.1:8000/posts?profile_user_id=${visitedProfileId || ''}`, config);
                setComments(postsResponse.data);
        
            } catch (err: any) {
                if (err.response) {
                    setError(`Error: ${err.response.status} - ${err.response.data.detail || err.message}`);
                } else if (err.request) {
                    setError('No response from server. Check if the backend is running.');
                } else {
                    setError('An unexpected error occurred.');
                }
            } finally {
                setLoading(false);
            }
        };
        
    
        if (visitedProfileId) {
            fetchProfileAndPosts();
        }
    }, [visitedProfileId]);
    
    // Handle adding a new comment
    const handleAddComment = async () => {
        if (newComment.trim()) {
            try {
                const token = localStorage.getItem('token');
                if (!token) throw new Error("No authentication token found");
    
                const config = {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                };
    
                // Send a JSON payload with optional profile_user_id
                const response = await axios.post(
                    "http://127.0.0.1:8000/posts",
                    {
                        content: newComment,
                        profile_user_id: visitedProfileId || undefined, // Handle optional profile_user_id
                    },
                    config
                );
    
                // Add the new comment to the state after successful submission
                const newPostedComment: Comment = response.data;
                setComments((prevComments) => [...prevComments, newPostedComment]);
                setNewComment(''); // Clear input after submission
            } catch (err) {
                if (axios.isAxiosError(err) && err.response) {
                    console.error('Error response data:', err.response.data);
                } else {
                    console.error("Error adding comment", err);
                }
            }
        }
    };
    
    

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
                <Typography variant="h6" color="error">
                    {error}
                </Typography>
            </Box>
        );
    }

    if (!profileUser) {
        return null; // Don't render anything if profile data is missing
    }

    return (
        <Box display="flex" flexDirection="column">
            <LoginBar pageTitle="PROFILE" />
            <Box
                sx={{
                    backgroundColor: 'white',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'flex-start',
                    alignItems: 'center',
                }}
            >
                <Card sx={{ maxWidth: 345, mt: 2 }}>
                    <CardMedia
                        component="img"
                        height="140"
                        image={profileUser.profile_picture_url}
                        alt={profileUser.username}
                    />
                    <CardContent>
                        <Box display="flex" flexDirection="column" alignItems="center">
                            <Typography variant="h6" component="div">
                                {profileUser.username}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Joined: {new Date(profileUser.date_created).toLocaleDateString()}
                            </Typography>
                        </Box>
                    </CardContent>
                </Card>

                <Box sx={{ width: '70%', mt: 4 }}>
                    <Typography variant="h6">Comments</Typography>
                    <PostList
                        comments={comments}
                        editComment={(id, updatedContent, profile_user_id) => {
                            setComments((prevComments) =>
                                prevComments.map((comment) =>
                                    comment.post_id === id
                                        ? { ...comment, content: updatedContent, profile_user_id: profile_user_id || comment.profile_user_id }
                                        : comment
                                )
                            );
                        }}
                        deleteComment={(id) => {
                            setComments((prevComments) => prevComments.filter((comment) => comment.post_id !== id));
                        }}
                    />

                </Box>

                <Box 
                    sx={{ 
                        width: '70%', 
                        mt: 2, 
                        display: 'flex', 
                        flexDirection: 'row',
                        justifyContent:'center',
                    }}
                >
                    <TextField
                        fullWidth
                        variant="outlined"
                        placeholder="Add a comment..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        sx={{ mb: 2 }}
                    />
                    <Button 
                        sx={{ 
                            marginLeft: 2,
                            color: 'grey',
                            border: '1px solid #DDDED',
                            backgroundColor: '#C3C4B8',
                            padding: '1px 4px',    
                            height: '55px',          
                            fontSize: '0.75rem',     
                        }} 
                        onClick={handleAddComment}
                    >
                    SEND
                    </Button>
                </Box>
            </Box>
        </Box>
    );
};

export default Profile;
