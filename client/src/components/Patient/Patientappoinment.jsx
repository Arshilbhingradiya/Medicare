import React, { useState, useEffect } from "react";
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
} from "@mui/material";
import { format } from "date-fns";

// Dummy Data for Doctors
const doctors = [
  {
    id: 1,
    name: "Dr. John Doe",
    specialization: "Cardiologist",
    city: "Delhi",
  },
  { id: 2, name: "Dr. Jane Smith", specialization: "Dentist", city: "Mumbai" },
  {
    id: 3,
    name: "Dr. Alex Brown",
    specialization: "Orthopedic",
    city: "Delhi",
  },
  {
    id: 4,
    name: "Dr. Lisa Green",
    specialization: "Dermatologist",
    city: "Bangalore",
  },
];

// Max patients per time slot
const slotsPerHour = 8;

const PatientAppointment = () => {
  const [filters, setFilters] = useState({
    city: "",
    specialization: "",
    name: "",
  });
  const [filteredDoctors, setFilteredDoctors] = useState(doctors);
  const [selectedDoctor, setSelectedDoctor] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [availableSlots, setAvailableSlots] = useState(slotsPerHour);

  // Update filtered doctor list based on selected filters
  useEffect(() => {
    const filtered = doctors.filter(
      (doc) =>
        (filters.city ? doc.city === filters.city : true) &&
        (filters.specialization
          ? doc.specialization === filters.specialization
          : true) &&
        (filters.name
          ? doc.name.toLowerCase().includes(filters.name.toLowerCase())
          : true)
    );
    setFilteredDoctors(filtered);
  }, [filters]);

  // Handle changes in filter inputs
  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  // Handle Doctor Selection
  const handleDoctorChange = (event) => {
    setSelectedDoctor(event.target.value);
  };

  // Handle Date Selection
  const handleDateChange = (event) => {
    setSelectedDate(event.target.value);
  };

  // Handle Time Selection & Check Availability
  const handleTimeChange = (event) => {
    const time = event.target.value;
    setSelectedTime(time);

    // Simulate real-time slot calculation (randomized for now)
    const remainingSlots = Math.floor(Math.random() * (slotsPerHour + 1));
    setAvailableSlots(remainingSlots);
  };

  // Handle Appointment Booking
  const handleSubmit = () => {
    if (!selectedDoctor || !selectedDate || !selectedTime) {
      alert("Please select all fields before booking.");
      return;
    }

    alert(
      `Appointment booked successfully with ${selectedDoctor} on ${selectedDate} at ${selectedTime}`
    );
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Paper elevation={3} sx={{ padding: 4, borderRadius: "12px" }}>
        <Typography variant="h5" gutterBottom align="center">
          Book an Appointment
        </Typography>

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
        <TextField
          fullWidth
          label="Select Time"
          type="time"
          InputLabelProps={{ shrink: true }}
          value={selectedTime}
          onChange={handleTimeChange}
          margin="normal"
        />

        {/* Available Slots Info */}
        {selectedTime && (
          <Typography
            variant="body1"
            color={availableSlots > 0 ? "green" : "red"}
            sx={{ mt: 2 }}
          >
            {availableSlots > 0
              ? `${availableSlots} slots left for this time slot`
              : "No slots available"}
          </Typography>
        )}

        {/* Submit Button */}
        <Button
          variant="contained"
          color="primary"
          fullWidth
          onClick={handleSubmit}
          sx={{ mt: 3 }}
          disabled={availableSlots === 0}
        >
          Book Appointment
        </Button>
      </Paper>
    </Container>
  );
};

export default PatientAppointment;
