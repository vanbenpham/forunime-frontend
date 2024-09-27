import React, { useEffect, useState } from 'react';
import { Box, Avatar, Typography, TextField, IconButton } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';

interface UserType {
    user_id: number;
    email: string;
    username: string;
    date_created: string;
    profile_picture_url: string;
}

interface PostProps {
    post_id: number;
    content: string;
    photo?: string;
    profile_user_id?: number;  // Make this optional
    thread_id?: number;
    date_created: string;
    user: UserType;
    isEditing: boolean;
    onSave: (post_id: number, updatedContent: string, profile_user_id?: number) => void;  // Allow profile_user_id to be optional
    onCancelEdit: () => void;
    onEdit: (post_id: number, content: string, profile_user_id?: number) => void;  // Allow profile_user_id to be optional
    onDelete: (post_id: number) => void;
}


const Post: React.FC<PostProps> = ({
    post_id,
    content,
    photo,
    profile_user_id,
    thread_id,
    date_created,
    user,
    isEditing,
    onSave,
    onCancelEdit,
    onEdit,
    onDelete,
}) => {
    const [editedContent, setEditedContent] = useState(content);

    // Reset editedContent when `isEditing` or `content` changes
    useEffect(() => {
        if (isEditing) {
            setEditedContent(content);
        }
    }, [isEditing, content]);

    // Format date for better display
    const formattedDate = new Date(date_created).toLocaleDateString();

    // Handle save with basic validation
    const handleSave = () => {
        if (editedContent.trim()) {
            onSave(post_id, editedContent, profile_user_id); // Passing profile_user_id along with post_id and content
        } else {
            alert('Content cannot be empty');
        }
    };

    return (
        <Box
            display="flex"
            alignItems="flex-start"
            mt={2}
            p={1}
            sx={{ borderBottom: '1px solid #e0e0e0' }}
        >
            {/* Profile Picture and Username */}
            <Box display="flex" flexDirection="column" alignItems="center" mr={2}>
                <Avatar
                    src={user.profile_picture_url}  // Access from user object
                    alt={user.username}
                    sx={{ width: 40, height: 40, mb: 1 }}
                />
                <Typography variant="caption" textAlign="center">
                    {user.username}  {/* Access from user object */}
                </Typography>
            </Box>

            {/* Post Content or Editable TextField */}
            <Box flexGrow={1}>
                {isEditing ? (
                    <TextField
                        fullWidth
                        value={editedContent}
                        onChange={(e) => setEditedContent(e.target.value)}
                        sx={{ mb: 1 }}
                    />
                ) : (
                    <>
                        <Typography variant="body2" color="text.primary" mb={1}>
                            {content}
                        </Typography>
                        {photo && (
                            <Box mt={1}>
                                <img src={photo} alt="Post attachment" style={{ maxWidth: '100%' }} />
                            </Box>
                        )}
                    </>
                )}

                <Typography variant="caption" color="text.secondary">
                    {formattedDate}
                </Typography>
            </Box>

            {/* Edit / Save / Cancel / Delete Buttons */}
            <Box display="flex" alignItems="center" ml={2}>
                {isEditing ? (
                    <>
                        <IconButton onClick={handleSave} size="small" aria-label="Save">
                            <SaveIcon />
                        </IconButton>
                        <IconButton onClick={() => { setEditedContent(content); onCancelEdit(); }} size="small" aria-label="Cancel">
                            <CancelIcon />
                        </IconButton>
                    </>
                ) : (
                    <>
                        <IconButton onClick={() => onEdit(post_id, content, profile_user_id)} size="small" aria-label="Edit">
                            <EditIcon />
                        </IconButton>
                        <IconButton onClick={() => onDelete(post_id)} size="small" aria-label="Delete">
                            <DeleteIcon />
                        </IconButton>
                    </>
                )}
            </Box>
        </Box>
    );
};

export default Post;
