import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Grid,
  Paper,
  Stack,
  TextField,
  Typography,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Alert,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../store/auth";
import { API_URL } from "../../config";

const getDoctorKey = (doctorName) =>
  (doctorName || "doctor")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const getTodayDate = () => new Date().toISOString().split("T")[0];

const Doctordashboard = () => {
  const { user, authorizationtoken } = useAuth();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [selectedDate, setSelectedDate] = useState(getTodayDate());
  const [message, setMessage] = useState("");
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [notes, setNotes] = useState("");
  const [notesDialogOpen, setNotesDialogOpen] = useState(false);
  const [subscriptionStatus, setSubscriptionStatus] = useState(null);
  const [subscriptionExpiry, setSubscriptionExpiry] = useState(null);
  const [trialEndsAt, setTrialEndsAt] = useState(null);

  const doctorName =
    JSON.parse(localStorage.getItem("doctorProfile") || "{}")?.name ||
    user?.username ||
    user?.name ||
    "Dr. Current User";

  useEffect(() => {
    const syncAppointments = () => {
      const stored = JSON.parse(localStorage.getItem("appointmentBookings") || "[]");
      const doctorAppointments = (Array.isArray(stored) ? stored : []).filter(
        (booking) => booking.doctor === doctorName && booking.status !== "completed"
      );
      setAppointments(doctorAppointments);
    };

    syncAppointments();
    window.addEventListener("appointments-updated", syncAppointments);
    return () => window.removeEventListener("appointments-updated", syncAppointments);
  }, [doctorName]);

  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        const response = await fetch(
          "${API_URL}/api/doctorform/subscription/status",
          {
            method: "GET",
            headers: { Authorization: authorizationtoken },
          }
        );
        if (response.ok) {
          const data = await response.json();
          setSubscriptionStatus(data.status || "None");
          setSubscriptionExpiry(data.subscription?.expiryDate || data.expiryDate || null);
          setTrialEndsAt(data.trialEndsAt || null);
        }
      } catch (error) {
        console.error("Error fetching subscription:", error);
      }
    };
    fetchSubscription();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const visibleAppointments = appointments.filter((appointment) => appointment.date === selectedDate);

  const handleOpenNotes = (appointment) => {
    setSelectedAppointment(appointment);
    setNotes(appointment.notes || "");
    setNotesDialogOpen(true);
  };

  const handleOpenPatientFile = (appointment) => {
    navigate(`/patientfile/${appointment.id}`);
  };

  const handleSaveNotes = () => {
    if (!selectedAppointment) return;

    const stored = JSON.parse(localStorage.getItem("appointmentBookings") || "[]");
    const updated = stored.map((booking) =>
      booking.id === selectedAppointment.id
        ? { ...booking, notes, status: booking.status === "completed" ? "completed" : booking.status }
        : booking
    );
    localStorage.setItem("appointmentBookings", JSON.stringify(updated));

    const historyKey = `doctorPatientHistory_${getDoctorKey(doctorName)}`;
    const existingHistory = JSON.parse(localStorage.getItem(historyKey) || "[]");
    const entry = {
      id: Date.now(),
      patientName: selectedAppointment.patientName || "Patient",
      doctorName,
      date: selectedAppointment.date,
      time: selectedAppointment.time,
      notes: notes || `Treatment completed for ${selectedAppointment.patientName || "patient"} on ${selectedAppointment.date} at ${selectedAppointment.time}.`,
      createdAt: new Date().toISOString(),
    };
    localStorage.setItem(historyKey, JSON.stringify([entry, ...existingHistory]));

    setAppointments((prev) => prev.map((item) => (item.id === selectedAppointment.id ? { ...item, notes } : item)));
    setNotesDialogOpen(false);
    setSelectedAppointment(null);
    setNotes("");
    window.dispatchEvent(new Event("appointments-updated"));
    window.dispatchEvent(new Event("history-updated"));
    setMessage(`Saved notes for ${selectedAppointment.patientName || "patient"}.`);
  };

  const handleMarkDone = (appointment) => {
    const stored = JSON.parse(localStorage.getItem("appointmentBookings") || "[]");
    const updated = stored.map((booking) =>
      booking.id === appointment.id ? { ...booking, status: "completed", completedAt: new Date().toISOString(), notes: booking.notes || `Treatment completed for ${appointment.patientName || "patient"} on ${appointment.date} at ${appointment.time}.` } : booking
    );
    localStorage.setItem("appointmentBookings", JSON.stringify(updated));

    setAppointments((prev) => prev.filter((item) => item.id !== appointment.id));
    window.dispatchEvent(new Event("appointments-updated"));
    window.dispatchEvent(new Event("history-updated"));
    setMessage(`Marked ${appointment.patientName || "patient"} as treated.`);
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4, px: { xs: 2, md: 4, lg: 6 } }}>
      <Paper elevation={4} sx={{ p: { xs: 3, md: 5, lg: 6 }, borderRadius: 4, background: "linear-gradient(135deg, #f8fbff 0%, #eef4ff 100%)" }}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" fontWeight={700} color="primary.main" gutterBottom>
            {doctorName}
          </Typography>
          <Typography variant="h5" fontWeight={600} color="text.primary">
            Dashboard
          </Typography>
