import React from "react";
import {
  Card,
  CardContent,
  Typography,
  Divider,
  Box,
  Chip,
  useTheme,
  keyframes,
} from "@mui/material";
import AudioPlayer from "./AudioPlayer";
import { transliteratedSurahNames } from "../constants/surahNames";
import {
  useResponsiveDesign,
  getResponsiveConfig,
  getComponentStyles,
  getTypographyStyles,
} from "../hooks/useResponsiveDesign";

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px);}
  to { opacity: 1; transform: translateY(0);}
`;

const AyahCard = ({
  ayah,
  onPrev,
  onNext,
  onToggleContinuous,
  isContinuous,
  onFavorite,
}) => {
  const theme = useTheme();
  const { viewport, scaleFactor } = useResponsiveDesign();
  const responsiveConfig = getResponsiveConfig(viewport, scaleFactor);

  return (
    <Card
      sx={{
        ...getComponentStyles(
          viewport,
          responsiveConfig,
          "ayah-card",
          scaleFactor
        ),
        borderRadius: 2,
        background:
          "linear-gradient(to bottom right, rgba(245, 245, 245, 0.7), rgba(255, 255, 255, 0.4))",
        backdropFilter: "blur(10px)",
        boxShadow:
          "inset 0 0 10px rgba(0,0,0,0.05), 0 8px 30px rgba(0, 0, 0, 0.15)",
        transition: "transform 0.3s ease, box-shadow 0.3s ease",
        "&:hover": {
          transform: "translateY(-6px)",
          boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
        },
        animation: `${fadeIn} 0.6s ease forwards`,
        overflow: "visible",
      }}
    >
      <Box
        sx={{
          background: `linear-gradient(90deg, ${theme.palette.primary.light} 0%, ${theme.palette.primary.main} 100%)`,
          borderRadius: "8px 8px 0 0",
          padding: "12px 20px", // reduced padding (from 16px 24px)
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          color: "#fff",
          fontWeight: 700,
          fontSize: "1.3rem", // smaller font size (from 1.5rem)
        }}
      >
        <Box>
          Surah {ayah.surah.number}: {ayah.surah.englishNameTranslation}{" "}
          <Typography
            component="span"
            sx={{
              fontWeight: "normal",
              fontSize: "1rem",
              opacity: 0.8,
              marginLeft: 1,
            }}
          >
            ({ayah.surah.name} • {transliteratedSurahNames[ayah.surah.number]})
          </Typography>
          <Typography variant="body2" sx={{ mt: 0.5, color: "#eee" }}>
            Ayah {ayah.surah.ayahNumberInSurah} of {ayah.surah.numberOfAyahs}
          </Typography>
        </Box>

        <Chip
          label={ayah.surah.revelationType}
          color="secondary"
          size="small"
          sx={{
            fontWeight: 700,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            backgroundColor: theme.palette.secondary.main,
            color: "#fff",
            fontSize: "0.75rem", // smaller chip font size
          }}
        />
      </Box>

      <CardContent
        sx={{ paddingTop: 3, paddingBottom: 3, position: "relative" }}
      >
        <Box
          sx={{
            ...getTypographyStyles(viewport, responsiveConfig, "arabic"),
            fontFamily: '"Scheherazade New", serif',
            direction: "rtl",
            textAlign: "right",
            color: "#111827",
            marginBottom: 2,
            userSelect: "text",
            whiteSpace: "pre-line",
          }}
          textAlign="center"
        >
          {ayah.arabicText}
        </Box>

        <Divider sx={{ marginBottom: 2 }} />

        <Typography
          variant="body1"
          sx={{
            ...getTypographyStyles(viewport, responsiveConfig, "translation"),
            color: "#374151",
            fontStyle: "italic",
            whiteSpace: "pre-line",
          }}
          textAlign="center"
        >
          {ayah.text}
        </Typography>

        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ fontWeight: "medium", marginTop: 2, display: "block" }}
          textAlign="center"
        >
          Translation by {ayah.editionName}
        </Typography>
        <Typography
          variant="body2"
          sx={{
            marginTop: 1,
            fontWeight: 500,
            color: ayah.sajda ? "success.main" : "text.secondary",
          }}
          textAlign="center"
        >
          Sajdah Tilawah: {ayah.sajda ? "Yes" : "No"}
        </Typography>
      </CardContent>
      <AudioPlayer
        src={ayah.audio.main}
        onPrev={onPrev}
        onNext={onNext}
        onToggleContinuous={onToggleContinuous}
        isContinuous={isContinuous}
        ayah={ayah}
        onFavorite={onFavorite}
      />
    </Card>
  );
};

export default AyahCard;
