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
  Fade,
  Grow,
  Skeleton,
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
  Mic,
  Stop,
} from "@mui/icons-material";

const defaultDoctors = [];

const getTodayInputValue = () => {
  const today = new Date();
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
};

const PatientAppointment = () => {
  const [filters, setFilters] = useState({
    city: "",
    specialization: "",
    name: "",
  });

  const [doctors, setDoctors] = useState([]);
  const [filteredDoctors, setFilteredDoctors] = useState(defaultDoctors);
  const [selectedDoctor, setSelectedDoctor] = useState("");
  const [selectedBranchId, setSelectedBranchId] = useState("");
  const [availableSlotData, setAvailableSlotData] = useState([]);
  const [dateClosed, setDateClosed] = useState(false);
  const [dateClosedReason, setDateClosedReason] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loadingDoctors, setLoadingDoctors] = useState(false);

  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [availableSlots, setAvailableSlots] = useState(0);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("info");
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [voiceSearching, setVoiceSearching] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const fetchDoctors = async () => {
      setLoadingDoctors(true);
      try {
        const params = new URLSearchParams({
          page: String(currentPage),
          limit: "10",
          ...(filters.city ? { city: filters.city } : {}),
          ...(filters.specialization ? { specialization: filters.specialization } : {}),
        });
        const response = await fetch(`${API_URL}/api/doctorform/doctors?${params}`);
        if (response.ok) {
          const data = await response.json();

          const doctorsList = data.doctors ? data.doctors : Array.isArray(data) ? data : [];

          if (data.pagination) {
            setTotalPages(data.pagination.totalPages);
          }

          const mapped = doctorsList.map((doc) => ({
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
            consultationFee: Number(doc.consultationFee || 0),
            branches: doc.branches || [],
          }));

          setDoctors(mapped);
          setFilteredDoctors(mapped);
        }
      } catch (error) {
        console.error("Failed to fetch doctors:", error);
      } finally {
        setLoadingDoctors(false);
      }
    };

    fetchDoctors();
  }, [currentPage, filters.city, filters.specialization]);

  useEffect(() => {
    const filtered = doctors.filter(
      (doc) =>
        (filters.city ? doc.city.toLowerCase() === filters.city.toLowerCase() : true) &&
        (filters.specialization ? doc.specialization.toLowerCase() === filters.specialization.toLowerCase() : true) &&
        (filters.name ? doc.name.toLowerCase().includes(filters.name.toLowerCase()) : true)
    );
    setFilteredDoctors(filtered);
  }, [filters, doctors]);

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleVoiceSearch = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setMessage("Voice search is not supported in this browser.");
      setMessageType("warning");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = "en-IN";
    recognition.onstart = () => setVoiceSearching(true);
    recognition.onend = () => setVoiceSearching(false);
    recognition.onerror = () => {
      setVoiceSearching(false);
      setMessage("Voice search could not understand that. Please try again.");
      setMessageType("warning");
    };
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setFilters((current) => ({ ...current, name: transcript }));
    };
    recognition.start();
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  const handleDoctorChange = (doctorName) => {
    setSelectedDoctor(doctorName);
    const nextDoctor = doctors.find((doctor) => doctor.name === doctorName);
    setSelectedBranchId(nextDoctor?.branches?.[0]?._id || "");
    setAvailableSlotData([]);
    setDateClosed(false);
    setDateClosedReason("");
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
    setAvailableSlotData([]);
    setMessage("");
    setMessageType("info");
    setBookingSuccess(false);
  };

  useEffect(() => {
    const selectedDoc = doctors.find((doctor) => doctor.name === selectedDoctor);
    if (!selectedDoc || !selectedDate) return;
    const loadAvailability = async () => {
      try {
        const response = await fetch(`${API_URL}/api/doctorform/doctors/${selectedDoc.id}/availability?date=${selectedDate}`);
        const data = await response.json();
        if (!response.ok) throw new Error(data.msg || "Unable to load availability");
        setDateClosed(Boolean(data.closed));
        setDateClosedReason(data.closedReason || "Doctor is unavailable on this date");
        const branch = data.branches?.find((item) => String(item.branchId || "") === String(selectedBranchId)) || data.branches?.[0];
        if (branch && !selectedBranchId) setSelectedBranchId(branch.branchId || "");
        setDateClosed(Boolean(data.closed || branch?.closed));
        setDateClosedReason(branch?.closedReason || data.closedReason || "Doctor is unavailable on this date");
        setAvailableSlotData(branch?.slots || []);
      } catch (error) {
        setAvailableSlotData([]);
        setMessage(error.message || "Unable to load availability");
        setMessageType("error");
      }
    };
    loadAvailability();
  }, [doctors, selectedDoctor, selectedDate, selectedBranchId]);

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
      const [hour, minute] = (selectedTimeValue?.split("-")[0] || "00:00")
        .match(/(\d{1,2}):(\d{2})/)
        ?.slice(1)
        .map(Number) || [0, 0];
      const hasPeriod = /AM|PM/i.test(selectedTimeValue || "");
      const selectedHour = hasPeriod
        ? (hour % 12) + (selectedTimeValue?.toUpperCase().includes("PM") ? 12 : 0)
        : hour;
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

    const remaining = availableSlotData.find((slot) => slot.label === time)?.remaining ?? 0;
    setAvailableSlots(remaining);
    if (remaining > 0) {
      setMessage(`${remaining} slot${remaining > 1 ? "s" : ""} left for this time`);
      setMessageType("success");
    } else {
      setMessage("No slots available");
      setMessageType("warning");
    }
  };

  const handleSubmit = async () => {
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

    const token = localStorage.getItem("token");

    if (!token) {
      setMessage("Please login before booking an appointment.");
      setMessageType("warning");
      return;
    }

    try {
      setMessage("Booking appointment...");
      setMessageType("info");

      const patientName = user?.name || user?.username || "Patient";
      const patientId = user?._id || user?.id || null;

      const response = await fetch(`${API_URL}/api/patientform/appointments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          doctorId: selectedDoc.id,
          doctorName: selectedDoc.name,
          date: selectedDate,
          time: selectedTime,
          patientName,
          patientId,
          branchId: selectedBranchId || undefined,
          paymentMethod,
          reason: "Appointment booking",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.msg || data.message || "Failed to book appointment.");
        setMessageType("error");
        return;
      }

      const savedAppointment = data.appointment;

      setMessage(`Appointment booked successfully with ${selectedDoc.name}`);
      setMessageType("success");
      setBookingSuccess(true);
      setAvailableSlots((prev) => Math.max(0, prev - 1));

      if (paymentMethod === "online") {
        await startOnlinePayment(savedAppointment._id);
      }
    } catch (error) {
      console.error("Appointment booking failed:", error);
      setMessage("Unable to connect to server. Please try again.");
      setMessageType("error");
    }
  };

  const startOnlinePayment = async (appointmentId) => {
    const response = await fetch(`${API_URL}/api/patientform/appointments/payment/order`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("token")}` },
      body: JSON.stringify({ appointmentId }),
    });
    const orderData = await response.json();
    if (!response.ok) throw new Error(orderData.msg || "Unable to start online payment");
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => {
      const checkout = new window.Razorpay({
        key: orderData.key,
        amount: orderData.order.amount,
        currency: orderData.order.currency,
        name: "Docify",
        description: `Consultation with ${orderData.doctorName || "doctor"}`,
        order_id: orderData.order.id,
        handler: async (payment) => {
          await fetch(`${API_URL}/api/patientform/appointments/payment/verify`, {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("token")}` },
            body: JSON.stringify({ appointmentId, ...payment }),
          });
          setMessage("Online payment completed successfully.");
          setMessageType("success");
        },
        theme: { color: "#0d47a1" },
      });
      checkout.open();
    };
    script.onerror = () => setMessage("Unable to load online payment. You can pay cash at the clinic.");
    document.body.appendChild(script);
  };

  const selectedDoctorData = doctors.find((doctor) => doctor.name === selectedDoctor);
  const timeOptions = selectedDoctorData
    ? availableSlotData
    : [];

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
      {/* Hero Header Animated */}
      <Grow in={true} timeout={600}>
        <Paper
          elevation={4}
          sx={{
            borderRadius: 4,
            overflow: "hidden",
            mb: 4,
            background: "linear-gradient(135deg, #0d47a1 0%, #1e88e5 100%)",
            color: "white",
            position: "relative",
            boxShadow: "0px 10px 30px rgba(13, 71, 161, 0.2)",
          }}
        >
          <Box
            sx={{
              p: { xs: 3, md: 5 },
              background: "radial-gradient(circle at 90% 10%, rgba(255,255,255,0.15) 0%, transparent 50%)",
            }}
          >
            <Stack
              direction={{ xs: "column", md: "row" }}
              spacing={2}
              justifyContent="space-between"
              alignItems={{ xs: "flex-start", md: "center" }}
            >
              <Box>
                <Typography variant="overline" sx={{ color: "#FFeb3b", fontWeight: 800, letterSpacing: 1.5 }}>
                  Patient Portal
                </Typography>
                <Typography variant="h3" sx={{ fontWeight: 800, mt: 0.5, letterSpacing: "-0.5px" }}>
                  Schedule Your Visit
                </Typography>
                <Typography variant="body1" sx={{ mt: 1.5, opacity: 0.9, maxWidth: 600, fontSize: "1.1rem" }}>
                  Choose your preferred doctor, pick a convenient date and time slot, and let us take care of the rest.
                </Typography>
              </Box>
              <Stack direction={{ xs: "row", sm: "row" }} spacing={1.5} sx={{ flexWrap: "wrap", mt: { xs: 2, md: 0 } }}>
                <Chip
                  icon={<Verified sx={{ color: "#FFEB3B !important" }} />}
                  label="Verified Doctors"
                  sx={{ bgcolor: "rgba(255,255,255,0.2)", color: "white", fontWeight: 600, px: 1, py: 2.5 }}
                />
                <Chip
                  icon={<EventAvailable sx={{ color: "#FFEB3B !important" }} />}
                  label="Flexible Slots"
                  sx={{ bgcolor: "rgba(255,255,255,0.2)", color: "white", fontWeight: 600, px: 1, py: 2.5 }}
                />
              </Stack>
            </Stack>
          </Box>
        </Paper>
      </Grow>

      <Grid container spacing={4}>
        {/* Left Column - Doctor Selection */}
        <Grid item xs={12} md={5} lg={5}>
          <Fade in={true} timeout={800}>
            <Paper elevation={0} sx={{ borderRadius: 4, border: "1px solid #e0e0e0", overflow: "hidden", boxShadow: "0 4px 20px rgba(0,0,0,0.03)" }}>
              <Box sx={{ p: 3, pb: 2, display: "flex", alignItems: "center", gap: 1.5, borderBottom: "1px solid #f0f0f0", bgcolor: "#fafafa" }}>
                <MedicalServices color="primary" sx={{ fontSize: 28 }} />
                <Box>
                  <Typography variant="h6" fontWeight={800} color="text.primary">
                    Choose a Doctor
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Filter by city, specialty, or name
                  </Typography>
                </Box>
              </Box>

              {/* Filters */}
              <Box sx={{ p: 3, pb: 1 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6} md={12}>
                    <FormControl fullWidth size="small">
                      <InputLabel>City</InputLabel>
                      <Select name="city" value={filters.city} onChange={handleFilterChange} label="City" sx={{ borderRadius: 2 }}>
                        <MenuItem value="">All Cities</MenuItem>
                        {[...new Set(doctors.map((doctor) => doctor.city).filter(Boolean))].sort().map((city) => (
                          <MenuItem key={city} value={city}>{city}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={6} md={12}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Specialization</InputLabel>
                      <Select name="specialization" value={filters.specialization} onChange={handleFilterChange} label="Specialization" sx={{ borderRadius: 2 }}>
                        <MenuItem value="">All Specializations</MenuItem>
                        {[...new Set(doctors.map((doctor) => doctor.specialization).filter(Boolean))].sort().map((specialization) => (
                          <MenuItem key={specialization} value={specialization}>{specialization}</MenuItem>
                        ))}
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
                      InputProps={{ startAdornment: <Search sx={{ mr: 1, color: "text.secondary", fontSize: 20 }} />, endAdornment: <Button size="small" onClick={handleVoiceSearch} aria-label="Search by voice">{voiceSearching ? <Stop fontSize="small" /> : <Mic fontSize="small" />}</Button> }}
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                    />
                  </Grid>
                </Grid>
              </Box>

              {/* Doctor Cards */}
              <Box sx={{ maxHeight: 520, overflowY: "auto", px: 3, pb: 3, pt: 1 }}>
                {loadingDoctors ? (
                  <Stack spacing={2}>
                    {[1, 2, 3].map((skeleton) => (
                      <Skeleton key={skeleton} variant="rounded" height={100} sx={{ borderRadius: 3 }} />
                    ))}
                  </Stack>
                ) : (
                  <Stack spacing={2}>
                    {filteredDoctors.length > 0 ? (
                      filteredDoctors.map((doctor, index) => {
                        const isSelected = selectedDoctor === doctor.name;
                        return (
                          <Grow in={true} timeout={(index + 1) * 250} key={doctor.name}>
                            <Card
                              variant="outlined"
                              sx={{
                                borderRadius: 3,
                                borderColor: isSelected ? "primary.main" : "#e0e0e0",
                                borderWidth: isSelected ? 2 : 1,
                                boxShadow: isSelected ? "0 8px 24px rgba(25, 118, 210, 0.15)" : "none",
                                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                                '&:hover': {
                                  boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
                                  transform: "translateY(-3px)",
                                  borderColor: isSelected ? "primary.main" : "primary.light",
                                },
                              }}
                            >
                              <CardActionArea onClick={() => handleDoctorChange(doctor.name)}>
                                <CardContent sx={{ p: 2.5, display: "flex", gap: 2, alignItems: "center" }}>
                                  <Avatar
                                    sx={{
                                      width: 56,
                                      height: 56,
                                      bgcolor: isSelected ? "primary.main" : "grey.300",
                                      color: isSelected ? "white" : "grey.700",
                                      fontSize: 20,
                                      fontWeight: 800,
                                      boxShadow: isSelected ? "0 4px 12px rgba(25,118,210,0.3)" : "none"
                                    }}
                                  >
                                    {getInitials(doctor.name)}
                                  </Avatar>
                                  <Box sx={{ flex: 1, minWidth: 0 }}>
                                    <Typography variant="subtitle1" fontWeight={800} color={isSelected ? "primary.main" : "text.primary"}>
                                      {doctor.name}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                      {doctor.specialization}
                                    </Typography>
                                    <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", gap: 0.5 }}>
                                      <Chip
                                        icon={<LocationOn sx={{ fontSize: 14 }} />}
                                        label={doctor.city}
                                        size="small"
                                        sx={{ fontSize: 11, bgcolor: "grey.100", fontWeight: 600 }}
                                      />
                                      <Chip
                                        icon={<AccessTime sx={{ fontSize: 14 }} />}
                                        label={`${doctor.slotCapacity} slots`}
                                        size="small"
                                        color={isSelected ? "primary" : "default"}
                                        sx={{ fontSize: 11, fontWeight: 600 }}
                                      />
                                    </Stack>
                                  </Box>
                                  {isSelected && (
                                    <Fade in>
                                      <CheckCircle color="primary" sx={{ fontSize: 28 }} />
                                    </Fade>
                                  )}
                                </CardContent>
                              </CardActionArea>
                            </Card>
                          </Grow>
                        );
                      })
                    ) : (
                      <Fade in>
                        <Paper sx={{ p: 4, textAlign: "center", bgcolor: "#fafafa", borderRadius: 3, border: "1px dashed #ccc" }}>
                          <Person sx={{ fontSize: 48, color: "grey.400", mb: 1 }} />
                          <Typography color="text.secondary" fontWeight={600}>No doctors match your filters.</Typography>
                        </Paper>
                      </Fade>
                    )}
                  </Stack>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                  <Fade in={!loadingDoctors}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 3, pt: 2, borderTop: "1px solid #f0f0f0" }}>
                      <Button size="small" variant="outlined" onClick={handlePrevPage} disabled={currentPage === 1 || loadingDoctors} startIcon={<ArrowBack fontSize="small" />} sx={{ borderRadius: 2 }}>
                        Prev
                      </Button>
                      <Typography variant="body2" color="text.secondary" fontWeight={700}>
                        Page {currentPage} of {totalPages}
                      </Typography>
                      <Button size="small" variant="outlined" onClick={handleNextPage} disabled={currentPage === totalPages || loadingDoctors} endIcon={<ArrowForward fontSize="small" />} sx={{ borderRadius: 2 }}>
                        Next
                      </Button>
                    </Box>
                  </Fade>
                )}
              </Box>
            </Paper>
          </Fade>
        </Grid>

        {/* Right Column - Booking Form */}
        <Grid item xs={12} md={7} lg={7}>
          <Fade in={true} timeout={1000}>
            <Paper elevation={0} sx={{ borderRadius: 4, border: "1px solid #e0e0e0", overflow: "hidden", boxShadow: "0 4px 20px rgba(0,0,0,0.03)", height: "100%" }}>
              <Box sx={{ p: 3, pb: 2, display: "flex", alignItems: "center", gap: 1.5, borderBottom: "1px solid #f0f0f0", bgcolor: "#fafafa" }}>
                <CalendarMonth color="primary" sx={{ fontSize: 28 }} />
                <Box>
                  <Typography variant="h6" fontWeight={800} color="text.primary">
                    Book Your Appointment
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Select a date and time slot to confirm
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ p: { xs: 3, md: 4 } }}>
                {selectedDoctorData ? (
                  <Grow in>
                    <Box sx={{ p: 2.5, mb: 3, borderRadius: 3, bgcolor: "#e3f2fd", border: "1px solid #bbdefb", display: "flex", alignItems: "center", gap: 2 }}>
                      <Avatar sx={{ bgcolor: "primary.main", width: 56, height: 56, fontWeight: 800 }}>{getInitials(selectedDoctorData.name)}</Avatar>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="h6" fontWeight={800} color="primary.dark">
                          {selectedDoctorData.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" fontWeight={500}>
                          {selectedDoctorData.specialization} • {selectedDoctorData.city}
                        </Typography>
                      </Box>
                      <Chip icon={<Verified />} label="Selected" color="primary" variant="filled" />
                    </Box>
                  </Grow>
                ) : (
                  <Paper sx={{ p: 4, mb: 4, textAlign: "center", bgcolor: "#fafafa", border: "2px dashed #e0e0e0", borderRadius: 3 }}>
                    <MedicalServices sx={{ fontSize: 48, color: "grey.400", mb: 1 }} />
                    <Typography color="text.secondary" fontWeight={600}>
                      Please select a doctor from the list to begin scheduling.
                    </Typography>
                  </Paper>
                )}

                <Typography variant="subtitle1" fontWeight={800} sx={{ mb: 1.5, color: "text.primary" }}>
                  1. Select Date
                </Typography>
                <TextField
                  fullWidth
                  type="date"
                  inputProps={{ min: getTodayInputValue() }}
                  InputLabelProps={{ shrink: true }}
                  value={selectedDate}
                  onChange={handleDateChange}
                  disabled={!selectedDoctorData}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3, bgcolor: "white" } }}
                />

                {selectedDoctorData?.branches?.length > 0 && (
                  <FormControl fullWidth sx={{ mt: 2 }}>
                    <InputLabel>Clinic branch</InputLabel>
                    <Select value={selectedBranchId} label="Clinic branch" onChange={(event) => { setSelectedBranchId(event.target.value); setSelectedTime(""); setAvailableSlots(0); }}>
                      {selectedDoctorData.branches.filter((branch) => branch.active !== false).map((branch) => (
                        <MenuItem key={branch._id} value={branch._id}>{branch.name} - {branch.city}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}

                {selectedDoctorData && selectedDate && (
                  <Grow in>
                    <Box sx={{ mt: 4, mb: 2 }}>
                      <Typography variant="subtitle1" fontWeight={800} sx={{ mb: 2, color: "text.primary" }}>
                        2. Select Time Slot
                      </Typography>
                      {dateClosed ? (
                        <Alert severity="warning">No booking on this date: {dateClosedReason}</Alert>
                      ) : availableSlotData.length === 0 ? (
                        <Alert severity="info">No time slots are configured for this date.</Alert>
                      ) : <Box sx={{ display: "grid", gridTemplateColumns: { xs: "repeat(2, 1fr)", sm: "repeat(3, 1fr)" }, gap: 2 }}>
                        {timeOptions.map((slot) => {
                          const remaining = Number(slot.remaining || 0);
                          const isSelectedTime = selectedTime === slot.label;
                          const disabled = remaining === 0 || isSlotDisabled(slot);

                          return (
                            <Button
                              key={slot.label}
                              variant={isSelectedTime ? "contained" : "outlined"}
                              color="primary"
                              disabled={disabled}
                              onClick={() => handleTimeChange(slot.label)}
                              sx={{
                                borderRadius: 3,
                                py: 1.5,
                                flexDirection: "column",
                                gap: 0.5,
                                textTransform: "none",
                                borderWidth: isSelectedTime ? 2 : 1,
                                borderColor: isSelectedTime ? "primary.main" : "grey.300",
                                '&:hover': {
                                  borderWidth: 2,
                                  borderColor: "primary.main",
                                  bgcolor: isSelectedTime ? "primary.dark" : "primary.50",
                                  transform: disabled ? "none" : "scale(1.02)",
                                },
                                transition: "all 0.2s",
                              }}
                            >
                              <Stack direction="row" spacing={0.5} alignItems="center">
                                <AccessTime sx={{ fontSize: 16 }} />
                                <Typography variant="body1" fontWeight={700} color={isSelectedTime ? "white" : "text.primary"}>
                                  {slot.label}
                                </Typography>
                              </Stack>
                              <Typography variant="caption" color={isSelectedTime ? "rgba(255,255,255,0.9)" : remaining > 0 ? "success.main" : "error.main"} fontWeight={700}>
                                {remaining > 0 ? `${remaining} left` : "Full"}
                              </Typography>
                            </Button>
                          );
                        })}
                      </Box>}
                    </Box>
                  </Grow>
                )}

                {message && (
                  <Grow in>
                    <Alert severity={messageType} sx={{ mt: 3, borderRadius: 3, fontWeight: 600, alignItems: "center" }} icon={messageType === "success" && bookingSuccess ? <CheckCircle /> : undefined}>
                      {message}
                    </Alert>
                  </Grow>
                )}

                {(selectedDoctorData || selectedDate || selectedTime) && (
                  <Grow in timeout={800}>
                    <Paper elevation={0} sx={{ mt: 4, p: 3, borderRadius: 4, border: "1px solid #e0e0e0", bgcolor: "white", boxShadow: "0 10px 30px rgba(0,0,0,0.05)" }}>
                      <Typography variant="h6" fontWeight={800} color="text.primary" sx={{ mb: 2 }}>
                        Booking Summary
                      </Typography>
                      <Stack spacing={2} divider={<Divider flexItem />}>
                        <Grid container alignItems="center">
                          <Grid item xs={1}><Person color="primary" /></Grid>
                          <Grid item xs={3}><Typography variant="body2" color="text.secondary" fontWeight={600}>Doctor</Typography></Grid>
                          <Grid item xs={8}><Typography variant="body1" fontWeight={700}>{selectedDoctorData?.name || "—"}</Typography></Grid>
                        </Grid>
                        <Grid container alignItems="center">
                          <Grid item xs={1}><CalendarMonth color="primary" /></Grid>
                          <Grid item xs={3}><Typography variant="body2" color="text.secondary" fontWeight={600}>Date</Typography></Grid>
                          <Grid item xs={8}><Typography variant="body1" fontWeight={700}>{selectedDate ? formatCustomDate(selectedDate) : "—"}</Typography></Grid>
                        </Grid>
                        <Grid container alignItems="center">
                          <Grid item xs={1}><Schedule color="primary" /></Grid>
                          <Grid item xs={3}><Typography variant="body2" color="text.secondary" fontWeight={600}>Time</Typography></Grid>
                          <Grid item xs={8}><Typography variant="body1" fontWeight={700}>{selectedTime || "—"}</Typography></Grid>
                        </Grid>
                        <Grid container alignItems="center">
                          <Grid item xs={1}><LocationOn color="primary" /></Grid>
                          <Grid item xs={3}><Typography variant="body2" color="text.secondary" fontWeight={600}>Branch</Typography></Grid>
                          <Grid item xs={8}><Typography variant="body1" fontWeight={700}>{selectedDoctorData?.branches?.find((branch) => String(branch._id) === String(selectedBranchId))?.name || "Main clinic"}</Typography></Grid>
                        </Grid>
                        <FormControl fullWidth>
                          <InputLabel>Payment method</InputLabel>
                          <Select value={paymentMethod} label="Payment method" onChange={(event) => setPaymentMethod(event.target.value)}>
                            <MenuItem value="cash">Cash at clinic {selectedDoctorData?.consultationFee ? `(₹${selectedDoctorData.consultationFee})` : ""}</MenuItem>
                            <MenuItem value="online">Pay online {selectedDoctorData?.consultationFee ? `(₹${selectedDoctorData.consultationFee})` : ""}</MenuItem>
                          </Select>
                        </FormControl>
                      </Stack>

                      <Button
                        variant="contained"
                        size="large"
                        fullWidth
                        onClick={handleSubmit}
                        disabled={!selectedTime || availableSlots === 0}
                        endIcon={bookingSuccess ? <CheckCircle /> : <ArrowForward />}
                        sx={{
                          mt: 4,
                          py: 1.8,
                          borderRadius: 3,
                          fontWeight: 800,
                          fontSize: "1.1rem",
                          textTransform: "none",
                          background: "linear-gradient(135deg, #1e88e5 0%, #0d47a1 100%)",
                          boxShadow: "0 8px 24px rgba(25, 118, 210, 0.3)",
                          '&:hover': {
                            background: "linear-gradient(135deg, #1565c0 0%, #0a2756 100%)",
                            boxShadow: "0 12px 28px rgba(25, 118, 210, 0.4)",
                            transform: "translateY(-2px)"
                          },
                          transition: "all 0.2s"
                        }}
                      >
                        {bookingSuccess ? "Booking Confirmed!" : "Confirm Appointment"}
                      </Button>
                    </Paper>
                  </Grow>
                )}
              </Box>
            </Paper>
          </Fade>
        </Grid>
      </Grid>
    </Container>
  );
};

export default PatientAppointment;