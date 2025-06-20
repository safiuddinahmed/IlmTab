import React, { useEffect, useState, useRef } from "react";
import ReactDOM from "react-dom/client";
import "./styles/animations.css";
import CssBaseline from "@mui/material/CssBaseline";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import ErrorDisplay from "./components/ErrorDisplay";
import AyahCard from "./components/AyahCard";
import HadithCard from "./components/HadithCard";
import Greeting from "./components/Greeting";
import ToDoList from "./components/ToDoList";
import DateTimeWeather from "./components/DateTimeWeather";
import AyahCardSkeleton from "./components/skeletons/AyahCardSkeleton";
import HadithCardSkeleton from "./components/skeletons/HadithCardSkeleton";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import FavoriteIcon from "@mui/icons-material/Favorite";
import SettingsIcon from "@mui/icons-material/Settings";
import SearchIcon from "@mui/icons-material/Search";
import { lazy, Suspense } from "react";

// Lazy load heavy modals to reduce initial bundle size
const FavoritesModal = lazy(() => import("./components/FavoritesModal"));
const SettingsModal = lazy(() => import("./components/SettingsModal"));
const QuranSearch = lazy(() => import("./components/QuranSearch"));

import hadithBooks from "./constants/hadithBooks";
import { fetchAyah as fetchAyahAPI } from "./api/ayat";
import { fetchHadith as fetchHadithAPI } from "./api/hadith";
import {
  buildOptimizedImageUrl,
  buildPlaceholderUrl,
  loadImageProgressively,
  imageCache,
  getImageSizingInfo,
} from "./utils/imageOptimization";
import {
  IndexedDBProvider,
  useIndexedDBContext,
} from "./contexts/IndexedDBContext";
import { useRotatingImageCache } from "./hooks/useRotatingImageCache";

const ACCESS_KEY = "CmH0hk3YgDGkNbMvPBhbNL8n23lQwrNnrneWYr-lVlc";

