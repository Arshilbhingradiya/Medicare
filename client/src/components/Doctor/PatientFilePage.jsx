import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Divider,
  Grid,
  Paper,
  Stack,
  TextField,
  Typography,
  CircularProgress,
} from "@mui/material";
import MedicalServicesIcon from "@mui/icons-material/MedicalServices";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import { useAuth } from "../../store/auth";
import { API_URL } from "../../config";

const PatientFilePage = () => {
  const { appointmentId } = useParams();
  const navigate = useNavigate();
  const { authorizationtoken } = useAuth();

  const [appointment, setAppointment] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    weight: "",
    height: "",
    phone: "",
    prescription: "",
    notes: "",
  });
  const [message, setMessage] = useState("");

  // Load the appointment (case file) from the backend
  useEffect(() => {
    const fetchAppointment = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `${API_URL}/api/patientform/appointments/${appointmentId}`,
          {
            method: "GET",
            headers: { Authorization: authorizationtoken },
          }
        );
        const data = await response.json();

        if (!response.ok) {
          setMessage(data.msg || "Unable to load this appointment.");
          setAppointment(null);
          return;
        }

        setAppointment(data);
        setFormData({
          weight: data.weight || "",
          height: data.height || "",
          phone: data.phone || "",
          prescription: data.prescription || "",
          notes: data.notes || "",
        });
      } catch (error) {
        console.error("Error loading appointment:", error);
        setMessage("Unable to connect to the server.");
      } finally {
        setLoading(false);
      }
    };

    if (appointmentId && authorizationtoken) {
      fetchAppointment();
    }
  }, [appointmentId, authorizationtoken]);

  // Once we know which patient this is, load their full visit history with this doctor
  useEffect(() => {
    const fetchHistory = async () => {
      const patientUserId = appointment?.patientUser;
      if (!patientUserId) return;

      try {
        const response = await fetch(
          `${API_URL}/api/patientform/appointments/patient/${patientUserId}`,
          {
            method: "GET",
            headers: { Authorization: authorizationtoken },
          }
        );
        const data = await response.json();
        if (response.ok) {
          setHistory(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        console.error("Error loading patient history:", error);
      }
    };

    fetchHistory();
  }, [appointment, authorizationtoken]);

  const handleFieldChange = (field) => (event) => {
    setFormData((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleSaveVisit = async () => {
    if (!appointment) return;

    try {
      const response = await fetch(
        `${API_URL}/api/patientform/appointments/${appointmentId}/details`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: authorizationtoken,
          },
          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.msg || "Failed to update patient file.");
        return;
      }

      setAppointment(data);
      setHistory((prev) =>
        prev.map((item) => (item._id === data._id ? data : item))
      );
      setMessage("Patient file updated successfully.");
    } catch (error) {
      console.error("Error saving patient file:", error);
      setMessage("Unable to connect to the server.");
    }
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 6, textAlign: "center" }}>
        <CircularProgress />
      </Container>
    );
  }

  if (!appointment) {
    return (
      <Container maxWidth="md" sx={{ py: 6 }}>
        <Paper sx={{ p: 4, textAlign: "center", borderRadius: 4 }}>
          <Typography variant="h5" color="text.secondary">
            {message || "Appointment file not found."}
          </Typography>
          <Button sx={{ mt: 2 }} onClick={() => navigate(-1)}>
            Go back
          </Button>
        </Paper>
      </Container>
    );
  }

  // Previous visits excludes the visit currently open
  const previousVisits = history.filter((item) => item._id !== appointment._id);

  return (
    <Container maxWidth="xl" sx={{ py: 4, px: { xs: 2, md: 4, lg: 6 } }}>
      <Paper elevation={4} sx={{ p: { xs: 3, md: 5, lg: 6 }, borderRadius: 4, background: "linear-gradient(135deg, #f7fbff 0%, #eef6ff 100%)" }}>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)} sx={{ mb: 2 }}>
          Back to dashboard
        </Button>

        <Box sx={{ border: "1px solid #dbeafe", borderRadius: 4, p: { xs: 2.5, md: 4 }, background: "#ffffff", boxShadow: "0 12px 35px rgba(13,71,161,0.08)" }}>
          <Stack direction={{ xs: "column", md: "row" }} spacing={2} justifyContent="space-between" alignItems={{ xs: "flex-start", md: "center" }} sx={{ mb: 3 }}>
            <Box>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                <LocalHospitalIcon color="primary" />
                <Typography variant="h4" fontWeight={700} color="primary.main">
                  Hospital Medical File
                </Typography>
              </Stack>
              <Typography variant="body1" color="text.secondary">
                Patient details, measurements, prescriptions, and visit history — synced live from the database.
              </Typography>
            </Box>
            <Chip label={`Status: ${appointment.status}`} color="primary" variant="outlined" sx={{ textTransform: "capitalize" }} />
          </Stack>

          <Grid container spacing={3}>
            <Grid item xs={12} lg={4}>
              <Card sx={{ height: "100%", borderRadius: 3, bgcolor: "#f8fbff", border: "1px solid #dbeafe" }}>
                <CardContent>
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                    <MedicalServicesIcon color="primary" />
                    <Typography variant="h6" fontWeight={700} color="primary.main">
                      Patient summary
                    </Typography>
                  </Stack>
                  <Divider sx={{ mb: 2 }} />
                  <Typography variant="body1" sx={{ mb: 1.2 }}><strong>Name:</strong> {appointment.patientName || "Patient"}</Typography>
                  <Typography variant="body1" sx={{ mb: 1.2 }}><strong>Mobile:</strong> {appointment.phone || "Not added yet"}</Typography>
                  <Typography variant="body1" sx={{ mb: 1.2 }}><strong>Weight:</strong> {appointment.weight || "Not added yet"}</Typography>
                  <Typography variant="body1" sx={{ mb: 1.2 }}><strong>Height:</strong> {appointment.height || "Not added yet"}</Typography>
                  <Typography variant="body1" sx={{ mb: 1.2 }}><strong>Visit:</strong> {new Date(appointment.date).toLocaleDateString()} • {appointment.time}</Typography>
                  <Typography variant="body1"><strong>Doctor:</strong> {appointment.doctorName || "Doctor"}</Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} lg={8}>
              <Card sx={{ height: "100%", borderRadius: 3, bgcolor: "#ffffff", border: "1px solid #e3f2fd" }}>
                <CardContent>
                  <Typography variant="h6" fontWeight={700} color="primary.main" gutterBottom>
                    Daily treatment entry
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Record the patient&apos;s measurements and treatment plan for this visit.
                  </Typography>

                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Weight"
                        value={formData.weight}
                        onChange={handleFieldChange("weight")}
                        placeholder="e.g. 68 kg"
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Height"
                        value={formData.height}
                        onChange={handleFieldChange("height")}
                        placeholder="e.g. 172 cm"
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Mobile number"
                        value={formData.phone}
                        onChange={handleFieldChange("phone")}
                        placeholder="e.g. 9876543210"
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Prescription / medicine"
                        value={formData.prescription}
                        onChange={handleFieldChange("prescription")}
                        multiline
                        minRows={3}
                        placeholder="Paracetamol 500mg twice daily for 3 days"
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Treatment notes"
                        value={formData.notes}
                        onChange={handleFieldChange("notes")}
                        multiline
                        minRows={3}
                        placeholder="Patient reports mild fever and hydration advised"
                      />
                    </Grid>
                  </Grid>

                  <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} sx={{ mt: 2 }}>
                    <Button variant="contained" color="primary" onClick={handleSaveVisit}>
                      Save to patient file
                    </Button>
                    <Button variant="outlined" onClick={() => navigate(-1)}>
                      Cancel
                    </Button>
                  </Stack>

                  {message && (
                    <Typography variant="body2" color="success.main" sx={{ mt: 2 }}>
                      {message}
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <Box sx={{ mt: 4 }}>
            <Typography variant="h6" fontWeight={700} color="primary.main" gutterBottom>
              Previous visit history with this doctor
            </Typography>
            {previousVisits.length > 0 ? (
              <Stack spacing={2}>
                {previousVisits.map((visit) => (
                  <Card key={visit._id} sx={{ borderRadius: 3, border: "1px solid #e7f0ff" }}>
                    <CardContent>
                      <Stack direction={{ xs: "column", md: "row" }} spacing={1} justifyContent="space-between">
                        <Typography fontWeight={700}>
                          {new Date(visit.date).toLocaleDateString()} • {visit.time}
                        </Typography>
                        <Chip label={visit.status} color="secondary" variant="outlined" sx={{ textTransform: "capitalize" }} />
                      </Stack>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        {visit.notes || "No notes recorded"}
                      </Typography>
                      <Typography variant="body1" sx={{ mt: 1.2 }}>
                        <strong>Weight:</strong> {visit.weight || "Not added"} • <strong>Height:</strong> {visit.height || "Not added"}
                      </Typography>
                      <Typography variant="body1" sx={{ mt: 0.5 }}>
                        <strong>Mobile:</strong> {visit.phone || "Not added"}
                      </Typography>
                      <Typography variant="body1" sx={{ mt: 0.8 }}>
                        <strong>Prescription:</strong> {visit.prescription || "No prescription added"}
                      </Typography>
                    </CardContent>
                  </Card>
                ))}
              </Stack>
            ) : (
              <Paper sx={{ p: 3, textAlign: "center", borderRadius: 3, bgcolor: "#f8fbff", border: "1px dashed #c5d9ff" }}>
                <Typography color="text.secondary">
                  No previous treatment history yet for this patient.
                </Typography>
              </Paper>
            )}
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default PatientFilePage;
