import React, { useEffect, useState } from "react";
import axios from "axios";
import { Box, Typography, CircularProgress } from "@mui/material";
import WbSunnyIcon from "@mui/icons-material/WbSunny";
import CloudIcon from "@mui/icons-material/Cloud";
import GrainIcon from "@mui/icons-material/Grain";
import ThunderstormIcon from "@mui/icons-material/Thunderstorm";
import AcUnitIcon from "@mui/icons-material/AcUnit";
import { useIndexedDBContext } from "../contexts/IndexedDBContext";

const weatherCodes = {
  0: "sun",
  1: "sun",
  2: "cloud",
  3: "cloud",
  45: "cloud-rain",
  48: "cloud-rain",
  51: "cloud-rain",
  53: "cloud-rain",
  55: "cloud-rain",
  56: "cloud-rain",
  57: "cloud-rain",
  61: "cloud-rain",
  63: "cloud-rain",
  65: "cloud-rain",
  66: "cloud-rain",
  67: "cloud-rain",
  71: "cloud-snow",
  73: "cloud-snow",
  75: "cloud-snow",
  77: "cloud-snow",
  80: "cloud-rain",
  81: "cloud-rain",
  82: "cloud-rain",
  85: "cloud-snow",
  86: "cloud-snow",
  95: "cloud-lightning",
  96: "cloud-lightning",
  99: "cloud-lightning",
};

const weatherDescriptions = {
  0: "Clear sky",
  1: "Mainly clear",
  2: "Partly cloudy",
  3: "Overcast",
  45: "Fog",
  48: "Depositing rime fog",
  51: "Light drizzle",
  53: "Moderate drizzle",
  55: "Heavy drizzle",
  56: "Light freezing drizzle",
  57: "Heavy freezing drizzle",
  61: "Light rain",
  63: "Moderate rain",
  65: "Heavy rain",
  66: "Light freezing rain",
  67: "Heavy freezing rain",
  71: "Light snow",
  73: "Moderate snow",
  75: "Heavy snow",
  77: "Snow grains",
  80: "Light rain showers",
  81: "Moderate rain showers",
  82: "Heavy rain showers",
  85: "Light snow showers",
  86: "Heavy snow showers",
  95: "Thunderstorm",
  96: "Thunderstorm with light hail",
  99: "Thunderstorm with heavy hail",
};

const getWeatherIcon = (code) => {
  const iconStyle = {
    fontSize: 48,
    animation: "pulse 3s infinite",
    filter: "drop-shadow(0 0 5px rgba(0,0,0,0.2))",
  };

  const type = weatherCodes[code] || "sun";

  switch (type) {
    case "sun":
      return <WbSunnyIcon sx={{ ...iconStyle, color: "#fbc02d" }} />;
    case "cloud":
      return <CloudIcon sx={{ ...iconStyle, color: "#90a4ae" }} />;
    case "cloud-rain":
      return <GrainIcon sx={{ ...iconStyle, color: "#4fc3f7" }} />;
    case "cloud-snow":
      return <AcUnitIcon sx={{ ...iconStyle, color: "#81d4fa" }} />;
    case "cloud-lightning":
      return <ThunderstormIcon sx={{ ...iconStyle, color: "#f44336" }} />;
    default:
      return <WbSunnyIcon sx={{ ...iconStyle, color: "#fbc02d" }} />;
  }
};

