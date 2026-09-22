import { useEffect, useState } from "react";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  InputAdornment,
  Paper,
  Skeleton,
  Stack,
  Tab,
  Tabs,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { styled, alpha } from "@mui/material/styles";
import {
  CheckCircle,
  Cancel,
  Description,
  Email,
  LocationOn,
  MedicalServices,
  Phone,
  School,
  Search,
  Verified,
  WorkspacePremium,
  Refresh,
  PersonOff,
} from "@mui/icons-material";
import { API_URL } from "../config";

// --- Styled Components ---
const PageHeader = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3, 4),
  marginBottom: theme.spacing(4),
  borderRadius: theme.spacing(2),
  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
  color: "#fff",
  position: "relative",
  overflow: "hidden",
  "&::after": {
    content: '""',
    position: "absolute",
    top: -50,
    right: -50,
    width: 200,
    height: 200,
    borderRadius: "50%",
    background: alpha("#fff", 0.1),
  },
}));

const DoctorCard = styled(Card)(({ theme }) => ({
  borderRadius: theme.spacing(2),
  border: `1px solid ${theme.palette.divider}`,
  transition: "all 0.3s ease",
  overflow: "hidden",
  "&:hover": {
    transform: "translateY(-4px)",
    boxShadow: theme.shadows[8],
    borderColor: theme.palette.primary.main,
  },
}));

const InfoRow = ({ icon, label, value }) => (
  <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.8 }}>
    <Box sx={{ color: "primary.main", display: "flex", alignItems: "center" }}>
      {icon}
    </Box>
    <Typography variant="body2" color="text.secondary" sx={{ minWidth: 110 }}>
      {label}:
    </Typography>
    <Typography variant="body2" fontWeight={500}>
      {value || "Not provided"}
    </Typography>
  </Box>
);

const statusColors = {
  pending: { color: "warning", label: "Pending Review" },
  approved: { color: "success", label: "Approved" },
  rejected: { color: "error", label: "Rejected" },
};

