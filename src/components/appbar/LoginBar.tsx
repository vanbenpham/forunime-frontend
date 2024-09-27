import React, { useState, useRef } from 'react';
import ProfileBar from './ProfileBar';
import NavBar from './NavBar';
import { useUser } from '../context/UserContext';

interface LoginBarProps {
  pageTitle: string;
}

const LoginBar: React.FC<LoginBarProps> = ({pageTitle}) => {
  const { user } = useUser();  // Fetch the user object from context
  const [menuOpen, setMenuOpen] = useState(false);
  const menuAnchorRef = useRef<HTMLButtonElement>(null);

  // Toggles the menu open/close state
  const handleMenuToggle = () => {
    user ? console.log(user.username) : null;
    setMenuOpen((prevOpen) => !prevOpen);
  };

  // Closes the menu when clicking outside
  const handleMenuClose = (event: Event | React.SyntheticEvent) => {
    if (
      menuAnchorRef.current &&
      menuAnchorRef.current.contains(event.target as HTMLElement)
    ) {
      return;
    }
    setMenuOpen(false);
  };
  if(!user) {
    return null;
  }

  return (
    <>
      {/* Pass handleMenuToggle and the ref to ProfileBar */}
      <ProfileBar
        username={user.username}  // Passing the username securely from user context
        profilePhotoUrl={user.profile_picture_url || 'default-profile.png'}  // Default profile photo for added security
        pageTitle={pageTitle}
        onMenuClick={handleMenuToggle}
        onChatClick={() => console.log('Chat clicked')}
        menuAnchorRef={menuAnchorRef}
      />
      {/* NavBar with open state controlled by parent */}
      <NavBar
        open={menuOpen}
        anchorRef={menuAnchorRef}
        onClose={handleMenuClose}
      />
    </>
  );
};

export default LoginBar;
