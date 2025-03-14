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

const PatientDashboard = () => {
  const [appointments, setAppointments] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState("");

  useEffect(() => {
    setAppointments(appointmentsData);
  }, []);

  const handleReschedule = (appointment) => {
    setSelectedAppointment(appointment);
    setNewDate(appointment.date);
    setNewTime(appointment.time);
    setOpenDialog(true);
  };

  const handleSaveReschedule = () => {
    setAppointments((prev) =>
      prev.map((app) =>
        app.id === selectedAppointment.id
          ? { ...app, date: newDate, time: newTime }
          : app
      )
    );
    setOpenDialog(false);
  };

  const handleCancel = (id) => {
    setAppointments((prev) => prev.filter((app) => app.id !== id));
  };

  return (
    <Container>
      <Typography variant="h5" gutterBottom>
        Appointment Management
      </Typography>
      <Paper style={{ padding: 16 }}>
        <List>
          {appointments.map((app) => (
            <ListItem key={app.id} divider>
              <ListItemText
                primary={`Doctor: ${app.doctor}`}
                secondary={`Date: ${format(
                  new Date(app.date),
                  "MMMM dd, yyyy"
                )}, Time: ${app.time}`}
              />
              {app.status === "Upcoming" && (
                <>
                  <Button onClick={() => handleReschedule(app)}>
                    Reschedule
                  </Button>
                  <Button color="error" onClick={() => handleCancel(app.id)}>
                    Cancel
                  </Button>
                </>
              )}
            </ListItem>
          ))}
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
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default PatientDashboard;