const Adminverification = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("info");
  const [updatingId, setUpdatingId] = useState("");
  const [rejectingDoctor, setRejectingDoctor] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState(0);

  const loadDoctors = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/admin/doctors`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const data = await response.json();
      if (response.ok) setDoctors(Array.isArray(data) ? data : []);
      else {
        setMessage(data.msg || "Unable to load doctors");
        setMessageType("error");
      }
    } catch (err) {
      console.error(err);
      setMessage("Unable to connect to the verification service.");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDoctors();
  }, []);

  const updateStatus = async (id, status, reason = "") => {
    try {
      setUpdatingId(id);
      setMessage("");
      const response = await fetch(`${API_URL}/api/admin/doctors/${id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ status, rejectionReason: reason }),
      });
      const data = await response.json();
      if (!response.ok) {
        setMessage(data.msg || "Unable to update doctor status");
        setMessageType("error");
        return;
      }
      setDoctors((current) =>
        current.map((doctor) => (doctor._id === id ? data : doctor))
      );
      setMessage(`${data.name || "Doctor"} is now ${data.status}.`);
      setMessageType("success");
    } catch {
      setMessage("Unable to connect to the approval service.");
      setMessageType("error");
    } finally {
      setUpdatingId("");
    }
  };

  const rejectDoctor = () => {
    if (!rejectingDoctor) return;
    updateStatus(rejectingDoctor._id, "rejected", rejectionReason);
    setRejectingDoctor(null);
    setRejectionReason("");
  };

  const filteredDoctors = doctors.filter((d) => {
    const matchesSearch =
      d.name?.toLowerCase().includes(search.toLowerCase()) ||
      d.email?.toLowerCase().includes(search.toLowerCase()) ||
      d.specialization?.toLowerCase().includes(search.toLowerCase());

    const status = (d.status || "pending").toLowerCase();
    if (tab === 0) return matchesSearch;
    if (tab === 1) return matchesSearch && status === "pending";
    if (tab === 2) return matchesSearch && status === "approved";
    if (tab === 3) return matchesSearch && status === "rejected";
    return matchesSearch;
  });

  const stats = {
    total: doctors.length,
    pending: doctors.filter((d) => (d.status || "pending") === "pending").length,
    approved: doctors.filter((d) => d.status === "approved").length,
    rejected: doctors.filter((d) => d.status === "rejected").length,
  };

  return (
    <Box sx={{ bgcolor: "background.default", minHeight: "100vh", pb: 6 }}>
      <Container maxWidth="lg" sx={{ pt: 4 }}>
        {/* Page Header */}
        <PageHeader elevation={0}>
          <Stack
            direction="row"
            alignItems="center"
            spacing={2}
            sx={{ position: "relative", zIndex: 1 }}
          >
            <Verified sx={{ fontSize: 44 }} />
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="h4" fontWeight={700}>
                Doctor Verification Center
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9, mt: 0.5 }}>
                Review, approve, and manage doctor verification requests
              </Typography>
            </Box>
            <Tooltip title="Refresh">
              <IconButton
                onClick={loadDoctors}
                sx={{
                  color: "#fff",
                  bgcolor: alpha("#fff", 0.15),
                  "&:hover": { bgcolor: alpha("#fff", 0.25) },
                }}
              >
                <Refresh />
              </IconButton>
            </Tooltip>
          </Stack>
        </PageHeader>

        {/* Stats Cards — using Flexbox instead of Grid */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr 1fr", md: "repeat(4, 1fr)" },
            gap: 2,
            mb: 3,
          }}
        >
          {[
            { label: "Total", value: stats.total, color: "primary", icon: <MedicalServices /> },
            { label: "Pending", value: stats.pending, color: "warning", icon: <Description /> },
            { label: "Approved", value: stats.approved, color: "success", icon: <CheckCircle /> },
            { label: "Rejected", value: stats.rejected, color: "error", icon: <Cancel /> },
          ].map((stat) => (
            <Paper
              key={stat.label}
              sx={{
                p: 2,
                borderRadius: 2,
                display: "flex",
                alignItems: "center",
                gap: 2,
                borderLeft: 4,
                borderColor: `${stat.color}.main`,
              }}
            >
              <Avatar
                sx={{
                  bgcolor: alpha("#1976d2", 0.1),
                  color: `${stat.color}.main`,
                }}
              >
                {stat.icon}
              </Avatar>
              <Box>
                <Typography variant="h5" fontWeight={700}>
                  {stat.value}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {stat.label}
                </Typography>
              </Box>
            </Paper>
          ))}
        </Box>

        {/* Search */}
        <TextField
          fullWidth
          placeholder="Search by name, email, or specialization..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ mb: 2, bgcolor: "background.paper", borderRadius: 2 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search color="action" />
              </InputAdornment>
            ),
          }}
        />

        {/* Tabs */}
        <Tabs
          value={tab}
          onChange={(e, v) => setTab(v)}
          sx={{ mb: 3, borderBottom: 1, borderColor: "divider" }}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label={`All (${stats.total})`} />
          <Tab label={`Pending (${stats.pending})`} />
          <Tab label={`Approved (${stats.approved})`} />
          <Tab label={`Rejected (${stats.rejected})`} />
        </Tabs>

        {/* Alert */}
        {message && (
          <Alert
            severity={messageType}
            sx={{ mb: 2, borderRadius: 2 }}
            onClose={() => setMessage("")}
          >
            {message}
          </Alert>
        )}

        {/* Content */}
        {loading ? (
          <Stack spacing={2}>
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} variant="rounded" height={200} sx={{ borderRadius: 2 }} />
            ))}
          </Stack>
        ) : filteredDoctors.length === 0 ? (
          <Paper
            sx={{
              p: 6,
              textAlign: "center",
              borderRadius: 2,
              border: "2px dashed",
              borderColor: "divider",
            }}
          >
            <PersonOff sx={{ fontSize: 64, color: "text.disabled", mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              No doctors found
            </Typography>
            <Typography variant="body2" color="text.disabled">
              {search
                ? "Try adjusting your search or filters"
                : "Verification requests will appear here"}
            </Typography>
          </Paper>
        ) : (
          <Stack spacing={2.5}>
            {filteredDoctors.map((doctor) => {
              const statusKey = (doctor.status || "pending").toLowerCase();
              const statusMeta = statusColors[statusKey] || statusColors.pending;
              const isUpdating = updatingId === doctor._id;

              return (
                <DoctorCard key={doctor._id} elevation={2}>
                  <Box sx={{ height: 4, bgcolor: `${statusMeta.color}.main` }} />

                  <CardContent sx={{ p: 3 }}>
                    {/* Use flexbox for two-column layout — no Grid dependency */}
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: { xs: "column", md: "row" },
                        gap: 3,
                      }}
                    >
                      {/* LEFT */}
                      <Box sx={{ flex: { md: 7 } }}>
                        <Stack direction="row" spacing={2} alignItems="flex-start">
                          <Avatar
                            sx={{
                              width: 64,
                              height: 64,
                              bgcolor: "primary.main",
                              fontSize: 24,
                              fontWeight: 700,
                            }}
                          >
                            {doctor.name?.charAt(0)?.toUpperCase() || "D"}
                          </Avatar>

                          <Box sx={{ flexGrow: 1 }}>
                            <Stack
                              direction="row"
                              alignItems="center"
                              spacing={1}
                              sx={{ mb: 0.5 }}
                            >
                              <Typography variant="h6" fontWeight={700}>
                                {doctor.name || "Unnamed Doctor"}
                              </Typography>
                              <Chip
                                label={statusMeta.label}
                                color={statusMeta.color}
                                size="small"
                                sx={{ fontWeight: 600, height: 22 }}
                              />
                            </Stack>

                            <Stack spacing={0.5} sx={{ mt: 1 }}>
                              <InfoRow icon={<Email fontSize="small" />} label="Email" value={doctor.email} />
                              <InfoRow icon={<Phone fontSize="small" />} label="Phone" value={doctor.phone} />
                              <InfoRow
                                icon={<MedicalServices fontSize="small" />}
                                label="Specialization"
                                value={doctor.specialization}
                              />
                              <InfoRow
                                icon={<School fontSize="small" />}
                                label="Qualifications"
                                value={doctor.qualifications}
                              />
                              <InfoRow
                                icon={<WorkspacePremium fontSize="small" />}
                                label="Degree"
                                value={doctor.degree}
                              />
                              <InfoRow
                                icon={<Verified fontSize="small" />}
                                label="License"
                                value={doctor.medicalLicense || doctor.license}
                              />
                              <InfoRow
                                icon={<LocationOn fontSize="small" />}
                                label="City"
                                value={doctor.city}
                              />
                            </Stack>
                          </Box>
                        </Stack>
                      </Box>

                      {/* RIGHT */}
                      <Box sx={{ flex: { md: 5 } }}>
                        <Paper
                          variant="outlined"
                          sx={{
                            p: 2,
                            borderRadius: 2,
                            bgcolor: "background.default",
                            height: "100%",
                          }}
                        >
                          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                            Documents & Experience
                          </Typography>

                          <Typography variant="body2" sx={{ mb: 1 }}>
                            <strong>Experience:</strong>{" "}
                            {doctor.yearsOfExperience || "Not provided"} years
                          </Typography>
                          <Typography variant="body2" sx={{ mb: 2 }}>
                            <strong>Submitted:</strong>{" "}
                            {doctor.verificationSubmittedAt
                              ? new Date(doctor.verificationSubmittedAt).toLocaleString()
                              : "Not submitted"}
                          </Typography>

                          <Stack
                            direction="row"
                            spacing={1}
                            flexWrap="wrap"
                            useFlexGap
                            sx={{ mb: 2 }}
                          >
                            {doctor.degreeDocument && (
                              <Button
                                size="small"
                                variant="outlined"
                                startIcon={<Description />}
                                component="a"
                                href={doctor.degreeDocument}
                                target="_blank"
                                rel="noreferrer"
                              >
                                Degree Doc
                              </Button>
                            )}
                            {doctor.licenseDocument && (
                              <Button
                                size="small"
                                variant="outlined"
                                startIcon={<Description />}
                                component="a"
                                href={doctor.licenseDocument}
                                target="_blank"
                                rel="noreferrer"
                              >
                                License Doc
                              </Button>
                            )}
                          </Stack>

                          {doctor.rejectionReason && (
                            <Alert severity="error" sx={{ mb: 2, borderRadius: 1 }}>
                              <Typography variant="caption" fontWeight={600}>
                                Rejection Reason:
                              </Typography>
                              <Typography variant="body2">
                                {doctor.rejectionReason}
                              </Typography>
                            </Alert>
                          )}

                          <Divider sx={{ my: 2 }} />

                          <Stack direction="row" spacing={1}>
                            <Button
                              fullWidth
                              variant="contained"
                              color="success"
                              startIcon={
                                isUpdating ? (
                                  <CircularProgress size={16} color="inherit" />
                                ) : (
                                  <CheckCircle />
                                )
                              }
                              disabled={isUpdating || doctor.status === "approved"}
                              onClick={() => updateStatus(doctor._id, "approved")}
                              sx={{ borderRadius: 2, textTransform: "none", fontWeight: 600 }}
                            >
                              Approve
                            </Button>
                            <Button
                              fullWidth
                              variant="outlined"
                              color="error"
                              startIcon={<Cancel />}
                              disabled={isUpdating || doctor.status === "rejected"}
                              onClick={() => setRejectingDoctor(doctor)}
                              sx={{ borderRadius: 2, textTransform: "none", fontWeight: 600 }}
                            >
                              Reject
                            </Button>
                          </Stack>
                        </Paper>
                      </Box>
                    </Box>
                  </CardContent>
                </DoctorCard>
              );
            })}
          </Stack>
        )}
      </Container>

      {/* Rejection Dialog */}
      <Dialog
        open={Boolean(rejectingDoctor)}
        onClose={() => setRejectingDoctor(null)}
        fullWidth
        maxWidth="sm"
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Cancel color="error" />
          Reject Doctor Verification
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Add a reason so the doctor knows what to correct before resubmitting.
          </Typography>
          <TextField
            fullWidth
            multiline
            minRows={3}
            label="Rejection reason"
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            placeholder="e.g. The license document is unclear. Please upload a higher resolution image."
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => setRejectingDoctor(null)}
            sx={{ textTransform: "none" }}
          >
            Cancel
          </Button>
          <Button
            color="error"
            variant="contained"
            disabled={!rejectionReason.trim()}
            onClick={rejectDoctor}
            sx={{ borderRadius: 2, textTransform: "none", fontWeight: 600 }}
          >
            Reject Application
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Adminverification;