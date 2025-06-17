import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  Card,
  CardContent,
  Typography,
  Divider,
  Box,
  Chip,
  useTheme,
  keyframes,
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  ArrowBack,
  ArrowForward,
  Favorite,
  FavoriteBorder,
} from "@mui/icons-material";
import Loop from "@mui/icons-material/Loop";
import { addFavorite, removeFavorite } from "../redux/favoritesSlice";

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px);}
  to { opacity: 1; transform: translateY(0);}
`;

const HadithCard = ({
  hadith,
  onPrev,
  onNext,
  onToggleContinuous,
  isContinuous,
  onFavorite,
}) => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const favorites = useSelector((state) => state.favorites.items);

  // Compose a unique ID for this hadith favorite
  const favoriteId = `hadith-${hadith.bookSlug}-${hadith.number}`;

  // Check if this hadith is favorited
  const isFavorited = favorites.some((fav) => fav.id === favoriteId);

  const handleFavoriteClick = () => {
    if (isFavorited) {
      dispatch(removeFavorite(favoriteId));
    } else {
      // Create favorite object to store
      const favoriteObject = {
        id: favoriteId,
        type: "hadith",
        book: hadith.bookSlug, // Use bookSlug for API calls
        bookDisplayName: hadith.book, // Store display name separately
        hadithNumber: hadith.number,
        englishText: hadith.text.english || "",
        note: "",
      };
      dispatch(addFavorite(favoriteObject));
    }
    // Remove the onFavorite callback call to prevent duplicates
  };

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
        "&:hover": {
          transform: "translateY(-6px)",
          boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
        },
        animation: `${fadeIn} 0.6s ease forwards`,
        minHeight: "450px", // Reserve minimum space to prevent layout shifts
      }}
    >
      <Box
        sx={{
          background: `linear-gradient(90deg, ${theme.palette.primary.light} 0%, ${theme.palette.primary.main} 100%)`,
          borderRadius: "4px 4px 0 0",
          padding: "12px 20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          color: "#fff",
          fontWeight: 700,
          fontSize: "1.3rem",
        }}
      >
        <Box>
          {hadith.book}
          <Typography
            component="span"
            sx={{
              fontWeight: "normal",
              fontSize: "1rem",
              opacity: 0.8,
              marginLeft: 1,
            }}
          >
            - Chapter {hadith.chapter.chapterNumber}: {hadith.chapter.english}
          </Typography>
        </Box>
        <Chip
          label={hadith.status}
          color={hadith.status === "Sahih" ? "success" : "warning"}
          size="small"
          sx={{
            fontWeight: 700,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            backgroundColor:
              hadith.status === "Sahih"
                ? theme.palette.success.main
                : theme.palette.warning.main,
            color: "#fff",
            fontSize: "0.75rem",
          }}
        />
      </Box>

      <CardContent sx={{ paddingTop: 3, paddingBottom: 3 }}>
        <Typography
          variant="subtitle2"
          textAlign="center"
          sx={{ fontWeight: 500, marginBottom: 1 }}
        >
          {hadith.narrator.english}
        </Typography>

        <Box
          sx={{
            fontSize: { xs: "1.5rem", sm: "1.7rem" },
            fontFamily: '"Scheherazade New", serif',
            direction: "rtl",
            textAlign: "right",
            color: "#111827",
            marginBottom: 2,
            lineHeight: 1.6,
            userSelect: "text",
            whiteSpace: "pre-line",
          }}
          textAlign="center"
        >
          {hadith.text.arabic}
        </Box>

        <Divider sx={{ marginBottom: 2 }} />

        <Typography
          variant="body1"
          textAlign="center"
          sx={{
            fontSize: { xs: "1rem", sm: "1.15rem" },
            color: "#374151",
            fontStyle: "italic",
            whiteSpace: "pre-line",
            lineHeight: 1.5,
          }}
        >
          {hadith.text.english}
        </Typography>

        <Typography
          variant="caption"
          textAlign="center"
          display="block"
          sx={{ mt: 2, color: "text.primary" }}
        >
          Hadith #{hadith.number} from {hadith.writer}
        </Typography>

        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mt: 3,
          }}
        >
          <IconButton onClick={onPrev}>
            <ArrowBack />
          </IconButton>

          <Tooltip title="Toggle Continuous Mode">
            <IconButton
              onClick={onToggleContinuous}
              color={isContinuous ? "primary" : "default"}
            >
              <Loop />
            </IconButton>
          </Tooltip>

          <IconButton onClick={handleFavoriteClick}>
            {isFavorited ? (
              <Favorite sx={{ color: "red" }} />
            ) : (
              <FavoriteBorder />
            )}
          </IconButton>

          <IconButton onClick={onNext}>
            <ArrowForward />
          </IconButton>
        </Box>
      </CardContent>
    </Card>
  );
};

export default HadithCard;
