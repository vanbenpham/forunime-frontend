import React, { useState } from 'react'
import { Button, TextField, Grid, Paper, Typography, Box, AppBar } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import TopBar from '../../components/feature/TopBar';
import BottomBar from '../../components/feature/BottomBar';
import ForunimeTitle from '../../components/feature/ForunimeTitle';
import { useUser } from '../../components/context/UserContext';
import axios from 'axios';
import LoginBar from '../../components/appbar/LoginBar';
import { jwtDecode } from 'jwt-decode';

const Login : React.FC = () => {
    const navigate = useNavigate();

    const {user, setUser, logout} = useUser();
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    

    const handleLogin = async (event: React.FormEvent) => {
        event.preventDefault();
    
        const formData = new URLSearchParams();
        formData.append('username', email);  // OAuth2PasswordRequestForm expects 'username'
        formData.append('password', password);
    
        try {
            const response = await axios.post('http://127.0.0.1:8000/login', formData, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            });
    
            const data = response.data;
            
            // Extract token from the response
            const token = data.access_token;
    
            if (!token) {
                throw new Error("No access token received from the server.");
            }
    
            // Decode the JWT token to get user data
            let decodedToken: any;
            try {
                decodedToken = jwtDecode(token);
            } catch (decodeError) {
                console.error("Error decoding token:", decodeError);
                alert("Failed to decode token. Please try again.");
                return;
            }
    
            // Set user in context, including user_id and token
            setUser({
                email: decodedToken.email,  // Using the email from the login form, since it's not in the token
                user_id: decodedToken.user_id,  // Store user_id from the decoded token
                username: decodedToken.username,
                profile_picture_url: decodedToken.profile_picture_url,
                date_created: decodedToken.date_created,
                token,
                exp: decodedToken.exp,  // Store the expiration time of the token
            });
    
            // Store the token in localStorage if needed
            localStorage.setItem('token', token);
    
            console.log('Decoded token:', decodedToken);
            navigate(`/profile/${decodedToken.user_id}`);
        } catch (error: any) {
            if (error.response) {
                console.log('Error details:', error.response.data);
                alert(`Login failed: ${JSON.stringify(error.response.data.detail)}`);
            } else {
                console.log('Login error', error);
            }
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
            <AppBar />
            <TopBar text='Sign In' />
            <ForunimeTitle size='45px'/>
            <Box 
                component="form" 
                onSubmit={handleLogin} 
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
                <Box sx={{ marginBottom: 4 }}> {/* Space between sections */}
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
                <Box>
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
                    to="/signup"
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
                    First time? Register now!
                </Typography>
            </Box>
            <BottomBar />
        </Grid>
    )
}

export default Login
