// src/components/feature/Post.tsx

import React, { useState, useEffect } from 'react';
import { Box, Avatar, Typography, TextField, IconButton, Button } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import ReplyIcon from '@mui/icons-material/Reply';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import { useUser } from '../../components/context/UserContext';
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
  user: UserType;
  profile_user_id?: number;
  thread_id?: number | null; // Added thread_id field
  comments: CommentType[];
}

// Define a discriminated union for the props
type PostProps =
  | {
      isPost: true;
      post: PostType;
      comment?: undefined;
      editItem: (id: number, updatedContent: string, isPost: boolean) => void;
      deleteItem: (id: number, isPost: boolean) => void;
      onReply: (parentId: number, content: string, isPost: boolean, photo?: string) => Promise<void>;
      editingItemId: number | null;
      setEditingItemId: (id: number | null) => void;
    }
  | {
      isPost: false;
      post?: undefined;
      comment: CommentType;
      editItem: (id: number, updatedContent: string, isPost: boolean) => void;
      deleteItem: (id: number, isPost: boolean) => void;
      onReply: (parentId: number, content: string, isPost: boolean, photo?: string) => Promise<void>;
      editingItemId: number | null;
      setEditingItemId: (id: number | null) => void;
    };

const Post: React.FC<PostProps> = (props) => {
  const { isPost, editItem, deleteItem, onReply, editingItemId, setEditingItemId } = props;

  const { user: currentUser } = useUser() as { user: { user_id: number } | null };
  const currentUserId = currentUser?.user_id;

  // Cloudinary environment variables
  const cloudName = import.meta.env.VITE_CLOUD_NAME;
  const cloudUploadPreset = import.meta.env.VITE_KEY_NAME_CLOUDINARY;

  if (isPost) {
    const item = props.post;
    if (!item) return null;

    const [editedContent, setEditedContent] = useState(item.content);
    const [isReplying, setIsReplying] = useState(false);
    const [replyContent, setReplyContent] = useState('');
    const [replyImage, setReplyImage] = useState<File | null>(null); // State for reply image
    const isEditing = editingItemId === item.post_id;

    useEffect(() => {
      if (isEditing) {
        setEditedContent(item.content);
      }
    }, [isEditing, item.content]);

    const formattedDate = new Date(item.date_created).toLocaleDateString();

    const handleSave = () => {
      if (editedContent.trim()) {
        editItem(item.post_id, editedContent, true);
      } else {
        alert('Content cannot be empty');
      }
    };

    const handleReply = async () => {
      if (replyContent.trim() || replyImage) {
        let imageUrl = '';
        try {
          if (replyImage) {
            const formData = new FormData();
            formData.append('file', replyImage);
            formData.append('upload_preset', cloudUploadPreset || '');

            const cloudinaryResponse = await axios.post(
              `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
              formData
            );

            imageUrl = cloudinaryResponse.data.secure_url;
          }

          await onReply(item.post_id, replyContent, true, imageUrl || undefined); // isPost is true

          setReplyContent('');
          setReplyImage(null);
          setIsReplying(false);
        } catch (error) {
          console.error('Error uploading reply', error);
        }
      } else {
        alert('Reply content or image cannot be empty');
      }
    };

    return (
      <Box
        display="flex"
        flexDirection="column"
        mt={2}
        p={1}
        sx={{ borderBottom: '1px solid #e0e0e0' }}
      >
        <Box display="flex" alignItems="flex-start">
          {/* Profile Picture and Username */}
          <Box display="flex" flexDirection="column" alignItems="center" mr={2}>
            <Avatar
              src={item.user.profile_picture_url}
              alt={item.user.username}
              sx={{ width: 40, height: 40, mb: 1 }}
            />
            <Typography variant="caption" textAlign="center">
              {item.user.username}
            </Typography>
          </Box>

          {/* Content or Editable TextField */}
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
                  {item.content}
                </Typography>
                {item.photo && (
                  <Box mt={1}>
                    <img src={item.photo} alt="Attachment" style={{ maxWidth: '100%' }} />
                  </Box>
                )}
              </>
            )}

            <Typography variant="caption" color="text.secondary">
              {formattedDate}
            </Typography>
          </Box>

          {/* Edit / Save / Cancel / Delete / Reply Buttons */}
          <Box display="flex" alignItems="center" ml={2}>
            {isEditing ? (
              <>
                <IconButton onClick={handleSave} size="small" aria-label="Save">
                  <SaveIcon />
                </IconButton>
                <IconButton
                  onClick={() => {
                    setEditedContent(item.content);
                    setEditingItemId(null);
                  }}
                  size="small"
                  aria-label="Cancel"
                >
                  <CancelIcon />
                </IconButton>
              </>
            ) : (
              <>
                {/* Only show edit/delete buttons if the current user is the owner */}
                {currentUserId === item.user.user_id && (
                  <>
                    <IconButton
                      onClick={() => setEditingItemId(item.post_id)}
                      size="small"
                      aria-label="Edit"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      onClick={() => deleteItem(item.post_id, true)}
                      size="small"
                      aria-label="Delete"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </>
                )}
                {/* Reply Button */}
                <IconButton
                  onClick={() => setIsReplying(!isReplying)}
                  size="small"
                  aria-label="Reply"
                >
                  <ReplyIcon />
                </IconButton>
              </>
            )}
          </Box>
        </Box>

        {/* Reply Input */}
        {isReplying && (
          <Box mt={1} ml={5}>
            <TextField
              fullWidth
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              placeholder="Write a reply..."
              multiline
            />
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <IconButton color="primary" component="label">
                <AddPhotoAlternateIcon />
                <input
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) {
                      setReplyImage(e.target.files[0]);
                    }
                  }}
                />
              </IconButton>
              {replyImage && (
                <Typography variant="body2" sx={{ ml: 1 }}>
                  {replyImage.name}
                </Typography>
              )}
            </Box>
            <Box mt={1} display="flex" justifyContent="flex-end">
              <Button onClick={handleReply} variant="contained" size="small">
                Reply
              </Button>
            </Box>
          </Box>
        )}

        {/* Render Comments for Posts */}
        {isPost && item.comments && item.comments.length > 0 && (
          <Box mt={1} ml={5}>
            {item.comments
              .filter((comment) => !comment.parent_comment_id) // Only top-level comments
              .map((comment) => (
                <Post
                  key={comment.comment_id}
                  comment={comment}
                  isPost={false}
                  editItem={editItem}
                  deleteItem={deleteItem}
                  onReply={onReply}
                  editingItemId={editingItemId}
                  setEditingItemId={setEditingItemId}
                />
              ))}
          </Box>
        )}
      </Box>
    );
  } else {
    // Handling Comments and Replies
    const item = props.comment;
    if (!item) return null;

    const [editedContent, setEditedContent] = useState(item.content);
    const [isReplying, setIsReplying] = useState(false);
    const [replyContent, setReplyContent] = useState('');
    const [replyImage, setReplyImage] = useState<File | null>(null); // State for reply image
    const isEditing = editingItemId === item.comment_id;

    useEffect(() => {
      if (isEditing) {
        setEditedContent(item.content);
      }
    }, [isEditing, item.content]);

    const formattedDate = new Date(item.date_created).toLocaleDateString();

    const handleSave = () => {
      if (editedContent.trim()) {
        editItem(item.comment_id, editedContent, false);
      } else {
        alert('Content cannot be empty');
      }
    };

    const handleReply = async () => {
      if (replyContent.trim() || replyImage) {
        let imageUrl = '';
        try {
          if (replyImage) {
            const formData = new FormData();
            formData.append('file', replyImage);
            formData.append('upload_preset', cloudUploadPreset || '');

            const cloudinaryResponse = await axios.post(
              `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
              formData
            );

            imageUrl = cloudinaryResponse.data.secure_url;
          }

          await onReply(item.comment_id, replyContent, false, imageUrl || undefined); // isPost is false

          setReplyContent('');
          setReplyImage(null);
          setIsReplying(false);
        } catch (error) {
          console.error('Error uploading reply', error);
        }
      } else {
        alert('Reply content or image cannot be empty');
      }
    };

    return (
      <Box
        display="flex"
        flexDirection="column"
        mt={2}
        p={1}
        sx={{ borderBottom: '1px solid #e0e0e0' }}
      >
        <Box display="flex" alignItems="flex-start">
          {/* Profile Picture and Username */}
          <Box display="flex" flexDirection="column" alignItems="center" mr={2}>
            <Avatar
              src={item.user.profile_picture_url}
              alt={item.user.username}
              sx={{ width: 40, height: 40, mb: 1 }}
            />
            <Typography variant="caption" textAlign="center">
              {item.user.username}
            </Typography>
          </Box>

          {/* Content or Editable TextField */}
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
                  {item.content}
                </Typography>
                {item.photo && (
                  <Box mt={1}>
                    <img src={item.photo} alt="Attachment" style={{ maxWidth: '100%' }} />
                  </Box>
                )}
              </>
            )}

            <Typography variant="caption" color="text.secondary">
              {formattedDate}
            </Typography>
          </Box>

          {/* Edit / Save / Cancel / Delete / Reply Buttons */}
          <Box display="flex" alignItems="center" ml={2}>
            {isEditing ? (
              <>
                <IconButton onClick={handleSave} size="small" aria-label="Save">
                  <SaveIcon />
                </IconButton>
                <IconButton
                  onClick={() => {
                    setEditedContent(item.content);
                    setEditingItemId(null);
                  }}
                  size="small"
                  aria-label="Cancel"
                >
                  <CancelIcon />
                </IconButton>
              </>
            ) : (
              <>
                {/* Only show edit/delete buttons if the current user is the owner */}
                {currentUserId === item.user.user_id && (
                  <>
                    <IconButton
                      onClick={() => setEditingItemId(item.comment_id)}
                      size="small"
                      aria-label="Edit"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      onClick={() => deleteItem(item.comment_id, false)}
                      size="small"
                      aria-label="Delete"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </>
                )}
                <IconButton
                  onClick={() => setIsReplying(!isReplying)}
                  size="small"
                  aria-label="Reply"
                >
                  <ReplyIcon />
                </IconButton>
              </>
            )}
          </Box>
        </Box>

        {/* Reply Input */}
        {isReplying && (
          <Box mt={1} ml={5}>
            <TextField
              fullWidth
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              placeholder="Write a reply..."
              multiline
            />
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <IconButton color="primary" component="label">
                <AddPhotoAlternateIcon />
                <input
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) {
                      setReplyImage(e.target.files[0]);
                    }
                  }}
                />
              </IconButton>
              {replyImage && (
                <Typography variant="body2" sx={{ ml: 1 }}>
                  {replyImage.name}
                </Typography>
              )}
            </Box>
            <Box mt={1} display="flex" justifyContent="flex-end">
              <Button onClick={handleReply} variant="contained" size="small">
                Reply
              </Button>
            </Box>
          </Box>
        )}

        {/* Render Replies */}
        {!isPost && item.replies && item.replies.length > 0 && (
          <Box mt={1} ml={5}>
            {item.replies.map((reply) => (
              <Post
                key={reply.comment_id}
                comment={reply}
                isPost={false}
                editItem={editItem}
                deleteItem={deleteItem}
                onReply={onReply}
                editingItemId={editingItemId}
                setEditingItemId={setEditingItemId}
              />
            ))}
          </Box>
        )}
      </Box>
    );
  }
};

export default Post;
