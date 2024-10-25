import React from 'react';
import { Button, ClickAwayListener, Grow, Paper, Popper, MenuItem, MenuList, Stack } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';

interface NavBarProps {
  open: boolean;
  anchorRef: React.RefObject<HTMLButtonElement>;
  onClose: (event: Event | React.SyntheticEvent) => void;
}

const NavBar: React.FC<NavBarProps> = ({ open, anchorRef, onClose }) => {
  const navigate = useNavigate();  // Initialize useNavigate hook
  const {user} = useUser();

  const handleListKeyDown = (event: React.KeyboardEvent) => {;
    if (event.key === 'Tab') {
      event.preventDefault();
      onClose(event);
    } else if (event.key === 'Escape') {
      onClose(event);
    }
  };

  // Add navigation for each MenuItem
  const handleMenuItemClick = (path: string) => {
    onClose(new Event(''));  // Close the menu
    navigate(path);  // Navigate to the specified path
  };

  if(!user) {
    return null;
  }

  return (
    <Stack direction="row" spacing={2}>
      <div>
        <Popper open={open} anchorEl={anchorRef.current} role={undefined} placement="bottom-start" transition disablePortal>
          {({ TransitionProps, placement }) => (
            <Grow
              {...TransitionProps}
              style={{
                transformOrigin: placement === 'bottom-start' ? 'left top' : 'left bottom',
              }}
            >
              <Paper>
                <ClickAwayListener onClickAway={onClose}>
                  <MenuList autoFocusItem={open} id="composition-menu" aria-labelledby="composition-button" onKeyDown={handleListKeyDown}>
                    <MenuItem onClick={() => handleMenuItemClick(`/profile/${user.user_id}`)}>Profile</MenuItem>
                    <MenuItem onClick={() => handleMenuItemClick(`/settings/${user.user_id}`)}>Settings</MenuItem>
                    <MenuItem onClick={() => handleMenuItemClick('/reviews')}>Review</MenuItem>
                    <MenuItem onClick={() => handleMenuItemClick('/discussion')}>Discussion</MenuItem>
                    <MenuItem onClick={() => handleMenuItemClick('/chat')}>Chat</MenuItem>
                  </MenuList>
                </ClickAwayListener>
              </Paper>
            </Grow>
          )}
        </Popper>
      </div>
    </Stack>
  );
};

export default NavBar;
