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
} from "@mui/material";
import { format } from "date-fns";

const appointmentsData = [
  {
    id: 1,
    doctor: "Dr. Emily Smith",
    date: "2025-03-10",
    time: "10:00 AM",
    status: "Upcoming",
  },
  {
    id: 2,
    doctor: "Dr. John Doe",
    date: "2025-02-25",
    time: "2:30 PM",
    status: "Past",
  },
];

const parseAppointmentDateTime = (appointment) => {
  const dateValue = appointment?.date || "";
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

const getStoredBookings = () => {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem("appointmentBookings") || "[]");
  } catch {
    return [];
  }
};

const persistStoredBookings = (items) => {
  if (typeof window === "undefined") return;
  const bookings = items.filter((item) => item.source === "booking");
  localStorage.setItem("appointmentBookings", JSON.stringify(bookings));
};

const PatientDashboard = () => {
  const [appointments, setAppointments] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState("");

  useEffect(() => {
    const loadAppointments = () => {
      const storedBookings = getStoredBookings();
      const merged = sortAppointments([
        ...appointmentsData.map((appointment) => ({ ...appointment, source: "seed" })),
        ...storedBookings,
      ]);
      setAppointments(merged);
    };

    loadAppointments();
    window.addEventListener("appointments-updated", loadAppointments);
    return () => window.removeEventListener("appointments-updated", loadAppointments);
  }, []);

  const handleReschedule = (appointment) => {
    if (!isAppointmentUpcoming(appointment)) {
      return;
    }

    setSelectedAppointment(appointment);
    setNewDate(appointment.date);
    setNewTime(appointment.time);
    setOpenDialog(true);
  };

  const handleSaveReschedule = () => {
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

    const updated = appointments.map((app) =>
      app.id === selectedAppointment.id
        ? {
            ...app,
            date: newDate,
            time: newTime,
            status: "Upcoming",
          }
        : app
    );
    const sorted = sortAppointments(updated);
    setAppointments(sorted);
    persistStoredBookings(sorted);
    setOpenDialog(false);
  };

  const handleCancel = (id) => {
    const updated = appointments.filter((app) => app.id !== id);
    setAppointments(sortAppointments(updated));
    persistStoredBookings(updated);
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4, px: { xs: 2, md: 4, lg: 6 } }}>
      <Paper elevation={4} sx={{ p: { xs: 3, md: 5, lg: 6 }, borderRadius: 4, background: "linear-gradient(135deg, #f8fbff 0%, #eef4ff 100%)" }}>
        <Typography variant="h4" fontWeight={700} color="primary.main" gutterBottom>
          Your Appointments
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
          Review your upcoming visits, reschedule if needed, and keep track of recent completed appointments.
        </Typography>

        <Stack direction="row" spacing={1} sx={{ mb: 3, flexWrap: "wrap" }}>
          <Chip label="Upcoming first" color="primary" variant="outlined" />
          <Chip label="Past visits below" color="secondary" variant="outlined" />
          <Chip label="Reschedule both date & time" color="success" variant="outlined" />
        </Stack>

        <List sx={{ display: "grid", gap: 1.5 }}>
          {appointments.map((app) => {
            const upcoming = isAppointmentUpcoming(app);
            return (
              <ListItem
                key={app.id}
                divider
                sx={{
                  mb: 0,
                  borderRadius: 2,
                  bgcolor: upcoming ? "#ffffff" : "#f7f9fc",
                  border: `1px solid ${upcoming ? "#dbeafe" : "#e5e7eb"}`,
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
                        {app.doctor}
                      </Typography>
                      <Chip
                        label={upcoming ? "Upcoming" : "Completed"}
                        size="small"
                        color={upcoming ? "primary" : "default"}
                        variant={upcoming ? "filled" : "outlined"}
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
                    <Button color="error" variant="outlined" onClick={() => handleCancel(app.id)}>
                      Cancel
                    </Button>
                  </Stack>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    Past appointment
                  </Typography>
                )}
              </ListItem>
            );
          })}
        </List>
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
    </Container>
  );
};

export default PatientDashboard;
