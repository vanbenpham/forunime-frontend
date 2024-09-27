import React from 'react';
import { AppBar, Toolbar, IconButton, Typography, Avatar, Box, Paper } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import ChatIcon from '@mui/icons-material/Chat';
import ForunimeTitle from '../feature/ForunimeTitle';

interface ProfileBarProps {
  username: string;
  profilePhotoUrl: string;
  pageTitle: string;
  onMenuClick: () => void;
  onChatClick: () => void;
  menuAnchorRef: React.RefObject<HTMLButtonElement>; // New prop for ref
}

const ProfileBar: React.FC<ProfileBarProps> = ({ pageTitle, username, profilePhotoUrl, onMenuClick, onChatClick, menuAnchorRef }) => {
  return (
    <AppBar 
        component={Paper}
        elevation={6}
        sx={{ 
            position: 'sticky', 
            top: 0, 
            backgroundColor: 'rgba(229, 225, 210, 0.7)',// Optional: for contrast
            zIndex: 1000, // Optional: to ensure it stays on top of other content
            borderBottom: '1px solid #ccc', // Optional: for visual separation
            width: '100%',
            justifyContent: 'center',
            color: '#222528', // Set text color
            textShadow: '1px 1px 2px rgba(0, 0, 0, 0.5)', // Add shadow
            fontFamily: 'Inter',
            fontSize: '30px',
            fontWeight: 'bold'
        }}
    >
      <Toolbar>
        {/* Menu Icon */}
        <IconButton
          edge="start"
          color="inherit"
          aria-label="menu"
          onClick={onMenuClick}
          ref={menuAnchorRef} // Attach the ref here
        >
          <MenuIcon />
        </IconButton>

        {/* Text next to menu */}
        <Typography 
            variant="h6" 
            component="div" 
            sx={{
                flexGrow: 1,
                color: 'white', // Set text color
                textShadow: '1px 1px 2px rgba(0, 0, 0, 0.5)', // Add shadow
                fontFamily: 'Irish Grover',
                fontSize: '25px'
             }}
        >
          FORUNIME
        </Typography>
        <Typography 
            variant="h6" 
            component="div" 
            sx={{
                flexGrow: 1,
                color: 'white', // Set text color
                textShadow: '1px 1px 2px rgba(0, 0, 0, 0.5)', // Add shadow
                fontFamily: 'Irish Grover',
                fontSize: '25px'
             }}
        >
          {pageTitle}
        </Typography>

        {/* Welcome message */}
        <Box sx={{ mx: 2 }}>
          <Typography variant="body1">
            Welcome, {username}
          </Typography>
        </Box>

        {/* User profile photo */}
        <Avatar alt={username} src={profilePhotoUrl} />

        {/* Chat button */}
        <IconButton color="inherit" onClick={onChatClick}>
          <ChatIcon />
        </IconButton>
      </Toolbar>
    </AppBar>
  );
};

export default ProfileBar;
