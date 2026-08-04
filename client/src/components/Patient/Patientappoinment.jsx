import React, { useState, useEffect } from "react";
import { useAuth } from "../../store/auth";
import {
  Container,
  TextField,
  Button,
  Typography,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Grid,
  Paper,
  Box,
  Chip,
  Stack,
  Alert,
} from "@mui/material";

const buildDoctorOptions = () => {
  if (typeof window === "undefined") return [];

  try {
    const stored = localStorage.getItem("doctorProfile");
    if (!stored) return [];

    const doctor = JSON.parse(stored);
    return [{
      id: 1,
      name: doctor.name || "Dr. Current User",
      specialization: doctor.specialization || "General Physician",
      city: doctor.city || "Unknown",
      availabilitySchedule: doctor.availabilitySchedule || "09:00-13:00,17:00-20:00",
      slotCapacity: Number(doctor.slotCapacity || 4),
    }];
  } catch {
    return [];
  }
};

const defaultDoctors = buildDoctorOptions().length > 0 ? buildDoctorOptions() : [
  {
    id: 1,
    name: "Dr. John Doe",
    specialization: "Cardiologist",
    city: "Delhi",
    availabilitySchedule: "09:00-13:00,17:00-20:00",
    slotCapacity: 4,
  },
  { id: 2, name: "Dr. Jane Smith", specialization: "Dentist", city: "Mumbai", availabilitySchedule: "10:00-14:00", slotCapacity: 2 },
  {
    id: 3,
    name: "Dr. Alex Brown",
    specialization: "Orthopedic",
    city: "Delhi",
    availabilitySchedule: "09:00-12:00,15:00-18:00",
    slotCapacity: 3,
  },
  {
    id: 4,
    name: "Dr. Lisa Green",
    specialization: "Dermatologist",
    city: "Bangalore",
    availabilitySchedule: "11:00-16:00",
    slotCapacity: 5,
  },
];

const parseSchedule = (schedule) => {
  if (!schedule) return [];
  return schedule
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean)
    .map((entry) => {
      const [start, end] = entry.split("-").map((value) => value.trim());
      return { start, end };
    });
};

const createTimeSlots = (schedule, capacity) => {
  const slots = [];
  const ranges = parseSchedule(schedule);

  ranges.forEach(({ start, end }) => {
    const startHour = Number(start.split(":")[0]);
    const endHour = Number(end.split(":")[0]);
    for (let hour = startHour; hour < endHour; hour += 1) {
      slots.push({
        label: `${String(hour).padStart(2, "0")}:00-${String(hour + 1).padStart(2, "0")}:00`,
        capacity,
      });
    }
  });

  return slots;
};

const getBookings = () => {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem("appointmentBookings") || "[]");
  } catch {
    return [];
  }
};

