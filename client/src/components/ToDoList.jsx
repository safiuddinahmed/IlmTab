import React, { useState, useCallback } from "react";
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
  Collapse,
} from "@mui/material";
import {
  ExpandMore,
  ExpandLess,
  Delete,
  Edit,
  Save,
  AddCircleOutline,
} from "@mui/icons-material";
import { useIndexedDBContext } from "../contexts/IndexedDBContext";

const ToDoList = () => {
  const { tasks } = useIndexedDBContext();
  const [input, setInput] = useState("");
  const [expanded, setExpanded] = useState(false); // controls showing the whole panel
  const [showAll, setShowAll] = useState(false); // controls showing all tasks or only 3 inside panel
  const [editId, setEditId] = useState(null);
  const [editText, setEditText] = useState("");

  // Get tasks from IndexedDB context
  const taskList = tasks?.tasks || [];
  const visibleTasks = showAll ? taskList : taskList.slice(0, 3);
  const completedCount = taskList.filter((t) => t.done).length;

  const addTask = useCallback(() => {
    if (!input.trim()) return;
    tasks?.addTask({
      text: input.trim(),
      done: false,
    });
    setInput("");
  }, [input, tasks]);

  const toggleDone = useCallback(
    (id) => {
      const task = taskList.find((t) => t.id === id);
      if (task) {
        tasks?.updateTask(id, { done: !task.done });
      }
    },
    [taskList, tasks]
  );

  const deleteTask = useCallback(
    (id) => {
      tasks?.deleteTask(id);
    },
    [tasks]
  );

  const startEditing = useCallback((id, text) => {
    setEditId(id);
    setEditText(text);
  }, []);

  const saveEdit = useCallback(() => {
    if (!editText.trim()) return;
    tasks?.updateTask(editId, { text: editText.trim() });
    setEditId(null);
    setEditText("");
  }, [editText, editId, tasks]);

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
          Your Tasks ({completedCount}/{taskList.length})
        </Typography>
        {expanded ? <ExpandLess /> : <ExpandMore />}
      </Box>

      {/* Expanded panel content */}
      <Collapse in={expanded} timeout={300}>
        <Box
          sx={{
            mt: 1,
            bgcolor: "rgba(255,255,255,0.35)",
            backdropFilter: "blur(8px)",
            p: 2,
            borderRadius: 2,
            boxShadow: "0 6px 20px rgba(0, 0, 0, 0.1)",
            color: "#111827",
          }}
          className="expand-enter"
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
            {/* Always show first 3 tasks */}
            {taskList.slice(0, 3).map(({ id, text, done }) => (
              <ListItem
                key={id}
                sx={{
                  px: 0.5,
                  py: 0,
                  display: "flex",
                  alignItems: "center",
                }}
                className="list-item-enter"
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
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        saveEdit();
                      } else if (e.key === "Escape") {
                        setEditId(null);
                        setEditText("");
                      }
                    }}
                    onBlur={saveEdit}
                    size="small"
                    autoFocus
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

            {/* Collapsible additional tasks */}
            <Collapse in={showAll} timeout={300}>
              <Box className="expand-enter">
                {taskList.slice(3).map(({ id, text, done }) => (
                  <ListItem
                    key={id}
                    sx={{
                      px: 0.5,
                      py: 0,
                      display: "flex",
                      alignItems: "center",
                    }}
                    className="list-item-enter"
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
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            saveEdit();
                          } else if (e.key === "Escape") {
                            setEditId(null);
                            setEditText("");
                          }
                        }}
                        onBlur={saveEdit}
                        size="small"
                        autoFocus
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
              </Box>
            </Collapse>
          </List>

          {/* Show more / less toggle if tasks > 3 */}
          {taskList.length > 3 && (
            <Box textAlign="center" mt={1}>
              <IconButton
                onClick={() => setShowAll((prev) => !prev)}
                size="small"
                className="btn-smooth"
                sx={{ color: "black" }}
                aria-label={showAll ? "Show less tasks" : "Show more tasks"}
              >
                <Box className="icon-smooth">
                  {showAll ? <ExpandLess /> : <ExpandMore />}
                </Box>
                <Typography variant="caption" sx={{ ml: 0.5 }}>
                  {showAll ? "Show Less" : "Show More"}
                </Typography>
              </IconButton>
            </Box>
          )}
        </Box>
      </Collapse>
    </Box>
  );
};

export default ToDoList;
