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
            fontWeight: 700,
            color: "white",
            fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
            userSelect: "none",
            minHeight: "3rem", // Allow natural height expansion
            lineHeight: 1.3,
            textAlign: "center",
            px: 2,
            // Strong text shadow for visibility on any background
            textShadow: `
              3px 3px 6px rgba(0, 0, 0, 0.9),
              -2px -2px 4px rgba(0, 0, 0, 0.8),
              2px -2px 4px rgba(0, 0, 0, 0.8),
              -2px 2px 4px rgba(0, 0, 0, 0.8),
              0px 0px 8px rgba(0, 0, 0, 0.7)
            `,
            // Allow text to wrap naturally
            wordWrap: "break-word",
            overflowWrap: "break-word",
            hyphens: "auto",
          }}
        >
          {messages[messageIndex](name)}
        </Typography>
      </Fade>
    </Box>
  );
};

export default Greeting;
