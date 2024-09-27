import React, { useState } from 'react'
import { Button, TextField, Grid, Paper, Typography, Box } from '@mui/material';
import { Link } from 'react-router-dom';
import TopBar from '../../components/feature/TopBar';
import BottomBar from '../../components/feature/BottomBar';
import ForunimeTitle from '../../components/feature/ForunimeTitle';
import axios from 'axios';

const SignUp :  React.FC = () => {
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [reEnterPassword, setReEnterPassword] = useState<string>("");
    const [username, setUsername] = useState<string>("");
    const [message, setMessage] = useState<string>("");
    const [registerSuccess, SetRegisterSuccess] = useState<boolean>(false);

    const handleSignup = async (event: React.FormEvent) => {
        event.preventDefault();
        
        try {
            const response  = await axios.post('http://127.0.0.1:8000/users/register', {
                email,
                username,
                password,
            });
            setMessage(`User registered with email: ${response.data.email}`);
            SetRegisterSuccess(true);
        } catch (error) {
            console.error('Error registering user:', error);
            setMessage('Registration failed. Please try again.');
            SetRegisterSuccess(false);
        }
    };
    return (
        <Grid 
            container 
            component="main" 
            sx={{          // Full viewport height
                justifyContent: 'center', // Center horizontally
                alignItems: 'center',      // Center vertically
                position: 'relative',
            }}
        >
            <TopBar text='Sign Up' />
            <ForunimeTitle size='45px' />
            {registerSuccess ? 
                <Box textAlign='center'>
                    <Typography
                        marginTop={1} // Adjusted for spacing
                        color='white'
                    >
                        {message}
                    </Typography>
                    <Typography
                        component={Link}
                        to="/"
                        color='white'
                        sx={{
                            '&:hover': {
                                color: '#FF4040',
                            },
                            transition: 'color 0.3s ease',
                        }}
                    >
                        Back!
                    </Typography>
                </Box>
                :
                <>
                <Box 
                    component="form" 
                    onSubmit={handleSignup} 
                    noValidate 
                    sx={{ 
                        width: '100%',         
                        textAlign: 'center',
                        display: 'flex',       
                        flexDirection: 'column', 
                        justifyContent: 'center', 
                        alignItems: 'center',
                        marginTop: '40px'
                    }}
                >
                    <Box sx={{ marginBottom: 2 }}> {/* Space between sections */}
                        <Typography
                            color='white'
                        > 
                            Email address:
                        </Typography>
                        <TextField
                            required
                            id="email"
                            name="email"
                            autoComplete="email"
                            autoFocus
                            variant="standard"
                            InputProps={{
                                disableUnderline: false,
                            }}
                            sx={{
                                '& .MuiInputBase-root': {
                                    borderBottom: '1px solid',
                                    borderColor: 'white',
                                    color:'white',
                                },
                            }}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </Box>
                    <Box sx={{ marginBottom: 2 }}> {/* Space between sections */}
                        <Typography
                            color='white'
                        > 
                            Username:
                        </Typography>
                        <TextField
                            required
                            id="username"
                            name="username"
                            variant="standard"
                            InputProps={{
                                disableUnderline: false,
                            }}
                            sx={{
                                '& .MuiInputBase-root': {
                                    borderBottom: '1px solid',
                                    borderColor: 'white',
                                    color:'white',
                                },
                            }}
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                    </Box>
                    <Box sx={{ marginBottom: 2 }}>
                        <Typography
                            color='white'
                        > 
                            Password:
                        </Typography>
                        <TextField
                            required
                            name="password"
                            type="password"
                            id="password"
                            autoComplete="current-password"
                            variant="standard"
                            InputProps={{
                                disableUnderline: false,
                            }}
                            sx={{
                                '& .MuiInputBase-root': {
                                    borderBottom: '1px solid',
                                    borderColor: 'white',
                                },
                                color:'white',
                            }}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </Box>
                    <Box>
                        <Typography color='white'>Re-enter Password:</Typography>
                        <TextField
                            required
                            name="reEnterPassword"
                            type="password"
                            id="reEnterPassword"
                            variant="standard"
                            InputProps={{
                                disableUnderline: false,
                            }}
                            sx={{
                                '& .MuiInputBase-root': {
                                    borderBottom: '1px solid',
                                    borderColor: 'white',
                                },
                                color:'white',
                            }}
                            value={reEnterPassword}
                            onChange={(e) => setReEnterPassword(e.target.value)}
                        />
                    </Box>
                    <Button
                        type="submit"
                        variant="contained"
                        sx={{ 
                            mt: 8, 
                            mb: 2,
                            backgroundColor: 'rgba(229, 225, 210, 0.75)',
                            borderRadius: 5,
                            color: 'black',
                            fontSize: '20px'
                        }}
                    >
                        SUBMIT
                    </Button>
                    <Typography
                            color='#FF4040'
                        > 
                            {message}
                        </Typography>
                </Box>
                <Box sx={{ 
                    display: 'flex', 
                    flexDirection: 'column',
                    textAlign: 'center'
                }}>
                    <Typography
                        marginTop={5}
                        color='white'
                        sx={{
                            '&:hover': {
                                color: '#1F75FE',
                            },
                            transition: 'color 0.3s ease',
                        }}
                    >
                        Sign-in with Google
                    </Typography>
    
                    <Typography
                        component={Link}
                        to="/forgetpassword"
                        marginTop={2} // Adjusted for spacing
                        color='white'
                        sx={{
                            '&:hover': {
                                color: '#FF4040',
                            },
                            transition: 'color 0.3s ease',
                        }}
                    >
                        Forget password?
                    </Typography>
    
                    <Typography
                        component={Link}
                        to="/"
                        marginTop={7} // Adjusted for spacing
                        color='#DF4343'
                        fontSize={20}
                        sx={{
                            '&:hover': {
                                color: '#1F75FE',
                            },
                            transition: 'color 0.3s ease',
                        }}
                    >
                        Already have an account? Log in now!
                    </Typography>
                </Box>
                </>
            }
            <BottomBar />
        </Grid>
    )
}

export default SignUp