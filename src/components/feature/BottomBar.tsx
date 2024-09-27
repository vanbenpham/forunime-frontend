import { Paper, Typography } from '@mui/material'
import React from 'react'

const BottomBar = () => {
    return (
        <Typography 
            component={Paper}
            elevation={6}
            sx={{ 
                position: 'sticky', 
                bottom: 0, // Use bottom instead of top
                backgroundColor: 'rgba(229, 225, 210, 0.7)', // Optional: for contrast
                zIndex: 1000, // Optional: to ensure it stays on top of other content
                borderTop: '1px solid #ccc', // Optional: for visual separation
                width: '100%',
                textAlign: 'center',
                padding: '10px',
                color: '#222528', // Set text color
                textShadow: '1px 1px 2px rgba(0, 0, 0, 0.5)', // Add shadow
                fontFamily: 'Inter',
                fontSize: '15px',
                fontWeight: 'bold',
                marginTop: '20px'
            }}
        >
            Ben - Mohawk College
        </Typography>
    )
}

export default BottomBar