<Typography variant="body1" color="text.secondary" sx={{ mt: 0.5 }}>
            Review today’s visits first and switch to any other date to see planned appointments.
          </Typography>
        </Box>

        {subscriptionStatus === "Active" && subscriptionExpiry && (
          <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>
            Your subscription is <strong>Active</strong> until{" "}
            <strong>{new Date(subscriptionExpiry).toLocaleDateString()}</strong>.
          </Alert>
        )}

        {subscriptionStatus === "Trial" && trialEndsAt && (
          <Alert severity="info" sx={{ mb: 3, borderRadius: 2 }}>
            You are on a <strong>14-day free trial</strong> ending on{" "}
            <strong>{new Date(trialEndsAt).toLocaleDateString()}</strong>.{" "}
            <Button
              color="primary"
              size="small"
              onClick={() => navigate("/subscription")}
            >
              Subscribe Now
            </Button>
          </Alert>
        )}

        {subscriptionStatus === "None" && (
          <Alert severity="warning" sx={{ mb: 3, borderRadius: 2 }}>
            You have no active subscription.{" "}
            <Button
              color="primary"
              size="small"
              onClick={() => navigate("/subscription")}
            >
              Start Free Trial / Subscribe
            </Button>
          </Alert>
        )}

        <Stack direction={{ xs: "column", md: "row" }} spacing={2} sx={{ mb: 3 }} alignItems={{ xs: "stretch", md: "center" }}>
          <TextField
            label="Select appointment date"
            type="date"
            value={selectedDate}
            onChange={(event) => setSelectedDate(event.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={{ minWidth: { xs: "100%", md: 260 } }}
          />
          <Chip label="Today by default" color="primary" variant="outlined" />
          <Chip label="Mark done to move to history" color="secondary" variant="outlined" />
        </Stack>

        {message && (
          <Box sx={{ mb: 3 }}>
            <Chip label={message} color="success" variant="outlined" />
          </Box>
        )}

        <Grid container spacing={2.5}>
          {visibleAppointments.length > 0 ? (
visibleAppointments.map((appointment) => (
              <Grid item xs={12} key={appointment.id}>
                <Card
                  sx={{
                    width: "100%",
                    borderRadius: 3,
                    boxShadow: "0 8px 24px rgba(13,71,161,0.08)",
                    cursor: "pointer",
                    transition: "transform 0.2s ease, box-shadow 0.2s ease",
                    '&:hover': {
                      transform: "translateY(-3px)",
                      boxShadow: "0 12px 30px rgba(13,71,161,0.15)",
                    },
                  }}
                  onClick={() => handleOpenPatientFile(appointment)}
                >
                  <CardContent
                    sx={{
                      display: "flex",
                      flexDirection: { xs: "column", sm: "row" },
                      alignItems: { xs: "flex-start", sm: "center" },
                      gap: 2,
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: { xs: 56, sm: 64 },
                        height: { xs: 56, sm: 64 },
                        borderRadius: 2,
                        bgcolor: "rgba(13,71,161,0.08)",
                        flexShrink: 0,
                      }}
                    >
                      <Typography variant="h5" fontWeight={800} color="primary.main">
                        {(appointment.patientName || "P").charAt(0).toUpperCase()}
                      </Typography>
                    </Box>
                    <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                      <Typography variant="h6" fontWeight={700} color="primary.main">
                        {appointment.patientName || "Patient"}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {appointment.date} • {appointment.time}
                      </Typography>
                      <Typography variant="body2" sx={{ mt: 0.5 }}>
                        Doctor: {appointment.doctor}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                        Click to open the full hospital case file.
                      </Typography>
                      <Box sx={{ mt: 1.5, display: "flex", gap: 1, flexWrap: "wrap" }}>
                        <Button
                          variant="contained"
                          color="primary"
                          size="small"
                          onClick={(event) => {
                            event.stopPropagation();
                            handleOpenPatientFile(appointment);
                          }}
                        >
                          Open File
                        </Button>
                        <Button
                          variant="outlined"
                          color="secondary"
                          size="small"
                          onClick={(event) => {
                            event.stopPropagation();
                            handleOpenNotes(appointment);
                          }}
                        >
                          Add Notes
                        </Button>
                        <Button
                          variant="outlined"
                          color="success"
                          size="small"
                          onClick={(event) => {
                            event.stopPropagation();
                            handleMarkDone(appointment);
                          }}
                        >
                          Mark Done
                        </Button>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))
          ) : (
            <Grid item xs={12}>
              <Paper sx={{ p: 4, textAlign: "center", borderRadius: 3, bgcolor: "#f8fbff" }}>
                <Typography variant="h6" color="text.secondary">
                  No appointments for this date yet.
                </Typography>
              </Paper>
            </Grid>
          )}
        </Grid>
      </Paper>

      <Dialog open={notesDialogOpen} onClose={() => setNotesDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add treatment notes</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            multiline
            minRows={4}
            label="Prescription / notes"
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNotesDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSaveNotes} variant="contained">
            Save Notes
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Doctordashboard;
