import React, { useEffect, useState } from "react";
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
import { useIndexedDBContext } from "../contexts/IndexedDBContext";

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

  // Use IndexedDB context instead of Redux
  const { favorites, settings } = useIndexedDBContext();

  // State for formatted hadith data based on translation language
  const [formattedHadith, setFormattedHadith] = useState({
    text: hadith.text?.english || "",
    narrator: hadith.narrator?.english || "",
    heading: hadith.heading?.english || "",
    chapter: hadith.chapter?.english || "",
    arabicText: hadith.text?.arabic || "",
    number: hadith.number || "",
    book: hadith.book || "",
    status: hadith.status || "",
  });

  // Simple language switching - update formatted hadith when hadith data or settings change
  useEffect(() => {
    const translationLanguage =
      settings?.settings?.hadith?.translationLanguage || "en";

    console.log(
      "🔄 Updating hadith format with language:",
      translationLanguage
    );

    // Simple language selection logic
    const getTextByLanguage = (textObj) => {
      if (!textObj) return "";

      switch (translationLanguage) {
        case "ur":
        case "urdu":
          return textObj.urdu || textObj.english || "";
        case "en":
        case "english":
        default:
          return textObj.english || textObj.urdu || "";
      }
    };

    setFormattedHadith({
      text: getTextByLanguage(hadith.text),
      narrator: getTextByLanguage(hadith.narrator),
      heading: getTextByLanguage(hadith.heading),
      chapter: getTextByLanguage(hadith.chapter),
      arabicText: hadith.text?.arabic || "",
      number: hadith.number || "",
      book: hadith.book || "",
      status: hadith.status || "",
    });

    console.log("✅ Hadith formatted for language:", translationLanguage);
  }, [hadith, settings?.settings?.hadith?.translationLanguage]);

  // Compose a unique ID for this hadith favorite
  const favoriteId = `hadith-${hadith.bookSlug}-${hadith.number}`;

  // Check if this hadith is favorited
  const isFavorited =
    favorites?.favorites?.some((fav) => fav.id === favoriteId) || false;

  const handleFavoriteClick = () => {
    if (isFavorited) {
      favorites?.removeFavorite(favoriteId);
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
      favorites?.addFavorite(favoriteObject);
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
        background:
          "linear-gradient(to bottom right, rgba(245, 245, 245, 0.7), rgba(255, 255, 255, 0.4))",
        backdropFilter: "blur(10px)",
        boxShadow:
          "inset 0 0 10px rgba(0,0,0,0.05), 0 8px 30px rgba(0, 0, 0, 0.15)",
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
          borderRadius: "8px 8px 0 0",
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
            - Chapter {hadith.chapter.chapterNumber}: {formattedHadith.chapter}
          </Typography>
        </Box>
        <Chip
          label={hadith.status}
          color="success"
          size="small"
          sx={{
            fontWeight: 700,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            backgroundColor: theme.palette.success.main,
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
          {formattedHadith.narrator}
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
          {formattedHadith.arabicText}
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
          {formattedHadith.text}
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
