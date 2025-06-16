// components/DateTimeDisplay.jsx
import React, { useEffect, useState } from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';

const DateTimeDisplay = () => {
  const [hijriDate, setHijriDate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [time, setTime] = useState(new Date());

  const getHijriDate = async (lat, lon) => {
    try {
      const res = await fetch(
        `https://api.aladhan.com/v1/gToH?latitude=${lat}&longitude=${lon}&method=2`
      );
      const data = await res.json();
      if (data.code === 200) {
        setHijriDate(data.data.hijri);
      } else {
        console.error('API error:', data);
      }
    } catch (err) {
      console.error('Hijri fetch failed:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        getHijriDate(position.coords.latitude, position.coords.longitude);
      },
      () => {
        console.warn('Using fallback location: Toronto');
        getHijriDate(43.65107, -79.347015);
      }
    );
  }, []);

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const formattedTime = time.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  const gregorian = time.toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <Box
      sx={{
        textAlign: 'center',
        mt: 4,
        mb: 2,
        px: 4,
        py: 3,
        backgroundColor: 'rgba(255, 255, 255, 0.4)',
        backdropFilter: 'blur(10px)',
        boxShadow: '0 8px 30px rgba(0, 0, 0, 0.15)',
        maxWidth: 500,
        mx: 'auto',
      }}
    >
      {loading ? (
        <CircularProgress size={28} sx={{ color: '#444' }} />
      ) : (
        <>
          <Typography
            variant="h2"
            sx={{
              fontSize: { xs: '2.7rem', sm: '3.2rem' },
              fontWeight: 600,
              color: '#111827',
              mb: 1,
              letterSpacing: '-0.5px',
            }}
          >
            {formattedTime}
          </Typography>

          <Typography
            variant="h6"
            sx={{
              color: '#374151',
              fontWeight: 500,
              fontSize: '1.1rem',
            }}
          >
            {gregorian}
          </Typography>

          <Typography
            variant="body2"
            sx={{
              color: '#6B7280',
              mt: 0.5,
              fontSize: '0.95rem',
            }}
          >
            {hijriDate.weekday.en}, {hijriDate.day} {hijriDate.month.en} {hijriDate.year} AH
          </Typography>
        </>
      )}
    </Box>
  );
};

export default DateTimeDisplay;
