import { useEffect, useMemo, useState } from "react";
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
} from "@mui/material";
import MedicalServicesIcon from "@mui/icons-material/MedicalServices";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import { useAuth } from "../../store/auth";

const sanitizeKey = (value) =>
  (value || "patient")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const getDoctorName = (user) => {
  const stored = JSON.parse(localStorage.getItem("doctorProfile") || "{}");
  return stored?.name || user?.username || user?.name || "Dr. Current User";
};

const PatientFilePage = () => {
  const { appointmentId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [appointment, setAppointment] = useState(null);
  const [fileData, setFileData] = useState({
    patientName: "",
    phone: "",
    weight: "",
    height: "",
    visits: [],
  });
  const [formData, setFormData] = useState({
    weight: "",
    height: "",
    phone: "",
    prescription: "",
    notes: "",
  });
  const [message, setMessage] = useState("");

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("appointmentBookings") || "[]");
    const currentAppointment = (Array.isArray(stored) ? stored : []).find(
      (item) => String(item.id) === String(appointmentId)
    );
    setAppointment(currentAppointment || null);

    const patientKey = currentAppointment?.patientId
      ? `patientMedicalFile_${sanitizeKey(String(currentAppointment.patientId))}`
      : `patientMedicalFile_${sanitizeKey(currentAppointment?.patientName || "patient")}`;

    const savedFile = JSON.parse(localStorage.getItem(patientKey) || "null");
    if (savedFile) {
      setFileData(savedFile);
      setFormData((prev) => ({
        ...prev,
        weight: savedFile.weight || prev.weight,
        height: savedFile.height || prev.height,
        phone: savedFile.phone || prev.phone,
      }));
    } else if (currentAppointment) {
      setFileData((prev) => ({ ...prev, patientName: currentAppointment.patientName || "Patient" }));
      setFormData((prev) => ({ ...prev, phone: prev.phone || "" }));
    }
  }, [appointmentId]);

  const latestVisit = useMemo(() => fileData.visits?.[0] || null, [fileData.visits]);

  const handleFieldChange = (field) => (event) => {
    setFormData((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleSaveVisit = () => {
    if (!appointment) return;

    const doctorName = getDoctorName(user);
    const patientKey = appointment.patientId
      ? `patientMedicalFile_${sanitizeKey(String(appointment.patientId))}`
      : `patientMedicalFile_${sanitizeKey(appointment.patientName || "patient")}`;

    const nextVisit = {
      id: Date.now(),
      date: appointment.date,
      time: appointment.time,
      doctorName,
      weight: formData.weight || fileData.weight || "Not added",
      height: formData.height || fileData.height || "Not added",
      phone: formData.phone || fileData.phone || "Not added",
      prescription: formData.prescription || "No prescription added yet.",
      notes: formData.notes || "Routine follow-up",
      createdAt: new Date().toISOString(),
    };

    const updatedFile = {
      patientName: appointment.patientName || fileData.patientName || "Patient",
      phone: formData.phone || fileData.phone || "",
      weight: formData.weight || fileData.weight || "",
      height: formData.height || fileData.height || "",
      visits: [nextVisit, ...(fileData.visits || [])],
    };

    localStorage.setItem(patientKey, JSON.stringify(updatedFile));

    const historyKey = `doctorPatientHistory_${sanitizeKey(doctorName)}`;
    const existingHistory = JSON.parse(localStorage.getItem(historyKey) || "[]");
    const historyEntry = {
      id: Date.now(),
      patientName: appointment.patientName || "Patient",
      doctorName,
      date: appointment.date,
      time: appointment.time,
      notes: `${formData.prescription || "Prescription added"}\n${formData.notes || ""}`,
      createdAt: new Date().toISOString(),
    };
    localStorage.setItem(historyKey, JSON.stringify([historyEntry, ...existingHistory]));

    const storedBookings = JSON.parse(localStorage.getItem("appointmentBookings") || "[]");
    const updatedBookings = storedBookings.map((booking) =>
      booking.id === appointment.id
        ? {
            ...booking,
            notes: formData.notes || booking.notes,
            prescription: formData.prescription || booking.prescription,
            medicalFileUpdatedAt: new Date().toISOString(),
          }
        : booking
    );
    localStorage.setItem("appointmentBookings", JSON.stringify(updatedBookings));

    setFileData(updatedFile);
    setMessage("Patient file updated successfully.");
    window.dispatchEvent(new Event("history-updated"));
    window.dispatchEvent(new Event("appointments-updated"));
  };

  if (!appointment) {
    return (
      <Container maxWidth="md" sx={{ py: 6 }}>
        <Paper sx={{ p: 4, textAlign: "center", borderRadius: 4 }}>
          <Typography variant="h5" color="text.secondary">
            Appointment file not found.
          </Typography>
        </Paper>
      </Container>
    );
  }

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
                A professional case-sheet experience with patient details, measurements, prescriptions, and visit history in one place.
              </Typography>
            </Box>
            <Chip label="Confidential record" color="primary" variant="outlined" />
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
                  <Typography variant="body1" sx={{ mb: 1.2 }}><strong>Name:</strong> {fileData.patientName || appointment.patientName || "Patient"}</Typography>
                  <Typography variant="body1" sx={{ mb: 1.2 }}><strong>Mobile:</strong> {fileData.phone || "Not added yet"}</Typography>
                  <Typography variant="body1" sx={{ mb: 1.2 }}><strong>Weight:</strong> {fileData.weight || "Not added yet"}</Typography>
                  <Typography variant="body1" sx={{ mb: 1.2 }}><strong>Height:</strong> {fileData.height || "Not added yet"}</Typography>
                  <Typography variant="body1" sx={{ mb: 1.2 }}><strong>Visit:</strong> {appointment.date} • {appointment.time}</Typography>
                  <Typography variant="body1"><strong>Doctor:</strong> {getDoctorName(user)}</Typography>
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
                    Record the patient’s measurements and treatment plan for this visit.
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
              Previous visit history
            </Typography>
            {fileData.visits?.length > 0 ? (
              <Stack spacing={2}>
                {fileData.visits.map((visit) => (
                  <Card key={visit.id} sx={{ borderRadius: 3, border: "1px solid #e7f0ff" }}>
                    <CardContent>
                      <Stack direction={{ xs: "column", md: "row" }} spacing={1} justifyContent="space-between">
                        <Typography fontWeight={700}>{visit.date} • {visit.time}</Typography>
                        <Chip label={visit.doctorName || "Doctor"} color="secondary" variant="outlined" />
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
