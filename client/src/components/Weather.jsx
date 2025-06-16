import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Box, Typography, CircularProgress } from '@mui/material';
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import CloudIcon from '@mui/icons-material/Cloud';
import AcUnitIcon from '@mui/icons-material/AcUnit'; // for cold
import GrainIcon from '@mui/icons-material/Grain'; // for rain

const getWeatherIcon = (desc) => {
  desc = desc.toLowerCase();
  if (desc.includes('sun') || desc.includes('clear')) return <WbSunnyIcon sx={{ color: '#fbc02d', fontSize: 48 }} />;
  if (desc.includes('cloud')) return <CloudIcon sx={{ color: '#90a4ae', fontSize: 48 }} />;
  if (desc.includes('rain') || desc.includes('drizzle')) return <GrainIcon sx={{ color: '#4fc3f7', fontSize: 48 }} />;
  if (desc.includes('snow') || desc.includes('cold')) return <AcUnitIcon sx={{ color: '#81d4fa', fontSize: 48 }} />;
  return <WbSunnyIcon sx={{ color: '#fbc02d', fontSize: 48 }} />;
};

const Weather = ({ city = 'Toronto' }) => {
  const [weather, setWeather] = useState(null);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const res = await axios.get(`https://wttr.in/${city}?format=j1`);
        setWeather(res.data.current_condition[0]);
      } catch (err) {
        console.error('Failed to fetch weather', err);
      }
    };
    fetchWeather();
  }, [city]);

  if (!weather) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height={100}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box
      display="flex"
      alignItems="center"
      gap={2}
      sx={{
        backgroundColor: 'rgba(255, 255, 255, 0.4)',
        backdropFilter: 'blur(10px)',
        boxShadow: '0 8px 30px rgba(0, 0, 0, 0.15)',
        borderRadius: 3,
        p: 2,
        maxWidth: 240,
        mx: 'auto',
        color: 'black',
        fontWeight: 600,
        userSelect: 'none',
      }}
    >
      {getWeatherIcon(weather.weatherDesc[0].value)}
      <Box>
        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
          {city}
        </Typography>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          {weather.temp_C}°C
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.75 }}>
          {weather.weatherDesc[0].value}
        </Typography>
      </Box>
    </Box>
  );
};

export default Weather;