const DateTimeWeather = () => {
  // Use IndexedDB context instead of Redux
  const { settings } = useIndexedDBContext();

  // Get weather settings from IndexedDB
  const weatherSettings = settings?.settings?.weather || {};
  const location = weatherSettings.location || {
    latitude: 0,
    longitude: 0,
    name: "Unknown",
    timezone: "UTC",
  };
  const customName = weatherSettings.customName || "";
  const timeFormat = weatherSettings.timeFormat || "24h";
  const temperatureUnit = weatherSettings.temperatureUnit || "celsius";

  const [weather, setWeather] = useState(null);
  const [loadingWeather, setLoadingWeather] = useState(true);
  const [weatherError, setWeatherError] = useState(null);
  const [hijriDate, setHijriDate] = useState(null);
  const [loadingHijri, setLoadingHijri] = useState(true);
  const [hijriError, setHijriError] = useState(null);
  const [time, setTime] = useState(new Date());
  const [timeZone, setTimeZone] = useState("UTC"); // default or from location

  const fetchWeather = async () => {
    const { latitude, longitude } = location;
    setLoadingWeather(true);
    setWeatherError(null);

    try {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`;
      const res = await axios.get(url);

      if (res.data?.current_weather) {
        const code = res.data.current_weather.weathercode;
        setWeather({
          tempC: res.data.current_weather.temperature,
          weatherCode: code,
          windSpeedKph: res.data.current_weather.windspeed,
        });
        setWeatherError(null);
      } else {
        throw new Error("Weather data not available");
      }
    } catch (err) {
      console.error("Failed to fetch weather", err);
      setWeatherError("Unable to load weather data");
      setWeather(null);
    } finally {
      setLoadingWeather(false);
    }
  };

  const getHijriDate = async () => {
    const { latitude, longitude } = location;
    setLoadingHijri(true);
    setHijriError(null);

    try {
      const res = await fetch(
        `https://api.aladhan.com/v1/gToH?latitude=${latitude}&longitude=${longitude}&method=2`
      );
      const data = await res.json();
      if (data.code === 200) {
        setHijriDate(data.data.hijri);
        setHijriError(null);
      } else {
        throw new Error("Hijri date not available");
      }
    } catch (err) {
      console.error("Hijri fetch failed:", err);
      setHijriError("Unable to load Islamic date");
      setHijriDate(null);
    } finally {
      setLoadingHijri(false);
    }
  };

  useEffect(() => {
    fetchWeather();
    getHijriDate();
  }, [location]);

  useEffect(() => {
    if (!location.timezone) return;
    setTimeZone(location.timezone);
  }, [location]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const is12h = timeFormat === "12h";
  const useFahrenheit = temperatureUnit === "fahrenheit";

  const formattedTime = new Intl.DateTimeFormat(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    hour12: is12h,
    timeZone,
  }).format(time);

  const gregorian = time.toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const displayTemp = (tempC) =>
    useFahrenheit
      ? `${Math.round(tempC * 1.8 + 32)}°F`
      : `${Math.round(tempC)}°C`;

  return (
    <>
      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); filter: drop-shadow(0 0 5px rgba(0,0,0,0.2)); }
          50% { transform: scale(1.1); filter: drop-shadow(0 0 15px rgba(0,0,0,0.35)); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          justifyContent: "space-between",
          alignItems: "center",
          gap: 3,
          px: 3,
          py: 3,
          width: "60%",
          maxWidth: 1000,
          mx: "auto",
          backgroundColor: "rgba(255, 255, 255, 0.4)",
          backdropFilter: "blur(10px)",
          boxShadow: "0 8px 30px rgba(0, 0, 0, 0.15)",
          borderRadius: 2,
          color: "#111827",
          userSelect: "none",
          animation: "fadeInUp 0.7s ease forwards",
        }}
      >
        {/* Date & Time */}
        <Box sx={{ flex: 1, textAlign: { xs: "center", sm: "left" } }}>
          <Typography variant="h3" sx={{ fontWeight: 600, mb: 0.5 }}>
            {formattedTime}
          </Typography>

          {loadingHijri ? (
            <CircularProgress size={24} sx={{ color: "#444" }} />
          ) : hijriError ? (
            <Typography
              variant="body2"
              sx={{
                fontWeight: 500,
                color: "#ef4444",
                backgroundColor: "rgba(239, 68, 68, 0.1)",
                padding: "4px 8px",
                borderRadius: 1,
                fontSize: "0.875rem",
              }}
            >
              {hijriError}
            </Typography>
          ) : hijriDate ? (
            <Typography
              variant="body"
              sx={{ fontWeight: 500, color: "#374151" }}
            >
              {hijriDate.weekday.en}, {hijriDate.day} {hijriDate.month.en}{" "}
              {hijriDate.year} AH
            </Typography>
          ) : null}

          <Typography
            variant="body1"
            sx={{ fontWeight: 500, color: "#374151" }}
          >
            {gregorian}
          </Typography>
        </Box>

        {/* Weather */}
        <Box
          sx={{
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            gap: 2,
            backgroundColor: "rgba(255, 255, 255, 0.35)",
            backdropFilter: "blur(8px)",
            borderRadius: 3,
            p: 2,
            minWidth: 180,
            boxShadow: "0 6px 20px rgba(0, 0, 0, 0.1)",
            animation: "fadeInUp 1s ease forwards",
            color: "#111827",
          }}
        >
          {loadingWeather ? (
            <CircularProgress size={30} sx={{ color: "#444" }} />
          ) : weatherError ? (
            <Box sx={{ textAlign: "center", width: "100%" }}>
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 500,
                  color: "#ef4444",
                  backgroundColor: "rgba(239, 68, 68, 0.1)",
                  padding: "8px 12px",
                  borderRadius: 1,
                  fontSize: "0.875rem",
                }}
              >
                {weatherError}
              </Typography>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mt: 1 }}>
                {customName || location.name}
              </Typography>
            </Box>
          ) : weather ? (
            <>
              {getWeatherIcon(weather.weatherCode)}
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  {customName || location.name}
                </Typography>
                <Typography
                  variant="h5"
                  sx={{ fontWeight: "bold", lineHeight: 1 }}
                >
                  {displayTemp(weather.tempC)}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.7 }}>
                  {weatherDescriptions[weather.weatherCode] || "Unknown"}
                </Typography>
              </Box>
            </>
          ) : null}
        </Box>
      </Box>
    </>
  );
};

export default DateTimeWeather;
