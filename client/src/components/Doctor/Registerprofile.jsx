import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Grid,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { API_URL } from "../../config";
import { useAuth } from "../../store/auth";

const emptyApplication = {
  name: "",
  email: "",
  phone: "",
  degree: "",
  medicalLicense: "",
  specialization: "",
  qualifications: "",
  yearsOfExperience: "",
  city: "",
  clinicAddress: "",
  degreeDocument: "",
  licenseDocument: "",
};

const readFile = (file, setValue) => {
  if (!file) return;
  if (file.size > 2 * 1024 * 1024) {
    setValue(null, "Each document must be smaller than 2 MB.");
    return;
  }
  const reader = new FileReader();
  reader.onload = () => setValue(reader.result, "");
  reader.readAsDataURL(file);
};

export default function DoctorVerification() {
  const { authorizationtoken, IsLoading, isLoggedIn } = useAuth();
  const [application, setApplication] = useState(emptyApplication);
  const [status, setStatus] = useState("pending");
  const [rejectionReason, setRejectionReason] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("info");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (IsLoading || !isLoggedIn || !authorizationtoken) return;
    fetch(`${API_URL}/api/doctorform/verification`, { headers: { Authorization: authorizationtoken } })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.msg || "Unable to load application");
        setApplication((current) => ({ ...current, ...data }));
        setStatus(data.status || "pending");
        setRejectionReason(data.rejectionReason || "");
      })
      .catch((error) => {
        setMessage(error.message);
        setMessageType("error");
      });
  }, [IsLoading, isLoggedIn, authorizationtoken]);

  const updateField = (event) => setApplication((current) => ({ ...current, [event.target.name]: event.target.value }));
  const handleFile = (field) => (event) => readFile(event.target.files?.[0], (value, error) => {
    if (error) {
      setMessage(error);
      setMessageType("error");
      return;
    }
    setApplication((current) => ({ ...current, [field]: value }));
  });

  const submit = async (event) => {
    event.preventDefault();
    setMessage("");
    if (!application.degreeDocument || !application.licenseDocument) {
      setMessage("Degree and medical license documents are required.");
      setMessageType("error");
      return;
    }
    setSaving(true);
    try {
      const response = await fetch(`${API_URL}/api/doctorform/verification`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: authorizationtoken },
        body: JSON.stringify(application),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.msg || "Unable to submit application");
      setApplication((current) => ({ ...current, ...data.doctor }));
      setStatus("pending");
      setRejectionReason("");
      setMessage("Application submitted. Admin review is pending.");
      setMessageType("success");
    } catch (error) {
      setMessage(error.message);
      setMessageType("error");
    } finally {
      setSaving(false);
    }
  };

  const statusColor = status === "approved" ? "success" : status === "rejected" ? "error" : "warning";

  return (
    <Container maxWidth="md" sx={{ py: 5 }}>
      <Card elevation={5}>
        <CardContent sx={{ p: { xs: 2, md: 4 } }}>
          <Typography variant="h4" fontWeight={800} color="primary.main">Doctor Verification</Typography>
          <Typography color="text.secondary" sx={{ mt: 1 }}>Submit your identity and professional documents. Patient visibility starts only after admin approval and an active subscription or trial.</Typography>
          <Alert severity={statusColor} sx={{ mt: 3 }}>Application status: <strong>{status}</strong>{rejectionReason ? ` - ${rejectionReason}` : ""}</Alert>
          {message && <Alert severity={messageType} sx={{ mt: 2 }}>{message}</Alert>}

          <Box component="form" onSubmit={submit} sx={{ mt: 3 }}>
            <Grid container spacing={2}>
              {[["name", "Full name"], ["email", "Email"], ["phone", "Phone"], ["degree", "Degree"], ["medicalLicense", "Medical license number"], ["qualifications", "Qualifications"], ["yearsOfExperience", "Years of experience"], ["city", "City"], ["clinicAddress", "Clinic address"]].map(([name, label]) => (
                <Grid item xs={12} sm={name === "clinicAddress" ? 12 : 6} key={name}>
                  <TextField fullWidth required={["name", "email", "degree", "medicalLicense"].includes(name)} name={name} label={label} value={application[name] || ""} onChange={updateField} />
                </Grid>
              ))}
              <Grid item xs={12} sm={6}>
                <TextField fullWidth required select name="specialization" label="Specialization" value={application.specialization || ""} onChange={updateField}>
                  {['General Physician', 'Cardiologist', 'Dermatologist', 'Neurologist', 'Orthopedic', 'Dentist'].map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
                </TextField>
              </Grid>
              <Grid item xs={12}>
                <Stack spacing={1}>
                  <Typography fontWeight={700}>Degree certificate *</Typography>
                  <Button component="label" variant="outlined">{application.degreeDocument ? "Degree document selected" : "Upload degree certificate"}<input hidden type="file" accept="image/*,.pdf" onChange={handleFile("degreeDocument")} /></Button>
                </Stack>
              </Grid>
              <Grid item xs={12}>
                <Stack spacing={1}>
                  <Typography fontWeight={700}>Medical license document *</Typography>
                  <Button component="label" variant="outlined">{application.licenseDocument ? "License document selected" : "Upload medical license"}<input hidden type="file" accept="image/*,.pdf" onChange={handleFile("licenseDocument")} /></Button>
                </Stack>
              </Grid>
            </Grid>
            <Button type="submit" fullWidth variant="contained" size="large" disabled={saving || IsLoading || !isLoggedIn} sx={{ mt: 3 }}>{saving ? "Submitting..." : "Submit for admin verification"}</Button>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
}
