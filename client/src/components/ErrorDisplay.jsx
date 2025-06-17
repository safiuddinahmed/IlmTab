import React from "react";
import {
  Alert,
  AlertTitle,
  Box,
  Button,
  Typography,
  IconButton,
  Collapse,
  Chip,
} from "@mui/material";
import {
  Refresh as RefreshIcon,
  Close as CloseIcon,
  WifiOff as WifiOffIcon,
  CloudOff as CloudOffIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
} from "@mui/icons-material";

const ErrorDisplay = ({
  error,
  onRetry,
  onDismiss,
  retryCount = 0,
  maxRetries = 3,
  isRetrying = false,
  showDetails = false,
}) => {
  const [expanded, setExpanded] = React.useState(false);

  if (!error) return null;

  // Determine error type and appropriate messaging
  const getErrorInfo = (error) => {
    const errorMessage = error?.message || error || "Unknown error";
    const lowerMessage = errorMessage.toLowerCase();

    if (lowerMessage.includes("network") || lowerMessage.includes("fetch")) {
      return {
        type: "network",
        severity: "warning",
        icon: <WifiOffIcon />,
        title: "Connection Issue",
        message:
          "Unable to connect to the server. Please check your internet connection.",
        action: "Retry Connection",
        canRetry: true,
      };
    }

    if (lowerMessage.includes("server") || lowerMessage.includes("500")) {
      return {
        type: "server",
        severity: "error",
        icon: <CloudOffIcon />,
        title: "Server Error",
        message:
          "The server is temporarily unavailable. Please try again in a moment.",
        action: "Try Again",
        canRetry: true,
      };
    }

    if (lowerMessage.includes("ayah") || lowerMessage.includes("hadith")) {
      return {
        type: "content",
        severity: "info",
        icon: <InfoIcon />,
        title: "Content Loading Issue",
        message: "Unable to load Islamic content. Trying to reconnect...",
        action: "Reload Content",
        canRetry: true,
      };
    }

    if (lowerMessage.includes("background") || lowerMessage.includes("image")) {
      return {
        type: "image",
        severity: "warning",
        icon: <WarningIcon />,
        title: "Background Image Issue",
        message: "Unable to load background image. Using fallback image.",
        action: "Try New Image",
        canRetry: true,
      };
    }

    if (lowerMessage.includes("rate limit") || lowerMessage.includes("429")) {
      return {
        type: "ratelimit",
        severity: "warning",
        icon: <WarningIcon />,
        title: "Rate Limit Reached",
        message: "Too many requests. Please wait a moment before trying again.",
        action: "Wait and Retry",
        canRetry: true,
        waitTime: 60, // seconds
      };
    }

    // Generic error
    return {
      type: "generic",
      severity: "error",
      icon: <ErrorIcon />,
      title: "Something Went Wrong",
      message: "An unexpected error occurred. Please try refreshing the page.",
      action: "Retry",
      canRetry: true,
    };
  };

  const errorInfo = getErrorInfo(error);
  const canRetry = errorInfo.canRetry && onRetry && retryCount < maxRetries;

  return (
    <Alert
      severity={errorInfo.severity}
      variant="filled"
      sx={{
        backgroundColor: `${errorInfo.severity}.main`,
        backdropFilter: "blur(10px)",
        boxShadow: "0 8px 30px rgba(0, 0, 0, 0.15)",
        borderRadius: 2,
        minWidth: "300px",
        maxWidth: "500px",
        mx: "auto",
        "& .MuiAlert-icon": {
          fontSize: "1.5rem",
        },
      }}
      icon={errorInfo.icon}
      action={
        onDismiss && (
          <IconButton size="small" onClick={onDismiss} sx={{ color: "white" }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        )
      }
    >
      <AlertTitle sx={{ fontWeight: 600 }}>{errorInfo.title}</AlertTitle>
      <Typography variant="body2" sx={{ mb: 1 }}>
        {errorInfo.message}
      </Typography>

      {/* Retry counter */}
      {retryCount > 0 && (
        <Box display="flex" alignItems="center" gap={1} mb={1}>
          <Chip
            size="small"
            label={`Attempt ${retryCount}/${maxRetries}`}
            sx={{
              backgroundColor: "rgba(255, 255, 255, 0.2)",
              color: "white",
              fontSize: "0.75rem",
            }}
          />
          {retryCount >= maxRetries && (
            <Typography
              variant="caption"
              sx={{ color: "rgba(255, 255, 255, 0.8)" }}
            >
              Maximum retries reached
            </Typography>
          )}
        </Box>
      )}

      {/* Wait time for rate limits */}
      {errorInfo.waitTime && (
        <Typography
          variant="caption"
          sx={{ color: "rgba(255, 255, 255, 0.8)" }}
        >
          Please wait {errorInfo.waitTime} seconds before retrying
        </Typography>
      )}

      {/* Error details (expandable) */}
      {showDetails && (
        <Box>
          <Button
            size="small"
            onClick={() => setExpanded(!expanded)}
            sx={{ color: "rgba(255, 255, 255, 0.8)", p: 0, mt: 1 }}
          >
            {expanded ? "Hide" : "Show"} Details
          </Button>
          <Collapse in={expanded}>
            <Box
              sx={{
                mt: 1,
                p: 1,
                backgroundColor: "rgba(0, 0, 0, 0.2)",
                borderRadius: 1,
                fontFamily: "monospace",
                fontSize: "0.75rem",
                color: "rgba(255, 255, 255, 0.9)",
                wordBreak: "break-all",
              }}
            >
              {typeof error === "object"
                ? JSON.stringify(error, null, 2)
                : error}
            </Box>
          </Collapse>
        </Box>
      )}
    </Alert>
  );
};

export default ErrorDisplay;
