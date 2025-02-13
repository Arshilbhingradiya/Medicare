import React, { useState } from "react";
import {
  Container,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  MenuItem,
  Grid,
  RadioGroup,
  FormControlLabel,
  Radio,
  InputAdornment,
} from "@mui/material";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import dayjs from "dayjs";

const Patientappoinment = () => {
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [selectedTime, setSelectedTime] = useState("");
  const [consultationType, setConsultationType] = useState("in-person");
  const [file, setFile] = useState(null);

  const availableTimeSlots = [
    "10:00 AM",
    "11:30 AM",
    "2:00 PM",
    "3:30 PM",
    "5:00 PM",
  ];

  const handleFileUpload = (event) => {
    setFile(event.target.files[0]);
  };

  const handleBooking = () => {
    alert(
      `Appointment booked on ${selectedDate.format(
        "YYYY-MM-DD"
      )} at ${selectedTime}`
    );
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      {/* Doctor Information */}
      <Card sx={{ mb: 3, p: 2 }}>
        <CardContent>
          <Typography variant="h5" fontWeight="bold">
            Dr. John Doe
          </Typography>
          <Typography variant="body1" color="textSecondary">
            Cardiologist | 10 Years Experience
          </Typography>
          <Typography variant="body2">Clinic: HeartCare Hospital</Typography>
        </CardContent>
      </Card>

      {/* Appointment Form */}
      <Card sx={{ p: 3 }}>
        <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
          Book an Appointment
        </Typography>

        {/* Date Picker */}
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DatePicker
            label="Select Date"
            value={selectedDate}
            onChange={(newDate) => setSelectedDate(newDate)}
            renderInput={(params) => (
              <TextField {...params} fullWidth sx={{ mb: 2 }} />
            )}
          />
        </LocalizationProvider>

        {/* Time Slots */}
        <TextField
          select
          label="Select Time"
          value={selectedTime}
          onChange={(e) => setSelectedTime(e.target.value)}
          fullWidth
          sx={{ mb: 2 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <AccessTimeIcon />
              </InputAdornment>
            ),
          }}
        >
          {availableTimeSlots.map((slot) => (
            <MenuItem key={slot} value={slot}>
              {slot}
            </MenuItem>
          ))}
        </TextField>

        {/* Consultation Mode */}
        <Typography variant="subtitle1" fontWeight="bold" sx={{ mt: 2 }}>
          Consultation Type
        </Typography>
        <RadioGroup
          row
          value={consultationType}
          onChange={(e) => setConsultationType(e.target.value)}
        >
          <FormControlLabel
            value="in-person"
            control={<Radio />}
            label="In-Person Visit"
          />
          <FormControlLabel
            value="video"
            control={<Radio />}
            label="Online Video Call"
          />
        </RadioGroup>

        {/* Upload Medical Reports */}
        <Button
          variant="contained"
          component="label"
          startIcon={<CloudUploadIcon />}
          sx={{ mt: 2, mb: 3 }}
        >
          Upload Medical Reports
          <input type="file" hidden onChange={handleFileUpload} />
        </Button>
        {file && (
          <Typography variant="body2">File Uploaded: {file.name}</Typography>
        )}

        {/* Confirm Booking Button */}
        <Button
          variant="contained"
          color="primary"
          fullWidth
          sx={{ mt: 3 }}
          onClick={handleBooking}
        >
          Confirm Appointment
        </Button>
      </Card>
    </Container>
  );
};

export default Patientappoinment;
