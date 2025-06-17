import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";
import store from "./store";
import "./styles/animations.css";
import { Provider, useSelector, useDispatch } from "react-redux";
import {
  CssBaseline,
  Container,
  CircularProgress,
  Box,
  IconButton,
  Tooltip,
  Snackbar,
} from "@mui/material";
import ErrorDisplay from "./components/ErrorDisplay";
import AyahCard from "./components/AyahCard";
import HadithCard from "./components/HadithCard";
import Greeting from "./components/Greeting";
import ToDoList from "./components/ToDoList";
import DateTimeWeather from "./components/DateTimeWeather";
import AyahCardSkeleton from "./components/skeletons/AyahCardSkeleton";
import HadithCardSkeleton from "./components/skeletons/HadithCardSkeleton";
import DateTimeWeatherSkeleton from "./components/skeletons/DateTimeWeatherSkeleton";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import FavoriteIcon from "@mui/icons-material/Favorite";
import SettingsIcon from "@mui/icons-material/Settings";
import SearchIcon from "@mui/icons-material/Search";
import FavoritesModal from "./components/FavoritesModal";
import SettingsModal from "./components/SettingsModal";
import QuranSearch from "./components/QuranSearch";
import {
  addFavorite,
  removeFavorite,
  updateNote,
} from "./redux/favoritesSlice";
import {
  setBackgroundLastRefreshTime,
  setBackgroundCurrentImageUrl,
  setBackgroundCurrentUploadedImageIndex,
} from "./redux/settingsSlice";
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
  const [searchOpen, setSearchOpen] = useState(false);

  // Page load animation state
  const [pageLoadComplete, setPageLoadComplete] = useState(false);

  // View mode transition state
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionDirection, setTransitionDirection] = useState(null);

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

  // Background settings
  const backgroundSettings = useSelector((state) => state.settings.background);
  const refreshInterval = backgroundSettings?.refreshInterval || "newtab";
  const lastRefreshTime = backgroundSettings?.lastRefreshTime;
  const currentImageUrl = backgroundSettings?.currentImageUrl;
  const fallbackImageUrl = backgroundSettings?.fallbackImageUrl;
  const imageSource = backgroundSettings?.imageSource || "category";
  const islamicCategory = backgroundSettings?.islamicCategory || "nature";
  const uploadedImages = backgroundSettings?.uploadedImages || [];
  const currentUploadedImageIndex =
    backgroundSettings?.currentUploadedImageIndex || 0;

  // Helper function to check if background should refresh
  const shouldRefreshBackground = () => {
    if (refreshInterval === "newtab") return true;
    if (!lastRefreshTime) return true;

    const now = Date.now();
    const timeDiff = now - lastRefreshTime;

    switch (refreshInterval) {
      case "5min":
        return timeDiff > 5 * 60 * 1000;
      case "15min":
        return timeDiff > 15 * 60 * 1000;
      case "30min":
        return timeDiff > 30 * 60 * 1000;
      case "1hour":
        return timeDiff > 60 * 60 * 1000;
      case "1day":
        return timeDiff > 24 * 60 * 60 * 1000;
      case "1week":
        return timeDiff > 7 * 24 * 60 * 60 * 1000;
      default:
        return true;
    }
  };

  const fetchBackground = async () => {
    console.log("fetchBackground called:", {
      imageSource,
      uploadedImagesCount: uploadedImages.length,
    });
    try {
      if (imageSource === "upload" && uploadedImages.length > 0) {
        // Use uploaded images in sequential order
        const imageIndex = currentUploadedImageIndex % uploadedImages.length;
        const selectedImage = uploadedImages[imageIndex];
        console.log(
          "Using uploaded image:",
          selectedImage.name,
          "Index:",
          imageIndex
        );

        // Update index for next refresh
        const nextIndex =
          (currentUploadedImageIndex + 1) % uploadedImages.length;
        dispatch(setBackgroundCurrentUploadedImageIndex(nextIndex));
        setBackgroundUrl(selectedImage.url);
        setPhotoAuthorName("Your Upload");
        setPhotoAuthorLink("#");
        dispatch(setBackgroundCurrentImageUrl(selectedImage.url));
        dispatch(setBackgroundLastRefreshTime(Date.now()));
        return; // Successfully set uploaded image
      } else if (imageSource === "category") {
        console.log("Using category mode");
        // In development, use a static image to save API resources
        if (process.env.NODE_ENV === "development") {
          const devImage =
            "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1920&q=80";
          setBackgroundUrl(devImage);
          setPhotoAuthorName("Annie Spratt");
          setPhotoAuthorLink("https://unsplash.com/@anniespratt");
          dispatch(setBackgroundCurrentImageUrl(devImage));
          dispatch(setBackgroundLastRefreshTime(Date.now()));
          return;
        }

        // Use Islamic categories with Unsplash in production
        const categoryQueries = {
          nature: "nature,landscape,mountains,sky,peaceful",
          architecture: "mosque,islamic architecture,minaret,dome",
          calligraphy: "arabic calligraphy,islamic art",
          geometric:
            "islamic pattern,islamic geometric,mandala,islamic symmetry",
        };

        const query =
          categoryQueries[islamicCategory] || categoryQueries.nature;

        const response = await axios.get(
          "https://api.unsplash.com/photos/random",
          {
            params: {
              query: query,
              orientation: "landscape",
            },
            headers: {
              Authorization: `Client-ID ${ACCESS_KEY}`,
            },
          }
        );

        if (response.data && response.data.urls && response.data.urls.full) {
          const data = response.data;
          setBackgroundUrl(data.urls.full);
          setPhotoAuthorName(data.user.name);
          setPhotoAuthorLink(data.user.links.html);
          dispatch(setBackgroundCurrentImageUrl(data.urls.full));
          dispatch(setBackgroundLastRefreshTime(Date.now()));

          // Trigger download tracking as required by Unsplash API
          if (data.links && data.links.download_location) {
            try {
              await axios.get(data.links.download_location, {
                headers: {
                  Authorization: `Client-ID ${ACCESS_KEY}`,
                },
              });
              console.log("Download tracked for Unsplash image:", data.id);
            } catch (err) {
              console.error("Failed to track download:", err);
            }
          }

          return; // Successfully set API image
        } else {
          throw new Error("Invalid API response");
        }
      }
    } catch (err) {
      console.error("Failed to load background image", err);
    }

    // Always use fallback image if we reach here (API failed or no uploaded images)
    const fallback =
      fallbackImageUrl ||
      "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1920&q=80";
    setBackgroundUrl(fallback);
    setPhotoAuthorName("Fallback Image");
    setPhotoAuthorLink("#");
    dispatch(setBackgroundCurrentImageUrl(fallback));
    dispatch(setBackgroundLastRefreshTime(Date.now()));
  };

  // Single effect to handle all background fetching logic
  useEffect(() => {
    fetchBackground();
  }, [imageSource, islamicCategory, uploadedImages.length]);

  // Set up interval for timed refreshes (not for "newtab" mode)
  useEffect(() => {
    if (refreshInterval === "newtab") return;

    const getIntervalMs = () => {
      switch (refreshInterval) {
        case "5min":
          return 5 * 60 * 1000;
        case "15min":
          return 15 * 60 * 1000;
        case "30min":
          return 30 * 60 * 1000;
        case "1hour":
          return 60 * 60 * 1000;
        case "1day":
          return 24 * 60 * 60 * 1000;
        case "1week":
          return 7 * 24 * 60 * 60 * 1000;
        default:
          return null;
      }
    };

    const intervalMs = getIntervalMs();
    if (!intervalMs) return;

    const interval = setInterval(() => {
      fetchBackground();
    }, intervalMs);

    return () => clearInterval(interval);
  }, [refreshInterval]);

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
        `http://localhost:4000/api/ayat?${params.toString()}`,
        { timeout: 10000 }
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

      const res = await axios.get(
        `http://localhost:4000/api/hadith?${params}`,
        {
          timeout: 12000,
        }
      );

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

  // Page load animation completion
  useEffect(() => {
    const timer = setTimeout(() => {
      setPageLoadComplete(true);
    }, 2000); // After all staggered animations complete

    return () => clearTimeout(timer);
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
    if (isTransitioning) return; // Prevent multiple transitions

    setIsTransitioning(true);
    setTransitionDirection("next");

    const currentIndex = slideTypes.indexOf(viewMode);
    const nextIndex = (currentIndex + 1) % slideTypes.length;

    // Small delay to allow exit animation, then change mode
    setTimeout(() => {
      setViewMode(slideTypes[nextIndex]);

      // Reset transition state after entrance animation
      setTimeout(() => {
        setIsTransitioning(false);
        setTransitionDirection(null);
      }, 400);
    }, 150);
  };

  const handlePrevSlide = () => {
    if (isTransitioning) return; // Prevent multiple transitions

    setIsTransitioning(true);
    setTransitionDirection("prev");

    const currentIndex = slideTypes.indexOf(viewMode);
    const prevIndex =
      (currentIndex - 1 + slideTypes.length) % slideTypes.length;

    // Small delay to allow exit animation, then change mode
    setTimeout(() => {
      setViewMode(slideTypes[prevIndex]);

      // Reset transition state after entrance animation
      setTimeout(() => {
        setIsTransitioning(false);
        setTransitionDirection(null);
      }, 400);
    }, 150);
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
        book: item.bookSlug, // Use bookSlug for API calls
        bookDisplayName: item.book, // Store display name separately
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

  const handleNavigateToFavorite = (favoriteItem) => {
    if (favoriteItem.type === "ayah") {
      // Navigate to the specific ayah
      setViewMode("ayah");
      fetchAyah(favoriteItem.surahNumber, favoriteItem.ayahNumber);
    } else if (favoriteItem.type === "hadith") {
      // Navigate to the specific hadith
      setViewMode("hadith");
      fetchHadith(favoriteItem.book, favoriteItem.hadithNumber);
    }
  };

  // Handle search result selection
  const handleSearchSelectAyah = (surahNumber, ayahNumber) => {
    setViewMode("ayah");
    fetchAyah(surahNumber, ayahNumber);
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

  // Helper function to get animation class
  const getAnimationClass = (staggerLevel) => {
    if (pageLoadComplete) return "page-load-complete";
    return `page-load-stagger-${staggerLevel}`;
  };

  // Helper function to get view transition animation class
  const getViewTransitionClass = () => {
    if (!isTransitioning) return "view-cross-fade";

    if (transitionDirection === "next") {
      return "view-slide-in-right";
    } else if (transitionDirection === "prev") {
      return "view-slide-in-left";
    }

    return "view-cross-fade";
  };

  return (
    <>
      <CssBaseline />
      <div style={backgroundStyle} className="page-load-background">
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
          {/* Enhanced Error Display */}
          {error && (
            <Box
              sx={{
                position: "fixed",
                top: 20,
                left: "50%",
                transform: "translateX(-50%)",
                zIndex: 2000,
                width: "90%",
                maxWidth: "500px",
              }}
            >
              <ErrorDisplay
                error={error}
                onDismiss={() => setError(null)}
                showDetails={process.env.NODE_ENV === "development"}
              />
            </Box>
          )}

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
            className={getAnimationClass(1)}
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

          <Box
            sx={{ width: "100%", maxWidth: "900px", mx: "auto" }}
            className="view-transition-container"
          >
            {/* Ayah Content or Skeleton */}
            {viewMode === "ayah" && (
              <div
                className={`${getAnimationClass(
                  2
                )} ${getViewTransitionClass()}`}
              >
                {loading ? (
                  <AyahCardSkeleton />
                ) : ayah ? (
                  <div className="animate-fade-in">
                    <AyahCard
                      ayah={ayah}
                      onNext={handleNextAyah}
                      onPrev={handlePrevAyah}
                      onToggleContinuous={() => setContinuous((prev) => !prev)}
                      isContinuous={continuous}
                      onFavorite={handleFavorite}
                    />
                  </div>
                ) : null}
              </div>
            )}

            {/* Hadith Content or Skeleton */}
            {viewMode === "hadith" && (
              <div
                className={`${getAnimationClass(
                  2
                )} ${getViewTransitionClass()}`}
              >
                {hadithLoading ? (
                  <HadithCardSkeleton />
                ) : hadith ? (
                  <div className="animate-fade-in">
                    <HadithCard
                      hadith={hadith}
                      onNext={handleNextHadith}
                      onPrev={handlePrevHadith}
                      onToggleContinuous={() =>
                        setHadithContinuous((prev) => !prev)
                      }
                      isContinuous={hadithContinuous}
                      onFavorite={handleFavorite}
                    />
                  </div>
                ) : null}
              </div>
            )}

            {/* Weather Content or Skeleton */}
            {weatherEnabled && (
              <div className={getAnimationClass(3)}>
                <DateTimeWeather />
              </div>
            )}

            {/* Greeting - always show when enabled */}
            {greetingsEnabled && (
              <div className={getAnimationClass(4)}>
                <Greeting name={greetingsName} />
              </div>
            )}

            {/* Tasks - always show when enabled */}
            {tasksEnabled && (
              <div className={getAnimationClass(5)}>
                <ToDoList />
              </div>
            )}
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
          className={getAnimationClass(6)}
        >
          <Tooltip title="Favorites">
            <IconButton
              size="large"
              className="btn-smooth"
              sx={{
                backgroundColor: "#fff",
                boxShadow: 2,
                "&:hover": { backgroundColor: "#eee" },
              }}
              onClick={() => setModalOpen(true)}
            >
              <FavoriteIcon color="error" className="icon-smooth" />
            </IconButton>
          </Tooltip>

          <Tooltip title="Settings">
            <IconButton
              size="large"
              className="btn-smooth"
              sx={{
                backgroundColor: "#fff",
                boxShadow: 2,
                "&:hover": { backgroundColor: "#eee" },
              }}
              onClick={() => setSettingsOpen(true)}
            >
              <SettingsIcon className="icon-smooth" />
            </IconButton>
          </Tooltip>

          <Tooltip title="Search Quran">
            <IconButton
              size="large"
              className="btn-smooth"
              sx={{
                backgroundColor: "#fff",
                boxShadow: 2,
                "&:hover": { backgroundColor: "#eee" },
              }}
              onClick={() => setSearchOpen(true)}
            >
              <SearchIcon color="primary" className="icon-smooth" />
            </IconButton>
          </Tooltip>

          <FavoritesModal
            open={modalOpen}
            onClose={() => setModalOpen(false)}
            favorites={favorites}
            onUpdateNote={handleUpdateNote}
            onDeleteFavorite={handleDeleteFavorite}
            onNavigateToFavorite={handleNavigateToFavorite}
          />
          <SettingsModal
            open={settingsOpen}
            onClose={() => setSettingsOpen(false)}
          />
        </Box>

        {/* Quran Search Modal */}
        {searchOpen && (
          <QuranSearch
            onSelectAyah={handleSearchSelectAyah}
            onClose={() => setSearchOpen(false)}
          />
        )}

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
            Photo by{" "}
            <a
              href={photoAuthorLink}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "#ddd", textDecoration: "underline" }}
            >
              {photoAuthorName}
            </a>{" "}
            on{" "}
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
