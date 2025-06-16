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
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";

function TabPanel({ children, value, index }) {
  return value === index ? <Box sx={{ pt: 2 }}>{children}</Box> : null;
}

export default function FavoritesModal({
  open,
  onClose,
  favorites,
  onUpdateNote,
  onDeleteFavorite,
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

  const renderFavoriteItem = ({ id, title, text, note }) => {
    const isExpanded = expandedItems[id];
    const isEditing = editingNotes[id];
    const isLongText = text.length > 200;
    const displayText =
      isExpanded || !isLongText ? text : text.slice(0, 200) + "…";

    return (
      <Box key={id} sx={{ mb: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography fontWeight="bold">{title}</Typography>
          <IconButton onClick={() => handleDelete(id)} size="small">
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Box>

        <Typography sx={{ fontStyle: "italic", mt: 1 }}>
          {displayText}
        </Typography>

        {isLongText && (
          <IconButton onClick={() => toggleExpand(id)} size="small">
            {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
        )}

        <Box sx={{ mt: 1 }}>
          {isEditing ? (
            <>
              <TextField
                label="Notes"
                variant="outlined"
                fullWidth
                multiline
                minRows={2}
                value={noteDrafts[id] || ""}
                onChange={(e) => handleNoteChange(id, e.target.value)}
              />
              <Box textAlign="right" mt={1}>
                <Tooltip title="Save">
                  <IconButton onClick={() => handleNoteSave(id)} size="small">
                    <SaveIcon />
                  </IconButton>
                </Tooltip>
              </Box>
            </>
          ) : (
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
            >
              <Typography
                sx={{
                  fontSize: "0.9rem",
                  color: "text.secondary",
                  whiteSpace: "pre-line",
                }}
              >
                {note || <i>No notes added.</i>}
              </Typography>
              <Tooltip title="Edit">
                <IconButton onClick={() => toggleEdit(id, note)} size="small">
                  <EditIcon />
                </IconButton>
              </Tooltip>
            </Box>
          )}
        </Box>

        <Divider sx={{ mt: 2 }} />
      </Box>
    );
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          position: "fixed",
          bottom: 70, // adjust based on your bottom-left buttons' height
          left: 0,
          bgcolor: "background.paper",
          boxShadow: 24,
          borderRadius: 2,
          width: {
            xs: "90vw",
            sm: 400,
          },
          maxHeight: "70vh",
          overflowY: "auto",
          p: 3,
          zIndex: 1300,
        }}
      >
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Favorites</Typography>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>

        <Tabs value={tabIndex} onChange={handleChangeTab} sx={{ mt: 2 }}>
          <Tab label={`Ayahs (${ayahFavorites.length})`} />
          <Tab label={`Hadiths (${hadithFavorites.length})`} />
        </Tabs>

        <TabPanel value={tabIndex} index={0}>
          {ayahFavorites.length === 0 ? (
            <Typography>No favorite Ayahs yet.</Typography>
          ) : (
            ayahFavorites.map((item) =>
              renderFavoriteItem({
                id: item.id,
                title: `Surah ${item.surahNumber} : Ayah ${item.ayahNumber}`,
                text: item.text,
                note: item.note,
              })
            )
          )}
        </TabPanel>

        <TabPanel value={tabIndex} index={1}>
          {hadithFavorites.length === 0 ? (
            <Typography>No favorite Hadiths yet.</Typography>
          ) : (
            hadithFavorites.map((item) =>
              renderFavoriteItem({
                id: item.id,
                title: `${item.book} : Hadith ${item.hadithNumber}`,
                text: item.englishText,
                note: item.note,
              })
            )
          )}
        </TabPanel>
      </Box>
    </Modal>
  );
}
