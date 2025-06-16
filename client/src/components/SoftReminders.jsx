import React, { useState } from "react";
import {
  Box,
  TextField,
  IconButton,
  Typography,
  Stack,
  Paper,
  Checkbox,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";

export default function SoftReminders() {
  const [tasks, setTasks] = useState([]);
  const [input, setInput] = useState("");

  const addTask = () => {
    if (!input.trim()) return;
    setTasks([...tasks, { id: Date.now(), text: input.trim(), done: false }]);
    setInput("");
  };

  const toggleDone = (id) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id ? { ...task, done: !task.done } : task
      )
    );
  };

  const deleteTask = (id) => {
    setTasks((prev) => prev.filter((task) => task.id !== id));
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "linear-gradient(135deg, #fceabb 0%, #f8b500 100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        pt: 10,
        px: 2,
      }}
    >
      <Typography
        variant="h3"
        sx={{
          fontWeight: 700,
          mb: 6,
          color: "#4a4a4a",
          fontFamily: "'Poppins', sans-serif",
          userSelect: "none",
          textAlign: "center",
        }}
      >
        Reminders
      </Typography>

      <Box
        sx={{
          display: "flex",
          gap: 2,
          mb: 6,
          width: "100%",
          maxWidth: 500,
        }}
      >
        <TextField
          variant="filled"
          placeholder="What do you want to remember?"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addTask()}
          fullWidth
          InputProps={{
            sx: {
              fontSize: 24,
              bgcolor: "white",
              borderRadius: 5,
              boxShadow: "0 6px 10px rgba(0,0,0,0.1)",
            },
          }}
        />
        <IconButton
          color="primary"
          onClick={addTask}
          sx={{
            bgcolor: "#f8b500",
            borderRadius: 5,
            p: 2,
            boxShadow: "0 6px 12px rgba(0,0,0,0.15)",
            "&:hover": {
              bgcolor: "#e0a700",
              transform: "scale(1.1)",
            },
            transition: "all 0.25s ease",
          }}
          aria-label="Add reminder"
        >
          <AddIcon sx={{ fontSize: 36, color: "white" }} />
        </IconButton>
      </Box>

      <Stack spacing={2} sx={{ width: "100%", maxWidth: 500 }}>
        {tasks.length === 0 && (
          <Typography
            sx={{
              color: "#555",
              fontSize: 18,
              fontStyle: "italic",
              textAlign: "center",
            }}
          >
            No reminders yet — add something above!
          </Typography>
        )}

        {tasks.map(({ id, text, done }) => (
          <Paper
            key={id}
            elevation={3}
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              borderRadius: 10,
              px: 3,
              py: 1.5,
              bgcolor: done ? "#d4edda" : "white",
              boxShadow: done
                ? "0 4px 12px rgba(76, 175, 80, 0.4)"
                : "0 4px 8px rgba(0,0,0,0.1)",
              transition: "background-color 0.3s",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Checkbox
                checked={done}
                onChange={() => toggleDone(id)}
                sx={{
                  color: done ? "#4caf50" : "grey.500",
                  "&.Mui-checked": { color: "#4caf50" },
                }}
              />
              <Typography
                sx={{
                  fontSize: 20,
                  textDecoration: done ? "line-through" : "none",
                  color: done ? "#4caf50" : "inherit",
                  userSelect: "text",
                }}
              >
                {text}
              </Typography>
            </Box>

            <IconButton
              onClick={() => deleteTask(id)}
              sx={{ color: "#888" }}
              aria-label="Delete reminder"
            >
              <DeleteIcon />
            </IconButton>
          </Paper>
        ))}
      </Stack>
    </Box>
  );
}
