import React from 'react';
import { Box, LinearProgress, Typography } from '@mui/material';

const UploadProgress = ({ progress }) => {
    return (
        <Box sx={{ mt: 2 }}>
            <LinearProgress variant="determinate" value={progress} />
            <Typography variant="body2" color="textSecondary" align="center" sx={{ mt: 1 }}>
                {`${Math.round(progress)}%`}
            </Typography>
        </Box>
    );
};

export default UploadProgress;