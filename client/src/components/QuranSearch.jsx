import React, { useState } from "react";
import {
  Box,
  TextField,
  IconButton,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  Chip,
  CircularProgress,
  Alert,
  InputAdornment,
  Collapse,
  Divider,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
  Modal,
  Slide,
} from "@mui/material";
import {
  Search as SearchIcon,
  Close as CloseIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  MenuBook as MenuBookIcon,
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
} from "@mui/icons-material";
import { useSelector, useDispatch } from "react-redux";
import { addFavorite, removeFavorite } from "../redux/favoritesSlice";
import { setSearchTranslationEdition } from "../redux/settingsSlice";
import QuranSearchSkeleton from "./skeletons/QuranSearchSkeleton";
import axios from "axios";

const QuranSearch = ({ onSelectAyah, onClose }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [expanded, setExpanded] = useState(true);
  const [resultCount, setResultCount] = useState(0);
  const [hasSearched, setHasSearched] = useState(false);

  const dispatch = useDispatch();

  // Get search translation edition from Redux
  const searchTranslationEdition = useSelector(
    (state) => state.settings.search.translationEdition
  );

  // Get favorites from Redux
  const favorites = useSelector((state) => state.favorites.items);

  // Available English editions for search
  const availableEditions = [
    { identifier: "en.asad", name: "Muhammad Asad" },
    { identifier: "en.yusufali", name: "Yusuf Ali" },
    { identifier: "en.pickthall", name: "Pickthall" },
    { identifier: "en.sahih", name: "Saheeh International" },
  ];

  // Current selected edition from Redux (persisted)
  const selectedEdition = searchTranslationEdition;

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    setError(null);
    setHasSearched(true);

    try {
      // Using the AlQuran.cloud API search endpoint
      const response = await axios.get(
        `https://api.alquran.cloud/v1/search/${encodeURIComponent(
          searchQuery
        )}/all/${selectedEdition}`
      );

      if (response.data && response.data.data && response.data.data.matches) {
        const formattedResults = response.data.data.matches.map((match) => {
          return {
            surahNumber: match.surah.number,
            ayahNumber: match.numberInSurah,
            verseKey: `${match.surah.number}:${match.numberInSurah}`,
            arabicText: match.text, // This will be the translation text from AlQuran.cloud
            translation: match.text,
            highlighted: highlightSearchTerm(match.text, searchQuery),
            surahName: match.surah.englishName,
            surahArabicName: match.surah.name,
          };
        });

        setSearchResults(formattedResults);
        setResultCount(response.data.data.count || formattedResults.length);
      } else {
        setSearchResults([]);
        setResultCount(0);
      }
    } catch (err) {
      console.error("Search error:", err);

      // Check if it's a 404 (no results found) vs actual error
      if (err.response && err.response.status === 404) {
        // 404 means no results found, not an error
        setSearchResults([]);
        setResultCount(0);
        setError(null);
      } else {
        // Actual error occurred
        setError("Failed to search. Please try again.");
        setSearchResults([]);
        setResultCount(0);
      }
    } finally {
      setLoading(false);
    }
  };

  // Highlight search terms in the text
  const highlightSearchTerm = (text, searchTerm) => {
    if (!text || !searchTerm) return text;

    const regex = new RegExp(
      `(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`,
      "gi"
    );
    return text.replace(
      regex,
      '<mark style="background-color: #ffeb3b; padding: 1px 2px; border-radius: 2px;">$1</mark>'
    );
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleSelectResult = (result) => {
    // Call the parent function to navigate to this ayah
    onSelectAyah(result.surahNumber, result.ayahNumber);
    onClose();
  };

  // Check if an ayah is favorited
  const isFavorited = (surahNumber, ayahNumber) => {
    const favoriteId = `ayah-${surahNumber}-${ayahNumber}`;
    return favorites.some((fav) => fav.id === favoriteId);
  };

  // Toggle favorite status
  const toggleFavorite = (result, event) => {
    event.stopPropagation(); // Prevent triggering the list item click

    const favoriteId = `ayah-${result.surahNumber}-${result.ayahNumber}`;

    if (isFavorited(result.surahNumber, result.ayahNumber)) {
      dispatch(removeFavorite(favoriteId));
    } else {
      // Create favorite object to store
      const favoriteObject = {
        id: favoriteId,
        type: "ayah",
        surahNumber: result.surahNumber,
        ayahNumber: result.ayahNumber,
        text: result.translation,
        audio: "", // We don't have audio URL in search results
        note: "",
        surahName: result.surahName,
        surahArabicName: result.surahArabicName,
      };
      dispatch(addFavorite(favoriteObject));
    }
  };

  return (
    <Modal open={true} onClose={onClose} closeAfterTransition>
      <Box
        className="modal-enter"
        sx={{
          position: "fixed",
          top: 20,
          right: 20,
          width: { xs: "90vw", sm: "400px", md: "450px" },
          maxHeight: "80vh",
          overflowY: "auto",
          bgcolor: "rgba(255, 255, 255, 0.98)",
          backdropFilter: "blur(20px)",
          borderRadius: 3,
          boxShadow: "0 25px 50px rgba(0, 0, 0, 0.15)",
          border: "1px solid rgba(255, 255, 255, 0.2)",
        }}
      >
        {/* Header */}
        <Box
          sx={{
            p: 2,
            backgroundColor: "primary.main",
            color: "white",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Box display="flex" alignItems="center" gap={1}>
            <MenuBookIcon />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Search Quran
            </Typography>
          </Box>
          <Box display="flex" alignItems="center" gap={1}>
            <IconButton
              size="small"
              onClick={() => setExpanded(!expanded)}
              sx={{ color: "white" }}
            >
              {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </IconButton>
            <IconButton size="small" onClick={onClose} sx={{ color: "white" }}>
              <CloseIcon />
            </IconButton>
          </Box>
        </Box>

        <Collapse in={expanded}>
          {/* Search Input */}
          <Box sx={{ p: 2 }}>
            <TextField
              fullWidth
              placeholder="Search for keywords in the Quran..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={handleSearch} disabled={loading}>
                      {loading ? (
                        <CircularProgress size={20} />
                      ) : (
                        <SearchIcon />
                      )}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                },
                mb: 2,
              }}
            />

            {/* Translation Dropdown */}
            <FormControl fullWidth size="small" sx={{ mb: 2 }}>
              <InputLabel>Translation</InputLabel>
              <Select
                value={selectedEdition}
                label="Translation"
                onChange={(e) =>
                  dispatch(setSearchTranslationEdition(e.target.value))
                }
                sx={{ borderRadius: 2 }}
                MenuProps={{
                  PaperProps: {
                    sx: {
                      zIndex: 3000, // Ensure it's higher than Modal's z-index
                    },
                  },
                }}
              >
                {availableEditions.map((edition) => (
                  <MenuItem key={edition.identifier} value={edition.identifier}>
                    {edition.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Result Count */}
            {searchQuery && !loading && hasSearched && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Typography variant="caption" color="text.secondary">
                  {resultCount > 0
                    ? `${resultCount} result${
                        resultCount !== 1 ? "s" : ""
                      } found`
                    : "No results found"}
                </Typography>
              </Box>
            )}
          </Box>

          {/* Error Display */}
          {error && (
            <Box sx={{ px: 2, pb: 2 }}>
              <Alert severity="error" sx={{ borderRadius: 2 }}>
                {error}
              </Alert>
            </Box>
          )}

          {/* Search Results or Skeleton */}
          {loading && hasSearched ? (
            <QuranSearchSkeleton />
          ) : searchResults.length > 0 ? (
            <Box sx={{ maxHeight: "50vh", overflow: "auto" }}>
              <Divider />
              <List sx={{ p: 0 }}>
                {searchResults.map((result, index) => (
                  <ListItem
                    key={result.verseKey}
                    button
                    className="stagger-item smooth-hover"
                    onClick={() => handleSelectResult(result)}
                    sx={{
                      borderBottom:
                        index < searchResults.length - 1
                          ? "1px solid rgba(0,0,0,0.06)"
                          : "none",
                      "&:hover": {
                        backgroundColor: "rgba(25, 118, 210, 0.04)",
                      },
                    }}
                  >
                    <ListItemText
                      primary={
                        <Box>
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "flex-start",
                              mb: 0.5,
                            }}
                          >
                            <Typography
                              variant="subtitle2"
                              sx={{
                                fontWeight: 600,
                                color: "primary.main",
                                flex: 1,
                              }}
                            >
                              Surah {result.surahNumber}: {result.surahName} (
                              {result.surahArabicName}) - Ayah{" "}
                              {result.ayahNumber}
                            </Typography>
                            <IconButton
                              size="small"
                              onClick={(e) => toggleFavorite(result, e)}
                              sx={{
                                ml: 1,
                                color: isFavorited(
                                  result.surahNumber,
                                  result.ayahNumber
                                )
                                  ? "red"
                                  : "text.secondary",
                                "&:hover": {
                                  color: "red",
                                },
                              }}
                            >
                              {isFavorited(
                                result.surahNumber,
                                result.ayahNumber
                              ) ? (
                                <FavoriteIcon fontSize="small" />
                              ) : (
                                <FavoriteBorderIcon fontSize="small" />
                              )}
                            </IconButton>
                          </Box>
                          <Typography
                            variant="body2"
                            sx={{
                              lineHeight: 1.4,
                              "& mark": {
                                backgroundColor: "#ffeb3b",
                                padding: "1px 2px",
                                borderRadius: "2px",
                              },
                            }}
                            dangerouslySetInnerHTML={{
                              __html: result.highlighted,
                            }}
                          />
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </Box>
          ) : null}

          {/* No Results */}
          {!loading &&
            searchQuery &&
            searchResults.length === 0 &&
            !error &&
            hasSearched && (
              <Box sx={{ p: 3, textAlign: "center" }}>
                <Typography variant="body2" color="text.secondary">
                  No results found for "{searchQuery}"
                </Typography>
              </Box>
            )}

          {/* Instructions */}
          {!searchQuery && (
            <Box sx={{ p: 3, textAlign: "center" }}>
              <Typography variant="body2" color="text.secondary">
                Enter keywords to search through the Quran
              </Typography>
            </Box>
          )}
        </Collapse>
      </Box>
    </Modal>
  );
};

export default QuranSearch;
