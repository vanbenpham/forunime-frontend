import { Box, IconButton, TextField, Button, Paper } from '@mui/material';
import React, { useEffect, useState } from 'react';
import LoginBar from '../../components/appbar/LoginBar';
import { ArrowBack } from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { useUser } from '../../components/context/UserContext';
import PostList from '../../components/feature/PostList';

interface UserType {
    user_id: number;
    email: string;
    username: string;
    date_created: string;
    profile_picture_url: string;
}

interface Thread {
  thread_id: number;
  thread_name: string;
  date_created: string;
  user_id: number;
}

interface Post {
  post_id: number;
  content: string;
  photo?: string;
  profile_user_id?: number;
  thread_id?: number;  // Optional thread_id
  date_created: string;
  user: UserType;
}

const SingleThread: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useUser();  // Use hooks at the top level
    const { id } = useParams<{ id: string }>();  // Use hooks at the top level
    const threadId = parseInt(id as string, 10);

    const [search, setSearch] = useState<string>('');  // Define state for search
    const [thread, setThread] = useState<Thread | null>(null);  // Define state for thread details
    const [posts, setPosts] = useState<Post[]>([]);  // Store posts separately
    const [newPostContent, setNewPostContent] = useState<string>('');  // State for the new post content

    // Fetch thread details from the API using threadId
    useEffect(() => {
        const fetchThread = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) throw new Error("No authentication token found");

                const response = await axios.get<Thread>(`http://localhost:8000/threads/${threadId}`, {
                  headers: {
                    Authorization: `Bearer ${token}`  // Add the Bearer token in the headers
                  }
                });
                setThread(response.data);
            } catch (error) {
                console.error("Error fetching thread:", error);
            }
        };

        const fetchPosts = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) throw new Error("No authentication token found");

                const response = await axios.get(`http://localhost:8000/posts?thread_id=${threadId}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                setPosts(response.data);
            } catch (error) {
                console.error("Error fetching posts:", error);
            }
        };

        if (user && threadId) {
            fetchThread();
            fetchPosts();  // Fetch posts separately
        }
    }, [user, threadId, navigate]);

    // Handle post edit
    const handleEditPost = (post_id: number, updatedContent: string, profile_user_id?: number) => {
        setPosts(prevPosts =>
            prevPosts.map(post =>
                post.post_id === post_id
                    ? { ...post, content: updatedContent, profile_user_id }
                    : post
            )
        );
    };

    const handleDeletePost = (post_id: number) => {
        setPosts(prevPosts => prevPosts.filter(post => post.post_id !== post_id));
    };

    // Handle creating a new post
    const handleCreatePost = async () => {
        if (!newPostContent.trim()) return;  // Don't allow empty posts

        try {
            const token = localStorage.getItem('token');
            if (!token) throw new Error("No authentication token found");

            const response = await axios.post<Post>(
                'http://localhost:8000/posts',
                {
                    content: newPostContent,
                    thread_id: threadId,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            // Add the new post to the post list
            setPosts(prevPosts => [...prevPosts, response.data]);
            setNewPostContent('');  // Clear the input field after posting
        } catch (error) {
            console.error("Error creating post:", error);
        }
    };

    // If no user, don't render the content and navigate to login
    if (!user) {
        return null;
    }

    return (
        <Box display="flex" flexDirection="column">
            <LoginBar pageTitle={thread ? thread.thread_name.toUpperCase() : "DISCUSSION"} />
            <Box display="flex" justifyContent="center" alignItems="center" padding="16px">
                <IconButton onClick={() => navigate(-1)}>
                    <ArrowBack
                        sx={{
                            color: 'white',
                        }}
                    />
                </IconButton>
                <TextField
                    label="Search"
                    variant="outlined"
                    value={search}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
                    sx={{
                        marginLeft: 2,
                        backgroundColor: 'white',
                        width: '50%',
                    }}
                />
            </Box>
            <Box
                component={Paper}
                sx={{
                    backgroundColor: 'white',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'flex-start',
                    alignItems: 'center',
                    margin: '5px'
                }}
            >
                {/* Render PostList and pass comments (posts), edit, and delete handlers */}
                <Box padding="16px">
                    <PostList
                        comments={posts}  // Pass the fetched posts as comments
                        editComment={handleEditPost}  // Pass the edit handler
                        deleteComment={handleDeletePost}  // Pass the delete handler
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
                        label="Create a Post"
                        variant="outlined"
                        fullWidth
                        value={newPostContent}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewPostContent(e.target.value)}
                        sx={{
                            mb: 2,
                            backgroundColor: 'white'
                        }}
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
                        onClick={handleCreatePost}
                    >
                        SEND
                    </Button>
                </Box>
            </Box>
        </Box>
    );
};

export default SingleThread;
