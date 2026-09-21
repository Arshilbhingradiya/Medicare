import { useState, useEffect } from "react";
import {
  Container,
  Paper,
  Typography,
  Button,
  List,
  ListItem,
  ListItemText,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Chip,
  Stack,
  Box,
  Tabs,
  Tab,
  Avatar,
  Grid,
} from "@mui/material";
import { CalendarMonth, CheckCircleOutline, EventBusyOutlined, UpcomingOutlined } from "@mui/icons-material";
import { format } from "date-fns";
import { API_URL } from "../../config";

const parseAppointmentDateTime = (appointment) => {
  const rawDate = appointment?.date || "";
  const dateValue =
    typeof rawDate === "string" && rawDate.includes("T")
      ? rawDate.split("T")[0]
      : rawDate;
  const [year, month, day] = dateValue.split("-").map(Number);
  const timeValue = appointment?.time || "00:00";
  const normalizedTime = timeValue.includes("-") ? timeValue.split("-")[0] : timeValue;
  const match = normalizedTime.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);

  if (!match) {
    return new Date(year || 2000, month ? month - 1 : 0, day || 1, 0, 0);
  }

  let hours = Number(match[1]);
  const minutes = Number(match[2]);
  const period = match[3]?.toUpperCase();

  if (period === "PM" && hours < 12) hours += 12;
  if (period === "AM" && hours === 12) hours = 0;

  return new Date(year || 2000, month ? month - 1 : 0, day || 1, hours, minutes);
};

const sortAppointments = (items) => {
  const upcoming = items.filter((appointment) => isAppointmentUpcoming(appointment));
  const past = items.filter((appointment) => !isAppointmentUpcoming(appointment));

  upcoming.sort((a, b) => parseAppointmentDateTime(a) - parseAppointmentDateTime(b));
  past.sort((a, b) => parseAppointmentDateTime(b) - parseAppointmentDateTime(a));

  return [...upcoming, ...past];
};

const isAppointmentUpcoming = (appointment) => {
  const target = parseAppointmentDateTime(appointment);
  return target.getTime() >= Date.now();
};

