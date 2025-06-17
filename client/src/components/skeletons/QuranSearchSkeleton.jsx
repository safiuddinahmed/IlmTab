import React from "react";
import {
  Box,
  Skeleton,
  List,
  ListItem,
  ListItemText,
  Divider,
} from "@mui/material";

const QuranSearchSkeleton = () => {
  return (
    <Box sx={{ maxHeight: "50vh", overflow: "auto" }}>
      <Divider />
      <List sx={{ p: 0 }}>
        {/* Generate 5 skeleton search result items */}
        {[...Array(5)].map((_, index) => (
          <ListItem
            key={index}
            sx={{
              borderBottom: index < 4 ? "1px solid rgba(0,0,0,0.06)" : "none",
              py: 2,
            }}
          >
            <ListItemText
              primary={
                <Box>
                  {/* Surah and Ayah info skeleton */}
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      mb: 1,
                    }}
                  >
                    <Skeleton
                      variant="text"
                      width="75%"
                      height={20}
                      sx={{ flex: 1 }}
                    />
                    <Skeleton
                      variant="circular"
                      width={24}
                      height={24}
                      sx={{ ml: 1 }}
                    />
                  </Box>

                  {/* Verse text skeleton - multiple lines */}
                  <Skeleton
                    variant="text"
                    width="100%"
                    height={16}
                    sx={{ mb: 0.5 }}
                  />
                  <Skeleton
                    variant="text"
                    width="95%"
                    height={16}
                    sx={{ mb: 0.5 }}
                  />
                  <Skeleton variant="text" width="80%" height={16} />
                </Box>
              }
            />
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default QuranSearchSkeleton;
