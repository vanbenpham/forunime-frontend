import { Paper, Typography } from '@mui/material'
import React from 'react'

interface TopBarProps {
    text: string;
}

const TopBar : React.FC<TopBarProps> = ({text}) => {
    return (
        <Typography 
            component={Paper}
            elevation={6}
            sx={{ 
                position: 'sticky', 
                top: 0, 
                backgroundColor: 'rgba(229, 225, 210, 0.7)',// Optional: for contrast
                zIndex: 1000, // Optional: to ensure it stays on top of other content
                borderBottom: '1px solid #ccc', // Optional: for visual separation
                width: '100%',
                textAlign: 'center',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '15px',
                color: '#222528', // Set text color
                textShadow: '1px 1px 2px rgba(0, 0, 0, 0.5)', // Add shadow
                fontFamily: 'Inter',
                fontSize: '30px',
                fontWeight: 'bold'
            }}>
            {text}
        </Typography>
  )
}

export default TopBar