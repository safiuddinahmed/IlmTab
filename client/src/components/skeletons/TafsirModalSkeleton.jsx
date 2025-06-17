import React from "react";
import { Box, Skeleton } from "@mui/material";

const TafsirModalSkeleton = () => {
  return (
    <Box>
      {/* Tafsir Meta Information Skeleton */}
      <Box mb={2}>
        {/* Tafsir Name */}
        <Skeleton variant="text" width="60%" height={28} sx={{ mb: 0.5 }} />
        {/* Author Name */}
        <Skeleton variant="text" width="40%" height={20} />
      </Box>

      {/* Tafsir Content Skeleton */}
      <Box>
        {/* Multiple lines of tafsir text */}
        <Skeleton variant="text" width="100%" height={24} sx={{ mb: 1 }} />
        <Skeleton variant="text" width="95%" height={24} sx={{ mb: 1 }} />
        <Skeleton variant="text" width="98%" height={24} sx={{ mb: 1 }} />
        <Skeleton variant="text" width="92%" height={24} sx={{ mb: 1 }} />
        <Skeleton variant="text" width="100%" height={24} sx={{ mb: 1 }} />
        <Skeleton variant="text" width="88%" height={24} sx={{ mb: 1 }} />
        <Skeleton variant="text" width="96%" height={24} sx={{ mb: 1 }} />
        <Skeleton variant="text" width="90%" height={24} sx={{ mb: 1 }} />
        <Skeleton variant="text" width="100%" height={24} sx={{ mb: 1 }} />
        <Skeleton variant="text" width="85%" height={24} sx={{ mb: 1 }} />
        <Skeleton variant="text" width="93%" height={24} sx={{ mb: 1 }} />
        <Skeleton variant="text" width="97%" height={24} sx={{ mb: 1 }} />
        <Skeleton variant="text" width="89%" height={24} sx={{ mb: 1 }} />
        <Skeleton variant="text" width="100%" height={24} sx={{ mb: 1 }} />
        <Skeleton variant="text" width="75%" height={24} />
      </Box>
    </Box>
  );
};

export default TafsirModalSkeleton;
