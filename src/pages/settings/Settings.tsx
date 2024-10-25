// src/pages/settings/Settings.tsx

import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  TextField,
  Collapse,
  Paper,
  Typography,
} from '@mui/material';
import LoginBar from '../../components/appbar/LoginBar';
import { useUser } from '../../components/context/UserContext'; // Removed 'User' import
import axios, { AxiosResponse } from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { USER_STORAGE_KEY } from '../../components/context/UserContext';

const Settings: React.FC = () => {
  const navigate = useNavigate();
  const { user: currentUser, setUser: setCurrentUser, logout } = useUser();
  const { userId } = useParams<{ userId: string }>(); // Get userId from route parameters

  // Initialize state variables
  const [user, setUser] = useState<Record<string, any> | null>(null);
  const [username, setUsername] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [reNewPassword, setReNewPassword] = useState<string>('');
  const [currentPassword, setCurrentPassword] = useState<string>('');
  const [profileImage, setProfileImage] = useState<File | null>(null);

  const [showUpdateFields, setShowUpdateFields] = useState(false);

  const cloudName = import.meta.env.VITE_CLOUD_NAME || '';
  const cloudUploadPreset = import.meta.env.VITE_KEY_NAME_CLOUDINARY || '';

  const apiUrl = import.meta.env.VITE_REACT_APP_API_URL || '';

  // Fetch user data based on userId
  useEffect(() => {
    const fetchUserData = async () => {
      if (userId && currentUser) {
        // If userId is provided and currentUser is logged in
        if (
          parseInt(userId) !== currentUser.user_id &&
          currentUser.role !== 'admin'
        ) {
          alert('You are not authorized to access this page.');
          navigate('/'); // Redirect to home or appropriate page
          return;
        }

        try {
          const response: AxiosResponse<Record<string, any>> = await axios.get<Record<string, any>>(
            `${apiUrl}/users/${userId}`,
            {
              headers: {
                Authorization: `Bearer ${currentUser.token}`,
              },
            }
          );
          setUser(response.data);
          setUsername(response.data.username);
        } catch (error) {
          console.error('Error fetching user data:', error);
          alert('Failed to fetch user data.');
        }
      } else if (currentUser) {
        // If no userId is provided, use currentUser's data
        setUser(currentUser);
        setUsername(currentUser.username);
      } else {
        // If not logged in, redirect to login page
        navigate('/login');
      }
    };

    fetchUserData();
  }, [userId, currentUser, navigate, apiUrl]);

  // Handle case when user data is not available yet
  if (!user) {
    return (
      <Box display="flex" flexDirection="column" height="100vh">
        <LoginBar pageTitle="SETTINGS" />
        <Box
          display="flex"
          flexDirection="column"
          justifyContent="center"
          alignItems="center"
        >
          <Typography variant="h6">Loading user data...</Typography>
        </Box>
      </Box>
    );
  }

  const handleUpdateClick = () => {
    setShowUpdateFields(!showUpdateFields);
  };

  const handleLogout = () => {
    try {
      console.log('Logging out...');

      // Clear user context (set user to null)
      logout();

      // Remove user data and token from local storage
      localStorage.removeItem(USER_STORAGE_KEY);
      localStorage.removeItem('token');

      // Optional: Clear other sensitive data if necessary
      sessionStorage.clear(); // If you use session storage elsewhere in the app

      // Navigate to the login page
      navigate('/login');

      // Optionally, refresh the page to clear any lingering state
      window.location.reload(); // Forces a reload to clear any remaining user state
    } catch (error) {
      console.error('Error during logout:', error);
      alert('There was an error while logging out. Please try again.');
    }
  };

  const handleDeleteAccount = async () => {
    const confirmation = window.confirm(
      `Are you sure you want to delete ${user.username}'s account? This action cannot be undone.`
    );
    if (!confirmation) return;

    try {
      console.log('Attempting to delete account...');

      const response: AxiosResponse = await axios.delete(
        `${apiUrl}/users/${user.user_id}`,
        {
          headers: {
            Authorization: `Bearer ${currentUser!.token}`,
          },
        }
      );

      if (response.status === 204) {
        alert('Account deleted successfully.');

        if (currentUser!.user_id === user.user_id) {
          // If the current user deleted their own account
          logout();
          localStorage.removeItem(USER_STORAGE_KEY);
          localStorage.removeItem('token');
          sessionStorage.clear();
          navigate('/');
          window.location.reload();
        } else {
          // If admin deleted another user's account
          navigate('/admin-dashboard'); // Redirect to admin dashboard or appropriate page
        }
      }
    } catch (error: any) {
      if (error.response) {
        console.error('Error response from server:', error.response.data);
        alert(
          `Error: ${
            error.response.data.detail ||
            'An error occurred while deleting the account.'
          }`
        );
      } else {
        console.error('Delete account error:', error);
        alert(
          'An error occurred while trying to delete the account. Please try again later.'
        );
      }
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setProfileImage(e.target.files[0]);
    }
  };

  const handleSubmit = async () => {
    // Ensure that current password is entered
    if (!currentPassword) {
      alert('Please enter your current password to confirm changes.');
      return;
    }

    // Ensure new password and confirm password match (if new password is provided)
    if (newPassword !== reNewPassword) {
      alert('New passwords do not match.');
      return;
    }

    // Ensure that at least one field has been changed
    if (!username && !newPassword && !profileImage) {
      alert(
        'No changes detected. Please update your username, password, or profile picture.'
      );
      return;
    }

    // Prepare the request payload, only including fields that are being updated
    const updateData: {
      email?: string;
      username?: string;
      password?: string;
      current_password: string;
      profile_picture_url?: string;
    } = {
      current_password: currentPassword,
    };

    if (username && username !== user.username) {
      updateData.username = username;
    }

    if (newPassword) {
      updateData.password = newPassword;
    }

    if (profileImage) {
      // Upload to Cloudinary
      let imageUrl = '';
      try {
        const formDataImage = new FormData();
        formDataImage.append('file', profileImage);
        formDataImage.append('upload_preset', cloudUploadPreset);

        const cloudinaryResponse: AxiosResponse<{ secure_url: string }> =
          await axios.post(
            `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
            formDataImage
          );
        imageUrl = cloudinaryResponse.data.secure_url;
        updateData.profile_picture_url = imageUrl;
      } catch (imageUploadError) {
        console.error('Error uploading image:', imageUploadError);
        alert('Failed to upload image. Please try again.');
        return;
      }
    }

    try {
      console.log('Submitting updated user data...', updateData);

      // Send PUT request to update the user info
      const response: AxiosResponse<Record<string, any>> = await axios.put<
        Record<string, any>
      >(
        `${apiUrl}/users/${user.user_id}`,
        updateData,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${currentUser!.token}`,
          },
        }
      );

      console.log('Response from server:', response.data);

      if (response.status === 200) {
        // Update the user context with the new data
        if (currentUser!.user_id === user.user_id) {
          // If the current user updated their own account
          setCurrentUser((prevUser: Record<string, any> | null) => {
            if (!prevUser) return null; // Safety check

            return {
              ...prevUser,
              username: updateData.username || prevUser.username,
              profile_picture_url:
                updateData.profile_picture_url ||
                prevUser.profile_picture_url,
            };
          });
        }

        setUser(response.data); // Update the local user state with the updated data

        alert('User information updated successfully!');
      } else {
        alert('Failed to update user information.');
      }
    } catch (error: any) {
      if (error.response) {
        alert(
          `Update failed: ${
            error.response.data.detail || 'Unknown error occurred.'
          }`
        );
      } else {
        console.error('Update error', error);
        alert(
          'An error occurred while updating your information. Please try again later.'
        );
      }
    }
  };

  // Safely determine if the current user is viewing their own settings page
  const isOwnSettingsPage =
    currentUser && currentUser.user_id === user.user_id;

  return (
    <Box display="flex" flexDirection="column" height="100vh">
      <LoginBar pageTitle="SETTINGS" />
      <Box
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
      >
        <Box
          component={Paper}
          sx={{
            backgroundColor: 'white',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-start',
            alignItems: 'center',
            textAlign: 'center',
            width: '70%',
            padding: 4,
            mt: 4,
          }}
        >
          {isOwnSettingsPage ? (
            <>
              <Button
                variant="contained"
                onClick={handleUpdateClick}
                sx={{
                  width: '25%',
                  backgroundColor: 'rgba(229, 225, 210, 0.4)',
                  color: 'black',
                }}
              >
                Update User Information
              </Button>

              <Collapse in={showUpdateFields}>
                <Box
                  mt={1}
                  width="100%"
                  justifyContent="center"
                  alignItems="center"
                  textAlign="center"
                  display="flex"
                  flexDirection="column"
                >
                  <TextField
                    label="Username"
                    variant="outlined"
                    margin="normal"
                    sx={{ width: '90%' }}
                    placeholder={user.username}
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                  <TextField
                    label="New Password"
                    type="password"
                    variant="outlined"
                    margin="normal"
                    sx={{ width: '90%' }}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                  <TextField
                    label="Re-enter New Password"
                    type="password"
                    variant="outlined"
                    margin="normal"
                    sx={{ width: '90%' }}
                    value={reNewPassword}
                    onChange={(e) => setReNewPassword(e.target.value)}
                  />

                  <Box
                    sx={{
                      marginBottom: 2,
                      width: '90%',
                      textAlign: 'left',
                    }}
                  >
                    <Typography>Profile Image:</Typography>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      style={{ marginBottom: '16px', color: 'black' }}
                    />
                  </Box>

                  <TextField
                    label="Current Password"
                    type="password"
                    variant="outlined"
                    margin="normal"
                    sx={{ width: '90%' }}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                  />

                  <Button
                    variant="contained"
                    onClick={handleSubmit}
                    fullWidth
                    sx={{ width: '10%', marginTop: '10px' }}
                  >
                    Submit
                  </Button>
                </Box>
              </Collapse>

              <Box
                mt={4}
                width="100%"
                display="flex"
                flexDirection="column"
                gap={2}
                justifyContent="center"
                alignItems="center"
              >
                <Button
                  variant="contained"
                  onClick={handleLogout}
                  sx={{
                    width: '25%',
                    backgroundColor: 'rgba(223, 101, 92, 0.7)',
                  }}
                >
                  Log Out
                </Button>
                <Button
                  variant="contained"
                  onClick={handleDeleteAccount}
                  sx={{
                    width: '25%',
                    backgroundColor: 'rgba(223, 101, 92, 0.7)',
                  }}
                >
                  Delete Account
                </Button>
              </Box>
            </>
          ) : (
            // If admin is viewing another user's settings page
            <Box
              mt={4}
              width="100%"
              display="flex"
              flexDirection="column"
              gap={2}
              justifyContent="center"
              alignItems="center"
            >
              <Typography variant="h6">
                Admin Access: Manage {user.username}'s Account
              </Typography>
              <Button
                variant="contained"
                onClick={handleDeleteAccount}
                sx={{
                  width: '25%',
                  backgroundColor: 'rgba(223, 101, 92, 0.7)',
                }}
              >
                Delete Account
              </Button>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default Settings;