const PatientAppointment = () => {
  const [filters, setFilters] = useState({
    city: "",
    specialization: "",
    name: "",
  });
  const [doctors, setDoctors] = useState(defaultDoctors);
  const [filteredDoctors, setFilteredDoctors] = useState(defaultDoctors);
  const [selectedDoctor, setSelectedDoctor] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [availableSlots, setAvailableSlots] = useState(0);
  const [message, setMessage] = useState("");
  const [bookings, setBookings] = useState(getBookings());
  const { user } = useAuth();

  useEffect(() => {
    const storedDoctors = buildDoctorOptions();
    const mergedDoctors = storedDoctors.length > 0 ? storedDoctors : defaultDoctors;
    setDoctors(mergedDoctors);
    setFilteredDoctors(mergedDoctors);
  }, []);

  useEffect(() => {
    const filtered = doctors.filter(
      (doc) =>
        (filters.city ? doc.city === filters.city : true) &&
        (filters.specialization ? doc.specialization === filters.specialization : true) &&
        (filters.name ? doc.name.toLowerCase().includes(filters.name.toLowerCase()) : true)
    );
    setFilteredDoctors(filtered);
  }, [filters, doctors]);

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleDoctorChange = (event) => {
    setSelectedDoctor(event.target.value);
    setSelectedTime("");
    setAvailableSlots(0);
    setMessage("");
  };

  const handleDateChange = (event) => {
    setSelectedDate(event.target.value);
    setSelectedTime("");
    setAvailableSlots(0);
    setMessage("");
  };

  const isSlotAvailableForBooking = (selectedDateValue, selectedTimeValue) => {
    const now = new Date();
    const selectedDateTime = new Date(`${selectedDateValue}T${selectedTimeValue?.split("-")[0] || "00:00"}`);
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const chosenDay = new Date(selectedDateValue);

    if (chosenDay < today) {
      return false;
    }

    if (chosenDay.getTime() === today.getTime() && Number.isNaN(selectedDateTime.getTime())) {
      return false;
    }

    if (chosenDay.getTime() === today.getTime()) {
      const [hour, minute] = (selectedTimeValue?.split("-")[0] || "00:00").match(/(\d{1,2}):(\d{2})/)?.slice(1).map(Number) || [0, 0];
      const selectedHour = hour % 12 + (selectedTimeValue?.includes("PM") ? 12 : 0);
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();
      return selectedHour > currentHour || (selectedHour === currentHour && minute > currentMinute);
    }

    return true;
  };

  const handleTimeChange = (event) => {
    const time = event.target.value;
    setSelectedTime(time);

    const selectedDoc = doctors.find((doctor) => doctor.name === selectedDoctor);
    if (!selectedDoc) {
      setAvailableSlots(0);
      setMessage("Please select a doctor first.");
      return;
    }

    const bookedCount = bookings.filter(
      (booking) => booking.doctor === selectedDoc.name && booking.date === selectedDate && booking.time === time
    ).length;

    const remaining = Math.max(0, selectedDoc.slotCapacity - bookedCount);
    setAvailableSlots(remaining);
    setMessage(remaining > 0 ? `${remaining} slot${remaining > 1 ? "s" : ""} left` : "No slots available");
  };

  const handleSubmit = () => {
    if (!selectedDoctor || !selectedDate || !selectedTime) {
      setMessage("Please select doctor, date and time before booking.");
      return;
    }

    const selectedDoc = doctors.find((doctor) => doctor.name === selectedDoctor);
    if (!selectedDoc) {
      setMessage("Selected doctor could not be found.");
      return;
    }

    const currentBookings = getBookings();
    const bookedCount = currentBookings.filter(
      (booking) => booking.doctor === selectedDoc.name && booking.date === selectedDate && booking.time === selectedTime
    ).length;

    if (!isSlotAvailableForBooking(selectedDate, selectedTime)) {
      setMessage("Please choose a future date and time.");
      return;
    }

    if (bookedCount >= selectedDoc.slotCapacity) {
      setMessage("No slots available for this time.");
      return;
    }

    const newBooking = {
      id: Date.now(),
      doctor: selectedDoc.name,
      date: selectedDate,
      time: selectedTime,
      status: "upcoming",
      createdAt: new Date().toISOString(),
      source: "booking",
      patientName: user?.username || user?.name || "Patient",
      patientId: user?.id || null,
    };

    const existingNotifications = JSON.parse(localStorage.getItem("appointmentNotifications") || "[]");
    const updatedNotifications = [newBooking, ...existingNotifications].filter(
      (item, index, arr) => arr.findIndex((entry) => entry.id === item.id) === index
    ).slice(0, 8);
    const updatedBookings = [...currentBookings, newBooking];
    localStorage.setItem("appointmentBookings", JSON.stringify(updatedBookings));
    localStorage.setItem("appointmentNotifications", JSON.stringify(updatedNotifications));
    localStorage.setItem("latestAppointmentNotification", JSON.stringify(newBooking));
    localStorage.setItem(`patientNotification_${user?.id || "guest"}`, JSON.stringify(newBooking));
    window.dispatchEvent(new Event("appointments-updated"));
    setBookings(updatedBookings);
    setMessage(`Appointment booked with ${selectedDoc.name} on ${selectedDate} at ${selectedTime}`);
    setAvailableSlots(Math.max(0, selectedDoc.slotCapacity - (bookedCount + 1)));
  };

  const selectedDoctorData = doctors.find((doctor) => doctor.name === selectedDoctor);
  const timeOptions = selectedDoctorData ? createTimeSlots(selectedDoctorData.availabilitySchedule, selectedDoctorData.slotCapacity) : [];

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 6 }}>
      <Paper elevation={4} sx={{ p: { xs: 3, md: 5 }, borderRadius: "16px", background: "linear-gradient(135deg, #f8fbff 0%, #eef4ff 100%)" }}>
        <Box sx={{ textAlign: "center", mb: 3 }}>
          <Typography variant="h4" fontWeight={700} color="primary.main">
            Schedule Your Visit
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
            Choose a doctor, preferred date, and time slot to book a consultation.
          </Typography>
        </Box>

        <Stack direction="row" spacing={1} sx={{ mb: 3, justifyContent: "center", flexWrap: "wrap" }}>
          <Chip label="Verified doctors" color="primary" variant="outlined" />
          <Chip label="Flexible slots" color="secondary" variant="outlined" />
          <Chip label="Secure booking" color="success" variant="outlined" />
        </Stack>

        {/* Doctor Filter Section */}
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Filter by City</InputLabel>
              <Select
                name="city"
                value={filters.city}
                onChange={handleFilterChange}
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="Delhi">Delhi</MenuItem>
                <MenuItem value="Mumbai">Mumbai</MenuItem>
                <MenuItem value="Bangalore">Bangalore</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Filter by Specialization</InputLabel>
              <Select
                name="specialization"
                value={filters.specialization}
                onChange={handleFilterChange}
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="Cardiologist">Cardiologist</MenuItem>
                <MenuItem value="Dentist">Dentist</MenuItem>
                <MenuItem value="Orthopedic">Orthopedic</MenuItem>
                <MenuItem value="Dermatologist">Dermatologist</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Search by Name"
              name="name"
              value={filters.name}
              onChange={handleFilterChange}
            />
          </Grid>
        </Grid>

        {/* Doctor Selection */}
        <FormControl fullWidth margin="normal">
          <InputLabel>Select Doctor</InputLabel>
          <Select value={selectedDoctor} onChange={handleDoctorChange}>
            {filteredDoctors.map((doctor) => (
              <MenuItem key={doctor.id} value={doctor.name}>
                {doctor.name} - {doctor.specialization} ({doctor.city})
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Date Selection */}
        <TextField
          fullWidth
          label="Select Date"
          type="date"
          InputLabelProps={{ shrink: true }}
          value={selectedDate}
          onChange={handleDateChange}
          margin="normal"
        />

        {/* Time Selection */}
        <FormControl fullWidth margin="normal">
          <InputLabel>Select Time Slot</InputLabel>
          <Select value={selectedTime} onChange={handleTimeChange} disabled={!selectedDoctorData}>
            {timeOptions.map((slot) => (
              <MenuItem key={slot.label} value={slot.label}>
                {slot.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {message && (
          <Alert severity={message.includes("booked") || message.includes("slot") ? "success" : availableSlots === 0 ? "warning" : "info"} sx={{ mt: 2 }}>
            {message}
          </Alert>
        )}

        <Button
          variant="contained"
          color="primary"
          fullWidth
          onClick={handleSubmit}
          sx={{ mt: 3, py: 1.2, borderRadius: "12px", fontWeight: 600 }}
          disabled={!selectedTime || availableSlots === 0}
        >
          Book Appointment
        </Button>
      </Paper>
    </Container>
  );
};

export default PatientAppointment;