const PatientDashboard = () => {
  const [appointments, setAppointments] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState("");
  const [appointmentTab, setAppointmentTab] = useState("upcoming");
  const [notesAppointment, setNotesAppointment] = useState(null);

  // useEffect(() => {
  //   const loadAppointments = () => {
  //     const storedBookings = getStoredBookings();
  //     const merged = sortAppointments([
  //       ...appointmentsData.map((appointment) => ({ ...appointment, source: "seed" })),
  //       ...storedBookings,
  //     ]);
  //     setAppointments(merged);
  //   };

  //   loadAppointments();
  //   window.addEventListener("appointments-updated", loadAppointments);
  //   return () => window.removeEventListener("appointments-updated", loadAppointments);
  // }, []);

  useEffect(() => {
  const fetchAppointments = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) return;

      const response = await fetch(
        `${API_URL}/api/patientform/appointments/mine`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        console.error(
          "Failed to load appointments:",
          data
        );
        return;
      }

      setAppointments(
        Array.isArray(data) ? data : []
      );

    } catch (error) {
      console.error(
        "Error fetching appointments:",
        error
      );
    }
  };

  fetchAppointments();
  const refreshOnFocus = () => {
    if (document.visibilityState === "visible") fetchAppointments();
  };
  const interval = window.setInterval(fetchAppointments, 15000);
  document.addEventListener("visibilitychange", refreshOnFocus);
  window.addEventListener("appointments-updated", fetchAppointments);

  return () => {
    window.clearInterval(interval);
    document.removeEventListener("visibilitychange", refreshOnFocus);
    window.removeEventListener("appointments-updated", fetchAppointments);
  };
}, []);
  const handleReschedule = (appointment) => {
    if (!isAppointmentUpcoming(appointment)) {
      return;
    }

    setSelectedAppointment(appointment);
    const dateOnly = appointment.date
      ? new Date(appointment.date).toISOString().split("T")[0]
      : "";
    setNewDate(dateOnly);
    setNewTime(appointment.time);
    setOpenDialog(true);
  };

  const handleSaveReschedule = async () => {
    if (!selectedAppointment) return;

    if (!newDate || !newTime) {
      window.alert("Please choose both a new date and time.");
      return;
    }

    const nextDateTime = new Date(`${newDate}T${newTime}`);
    if (Number.isNaN(nextDateTime.getTime()) || nextDateTime.getTime() < Date.now()) {
      window.alert("Please choose a future date and time.");
      return;
    }

    const appointmentId = selectedAppointment._id || selectedAppointment.id;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${API_URL}/api/patientform/appointments/${appointmentId}/reschedule`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ date: newDate, time: newTime }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        window.alert(data.msg || "Failed to reschedule appointment.");
        return;
      }

      const updated = appointments.map((app) =>
        (app._id || app.id) === appointmentId ? { ...app, ...data } : app
      );
      setAppointments(sortAppointments(updated));
      setOpenDialog(false);
    } catch (error) {
      console.error("Error rescheduling appointment:", error);
      window.alert("Unable to connect to the server.");
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm("Cancel this appointment? The slot will become available to other patients.")) return;
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${API_URL}/api/patientform/appointments/${id}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status: "cancelled" }),
        }
      );

      if (!response.ok) {
        console.error("Failed to cancel appointment");
        return;
      }

      const updated = appointments.filter((app) => (app._id || app.id) !== id);
      setAppointments(sortAppointments(updated));
    } catch (error) {
      console.error("Error cancelling appointment:", error);
    }
  };

  const visibleAppointments = appointments.filter((appointment) => {
    if (appointmentTab === "completed") return appointment.status === "completed";
    if (appointmentTab === "cancelled") return appointment.status === "cancelled";
    return appointment.status !== "completed" && appointment.status !== "cancelled" && isAppointmentUpcoming(appointment);
  });
  const upcomingCount = appointments.filter((item) => item.status !== "cancelled" && item.status !== "completed" && isAppointmentUpcoming(item)).length;
  const completedCount = appointments.filter((item) => item.status === "completed").length;
  const cancelledCount = appointments.filter((item) => item.status === "cancelled").length;

  return (
    <Container maxWidth="xl" sx={{ py: 4, px: { xs: 2, md: 4, lg: 6 } }}>
      <Paper elevation={0} sx={{ overflow: "hidden", borderRadius: 4, border: "1px solid #dbeafe", background: "#f8fbff" }}>
        <Box sx={{ p: { xs: 2.5, md: 4 }, color: "white", background: "linear-gradient(125deg, #0f4c81, #1976d2 65%, #38bdf8)" }}>
          <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" spacing={2} alignItems={{ sm: "center" }}><Box><Typography variant="overline" sx={{ opacity: .8, letterSpacing: 1.3 }}>PATIENT PORTAL</Typography><Typography variant="h4" fontWeight={800}>Your appointments</Typography><Typography sx={{ opacity: .9, mt: .5 }}>Manage upcoming consultations and access completed visit notes.</Typography></Box><Avatar sx={{ width: 58, height: 58, bgcolor: "rgba(255,255,255,.18)" }}><CalendarMonth fontSize="large" /></Avatar></Stack>
        </Box>
        <Box sx={{ p: { xs: 2, md: 3.5 } }}>
        <Grid container spacing={1.5} sx={{ mb: 3 }}>
          {[["Upcoming", upcomingCount, UpcomingOutlined, "#1976d2"], ["Completed", completedCount, CheckCircleOutline, "#15803d"], ["Cancelled", cancelledCount, EventBusyOutlined, "#dc2626"]].map(([label, count, Icon, color]) => <Grid item xs={4} key={label}><Paper elevation={0} sx={{ p: { xs: 1.25, md: 1.75 }, border: "1px solid #e2e8f0", borderRadius: 3 }}><Stack direction={{ xs: "column", md: "row" }} spacing={1} alignItems="center"><Box sx={{ color, display: "grid" }}><Icon /></Box><Box><Typography fontWeight={800}>{count}</Typography><Typography variant="caption" color="text.secondary">{label}</Typography></Box></Stack></Paper></Grid>)}
        </Grid>

        <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: "wrap" }}>
          <Chip label="Upcoming first" color="primary" variant="outlined" />
          <Chip label="Past visits below" color="secondary" variant="outlined" />
          <Chip label="Reschedule both date & time" color="success" variant="outlined" />
        </Stack>

        <Tabs value={appointmentTab} onChange={(_, value) => setAppointmentTab(value)} sx={{ mb: 2 }}>
          <Tab value="upcoming" label="Upcoming" />
          <Tab value="completed" label="Completed" />
          <Tab value="cancelled" label="Cancelled" />
        </Tabs>

        <List sx={{ display: "grid", gap: 1.5 }}>
          {visibleAppointments.map((app) => {
            const upcoming = isAppointmentUpcoming(app);
            return (
              <ListItem
                key={app._id || app.id}
                divider
                sx={{
                  mb: 0,
                  borderRadius: 2,
                  bgcolor: upcoming ? "#ffffff" : "#f7f9fc",
                  border: `1px solid ${upcoming ? "#bfdbfe" : "#e5e7eb"}`,
                  boxShadow: upcoming ? "0 5px 16px rgba(15,76,129,.06)" : "none",
                  alignItems: "flex-start",
                  flexDirection: { xs: "column", sm: "row" },
                  gap: 1.5,
                  py: 2,
                  px: { xs: 1.5, md: 2.5 },
                }}
              >
                <ListItemText
                  primary={
                    <Box component="span" sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
                      <Typography variant="subtitle1" fontWeight={700}>
                        {app.doctorName || app.doctor}
                      </Typography>
                      <Chip
                        label={app.status ? app.status : upcoming ? "Upcoming" : "Completed"}
                        size="small"
                        color={upcoming ? "primary" : "default"}
                        variant={upcoming ? "filled" : "outlined"}
                        sx={{ textTransform: "capitalize" }}
                      />
                    </Box>
                  }
                  secondary={`Date: ${format(parseAppointmentDateTime(app), "MMMM dd, yyyy")}, Time: ${app.time}`}
                />
                {upcoming ? (
                  <Stack direction="row" spacing={1}>
                    <Button variant="outlined" onClick={() => handleReschedule(app)}>
                      Reschedule
                    </Button>
                    <Button color="error" variant="outlined" onClick={() => handleCancel(app._id || app.id)}>
                      Cancel
                    </Button>
                  </Stack>
                ) : (
                  <Button variant="outlined" onClick={() => setNotesAppointment(app)} disabled={app.status !== "completed"}>
                    View notes & prescription
                  </Button>
                )}
              </ListItem>
            );
          })}
          {visibleAppointments.length === 0 && (
            <Typography color="text.secondary">No {appointmentTab} appointments.</Typography>
          )}
        </List>
        </Box>
      </Paper>

      {/* Reschedule Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Reschedule Appointment</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="New Date"
            type="date"
            value={newDate}
            onChange={(e) => setNewDate(e.target.value)}
            margin="normal"
          />
          <TextField
            fullWidth
            label="New Time"
            type="time"
            value={newTime}
            onChange={(e) => setNewTime(e.target.value)}
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleSaveReschedule} color="primary">
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={Boolean(notesAppointment)} onClose={() => setNotesAppointment(null)} fullWidth maxWidth="sm">
        <DialogTitle>Consultation notes</DialogTitle>
        <DialogContent dividers>
          <Typography variant="subtitle2">Diagnosis</Typography>
          <Typography paragraph>{notesAppointment?.consultation?.diagnosis || "Not recorded"}</Typography>
          <Typography variant="subtitle2">Notes</Typography>
          <Typography paragraph>{notesAppointment?.consultation?.notes || notesAppointment?.notes || "Not recorded"}</Typography>
          <Typography variant="subtitle2">Medicines</Typography>
          {(notesAppointment?.consultation?.medicines || []).length ? notesAppointment.consultation.medicines.map((medicine, index) => (
            <Typography key={`${medicine.name}-${index}`} paragraph>{medicine.name} — {[medicine.dosage, medicine.frequency, medicine.duration].filter(Boolean).join(", ")}</Typography>
          )) : <Typography paragraph>No medicines prescribed.</Typography>}
          <Typography variant="subtitle2">Advice</Typography>
          <Typography>{notesAppointment?.consultation?.advice || "Not recorded"}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => window.print()}>Print</Button>
          <Button onClick={() => setNotesAppointment(null)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default PatientDashboard;
