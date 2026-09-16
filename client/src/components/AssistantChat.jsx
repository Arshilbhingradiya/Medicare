import { useEffect, useRef, useState } from "react";
import {
  Alert,
  Box,
  Fab,
  IconButton,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { Close, Send, SmartToy } from "@mui/icons-material";
import { API_URL } from "../config";
import { useAuth } from "../store/auth";

const starterMessage = {
  role: "assistant",
  content: "Hi! I can help with doctors, appointments, profiles, subscriptions, and general health information. How can I help?",
};

const AssistantChat = () => {
  const { isLoggedIn, authorizationtoken } = useAuth();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([starterMessage]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  if (!isLoggedIn) return null;

  const sendMessage = async (event) => {
    event?.preventDefault();
    const question = input.trim();
    if (!question || loading) return;

    const nextMessages = [...messages, { role: "user", content: question }];
    setMessages(nextMessages);
    setInput("");
    setError("");
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/assistant/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: authorizationtoken,
        },
        body: JSON.stringify({ messages: nextMessages }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Assistant is unavailable");
      setMessages((current) => [...current, { role: "assistant", content: data.answer }]);
    } catch (requestError) {
      const failureMessage = requestError.message || "Unable to reach the assistant";
      setError(failureMessage);
      setMessages((current) => [...current, { role: "assistant", content: `I could not answer that right now. ${failureMessage}` }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {!open && (
        <Fab
          color="primary"
          aria-label="Open Docify Assistant"
          onClick={() => setOpen(true)}
          sx={{ position: "fixed", right: { xs: 18, md: 28 }, bottom: { xs: 18, md: 28 }, zIndex: 1300 }}
        >
          <SmartToy />
        </Fab>
      )}

      {open && (
        <Paper
          elevation={12}
          sx={{
            position: "fixed",
            right: { xs: 12, md: 28 },
            bottom: { xs: 12, md: 28 },
            width: { xs: "calc(100vw - 24px)", sm: 380 },
            height: { xs: "min(620px, calc(100vh - 24px))", sm: 560 },
            zIndex: 1300,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            borderRadius: 3,
          }}
        >
          <Box sx={{ px: 2, py: 1.5, bgcolor: "primary.main", color: "white", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <Stack direction="row" spacing={1} alignItems="center">
              <SmartToy />
              <Box>
                <Typography fontWeight={700}>Docify Assistant</Typography>
                <Typography variant="caption" sx={{ opacity: 0.8 }}>Helpful guidance, anytime</Typography>
              </Box>
            </Stack>
            <IconButton aria-label="Close assistant" onClick={() => setOpen(false)} sx={{ color: "white" }}><Close /></IconButton>
          </Box>

          <Box sx={{ flex: 1, overflowY: "auto", p: 2, bgcolor: "#f7faff" }}>
            <Stack spacing={1.5}>
              {messages.map((message, index) => (
                <Box key={`${message.role}-${index}`} sx={{ alignSelf: message.role === "user" ? "flex-end" : "flex-start", maxWidth: "88%" }}>
                  <Box sx={{ px: 1.5, py: 1, borderRadius: 2, bgcolor: message.role === "user" ? "primary.main" : "white", color: message.role === "user" ? "#ffffff" : "#172033", boxShadow: message.role === "assistant" ? 1 : 0, overflowWrap: "anywhere" }}>
                    <Typography variant="body2" sx={{ whiteSpace: "pre-wrap", color: "inherit", lineHeight: 1.55 }}>{message.content}</Typography>
                  </Box>
                </Box>
              ))}
              {loading && <Typography variant="caption" color="text.secondary">Assistant is thinking...</Typography>}
              <div ref={bottomRef} />
            </Stack>
          </Box>

          {error && <Alert severity="warning" onClose={() => setError("")} sx={{ borderRadius: 0 }}>{error}</Alert>}
          <Box component="form" onSubmit={sendMessage} sx={{ p: 1.5, bgcolor: "#ffffff", borderTop: "1px solid", borderColor: "divider" }}>
            <Stack direction="row" spacing={1}>
              <TextField fullWidth size="small" value={input} onChange={(event) => setInput(event.target.value)} placeholder="Ask a question..." inputProps={{ maxLength: 2000, "aria-label": "Message Docify Assistant" }} disabled={loading} sx={{ "& .MuiInputBase-root": { bgcolor: "#ffffff" }, "& input": { color: "#172033", WebkitTextFillColor: "#172033" }, "& input::placeholder": { color: "#667085", opacity: 1 } }} />
              <IconButton color="primary" type="submit" aria-label="Send question" disabled={!input.trim() || loading}><Send /></IconButton>
            </Stack>
          </Box>
        </Paper>
      )}
    </>
  );
};

export default AssistantChat;
