// components/Clock.jsx
import React, { useEffect, useState } from 'react';
import { Typography, Box } from '@mui/material';

const Clock = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const intervalId = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(intervalId);
  }, []);

  const formatTime = (date) => {
    return date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true, // Change to false for 24-hour
    });
  };

  return (
    <Box
      sx={{
        textAlign: 'center',
        mt: 4,
        mb: 2,
      }}
    >
      <Typography
        variant="h2"
        sx={{
          color: '#ffffff',
          fontWeight: 700,
          letterSpacing: '0.05em',
          textShadow: '0 2px 6px rgba(0,0,0,0.5)',
          fontSize: { xs: '2.5rem', sm: '3.5rem', md: '4rem' },
          transition: 'all 0.3s ease',
        }}
      >
        {formatTime(time)}
      </Typography>
    </Box>
  );
};

export default Clock;
