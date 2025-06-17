import React, { useEffect, useState } from "react";
import { Typography, Box, Fade } from "@mui/material";

const greetingMessages = {
  morning: [
    (name) =>
      `Assalamu Alaikum, ${name}! May your morning be filled with barakah ☀️`,
    (name) => `Good morning, ${name}! Begin your day with Bismillah 🌅`,
    (name) => `Rise and shine, ${name}! May Allah bless your day 🌞`,
  ],
  afternoon: [
    (name) => `May your afternoon be filled with peace and barakah, ${name} 🌼`,
    (name) => `Hello ${name}, stay grateful and patient this afternoon ☀️`,
    (name) => `${name}, keep going — Allah is with those who persevere 🍃`,
  ],
  evening: [
    (name) => `Good evening, ${name}! Reflect and remember Allah 🌙`,
    (name) =>
      `Good evening, ${name}! May Allah's light guide you through the night 🌠`,
    (name) => `Assalamu Alaikum, ${name}. Wind down with dhikr 🌌`,
  ],
  night: [
    (name) => `Good night, ${name}. May Allah grant you restful sleep ⭐`,
    (name) => `Sleep well, ${name}! Don’t forget your evening du'as 🌟`,
    (name) => `${name}, end your day with gratitude and tawakkul 🌙`,
  ],
};

const getTimeOfDay = () => {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return "morning";
  if (hour >= 12 && hour < 17) return "afternoon";
  if (hour >= 17 && hour < 21) return "evening";
  return "night";
};

const Greeting = ({ name = "Friend" }) => {
  const [messageIndex, setMessageIndex] = useState(0);
  const [fadeIn, setFadeIn] = useState(true);
  const timeOfDay = getTimeOfDay();
  const messages = greetingMessages[timeOfDay];

  // Calculate responsive font size based on message length to prevent line wrapping
  const getResponsiveFontSize = (message) => {
    const messageLength = message.length;

    // Base font sizes for different screen sizes
    const baseSizes = {
      xs: 1.5, // rem
      sm: 2.0,
      md: 2.125,
    };

    // More aggressive scaling to prevent line wrapping
    let sizeFactor = 1;
    if (messageLength > 90) {
      sizeFactor = 0.55; // Much smaller for very long messages
    } else if (messageLength > 75) {
      sizeFactor = 0.65; // Significantly smaller for long messages
    } else if (messageLength > 60) {
      sizeFactor = 0.75; // Smaller for medium-long messages
    } else if (messageLength > 45) {
      sizeFactor = 0.85; // Slightly smaller for medium messages
    } else if (messageLength > 30) {
      sizeFactor = 0.95; // Barely smaller for short-medium messages
    }
    // Very short messages (≤30 chars) keep full size

    return {
      xs: `${baseSizes.xs * sizeFactor}rem`,
      sm: `${baseSizes.sm * sizeFactor}rem`,
      md: `${baseSizes.md * sizeFactor}rem`,
    };
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setFadeIn(false);
      setTimeout(() => {
        setMessageIndex((prev) => (prev + 1) % messages.length);
        setFadeIn(true);
      }, 500);
    }, 10000); // every 10 seconds

    return () => clearInterval(interval);
  }, [messages.length]);

  const currentMessage = messages[messageIndex](name);
  const responsiveFontSize = getResponsiveFontSize(currentMessage);

  return (
    <Box
      textAlign="center"
      mt={5} // More space above
      mb={5} // Space below
      sx={{ width: "100%", maxWidth: 1000, mx: "auto" }}
    >
      <Fade in={fadeIn} timeout={500}>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 500,
            color: "white",
            fontFamily: "'Inter', 'Segoe UI', sans-serif",
            userSelect: "none",
            lineHeight: 1.4,
            textAlign: "center",
            fontSize: responsiveFontSize,
            letterSpacing: "0.02em",
            whiteSpace: "nowrap", // Force single line
            overflow: "hidden", // Hide any overflow
            textOverflow: "ellipsis", // Add ellipsis if somehow still too long
            textShadow: "1px 1px 3px rgba(0, 0, 0, 0.5)",
            minHeight: "3.5rem", // Fixed minimum height to prevent layout shifts
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {currentMessage}
        </Typography>
      </Fade>
    </Box>
  );
};

export default Greeting;
