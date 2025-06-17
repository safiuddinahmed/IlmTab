import React, { useEffect, useState } from "react";
import { Typography, Box, Fade } from "@mui/material";

const greetingMessages = {
  morning: [
    (name) =>
      `Assalamu Alaikum, ${name}! May your morning be filled with barakah ☀️`,
    (name) => `Good morning, ${name}! Begin your day with Bismillah 🌅`,
    (name) => `Rise and shine, ${name}! May Allah bless your day 🌞`,
    (name) => `Assalamu Alaikum, ${name}! Today is a gift from Allah 🎁`,
  ],
  afternoon: [
    (name) => `May your afternoon be filled with peace and barakah, ${name} 🌼`,
    (name) => `Hello ${name}, stay grateful and patient this afternoon ☀️`,
    (name) => `${name}, keep going — Allah is with those who persevere 🍃`,
    (name) => `Stay strong, ${name}! Every challenge brings growth 🌱`,
  ],
  evening: [
    (name) => `Good evening, ${name}! Reflect and remember Allah 🌙`,
    (name) =>
      `Good evening, ${name}! May Allah's light guide you through the night 🌠`,
    (name) => `Assalamu Alaikum, ${name}. Wind down with dhikr 🌌`,
    (name) => `Alhamdulillah for today, ${name}! Make it count 💫`,
  ],
  night: [
    (name) => `Good night, ${name}. May Allah grant you restful sleep ⭐`,
    (name) => `Sleep well, ${name}! Don’t forget your evening du'as 🌟`,
    (name) => `${name}, end your day with gratitude and tawakkul 🌙`,
    (name) => `${name}, trust Allah with tomorrow's blessings 💤`,
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

  // Calculate responsive font size and weight based on message length
  const getResponsiveTypography = (message) => {
    const messageLength = message.length;

    // Base font sizes for different screen sizes
    const baseSizes = {
      xs: 1.5, // rem
      sm: 2.0,
      md: 2.125,
    };

    // Base font weights for different message lengths
    const baseWeights = {
      short: 600, // Bold for short, impactful messages
      medium: 500, // Medium for balanced messages
      long: 400, // Light for long messages (better readability)
    };

    // More aggressive scaling to prevent line wrapping
    let sizeFactor = 1;
    let weightCategory = "medium";

    if (messageLength > 90) {
      sizeFactor = 0.55; // Much smaller for very long messages
      weightCategory = "long";
    } else if (messageLength > 75) {
      sizeFactor = 0.65; // Significantly smaller for long messages
      weightCategory = "long";
    } else if (messageLength > 60) {
      sizeFactor = 0.75; // Smaller for medium-long messages
      weightCategory = "long";
    } else if (messageLength > 45) {
      sizeFactor = 0.85; // Slightly smaller for medium messages
      weightCategory = "medium";
    } else if (messageLength > 30) {
      sizeFactor = 0.95; // Barely smaller for short-medium messages
      weightCategory = "medium";
    } else {
      // Very short messages (≤30 chars) keep full size and get bold weight
      weightCategory = "short";
    }

    return {
      fontSize: {
        xs: `${baseSizes.xs * sizeFactor}rem`,
        sm: `${baseSizes.sm * sizeFactor}rem`,
        md: `${baseSizes.md * sizeFactor}rem`,
      },
      fontWeight: baseWeights[weightCategory],
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
  const responsiveTypography = getResponsiveTypography(currentMessage);

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
            fontWeight: responsiveTypography.fontWeight,
            color: "white",
            fontFamily: "'Poppins', 'Inter', 'Segoe UI', sans-serif",
            userSelect: "none",
            lineHeight: 1.4,
            textAlign: "center",
            fontSize: responsiveTypography.fontSize,
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
