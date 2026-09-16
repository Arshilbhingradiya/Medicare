// PatientRecords.jsx - Fixed Version (No Loading Issues)
import { useEffect, useState, useMemo } from "react";
import {
  Box,
  Card,
  CardContent,
  Chip,
  Container,
  Grid,
  InputAdornment,
  Paper,
  Stack,
  TextField,
  Typography,
  CircularProgress,
  Avatar,
  Divider,
  Tooltip,
  IconButton,
  Fade,
  Zoom,
  LinearProgress,
  Menu,
  MenuItem,
  Button,
  Badge,
  Tabs,
  Tab,
  Skeleton,
  Alert,
} from "@mui/material";
import {
  Search,
  Person,
  MedicalServices,
  CalendarMonth,
  Notes,
  Email,
  Phone,
  LocationOn,
  ArrowForward,
  FilterList,
  Clear,
  CheckCircle,
  Cancel,
  Schedule,
  History,
  Download,
  MoreVert,
  Visibility,
  DateRange,
  AccessTime,
  Verified,
  ErrorOutline,
  Refresh,
  SmartToy,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../store/auth";
import { API_URL } from "../../config";

const PatientRecords = () => {
  const { authorizationtoken, user } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState(0);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [expandedCards, setExpandedCards] = useState({});
  const [aiSummary, setAiSummary] = useState("");
  const [summaryLoading, setSummaryLoading] = useState(false);

  // Fetch all appointments from MongoDB
  useEffect(() => {
    const fetchRecords = async () => {
      try {
        setLoading(true);
        setError("");

        if (!authorizationtoken) {
          setError("Please login to view patient records.");
          setLoading(false);
          return;
        }

        const response = await fetch(
          `${API_URL}/api/patientform/appointments/doctor`,
          {
            method: "GET",
            headers: {
              Authorization: authorizationtoken,
              "Content-Type": "application/json",
            },
          }
        );

        const data = await response.json();

        if (response.ok) {
          let allRecords = [];
          if (Array.isArray(data)) {
            allRecords = data;
          } else if (data.appointments && Array.isArray(data.appointments)) {
            allRecords = data.appointments;
          } else if (data.data && Array.isArray(data.data)) {
            allRecords = data.data;
          }
          setRecords(allRecords);
        } else {
          setError(data.msg || "Failed to load patient records");
          setRecords([]);
        }
      } catch (error) {
        console.error("Error fetching patient records:", error);
        setError("Unable to connect to server.");
        setRecords([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRecords();
  }, [authorizationtoken]);

  // Filter records based on search and date
  const filteredRecords = useMemo(() => {
    return records.filter((record) => {
      const matchesQuery =
        record.patientName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        record.notes?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        record.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        record.phone?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        record.specialization?.toLowerCase().includes(searchQuery.toLowerCase());

      const recordDate = record.date
        ? new Date(record.date).toISOString().split("T")[0]
        : "";

      const matchesDate = selectedDate ? recordDate === selectedDate : true;

      if (activeTab === 0) {
        return matchesQuery && matchesDate;
      } else if (activeTab === 1) {
        return matchesQuery && matchesDate && record.status === "completed";
      } else if (activeTab === 2) {
        return matchesQuery && matchesDate && record.status === "pending";
      } else if (activeTab === 3) {
        return matchesQuery && matchesDate && record.status === "cancelled";
      }

      return false;
    });
  }, [records, searchQuery, selectedDate, activeTab]);

  // Calculate stats
  const stats = useMemo(() => {
    return {
      total: records.length,
      completed: records.filter((r) => r.status === "completed").length,
      pending: records.filter((r) => r.status === "pending").length,
      confirmed: records.filter((r) => r.status === "confirmed").length,
      cancelled: records.filter((r) => r.status === "cancelled").length,
    };
  }, [records]);

  const statusColor = (status) => {
    switch (status) {
      case "completed":
        return "success";
      case "confirmed":
        return "primary";
      case "cancelled":
        return "error";
      case "pending":
        return "warning";
      default:
        return "default";
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (time) => {
    if (!time) return "";
    const [hours, minutes] = time.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
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

  const handleMenuOpen = (event, record) => {
    setAnchorEl(event.currentTarget);
    setSelectedRecord(record);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedRecord(null);
  };

  const handleViewFile = () => {
    if (selectedRecord) {
      navigate(`/patientfile/${selectedRecord._id}`);
    }
    handleMenuClose();
  };

  const generateSummary = async (record) => {
    if (!record) return;
    setSummaryLoading(true);
    setAiSummary("");
    try {
      const response = await fetch(`${API_URL}/api/assistant/summarize-record`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: authorizationtoken },
        body: JSON.stringify({ record }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Summary unavailable");
      setAiSummary(data.summary);
    } catch (error) {
      setAiSummary(error.message || "Unable to generate summary");
    } finally {
      setSummaryLoading(false);
      handleMenuClose();
    }
  };

  const downloadReport = (items = filteredRecords) => {
    const escapeCell = (value) => `"${String(value ?? "").replace(/"/g, '""')}"`;
    const rows = [
      ["Patient Name", "Date", "Time", "Status"],
      ...items.map((record) => [
        record.patientName || "Patient",
        formatDate(record.date),
        formatTime(record.time),
        record.status || "pending",
      ]),
    ];
    const csv = rows.map((row) => row.map(escapeCell).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `patient-appointments-${selectedDate || "all"}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    handleMenuClose();
  };

  const toggleExpand = (id) => {
    setExpandedCards((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedDate("");
    setActiveTab(0);
  };

  // Always render the full UI structure
  return (
    <Container maxWidth="xl" sx={{ py: 4, px: { xs: 2, md: 4, lg: 6 } }}>
      {/* Hero Header - Always Visible */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 3, md: 5, lg: 6 },
          borderRadius: 4,
          mb: 4,
          background: "linear-gradient(135deg, #0D47A1 0%, #1565C0 50%, #1976D2 100%)",
          color: "white",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {aiSummary && (
          <Alert severity="info" icon={<SmartToy />} sx={{ mb: 2, whiteSpace: "pre-wrap" }} onClose={() => setAiSummary("")}>
            <strong>AI record summary</strong>{"\n"}{aiSummary}
          </Alert>
        )}
        <Box sx={{ position: "absolute", top: -50, right: -50, width: 200, height: 200, borderRadius: "50%", background: "rgba(255,255,255,0.1)" }} />
        <Box sx={{ position: "absolute", bottom: -30, left: -20, width: 150, height: 150, borderRadius: "50%", background: "rgba(255,255,255,0.05)" }} />

        <Box sx={{ position: "relative", zIndex: 1 }}>
          <Stack direction={{ xs: "column", md: "row" }} spacing={3} alignItems={{ xs: "flex-start", md: "center" }}>
            <Avatar sx={{ width: 80, height: 80, bgcolor: "rgba(255,255,255,0.2)", border: "2px solid rgba(255,255,255,0.4)" }}>
              <MedicalServices sx={{ fontSize: 48 }} />
            </Avatar>
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="h3" fontWeight={800} sx={{ textShadow: "0 2px 4px rgba(0,0,0,0.2)" }}>
                Patient Records
              </Typography>
              <Typography variant="h6" sx={{ opacity: 0.9, mt: 1 }}>
                Complete medical history of all your patients
              </Typography>
            </Box>
            <Stack direction="row" spacing={1}>
              <Chip
                icon={<Person />}
                label={`${stats.total} Total`}
                color="primary"
                sx={{ fontWeight: 700, bgcolor: "rgba(255,255,255,0.15)", color: "white" }}
              />
              <Chip
                icon={<History />}
                label={`${stats.completed} Completed`}
                color="success"
                sx={{ fontWeight: 700, bgcolor: "rgba(255,255,255,0.15)", color: "white" }}
              />
            </Stack>
          </Stack>
        </Box>
      </Paper>

      {/* Stats Section - Always Visible */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3, boxShadow: "0 4px 20px rgba(0,0,0,0.08)", transition: "transform 0.2s", "&:hover": { transform: "translateY(-4px)" } }}>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar sx={{ bgcolor: "#1a237e", width: 48, height: 48 }}>
                  <Person />
                </Avatar>
                <Box>
                  <Typography variant="h5" fontWeight={700} color="primary.main">
                    {loading ? <Skeleton width={40} /> : stats.total}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Records
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
                    {loading ? <Skeleton width={40} /> : stats.completed}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Completed
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
                  <Schedule />
                </Avatar>
                <Box>
                  <Typography variant="h5" fontWeight={700} color="#ff9800">
                    {loading ? <Skeleton width={40} /> : stats.pending}
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
                <Avatar sx={{ bgcolor: "#f44336", width: 48, height: 48 }}>
                  <Cancel />
                </Avatar>
                <Box>
                  <Typography variant="h5" fontWeight={700} color="#f44336">
                    {loading ? <Skeleton width={40} /> : stats.cancelled}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Cancelled
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

      {/* Filters Section - Always Visible */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          borderRadius: 3,
          bgcolor: "#fafafa",
          border: "1px solid #e0e0e0",
          mb: 4,
        }}
      >
        <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems={{ xs: "stretch", md: "center" }}>
          <TextField
            fullWidth
            label="Search patients..."
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
              endAdornment: searchQuery && (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => setSearchQuery("")}>
                    <Clear fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
          />
          <TextField
            label="Filter by date"
            type="date"
            value={selectedDate}
            onChange={(event) => setSelectedDate(event.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={{
              minWidth: { xs: "100%", md: 240 },
              "& .MuiOutlinedInput-root": { borderRadius: 2 },
            }}
          />
          <Button
            variant="outlined"
            onClick={clearFilters}
            startIcon={<Refresh />}
            sx={{
              borderRadius: 2,
              px: 3,
              fontWeight: 600,
              textTransform: "none",
              height: 56,
            }}
          >
            Clear
          </Button>
        </Stack>

        {/* Tabs */}
        <Tabs
          value={activeTab}
          onChange={(e, newValue) => setActiveTab(newValue)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            mt: 2,
            "& .MuiTab-root": { fontWeight: 600, textTransform: "none", minHeight: 48 },
            "& .Mui-selected": { color: "#1a237e" },
            "& .MuiTabs-indicator": { bgcolor: "#1a237e" },
          }}
        >
          <Tab icon={<Person />} iconPosition="start" label={`All (${stats.total})`} />
          <Tab icon={<CheckCircle />} iconPosition="start" label={`Completed (${stats.completed})`} />
          <Tab icon={<Schedule />} iconPosition="start" label={`Pending (${stats.pending})`} />
          <Tab icon={<Cancel />} iconPosition="start" label={`Cancelled (${stats.cancelled})`} />
        </Tabs>

        <Stack direction="row" spacing={1} sx={{ mt: 2, flexWrap: "wrap" }}>
          <Chip label={`${filteredRecords.length} results`} color="primary" variant="outlined" />
          {(searchQuery || selectedDate) && (
            <Chip label="Filters active" color="secondary" variant="outlined" />
          )}
        </Stack>
      </Paper>

      {/* Records Grid - Always Visible */}
      {loading ? (
        <Box sx={{ position: "relative", minHeight: 400 }}>
          <Grid container spacing={3}>
            {[1, 2, 3, 4, 5, 6].map((skeleton) => (
              <Grid item xs={12} md={6} lg={4} key={skeleton}>
                <Skeleton variant="rectangular" height={300} sx={{ borderRadius: 3 }} />
              </Grid>
            ))}
          </Grid>
          <Box sx={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, display: "flex", alignItems: "center", justifyContent: "center", bgcolor: "rgba(255,255,255,0.7)", backdropFilter: "blur(4px)" }}>
            <Stack alignItems="center">
              <CircularProgress />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                Loading records...
              </Typography>
            </Stack>
          </Box>
        </Box>
      ) : filteredRecords.length > 0 ? (
        <Grid container spacing={3}>
          {filteredRecords.map((record, index) => {
            const recordId = record._id;
            const isExpanded = expandedCards[recordId] || false;

            return (
              <Grid item xs={12} md={6} lg={4} key={recordId}>
                <Zoom in={true} timeout={(index + 1) * 200}>
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
                      position: "relative",
                    }}
                  >
                    {/* Status Banner */}
                    <Box
                      sx={{
                        p: 1,
                        textAlign: "center",
                        bgcolor:
                          record.status === "completed"
                            ? "#4caf50"
                            : record.status === "confirmed"
                            ? "#1976d2"
                            : record.status === "cancelled"
                            ? "#f44336"
                            : "#ff9800",
                        color: "white",
                        fontWeight: 700,
                        fontSize: "0.8rem",
                        textTransform: "uppercase",
                        letterSpacing: 1,
                      }}
                    >
                      {record.status || "Pending"}
                    </Box>

                    {/* Card Header */}
                    <Box sx={{ p: 2, bgcolor: "#f8fbff", borderBottom: "1px solid #e3f2fd" }}>
                      <Stack direction="row" alignItems="center" spacing={2}>
                        <Avatar
                          sx={{
                            bgcolor: "#1a237e",
                            color: "white",
                            width: 52,
                            height: 52,
                            fontSize: "1.1rem",
                            fontWeight: 700,
                            border: "2px solid white",
                            boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                          }}
                        >
                          {getInitials(record.patientName)}
                        </Avatar>
                        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                          <Typography variant="h6" fontWeight={800} color="text.primary" sx={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {record.patientName || "Patient"}
                          </Typography>
                          <Stack direction="row" alignItems="center" spacing={0.5}>
                            <AccessTime sx={{ fontSize: 14, color: "text.secondary" }} />
                            <Typography variant="caption" color="text.secondary">
                              {formatTime(record.time)}
                            </Typography>
                          </Stack>
                        </Box>
                        <IconButton size="small" onClick={(e) => handleMenuOpen(e, record)}>
                          <MoreVert />
                        </IconButton>
                      </Stack>
                    </Box>

                    <CardContent sx={{ flexGrow: 1, p: 2.5 }}>
                      {/* Patient Details */}
                      <Stack spacing={1.5} sx={{ mb: 2 }}>
                        {record.email && (
                          <Stack direction="row" alignItems="center" spacing={1}>
                            <Email sx={{ fontSize: 16, color: "text.secondary" }} />
                            <Typography variant="body2" color="text.secondary" sx={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                              {record.email}
                            </Typography>
                          </Stack>
                        )}
                        {record.phone && (
                          <Stack direction="row" alignItems="center" spacing={1}>
                            <Phone sx={{ fontSize: 16, color: "text.secondary" }} />
                            <Typography variant="body2" color="text.secondary">
                              {record.phone}
                            </Typography>
                          </Stack>
                        )}
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <CalendarMonth sx={{ fontSize: 16, color: "text.secondary" }} />
                          <Typography variant="body2" color="text.secondary">
                            {formatDate(record.date)}
                          </Typography>
                        </Stack>
                      </Stack>

                      <Divider sx={{ my: 2 }} />

                      {/* Notes Section */}
                      {record.notes ? (
                        <Box sx={{ p: 1.5, bgcolor: "#f5f5f5", borderRadius: 2, border: "1px solid #e0e0e0" }}>
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
                            {record.notes}
                          </Typography>
                          {record.notes.length > 80 && (
                            <Typography
                              variant="caption"
                              color="primary"
                              sx={{ cursor: "pointer", fontWeight: 600, mt: 0.5, display: "inline-block" }}
                              onClick={() => toggleExpand(recordId)}
                            >
                              {isExpanded ? "Show Less" : "Show More"}
                            </Typography>
                          )}
                        </Box>
                      ) : (
                        <Box
                          sx={{
                            p: 1.5,
                            bgcolor: "#f5f5f5",
                            borderRadius: 2,
                            border: "1px solid #e0e0e0",
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                          }}
                        >
                          <Notes sx={{ fontSize: 16, color: "text.disabled" }} />
                          <Typography variant="body2" color="text.disabled">
                            No treatment notes available
                          </Typography>
                        </Box>
                      )}
                    </CardContent>

                    {/* Card Actions */}
                    <Box sx={{ p: 2, pt: 0, borderTop: "1px solid #f0f0f0" }}>
                      <Button
                        fullWidth
                        variant="contained"
                        color="primary"
                        startIcon={<Visibility />}
                        onClick={() => navigate(`/patientfile/${recordId}`)}
                        sx={{
                          borderRadius: 2,
                          fontWeight: 700,
                          textTransform: "none",
                          boxShadow: "0 4px 12px rgba(13,71,161,0.2)",
                          "&:hover": { boxShadow: "0 6px 16px rgba(13,71,161,0.3)" },
                        }}
                      >
                        View Full Records
                      </Button>
                    </Box>
                  </Card>
                </Zoom>
              </Grid>
            );
          })}
        </Grid>
      ) : (
        <Paper
          sx={{
            p: 6,
            textAlign: "center",
            borderRadius: 3,
            bgcolor: "#f8fbff",
            border: "2px dashed #e3f2fd",
          }}
        >
          <Person sx={{ fontSize: 64, color: "#bdbdbd", mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No patient records found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {searchQuery || selectedDate
              ? "Try adjusting your search or filters"
              : "Patient records will appear here once appointments are booked"}
          </Typography>
          {(searchQuery || selectedDate) && (
            <Button
              variant="outlined"
              color="primary"
              startIcon={<Clear />}
              onClick={clearFilters}
              sx={{ mt: 2, borderRadius: 2, fontWeight: 600 }}
            >
              Clear Filters
            </Button>
          )}
        </Paper>
      )}

      {/* Actions Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
            minWidth: 200,
          },
        }}
      >
        <MenuItem onClick={handleViewFile}>
          <Visibility sx={{ mr: 1.5, fontSize: 20 }} />
          View Patient File
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <Notes sx={{ mr: 1.5, fontSize: 20 }} />
          View Notes
        </MenuItem>
        <MenuItem onClick={() => downloadReport(selectedRecord ? [selectedRecord] : filteredRecords)}>
          <Download sx={{ mr: 1.5, fontSize: 20 }} />
          Download Appointment
        </MenuItem>
        <MenuItem onClick={() => downloadReport(filteredRecords)}>
          <Download sx={{ mr: 1.5, fontSize: 20 }} />
          Download Filtered History
        </MenuItem>
        <MenuItem disabled={summaryLoading || !selectedRecord} onClick={() => generateSummary(selectedRecord)}>
          <SmartToy sx={{ mr: 1.5, fontSize: 20 }} />
          {summaryLoading ? "Generating summary..." : "Generate AI Summary"}
        </MenuItem>
      </Menu>
    </Container>
  );
};

export default PatientRecords;