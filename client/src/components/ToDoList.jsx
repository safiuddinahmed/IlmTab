import React, { useState } from "react";
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  IconButton,
  TextField,
  Checkbox,
  Tooltip,
} from "@mui/material";
import {
  ExpandMore,
  ExpandLess,
  Delete,
  Edit,
  Save,
  AddCircleOutline,
} from "@mui/icons-material";

const ToDoList = () => {
  const [tasks, setTasks] = useState([]);
  const [input, setInput] = useState("");
  const [expanded, setExpanded] = useState(false); // controls showing the whole panel
  const [showAll, setShowAll] = useState(false); // controls showing all tasks or only 3 inside panel
  const [editId, setEditId] = useState(null);
  const [editText, setEditText] = useState("");

  const visibleTasks = showAll ? tasks : tasks.slice(0, 3);
  const completedCount = tasks.filter((t) => t.done).length;

  // Add, toggleDone, delete, editing methods remain unchanged

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

  const startEditing = (id, text) => {
    setEditId(id);
    setEditText(text);
  };

  const saveEdit = () => {
    if (!editText.trim()) return;
    setTasks((prev) =>
      prev.map((task) =>
        task.id === editId ? { ...task, text: editText.trim() } : task
      )
    );
    setEditId(null);
    setEditText("");
  };

  return (
    <Box
      sx={{
        display: "relative",
        justifyContent: "space-between",
        alignItems: "center",
        px: 2,
        py: 1,
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
      {/* Header bar toggles full panel */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          cursor: "pointer",
          userSelect: "none",
          py: 0.5,
        }}
        onClick={() => setExpanded((prev) => !prev)}
      >
        <Typography
          variant="subtitle1"
          sx={{ fontWeight: 600, color: "black", fontSize: "1rem" }}
        >
          Your Tasks ({completedCount}/{tasks.length})
        </Typography>
        {expanded ? <ExpandLess /> : <ExpandMore />}
      </Box>

      {/* Expanded panel content */}
      {expanded && (
        <Box
          sx={{
            mt: 1,
            bgcolor: "rgba(255,255,255,0.35)",
            backdropFilter: "blur(8px)",
            p: 2,
            borderRadius: 2,
            boxShadow: "0 6px 20px rgba(0, 0, 0, 0.1)",
            animation: "fadeInUp 1s ease forwards",
            color: "#111827",
          }}
        >
          {/* Add task input */}
          <Box sx={{ display: "flex", gap: 1, mb: 1 }}>
            <TextField
              fullWidth
              placeholder="Add new task"
              size="small"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addTask()}
            />
            <Tooltip title="Add task">
              <IconButton onClick={addTask}>
                <AddCircleOutline />
              </IconButton>
            </Tooltip>
          </Box>

          {/* Tasks list */}
          <List dense>
            {visibleTasks.map(({ id, text, done }) => (
              <ListItem
                key={id}
                sx={{
                  px: 0.5,
                  py: 0,
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <Checkbox
                  checked={done}
                  onChange={() => toggleDone(id)}
                  sx={{ mr: 1 }}
                />
                {editId === id ? (
                  <TextField
                    fullWidth
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    onBlur={saveEdit}
                    size="small"
                  />
                ) : (
                  <ListItemText
                    primary={text}
                    sx={{
                      textDecoration: done ? "line-through" : "none",
                      color: done ? "gray" : "black",
                    }}
                  />
                )}
                {editId === id ? (
                  <IconButton onClick={saveEdit} size="small">
                    <Save fontSize="small" />
                  </IconButton>
                ) : (
                  <IconButton
                    onClick={() => startEditing(id, text)}
                    size="small"
                  >
                    <Edit fontSize="small" />
                  </IconButton>
                )}
                <IconButton onClick={() => deleteTask(id)} size="small">
                  <Delete fontSize="small" />
                </IconButton>
              </ListItem>
            ))}
          </List>

          {/* Show more / less toggle if tasks > 3 */}
          {tasks.length > 3 && (
            <Box textAlign="center" mt={1}>
              <IconButton
                onClick={() => setShowAll((prev) => !prev)}
                size="small"
                sx={{ color: "black" }}
                aria-label={showAll ? "Show less tasks" : "Show more tasks"}
              >
                {showAll ? <ExpandLess /> : <ExpandMore />}
              </IconButton>
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
};

export default ToDoList;
