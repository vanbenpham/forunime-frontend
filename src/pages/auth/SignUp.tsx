import React, { useState } from 'react'
import { Button, TextField, Grid, Typography, Box } from '@mui/material';
import { Link } from 'react-router-dom';
import TopBar from '../../components/feature/TopBar';
import BottomBar from '../../components/feature/BottomBar';
import ForunimeTitle from '../../components/feature/ForunimeTitle';
import axios from 'axios';

interface UserPayload {
    email: string;
    username: string;
    password: string;
    profile_picture_url?: string; // Mark as optional with '?'
}


const SignUp :  React.FC = () => {
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [reEnterPassword, setReEnterPassword] = useState<string>("");
    const [username, setUsername] = useState<string>("");
    const [profileImage, setProfileImage] = useState<File | null>(null);
    const [message, setMessage] = useState<string>("");
    const [registerSuccess, setRegisterSuccess] = useState<boolean>(false);
    const cloudName = import.meta.env.VITE_CLOUD_NAME;
    const cloudUploadPreset = import.meta.env.VITE_KEY_NAME_CLOUDINARY;
    const apiUrl = import.meta.env.VITE_REACT_APP_API_URL;

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setProfileImage(e.target.files[0]);
        }
    };

    const handleSignup = async (event: React.FormEvent) => {
        event.preventDefault();
        console.log(`this is cloud name ${cloudName}`);
        try {
            let imageUrl = '';
            if (profileImage) {
                const formData = new FormData();
                formData.append('file', profileImage);
                formData.append('upload_preset', cloudUploadPreset || ''); // Replace with your Cloudinary upload preset
        
                const cloudinaryResponse = await axios.post(
                    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
                    formData
                );
                imageUrl = cloudinaryResponse.data.secure_url;
            }
        
            // Define the payload with the UserPayload type
            const payload: UserPayload = {
                email,
                username,
                password,
            };
        
            // Conditionally add profile_picture_url
            if (imageUrl) {
                payload.profile_picture_url = imageUrl;
            }
        
            const response = await axios.post(`${apiUrl}/users/register`, payload);
            setMessage(`User registered with email: ${response.data.email}`);
            setRegisterSuccess(true);
        } catch (error) {
            console.error('Error registering user:', error);
            setMessage('Registration failed. Please try again.');
            setRegisterSuccess(false);
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
                    <Box sx={{ marginBottom: 2 }}> {/* Space between sections */}
                        <Typography
                            color='white'
                        > 
                            Profile Image:
                        </Typography>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            style={{ marginBottom: '16px', color: 'white' }}
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

export default SignUp;