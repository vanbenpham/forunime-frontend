import { Box, IconButton, TextField, Typography, Paper, Modal, Button, Alert } from '@mui/material';
import React, { useEffect, useState } from 'react';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import LoginBar from '../../components/appbar/LoginBar';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useUser } from '../../components/context/UserContext';

interface Thread {
  thread_id: number;
  thread_name: string;
  date_created: string;
  user_id: number;
}

const Discussion: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const [threads, setThreads] = useState<Thread[]>([]);
  const [search, setSearch] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState('');

  // State for modal and thread operations
  const [openModal, setOpenModal] = useState(false);
  const [newThreadName, setNewThreadName] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [threadToEdit, setThreadToEdit] = useState<Thread | null>(null);

  const apiUrl = import.meta.env.VITE_REACT_APP_API_URL;

  // Handlers for modal
  const handleOpenModal = () => {
    setIsEditing(false);
    setThreadToEdit(null);
    setNewThreadName('');
    setOpenModal(true);
  };

  const handleOpenEditModal = (thread: Thread) => {
    setIsEditing(true);
    setThreadToEdit(thread);
    setNewThreadName(thread.thread_name);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setNewThreadName('');
    setThreadToEdit(null);
    setIsEditing(false);
  };

  // Handler to create a new thread
  const handleCreateThread = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error("No authentication token found");

      const response = await axios.post(
        `${apiUrl}/threads`,
        {
          thread_name: newThreadName,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 201) {
        // Close modal, reset error message, and refresh threads
        handleCloseModal();
        setErrorMessage('');
        // Fetch the updated list of threads
        const updatedThreads = await axios.get<Thread[]>(`${apiUrl}/threads`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (Array.isArray(updatedThreads.data)) {
          setThreads(updatedThreads.data);
        } else {
          console.error('Unexpected response format:', updatedThreads.data);
        }
      } else {
        console.error('Failed to create thread:', response.data);
      }
    } catch (error: any) {
      console.error('Error creating thread:', error);
      if (axios.isAxiosError(error)) {
        if (error.response && error.response.status === 400) {
          // Display the error message from the backend
          setErrorMessage(error.response.data.detail);
        } else {
          setErrorMessage('An unexpected error occurred. Please try again.');
        }
      }
    }
  };

  // Handler to update a thread
  const handleUpdateThread = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error("No authentication token found");
      if (!threadToEdit) throw new Error("No thread selected for editing");

      const response = await axios.put(
        `${apiUrl}/threads/${threadToEdit.thread_id}`,
        {
          thread_name: newThreadName,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        // Update the thread in the state
        setThreads(threads.map(thread => thread.thread_id === threadToEdit.thread_id ? response.data : thread));
        handleCloseModal();
        setErrorMessage('');
      } else {
        console.error('Failed to update thread:', response.data);
      }
    } catch (error: any) {
      console.error('Error updating thread:', error);
      if (axios.isAxiosError(error)) {
        if (error.response && error.response.status === 400) {
          setErrorMessage(error.response.data.detail);
        } else {
          setErrorMessage('An unexpected error occurred. Please try again.');
        }
      }
    }
  };

  // Handler to delete a thread
  const handleDeleteThread = async (threadId: number) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error("No authentication token found");

      const response = await axios.delete(`${apiUrl}/threads/${threadId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 204) {
        // Remove the deleted thread from the state
        setThreads(threads.filter(thread => thread.thread_id !== threadId));
      } else {
        console.error('Failed to delete thread:', response.data);
      }
    } catch (error: any) {
      console.error('Error deleting thread:', error);
      if (axios.isAxiosError(error)) {
        if (error.response && error.response.status === 403) {
          setErrorMessage("You are not authorized to delete this thread.");
        } else {
          setErrorMessage('An unexpected error occurred. Please try again.');
        }
      }
    }
  };

  // Fetch threads from the API
  useEffect(() => {
    if (!user || !user.token) {
      return;
    }
    const fetchThreads = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error("No authentication token found");

        const response = await axios.get<Thread[]>(`${apiUrl}/threads`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (Array.isArray(response.data)) {
          setThreads(response.data);
        } else {
          console.error('Unexpected response format:', response.data);
        }
      } catch (error) {
        console.error("Error fetching threads:", error);
      }
    };

    fetchThreads();
  }, [user, navigate]);

  // Filter threads based on search input
  const filteredThreads = threads.filter(thread =>
    thread.thread_name.toLowerCase().includes(search.toLowerCase())
  );

  // Handle navigation to the SingleThread page
  const handleNavigateToThread = (threadId: number) => {
    navigate(`/thread/${threadId}`);
  };

  if (!user) {
    return null;
  }

  return (
    <Box display="flex" flexDirection="column">
      <LoginBar pageTitle='DISCUSSION' />
      <Box display="flex" justifyContent='center' alignItems="center" padding="16px">
        <IconButton onClick={() => navigate(-1)}>
          <ArrowBackIcon sx={{ color: 'white' }} />
        </IconButton>
        <TextField
          label="Search"
          variant="outlined"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ marginLeft: 2, backgroundColor: 'white', width: '50%' }}
        />
        {user.role === "admin" && (
          <IconButton onClick={handleOpenModal}>
            <AddIcon sx={{ color: 'white' }} />
          </IconButton>
        )}
      </Box>

      <Box
        display='flex'
        flexDirection='column'
        justifyContent='center'
        alignItems='center'
        component={Paper}
        sx={{
          backgroundColor: 'white',
          marginY: '10px',
          marginX: '20px',
          border: '3px #C3C4B8 solid'
        }}
      >
        {filteredThreads.length > 0 ? (
          filteredThreads.map((thread) => (
            <Box
              key={thread.thread_id}
              padding="5px"
              component={Paper}
              sx={{
                backgroundColor: 'white',
                width: '99%',
                margin: '5px',
                border: '1px #C3C4B8 solid',
                position: 'relative',
                cursor: 'pointer'
              }}
            >
              <Typography
                variant="h5"
                gutterBottom
                sx={{
                  backgroundColor: '#DDDED4',
                  padding: '5px',
                  borderBottom: '1px solid #C3C4B8',
                  width: '100%'
                }}
                onClick={() => handleNavigateToThread(thread.thread_id)}
              >
                {thread.thread_name}
              </Typography>

              {user.role === "admin" && (
                <Box
                  display="flex"
                  sx={{
                    position: 'absolute',
                    top: 10,
                    right: 10,
                  }}
                >
                  <IconButton onClick={() => handleOpenEditModal(thread)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleDeleteThread(thread.thread_id)}>
                    <DeleteIcon />
                  </IconButton>
                </Box>
              )}

              <Typography variant="h6">First post</Typography>
              <Typography variant="body1">This is post</Typography>
            </Box>
          ))
        ) : (
          <Typography variant="body1" sx={{ padding: '10px' }}>No threads found</Typography>
        )}
      </Box>

      {/* Modal for creating or editing a thread */}
      <Modal
        open={openModal}
        onClose={handleCloseModal}
        aria-labelledby="create-thread-modal-title"
        aria-describedby="create-thread-modal-description"
      >
        <Box
          sx={{
            position: 'absolute' as 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 400,
            bgcolor: 'background.paper',
            border: '2px solid #000',
            boxShadow: 24,
            p: 4,
          }}
        >
          <Typography id="create-thread-modal-title" variant="h6" component="h2">
            {isEditing ? 'Edit Thread' : 'Create New Thread'}
          </Typography>
          {errorMessage && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {errorMessage}
            </Alert>
          )}
          <TextField
            label="Thread Name"
            variant="outlined"
            value={newThreadName}
            onChange={(e) => setNewThreadName(e.target.value)}
            fullWidth
            sx={{ mt: 2 }}
          />
          <Button
            variant="contained"
            onClick={isEditing ? handleUpdateThread : handleCreateThread}
            sx={{ mt: 2 }}
            disabled={!newThreadName.trim()}
          >
            {isEditing ? 'Update' : 'Create'}
          </Button>
        </Box>
      </Modal>
    </Box>
  );
};

export default Discussion;
