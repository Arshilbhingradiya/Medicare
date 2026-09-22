import { useEffect, useRef, useState } from "react";
import {
  Alert,
  Avatar,
  Box,
  Button,
  CircularProgress,
  Fab,
  IconButton,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
  alpha,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import {
  CalendarMonth,
  Close,
  Mic,
  Send,
  SmartToy,
  Stop,
  VolumeOff,
  VolumeUp,
  CheckCircle,
} from "@mui/icons-material";
import { API_URL } from "../config";
import { useAuth } from "../store/auth";

const starterMessage = {
  role: "assistant",
  content:
    "Hi! I can help with doctors, appointments, profiles, subscriptions, and general health information. How can I help?",
};

// ---------- Styled Components ----------
const ChatWindow = styled(Paper)(({ theme }) => ({
  position: "fixed",
  right: theme.spacing(3.5),
  bottom: theme.spacing(3.5),
  width: 400,
  height: 600,
  zIndex: 1300,
  display: "flex",
  flexDirection: "column",
  overflow: "hidden",
  borderRadius: theme.spacing(3),
  boxShadow: "0 20px 60px rgba(15, 76, 129, 0.25)",
  [theme.breakpoints.down("sm")]: {
    right: 12,
    bottom: 12,
    width: "calc(100vw - 24px)",
    height: "min(620px, calc(100vh - 24px))",
  },
}));

const ChatHeader = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  background:
    "linear-gradient(125deg, #0f4c81 0%, #1976d2 65%, #38bdf8 100%)",
  color: "#fff",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  position: "relative",
  "&::after": {
    content: '""',
    position: "absolute",
    bottom: -20,
    right: -20,
    width: 100,
    height: 100,
    borderRadius: "50%",
    background: alpha("#fff", 0.08),
  },
}));

const MessageBubble = styled(Box, {
  shouldForwardProp: (prop) => prop !== "isUser",
})(({ theme, isUser }) => ({
  alignSelf: isUser ? "flex-end" : "flex-start",
  maxWidth: "85%",
  padding: theme.spacing(1.5, 2),
  borderRadius: isUser
    ? `${theme.spacing(2)} ${theme.spacing(2)} 4px ${theme.spacing(2)}`
    : `${theme.spacing(2)} ${theme.spacing(2)} ${theme.spacing(2)} 4px`,
  background: isUser
    ? "linear-gradient(125deg, #1976d2, #0f4c81)"
    : theme.palette.background.paper,
  color: isUser ? "#fff" : theme.palette.text.primary,
  boxShadow: isUser
    ? "0 4px 12px rgba(25, 118, 210, 0.25)"
    : "0 2px 8px rgba(15, 23, 42, 0.06)",
  border: isUser ? "none" : `1px solid ${theme.palette.divider}`,
  wordBreak: "break-word",
  whiteSpace: "pre-wrap",
  lineHeight: 1.55,
  fontSize: "0.9rem",
  animation: "fadeInUp 0.25s ease",
  "@keyframes fadeInUp": {
    from: { opacity: 0, transform: "translateY(6px)" },
    to: { opacity: 1, transform: "translateY(0)" },
  },
}));

const SlotButton = styled(Button, {
  shouldForwardProp: (prop) => prop !== "selectedSlot",
})(({ theme, selectedSlot }) => ({
  borderRadius: theme.spacing(1.5),
  textTransform: "none",
  fontWeight: 600,
  fontSize: "0.8rem",
  padding: theme.spacing(0.6, 1.4),
  borderColor: selectedSlot
    ? theme.palette.primary.main
    : theme.palette.divider,
  background: selectedSlot ? theme.palette.primary.main : "transparent",
  color: selectedSlot ? "#fff" : theme.palette.text.primary,
  transition: "all 0.2s",
  "&:hover": {
    background: selectedSlot
      ? theme.palette.primary.dark
      : alpha(theme.palette.primary.main, 0.08),
    borderColor: theme.palette.primary.main,
  },
}));

