import React, { useState } from 'react';
import { Box, IconButton } from '@mui/material';
import Post from './Post';
import axios from 'axios';

// Define the UserType based on the structure you provided
interface UserType {
    user_id: number;
    email: string;
    username: string;
    date_created: string;
    profile_picture_url: string;
}

// Define the CommentType based on the structure you provided
interface CommentType {
    content: string;
    photo?: string; // Optional based on your schema
    profile_user_id?: number; // Make this optional
    thread_id?: number;
    post_id: number;
    date_created: string;
    user: UserType; // Reference the user object type
}

// PostListProps now uses the updated CommentType
interface PostListProps {
    comments: CommentType[];
    editComment: (id: number, updatedContent: string, profile_user_id?: number) => void; // Make profile_user_id optional
    deleteComment: (id: number) => void;
}


const PostList: React.FC<PostListProps> = ({ comments, editComment, deleteComment }) => {
    const [editingCommentId, setEditingCommentId] = useState<number | null>(null); // Track the comment being edited
    const [editedContent, setEditedContent] = useState<string>(''); // Store the edited content
    const [currentPage, setCurrentPage] = useState(1); // State to track the current page
    const commentsPerPage = 5; // Number of comments per page

    // Handle saving the edited comment
    const handleSaveComment = async (id: number, updatedContent: string, profile_user_id?: number) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) throw new Error("No authentication token found");
    
            const config = {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            };
    
            // Send PUT request to update the comment
            await axios.put(`http://127.0.0.1:8000/posts/${id}`, 
                { content: updatedContent, profile_user_id },  // Include profile_user_id in the request
                config
            );
    
            // Update the comment in the state after successful update
            editComment(id, updatedContent, profile_user_id);
            setEditingCommentId(null); // Stop editing mode
        } catch (error) {
            console.error("Error updating comment", error);
            if (axios.isAxiosError(error) && error.response) {
                console.error('Error response data:', error.response.data);
            }
        }
    };
    

    // Handle editing a comment
    const handleEditComment = (id: number, content: string) => {
        setEditingCommentId(id); // Enable editing mode for the selected comment
        setEditedContent(content); // Set the initial content for editing
    };

    // Handle canceling edit mode
    const handleCancelEdit = () => {
        setEditingCommentId(null);
        setEditedContent(''); // Clear edited content when canceled
    };

    // Handle deleting a comment
    const handleDeleteComment = async (id: number) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) throw new Error("No authentication token found");

            const config = {
                headers: {
                    Authorization: `Bearer ${token}`, // Pass the token in the Authorization header
                },
            };

            // Send DELETE request using axios
            await axios.delete(`http://127.0.0.1:8000/posts/${id}`, config);

            // Call the deleteComment function to remove the comment from the local state
            deleteComment(id);

        } catch (error) {
            console.error("Error deleting comment", error);
            if (axios.isAxiosError(error) && error.response) {
                console.error('Error response data:', error.response.data);
            }
        }
    };

    // Calculate the current comments to display based on the current page
    const indexOfLastComment = currentPage * commentsPerPage;
    const indexOfFirstComment = indexOfLastComment - commentsPerPage;
    const currentComments = comments.slice(indexOfFirstComment, indexOfLastComment);

    // Calculate total number of pages
    const totalPages = Math.ceil(comments.length / commentsPerPage);

    // Handle page changes
    const handlePageClick = (pageNumber: number) => {
        setCurrentPage(pageNumber);
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
            {/* Paginated comment list */}
            <Box
                sx={{
                    flexGrow: 1,
                    overflowY: 'auto',
                    padding: 2,
                }}
            >
                {currentComments.map((comment) => (
                    <Post
                        key={comment.post_id}
                        post_id={comment.post_id}
                        profile_user_id={comment.profile_user_id} // Pass profile_user_id to Post component (can be undefined)
                        user={comment.user}
                        content={comment.content}
                        photo={comment.photo} // Pass photo if available
                        date_created={comment.date_created}
                        isEditing={editingCommentId === comment.post_id}  // Check if this post is being edited
                        onSave={(post_id, updatedContent) => handleSaveComment(post_id, updatedContent, comment.profile_user_id)}
                        onCancelEdit={handleCancelEdit}
                        onEdit={handleEditComment}
                        onDelete={handleDeleteComment}
                    />
                ))}
            </Box>

            {/* Pagination controls */}
            {totalPages > 1 && (
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        marginTop: 2,
                    }}
                >
                    {/* Display the page numbers */}
                    {Array.from({ length: totalPages }, (_, index) => (
                        <IconButton
                            key={index + 1}
                            onClick={() => handlePageClick(index + 1)}
                            disabled={currentPage === index + 1}
                            sx={{
                                margin: '0 5px',
                                backgroundColor: currentPage === index + 1 ? '#1976d2' : 'transparent',
                                color: currentPage === index + 1 ? '#fff' : '#000',
                                '&:hover': {
                                    backgroundColor: '#1976d2',
                                    color: '#fff',
                                },
                            }}
                            aria-label={`Page ${index + 1}`}
                        >
                            {index + 1}
                        </IconButton>
                    ))}
                </Box>
            )}
        </Box>
    );
};

export default PostList;
