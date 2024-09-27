import { Typography } from '@mui/material'
import React from 'react'

interface ForunimeTitle {
    size: string,
};

const ForunimeTitle : React.FC<ForunimeTitle>= ({size}) => {
    return (
        <Typography 
            variant="h6" 
            component="div"
            sx={{ 
                width: '100%',
                textAlign: 'center',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white', // Set text color
                textShadow: '1px 1px 2px rgba(0, 0, 0, 0.5)', // Add shadow
                fontFamily: 'Irish Grover',
                fontSize: {size},
                fontWeight: 'bold',
                marginTop: '20px',
                flexGrow: 1,
            }}>
            FORUNIME
        </Typography>
    )
}

export default ForunimeTitle