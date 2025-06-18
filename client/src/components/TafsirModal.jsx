import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  CircularProgress,
  Typography,
  IconButton,
  Box,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useIndexedDBContext } from "../contexts/IndexedDBContext";
import { tafsirsByLanguage } from "../constants/tafsirsByLanguage";
import TafsirModalSkeleton from "./skeletons/TafsirModalSkeleton";

const TafsirModal = ({ open, onClose, surah, ayah }) => {
  // Use IndexedDB context instead of Redux
  const { settings } = useIndexedDBContext();

  // Get tafsir settings from IndexedDB
  const ayahSettings = settings?.settings?.ayah || {};
  const tafsirId = ayahSettings.tafsirId || 169;
  const tafsirLanguage = ayahSettings.tafsirLanguage || "english";

  const [loading, setLoading] = useState(true);
  const [tafsir, setTafsir] = useState(null);
  const [error, setError] = useState(null);

  const tafsirMeta = tafsirsByLanguage[tafsirLanguage]?.find(
    (t) => t.id === tafsirId
  ) || {
    name: "Unknown Tafsir",
    author_name: "",
  };

  useEffect(() => {
    if (!open) return;

    setLoading(true);
    setError(null);
    fetch(
      `http://localhost:4000/api/tafsir?tafsirId=${tafsirId}&surah=${surah}&ayah=${ayah}`
    )
      .then((res) => res.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setTafsir(data);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [open, surah, ayah, tafsirId]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        className: "modal-enter",
      }}
    >
      <DialogTitle>
        Tafsir
        <IconButton
          onClick={onClose}
          sx={{ position: "absolute", right: 16, top: 16 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <Box mb={2}>
          <Typography variant="subtitle1" fontWeight="bold">
            {tafsirMeta.name}
          </Typography>
          <Typography variant="subtitle2" color="text.secondary">
            {tafsirMeta.author_name}
          </Typography>
        </Box>

        {loading ? (
          <TafsirModalSkeleton />
        ) : error ? (
          <Typography color="error">{error}</Typography>
        ) : tafsir ? (
          <div className="animate-fade-in">
            <div
              dangerouslySetInnerHTML={{ __html: tafsir.tafsir }}
              style={{ lineHeight: 1.6 }}
            />
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
};

export default TafsirModal;
