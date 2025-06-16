import React from "react";
import {
  Modal,
  Box,
  Typography,
  IconButton,
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  FormControlLabel,
  Switch,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { tafsirsByLanguage } from "../constants/tafsirsByLanguage";
import { textEditions } from "../constants/textEditions";
import { audioEditions } from "../constants/audioEditions";
import { hadithBooks } from "../constants/hadithBooks";
import { useSelector, useDispatch } from "react-redux";
import {
  setTafsirLanguage,
  setTafsirId,
  setTextEditionLanguage,
  setTextEditionIdentifier,
  setAudioEdition,
  setWeatherEnabled,
  setLocation,
  setCustomLocationName,
  setTimeFormat,
  setTemperatureUnit,
  setHadithBook,
  setHadithTranslationLanguage,
  setGreetingsEnabled,
  setName,
  setTasksEnabled,
} from "../redux/settingsSlice";

export default function SettingsModal({ open, onClose }) {
  const dispatch = useDispatch();
  const [localTabIndex, setLocalTabIndex] = React.useState(0);

  // Get values from the Redux state
  const tafsirLang = useSelector((state) => state.settings.ayah.tafsirLanguage);
  const selectedTafsirId = useSelector((state) => state.settings.ayah.tafsirId);
  const textEditionLanguage = useSelector(
    (state) => state.settings.ayah.textEdition.language
  );
  const textEditionIdentifier = useSelector(
    (state) => state.settings.ayah.textEdition.identifier
  );

  const audioEditionIdentifier = useSelector(
    (state) => state.settings.ayah.audioEdition.identifier
  );
  const audioEditionEnglishName = useSelector(
    (state) => state.settings.ayah.audioEdition.englishName
  );

  const handleLangChange = (e) => {
    const lang = e.target.value;
    dispatch(setTafsirLanguage(lang));

    const firstTafsir = tafsirsByLanguage[lang]?.[0];
    if (firstTafsir) {
      dispatch(setTafsirId(firstTafsir.id));
    }
  };

  const handleTafsirChange = (e) => {
    dispatch(setTafsirId(e.target.value));
  };

  const handleTextEditionLanguageChange = (e) => {
    const lang = e.target.value;
    dispatch(setTextEditionLanguage(lang));

    const firstEdition = textEditions[lang]?.[0];
    if (firstEdition) {
      dispatch(setTextEditionIdentifier(firstEdition.identifier));
    }
  };

  const handleTextEditionChange = (e) => {
    dispatch(setTextEditionIdentifier(e.target.value));
  };

  const handleAudioEditionChange = (e) => {
    const selected = audioEditions.find((a) => a.identifier === e.target.value);
    if (selected) {
      dispatch(
        setAudioEdition({
          identifier: selected.identifier,
          englishName: selected.englishName,
        })
      );
    }
  };

  const weatherEnabled = useSelector((state) => state.settings.weather.enabled);
  const [citySearch, setCitySearch] = React.useState("");
  const [cityOptions, setCityOptions] = React.useState([]);
  const [selectedCityIndex, setSelectedCityIndex] = React.useState(0);

  const customDisplayName = useSelector(
    (state) => state.settings.weather.customName
  );
  const timeFormat = useSelector((state) => state.settings.weather.timeFormat);
  const tempUnit = useSelector(
    (state) => state.settings.weather.temperatureUnit
  );

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
        dispatch(setLocation(data.results[0]));
      }
    } catch (err) {
      console.error("City search error:", err);
    }
  };

  const hadithSettings = useSelector((state) => state.settings.hadith);

  const handleHadithBookChange = (e) => {
    dispatch(setHadithBook(e.target.value));
  };

  const greetingsEnabled = useSelector(
    (state) => state.settings.greetings.enabled
  );
  const greetingsName = useSelector((state) => state.settings.greetings.name);

  const tasksEnabled = useSelector((state) => state.settings.tasks.enabled);

  const [nameError, setNameError] = React.useState("");

  const handleNameChange = (e) => {
    const input = e.target.value.trimStart(); // allow user to type naturally but trim start
    if (input.length > 30) {
      setNameError("Name must be under 30 characters.");
    } else if (input.trim().length > 0 && input.trim().length < 2) {
      setNameError("Name must be at least 2 characters.");
    } else {
      setNameError("");
    }

    dispatch(setName(input));
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          width: 500,
          height: "calc(100vh - 80px)",
          overflowY: "auto",
          bgcolor: "background.paper",
          p: 3,
          borderRadius: "0 8px 8px 0",
          boxShadow: 24,
          position: "fixed",
          top: 0,
          left: 0,
        }}
      >
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Settings</Typography>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>

        <Tabs
          value={localTabIndex}
          onChange={(e, val) => setLocalTabIndex(val)}
          sx={{ mt: 2 }}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="Ayah" />
          <Tab label="Hadith" />
          <Tab label="Time and Weather" />
          <Tab label="Greetings" />
          <Tab label="Tasks" />
        </Tabs>

        {localTabIndex === 0 && (
          <Box mt={3}>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
              Configure Quranic verse settings including translation, audio
              recitation, and tafsir (commentary) preferences. These settings
              control how verses are displayed and played throughout the
              application.
            </Typography>

            <Typography variant="subtitle1" gutterBottom>
              Translation Settings
            </Typography>

            <FormControl fullWidth sx={{ mt: 2 }}>
              <InputLabel>Language</InputLabel>
              <Select
                value={textEditionLanguage || ""}
                onChange={handleTextEditionLanguageChange}
                label="Language"
              >
                {Object.keys(textEditions).map((lang) => (
                  <MenuItem key={lang} value={lang}>
                    {lang.toUpperCase()}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth sx={{ mt: 2 }}>
              <InputLabel>Translation</InputLabel>
              <Select
                value={textEditionIdentifier || ""}
                onChange={handleTextEditionChange}
                label="Translation"
              >
                {textEditions[textEditionLanguage]?.map((edition) => (
                  <MenuItem key={edition.identifier} value={edition.identifier}>
                    {edition.englishName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Typography variant="subtitle1" gutterBottom sx={{ mt: 4 }}>
              Audio Edition Settings
            </Typography>

            <FormControl fullWidth sx={{ mt: 2 }}>
              <InputLabel>Reciter</InputLabel>
              <Select
                value={audioEditionIdentifier || ""}
                label="Reciter"
                onChange={handleAudioEditionChange}
              >
                {audioEditions.map((reciter) => (
                  <MenuItem key={reciter.identifier} value={reciter.identifier}>
                    {reciter.englishName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Typography variant="subtitle1" gutterBottom sx={{ mt: 4 }}>
              Tafsir Settings
            </Typography>

            <FormControl fullWidth sx={{ mt: 2 }}>
              <InputLabel>Language</InputLabel>
              <Select
                value={tafsirLang || ""}
                label="Language"
                onChange={handleLangChange}
              >
                {Object.keys(tafsirsByLanguage).map((lang) => (
                  <MenuItem key={lang} value={lang}>
                    {lang.charAt(0).toUpperCase() + lang.slice(1)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth sx={{ mt: 2 }}>
              <InputLabel>Tafsir</InputLabel>
              <Select
                value={selectedTafsirId || ""}
                label="Tafsir"
                onChange={handleTafsirChange}
              >
                {tafsirsByLanguage[tafsirLang]?.map((tafsir) => (
                  <MenuItem key={tafsir.id} value={tafsir.id}>
                    {tafsir.name} – {tafsir.author_name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        )}

        {localTabIndex === 1 && (
          <Box mt={3}>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
              Configure Hadith settings to customize which collection and
              translation language you prefer. Hadith are recorded sayings,
              actions, and teachings of Prophet Muhammad (peace be upon him).
            </Typography>

            <Typography variant="subtitle1" gutterBottom>
              Hadith Book
            </Typography>

            <FormControl fullWidth sx={{ mt: 2 }}>
              <InputLabel>Book</InputLabel>
              <Select
                value={hadithSettings.book}
                label="Book"
                onChange={handleHadithBookChange}
              >
                {hadithBooks.map((book) => (
                  <MenuItem key={book.slug} value={book.slug}>
                    {book.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {(() => {
              const selectedBook = hadithBooks.find(
                (book) => book.slug === hadithSettings.book
              );
              if (!selectedBook) return null;
              return (
                <Box mt={2}>
                  <Typography variant="body2" color="textSecondary">
                    <strong>Author:</strong> {selectedBook.writer}
                  </Typography>
                  {selectedBook.aboutWriter && (
                    <Typography
                      variant="body2"
                      color="textSecondary"
                      sx={{ mt: 1, fontStyle: "italic" }}
                    >
                      {selectedBook.aboutWriter}
                    </Typography>
                  )}
                </Box>
              );
            })()}

            <Typography variant="subtitle1" gutterBottom sx={{ mt: 4 }}>
              Translation Language
            </Typography>

            <FormControl fullWidth sx={{ mt: 2 }}>
              <InputLabel>Language</InputLabel>
              <Select
                value={hadithSettings.translationLanguage}
                label="Language"
                onChange={(e) =>
                  dispatch(setHadithTranslationLanguage(e.target.value))
                }
              >
                <MenuItem value="en">English</MenuItem>
                <MenuItem value="ur">Urdu</MenuItem>
              </Select>
            </FormControl>
          </Box>
        )}

        {localTabIndex === 2 && (
          <Box mt={3}>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
              Configure time and weather display settings. When enabled, shows
              current time and weather information for your selected location.
              Customize time format, temperature units, and location
              preferences.
            </Typography>

            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              sx={{
                backgroundColor: "rgba(0,0,0,0.04)",
                px: 2,
                py: 1.5,
                borderRadius: 2,
                mb: 3,
              }}
            >
              <Typography variant="subtitle1">Show Time and Weather</Typography>
              <Switch
                checked={weatherEnabled}
                onChange={(e) => dispatch(setWeatherEnabled(e.target.checked))}
                color="primary"
              />
            </Box>

            <Typography variant="subtitle1" gutterBottom>
              Location Settings
            </Typography>

            <TextField
              fullWidth
              label="Search City"
              value={citySearch}
              onChange={(e) => setCitySearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleCitySearch();
              }}
              sx={{ mt: 2 }}
            />

            {cityOptions.length > 0 && (
              <FormControl fullWidth sx={{ mt: 2 }}>
                <InputLabel>Choose a City</InputLabel>
                <Select
                  value={selectedCityIndex}
                  label="Choose a City"
                  onChange={(e) => {
                    setSelectedCityIndex(e.target.value);
                    dispatch(setLocation(cityOptions[e.target.value]));
                  }}
                >
                  {cityOptions.map((city, index) => (
                    <MenuItem key={index} value={index}>
                      {city.name}, {city.country}, {city.admin1 || ""}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}

            <TextField
              fullWidth
              label="Custom Location Display Name"
              value={customDisplayName}
              onChange={(e) => dispatch(setCustomLocationName(e.target.value))}
              sx={{ mt: 2 }}
            />

            <FormControl fullWidth sx={{ mt: 4 }}>
              <InputLabel>Time Format</InputLabel>
              <Select
                value={timeFormat}
                onChange={(e) => dispatch(setTimeFormat(e.target.value))}
                label="Time Format"
              >
                <MenuItem value="12h">12 Hour</MenuItem>
                <MenuItem value="24h">24 Hour</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth sx={{ mt: 2 }}>
              <InputLabel>Temperature Unit</InputLabel>
              <Select
                value={tempUnit}
                onChange={(e) => dispatch(setTemperatureUnit(e.target.value))}
                label="Temperature Unit"
              >
                <MenuItem value="celsius">Celsius (°C)</MenuItem>
                <MenuItem value="fahrenheit">Fahrenheit (°F)</MenuItem>
              </Select>
            </FormControl>
          </Box>
        )}

        {localTabIndex === 3 && (
          <Box mt={3}>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
              Configure personalized greeting settings. When enabled, displays a
              personalized welcome message using your name. This adds a personal
              touch to your spiritual journey and daily interactions with the
              application.
            </Typography>

            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              sx={{
                backgroundColor: "rgba(0,0,0,0.04)",
                px: 2,
                py: 1.5,
                borderRadius: 2,
                mb: 3,
              }}
            >
              <Typography variant="subtitle1">Show Greeting</Typography>
              <Switch
                checked={greetingsEnabled}
                onChange={(e) =>
                  dispatch(setGreetingsEnabled(e.target.checked))
                }
              />
            </Box>
            {greetingsEnabled && (
              <TextField
                fullWidth
                label="Your Name"
                value={greetingsName}
                onChange={handleNameChange}
                placeholder="Enter your name"
                error={!!nameError}
                helperText={nameError}
              />
            )}
          </Box>
        )}

        {localTabIndex === 4 && (
          <Box mt={3}>
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              sx={{
                backgroundColor: "rgba(0,0,0,0.04)",
                px: 2,
                py: 1.5,
                borderRadius: 2,
                mb: 3,
              }}
            >
              <Typography variant="subtitle1">Show Tasks</Typography>
              <Switch
                checked={tasksEnabled}
                onChange={(e) => dispatch(setTasksEnabled(e.target.checked))}
                color="primary"
              />
            </Box>
            <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
              Toggle the Tasks component on or off. When enabled, you can manage
              your daily tasks and to-do items directly from the main interface.
            </Typography>
          </Box>
        )}
      </Box>
    </Modal>
  );
}
