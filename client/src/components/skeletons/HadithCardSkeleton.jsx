import React from "react";
import { Card, CardContent, Box, Skeleton, useTheme } from "@mui/material";

const HadithCardSkeleton = () => {
  const theme = useTheme();

  return (
    <Card
      sx={{
        width: "60%",
        maxWidth: 1000,
        mx: "auto",
        margin: "2rem auto",
        borderRadius: 2,
        backgroundColor: "rgba(255, 255, 255, 0.4)",
        backdropFilter: "blur(10px)",
        boxShadow: "0 8px 30px rgba(0, 0, 0, 0.15)",
        minHeight: "450px",
      }}
    >
      {/* Header Skeleton */}
      <Box
        sx={{
          background: `linear-gradient(90deg, ${theme.palette.primary.light} 0%, ${theme.palette.primary.main} 100%)`,
          borderRadius: "8px 8px 0 0",
          padding: "12px 20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Box sx={{ flex: 1 }}>
          <Skeleton
            variant="text"
            width="60%"
            height={32}
            sx={{ bgcolor: "rgba(255, 255, 255, 0.3)" }}
          />
          <Skeleton
            variant="text"
            width="80%"
            height={20}
            sx={{ bgcolor: "rgba(255, 255, 255, 0.2)", mt: 0.5 }}
          />
        </Box>
        <Skeleton
          variant="rounded"
          width={70}
          height={24}
          sx={{ bgcolor: "rgba(255, 255, 255, 0.3)" }}
        />
      </Box>

      <CardContent sx={{ paddingTop: 3, paddingBottom: 3 }}>
        {/* Narrator Skeleton */}
        <Box sx={{ textAlign: "center", mb: 2 }}>
          <Skeleton
            variant="text"
            width="50%"
            height={20}
            sx={{ mx: "auto" }}
          />
        </Box>

        {/* Arabic Text Skeleton */}
        <Box sx={{ textAlign: "center", mb: 2 }}>
          <Skeleton
            variant="text"
            width="95%"
            height={44}
            sx={{ mx: "auto", mb: 1 }}
          />
          <Skeleton
            variant="text"
            width="88%"
            height={44}
            sx={{ mx: "auto", mb: 1 }}
          />
          <Skeleton
            variant="text"
            width="92%"
            height={44}
            sx={{ mx: "auto", mb: 1 }}
          />
          <Skeleton
            variant="text"
            width="78%"
            height={44}
            sx={{ mx: "auto" }}
          />
        </Box>

        {/* Divider */}
        <Skeleton
          variant="rectangular"
          width="100%"
          height={1}
          sx={{ mb: 2 }}
        />

        {/* English Translation Skeleton */}
        <Box sx={{ textAlign: "center", mb: 2 }}>
          <Skeleton
            variant="text"
            width="98%"
            height={24}
            sx={{ mx: "auto", mb: 1 }}
          />
          <Skeleton
            variant="text"
            width="94%"
            height={24}
            sx={{ mx: "auto", mb: 1 }}
          />
          <Skeleton
            variant="text"
            width="96%"
            height={24}
            sx={{ mx: "auto", mb: 1 }}
          />
          <Skeleton
            variant="text"
            width="85%"
            height={24}
            sx={{ mx: "auto" }}
          />
        </Box>

        {/* Hadith Info Skeleton */}
        <Box sx={{ textAlign: "center", mt: 2 }}>
          <Skeleton
            variant="text"
            width="45%"
            height={16}
            sx={{ mx: "auto" }}
          />
        </Box>

        {/* Navigation Controls Skeleton */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mt: 3,
          }}
        >
          <Skeleton variant="circular" width={40} height={40} />
          <Skeleton variant="circular" width={40} height={40} />
          <Skeleton variant="circular" width={40} height={40} />
          <Skeleton variant="circular" width={40} height={40} />
        </Box>
      </CardContent>
    </Card>
  );
};

export default HadithCardSkeleton;
