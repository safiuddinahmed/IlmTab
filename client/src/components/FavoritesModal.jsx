import React, { useState } from "react";
import {
  Modal,
  Box,
  Tabs,
  Tab,
  Typography,
  IconButton,
  Divider,
  TextField,
  Tooltip,
  Paper,
  Slide,
} from "@mui/material";
import {
  Close as CloseIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
} from "@mui/icons-material";
import { transliteratedSurahNames } from "../constants/surahNames";

function TabPanel({ children, value, index }) {
  return value === index ? <Box sx={{ pt: 3 }}>{children}</Box> : null;
}

export default function FavoritesModal({
  open,
  onClose,
  favorites,
  onUpdateNote,
  onDeleteFavorite,
  onNavigateToFavorite,
}) {
  const [tabIndex, setTabIndex] = useState(0);
  const [expandedItems, setExpandedItems] = useState({});
  const [editingNotes, setEditingNotes] = useState({});
  const [noteDrafts, setNoteDrafts] = useState({});

  const ayahFavorites = favorites.filter((f) => f.type === "ayah");
  const hadithFavorites = favorites.filter((f) => f.type === "hadith");

  const handleChangeTab = (_, newValue) => setTabIndex(newValue);

  const toggleExpand = (id) =>
    setExpandedItems((prev) => ({ ...prev, [id]: !prev[id] }));

  const toggleEdit = (id, note) => {
    setEditingNotes((prev) => ({ ...prev, [id]: !prev[id] }));
    setNoteDrafts((prev) => ({ ...prev, [id]: note }));
  };

  const handleNoteChange = (id, newNote) => {
    setNoteDrafts((prev) => ({ ...prev, [id]: newNote }));
  };

  const handleNoteSave = (id) => {
    const note = noteDrafts[id];
    if (onUpdateNote && note !== undefined) {
      onUpdateNote(id, note);
      setEditingNotes((prev) => ({ ...prev, [id]: false }));
    }
  };

  const handleDelete = (id) => {
    if (onDeleteFavorite) onDeleteFavorite(id);
  };

  const handleItemClick = (item) => {
    if (onNavigateToFavorite) {
      onNavigateToFavorite(item);
      onClose();
    }
  };

  const renderFavoriteItem = (item) => {
    const { id, text, note, type, englishText } = item;
    const isExpanded = expandedItems[id];
    const isEditing = editingNotes[id];

    // Get the appropriate text based on item type
    const itemText = type === "hadith" ? englishText : text;
    const isLongText = itemText && itemText.length > 200;
    const displayText =
      isExpanded || !isLongText ? itemText : itemText?.slice(0, 200) + "…";

    // Create title based on type
    let title = "";
    if (type === "ayah") {
      // Use stored surah name if available, otherwise fall back to shared constants
      const englishName =
        item.surahName ||
        transliteratedSurahNames[item.surahNumber] ||
        "Unknown";
      const arabicName = item.surahArabicName || "";

      title = `Surah ${item.surahNumber}: ${englishName} (${arabicName}) - Ayah ${item.ayahNumber}`;
    } else {
      // Use bookDisplayName for display, fallback to book if not available
      const displayName = item.bookDisplayName || item.book;
      title = `${displayName}, Hadith ${item.hadithNumber}`;
    }

    return (
      <Paper
        key={id}
        elevation={1}
        sx={{
          p: 2,
          mb: 2,
          borderRadius: 2,
          cursor: "pointer",
          transition: "all 0.3s ease",
          border: "1px solid transparent",
          "&:hover": {
            elevation: 4,
            transform: "translateY(-3px)",
            backgroundColor: "rgba(25, 118, 210, 0.04)",
            borderColor: "rgba(25, 118, 210, 0.2)",
            boxShadow: "0 8px 25px rgba(25, 118, 210, 0.15)",
          },
        }}
        onClick={() => handleItemClick(item)}
      >
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="subtitle2" fontWeight="600">
            {title}
          </Typography>
          <Box onClick={(e) => e.stopPropagation()}>
            <IconButton onClick={() => handleDelete(id)} size="small">
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Box>
        </Box>

        <Typography
          sx={{
            fontStyle: "italic",
            mt: 1,
            fontSize: "0.9rem",
            color: "text.secondary",
          }}
        >
          {displayText}
        </Typography>

        {isLongText && (
          <Box onClick={(e) => e.stopPropagation()}>
            <IconButton onClick={() => toggleExpand(id)} size="small">
              {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              <Typography variant="caption" sx={{ ml: 0.5 }}>
                {isExpanded ? "Show Less" : "Show More"}
              </Typography>
            </IconButton>
          </Box>
        )}

        <Box sx={{ mt: 1 }}>
          {isEditing ? (
            <Box onClick={(e) => e.stopPropagation()}>
              <TextField
                label="Personal Notes"
                variant="outlined"
                fullWidth
                multiline
                minRows={2}
                maxRows={4}
                value={noteDrafts[id] || ""}
                onChange={(e) => handleNoteChange(id, e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleNoteSave(id);
                  }
                }}
                sx={{ fontSize: "0.8rem" }}
              />
              <Box display="flex" justifyContent="flex-end" gap={1} mt={1}>
                <IconButton
                  onClick={() => toggleEdit(id, note)}
                  size="small"
                  sx={{ color: "text.secondary" }}
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
                <IconButton
                  onClick={() => handleNoteSave(id)}
                  size="small"
                  sx={{ color: "text.secondary" }}
                >
                  <SaveIcon fontSize="small" />
                </IconButton>
              </Box>
            </Box>
          ) : (
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="flex-start"
              sx={{
                bgcolor: note ? "rgba(76, 175, 80, 0.04)" : "rgba(0,0,0,0.02)",
                borderRadius: 1,
                p: 1,
                border: note
                  ? "1px solid rgba(76, 175, 80, 0.2)"
                  : "1px solid rgba(0,0,0,0.04)",
              }}
            >
              <Typography
                sx={{
                  fontSize: "0.8rem",
                  color: note ? "text.primary" : "text.secondary",
                  fontStyle: note ? "normal" : "italic",
                  whiteSpace: "pre-line",
                  flex: 1,
                }}
              >
                {note || "No personal notes added yet."}
              </Typography>
              <IconButton
                onClick={(e) => {
                  e.stopPropagation();
                  toggleEdit(id, note);
                }}
                size="small"
              >
                <EditIcon fontSize="small" />
              </IconButton>
            </Box>
          )}
        </Box>
      </Paper>
    );
  };

  const EmptyState = ({ type }) => (
    <Box
      textAlign="center"
      py={4}
      sx={{
        bgcolor: "rgba(0,0,0,0.02)",
        borderRadius: 2,
        border: "2px dashed rgba(0,0,0,0.1)",
      }}
    >
      <Typography variant="h6" sx={{ mb: 1, color: "text.secondary" }}>
        No {type === "ayah" ? "Ayahs" : "Hadiths"} Saved
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Start adding {type === "ayah" ? "verses" : "hadiths"} to your favorites
        by clicking the heart icon
      </Typography>
    </Box>
  );

  return (
    <Modal open={open} onClose={onClose} closeAfterTransition>
      <Slide direction="right" in={open} mountOnEnter unmountOnExit>
        <Box
          sx={{
            width: {
              xs: "100vw", // Full width on mobile
              sm: "70vw", // 70% width on small tablets
              md: "50vw", // 50% width on medium screens
              lg: "35vw", // 35% width on large screens
              xl: "25vw", // 25% width on extra large screens
            },
            maxWidth: "480px", // Maximum width cap
            minWidth: "320px", // Minimum width for usability
            height: "100vh",
            overflowY: "auto",
            bgcolor: "rgba(255, 255, 255, 0.98)",
            backdropFilter: "blur(20px)",
            borderRadius: {
              xs: 0, // No border radius on mobile (full width)
              sm: "0 20px 20px 0", // Border radius on larger screens
            },
            boxShadow: "0 25px 50px rgba(0, 0, 0, 0.15)",
            position: "fixed",
            top: 0,
            left: 0,
            border: "1px solid rgba(255, 255, 255, 0.2)",
          }}
        >
          {/* Header */}
          <Box
            sx={{
              position: "sticky",
              top: 0,
              zIndex: 10,
              bgcolor: "rgba(255, 255, 255, 0.95)",
              backdropFilter: "blur(20px)",
              borderBottom: "1px solid rgba(0, 0, 0, 0.06)",
              p: 3,
            }}
          >
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
            >
              <Box>
                <Typography
                  variant="h5"
                  sx={{ fontWeight: 700, color: "text.primary" }}
                >
                  ❤️ Favorites
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 0.5 }}
                >
                  Your saved verses and hadiths
                </Typography>
              </Box>
              <IconButton
                onClick={onClose}
                sx={{
                  bgcolor: "rgba(0, 0, 0, 0.04)",
                  "&:hover": { bgcolor: "rgba(0, 0, 0, 0.08)" },
                }}
              >
                <CloseIcon />
              </IconButton>
            </Box>

            <Tabs
              value={tabIndex}
              onChange={handleChangeTab}
              sx={{
                mt: 3,
                "& .MuiTab-root": {
                  minHeight: 48,
                  textTransform: "none",
                  fontWeight: 600,
                  fontSize: "0.875rem",
                  "&.Mui-selected": {
                    color: "primary.main",
                  },
                },
                "& .MuiTabs-indicator": {
                  height: 3,
                  borderRadius: "3px 3px 0 0",
                },
              }}
            >
              <Tab label={`Ayahs (${ayahFavorites.length})`} />
              <Tab label={`Hadiths (${hadithFavorites.length})`} />
            </Tabs>
          </Box>

          {/* Content */}
          <Box sx={{ p: 3 }}>
            <TabPanel value={tabIndex} index={0}>
              {ayahFavorites.length === 0 ? (
                <EmptyState type="ayah" />
              ) : (
                ayahFavorites.map((item) => renderFavoriteItem(item))
              )}
            </TabPanel>

            <TabPanel value={tabIndex} index={1}>
              {hadithFavorites.length === 0 ? (
                <EmptyState type="hadith" />
              ) : (
                hadithFavorites.map((item) => renderFavoriteItem(item))
              )}
            </TabPanel>
          </Box>
        </Box>
      </Slide>
    </Modal>
  );
}
