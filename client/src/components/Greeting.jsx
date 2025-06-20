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

  return (
    <Box
      textAlign="center"
      mt={5} // More space above
      mb={5} // Space below
      sx={{
        width: "100%",
        maxWidth: "min(90vw, 1000px)", // Use 90% of viewport width, max 1000px
        mx: "auto",
        px: 2, // Add padding to prevent edge touching
      }}
    >
      <Fade in={fadeIn} timeout={500}>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 600, // Semi-bold for good prominence with Poppins
            color: "white",
            fontFamily: "'Poppins', 'Inter', 'Segoe UI', sans-serif",
            userSelect: "none",
            lineHeight: 1.4,
            textAlign: "center",
            fontSize: {
              xs: "1.5rem", // Mobile
              sm: "2rem", // Tablet
              md: "2.25rem", // Desktop
            },
            letterSpacing: "0.02em",
            // Allow text to wrap naturally to prevent cut-off
            whiteSpace: "normal",
            textShadow: "3px 3px 6px rgba(0, 0, 0, 0.7)",
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