// ---------- Reason → human message map ----------
const REASON_MESSAGES = {
  missing_key:
    "⚠️ AI is not configured yet. Please add OPENAI_API_KEY to the backend .env and restart the server.",
  unauthorized:
    "🔑 The AI key is invalid or expired. Regenerate OPENAI_API_KEY and update the backend .env.",
  rate_limit:
    "⏳ Too many requests right now. Please wait a minute and try again.",
  quota_exceeded:
    "💳 The OpenAI account has no credits left. Add billing to keep using the AI assistant.",
  model_not_found:
    "🤖 The AI model name is invalid. Check OPENAI_MODEL in the backend .env.",
  timeout:
    "⏱️ The AI took too long to respond. Please try again shortly.",
  network_error:
    "🌐 Could not reach the AI provider. Check your server's internet connection.",
  provider_down:
    "🛠️ The AI provider is having issues. Please try again in a few minutes.",
  empty_response: "🤖 The AI returned no answer. Try rephrasing your question.",
  internal_error:
    "⚠️ Something went wrong on our server. Please try again shortly.",
  provider_error:
    "🤖 The AI provider returned an error. Please try again shortly.",
};

const AssistantChat = () => {
  const { isLoggedIn, authorizationtoken } = useAuth();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([starterMessage]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [bookingOpen, setBookingOpen] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [booking, setBooking] = useState({
    doctorId: "",
    date: "",
    time: "",
    reason: "Appointment booking",
    paymentMethod: "cash",
  });
  const [doctors, setDoctors] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [availabilityLoading, setAvailabilityLoading] = useState(false);
  const [voiceActive, setVoiceActive] = useState(false);
  const [speechEnabled, setSpeechEnabled] = useState(true);
  const bottomRef = useRef(null);
  const recognitionRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 200);
  }, [open]);

  useEffect(() => {
    if (!bookingOpen || doctors.length) return;
    fetch(`${API_URL}/api/doctorform/doctors?limit=100`)
      .then((response) => response.json())
      .then((data) =>
        setDoctors(data.doctors || (Array.isArray(data) ? data : []))
      )
      .catch(() => setError("Unable to load doctors for booking."));
  }, [bookingOpen, doctors.length]);

  useEffect(() => () => recognitionRef.current?.stop(), []);

  const todayInIndia = () => {
    const parts = new Intl.DateTimeFormat("en", {
      timeZone: "Asia/Kolkata",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).formatToParts(new Date());
    const get = (type) => parts.find((part) => part.type === type)?.value;
    return `${get("year")}-${get("month")}-${get("day")}`;
  };

  const isFutureSlot = (date, label) => {
    const start = String(label).split("-")[0]?.trim();
    if (!date || !/^\d{2}:\d{2}$/.test(start)) return false;
    return new Date(`${date}T${start}:00+05:30`).getTime() > Date.now();
  };

  useEffect(() => {
    if (!bookingOpen || !booking.doctorId || !booking.date) {
      setAvailableSlots([]);
      return undefined;
    }
    let active = true;
    setAvailabilityLoading(true);
    fetch(
      `${API_URL}/api/doctorform/doctors/${
        booking.doctorId
      }/availability?date=${encodeURIComponent(booking.date)}`
    )
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok)
          throw new Error(data.msg || "Unable to load appointment slots.");
        return data;
      })
      .then((data) => {
        if (!active) return;
        const slots = (data.branches || [])
          .flatMap((branch) =>
            (branch.slots || []).map((slot) => ({
              ...slot,
              branchId: branch.branchId,
              branchName: branch.name,
              available: Number(slot.remaining) > 0,
            }))
          )
          .filter(
            (slot) =>
              slot.available && isFutureSlot(booking.date, slot.label)
          );
        setAvailableSlots(slots);
        setBooking((current) =>
          slots.some((slot) => slot.label === current.time)
            ? current
            : { ...current, time: "", branchId: "" }
        );
      })
      .catch(
        (availabilityError) =>
          active && setError(availabilityError.message)
      )
      .finally(() => active && setAvailabilityLoading(false));
    return () => {
      active = false;
    };
  }, [bookingOpen, booking.doctorId, booking.date]);

  if (!isLoggedIn) return null;

  const speak = (text) => {
    if (!speechEnabled || !window.speechSynthesis || !text) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-IN";
    window.speechSynthesis.speak(utterance);
  };

  const toggleVoice = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (voiceActive) {
      recognitionRef.current?.stop();
      return;
    }
    if (!SpeechRecognition) {
      setError(
        "Voice booking is not supported in this browser. Please use Chrome or Edge."
      );
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = "en-IN";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.onstart = () => setVoiceActive(true);
    recognition.onend = () => setVoiceActive(false);
    recognition.onerror = () => {
      setVoiceActive(false);
      setError("I could not understand that. Please try again.");
    };
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript.trim();
      if (
        /\b(book|schedule|make)\b.*\b(appointment|visit)\b/i.test(transcript)
      )
        setBookingOpen(true);
      setInput(transcript);
    };
    recognitionRef.current = recognition;
    recognition.start();
  };

  const sendMessage = async (event) => {
    event?.preventDefault();
    const question = input.trim();
    if (!question || loading) return;

    if (
      /\b(book|schedule|make)\b.*\b(appointment|visit)\b/i.test(question)
    ) {
      setBookingOpen(true);
    }

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
      if (!response.ok)
        throw new Error(data.message || "Assistant is unavailable");

      setMessages((current) => [
        ...current,
        { role: "assistant", content: data.answer },
      ]);

      if (data.fallback) {
        setError(
          REASON_MESSAGES[data.reason] ||
            "The AI reply service is temporarily unavailable. Please try again shortly."
        );
      }

      speak(data.answer);
    } catch (requestError) {
      const failureMessage =
        requestError instanceof TypeError
          ? "The chat server cannot be reached. Check that the API server is running and VITE_API_URL points to it."
          : requestError.message || "Unable to reach the assistant";
      setError(failureMessage);
      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content: `I could not answer that right now. ${failureMessage}`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const updateBooking = (field) => (event) =>
    setBooking((current) => ({
      ...current,
      [field]: event.target.value,
      ...(["doctorId", "date"].includes(field)
        ? { time: "", branchId: "" }
        : {}),
    }));

  const submitBooking = async (event) => {
    event.preventDefault();
    if (
      !booking.doctorId ||
      !booking.date ||
      !booking.time ||
      bookingLoading
    )
      return;
    setBookingLoading(true);
    setError("");
    try {
      const response = await fetch(
        `${API_URL}/api/patientform/appointments`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: authorizationtoken,
            "Idempotency-Key": crypto.randomUUID(),
          },
          body: JSON.stringify(booking),
        }
      );
      const data = await response.json();
      if (!response.ok)
        throw new Error(
          data.msg || data.message || "Unable to book this appointment."
        );
      const doctor = doctors.find((item) => item._id === booking.doctorId);
      const confirmation = `Appointment booked with ${
        doctor?.name || "the doctor"
      } on ${booking.date} at ${booking.time}.`;
      setMessages((current) => [
        ...current,
        { role: "assistant", content: confirmation },
      ]);
      speak(confirmation);
      setBookingOpen(false);
      setBooking({
        doctorId: "",
        date: "",
        time: "",
        reason: "Appointment booking",
        paymentMethod: "cash",
      });
    } catch (bookingError) {
      setError(bookingError.message || "Unable to book this appointment.");
    } finally {
      setBookingLoading(false);
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      {!open && (
        <Fab
          color="primary"
          aria-label="Open Docify Assistant"
          onClick={() => setOpen(true)}
          sx={{
            position: "fixed",
            right: { xs: 18, md: 28 },
            bottom: { xs: 18, md: 28 },
            zIndex: 1300,
            width: 60,
            height: 60,
            background:
              "linear-gradient(125deg, #0f4c81, #1976d2 65%, #38bdf8)",
            boxShadow: "0 10px 30px rgba(15, 76, 129, 0.4)",
            "&:hover": {
              background:
                "linear-gradient(125deg, #0f4c81, #0f4c81 65%, #1976d2)",
              transform: "scale(1.05)",
            },
            transition: "transform 0.2s",
          }}
        >
          <SmartToy />
        </Fab>
      )}

      {/* Chat Window */}
      {open && (
        <ChatWindow elevation={12}>
          {/* Header */}
          <ChatHeader>
            <Stack
              direction="row"
              spacing={1.5}
              alignItems="center"
              sx={{ zIndex: 1 }}
            >
              <Avatar
                sx={{
                  bgcolor: alpha("#fff", 0.2),
                  width: 42,
                  height: 42,
                  border: `2px solid ${alpha("#fff", 0.3)}`,
                }}
              >
                <SmartToy fontSize="small" />
              </Avatar>
              <Box>
                <Typography fontWeight={700} fontSize="1rem">
                  Docify Assistant
                </Typography>
                <Stack
                  direction="row"
                  spacing={0.5}
                  alignItems="center"
                >
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      bgcolor: "#4ade80",
                      boxShadow: "0 0 8px #4ade80",
                    }}
                  />
                  <Typography variant="caption" sx={{ opacity: 0.9 }}>
                    Online · Ready to help
                  </Typography>
                </Stack>
              </Box>
            </Stack>
            <Stack direction="row" spacing={0.5} sx={{ zIndex: 1 }}>
              <IconButton
                size="small"
                aria-label={
                  speechEnabled
                    ? "Mute assistant"
                    : "Enable assistant voice"
                }
                onClick={() => setSpeechEnabled((current) => !current)}
                sx={{
                  color: "#fff",
                  bgcolor: alpha("#fff", 0.12),
                  "&:hover": { bgcolor: alpha("#fff", 0.22) },
                }}
              >
                {speechEnabled ? (
                  <VolumeUp fontSize="small" />
                ) : (
                  <VolumeOff fontSize="small" />
                )}
              </IconButton>
              <IconButton
                size="small"
                aria-label="Close assistant"
                onClick={() => setOpen(false)}
                sx={{
                  color: "#fff",
                  bgcolor: alpha("#fff", 0.12),
                  "&:hover": { bgcolor: alpha("#fff", 0.22) },
                }}
              >
                <Close fontSize="small" />
              </IconButton>
            </Stack>
          </ChatHeader>

          {/* Messages Area */}
          <Box
            sx={{
              flex: 1,
              overflowY: "auto",
              p: 2,
              bgcolor: "#f7faff",
              "&::-webkit-scrollbar": { width: 6 },
              "&::-webkit-scrollbar-thumb": {
                bgcolor: alpha("#1976d2", 0.3),
                borderRadius: 3,
              },
            }}
          >
            <Stack spacing={1.5}>
              {/* Quick action */}
              {!bookingOpen && (
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<CalendarMonth />}
                  onClick={() => setBookingOpen(true)}
                  sx={{
                    alignSelf: "flex-start",
                    textTransform: "none",
                    borderRadius: 2,
                    fontWeight: 600,
                    borderColor: alpha("#1976d2", 0.3),
                  }}
                >
                  Book an appointment
                </Button>
              )}

              {/* Booking Form */}
              {bookingOpen && (
                <Box
                  component="form"
                  onSubmit={submitBooking}
                  sx={{
                    p: 2,
                    bgcolor: "white",
                    borderRadius: 3,
                    border: "1px solid",
                    borderColor: alpha("#1976d2", 0.15),
                    boxShadow: "0 8px 24px rgba(15, 76, 129, 0.08)",
                  }}
                >
                  <Stack spacing={1.5}>
                    <Stack
                      direction="row"
                      alignItems="center"
                      justifyContent="space-between"
                    >
                      <Stack
                        direction="row"
                        spacing={1}
                        alignItems="center"
                      >
                        <CalendarMonth
                          color="primary"
                          fontSize="small"
                        />
                        <Typography
                          variant="subtitle2"
                          fontWeight={700}
                        >
                          Book Appointment
                        </Typography>
                      </Stack>
                      <IconButton
                        size="small"
                        onClick={() => setBookingOpen(false)}
                      >
                        <Close fontSize="small" />
                      </IconButton>
                    </Stack>

                    <Select
                      size="small"
                      value={booking.doctorId}
                      onChange={updateBooking("doctorId")}
                      displayEmpty
                      required
                      sx={{ borderRadius: 2 }}
                    >
                      <MenuItem value="" disabled>
                        Select a doctor
                      </MenuItem>
                      {doctors.map((doctor) => (
                        <MenuItem key={doctor._id} value={doctor._id}>
                          {doctor.name}{" "}
                          {doctor.specialization
                            ? `(${doctor.specialization})`
                            : ""}
                        </MenuItem>
                      ))}
                    </Select>

                    <TextField
                      size="small"
                      fullWidth
                      type="date"
                      label="Appointment date"
                      value={booking.date}
                      onChange={updateBooking("date")}
                      InputLabelProps={{ shrink: true }}
                      inputProps={{ min: todayInIndia() }}
                      required
                      sx={{
                        "& .MuiInputBase-root": { borderRadius: 2 },
                      }}
                    />

                    {booking.doctorId && booking.date && (
                      <Box>
                        <Typography
                          variant="caption"
                          fontWeight={700}
                          color="text.secondary"
                        >
                          Available times
                        </Typography>
                        {availabilityLoading ? (
                          <Stack
                            direction="row"
                            spacing={1}
                            alignItems="center"
                            sx={{ mt: 1 }}
                          >
                            <CircularProgress size={14} />
                            <Typography variant="body2">
                              Checking availability...
                            </Typography>
                          </Stack>
                        ) : availableSlots.length ? (
                          <Stack
                            direction="row"
                            flexWrap="wrap"
                            gap={0.75}
                            sx={{ mt: 0.75 }}
                          >
                            {availableSlots.map((slot) => {
                              const isSelected =
                                booking.time === slot.label &&
                                String(booking.branchId) ===
                                  String(slot.branchId);
                              return (
                                <SlotButton
                                  key={`${slot.branchId}-${slot.label}`}
                                  type="button"
                                  size="small"
                                  variant="outlined"
                                  selectedSlot={isSelected ? 1 : 0}
                                  onClick={() =>
                                    setBooking((current) => ({
                                      ...current,
                                      time: slot.label,
                                      branchId: slot.branchId,
                                    }))
                                  }
                                >
                                  {slot.label}
                                </SlotButton>
                              );
                            })}
                          </Stack>
                        ) : (
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ mt: 0.5 }}
                          >
                            No future slots are available on this date.
                          </Typography>
                        )}
                      </Box>
                    )}

                    <TextField
                      size="small"
                      label="Reason (optional)"
                      value={booking.reason}
                      onChange={updateBooking("reason")}
                      inputProps={{ maxLength: 200 }}
                      sx={{
                        "& .MuiInputBase-root": { borderRadius: 2 },
                      }}
                    />

                    <Button
                      type="submit"
                      variant="contained"
                      disabled={
                        bookingLoading ||
                        !booking.doctorId ||
                        !booking.date ||
                        !booking.time
                      }
                      startIcon={
                        bookingLoading ? (
                          <CircularProgress
                            size={16}
                            color="inherit"
                          />
                        ) : (
                          <CheckCircle />
                        )
                      }
                      sx={{
                        borderRadius: 2,
                        textTransform: "none",
                        fontWeight: 700,
                        py: 1,
                      }}
                    >
                      {bookingLoading
                        ? "Booking..."
                        : "Confirm Appointment"}
                    </Button>
                  </Stack>
                </Box>
              )}

              {/* Messages */}
              {messages.map((message, index) => {
                const isUser = message.role === "user";
                return (
                  <Stack
                    key={`${message.role}-${index}`}
                    direction="row"
                    spacing={1}
                    alignItems="flex-end"
                    sx={{
                      alignSelf: isUser ? "flex-end" : "flex-start",
                      maxWidth: "100%",
                    }}
                  >
                    {!isUser && (
                      <Avatar
                        sx={{
                          width: 28,
                          height: 28,
                          bgcolor: alpha("#1976d2", 0.12),
                          color: "primary.main",
                        }}
                      >
                        <SmartToy sx={{ fontSize: 16 }} />
                      </Avatar>
                    )}
                    <MessageBubble isUser={isUser ? 1 : 0}>
                      {message.content}
                    </MessageBubble>
                  </Stack>
                );
              })}

              {/* Typing indicator */}
              {loading && (
                <Stack
                  direction="row"
                  spacing={1}
                  alignItems="center"
                  sx={{ alignSelf: "flex-start" }}
                >
                  <Avatar
                    sx={{
                      width: 28,
                      height: 28,
                      bgcolor: alpha("#1976d2", 0.12),
                      color: "primary.main",
                    }}
                  >
                    <SmartToy sx={{ fontSize: 16 }} />
                  </Avatar>
                  <Paper
                    elevation={0}
                    sx={{
                      px: 2,
                      py: 1.2,
                      bgcolor: "white",
                      borderRadius: 3,
                      border: "1px solid",
                      borderColor: "divider",
                      display: "flex",
                      alignItems: "center",
                      gap: 0.5,
                    }}
                  >
                    {[0, 1, 2].map((i) => (
                      <Box
                        key={i}
                        sx={{
                          width: 6,
                          height: 6,
                          borderRadius: "50%",
                          bgcolor: "primary.main",
                          animation: "bounce 1.2s infinite",
                          animationDelay: `${i * 0.15}s`,
                          "@keyframes bounce": {
                            "0%, 60%, 100%": {
                              transform: "translateY(0)",
                              opacity: 0.5,
                            },
                            "30%": {
                              transform: "translateY(-5px)",
                              opacity: 1,
                            },
                          },
                        }}
                      />
                    ))}
                  </Paper>
                </Stack>
              )}

              <div ref={bottomRef} />
            </Stack>
          </Box>

          {/* Error */}
          {error && (
            <Alert
              severity="warning"
              onClose={() => setError("")}
              sx={{ borderRadius: 0, fontSize: "0.8rem" }}
            >
              {error}
            </Alert>
          )}

          {/* Input Bar */}
          <Box
            component="form"
            onSubmit={sendMessage}
            sx={{
              p: 1.5,
              bgcolor: "background.paper",
              borderTop: "1px solid",
              borderColor: "divider",
            }}
          >
            <Stack
              direction="row"
              spacing={1}
              alignItems="flex-end"
            >
              <TextField
                fullWidth
                size="small"
                multiline
                minRows={1}
                maxRows={4}
                value={input}
                inputRef={inputRef}
                onChange={(event) => setInput(event.target.value)}
                placeholder="Ask or say: book an appointment..."
                disabled={loading}
                inputProps={{
                  maxLength: 2000,
                  "aria-label": "Message Docify Assistant",
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 3,
                    bgcolor: "background.default",
                    fontSize: "0.9rem",
                    "& fieldset": {
                      borderColor: "divider",
                    },
                    "&:hover fieldset": {
                      borderColor: "primary.main",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "primary.main",
                      borderWidth: 2,
                    },
                  },
                  "& .MuiOutlinedInput-input": {
                    color: "text.primary",
                    WebkitTextFillColor: "text.primary",
                    fontWeight: 500,
                    py: 1.2,
                    "&::placeholder": {
                      color: "text.disabled",
                      opacity: 1,
                    },
                  },
                }}
              />
              <IconButton
                color={voiceActive ? "error" : "primary"}
                type="button"
                aria-label={
                  voiceActive
                    ? "Stop voice input"
                    : "Start voice input"
                }
                onClick={toggleVoice}
                sx={{
                  bgcolor: voiceActive
                    ? alpha("#ef4444", 0.1)
                    : alpha("#1976d2", 0.08),
                  "&:hover": {
                    bgcolor: voiceActive
                      ? alpha("#ef4444", 0.18)
                      : alpha("#1976d2", 0.16),
                  },
                  width: 42,
                  height: 42,
                }}
              >
                {voiceActive ? (
                  <Stop fontSize="small" />
                ) : (
                  <Mic fontSize="small" />
                )}
              </IconButton>
              <IconButton
                color="primary"
                type="submit"
                aria-label="Send question"
                disabled={!input.trim() || loading}
                sx={{
                  bgcolor: "primary.main",
                  color: "#fff",
                  width: 42,
                  height: 42,
                  "&:hover": { bgcolor: "primary.dark" },
                  "&.Mui-disabled": {
                    bgcolor: alpha("#1976d2", 0.15),
                    color: alpha("#1976d2", 0.4),
                  },
                }}
              >
                <Send fontSize="small" />
              </IconButton>
            </Stack>
          </Box>
        </ChatWindow>
      )}
    </>
  );
};

export default AssistantChat;