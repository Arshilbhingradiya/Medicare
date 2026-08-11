import { useState, useEffect } from "react";
import { useAuth } from "../../store/auth";
import { API_URL } from "../../config";
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
  Card,
  CardContent,
  CardActionArea,
  Avatar,
  Divider,
  Tooltip,
  Fade,
} from "@mui/material";
import {
  LocationOn,
  EventAvailable,
  Schedule,
  Verified,
  MedicalServices,
  Search,
  CalendarMonth,
  AccessTime,
  Person,
  CheckCircle,
  ArrowBack,
  ArrowForward,
  Groups,
} from "@mui/icons-material";

const defaultDoctors = [];

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
  const [messageType, setMessageType] = useState("info");
  const [bookings, setBookings] = useState(getBookings());
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const { user } = useAuth();

useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const response = await fetch("${API_URL}/api/doctorform/doctors");
        if (response.ok) {
          const data = await response.json();
          const mapped = (Array.isArray(data) ? data : data.doctors || []).map((doc) => ({
            id: doc._id,
            name: doc.name || "Dr. Unknown",
            specialization: doc.specialization || "General Physician",
            city: doc.city || "Unknown",
            availabilitySchedule: doc.availabilitySchedule || "09:00-13:00,17:00-20:00",
            slotCapacity: Number(doc.slotCapacity || 4),
            email: doc.email,
            clinicAddress: doc.clinicAddress,
            yearsOfExperience: doc.yearsOfExperience,
            qualifications: doc.qualifications,
            bio: doc.bio,
          }));
          setDoctors(mapped);
          setFilteredDoctors(mapped);
        }
      } catch (error) {
        console.error("Failed to fetch doctors:", error);
      }
    };

    fetchDoctors();
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

  const handleDoctorChange = (doctorName) => {
    setSelectedDoctor(doctorName);
    setSelectedTime("");
    setAvailableSlots(0);
    setMessage("");
    setMessageType("info");
    setBookingSuccess(false);
  };

  const handleDateChange = (event) => {
    setSelectedDate(event.target.value);
    setSelectedTime("");
    setAvailableSlots(0);
    setMessage("");
    setMessageType("info");
    setBookingSuccess(false);
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

  const handleTimeChange = (time) => {
    setSelectedTime(time);

    const selectedDoc = doctors.find((doctor) => doctor.name === selectedDoctor);
    if (!selectedDoc) {
      setAvailableSlots(0);
      setMessage("Please select a doctor first.");
      setMessageType("warning");
      return;
    }

    const bookedCount = bookings.filter(
      (booking) => booking.doctor === selectedDoc.name && booking.date === selectedDate && booking.time === time
    ).length;

    const remaining = Math.max(0, selectedDoc.slotCapacity - bookedCount);
    setAvailableSlots(remaining);
    if (remaining > 0) {
      setMessage(`${remaining} slot${remaining > 1 ? "s" : ""} left for this time`);
      setMessageType("success");
    } else {
      setMessage("No slots available");
      setMessageType("warning");
    }
  };

  const handleSubmit = () => {
    if (!selectedDoctor || !selectedDate || !selectedTime) {
      setMessage("Please select doctor, date and time before booking.");
      setMessageType("warning");
      return;
    }

    const selectedDoc = doctors.find((doctor) => doctor.name === selectedDoctor);
    if (!selectedDoc) {
      setMessage("Selected doctor could not be found.");
      setMessageType("error");
      return;
    }

    const currentBookings = getBookings();
    const bookedCount = currentBookings.filter(
      (booking) => booking.doctor === selectedDoc.name && booking.date === selectedDate && booking.time === selectedTime
    ).length;

    if (!isSlotAvailableForBooking(selectedDate, selectedTime)) {
      setMessage("Please choose a future date and time.");
      setMessageType("warning");
      return;
    }

    if (bookedCount >= selectedDoc.slotCapacity) {
      setMessage("No slots available for this time.");
      setMessageType("warning");
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
    setMessageType("success");
    setBookingSuccess(true);
    setAvailableSlots(Math.max(0, selectedDoc.slotCapacity - (bookedCount + 1)));
  };

  const selectedDoctorData = doctors.find((doctor) => doctor.name === selectedDoctor);
  const timeOptions = selectedDoctorData ? createTimeSlots(selectedDoctorData.availabilitySchedule, selectedDoctorData.slotCapacity) : [];

  const formatCustomDate = (dateValue) => {
    if (!dateValue) return "";
    const [year, month, day] = dateValue.split("-").map(Number);
    const dateObj = new Date(year, month - 1, day);
    return dateObj.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });
  };

  const getInitials = (name) => {
    if (!name) return "?";
    return name
      .replace("Dr.", "")
      .trim()
      .split(" ")
      .map((part) => part[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  const isSlotDisabled = (slot) => {
    if (!selectedDate) return false;
    return !isSlotAvailableForBooking(selectedDate, slot.label);
  };

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 2, md: 4 }, px: { xs: 1.5, md: 3 } }}>
      {/* Hero Header */}
      <Paper
        elevation={0}
        sx={{
          borderRadius: 4,
          overflow: "hidden",
          mb: 3,
          background: "linear-gradient(135deg, #0d47a1 0%, #1976d2 100%)",
          color: "white",
          position: "relative",
        }}
      >
        <Box
          sx={{
            p: { xs: 3, md: 5 },
            background: "radial-gradient(circle at 90% 10%, rgba(255,255,255,0.12) 0%, transparent 40%)",
          }}
        >
          <Stack direction={{ xs: "column", md: "row" }} spacing={2} justifyContent="space-between" alignItems={{ xs: "flex-start", md: "center" }}>
            <Box>
              <Typography variant="overline" sx={{ color: "#FFEB3B", fontWeight: 700, letterSpacing: 1.5 }}>
                Patient Portal
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 800, mt: 0.5 }}>
                Schedule Your Visit
              </Typography>
              <Typography variant="body1" sx={{ mt: 1, opacity: 0.95, maxWidth: 600 }}>
                Choose your preferred doctor, pick a convenient date and time slot, and let us take care of the rest.
              </Typography>
            </Box>
            <Stack direction={{ xs: "row", sm: "row" }} spacing={1} sx={{ flexWrap: "wrap" }}>
              <Chip icon={<Verified sx={{ color: "#FFEB3B" }} />} label="Verified doctors" sx={{ bgcolor: "rgba(255,255,255,0.16)", color: "white", fontWeight: 600 }} />
              <Chip icon={<EventAvailable sx={{ color: "#FFEB3B" }} />} label="Flexible slots" sx={{ bgcolor: "rgba(255,255,255,0.16)", color: "white", fontWeight: 600 }} />
              <Chip icon={<MedicalServices sx={{ color: "#FFEB3B" }} />} label="Secure booking" sx={{ bgcolor: "rgba(255,255,255,0.16)", color: "white", fontWeight: 600 }} />
            </Stack>
          </Stack>
        </Box>
      </Paper>

      <Grid container spacing={3}>
        {/* Left Column - Doctor Selection */}
        <Grid item xs={12} md={5} lg={5}>
          <Paper elevation={0} sx={{ borderRadius: 3, border: "1px solid #e3f2fd", overflow: "hidden" }}>
            <Box sx={{ p: 2.5, pb: 2, display: "flex", alignItems: "center", gap: 1, borderBottom: "1px solid #e3f2fd" }}>
              <MedicalServices color="primary" sx={{ fontSize: 26 }} />
              <Box>
                <Typography variant="h6" fontWeight={700} color="primary.main">
                  Choose a Doctor
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Filter by city, specialty, or name
                </Typography>
              </Box>
            </Box>

            {/* Filters */}
            <Box sx={{ p: 2.5, pb: 1 }}>
              <Grid container spacing={1.5}>
                <Grid item xs={12} sm={6} md={12}>
                  <FormControl fullWidth size="small">
                    <InputLabel>City</InputLabel>
                    <Select name="city" value={filters.city} onChange={handleFilterChange} label="City">
                      <MenuItem value="">All Cities</MenuItem>
                      <MenuItem value="Delhi">Delhi</MenuItem>
                      <MenuItem value="Mumbai">Mumbai</MenuItem>
                      <MenuItem value="Bangalore">Bangalore</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6} md={12}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Specialization</InputLabel>
                    <Select name="specialization" value={filters.specialization} onChange={handleFilterChange} label="Specialization">
                      <MenuItem value="">All Specializations</MenuItem>
                      <MenuItem value="Cardiologist">Cardiologist</MenuItem>
                      <MenuItem value="Dentist">Dentist</MenuItem>
                      <MenuItem value="Orthopedic">Orthopedic</MenuItem>
                      <MenuItem value="Dermatologist">Dermatologist</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Search by name"
                    name="name"
                    value={filters.name}
                    onChange={handleFilterChange}
                    InputProps={{ startAdornment: <Search sx={{ mr: 1, color: "text.secondary", fontSize: 20 }} /> }}
                  />
                </Grid>
              </Grid>
            </Box>

            {/* Doctor Cards */}
            <Box sx={{ maxHeight: 520, overflowY: "auto", px: 2.5, pb: 2.5 }}>
              <Stack spacing={1.5}>
                {filteredDoctors.length > 0 ? (
                  filteredDoctors.map((doctor) => {
                    const isSelected = selectedDoctor === doctor.name;
                    return (
                      <Card
                        key={doctor.id}
                        variant="outlined"
                        sx={{
                          borderRadius: 3,
                          borderColor: isSelected ? "#0d47a1" : "#e3f2fd",
                          borderWidth: isSelected ? 2 : 1,
                          boxShadow: isSelected ? "0 8px 24px rgba(13,71,161,0.18)" : "none",
                          transition: "all 0.2s ease",
                          '&:hover': {
                            boxShadow: "0 8px 24px rgba(13,71,161,0.12)",
                            transform: "translateY(-2px)",
                          },
                        }}
                      >
                        <CardActionArea onClick={() => handleDoctorChange(doctor.name)}>
                          <CardContent sx={{ p: 2, display: "flex", gap: 1.5, alignItems: "center" }}>
                            <Avatar
                              sx={{
                                width: 52,
                                height: 52,
                                bgcolor: isSelected ? "#0d47a1" : "#1976d2",
                                fontSize: 18,
                                fontWeight: 700,
                              }}
                            >
                              {getInitials(doctor.name)}
                            </Avatar>
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                              <Typography variant="subtitle1" fontWeight={700} color={isSelected ? "primary.main" : "text.primary"}>
                                {doctor.name}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {doctor.specialization}
                              </Typography>
                              <Stack direction="row" spacing={1} sx={{ mt: 0.5, flexWrap: "wrap" }}>
                                <Chip
                                  icon={<LocationOn sx={{ fontSize: 14 }} />}
                                  label={doctor.city}
                                  size="small"
                                  variant="outlined"
                                  sx={{ fontSize: 11, height: 22 }}
                                />
                                <Chip
                                  icon={<AccessTime sx={{ fontSize: 14 }} />}
                                  label={`${doctor.slotCapacity} slots`}
                                  size="small"
                                  variant="outlined"
                                  color="secondary"
                                  sx={{ fontSize: 11, height: 22 }}
                                />
                              </Stack>
                            </Box>
                            {isSelected && (
                              <CheckCircle color="primary" sx={{ fontSize: 26 }} />
                            )}
                          </CardContent>
                        </CardActionArea>
                      </Card>
                    );
                  })
                ) : (
                  <Paper sx={{ p: 3, textAlign: "center", bgcolor: "#f8fbff" }}>
                    <Typography color="text.secondary">No doctors match your filters.</Typography>
                  </Paper>
                )}
              </Stack>
            </Box>
          </Paper>
        </Grid>

        {/* Right Column - Booking Form */}
        <Grid item xs={12} md={7} lg={7}>
          <Paper elevation={0} sx={{ borderRadius: 3, border: "1px solid #e3f2fd", overflow: "hidden" }}>
            <Box sx={{ p: 2.5, pb: 2, display: "flex", alignItems: "center", gap: 1, borderBottom: "1px solid #e3f2fd" }}>
              <CalendarMonth color="primary" sx={{ fontSize: 26 }} />
              <Box>
                <Typography variant="h6" fontWeight={700} color="primary.main">
                  Book Your Appointment
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Select a date and time slot to confirm
                </Typography>
              </Box>
            </Box>

            <Box sx={{ p: { xs: 2, md: 3 } }}>
              {/* Selected doctor indicator */}
              {selectedDoctorData ? (
                <Fade in>
                  <Box
                    sx={{
                      p: 2,
                      mb: 2.5,
                      borderRadius: 3,
                      bgcolor: "#f8fbff",
                      border: "1px solid #bbdefb",
                      display: "flex",
                      alignItems: "center",
                      gap: 1.5,
                    }}
                  >
                    <Avatar sx={{ bgcolor: "#0d47a1" }}>{getInitials(selectedDoctorData.name)}</Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="subtitle1" fontWeight={700} color="primary.main">
                        {selectedDoctorData.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {selectedDoctorData.specialization} • {selectedDoctorData.city}
                      </Typography>
                    </Box>
                    <Chip icon={<Verified />} label="Selected" color="primary" size="small" />
                  </Box>
                </Fade>
              ) : (
                <Paper sx={{ p: 3, mb: 2.5, textAlign: "center", bgcolor: "#f8fbff", border: "1px dashed #90caf9" }}>
                  <Person sx={{ fontSize: 40, color: "#90caf9" }} />
                  <Typography color="text.secondary" sx={{ mt: 1 }}>
                    Please select a doctor from the left panel to begin.
                  </Typography>
                </Paper>
              )}

              {/* Date Selection */}
              <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1, color: "text.primary" }}>
                Select Date
              </Typography>
              <TextField
                fullWidth
                label="Appointment date"
                type="date"
                InputLabelProps={{ shrink: true }}
                value={selectedDate}
                onChange={handleDateChange}
                disabled={!selectedDoctorData}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />

              {selectedDoctorData && (
                <Tooltip title={selectedDate ? formatCustomDate(selectedDate) : "Pick a date above"}>
                  <Chip
                    icon={<EventAvailable />}
                    label={selectedDate ? formatCustomDate(selectedDate) : "No date selected"}
                    color={selectedDate ? "success" : "default"}
                    variant="outlined"
                    sx={{ mt: 1.5 }}
                  />
                </Tooltip>
              )}

              {/* Time Slot Selection */}
              <Box sx={{ mt: 3, mb: 1 }}>
                <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1, color: "text.primary" }}>
                  Select Time Slot
                </Typography>
              </Box>

              {selectedDoctorData && selectedDate ? (
                <Box sx={{ display: "grid", gridTemplateColumns: { xs: "repeat(2, 1fr)", sm: "repeat(3, 1fr)", md: "repeat(4, 1fr)" }, gap: 1.5 }}>
                  {timeOptions.map((slot) => {
                    const bookedCount = bookings.filter(
                      (booking) => booking.doctor === selectedDoctorData.name && booking.date === selectedDate && booking.time === slot.label
                    ).length;
                    const remaining = Math.max(0, slot.capacity - bookedCount);
                    const isSelectedTime = selectedTime === slot.label;
                    const disabled = remaining === 0 || isSlotDisabled(slot);

                    return (
                      <Button
                        key={slot.label}
                        variant={isSelectedTime ? "contained" : "outlined"}
                        color={isSelectedTime ? "primary" : "primary"}
                        disabled={disabled}
                        onClick={() => handleTimeChange(slot.label)}
                        sx={{
                          borderRadius: 2,
                          py: 1,
                          flexDirection: "column",
                          gap: 0.3,
                          textTransform: "none",
                          borderColor: isSelectedTime ? "#0d47a1" : "#90caf9",
                          bgcolor: isSelectedTime ? "#0d47a1" : "transparent",
                          '&:hover': {
                            bgcolor: isSelectedTime ? "#0d47a1" : "rgba(13,71,161,0.06)",
                          },
                        }}
                      >
                        <Stack direction="row" spacing={0.5} alignItems="center">
                          <AccessTime sx={{ fontSize: 15 }} />
                          <Typography variant="body2" fontWeight={600} color={isSelectedTime ? "white" : "text.primary"}>
                            {slot.label}
                          </Typography>
                        </Stack>
                        <Typography variant="caption" color={isSelectedTime ? "rgba(255,255,255,0.85)" : remaining > 0 ? "success.main" : "error.main"} fontWeight={600}>
                          {remaining > 0 ? `${remaining} left` : "Full"}
                        </Typography>
                      </Button>
                    );
                  })}
                </Box>
              ) : (
                <Paper sx={{ p: 3, textAlign: "center", bgcolor: "#f8fbff", border: "1px dashed #90caf9" }}>
                  <AccessTime sx={{ fontSize: 36, color: "#90caf9" }} />
                  <Typography color="text.secondary" sx={{ mt: 1 }}>
                    {!selectedDoctorData ? "Select a doctor to view available slots." : "Select a date to view available time slots."}
                  </Typography>
                </Paper>
              )}

              {/* Feedback message */}
              {message && (
                <Fade in>
                  <Alert
                    severity={messageType}
                    sx={{ mt: 2.5, borderRadius: 2 }}
                    icon={messageType === "success" && bookingSuccess ? <CheckCircle fontSize="inherit" /> : undefined}
                  >
                    {message}
                  </Alert>
                </Fade>
              )}

              {/* Booking Summary */}
              {(selectedDoctorData || selectedDate || selectedTime) && (
                <Paper
                  elevation={0}
                  sx={{
                    mt: 2.5,
                    p: 2.5,
                    borderRadius: 3,
                    border: "1px solid #bbdefb",
                    bgcolor: "#f8fbff",
                  }}
                >
                  <Typography variant="subtitle1" fontWeight={700} color="primary.main" sx={{ mb: 1.5 }}>
                    Booking Summary
                  </Typography>
                  <Stack spacing={1}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Person sx={{ fontSize: 18, color: "primary.main" }} />
                      <Typography variant="body2" color="text.secondary" sx={{ width: 90 }}>
                        Doctor:
                      </Typography>
                      <Typography variant="body2" fontWeight={600}>
                        {selectedDoctorData?.name || "—"}
                      </Typography>
                    </Stack>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <CalendarMonth sx={{ fontSize: 18, color: "primary.main" }} />
                      <Typography variant="body2" color="text.secondary" sx={{ width: 90 }}>
                        Date:
                      </Typography>
                      <Typography variant="body2" fontWeight={600}>
                        {selectedDate ? formatCustomDate(selectedDate) : "—"}
                      </Typography>
                    </Stack>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Schedule sx={{ fontSize: 18, color: "primary.main" }} />
                      <Typography variant="body2" color="text.secondary" sx={{ width: 90 }}>
                        Time:
                      </Typography>
                      <Typography variant="body2" fontWeight={600}>
                        {selectedTime || "—"}
                      </Typography>
                    </Stack>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Groups sx={{ fontSize: 18, color: "primary.main" }} />
                      <Typography variant="body2" color="text.secondary" sx={{ width: 90 }}>
                        Availability:
                      </Typography>
                      <Chip
                        label={availableSlots > 0 ? `${availableSlots} slot${availableSlots > 1 ? "s" : ""} available` : "Not selected"}
                        color={availableSlots > 0 ? "success" : "default"}
                        size="small"
                        variant="outlined"
                      />
                    </Stack>
                  </Stack>

                  <Divider sx={{ my: 2 }} />

                  <Button
                    variant="contained"
                    fullWidth
                    onClick={handleSubmit}
                    disabled={!selectedTime || availableSlots === 0}
                    endIcon={bookingSuccess ? <CheckCircle /> : <ArrowForward />}
                    sx={{
                      py: 1.4,
                      borderRadius: 2,
                      fontWeight: 700,
                      textTransform: "none",
                      background: "linear-gradient(135deg, #0d47a1 0%, #1976d2 100%)",
                      boxShadow: "0 8px 20px rgba(25, 118, 210, 0.25)",
                      '&:hover': {
                        background: "linear-gradient(135deg, #08306b 0%, #1565c0 100%)",
                      },
                    }}
                  >
                    {bookingSuccess ? "Booked Successfully" : "Book Appointment"}
                  </Button>
                </Paper>
              )}

              {/* Back to top helper */}
              {selectedDoctor && (
                <Box sx={{ mt: 2, textAlign: "center" }}>
                  <Button
                    startIcon={<ArrowBack />}
                    onClick={() => handleDoctorChange("")}
                    sx={{ textTransform: "none", color: "text.secondary" }}
                  >
                    Change doctor
                  </Button>
                </Box>
              )}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default PatientAppointment;
