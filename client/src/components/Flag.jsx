import React from "react";
import { Box } from "@mui/material";

// Lightweight flag component using Unicode flag emojis and country codes
const Flag = ({
  countryCode,
  size = "medium",
  variant = "rounded",
  sx = {},
  ...props
}) => {
  const sizeMap = {
    small: 16,
    medium: 20,
    large: 24,
    xlarge: 32,
  };

  const flagSize = sizeMap[size] || sizeMap.medium;

  // Convert country code to flag emoji (much lighter than SVG files)
  const getFlagEmoji = (code) => {
    if (!code || code.length !== 2) return "🏳️";

    const codePoints = code
      .toUpperCase()
      .split("")
      .map((char) => 127397 + char.charCodeAt(0));

    return String.fromCodePoint(...codePoints);
  };

  // Fallback to simple colored circles for very small sizes or unsupported flags
  const getSimpleFlag = (code) => {
    const colors = {
      gb: "#012169",
      us: "#B22234",
      fr: "#0055A4",
      es: "#AA151B",
      pk: "#01411C",
      sa: "#006C35",
      bd: "#006A4E",
      in: "#FF9933",
      id: "#FF0000",
      az: "#0092C7",
      iq: "#CE1126",
      ru: "#0039A6",
    };
    return colors[code?.toLowerCase()] || "#6B7280";
  };

  const flagEmoji = getFlagEmoji(countryCode);
  const isEmojiSupported = flagEmoji !== "🏳️";

  return (
    <Box
      component="span"
      sx={{
        width: flagSize,
        height: flagSize * 0.75,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: variant === "rounded" ? 1 : 0,
        overflow: "hidden",
        flexShrink: 0,
        border: "1px solid rgba(0,0,0,0.1)",
        fontSize: flagSize * 0.7,
        backgroundColor: isEmojiSupported
          ? "transparent"
          : getSimpleFlag(countryCode),
        ...sx,
      }}
      {...props}
    >
      {isEmojiSupported ? (
        flagEmoji
      ) : (
        <Box
          sx={{
            width: "100%",
            height: "100%",
            backgroundColor: getSimpleFlag(countryCode),
            borderRadius: "inherit",
          }}
        />
      )}
    </Box>
  );
};

export default Flag;
