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
        console.error('Error from API:', data);
      }
    } catch (err) {
      console.error('Hijri date fetch failed:', err);
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
        console.warn('Geolocation denied, falling back to Toronto');
        getHijriDate(43.65107, -79.347015); // Toronto fallback
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
        p: 2,
        backgroundColor: 'rgba(255,255,255,0.7)',
        backdropFilter: 'blur(8px)',
        borderRadius: 3,
        maxWidth: 600,
        mx: 'auto',
      }}
    >
      {loading ? (
        <CircularProgress size={24} />
      ) : (
        <>
          <Typography
            variant="h2"
            sx={{
              fontWeight: 700,
              fontSize: { xs: '2.5rem', sm: '3rem' },
              color: '#111827',
              mb: 1,
              textShadow: '0 1px 4px rgba(0,0,0,0.2)',
            }}
          >
            {formattedTime}
          </Typography>

          <Typography
            variant="h6"
            sx={{ fontWeight: 'bold', color: '#1f2937' }}
          >
            {gregorian}
          </Typography>

          <Typography
            variant="body1"
            sx={{ color: 'text.secondary', mt: 0.5 }}
          >
            {hijriDate.weekday.en}, {hijriDate.day} {hijriDate.month.en} {hijriDate.year} AH
          </Typography>
        </>
      )}
    </Box>
  );
};

export default DateTimeDisplay;