function App() {
  const [ayah, setAyah] = useState(null);
  const [hadith, setHadith] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hadithLoading, setHadithLoading] = useState(false);
  const [error, setError] = useState(null);
  const [backgroundUrl, setBackgroundUrl] = useState(null);
  const [nextBackgroundUrl, setNextBackgroundUrl] = useState(null);
  const [backgroundLoading, setBackgroundLoading] = useState(true);
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

  // Use IndexedDB context
  const { settings, favorites } = useIndexedDBContext();

  // Use rotating image cache
  const {
    currentImage,
    loading: imageLoading,
    placeholderUrl,
    isUsingFallback,
    isTransitioning: imageTransitioning,
    cacheInfo,
  } = useRotatingImageCache();

  // Ref to prevent multiple simultaneous background fetches
  const fetchingRef = useRef(false);

  // Get values from IndexedDB settings
  const currentSettings = settings?.settings || {};
  const ayahSettings = currentSettings.ayah || {};
  const hadithSettings = currentSettings.hadith || {};
  const weatherSettings = currentSettings.weather || {};
  const greetingsSettings = currentSettings.greetings || {};
  const tasksSettings = currentSettings.tasks || {};
  const backgroundSettings = currentSettings.background || {};

  const textEdition = ayahSettings.textEdition?.identifier || "en.asad";
  const audioEdition = ayahSettings.audioEdition?.identifier || "ar.alafasy";
  const hadithBook = hadithSettings.book || "sahih-bukhari";
  const weatherEnabled = weatherSettings.enabled || false;
  const greetingsEnabled = greetingsSettings.enabled || false;
  const greetingsName = greetingsSettings.name || "";
  const tasksEnabled = tasksSettings.enabled || false;

  // Background settings
  const refreshInterval = backgroundSettings?.refreshInterval || "newtab";
  const lastRefreshTime = backgroundSettings?.lastRefreshTime;
  const currentImageUrl = backgroundSettings?.currentImageUrl;
  const imageSource = backgroundSettings?.imageSource || "category";
  const islamicCategory = backgroundSettings?.islamicCategory || "nature";
  const uploadedImages = backgroundSettings?.uploadedImages || [];
  const currentUploadedImageIndex =
    backgroundSettings?.currentUploadedImageIndex || 0;

  // Enhanced background image handling with preloading and smooth transitions
  useEffect(() => {
    const handleBackgroundUpdate = async () => {
      // Don't update background during image transitions to prevent flash
      if (imageTransitioning) {
        console.log("🔄 Image transitioning, keeping current background");
        return;
      }

      let targetUrl = null;
      let authorName = "";
      let authorLink = "";

      if (imageSource === "upload" && uploadedImages.length > 0) {
        // Handle uploaded images with preloading
        const imageIndex = currentUploadedImageIndex % uploadedImages.length;
        const selectedImage = uploadedImages[imageIndex];

        targetUrl = selectedImage.url.includes("unsplash.com")
          ? buildOptimizedImageUrl(selectedImage.url)
          : selectedImage.url;

        authorName = "Your Upload";
        authorLink = "#";

        console.log("🖼️ Processing uploaded image:", selectedImage.id);
      } else if (imageSource === "category" && currentImage) {
        // Use rotating cache image (including fallback)
        targetUrl = buildOptimizedImageUrl(currentImage.url);
        authorName = currentImage.authorName;
        authorLink = currentImage.authorLink;

        // For Unsplash images, use placeholder first if available
        if (placeholderUrl && !backgroundUrl && !isUsingFallback) {
          console.log("🖼️ Showing blur placeholder for instant feedback");
          setBackgroundUrl(placeholderUrl);
          setPhotoAuthorName(authorName);
          setPhotoAuthorLink(authorLink);
          setBackgroundLoading(false);

          // Preload the full image in background
          setTimeout(() => {
            setNextBackgroundUrl(targetUrl);
          }, 50);
          return;
        }

        console.log("🖼️ Using cached image:", {
          id: currentImage.id,
          author: currentImage.authorName,
          url: currentImage.url,
          isUsingFallback,
          cacheInfo,
        });
      } else if (imageSource === "upload" && uploadedImages.length === 0) {
        // When in upload mode but no images uploaded, use fallback
        targetUrl = buildOptimizedImageUrl("/mosque.jpg");
        authorName = "IlmTab";
        authorLink = "#";
        console.log("🖼️ Using fallback for empty upload mode");
      }

      // Only update if the URL is actually different
      if (targetUrl && backgroundUrl !== targetUrl) {
        setBackgroundLoading(true);

        try {
          // Preload the image before setting it as background
          await new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = resolve;
            img.onerror = reject;
            img.src = targetUrl;
          });

          // Image is loaded, now update the background smoothly
          setNextBackgroundUrl(targetUrl);
          setPhotoAuthorName(authorName);
          setPhotoAuthorLink(authorLink);

          // Small delay for smooth transition
          setTimeout(() => {
            setBackgroundUrl(targetUrl);
            setBackgroundLoading(false);
          }, 100);
        } catch (error) {
          console.warn("🖼️ Failed to preload image:", error);
          // Fallback: set background directly even if preload failed
          setBackgroundUrl(targetUrl);
          setPhotoAuthorName(authorName);
          setPhotoAuthorLink(authorLink);
          setBackgroundLoading(false);
        }
      } else if (targetUrl === backgroundUrl) {
        // Same URL, just ensure loading state is correct
        setBackgroundLoading(false);
      }
    };

    handleBackgroundUpdate();
  }, [
    currentImage,
    placeholderUrl,
    imageSource,
    uploadedImages,
    currentUploadedImageIndex,
    imageLoading,
    imageTransitioning,
    isUsingFallback,
    backgroundUrl,
  ]);

  // Handle next background URL transition
  useEffect(() => {
    if (nextBackgroundUrl && nextBackgroundUrl !== backgroundUrl) {
      const timer = setTimeout(() => {
        setBackgroundUrl(nextBackgroundUrl);
        setNextBackgroundUrl(null);
        setBackgroundLoading(false);
      }, 200);

      return () => clearTimeout(timer);
    }
  }, [nextBackgroundUrl, backgroundUrl]);

  const fetchAyah = async (surah = null, ayah = null) => {
    try {
      setLoading(true);
      const params = {
        text_edition: textEdition,
        audio_edition: audioEdition,
      };

      if (surah && ayah) {
        params.surah = surah;
        params.ayah = ayah;
      }

      const data = await fetchAyahAPI(params);
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
      const params = {
        book: book || hadithBook,
      };

      if (hadithNumber) {
        params.hadithNumber = hadithNumber;
      }

      const data = await fetchHadithAPI(params);
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
    }, 1000); // Reduced from 2000ms to 1000ms for faster completion

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

  const handleUpdateNote = (id, newNote) => {
    favorites?.updateFavoriteNote(id, newNote);
  };

  const handleDeleteFavorite = (id) => {
    favorites?.removeFavorite(id);
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
    position: "relative",
    backgroundColor: backgroundUrl ? "transparent" : "#1a1a1a",
  };

  // Get background CSS classes for smooth transitions
  const getBackgroundClasses = () => {
    const classes = ["page-load-background"];

    if (backgroundLoading) {
      classes.push("background-loading");
    } else {
      classes.push("background-ready");
    }

    if (!backgroundUrl) {
      classes.push("background-initial");
    } else {
      classes.push("background-crossfade");
    }

    return classes.join(" ");
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
      <div style={backgroundStyle} className={getBackgroundClasses()}>
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

          <Suspense fallback={<div />}>
            <FavoritesModal
              open={modalOpen}
              onClose={() => setModalOpen(false)}
              favorites={favorites?.favorites || []}
              onUpdateNote={handleUpdateNote}
              onDeleteFavorite={handleDeleteFavorite}
              onNavigateToFavorite={handleNavigateToFavorite}
            />
          </Suspense>
          <Suspense fallback={<div />}>
            <SettingsModal
              open={settingsOpen}
              onClose={() => setSettingsOpen(false)}
            />
          </Suspense>
        </Box>

        {/* Quran Search Modal */}
        {searchOpen && (
          <Suspense fallback={<div />}>
            <QuranSearch
              onSelectAyah={handleSearchSelectAyah}
              onClose={() => setSearchOpen(false)}
            />
          </Suspense>
        )}

        {/* Unsplash credit - hide when using fallback image */}
        {backgroundUrl && !isUsingFallback && photoAuthorName !== "IlmTab" && (
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
  <IndexedDBProvider>
    <App />
  </IndexedDBProvider>
);

ReactDOM.createRoot(document.getElementById("root")).render(<Root />);
