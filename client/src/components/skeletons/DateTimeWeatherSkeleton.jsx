import React from "react";
import { Box, Skeleton } from "@mui/material";

const DateTimeWeatherSkeleton = () => {
  return (
    <>
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          justifyContent: "space-between",
          alignItems: "center",
          gap: 3,
          px: 3,
          py: 3,
          width: "60%",
          maxWidth: 1000,
          mx: "auto",
          backgroundColor: "rgba(255, 255, 255, 0.4)",
          backdropFilter: "blur(10px)",
          boxShadow: "0 8px 30px rgba(0, 0, 0, 0.15)",
          borderRadius: 2,
          animation: "fadeInUp 0.7s ease forwards",
        }}
      >
        {/* Date & Time Skeleton */}
        <Box sx={{ flex: 1, textAlign: { xs: "center", sm: "left" } }}>
          {/* Time Skeleton */}
          <Skeleton
            variant="text"
            width={120}
            height={56}
            sx={{
              mb: 0.5,
              mx: { xs: "auto", sm: 0 },
            }}
          />

          {/* Hijri Date Skeleton */}
          <Skeleton
            variant="text"
            width={200}
            height={24}
            sx={{
              mb: 1,
              mx: { xs: "auto", sm: 0 },
            }}
          />

          {/* Gregorian Date Skeleton */}
          <Skeleton
            variant="text"
            width={250}
            height={24}
            sx={{
              mx: { xs: "auto", sm: 0 },
            }}
          />
        </Box>

        {/* Weather Skeleton */}
        <Box
          sx={{
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            gap: 2,
            backgroundColor: "rgba(255, 255, 255, 0.35)",
            backdropFilter: "blur(8px)",
            borderRadius: 3,
            p: 2,
            minWidth: 180,
            boxShadow: "0 6px 20px rgba(0, 0, 0, 0.1)",
            animation: "fadeInUp 1s ease forwards",
          }}
        >
          {/* Weather Icon Skeleton */}
          <Skeleton variant="circular" width={48} height={48} />

          {/* Weather Info Skeleton */}
          <Box>
            {/* Location Name Skeleton */}
            <Skeleton variant="text" width={80} height={20} sx={{ mb: 0.5 }} />

            {/* Temperature Skeleton */}
            <Skeleton variant="text" width={60} height={32} sx={{ mb: 0.5 }} />

            {/* Weather Description Skeleton */}
            <Skeleton variant="text" width={90} height={16} />
          </Box>
        </Box>
      </Box>
    </>
  );
};

export default DateTimeWeatherSkeleton;
