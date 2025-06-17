import React from "react";
import { Box } from "@mui/material";
import "flag-icons/css/flag-icons.min.css";

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

  return (
    <Box
      component="span"
      className={`fi fi-${countryCode.toLowerCase()}`}
      sx={{
        width: flagSize,
        height: flagSize * 0.75, // Standard flag ratio
        display: "inline-block",
        borderRadius: variant === "rounded" ? 1 : 0,
        overflow: "hidden",
        flexShrink: 0,
        backgroundSize: "cover",
        backgroundPosition: "center",
        border: "1px solid rgba(0,0,0,0.1)",
        ...sx,
      }}
      {...props}
    />
  );
};

export default Flag;
