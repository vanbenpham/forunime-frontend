// src/pages/profile.tsx

import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import LoginBar from '../../components/appbar/LoginBar';
import {
    Card,
    CardContent,
    CardMedia,
    Typography,
    Box,
    TextField,
    Button,
    CircularProgress,
    IconButton,
} from '@mui/material';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import PostList from '../../components/feature/PostList';
import axios from 'axios';

// Define the user type
interface UserType {
    user_id: number;
    email: string;
    username: string;
    date_created: string;
    profile_picture_url: string;
}

// Define the comment type
interface CommentType {
    comment_id: number;
    content: string;
    photo?: string;
    date_created: string;
    user_id: number;
    user: UserType;
    post_id: number;
    parent_comment_id?: number;
    replies: CommentType[];
}

// Define the post type
interface PostType {
    post_id: number;
    content: string;
    photo?: string;
    date_created: string;
    user_id: number;
    user: UserType;
    profile_user_id?: number;
    thread_id?: number | null; // Added thread_id field
    comments: CommentType[];
}

const Profile: React.FC = () => {
    const { id } = useParams<{ id: string }>(); // Extract profile ID from the URL
    const visitedProfileId = parseInt(id as string, 10); // Parse `id` from params to number

    // const { user } = useUser() as { user: UserType | null };

    const [profileUser, setProfileUser] = useState<UserType | null>(null); // State for storing visited profile data
    const [loading, setLoading] = useState<boolean>(true); // State to manage loading
    const [error, setError] = useState<string | null>(null); // State to handle errors

    const [posts, setPosts] = useState<PostType[]>([]); // Initialize posts state with an empty array
    const [newPostContent, setNewPostContent] = useState(''); // State for storing the typed post
    const [postImage, setPostImage] = useState<File | null>(null); // State for storing the selected image

    // Cloudinary environment variables
    const cloudName = import.meta.env.VITE_CLOUD_NAME;
    const cloudUploadPreset = import.meta.env.VITE_KEY_NAME_CLOUDINARY;

    const apiUrl = import.meta.env.VITE_REACT_APP_API_URL;

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

                // Fetch the profile data
                const profileResponse = await axios.get(
                    `${apiUrl}/users/${visitedProfileId}`,
                    config
                );
                setProfileUser(profileResponse.data);

                // Fetch the posts for the profile user
                const postsResponse = await axios.get(
                    `${apiUrl}/posts?profile_user_id=${visitedProfileId}`,
                    config
                );
                console.log('Posts Response:', postsResponse.data);
                setPosts(postsResponse.data);

            } catch (err: any) {
                if (err.response) {
                    setError(
                        `Error: ${err.response.status} - ${err.response.data.detail || err.message}`
                    );
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

    // Handle adding a new post with an optional image
    const handleAddPost = async () => {
        if (newPostContent.trim() || postImage) {
            try {
                const token = localStorage.getItem('token');
                if (!token) throw new Error("No authentication token found");

                let imageUrl = '';

                // Upload image to Cloudinary if an image is selected
                if (postImage) {
                    const formData = new FormData();
                    formData.append('file', postImage);
                    formData.append('upload_preset', cloudUploadPreset || '');

                    const cloudinaryResponse = await axios.post(
                        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
                        formData
                    );

                    imageUrl = cloudinaryResponse.data.secure_url;
                }

                // Prepare the payload
                const payload = {
                    content: newPostContent,
                    profile_user_id: visitedProfileId, // Include the profile_user_id
                    photo: imageUrl || undefined,  // Include the photo URL if available
                    thread_id: null, // Ensure thread_id is null for profile posts
                };

                const config = {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                };

                const response = await axios.post(
                    `${apiUrl}/posts/`,
                    payload,
                    config
                );

                // Update the posts state
                const newPost = response.data;
                setPosts((prevPosts) => [newPost, ...prevPosts]);
                setNewPostContent('');
                setPostImage(null);
            } catch (err) {
                if (axios.isAxiosError(err) && err.response) {
                    console.error('Error response data:', err.response.data);
                } else {
                    console.error("Error adding post", err);
                }
            }
        }
    };

    // Function to update posts state when an item is edited
    const editItem = (id: number, updatedContent: string, isPost: boolean) => {
        if (isPost) {
            setPosts((prevPosts) =>
                prevPosts.map((post) =>
                    post.post_id === id ? { ...post, content: updatedContent } : post
                )
            );
        } else {
            // Update comments within posts
            const updateComments = (comments: CommentType[]): CommentType[] =>
                comments.map((comment) =>
                    comment.comment_id === id
                        ? { ...comment, content: updatedContent }
                        : { ...comment, replies: updateComments(comment.replies) }
                );

            setPosts((prevPosts) =>
                prevPosts.map((post) => ({
                    ...post,
                    comments: updateComments(post.comments),
                }))
            );
        }
    };

    // Function to update posts state when an item is deleted
    const deleteItem = (id: number, isPost: boolean) => {
        if (isPost) {
            setPosts((prevPosts) => prevPosts.filter((post) => post.post_id !== id));
        } else {
            // Remove comments from posts
            const removeComment = (comments: CommentType[]): CommentType[] =>
                comments
                    .filter((comment) => comment.comment_id !== id)
                    .map((comment) => ({
                        ...comment,
                        replies: removeComment(comment.replies),
                    }));

            setPosts((prevPosts) =>
                prevPosts.map((post) => ({
                    ...post,
                    comments: removeComment(post.comments),
                }))
            );
        }
    };

    // Handle replying to a comment
    const handleReply = async (
        parentId: number,
        content: string,
        isPost: boolean,
        photo?: string
    ): Promise<void> => {
        if (content.trim() || photo) {
            try {
                const token = localStorage.getItem('token');
                if (!token) throw new Error("No authentication token found");

                const config = {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                };

                let payload: any;
                let url = `${apiUrl}/comments/`;

                if (isPost) {
                    // Replying to a post: create a new top-level comment
                    payload = {
                        content: content,
                        post_id: parentId,
                        photo: photo || undefined,
                    };
                } else {
                    // Replying to a comment: create a reply
                    payload = {
                        content: content,
                        post_id: null, // We'll set this after finding the post ID
                        parent_comment_id: parentId,
                        photo: photo || undefined,
                    };

                    // Find the post_id associated with the parent comment
                    let postId: number | null = null;

                    const findPostId = (post: PostType, commentsArray: CommentType[]): boolean => {
                        for (const comment of commentsArray) {
                            if (comment.comment_id === parentId) {
                                postId = post.post_id;
                                return true;
                            } else if (comment.replies && comment.replies.length > 0) {
                                if (findPostId(post, comment.replies)) return true;
                            }
                        }
                        return false;
                    };

                    for (const post of posts) {
                        if (findPostId(post, post.comments)) break;
                    }

                    if (!postId) throw new Error("Post ID not found for the parent comment");
                    payload.post_id = postId;
                }

                const response = await axios.post(url, payload, config);
                const newComment = response.data;

                // Update the state
                if (isPost) {
                    // Add the new comment to the post's comments array
                    setPosts((prevPosts) =>
                        prevPosts.map((post) =>
                            post.post_id === parentId
                                ? { ...post, comments: [...post.comments, newComment] }
                                : post
                        )
                    );
                } else {
                    // Add the new reply to the parent comment's replies array
                    const addReplyToComments = (commentsArray: CommentType[]): CommentType[] => {
                        return commentsArray.map((comment) => {
                            if (comment.comment_id === parentId) {
                                return {
                                    ...comment,
                                    replies: [...comment.replies, newComment],
                                };
                            } else if (comment.replies && comment.replies.length > 0) {
                                return {
                                    ...comment,
                                    replies: addReplyToComments(comment.replies),
                                };
                            } else {
                                return comment;
                            }
                        });
                    };

                    setPosts((prevPosts) =>
                        prevPosts.map((post) => ({
                            ...post,
                            comments: addReplyToComments(post.comments),
                        }))
                    );
                }
            } catch (err) {
                console.error("Error adding reply", err);
            }
        } else {
            alert('Reply content or image cannot be empty');
        }
    };

    // Extract current user's ID
    // const current_user_id = user?.user_id;

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
                        image={profileUser.profile_picture_url}
                        alt={profileUser.username}
                        sx={{
                            width: '100%',
                            height: 'auto',
                            maxWidth: 150,
                            maxHeight: 150,
                            objectFit: 'cover',
                        }}
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
                    <Typography variant="h6">Posts</Typography>
                    <PostList
                        posts={posts}
                        editItem={editItem}
                        deleteItem={deleteItem}
                        onReply={handleReply}
                        visitedProfileId={visitedProfileId}
                    />
                </Box>

                <Box
                    sx={{
                        width: '70%',
                        mt: 2,
                        display: 'flex',
                        flexDirection: 'row',
                        justifyContent: 'center',
                    }}
                >
                    <TextField
                        fullWidth
                        variant="outlined"
                        placeholder="Add a post..."
                        value={newPostContent}
                        onChange={(e) => setNewPostContent(e.target.value)}
                        sx={{ mb: 2 }}
                    />
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <IconButton
                            color="primary"
                            component="label"
                        >
                            <AddPhotoAlternateIcon />
                            <input
                                type="file"
                                accept="image/*"
                                hidden
                                onChange={(e) => {
                                    if (e.target.files && e.target.files.length > 0) {
                                        setPostImage(e.target.files[0]);
                                    }
                                }}
                            />
                        </IconButton>
                        {postImage && (
                            <Typography variant="body2" sx={{ ml: 1 }}>
                                {postImage.name}
                            </Typography>
                        )}
                    </Box>
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
                        onClick={handleAddPost}
                    >
                        SEND
                    </Button>
                </Box>
            </Box>
        </Box>
    );
};

export default Profile;
