// Doctordashboard.jsx - Professional Appointment Cards
import { useEffect, useMemo, useState } from "react";
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
  Avatar,
  Divider,
  Tooltip,
  LinearProgress,
  Badge,
  Tabs,
  Tab,
  IconButton,
  CardActions,
  Collapse,
  Fade,
  Zoom,
} from "@mui/material";
import {
  CalendarMonth,
  Person,
  Notes,
  CheckCircle,
  Cancel,
  MedicalServices,
  EventAvailable,
  AccessTime,
  NotificationsActive,
  VerifiedUser,
  History,
  Schedule,
  ErrorOutline,
  Phone,
  Email,
  LocationOn,
  Edit,
  ArrowForward,
  Close,
  ExpandMore,
  ExpandLess,
  MoreVert,
  ContentCopy,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../store/auth";
import { API_URL } from "../../config";

const getTodayDate = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const normalizeDate = (date) => {
  if (!date) return "";
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return "";
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const Doctordashboard = () => {
  const { user, authorizationtoken } = useAuth();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [selectedDate, setSelectedDate] = useState(getTodayDate());
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [notes, setNotes] = useState("");
  const [notesDialogOpen, setNotesDialogOpen] = useState(false);
  const [subscriptionStatus, setSubscriptionStatus] = useState(null);
  const [subscriptionExpiry, setSubscriptionExpiry] = useState(null);
  const [trialEndsAt, setTrialEndsAt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [expandedCards, setExpandedCards] = useState({});

  // Stats calculated from selected date
  const stats = useMemo(() => {
    const selectedDateAppointments = appointments.filter((app) => {
      return normalizeDate(app.date) === selectedDate;
    });

    return {
      totalToday: selectedDateAppointments.filter((app) => app.status !== "completed").length,
      pending: selectedDateAppointments.filter((app) => app.status === "pending").length,
      confirmed: selectedDateAppointments.filter((app) => app.status === "confirmed").length,
      completed: selectedDateAppointments.filter((app) => app.status === "completed").length,
      totalAll: appointments.length,
      totalCompleted: appointments.filter((app) => app.status === "completed").length,
    };
  }, [appointments, selectedDate]);

  const doctorName = user?.username || user?.name || "Dr. Current User";

  // Fetch ALL doctor appointments from MongoDB
  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setLoading(true);
        setError("");

        if (!authorizationtoken) {
          setError("You need to be logged in to view appointments.");
          setLoading(false);
          return;
        }

        const response = await fetch(`${API_URL}/api/patientform/appointments/doctor`, {
          method: "GET",
          headers: {
            Authorization: authorizationtoken,
            "Content-Type": "application/json",
          },
        });

        const data = await response.json();

        if (!response.ok) {
          setError(data.msg || data.message || `Failed to load appointments (Status: ${response.status})`);
          setAppointments([]);
          setLoading(false);
          return;
        }

        let allAppointments = [];
        if (Array.isArray(data)) {
          allAppointments = data;
        } else if (data.appointments && Array.isArray(data.appointments)) {
          allAppointments = data.appointments;
        } else if (data.data && Array.isArray(data.data)) {
          allAppointments = data.data;
        }

        setAppointments(allAppointments);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching doctor appointments:", error);
        setError("Unable to load appointments from server.");
        setLoading(false);
      }
    };

    fetchAppointments();
  }, [authorizationtoken]);

  // Fetch subscription status
  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        if (!authorizationtoken) {
          setSubscriptionStatus("None");
          return;
        }

        const response = await fetch(`${API_URL}/api/doctorform/subscription/status`, {
          method: "GET",
          headers: {
            Authorization: authorizationtoken,
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          const data = await response.json();
          if (data.status && data.status !== "Active") {
            setSubscriptionStatus(data.status);
            setSubscriptionExpiry(data.subscription?.expiryDate || data.expiryDate || null);
            setTrialEndsAt(data.trialEndsAt || null);
          } else {
            setSubscriptionStatus("Active");
            setSubscriptionExpiry(data.subscription?.expiryDate || data.expiryDate || null);
          }
        } else {
          setSubscriptionStatus("None");
        }
      } catch (error) {
        setSubscriptionStatus("None");
      }
    };

    fetchSubscription();
  }, [authorizationtoken]);

  // Filter appointments based on tab and selected date
  const visibleAppointments = appointments.filter((appointment) => {
    const appointmentDate = normalizeDate(appointment.date);
    if (!appointmentDate) return false;

    if (activeTab === 0) {
      return appointmentDate === selectedDate && appointment.status !== "completed";
    }
    return appointmentDate === selectedDate && appointment.status === "completed";
  });

  const handleOpenNotes = (appointment) => {
    setSelectedAppointment(appointment);
    setNotes(appointment.notes || "");
    setNotesDialogOpen(true);
  };

  const handleOpenPatientFile = (appointment) => {
    navigate(`/patientfile/${appointment._id || appointment.id}`);
  };

  const handleSaveNotes = async () => {
    if (!selectedAppointment) return;

    const appointmentId = selectedAppointment._id || selectedAppointment.id;

    try {
      const response = await fetch(
        `${API_URL}/api/patientform/appointments/${appointmentId}/details`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: authorizationtoken,
          },
          body: JSON.stringify({ notes }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.msg || "Failed to save notes.");
        return;
      }

      setAppointments((prev) =>
        prev.map((item) =>
          (item._id || item.id) === appointmentId ? { ...item, notes } : item
        )
      );
      setMessage(`Saved notes for ${selectedAppointment.patientName || "patient"}.`);
    } catch (error) {
      setMessage("Unable to save notes.");
    } finally {
      setNotesDialogOpen(false);
      setSelectedAppointment(null);
      setNotes("");
    }
  };

  const handleUpdateStatus = async (appointment, status) => {
    try {
      const appointmentId = appointment._id || appointment.id;

      const response = await fetch(
        `${API_URL}/api/patientform/appointments/${appointmentId}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: authorizationtoken,
          },
          body: JSON.stringify({ status }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.msg || "Failed to update appointment.");
        return;
      }

      if (status === "cancelled") {
        setAppointments((prev) =>
          prev.filter((item) => (item._id || item.id) !== appointmentId)
        );
      } else {
        setAppointments((prev) =>
          prev.map((item) =>
            (item._id || item.id) === appointmentId ? { ...item, status } : item
          )
        );
      }

      setMessage(
        `${appointment.patientName || "Patient"}'s appointment ${
          status === "confirmed" ? "confirmed" : "cancelled"
        }.`
      );
    } catch (error) {
      setMessage("Unable to update appointment.");
    }
  };

  const handleMarkDone = async (appointment) => {
    try {
      const appointmentId = appointment._id || appointment.id;

      const response = await fetch(
        `${API_URL}/api/patientform/appointments/${appointmentId}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: authorizationtoken,
          },
          body: JSON.stringify({ status: "completed" }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.msg || "Failed to update appointment.");
        return;
      }

      setAppointments((prev) =>
        prev.map((item) =>
          (item._id || item.id) === appointmentId ? { ...item, status: "completed" } : item
        )
      );

      setMessage(`${appointment.patientName || "Patient"} marked as completed.`);
    } catch (error) {
      setMessage("Unable to update appointment.");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "confirmed":
        return "success";
      case "pending":
        return "warning";
      case "cancelled":
        return "error";
      case "completed":
        return "info";
      default:
        return "default";
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const toggleExpand = (id) => {
    setExpandedCards((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const getInitials = (name) => {
    if (!name) return "P";
    return name
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .slice(0, 2)
      .toUpperCase();
  };

  const formatTime = (time) => {
    if (!time) return "";
    const [hours, minutes] = time.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4, px: { xs: 2, md: 4, lg: 6 } }}>
      {/* Header Section */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 3, md: 5, lg: 6 },
          borderRadius: 4,
          background: "linear-gradient(135deg, #1a237e 0%, #283593 50%, #3949ab 100%)",
          color: "white",
          mb: 4,
          position: "relative",
          overflow: "hidden",
        }}
      >
        <Box sx={{ position: "absolute", top: -50, right: -50, width: 200, height: 200, borderRadius: "50%", background: "rgba(255,255,255,0.1)" }} />
        <Box sx={{ position: "absolute", bottom: -30, right: 50, width: 150, height: 150, borderRadius: "50%", background: "rgba(255,255,255,0.05)" }} />

        <Box sx={{ position: "relative", zIndex: 1 }}>
          <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
            <Avatar sx={{ width: 64, height: 64, bgcolor: "rgba(255,255,255,0.2)", border: "2px solid rgba(255,255,255,0.4)" }}>
              <Typography variant="h4" fontWeight={700}>
                {doctorName.charAt(0)}
              </Typography>
            </Avatar>
            <Box>
              <Typography variant="h4" fontWeight={700} sx={{ textShadow: "0 2px 4px rgba(0,0,0,0.3)" }}>
                {doctorName}
              </Typography>
              <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>
                Doctor Dashboard
              </Typography>
            </Box>
          </Stack>

          <Typography variant="body1" sx={{ opacity: 0.85, mb: 3 }}>
            Review today's visits first and switch to any other date to see planned appointments.
          </Typography>

          {/* Subscription Status - ONLY show if NOT Active */}
          {subscriptionStatus === "Trial" && trialEndsAt && (
            <Alert severity="info" sx={{ mb: 2, borderRadius: 2, bgcolor: "rgba(33, 150, 243, 0.15)", color: "white", "& .MuiAlert-icon": { color: "#42a5f5" }, border: "1px solid rgba(33, 150, 243, 0.3)" }} icon={<NotificationsActive />}>
              <Stack direction={{ xs: "column", sm: "row" }} alignItems={{ xs: "flex-start", sm: "center" }} spacing={1}>
                <Typography variant="body1" fontWeight={600}>
                  Free Trial • Ends on {new Date(trialEndsAt).toLocaleDateString()}
                </Typography>
                <Button size="small" variant="contained" sx={{ bgcolor: "#42a5f5", "&:hover": { bgcolor: "#1976d2" }, ml: { sm: 2 } }} onClick={() => navigate("/subscription")}>
                  Subscribe Now
                </Button>
              </Stack>
            </Alert>
          )}

          {subscriptionStatus === "None" && (
            <Alert severity="warning" sx={{ mb: 2, borderRadius: 2, bgcolor: "rgba(255, 152, 0, 0.15)", color: "white", "& .MuiAlert-icon": { color: "#ffb74d" }, border: "1px solid rgba(255, 152, 0, 0.3)" }} icon={<NotificationsActive />}>
              <Stack direction={{ xs: "column", sm: "row" }} alignItems={{ xs: "flex-start", sm: "center" }} spacing={1}>
                <Typography variant="body1" fontWeight={600}>
                  No active subscription
                </Typography>
                <Button size="small" variant="contained" color="warning" sx={{ ml: { sm: 2 } }} onClick={() => navigate("/subscription")}>
                  Start Free Trial
                </Button>
              </Stack>
            </Alert>
          )}

          {/* Active Subscription - NO ALERT */}
          {subscriptionStatus === "Active" && (
            <Box sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1 }}>
              <Chip icon={<VerifiedUser sx={{ color: "#66bb6a" }} />} label="Active Subscription" size="small" sx={{ bgcolor: "rgba(76, 175, 80, 0.15)", color: "white", border: "1px solid rgba(76, 175, 80, 0.3)", "& .MuiChip-label": { fontWeight: 600, fontSize: "0.85rem" } }} />
              {subscriptionExpiry && (
                <Typography variant="caption" sx={{ opacity: 0.8 }}>
                  Valid until {new Date(subscriptionExpiry).toLocaleDateString()}
                </Typography>
              )}
            </Box>
          )}

          <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems={{ xs: "stretch", md: "center" }} sx={{ mt: 3 }}>
            <TextField
              label="Select appointment date"
              type="date"
              value={selectedDate}
              onChange={(event) => setSelectedDate(event.target.value)}
              InputLabelProps={{ shrink: true }}
              sx={{ minWidth: { xs: "100%", md: 280 }, bgcolor: "rgba(255,255,255,0.15)", borderRadius: 2, "& .MuiOutlinedInput-root": { color: "white", "& fieldset": { borderColor: "rgba(255,255,255,0.3)" }, "&:hover fieldset": { borderColor: "rgba(255,255,255,0.5)" } }, "& .MuiInputLabel-root": { color: "rgba(255,255,255,0.7)" }, "& .MuiInputBase-input": { color: "white" } }}
            />
            <Stack direction="row" spacing={1}>
              <Chip label="Today by default" color="primary" variant="outlined" sx={{ color: "white", borderColor: "rgba(255,255,255,0.4)" }} />
              <Chip label="Mark done → History" color="secondary" variant="outlined" sx={{ color: "white", borderColor: "rgba(255,255,255,0.4)" }} />
            </Stack>
          </Stack>
        </Box>
      </Paper>

      {/* Stats Section */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3, boxShadow: "0 4px 20px rgba(0,0,0,0.08)", transition: "transform 0.2s", "&:hover": { transform: "translateY(-4px)" } }}>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar sx={{ bgcolor: "#1a237e", width: 48, height: 48 }}>
                  <EventAvailable />
                </Avatar>
                <Box>
                  <Typography variant="h5" fontWeight={700} color="primary.main">
                    {stats.totalToday}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {selectedDate === getTodayDate() ? "Today's Appointments" : "Selected Date Appointments"}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3, boxShadow: "0 4px 20px rgba(0,0,0,0.08)", transition: "transform 0.2s", "&:hover": { transform: "translateY(-4px)" } }}>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar sx={{ bgcolor: "#ff9800", width: 48, height: 48 }}>
                  <AccessTime />
                </Avatar>
                <Box>
                  <Typography variant="h5" fontWeight={700} color="#ff9800">
                    {stats.pending}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Pending
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3, boxShadow: "0 4px 20px rgba(0,0,0,0.08)", transition: "transform 0.2s", "&:hover": { transform: "translateY(-4px)" } }}>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar sx={{ bgcolor: "#4caf50", width: 48, height: 48 }}>
                  <CheckCircle />
                </Avatar>
                <Box>
                  <Typography variant="h5" fontWeight={700} color="#4caf50">
                    {stats.confirmed}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Confirmed
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3, boxShadow: "0 4px 20px rgba(0,0,0,0.08)", transition: "transform 0.2s", "&:hover": { transform: "translateY(-4px)" } }}>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar sx={{ bgcolor: "#9c27b0", width: 48, height: 48 }}>
                  <History />
                </Avatar>
                <Box>
                  <Typography variant="h5" fontWeight={700} color="#9c27b0">
                    {stats.totalCompleted}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Completed
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setError("")}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <ErrorOutline />
            <Typography>{error}</Typography>
          </Stack>
        </Alert>
      )}

      {/* Tabs Section */}
      <Paper elevation={0} sx={{ borderRadius: 3, mb: 3, bgcolor: "white", border: "1px solid #e0e0e0" }}>
        <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)} variant="fullWidth" sx={{ "& .MuiTab-root": { fontWeight: 600 }, "& .Mui-selected": { color: "#1a237e" }, "& .MuiTabs-indicator": { bgcolor: "#1a237e" } }}>
          <Tab icon={<Schedule />} label="Appointments" iconPosition="start" />
          <Tab icon={<History />} label="Completed History" iconPosition="start" />
        </Tabs>
      </Paper>

      {/* Message Alert */}
      {message && (
        <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setMessage("")}>
          {message}
        </Alert>
      )}

      {/* Appointments Section */}
      <Paper elevation={0} sx={{ p: { xs: 2, md: 4, lg: 5 }, borderRadius: 4, bgcolor: "#fafafa", border: "1px solid #e0e0e0" }}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h5" fontWeight={700} color="primary.main">
            {activeTab === 0 ? `Appointments for ${formatDate(selectedDate)}` : `Completed Appointments for ${formatDate(selectedDate)}`}
          </Typography>
          <Divider sx={{ mt: 1 }} />
        </Box>

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <LinearProgress sx={{ width: "100%", maxWidth: 400 }} />
          </Box>
        ) : visibleAppointments.length > 0 ? (
          <Grid container spacing={3}>
            {visibleAppointments.map((appointment) => {
              const appointmentId = appointment._id || appointment.id;
              const isExpanded = expandedCards[appointmentId] || false;

              return (
                <Grid item xs={12} md={6} lg={4} key={appointmentId}>
                  <Zoom in timeout={300}>
                    <Card
                      sx={{
                        height: "100%",
                        borderRadius: 3,
                        boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
                        transition: "all 0.3s ease",
                        "&:hover": {
                          transform: "translateY(-5px)",
                          boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                        },
                        display: "flex",
                        flexDirection: "column",
                        overflow: "hidden",
                      }}
                    >
                      {/* Card Header */}
                      <Box
                        sx={{
                          p: 2,
                          background: "linear-gradient(135deg, #e3f2fd 0%, #f8fbff 100%)",
                          borderBottom: "1px solid #e3f2fd",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                        }}
                      >
                        <Stack direction="row" alignItems="center" spacing={1.5}>
                          <Avatar
                            sx={{
                              bgcolor: "#1a237e",
                              color: "white",
                              width: 48,
                              height: 48,
                              fontSize: "1.2rem",
                              fontWeight: 700,
                              border: "2px solid white",
                              boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                            }}
                          >
                            {getInitials(appointment.patientName)}
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle1" fontWeight={800} color="text.primary" sx={{ lineHeight: 1.3 }}>
                              {appointment.patientName || "Patient"}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                              <AccessTime sx={{ fontSize: 14 }} />
                              {formatTime(appointment.time)}
                            </Typography>
                          </Box>
                        </Stack>
                        <Chip
                          label={appointment.status || "pending"}
                          color={getStatusColor(appointment.status)}
                          size="small"
                          sx={{
                            fontWeight: 700,
                            textTransform: "capitalize",
                            fontSize: "0.75rem",
                            "& .MuiChip-label": { px: 1.5 },
                          }}
                        />
                      </Box>

                      <CardContent sx={{ flexGrow: 1, p: 2.5 }}>
                        {/* Patient Details */}
                        <Stack spacing={1.5} sx={{ mb: 2 }}>
                          {appointment.email && (
                            <Stack direction="row" alignItems="center" spacing={1}>
                              <Email sx={{ fontSize: 16, color: "text.secondary" }} />
                              <Typography variant="body2" color="text.secondary" sx={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                {appointment.email}
                              </Typography>
                            </Stack>
                          )}
                          {appointment.phone && (
                            <Stack direction="row" alignItems="center" spacing={1}>
                              <Phone sx={{ fontSize: 16, color: "text.secondary" }} />
                              <Typography variant="body2" color="text.secondary">
                                {appointment.phone}
                              </Typography>
                            </Stack>
                          )}
                          {appointment.date && (
                            <Stack direction="row" alignItems="center" spacing={1}>
                              <CalendarMonth sx={{ fontSize: 16, color: "text.secondary" }} />
                              <Typography variant="body2" color="text.secondary">
                                {new Date(appointment.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                              </Typography>
                            </Stack>
                          )}
                        </Stack>

                        {/* Notes Section */}
                        {appointment.notes && (
                          <Box
                            sx={{
                              p: 1.5,
                              bgcolor: "#f5f5f5",
                              borderRadius: 2,
                              mb: 2,
                              border: "1px solid #e0e0e0",
                            }}
                          >
                            <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mb: 0.5 }}>
                              <Notes sx={{ fontSize: 14, color: "text.secondary" }} />
                              <Typography variant="caption" fontWeight={700} color="text.secondary">
                                Treatment Notes
                              </Typography>
                            </Stack>
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                display: "-webkit-box",
                                WebkitLineClamp: isExpanded ? "unset" : 2,
                                WebkitBoxOrient: "vertical",
                                lineHeight: 1.5,
                              }}
                            >
                              {appointment.notes}
                            </Typography>
                            {appointment.notes.length > 50 && (
                              <Typography
                                variant="caption"
                                color="primary"
                                sx={{ cursor: "pointer", fontWeight: 600, mt: 0.5, display: "inline-block" }}
                                onClick={() => toggleExpand(appointmentId)}
                              >
                                {isExpanded ? "Show Less" : "Show More"}
                              </Typography>
                            )}
                          </Box>
                        )}

                        {!appointment.notes && (
                          <Box
                            sx={{
                              p: 1.5,
                              bgcolor: "#f5f5f5",
                              borderRadius: 2,
                              mb: 2,
                              border: "1px solid #e0e0e0",
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                            }}
                          >
                            <Notes sx={{ fontSize: 16, color: "text.disabled" }} />
                            <Typography variant="body2" color="text.disabled">
                              No treatment notes yet
                            </Typography>
                          </Box>
                        )}
                      </CardContent>

                      {/* Card Actions */}
                      <CardActions sx={{ p: 2, pt: 0, justifyContent: "flex-end", borderTop: "1px solid #f0f0f0" }}>
                        <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", gap: 1 }}>
                          <Tooltip title="Open Patient File">
                            <Button
                              variant="contained"
                              size="small"
                              color="primary"
                              startIcon={<Person />}
                              onClick={() => handleOpenPatientFile(appointment)}
                              sx={{
                                borderRadius: 2,
                                fontSize: "0.75rem",
                                fontWeight: 600,
                                px: 1.5,
                              }}
                            >
                              View File
                            </Button>
                          </Tooltip>
                          {activeTab === 0 && (
                            <>
                              <Tooltip title="Add Treatment Notes">
                                <Button
                                  variant="outlined"
                                  size="small"
                                  color="secondary"
                                  startIcon={<Edit />}
                                  onClick={() => handleOpenNotes(appointment)}
                                  sx={{
                                    borderRadius: 2,
                                    fontSize: "0.75rem",
                                    fontWeight: 600,
                                    px: 1.5,
                                  }}
                                >
                                  Notes
                                </Button>
                              </Tooltip>
                              {appointment.status === "pending" && (
                                <Tooltip title="Confirm Appointment">
                                  <Button
                                    variant="outlined"
                                    size="small"
                                    color="success"
                                    startIcon={<CheckCircle />}
                                    onClick={() => handleUpdateStatus(appointment, "confirmed")}
                                    sx={{
                                      borderRadius: 2,
                                      fontSize: "0.75rem",
                                      fontWeight: 600,
                                      px: 1.5,
                                    }}
                                  >
                                    Confirm
                                  </Button>
                                </Tooltip>
                              )}
                              <Tooltip title="Mark as Completed">
                                <Button
                                  variant="outlined"
                                  size="small"
                                  color="success"
                                  startIcon={<CheckCircle />}
                                  onClick={() => handleMarkDone(appointment)}
                                  sx={{
                                    borderRadius: 2,
                                    fontSize: "0.75rem",
                                    fontWeight: 600,
                                    px: 1.5,
                                  }}
                                >
                                  Done
                                </Button>
                              </Tooltip>
                              <Tooltip title="Cancel Appointment">
                                <Button
                                  variant="outlined"
                                  size="small"
                                  color="error"
                                  startIcon={<Cancel />}
                                  onClick={() => handleUpdateStatus(appointment, "cancelled")}
                                  sx={{
                                    borderRadius: 2,
                                    fontSize: "0.75rem",
                                    fontWeight: 600,
                                    px: 1.5,
                                  }}
                                >
                                  Cancel
                                </Button>
                              </Tooltip>
                            </>
                          )}
                        </Stack>
                      </CardActions>
                    </Card>
                  </Zoom>
                </Grid>
              );
            })}
          </Grid>
        ) : (
          <Box sx={{ py: 6, textAlign: "center", bgcolor: "white", borderRadius: 3, border: "2px dashed #e0e0e0" }}>
            <CalendarMonth sx={{ fontSize: 64, color: "#bdbdbd", mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              {activeTab === 0 ? "No appointments for this date" : "No completed appointments for this date"}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {activeTab === 0 ? "Select another date to see scheduled appointments" : "Completed appointments will appear here"}
            </Typography>
          </Box>
        )}
      </Paper>

      {/* Notes Dialog */}
      <Dialog open={notesDialogOpen} onClose={() => setNotesDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>
          Treatment Notes
          {selectedAppointment && (
            <Typography variant="subtitle2" color="text.secondary">
              {selectedAppointment.patientName} • {selectedAppointment.date} at {selectedAppointment.time}
            </Typography>
          )}
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            multiline
            minRows={6}
            label="Prescription / notes"
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            margin="normal"
            placeholder="Enter treatment details, prescriptions, follow-up instructions..."
            sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button onClick={() => setNotesDialogOpen(false)} color="inherit">
            Cancel
          </Button>
          <Button onClick={handleSaveNotes} variant="contained" color="primary" startIcon={<Notes />} sx={{ borderRadius: 2 }}>
            Save Notes
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Doctordashboard;