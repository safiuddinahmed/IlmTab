import React, { useRef, useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  Box,
  IconButton,
  Slider,
  Typography,
  Paper,
  useTheme,
  Tooltip,
} from "@mui/material";
import {
  PlayArrow,
  Pause,
  Stop,
  RestartAlt,
  Loop,
  ArrowBack,
  ArrowForward,
} from "@mui/icons-material";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import StarIcon from "@mui/icons-material/Star";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import TafsirModal from "./TafsirModal"; // Adjust path if needed
import MenuBookIcon from "@mui/icons-material/MenuBook";
import { addFavorite, removeFavorite } from "../redux/favoritesSlice";

const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
};

const AudioPlayer = ({
  src,
  onPrev,
  onNext,
  onToggleContinuous,
  isContinuous,
  ayah,
  onFavorite,
}) => {
  const audioRef = useRef(null);
  const theme = useTheme();

  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [showTafsir, setShowTafsir] = useState(false);

  const dispatch = useDispatch();
  const favorites = useSelector((state) => state.favorites.items);

  // Compose a unique ID for this ayah favorite
  const favoriteId = `ayah-${ayah.surah.number}-${ayah.surah.ayahNumberInSurah}`;

  // Check if this ayah is favorited
  const isFavorited = favorites.some((fav) => fav.id === favoriteId);

  const toggleFavorite = () => {
    if (isFavorited) {
      dispatch(removeFavorite(favoriteId));
    } else {
      // Create favorite object to store
      const favoriteObject = {
        id: favoriteId,
        type: "ayah",
        surahNumber: ayah.surah.number,
        ayahNumber: ayah.surah.ayahNumberInSurah,
        text: ayah.text,
        audio: src,
        note: "",
        surahName: ayah.surah.englishNameTranslation,
        surahArabicName: ayah.surah.name,
      };
      dispatch(addFavorite(favoriteObject));
    }
    // Remove the onFavorite callback call to prevent duplicates
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadedMetadata = () => setDuration(audio.duration);
    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleEnded = () => setIsPlaying(false);

    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("ended", handleEnded);
    };
  }, []);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) audio.pause();
    else audio.play();
    setIsPlaying(!isPlaying);
  };

  const stop = () => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.pause();
    audio.currentTime = 0;
    setIsPlaying(false);
  };

  const restart = () => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = 0;
    audio.play();
    setIsPlaying(true);
  };

  const handleSliderChange = (e, value) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = value;
    setCurrentTime(value);
  };

  return (
    <Paper
      elevation={4}
      sx={{
        p: 2,
        width: "100%",
        maxWidth: 1000,
        mx: "auto",
        margin: "2rem auto",
        backgroundColor: "rgba(255, 255, 255, 0.7)",
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
        boxShadow: "0 8px 16px rgba(0,0,0,0.12)",
      }}
    >
      <audio ref={audioRef} src={src} preload="metadata" />

      {/* Playback + Navigation */}
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        gap={1}
        mb={2}
      >
        <Tooltip title="Restart">
          <IconButton onClick={restart}>
            <RestartAlt />
          </IconButton>
        </Tooltip>
        <Tooltip title={isPlaying ? "Pause" : "Play"}>
          <IconButton onClick={togglePlay}>
            {isPlaying ? <Pause /> : <PlayArrow />}
          </IconButton>
        </Tooltip>
        <Tooltip title="Stop">
          <IconButton onClick={stop}>
            <Stop />
          </IconButton>
        </Tooltip>
        <Tooltip title="Previous Ayah">
          <IconButton onClick={onPrev} disabled={!isContinuous}>
            <ArrowBack />
          </IconButton>
        </Tooltip>
        <Tooltip title="Toggle Continuous Mode">
          <IconButton
            onClick={onToggleContinuous}
            color={isContinuous ? "primary" : "default"}
          >
            <Loop />
          </IconButton>
        </Tooltip>
        <Tooltip title="Next Ayah">
          <IconButton onClick={onNext}>
            <ArrowForward />
          </IconButton>
        </Tooltip>
        <Tooltip title="View Tafsir">
          <IconButton onClick={() => setShowTafsir(true)}>
            <MenuBookIcon />
          </IconButton>
        </Tooltip>

        {/* Favorite toggle button */}
        <Tooltip title={isFavorited ? "Unfavorite Ayah" : "Favorite Ayah"}>
          <IconButton onClick={toggleFavorite}>
            {isFavorited ? (
              <FavoriteIcon sx={{ color: "red" }} />
            ) : (
              <FavoriteBorderIcon />
            )}
          </IconButton>
        </Tooltip>
      </Box>

      {/* Slider + Time */}
      <Box display="flex" alignItems="center" gap={2}>
        <Typography variant="caption" sx={{ minWidth: 40 }}>
          {formatTime(currentTime)}
        </Typography>
        <Slider
          min={0}
          max={duration}
          value={currentTime}
          onChange={handleSliderChange}
          sx={{ flex: 1 }}
        />
        <Typography variant="caption" sx={{ minWidth: 40 }}>
          {formatTime(duration)}
        </Typography>
      </Box>

      <TafsirModal
        open={showTafsir}
        onClose={() => setShowTafsir(false)}
        surah={ayah.surah.number}
        ayah={ayah.surah.ayahNumberInSurah}
      />
    </Paper>
  );
};

export default AudioPlayer;
