import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";
import store from "./store";
import { Provider, useSelector, useDispatch } from "react-redux";
import {
  CssBaseline,
  Container,
  CircularProgress,
  Box,
  IconButton,
  Tooltip,
  Alert,
  AlertTitle,
  Snackbar,
} from "@mui/material";
import AyahCard from "./components/AyahCard";
import HadithCard from "./components/HadithCard";
import Greeting from "./components/Greeting";
import ToDoList from "./components/ToDoList";
import DateTimeWeather from "./components/DateTimeWeather";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import FavoriteIcon from "@mui/icons-material/Favorite";
import SettingsIcon from "@mui/icons-material/Settings";
import FavoritesModal from "./components/FavoritesModal";
import SettingsModal from "./components/SettingsModal";
import {
  addFavorite,
  removeFavorite,
  updateNote,
} from "./redux/favoritesSlice";
import hadithBooks from "./constants/hadithBooks";
import axios from "axios";

const ACCESS_KEY = "CmH0hk3YgDGkNbMvPBhbNL8n23lQwrNnrneWYr-lVlc";

function App() {
  const [ayah, setAyah] = useState(null);
  const [hadith, setHadith] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hadithLoading, setHadithLoading] = useState(false);
  const [error, setError] = useState(null);
  const [backgroundUrl, setBackgroundUrl] = useState(null);
  const [photoAuthorName, setPhotoAuthorName] = useState("");
  const [photoAuthorLink, setPhotoAuthorLink] = useState("");
  const [currentSurah, setCurrentSurah] = useState(null);
  const [currentAyah, setCurrentAyah] = useState(null);
  const [continuous, setContinuous] = useState(false);
  const [hadithContinuous, setHadithContinuous] = useState(false);
  const [currentHadithNumber, setCurrentHadithNumber] = useState(null);
  const [hadithsCount, setHadithsCount] = useState(null);
  const [viewMode, setViewMode] = useState("ayah"); // 'ayah' or 'hadith'
  const [modalOpen, setModalOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const dispatch = useDispatch();
  const favorites = useSelector((state) => state.favorites.items);
  const textEdition = useSelector(
    (state) => state.settings.ayah.textEdition.identifier
  );
  const audioEdition = useSelector(
    (state) => state.settings.ayah.audioEdition.identifier
  );

  const hadithBook = useSelector((state) => state.settings.hadith.book);
  const weatherEnabled = useSelector((state) => state.settings.weather.enabled);
  const greetingsEnabled = useSelector(
    (state) => state.settings.greetings.enabled
  );
  const greetingsName = useSelector((state) => state.settings.greetings.name);
  const tasksEnabled = useSelector((state) => state.settings.tasks.enabled);

  useEffect(() => {
    const fetchBackground = async () => {
      try {
        if (process.env.NODE_ENV === "development") {
          setBackgroundUrl(
            "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1920&q=80"
          );
          setPhotoAuthorName("Annie Spratt");
          setPhotoAuthorLink("https://unsplash.com/@anniespratt");
        } else {
          const response = await axios.get(
            "https://api.unsplash.com/photos/random",
            {
              params: {
                query: "nature,sky",
                orientation: "landscape",
              },
              headers: {
                Authorization: `Client-ID ${ACCESS_KEY}`,
              },
            }
          );
          const data = response.data;
          setBackgroundUrl(data.urls.full);
          setPhotoAuthorName(data.user.name);
          setPhotoAuthorLink(data.user.links.html);
        }
      } catch (err) {
        console.error("Failed to load background image", err);
      }
    };

    fetchBackground();
  }, []);

  const fetchAyah = async (surah = null, ayah = null) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (surah && ayah) {
        params.append("surah", surah);
        params.append("ayah", ayah);
      }
      params.append("text_edition", textEdition);
      params.append("audio_edition", audioEdition);

      const res = await axios.get(
        `http://localhost:4000/api/ayat?${params.toString()}`
      );
      const data = res.data;
      setAyah(data);
      setCurrentSurah(data.surah.number);
      setCurrentAyah(data.surah.ayahNumberInSurah);
      setError(null);
    } catch (err) {
      setError("Failed to fetch ayah");
    } finally {
      setLoading(false);
    }
  };

  const fetchHadith = async (book = null, hadithNumber = null) => {
    try {
      setHadithLoading(true);
      const params = new URLSearchParams();

      if (book) {
        params.append("book", book);
      } else {
        params.append("book", hadithBook); // fallback to Redux value
      }

      if (hadithNumber) {
        params.append("hadithNumber", hadithNumber);
      }

      const res = await axios.get(`http://localhost:4000/api/hadith?${params}`);
      const data = res.data;
      setHadith(data);
      setCurrentHadithNumber(Number(data.number));
      setError(null);
    } catch (err) {
      setError("Failed to fetch hadith");
    } finally {
      setHadithLoading(false);
    }
  };

  // On mount, fetch random ayah once
  useEffect(() => {
    fetchAyah();
  }, []);

  // When text/audio editions change, refetch the current ayah (if any)
  useEffect(() => {
    if (currentSurah != null && currentAyah != null) {
      fetchAyah(currentSurah, currentAyah);
    }
  }, [textEdition, audioEdition]);

  // Update hadithsCount whenever hadithBook changes
  useEffect(() => {
    if (hadithBook) {
      const bookInfo = hadithBooks.find((b) => b.slug === hadithBook);
      if (bookInfo) {
        setHadithsCount(bookInfo.hadithsCount);

        const randomHadithNumber =
          Math.floor(Math.random() * bookInfo.hadithsCount) + 1;

        setCurrentHadithNumber(randomHadithNumber);
        fetchHadith(hadithBook, randomHadithNumber);
      }
    }
  }, [hadithBook]);

  const handleNextAyah = () => {
    if (continuous && currentSurah && currentAyah) {
      fetchAyah(currentSurah, currentAyah + 1);
    } else {
      fetchAyah();
    }
  };

  const handlePrevAyah = () => {
    if (continuous && currentSurah && currentAyah > 1) {
      fetchAyah(currentSurah, currentAyah - 1);
    }
  };

  const handleNextHadith = () => {
    if (
      hadithContinuous &&
      currentHadithNumber &&
      hadithsCount &&
      currentHadithNumber < hadithsCount
    ) {
      const nextNumber = currentHadithNumber + 1;
      setCurrentHadithNumber(nextNumber);
      fetchHadith(hadithBook, nextNumber);
    } else {
      fetchHadith(); // fetch random
    }
  };

  const handlePrevHadith = () => {
    if (hadithContinuous && currentHadithNumber > 1) {
      const prevNumber = currentHadithNumber - 1;
      setCurrentHadithNumber(prevNumber);
      fetchHadith(hadithBook, prevNumber);
    }
  };

  const slideTypes = ["ayah", "hadith"];
  const handleNextSlide = () => {
    const currentIndex = slideTypes.indexOf(viewMode);
    const nextIndex = (currentIndex + 1) % slideTypes.length;
    setViewMode(slideTypes[nextIndex]);
  };
  const handlePrevSlide = () => {
    const currentIndex = slideTypes.indexOf(viewMode);
    const prevIndex =
      (currentIndex - 1 + slideTypes.length) % slideTypes.length;
    setViewMode(slideTypes[prevIndex]);
  };

  // Handle favorites for both ayah and hadith, store id uniquely
  const handleFavorite = (item) => {
    if (!item) return;
    let id = "";
    let newFavorite = null;

    if (item.surah) {
      // Ayah
      id = `ayah-${item.surah.number}-${item.surah.ayahNumberInSurah}`;
      newFavorite = {
        id,
        type: "ayah",
        surahNumber: item.surah.number,
        ayahNumber: item.surah.ayahNumberInSurah,
        text: item.text,
        audio: item.audio?.main || "",
        note: "",
      };
    } else if (item.bookSlug) {
      // Hadith
      id = `hadith-${item.bookSlug}-${item.number}`;
      newFavorite = {
        id,
        type: "hadith",
        book: item.book,
        hadithNumber: item.number,
        englishText: item.text.english || "",
        note: "",
      };
    } else {
      console.warn("Unknown item type for favorite", item);
      return;
    }

    const exists = favorites.some((f) => f.id === id);
    if (!exists) {
      dispatch(addFavorite(newFavorite));
    } else {
      dispatch(removeFavorite(id));
    }
  };

  const handleUpdateNote = (id, newNote) => {
    dispatch(updateNote({ id, note: newNote }));
  };

  const handleDeleteFavorite = (id) => {
    dispatch(removeFavorite(id));
  };

  const backgroundStyle = {
    backgroundImage: backgroundUrl ? `url(${backgroundUrl})` : "none",
    backgroundSize: "cover",
    backgroundPosition: "center",
    minHeight: "100vh",
    paddingTop: "2rem",
    transition: "background-image 0.5s ease-in-out",
    position: "relative",
  };

  return (
    <>
      <CssBaseline />
      <div style={backgroundStyle}>
        <Box
          sx={{
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            px: 2,
            py: 4,
          }}
        >
          {(loading || hadithLoading) && (
            <Box
              display="flex"
              justifyContent="center"
              alignItems="center"
              my={4}
            >
              <CircularProgress />
            </Box>
          )}
          {/* Enhanced Error Display */}
          <Snackbar
            open={!!error}
            autoHideDuration={6000}
            onClose={() => setError(null)}
            anchorOrigin={{ vertical: "top", horizontal: "center" }}
            sx={{ mt: 8 }}
          >
            <Alert
              onClose={() => setError(null)}
              severity="error"
              variant="filled"
              sx={{
                backgroundColor: "rgba(211, 47, 47, 0.9)",
                backdropFilter: "blur(10px)",
                boxShadow: "0 8px 30px rgba(0, 0, 0, 0.15)",
                borderRadius: 2,
                minWidth: "300px",
              }}
            >
              <AlertTitle>Connection Error</AlertTitle>
              {error}
            </Alert>
          </Snackbar>

          <Box
            sx={{
              backgroundColor: "rgba(255, 255, 255, 0.4)",
              backdropFilter: "blur(10px)",
              boxShadow: "0 8px 30px rgba(0, 0, 0, 0.15)",
              borderRadius: "20px",
              px: 2,
              py: 0.5,
              mb: 2,
              display: "flex",
              alignItems: "center",
            }}
          >
            <IconButton
              onClick={handlePrevSlide}
              size="small"
              sx={{ color: "#374151" }}
            >
              <ArrowBackIosNewIcon fontSize="small" />
            </IconButton>
            <span
              style={{
                color: "#374151",
                fontSize: "0.9rem",
                fontWeight: 500,
                letterSpacing: "0.5px",
                fontFamily: "Inter, Roboto, sans-serif",
                margin: "0 8px",
                userSelect: "none",
              }}
            >
              {viewMode === "ayah" ? "Ayah Mode" : "Hadith Mode"}
            </span>
            <IconButton
              onClick={handleNextSlide}
              size="small"
              sx={{ color: "#374151" }}
            >
              <ArrowForwardIosIcon fontSize="small" />
            </IconButton>
          </Box>

          <Box sx={{ width: "100%", maxWidth: "900px", mx: "auto" }}>
            {viewMode === "ayah" && ayah && (
              <AyahCard
                ayah={ayah}
                onNext={handleNextAyah}
                onPrev={handlePrevAyah}
                onToggleContinuous={() => setContinuous((prev) => !prev)}
                isContinuous={continuous}
              />
            )}

            {viewMode === "hadith" && hadith && (
              <HadithCard
                hadith={hadith}
                onNext={handleNextHadith}
                onPrev={handlePrevHadith}
                onToggleContinuous={() => setHadithContinuous((prev) => !prev)}
                isContinuous={hadithContinuous}
              />
            )}

            {weatherEnabled && <DateTimeWeather />}
            {greetingsEnabled && <Greeting name={greetingsName} />}
            {tasksEnabled && <ToDoList />}
          </Box>
        </Box>

        {/* Bottom-left buttons */}
        <Box
          sx={{
            position: "fixed",
            bottom: 10,
            left: 10,
            display: "flex",
            gap: 1,
            zIndex: 1500,
          }}
        >
          <Tooltip title="Favorites">
            <IconButton
              size="large"
              sx={{
                backgroundColor: "#fff",
                boxShadow: 2,
                "&:hover": { backgroundColor: "#eee" },
              }}
              onClick={() => setModalOpen(true)}
            >
              <FavoriteIcon color="error" />
            </IconButton>
          </Tooltip>

          <Tooltip title="Settings">
            <IconButton
              size="large"
              sx={{
                backgroundColor: "#fff",
                boxShadow: 2,
                "&:hover": { backgroundColor: "#eee" },
              }}
              onClick={() => setSettingsOpen(true)}
            >
              <SettingsIcon />
            </IconButton>
          </Tooltip>

          <FavoritesModal
            open={modalOpen}
            onClose={() => setModalOpen(false)}
            favorites={favorites}
            onUpdateNote={handleUpdateNote}
            onDeleteFavorite={handleDeleteFavorite}
          />
          <SettingsModal
            open={settingsOpen}
            onClose={() => setSettingsOpen(false)}
          />
        </Box>

        {/* Unsplash credit */}
        {backgroundUrl && (
          <div
            style={{
              position: "fixed",
              bottom: 10,
              right: 10,
              color: "white",
              backgroundColor: "rgba(0, 0, 0, 0.4)",
              padding: "4px 8px",
              borderRadius: "4px",
              fontSize: "0.8rem",
              fontFamily: "Arial, sans-serif",
              zIndex: 1000,
              userSelect: "none",
            }}
          >
            Photo,{" "}
            <a
              href={photoAuthorLink}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "#ddd", textDecoration: "underline" }}
            >
              {photoAuthorName}
            </a>
            ,{" "}
            <a
              href="https://unsplash.com"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "#ddd", textDecoration: "underline" }}
            >
              Unsplash
            </a>
          </div>
        )}
      </div>
    </>
  );
}

const Root = () => (
  <Provider store={store}>
    <App />
  </Provider>
);

ReactDOM.createRoot(document.getElementById("root")).render(<Root />);
