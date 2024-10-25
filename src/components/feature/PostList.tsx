// src/components/feature/PostList.tsx

import React, { useState } from 'react';
import { Box } from '@mui/material';
import Post from './Post';
import axios from 'axios';

interface UserType {
    user_id: number;
    email: string;
    username: string;
    date_created: string;
    profile_picture_url: string;
}

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

interface PostListProps {
    posts: PostType[];
    editItem: (id: number, updatedContent: string, isPost: boolean) => void;
    deleteItem: (id: number, isPost: boolean) => void;
    onReply: (parentId: number, content: string, isPost: boolean, photo?: string) => Promise<void>;
    visitedProfileId: number;
}

const PostList: React.FC<PostListProps> = ({ posts, editItem, deleteItem, onReply, visitedProfileId }) => {
    const [editingItemId, setEditingItemId] = useState<number | null>(null);
    const apiUrl = import.meta.env.VITE_REACT_APP_API_URL;
    // Handle saving the edited item
    const handleSaveItem = async (id: number, updatedContent: string, isPost: boolean) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) throw new Error("No authentication token found");

            const config = {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            };

            const payload: any = {
                content: updatedContent,
            };

            let url = '';
            if (isPost) {
                // For posts, include profile_user_id
                url = `${apiUrl}/posts/${id}`;
                payload['profile_user_id'] = visitedProfileId;
                payload['thread_id'] = null; // Ensure thread_id is null when editing profile posts
            } else {
                url = `${apiUrl}/comments/comment/${id}`;
            }

            // Send PUT request
            await axios.put(url, payload, config);

            // Update the state
            editItem(id, updatedContent, isPost);
            setEditingItemId(null);
        } catch (error) {
            console.error("Error updating item", error);
            if (axios.isAxiosError(error) && error.response) {
                console.error('Error response data:', error.response.data);
            }
        }
    };

    // Handle deleting an item
    const handleDeleteItem = async (id: number, isPost: boolean) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) throw new Error("No authentication token found");

            const config = {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            };

            let url = '';
            if (isPost) {
                url = `${apiUrl}/posts/${id}`;
            } else {
                url = `${apiUrl}/comments/comment/${id}`;
            }

            // Send DELETE request
            await axios.delete(url, config);

            // Update the state
            deleteItem(id, isPost);
        } catch (error) {
            console.error("Error deleting item", error);
            if (axios.isAxiosError(error) && error.response) {
                console.error('Error response data:', error.response.data);
            }
        }
    };

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                position: 'relative',
            }}
        >
            {posts.map((post) => (
                <Post
                    key={post.post_id}
                    post={post}
                    isPost={true}
                    editItem={handleSaveItem}
                    deleteItem={handleDeleteItem}
                    onReply={onReply}
                    editingItemId={editingItemId}
                    setEditingItemId={setEditingItemId}
                />
            ))}
        </Box>
    );
};

export default PostList;
