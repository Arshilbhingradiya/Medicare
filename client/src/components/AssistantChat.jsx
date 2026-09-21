import { useEffect, useRef, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Fab,
  IconButton,
  Paper,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { CalendarMonth, Close, Mic, Send, SmartToy, Stop, VolumeOff, VolumeUp } from "@mui/icons-material";
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
  const [bookingOpen, setBookingOpen] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [booking, setBooking] = useState({ doctorId: "", date: "", time: "", reason: "Appointment booking", paymentMethod: "cash" });
  const [doctors, setDoctors] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [availabilityLoading, setAvailabilityLoading] = useState(false);
  const [voiceActive, setVoiceActive] = useState(false);
  const [speechEnabled, setSpeechEnabled] = useState(true);
  const bottomRef = useRef(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    if (!bookingOpen || doctors.length) return;
    fetch(`${API_URL}/api/doctorform/doctors?limit=100`)
      .then((response) => response.json())
      .then((data) => setDoctors(data.doctors || (Array.isArray(data) ? data : [])))
      .catch(() => setError("Unable to load doctors for booking."));
  }, [bookingOpen, doctors.length]);

  useEffect(() => () => recognitionRef.current?.stop(), []);

  const todayInIndia = () => {
    const parts = new Intl.DateTimeFormat("en", { timeZone: "Asia/Kolkata", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(new Date());
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
    fetch(`${API_URL}/api/doctorform/doctors/${booking.doctorId}/availability?date=${encodeURIComponent(booking.date)}`)
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.msg || "Unable to load appointment slots.");
        return data;
      })
      .then((data) => {
        if (!active) return;
        const slots = (data.branches || []).flatMap((branch) => (branch.slots || []).map((slot) => ({
          ...slot, branchId: branch.branchId, branchName: branch.name, available: Number(slot.remaining) > 0,
        }))).filter((slot) => slot.available && isFutureSlot(booking.date, slot.label));
        setAvailableSlots(slots);
        setBooking((current) => slots.some((slot) => slot.label === current.time) ? current : { ...current, time: "", branchId: "" });
      })
      .catch((availabilityError) => active && setError(availabilityError.message))
      .finally(() => active && setAvailabilityLoading(false));
    return () => { active = false; };
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
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (voiceActive) {
      recognitionRef.current?.stop();
      return;
    }
    if (!SpeechRecognition) {
      setError("Voice booking is not supported in this browser. Please use Chrome or Edge.");
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
      if (/\b(book|schedule|make)\b.*\b(appointment|visit)\b/i.test(transcript)) setBookingOpen(true);
      setInput(transcript);
    };
    recognitionRef.current = recognition;
    recognition.start();
  };

  const sendMessage = async (event) => {
    event?.preventDefault();
    const question = input.trim();
    if (!question || loading) return;

    if (/\b(book|schedule|make)\b.*\b(appointment|visit)\b/i.test(question)) {
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
      if (!response.ok) throw new Error(data.message || "Assistant is unavailable");
      setMessages((current) => [...current, { role: "assistant", content: data.answer }]);
      if (data.fallback) setError("The AI reply service is unavailable right now. Booking and account help are still available.");
      speak(data.answer);
    } catch (requestError) {
      const failureMessage = requestError instanceof TypeError
        ? "The chat server cannot be reached. Check that the API server is running and VITE_API_URL points to it."
        : requestError.message || "Unable to reach the assistant";
      setError(failureMessage);
      setMessages((current) => [...current, { role: "assistant", content: `I could not answer that right now. ${failureMessage}` }]);
    } finally {
      setLoading(false);
    }
  };

  const updateBooking = (field) => (event) => setBooking((current) => ({
    ...current,
    [field]: event.target.value,
    ...(["doctorId", "date"].includes(field) ? { time: "", branchId: "" } : {}),
  }));

  const submitBooking = async (event) => {
    event.preventDefault();
    if (!booking.doctorId || !booking.date || !booking.time || bookingLoading) return;
    setBookingLoading(true);
    setError("");
    try {
      const response = await fetch(`${API_URL}/api/patientform/appointments`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: authorizationtoken, "Idempotency-Key": crypto.randomUUID() },
        body: JSON.stringify(booking),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.msg || data.message || "Unable to book this appointment.");
      const doctor = doctors.find((item) => item._id === booking.doctorId);
      const confirmation = `Appointment booked with ${doctor?.name || "the doctor"} on ${booking.date} at ${booking.time}.`;
      setMessages((current) => [...current, { role: "assistant", content: confirmation }]);
      speak(confirmation);
      setBookingOpen(false);
      setBooking({ doctorId: "", date: "", time: "", reason: "Appointment booking", paymentMethod: "cash" });
    } catch (bookingError) {
      setError(bookingError.message || "Unable to book this appointment.");
    } finally {
      setBookingLoading(false);
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
            <Stack direction="row" spacing={0.5}>
              <IconButton aria-label={speechEnabled ? "Mute assistant" : "Enable assistant voice"} onClick={() => setSpeechEnabled((current) => !current)} sx={{ color: "white" }}>{speechEnabled ? <VolumeUp /> : <VolumeOff />}</IconButton>
              <IconButton aria-label="Close assistant" onClick={() => setOpen(false)} sx={{ color: "white" }}><Close /></IconButton>
            </Stack>
          </Box>

          <Box sx={{ flex: 1, overflowY: "auto", p: 2, bgcolor: "#f7faff" }}>
            <Stack spacing={1.5}>
              <Button variant="outlined" size="small" startIcon={<CalendarMonth />} onClick={() => setBookingOpen((current) => !current)} sx={{ alignSelf: "flex-start" }}>
                {bookingOpen ? "Close booking" : "Book an appointment"}
              </Button>
              {bookingOpen && (
                <Box component="form" onSubmit={submitBooking} sx={{ p: 1.5, bgcolor: "white", borderRadius: 3, border: "1px solid", borderColor: "#dbeafe", boxShadow: "0 5px 15px rgba(15,76,129,.07)" }}>
                  <Stack spacing={1.2}>
                    <Typography variant="subtitle2" fontWeight={700}>Book with Docify Assistant</Typography>
                    <Select size="small" value={booking.doctorId} onChange={updateBooking("doctorId")} displayEmpty required>
                      <MenuItem value="" disabled>Select a doctor</MenuItem>
                      {doctors.map((doctor) => <MenuItem key={doctor._id} value={doctor._id}>{doctor.name} {doctor.specialization ? `(${doctor.specialization})` : ""}</MenuItem>)}
                    </Select>
                    <TextField size="small" fullWidth type="date" label="Appointment date" value={booking.date} onChange={updateBooking("date")} InputLabelProps={{ shrink: true }} inputProps={{ min: todayInIndia() }} required />
                    {booking.doctorId && booking.date && <Box>
                      <Typography variant="caption" fontWeight={700} color="text.secondary">Available times</Typography>
                      {availabilityLoading ? <Typography variant="body2" sx={{ mt: 0.5 }}>Checking doctor availability…</Typography> : availableSlots.length ? <Stack direction="row" flexWrap="wrap" gap={0.75} sx={{ mt: 0.75 }}>{availableSlots.map((slot) => <Button key={`${slot.branchId}-${slot.label}`} type="button" size="small" variant={booking.time === slot.label && String(booking.branchId) === String(slot.branchId) ? "contained" : "outlined"} onClick={() => setBooking((current) => ({ ...current, time: slot.label, branchId: slot.branchId }))}>{slot.label}</Button>)}</Stack> : <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>No future slots are available on this date.</Typography>}
                    </Box>}
                    <TextField size="small" label="Reason (optional)" value={booking.reason} onChange={updateBooking("reason")} inputProps={{ maxLength: 200 }} />
                    <Button type="submit" variant="contained" disabled={bookingLoading || !booking.doctorId || !booking.date || !booking.time}>{bookingLoading ? "Booking..." : "Confirm appointment"}</Button>
                  </Stack>
                </Box>
              )}
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
              <TextField fullWidth size="small" multiline minRows={1} maxRows={4} value={input} onChange={(event) => setInput(event.target.value)} placeholder="Ask or say: book an appointment..." inputProps={{ maxLength: 2000, "aria-label": "Message Docify Assistant" }} InputProps={{ sx: { color: "#0f172a !important", WebkitTextFillColor: "#0f172a !important", bgcolor: "#fff", fontWeight: 600 } }} disabled={loading} sx={{ "& .MuiInputBase-root": { bgcolor: "#fff", borderRadius: 2, color: "#0f172a !important", fontSize: "0.95rem" }, "& .MuiInputBase-input, & textarea": { color: "#0f172a !important", WebkitTextFillColor: "#0f172a !important", opacity: "1 !important", caretColor: "#1976d2", fontWeight: "600 !important" }, "& textarea::placeholder": { color: "#64748b", opacity: "1 !important" } }} />
              <IconButton color={voiceActive ? "error" : "primary"} type="button" aria-label={voiceActive ? "Stop voice input" : "Start voice input"} onClick={toggleVoice}>{voiceActive ? <Stop /> : <Mic />}</IconButton>
              <IconButton color="primary" type="submit" aria-label="Send question" disabled={!input.trim() || loading}><Send /></IconButton>
            </Stack>
          </Box>
        </Paper>
      )}
    </>
  );
};

export default AssistantChat;
