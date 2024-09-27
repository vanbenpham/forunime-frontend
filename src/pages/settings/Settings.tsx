import React, { useState } from 'react';
import { Box, Button, TextField, Collapse, Paper } from '@mui/material';
import LoginBar from '../../components/appbar/LoginBar';
import { useUser } from '../../components/context/UserContext';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';
import { USER_STORAGE_KEY } from '../../components/context/UserContext';

const Settings: React.FC = () => {
  const navigate = useNavigate();
  const { user, setUser, logout } = useUser();

  if (!user) {
    return null;
  }

  const [username, setUsername] = useState<string>(user.username);
  const [password, setPassword] = useState<string>("");
  const [repassword, setRepassword] = useState<string>("");

  const [showUpdateFields, setShowUpdateFields] = useState(false);

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
      sessionStorage.clear();  // If you use session storage elsewhere in the app
  
      // Navigate to the login page
      navigate('/login');
      
      // Optionally, refresh the page to clear any lingering state
      window.location.reload();  // Forces a reload to clear any remaining user state
    } catch (error) {
      console.error('Error during logout:', error);
      alert('There was an error while logging out. Please try again.');
    }
  };  

  const handleDeleteAccount = async () => {
    const confirmation = window.confirm("Are you sure you want to delete your account? This action cannot be undone.");
    if (!confirmation) return;
  
    try {
      console.log('Attempting to delete account...');
      
      const response = await axios.delete(`http://127.0.0.1:8000/users/${user.user_id}`, {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });
  
      if (response.status === 204) {
        alert("Account deleted successfully.");
  
        // Clear user data from context and storage
        logout();
        localStorage.removeItem(USER_STORAGE_KEY);
        localStorage.removeItem('token');
  
        // Optional: Clear other sensitive data (e.g., sessionStorage)
        sessionStorage.clear();  // If sessionStorage is used elsewhere
  
        // Navigate to login page
        navigate('/login');
  
        // Optionally refresh the page to ensure no lingering state
        window.location.reload();
      }
    } catch (error: any) {
      if (error.response) {
        // Handle specific server errors (e.g., user not found, unauthorized, etc.)
        console.error("Error response from server:", error.response.data);
        alert(`Error: ${error.response.data.detail || 'An error occurred while deleting your account.'}`);
      } else {
        // Handle other errors (e.g., network issues, server downtime, etc.)
        console.error("Delete account error:", error);
        alert("An error occurred while trying to delete your account. Please try again later.");
      }
    }
  };
  

  const handleSubmit = async () => {
    // Ensure password and confirm password match
    if (password !== repassword) {
      alert("Passwords do not match.");
      return;
    }
  
    // Ensure that either the username or password has been changed
    if (username === user.username && password.length === 0) {
      alert("No changes detected. Please update your username or password.");
      return;
    }
  
    // Prepare the request payload, only including fields that are being updated
    const formData: { username?: string; password?: string; email?: string } = {
      email: user.email, // User email remains unchanged
    };
  
    if (username !== user.username) {
      formData.username = username; // Update username if changed
    }
  
    if (password) {
      formData.password = password; // Update password if provided
    }
  
    try {
      console.log("Submitting updated user data...", formData);
  
      // Send PUT request to update the user info
      const response = await axios.put(
        `http://127.0.0.1:8000/users/${user.user_id}`,
        formData,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${user.token}`,
          },
        }
      );
  
      console.log("Response from server:", response.data); // Log the full response
  
      if (response.status === 200) {
        const data = response.data;
        const token = data.access_token || null; // Updated to handle if no token is returned
  
        if (token) {
          let decodedToken: any;
          try {
            decodedToken = jwtDecode(token);
          } catch (decodeError) {
            console.error("Error decoding token:", decodeError);
            alert("Failed to decode token. Please try again.");
            return;
          }
  
          // Update the user context with the new data (including username)
          setUser({
            email: decodedToken.email,
            user_id: decodedToken.user_id,
            username: decodedToken.username, // Updated username if changed
            profile_picture_url: decodedToken.profile_picture_url,
            date_created: decodedToken.date_created,
            token,
            exp: decodedToken.exp,
          });
  
          // Update the new token in localStorage
          localStorage.setItem('token', token);
          alert('User information updated successfully!');
        } else {
          // Token is not returned; maybe the API doesn't return a new token for updates
          alert('User information updated successfully, but no new token was provided.');
        }

        handleLogout();
      }
    } catch (error: any) {
      // Handle errors during the update
      if (error.response) {
        alert(`Update failed: ${error.response.data.detail || 'Unknown error occurred.'}`);
      } else {
        console.error('Update error', error);
        alert('An error occurred while updating your information. Please try again later.');
      }
    }
  };
  
  
  

  return (
    <Box display="flex" flexDirection="column" height="100vh">
      <LoginBar pageTitle='SETTINGS'/>
      <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center">
        <Box component={Paper} sx={{ backgroundColor: 'white', display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'center', textAlign: 'center', width: '70%', padding: 4, mt: 4 }}>
          <Button variant="contained" onClick={handleUpdateClick} sx={{ width: '25%', backgroundColor: 'rgba(229, 225, 210, 0.4)', color: 'black' }}>Update User Information</Button>

          <Collapse in={showUpdateFields}>
            <Box mt={1} width="100%" justifyContent="center" alignItems="center" textAlign="center" display='flex' flexDirection='column'>
              <TextField label="Username" variant="outlined" margin="normal" sx={{ width: '90%' }} value={username} onChange={(e) => setUsername(e.target.value)} />
              <TextField label="Password" type="password" variant="outlined" margin="normal" sx={{ width: '90%' }} value={password} onChange={(e) => setPassword(e.target.value)} />
              <TextField label="Re-enter password" type="password" variant="outlined" margin="normal" sx={{ width: '90%' }} value={repassword} onChange={(e) => setRepassword(e.target.value)} />
              <Button variant='contained' onClick={handleSubmit} fullWidth sx={{ width: '10%', marginTop: '10px' }}>Submit</Button>
            </Box>
          </Collapse>

          <Box mt={4} width="100%" display="flex" flexDirection="column" gap={2} justifyContent="center" alignItems="center">
            <Button variant="contained" onClick={handleLogout} sx={{ width: '25%', backgroundColor: 'rgba(223, 101, 92, 0.7)' }}>Log Out</Button>
            <Button variant="contained" onClick={handleDeleteAccount} sx={{ width: '25%', backgroundColor: 'rgba(223, 101, 92, 0.7)' }}>Delete Account</Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Settings;
