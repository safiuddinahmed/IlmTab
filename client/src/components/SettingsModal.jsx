import React from "react";
import Modal from "@mui/material/Modal";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";
import Switch from "@mui/material/Switch";
import Paper from "@mui/material/Paper";
import Avatar from "@mui/material/Avatar";
import Fade from "@mui/material/Fade";
import Slide from "@mui/material/Slide";
import {
  Close as CloseIcon,
  MenuBook as MenuBookIcon,
  AutoStories as AutoStoriesIcon,
  Schedule as ScheduleIcon,
  Wallpaper as WallpaperIcon,
  Person as PersonIcon,
  Assignment as AssignmentIcon,
  Language as LanguageIcon,
  VolumeUp as VolumeUpIcon,
  Description as DescriptionIcon,
  LocationOn as LocationOnIcon,
  Thermostat as ThermostatIcon,
  AccessTime as AccessTimeIcon,
  Refresh as RefreshIcon,
  Image as ImageIcon,
} from "@mui/icons-material";
import { tafsirsByLanguage } from "../constants/tafsirsByLanguage";
import { textEditions } from "../constants/textEditions";
import { audioEditions } from "../constants/audioEditions";
import { hadithBooks } from "../constants/hadithBooks";
import Flag from "./Flag";
import { useIndexedDBContext } from "../contexts/IndexedDBContext";
import { useRotatingImageCache } from "../hooks/useRotatingImageCache";

// Enhanced styled components
const StyledPaper = ({ children, title, icon, ...props }) => (
  <Paper
    elevation={2}
    sx={{
      p: 3,
      mb: 3,
      borderRadius: 3,
      background:
        "linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(248,250,252,0.9) 100%)",
      border: "1px solid rgba(0,0,0,0.06)",
      transition: "all 0.3s ease",
      "&:hover": {
        elevation: 4,
        transform: "translateY(-2px)",
        boxShadow: "0 8px 25px rgba(0,0,0,0.1)",
      },
    }}
    {...props}
  >
    {title && (
      <Box display="flex" alignItems="center" mb={2}>
        {icon && (
          <Avatar
            sx={{
              bgcolor: "primary.main",
              width: 32,
              height: 32,
              mr: 2,
              "& .MuiSvgIcon-root": { fontSize: 18 },
            }}
          >
            {icon}
          </Avatar>
        )}
        <Typography
          variant="h6"
          sx={{ fontWeight: 600, color: "text.primary" }}
        >
          {title}
        </Typography>
      </Box>
    )}
    {children}
  </Paper>
);

const StyledFormControl = ({ children, ...props }) => (
  <FormControl
    fullWidth
    sx={{
      mt: 2,
      "& .MuiOutlinedInput-root": {
        borderRadius: 2,
        transition: "all 0.3s ease",
        "&:hover": {
          "& .MuiOutlinedInput-notchedOutline": {
            borderColor: "primary.main",
          },
        },
        "&.Mui-focused": {
          "& .MuiOutlinedInput-notchedOutline": {
            borderWidth: 2,
          },
        },
      },
      "& .MuiInputLabel-root": {
        fontWeight: 500,
      },
    }}
    {...props}
  >
    {children}
  </FormControl>
);

const StyledTextField = ({ children, ...props }) => (
  <TextField
    fullWidth
    sx={{
      mt: 2,
      "& .MuiOutlinedInput-root": {
        borderRadius: 2,
        transition: "all 0.3s ease",
        "&:hover": {
          "& .MuiOutlinedInput-notchedOutline": {
            borderColor: "primary.main",
          },
        },
        "&.Mui-focused": {
          "& .MuiOutlinedInput-notchedOutline": {
            borderWidth: 2,
          },
        },
      },
      "& .MuiInputLabel-root": {
        fontWeight: 500,
      },
    }}
    {...props}
  >
    {children}
  </TextField>
);

const ToggleCard = ({ title, description, checked, onChange, icon }) => (
  <Paper
    elevation={1}
    sx={{
      p: 3,
      mb: 2,
      borderRadius: 3,
      background: checked
        ? "linear-gradient(135deg, rgba(25, 118, 210, 0.08) 0%, rgba(25, 118, 210, 0.04) 100%)"
        : "rgba(248, 250, 252, 0.8)",
      border: checked
        ? "2px solid rgba(25, 118, 210, 0.2)"
        : "1px solid rgba(0,0,0,0.06)",
      transition: "all 0.3s ease",
      cursor: "pointer",
      "&:hover": {
        transform: "translateY(-1px)",
        boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
      },
    }}
    onClick={() => onChange(!checked)}
  >
    <Box display="flex" justifyContent="space-between" alignItems="center">
      <Box display="flex" alignItems="center" flex={1}>
        {icon && (
          <Avatar
            sx={{
              bgcolor: checked ? "primary.main" : "grey.400",
              width: 40,
              height: 40,
              mr: 2,
              transition: "all 0.3s ease",
            }}
          >
            {icon}
          </Avatar>
        )}
        <Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5 }}>
            {title}
          </Typography>
          {description && (
            <Typography variant="body2" color="text.secondary">
              {description}
            </Typography>
          )}
        </Box>
      </Box>
      <Switch
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        color="primary"
        sx={{
          "& .MuiSwitch-thumb": {
            boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
          },
        }}
      />
    </Box>
  </Paper>
);

