import { Box, IconButton, TextField, Typography, Paper } from '@mui/material';
import React, { useEffect, useState } from 'react';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import LoginBar from '../../components/appbar/LoginBar';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useUser } from '../../components/context/UserContext';

// Define the type for a thread
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

  // Fetch threads from the API
  useEffect(() => {
    const fetchThreads = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error("No authentication token found");

        const response = await axios.get<Thread[]>('http://localhost:8000/threads', {
          headers: {
            Authorization: `Bearer ${token}`  // Add the Bearer token in the headers
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
    navigate(`/thread/${threadId}`);  // Navigate to SingleThread page with the threadId
  };

  if (!user) {
    return null;
  }

  return (
    <Box display="flex" flexDirection="column">
      <LoginBar pageTitle='DISCUSSION' />
      <Box display="flex" justifyContent='center' alignItems="center" padding="16px">
        <IconButton onClick={() => navigate(-1)}>
          <ArrowBackIcon
            sx={{
              color: 'white'
            }}
          />
        </IconButton>
        <TextField
          label="Search"
          variant="outlined"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{
            marginLeft: 2,
            backgroundColor: 'white',
            width: '50%'
          }}
        />
      </Box>

      <Box display='flex'
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
                cursor: 'pointer'  // Change cursor to indicate it's clickable
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
                onClick={() => handleNavigateToThread(thread.thread_id)}  // Navigate to SingleThread on click
              >
                {thread.thread_name}
              </Typography>
              <Typography variant="h6">First post</Typography>
              <Typography variant="body1">This is post</Typography>
            </Box>
          ))
        ) : (
          <Typography variant="body1" sx={{ padding: '10px' }}>No threads found</Typography>
        )}
      </Box>
    </Box>
  );
};

export default Discussion;