export default function SettingsModal({ open, onClose }) {
  // Use IndexedDB context instead of Redux
  const { settings } = useIndexedDBContext();
  const [localTabIndex, setLocalTabIndex] = React.useState(0);

  // Get fallback status from rotating image cache
  const { isUsingFallback, currentImage } = useRotatingImageCache();

  // Get values from IndexedDB settings
  const currentSettings = settings?.settings || {};

  // Ayah settings
  const ayahSettings = currentSettings.ayah || {};
  const tafsirLang = ayahSettings.tafsirLanguage || "english";
  const selectedTafsirId = ayahSettings.tafsirId || 169;
  const textEditionLanguage = ayahSettings.textEdition?.language || "en";
  const textEditionIdentifier =
    ayahSettings.textEdition?.identifier || "en.asad";
  const audioEditionIdentifier =
    ayahSettings.audioEdition?.identifier || "ar.alafasy";
  const audioEditionEnglishName =
    ayahSettings.audioEdition?.englishName || "Mishary Rashid Alafasy";

  // Weather settings
  const weatherSettings = currentSettings.weather || {};
  const weatherEnabled = weatherSettings.enabled || false;
  const customDisplayName = weatherSettings.customName || "";
  const timeFormat = weatherSettings.timeFormat || "24h";
  const tempUnit = weatherSettings.temperatureUnit || "celsius";

  // Hadith settings
  const hadithSettings = currentSettings.hadith || {};

  // Greetings settings
  const greetingsSettings = currentSettings.greetings || {};
  const greetingsEnabled = greetingsSettings.enabled || false;
  const greetingsName = greetingsSettings.name || "";

  // Tasks settings
  const tasksSettings = currentSettings.tasks || {};
  const tasksEnabled = tasksSettings.enabled || false;

  // Background settings
  const backgroundSettings = currentSettings.background || {};
  const backgroundRefreshInterval =
    backgroundSettings.refreshInterval || "newtab";
  const backgroundFallbackImageUrl = backgroundSettings.fallbackImageUrl || "";
  const backgroundImageSource = backgroundSettings.imageSource || "category";
  const backgroundIslamicCategory =
    backgroundSettings.islamicCategory || "nature";
  const backgroundUploadedImages = backgroundSettings.uploadedImages || [];
  const backgroundBlurIntensity = backgroundSettings.blurIntensity || 0;
  const backgroundOpacity = backgroundSettings.opacity || 100;

  // City search state
  const [citySearch, setCitySearch] = React.useState("");
  const [cityOptions, setCityOptions] = React.useState([]);
  const [selectedCityIndex, setSelectedCityIndex] = React.useState(0);
  const [nameError, setNameError] = React.useState("");

  // Helper function to update settings
  const updateSettings = (newSettings) => {
    settings?.updateSettings({
      ...currentSettings,
      ...newSettings,
    });
  };

  // Tafsir handlers
  const handleLangChange = (e) => {
    const lang = e.target.value;
    const firstTafsir = tafsirsByLanguage[lang]?.[0];

    updateSettings({
      ayah: {
        ...ayahSettings,
        tafsirLanguage: lang,
        tafsirId: firstTafsir ? firstTafsir.id : ayahSettings.tafsirId,
      },
    });
  };

  const handleTafsirChange = (e) => {
    updateSettings({
      ayah: {
        ...ayahSettings,
        tafsirId: e.target.value,
      },
    });
  };

  // Text edition handlers
  const handleTextEditionLanguageChange = (e) => {
    const lang = e.target.value;
    const firstEdition = textEditions[lang]?.[0];

    updateSettings({
      ayah: {
        ...ayahSettings,
        textEdition: {
          language: lang,
          identifier: firstEdition
            ? firstEdition.identifier
            : ayahSettings.textEdition?.identifier,
        },
      },
    });
  };

  const handleTextEditionChange = (e) => {
    updateSettings({
      ayah: {
        ...ayahSettings,
        textEdition: {
          ...ayahSettings.textEdition,
          identifier: e.target.value,
        },
      },
    });
  };

  // Audio edition handler
  const handleAudioEditionChange = (e) => {
    const selected = audioEditions.find((a) => a.identifier === e.target.value);
    if (selected) {
      updateSettings({
        ayah: {
          ...ayahSettings,
          audioEdition: {
            identifier: selected.identifier,
            englishName: selected.englishName,
          },
        },
      });
    }
  };

  // Weather handlers
  const handleCitySearch = async () => {
    if (!citySearch.trim()) return;
    try {
      const res = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
          citySearch
        )}&count=5`
      );
      const data = await res.json();
      setCityOptions(data.results || []);
      setSelectedCityIndex(0);
      if (data.results?.[0]) {
        updateSettings({
          weather: {
            ...weatherSettings,
            location: data.results[0],
          },
        });
        setCitySearch(`${data.results[0].name}, ${data.results[0].country}`);
      }
    } catch (err) {
      console.error("City search error:", err);
    }
  };

  // Hadith handler
  const handleHadithBookChange = (e) => {
    updateSettings({
      hadith: {
        ...hadithSettings,
        book: e.target.value,
      },
    });
  };

  // Image compression function
  const compressImage = (file, maxWidth = 1920, quality = 0.8) => {
    return new Promise((resolve) => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const img = new Image();

      img.onload = () => {
        // Calculate new dimensions
        let { width, height } = img;
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }

        // Set canvas size
        canvas.width = width;
        canvas.height = height;

        // Draw and compress
        ctx.drawImage(img, 0, 0, width, height);
        const compressedDataUrl = canvas.toDataURL("image/jpeg", quality);

        console.log(
          `Image compressed: ${file.size} bytes -> ${Math.round(
            compressedDataUrl.length * 0.75
          )} bytes`
        );
        resolve(compressedDataUrl);
      };

      img.src = URL.createObjectURL(file);
    });
  };

  // Image upload handler
  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    console.log(
      "File selected:",
      file?.name,
      "Size:",
      file?.size,
      "Current images count:",
      backgroundUploadedImages.length
    );

    if (file && backgroundUploadedImages.length < 10) {
      try {
        // Check file size (limit to 5MB original)
        if (file.size > 5 * 1024 * 1024) {
          alert("Image too large. Please select an image smaller than 5MB.");
          event.target.value = "";
          return;
        }

        console.log("Compressing image...");
        const compressedDataUrl = await compressImage(file);

        // Check if compressed image is still too large for localStorage
        const estimatedSize = compressedDataUrl.length;
        if (estimatedSize > 1024 * 1024) {
          // 1MB limit for compressed image
          alert(
            "Image is still too large after compression. Please select a smaller image."
          );
          event.target.value = "";
          return;
        }

        console.log("File compressed, adding to uploaded images");
        const newImage = {
          id: Date.now().toString(),
          url: compressedDataUrl,
          name: file.name,
        };

        updateSettings({
          background: {
            ...backgroundSettings,
            uploadedImages: [...backgroundUploadedImages, newImage],
            imageSource: "upload",
          },
        });

        // Reset the input to allow uploading the same file again
        event.target.value = "";
      } catch (error) {
        console.error("Error processing image:", error);
        alert("Error processing image. Please try a different image.");
        event.target.value = "";
      }
    } else {
      console.log(
        "Upload blocked - file:",
        !!file,
        "images count:",
        backgroundUploadedImages.length
      );
    }
  };

  // Name change handler
  const handleNameChange = (e) => {
    const input = e.target.value.trimStart();
    if (input.length > 30) {
      setNameError("Name must be under 30 characters.");
    } else if (input.trim().length > 0 && input.trim().length < 2) {
      setNameError("Name must be at least 2 characters.");
    } else {
      setNameError("");
    }

    updateSettings({
      greetings: {
        ...greetingsSettings,
        name: input,
      },
    });
  };

  console.log("currentImage: ", currentImage);

  const tabData = [
    { label: "Quran", icon: <MenuBookIcon /> },
    { label: "Hadith", icon: <AutoStoriesIcon /> },
    { label: "Background", icon: <WallpaperIcon /> },
    { label: "Time & Weather", icon: <ScheduleIcon /> },
    { label: "Greetings", icon: <PersonIcon /> },
    { label: "Tasks", icon: <AssignmentIcon /> },
  ];

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
            {/* Logo Section - Centered and Large */}
            <Box
              display="flex"
              flexDirection="column"
              alignItems="center"
              sx={{ mb: 3 }}
            >
              <Box
                component="img"
                src="/IlmTab-logo/vector/default.svg"
                alt="IlmTab Logo"
                sx={{
                  width: 200,
                  height: 200,
                  mb: 2,
                  "&:hover": {
                    transform: "scale(1.05)",
                  },
                }}
              />
            </Box>

            {/* Settings Title - Left Side with Icon */}
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              sx={{ mb: 3 }}
            >
              <Box>
                <Typography
                  variant="h5"
                  sx={{ fontWeight: 700, color: "text.primary" }}
                >
                  ⚙️ Settings
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 0.5 }}
                >
                  Customize your Islamic experience
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
              value={localTabIndex}
              onChange={(e, val) => setLocalTabIndex(val)}
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
              variant="scrollable"
              scrollButtons="auto"
            >
              {tabData.map((tab, index) => (
                <Tab
                  key={index}
                  label={tab.label}
                  icon={tab.icon}
                  iconPosition="start"
                />
              ))}
            </Tabs>
          </Box>

          {/* Content */}
          <Box sx={{ p: 3 }}>
            <Fade in={true} timeout={300}>
              <Box>
                {/* Quran Tab */}
                {localTabIndex === 0 && (
                  <Box>
                    <StyledPaper title="Text Edition" icon={<MenuBookIcon />}>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mb: 3 }}
                      >
                        Select your preferred translation and language for
                        Quranic verses.
                      </Typography>

                      <StyledFormControl>
                        <InputLabel>Translation Language</InputLabel>
                        <Select
                          value={textEditionLanguage}
                          onChange={handleTextEditionLanguageChange}
                          label="Text Language"
                        >
                          {Object.keys(textEditions).map((lang) => {
                            const languageMap = {
                              en: { flag: "gb", name: "English" },
                              fr: { flag: "fr", name: "French" },
                              es: { flag: "es", name: "Spanish" },
                              ur: { flag: "pk", name: "Urdu" },
                              id: { flag: "id", name: "Indonesian" },
                              hi: { flag: "in", name: "Hindi" },
                              ta: { flag: "in", name: "Tamil" },
                              az: { flag: "az", name: "Azerbaijani" },
                            };
                            const langInfo = languageMap[lang] || {
                              flag: null,
                              name: lang.toUpperCase(),
                            };
                            return (
                              <MenuItem key={lang} value={lang}>
                                <Box display="flex" alignItems="center" gap={1}>
                                  {langInfo.flag && (
                                    <Flag
                                      countryCode={langInfo.flag}
                                      size="small"
                                    />
                                  )}
                                  <Typography>{langInfo.name}</Typography>
                                </Box>
                              </MenuItem>
                            );
                          })}
                        </Select>
                      </StyledFormControl>

                      <StyledFormControl>
                        <InputLabel>Translation By</InputLabel>
                        <Select
                          value={textEditionIdentifier}
                          onChange={handleTextEditionChange}
                          label="Translation"
                        >
                          {(textEditions[textEditionLanguage] || []).map(
                            (edition) => (
                              <MenuItem
                                key={edition.identifier}
                                value={edition.identifier}
                              >
                                {edition.englishName}
                              </MenuItem>
                            )
                          )}
                        </Select>
                      </StyledFormControl>
                    </StyledPaper>

                    <StyledPaper
                      title="Audio Recitation"
                      icon={<VolumeUpIcon />}
                    >
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mb: 3 }}
                      >
                        Choose your favorite Qari for beautiful Quranic
                        recitations.
                      </Typography>

                      <StyledFormControl>
                        <InputLabel>Reciter (Qari)</InputLabel>
                        <Select
                          value={audioEditionIdentifier}
                          onChange={handleAudioEditionChange}
                          label="Reciter (Qari)"
                        >
                          {audioEditions.map((edition) => (
                            <MenuItem
                              key={edition.identifier}
                              value={edition.identifier}
                            >
                              {edition.englishName}
                            </MenuItem>
                          ))}
                        </Select>
                      </StyledFormControl>
                    </StyledPaper>

                    <StyledPaper
                      title="Tafsir Settings"
                      icon={<DescriptionIcon />}
                    >
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mb: 3 }}
                      >
                        Choose your preferred language and commentary for deeper
                        understanding of Quranic verses.
                      </Typography>

                      <StyledFormControl>
                        <InputLabel>Tafsir Language</InputLabel>
                        <Select
                          value={tafsirLang}
                          onChange={handleLangChange}
                          label="Tafsir Language"
                        >
                          {Object.keys(tafsirsByLanguage).map((lang) => {
                            const languageMap = {
                              english: { flag: "gb", name: "English" },
                              bengali: { flag: "bd", name: "Bengali" },
                              arabic: { flag: "sa", name: "Arabic" },
                              russian: { flag: "ru", name: "Russian" },
                              urdu: { flag: "pk", name: "Urdu" },
                              kurdish: { flag: "iq", name: "Kurdish" },
                            };
                            const langInfo = languageMap[lang] || {
                              flag: null,
                              name:
                                lang.charAt(0).toUpperCase() + lang.slice(1),
                            };
                            return (
                              <MenuItem key={lang} value={lang}>
                                <Box display="flex" alignItems="center" gap={1}>
                                  {langInfo.flag && (
                                    <Flag
                                      countryCode={langInfo.flag}
                                      size="small"
                                    />
                                  )}
                                  <Typography>{langInfo.name}</Typography>
                                </Box>
                              </MenuItem>
                            );
                          })}
                        </Select>
                      </StyledFormControl>

                      <StyledFormControl>
                        <InputLabel>Tafsir Commentary</InputLabel>
                        <Select
                          value={selectedTafsirId}
                          onChange={handleTafsirChange}
                          label="Tafsir Commentary"
                        >
                          {(tafsirsByLanguage[tafsirLang] || []).map(
                            (tafsir) => (
                              <MenuItem key={tafsir.id} value={tafsir.id}>
                                {tafsir.author_name}
                              </MenuItem>
                            )
                          )}
                        </Select>
                      </StyledFormControl>
                    </StyledPaper>
                  </Box>
                )}

                {/* Hadith Tab */}
                {localTabIndex === 1 && (
                  <Box>
                    <StyledPaper
                      title="Hadith Collection"
                      icon={<AutoStoriesIcon />}
                    >
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mb: 3 }}
                      >
                        Select your preferred Hadith collection from authentic
                        sources compiled by renowned Islamic scholars.
                      </Typography>

                      <StyledFormControl>
                        <InputLabel>Hadith Book</InputLabel>
                        <Select
                          value={hadithSettings.book || "sahih-bukhari"}
                          onChange={handleHadithBookChange}
                          label="Hadith Book"
                        >
                          {hadithBooks.map((book) => (
                            <MenuItem key={book.slug} value={book.slug}>
                              <Box>
                                <Typography
                                  variant="body1"
                                  sx={{ fontWeight: 500 }}
                                >
                                  {book.name}
                                </Typography>
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                >
                                  {book.hadithsCount.toLocaleString()} Hadiths
                                </Typography>
                              </Box>
                            </MenuItem>
                          ))}
                        </Select>
                      </StyledFormControl>

                      <StyledFormControl>
                        <InputLabel>Translation Language</InputLabel>
                        <Select
                          value={hadithSettings.translationLanguage || "en"}
                          onChange={(e) =>
                            updateSettings({
                              hadith: {
                                ...hadithSettings,
                                translationLanguage: e.target.value,
                              },
                            })
                          }
                          label="Translation Language"
                        >
                          <MenuItem value="en">
                            <Box display="flex" alignItems="center" gap={1}>
                              <Flag countryCode="gb" size="small" />
                              <Typography>English</Typography>
                            </Box>
                          </MenuItem>
                          <MenuItem value="ur">
                            <Box display="flex" alignItems="center" gap={1}>
                              <Flag countryCode="pk" size="small" />
                              <Typography>Urdu</Typography>
                            </Box>
                          </MenuItem>
                        </Select>
                      </StyledFormControl>
                    </StyledPaper>
                  </Box>
                )}

                {/* Background Tab */}
                {localTabIndex === 2 && (
                  <Box>
                    <StyledPaper title="Image Source" icon={<WallpaperIcon />}>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mb: 3 }}
                      >
                        Choose your preferred source for background images.
                        Islamic categories ensure appropriate and respectful
                        content.
                      </Typography>

                      <StyledFormControl>
                        <InputLabel>Image Source</InputLabel>
                        <Select
                          value={backgroundImageSource}
                          onChange={(e) =>
                            updateSettings({
                              background: {
                                ...backgroundSettings,
                                imageSource: e.target.value,
                              },
                            })
                          }
                          label="Image Source"
                        >
                          <MenuItem value="category">🕌 Unsplash</MenuItem>
                          <MenuItem value="upload">📁 Upload Your Own</MenuItem>
                        </Select>
                      </StyledFormControl>

                      {backgroundImageSource === "category" && (
                        <StyledFormControl>
                          <InputLabel>Islamic Category</InputLabel>
                          <Select
                            value={backgroundIslamicCategory}
                            onChange={(e) =>
                              updateSettings({
                                background: {
                                  ...backgroundSettings,
                                  islamicCategory: e.target.value,
                                },
                              })
                            }
                            label="Islamic Category"
                          >
                            <MenuItem value="nature">
                              🌿 Nature & Landscapes
                            </MenuItem>
                            <MenuItem value="architecture">
                              🕌 Islamic Architecture
                            </MenuItem>
                            <MenuItem value="calligraphy">
                              ✍️ Arabic Calligraphy
                            </MenuItem>
                            <MenuItem value="geometric">
                              🔷 Geometric Patterns
                            </MenuItem>
                          </Select>
                        </StyledFormControl>
                      )}

                      {backgroundImageSource === "upload" && (
                        <Box sx={{ mt: 2 }}>
                          <input
                            accept="image/*"
                            style={{ display: "none" }}
                            id="image-upload"
                            type="file"
                            onChange={handleImageUpload}
                          />
                          <label htmlFor="image-upload">
                            <Box
                              sx={{
                                width: "100%",
                                height: 80,
                                border: "2px dashed",
                                borderColor: "primary.main",
                                borderRadius: 2,
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                justifyContent: "center",
                                cursor: "pointer",
                                transition: "all 0.3s ease",
                                "&:hover": {
                                  bgcolor: "rgba(25, 118, 210, 0.04)",
                                  borderColor: "primary.dark",
                                },
                              }}
                            >
                              <ImageIcon
                                sx={{
                                  fontSize: 32,
                                  mb: 1,
                                  color: "primary.main",
                                }}
                              />
                              <Typography
                                variant="body2"
                                color="primary.main"
                                sx={{ fontWeight: 500 }}
                              >
                                Click to Upload Image
                              </Typography>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                {backgroundUploadedImages.length}/10 images
                                uploaded
                              </Typography>
                            </Box>
                          </label>
                          {backgroundUploadedImages.length > 0 && (
                            <Box sx={{ mt: 2 }}>
                              <Typography
                                variant="body2"
                                sx={{ mb: 2, fontWeight: 500 }}
                              >
                                📁 Uploaded Images (
                                {backgroundUploadedImages.length}/10)
                              </Typography>
                              <Box display="flex" flexWrap="wrap" gap={1}>
                                {backgroundUploadedImages.map((image) => (
                                  <Box
                                    key={image.id}
                                    sx={{
                                      position: "relative",
                                      width: 60,
                                      height: 60,
                                      borderRadius: 2,
                                      overflow: "hidden",
                                      border: "2px solid",
                                      borderColor: "primary.main",
                                    }}
                                  >
                                    <img
                                      src={image.url}
                                      alt={image.name}
                                      style={{
                                        width: "100%",
                                        height: "100%",
                                        objectFit: "cover",
                                      }}
                                    />
                                    <IconButton
                                      size="small"
                                      onClick={() => {
                                        const remainingImages =
                                          backgroundUploadedImages.filter(
                                            (img) => img.id !== image.id
                                          );

                                        // If no images remain, switch back to category mode
                                        const newSettings = {
                                          background: {
                                            ...backgroundSettings,
                                            uploadedImages: remainingImages,
                                          },
                                        };

                                        if (remainingImages.length === 0) {
                                          newSettings.background.imageSource =
                                            "category";
                                        }

                                        updateSettings(newSettings);
                                      }}
                                      sx={{
                                        position: "absolute",
                                        top: -6,
                                        right: -6,
                                        bgcolor: "error.main",
                                        color: "white",
                                        width: 24,
                                        height: 24,
                                        boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
                                        border: "1px solid white",
                                        "&:hover": {
                                          bgcolor: "error.dark",
                                          transform: "scale(1.1)",
                                          boxShadow:
                                            "0 4px 12px rgba(0,0,0,0.4)",
                                        },
                                        transition: "all 0.2s ease",
                                      }}
                                    >
                                      <CloseIcon
                                        sx={{
                                          fontSize: 14,
                                          fontWeight: "bold",
                                        }}
                                      />
                                    </IconButton>
                                  </Box>
                                ))}
                              </Box>
                              {backgroundUploadedImages.length >= 10 && (
                                <Typography
                                  variant="caption"
                                  color="warning.main"
                                  sx={{ mt: 1, display: "block" }}
                                >
                                  ⚠️ Maximum of 10 images reached
                                </Typography>
                              )}
                            </Box>
                          )}
                        </Box>
                      )}

                      <Box
                        sx={{
                          mt: 2,
                          p: 2,
                          bgcolor: "rgba(76, 175, 80, 0.04)",
                          borderRadius: 2,
                        }}
                      >
                        <Typography
                          variant="body2"
                          color="success.main"
                          sx={{ fontWeight: 500 }}
                        >
                          🛡️ Islamic categories ensure only appropriate,
                          respectful images are displayed, maintaining the
                          spiritual atmosphere of your experience.
                        </Typography>
                      </Box>
                    </StyledPaper>

                    <StyledPaper
                      title="Refresh Settings"
                      icon={<RefreshIcon />}
                    >
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mb: 3 }}
                      >
                        Configure how often the background image refreshes.
                      </Typography>

                      <StyledFormControl>
                        <InputLabel>Refresh Interval</InputLabel>
                        <Select
                          value={backgroundRefreshInterval}
                          onChange={(e) =>
                            updateSettings({
                              background: {
                                ...backgroundSettings,
                                refreshInterval: e.target.value,
                              },
                            })
                          }
                          label="Refresh Interval"
                        >
                          <MenuItem value="newtab">🔄 Every New Tab</MenuItem>
                          <MenuItem value="hourly">⏰ Every Hour</MenuItem>
                          <MenuItem value="daily">📅 Every Day</MenuItem>
                          <MenuItem value="weekly">📅 Every Week</MenuItem>
                        </Select>
                      </StyledFormControl>
                    </StyledPaper>

                    {/* Fallback Status - show only when current image is the fallback image URL */}
                    {currentImage?.url ===
                      "https://images.unsplash.com/photo-1506744038136-46273834b3fb" && (
                      <StyledPaper
                        title="Fallback Image Status"
                        icon={<ImageIcon />}
                      >
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ mb: 3 }}
                        >
                          Currently using fallback image due to no available
                          images or API issues.
                        </Typography>

                        <Box
                          sx={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            p: 2,
                            bgcolor: "rgba(255, 152, 0, 0.04)",
                            borderRadius: 2,
                            border: "1px solid rgba(255, 152, 0, 0.2)",
                          }}
                        >
                          <Box
                            component="img"
                            src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=300&q=80"
                            alt="Fallback image"
                            sx={{
                              width: 150,
                              height: 100,
                              objectFit: "cover",
                              borderRadius: 2,
                              mb: 2,
                              boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                            }}
                          />
                          <Typography
                            variant="body2"
                            color="warning.main"
                            sx={{ fontWeight: 500, textAlign: "center" }}
                          >
                            ⚠️ Fallback Image Active
                          </Typography>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ textAlign: "center", mt: 0.5 }}
                          >
                            {backgroundImageSource === "upload" &&
                            backgroundUploadedImages.length === 0
                              ? "Upload images or switch to Unsplash to use different backgrounds"
                              : "Using fallback due to API issues or no cached images"}
                          </Typography>
                        </Box>
                      </StyledPaper>
                    )}
                  </Box>
                )}

                {/* Time & Weather Tab */}
                {localTabIndex === 3 && (
                  <Box>
                    <ToggleCard
                      title="Weather & Time Display"
                      description="Show current weather conditions and time information"
                      checked={weatherEnabled}
                      onChange={(checked) =>
                        updateSettings({
                          weather: {
                            ...weatherSettings,
                            enabled: checked,
                          },
                        })
                      }
                      icon={<ScheduleIcon />}
                    />

                    {weatherEnabled && (
                      <>
                        <StyledPaper
                          title="Location Settings"
                          icon={<LocationOnIcon />}
                        >
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ mb: 3 }}
                          >
                            Set your location to get accurate weather
                            information and local time.
                          </Typography>

                          <Box display="flex" gap={2} alignItems="flex-end">
                            <StyledTextField
                              label="Search City"
                              value={citySearch}
                              onChange={(e) => setCitySearch(e.target.value)}
                              onKeyPress={(e) => {
                                if (e.key === "Enter") {
                                  handleCitySearch();
                                }
                              }}
                              placeholder="Enter city name..."
                              sx={{ flex: 1 }}
                            />
                            <IconButton
                              onClick={handleCitySearch}
                              sx={{
                                mb: 0.25,
                                bgcolor: "primary.main",
                                color: "white",
                                "&:hover": { bgcolor: "primary.dark" },
                              }}
                            >
                              <LocationOnIcon />
                            </IconButton>
                          </Box>

                          {cityOptions.length > 0 && (
                            <StyledFormControl>
                              <InputLabel>Select Location</InputLabel>
                              <Select
                                value={selectedCityIndex}
                                onChange={(e) => {
                                  const index = e.target.value;
                                  setSelectedCityIndex(index);
                                  const selectedCity = cityOptions[index];
                                  if (selectedCity) {
                                    updateSettings({
                                      weather: {
                                        ...weatherSettings,
                                        location: selectedCity,
                                      },
                                    });
                                    setCitySearch(
                                      `${selectedCity.name}, ${selectedCity.country}`
                                    );
                                  }
                                }}
                                label="Select Location"
                              >
                                {cityOptions.map((city, index) => (
                                  <MenuItem key={index} value={index}>
                                    <Box>
                                      <Typography
                                        variant="body1"
                                        sx={{ fontWeight: 500 }}
                                      >
                                        {city.name}
                                      </Typography>
                                      <Typography
                                        variant="caption"
                                        color="text.secondary"
                                      >
                                        {city.admin1 && `${city.admin1}, `}
                                        {city.country}
                                        {city.population &&
                                          ` • ${city.population.toLocaleString()} people`}
                                      </Typography>
                                    </Box>
                                  </MenuItem>
                                ))}
                              </Select>
                            </StyledFormControl>
                          )}

                          <StyledTextField
                            label="Custom Display Name"
                            value={customDisplayName}
                            onChange={(e) =>
                              updateSettings({
                                weather: {
                                  ...weatherSettings,
                                  customName: e.target.value,
                                },
                              })
                            }
                            onKeyPress={(e) => {
                              if (e.key === "Enter") {
                                e.target.blur();
                              }
                            }}
                            placeholder="Optional custom name for your location"
                            helperText="Leave empty to use the default city name"
                          />
                        </StyledPaper>

                        <StyledPaper
                          title="Display Preferences"
                          icon={<AccessTimeIcon />}
                        >
                          <StyledFormControl>
                            <InputLabel>Time Format</InputLabel>
                            <Select
                              value={timeFormat}
                              onChange={(e) =>
                                updateSettings({
                                  weather: {
                                    ...weatherSettings,
                                    timeFormat: e.target.value,
                                  },
                                })
                              }
                              label="Time Format"
                            >
                              <MenuItem value="12h">
                                🕐 12-hour (AM/PM)
                              </MenuItem>
                              <MenuItem value="24h">🕐 24-hour</MenuItem>
                            </Select>
                          </StyledFormControl>

                          <StyledFormControl>
                            <InputLabel>Temperature Unit</InputLabel>
                            <Select
                              value={tempUnit}
                              onChange={(e) =>
                                updateSettings({
                                  weather: {
                                    ...weatherSettings,
                                    temperatureUnit: e.target.value,
                                  },
                                })
                              }
                              label="Temperature Unit"
                            >
                              <MenuItem value="celsius">
                                🌡️ Celsius (°C)
                              </MenuItem>
                              <MenuItem value="fahrenheit">
                                🌡️ Fahrenheit (°F)
                              </MenuItem>
                            </Select>
                          </StyledFormControl>
                        </StyledPaper>
                      </>
                    )}
                  </Box>
                )}

                {/* Greetings Tab */}
                {localTabIndex === 4 && (
                  <Box>
                    <ToggleCard
                      title="Personal Greetings"
                      description="Display personalized Islamic greetings with your name"
                      checked={greetingsEnabled}
                      onChange={(checked) =>
                        updateSettings({
                          greetings: {
                            ...greetingsSettings,
                            enabled: checked,
                          },
                        })
                      }
                      icon={<PersonIcon />}
                    />

                    {greetingsEnabled && (
                      <StyledPaper
                        title="Greeting Settings"
                        icon={<PersonIcon />}
                      >
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ mb: 3 }}
                        >
                          Personalize your experience with Islamic greetings
                          that change based on the time of day.
                        </Typography>

                        <StyledTextField
                          label="Your Name"
                          value={greetingsName}
                          onChange={handleNameChange}
                          onKeyPress={(e) => {
                            if (e.key === "Enter") {
                              e.target.blur();
                            }
                          }}
                          placeholder="Enter your name"
                          error={!!nameError}
                          helperText={
                            nameError ||
                            "This will be used in your personalized greetings"
                          }
                        />

                        <Box
                          sx={{
                            mt: 3,
                            p: 2,
                            bgcolor: "rgba(76, 175, 80, 0.04)",
                            borderRadius: 2,
                          }}
                        >
                          <Typography
                            variant="body2"
                            color="success.main"
                            sx={{ fontWeight: 500 }}
                          >
                            🌅 Preview: "Assalamu Alaikum,{" "}
                            {greetingsName || "Ahmad"}! May your morning be
                            blessed."
                          </Typography>
                        </Box>
                      </StyledPaper>
                    )}
                  </Box>
                )}

                {/* Tasks Tab */}
                {localTabIndex === 5 && (
                  <Box>
                    <ToggleCard
                      title="Task Management"
                      description="Enable the todo list to organize your daily tasks and goals"
                      checked={tasksEnabled}
                      onChange={(checked) =>
                        updateSettings({
                          tasks: {
                            ...tasksSettings,
                            enabled: checked,
                          },
                        })
                      }
                      icon={<AssignmentIcon />}
                    />

                    {tasksEnabled && (
                      <StyledPaper
                        title="Task Features"
                        icon={<AssignmentIcon />}
                      >
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ mb: 3 }}
                        >
                          The task management system helps you organize your
                          daily activities and spiritual goals.
                        </Typography>

                        <Box
                          sx={{
                            mt: 2,
                            p: 2,
                            bgcolor: "rgba(76, 175, 80, 0.04)",
                            borderRadius: 2,
                          }}
                        >
                          <Typography
                            variant="body2"
                            color="success.main"
                            sx={{ fontWeight: 500 }}
                          >
                            ✅ Features: Add tasks, mark as complete, organize
                            by priority, and track your daily progress.
                          </Typography>
                        </Box>
                      </StyledPaper>
                    )}
                  </Box>
                )}
              </Box>
            </Fade>
          </Box>
        </Box>
      </Slide>
    </Modal>
  );
}
