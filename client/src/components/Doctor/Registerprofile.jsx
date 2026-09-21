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
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import {
  CheckCircleOutline,
  DescriptionOutlined,
  EditOutlined,
  ErrorOutline,
  PendingOutlined,
  RadioButtonUnchecked,
} from "@mui/icons-material";
import { API_URL } from "../../config";
import { useAuth } from "../../store/auth";

const emptyApplication = {
  name: "",
  email: "",
  phone: "",
  medicalLicense: "",
  medicalCouncil: "",
  specialization: "",
  qualifications: "",
  yearsOfExperience: "",
  city: "",
  clinicAddress: "",
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
  const [status, setStatus] = useState("not_submitted");
  const [rejectionReason, setRejectionReason] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("info");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (IsLoading || !isLoggedIn || !authorizationtoken) return undefined;
    let active = true;
    const loadStatus = async () => {
      try {
        const response = await fetch(`${API_URL}/api/doctorform/verification`, { headers: { Authorization: authorizationtoken } });
        const data = await response.json();
        if (!response.ok) throw new Error(data.msg || "Unable to load application");
        if (!active) return;
        setApplication((current) => ({ ...current, ...data }));
        setStatus(data.verificationStatus || "not_submitted");
        setRejectionReason(data.rejectionReason || "");
      } catch (error) {
        if (active) {
          setMessage(error.message);
          setMessageType("error");
        }
      }
    };
    loadStatus();
    const refreshWhenVisible = () => {
      if (document.visibilityState === "visible") loadStatus();
    };
    const interval = window.setInterval(() => {
      if (document.visibilityState === "visible") loadStatus();
    }, 20000);
    document.addEventListener("visibilitychange", refreshWhenVisible);
    return () => {
      active = false;
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", refreshWhenVisible);
    };
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
    if (!application.licenseDocument) {
      setMessage("Your medical licence document is required.");
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

  const statusColor = status === "approved" ? "success" : status === "rejected" ? "error" : status === "pending" ? "warning" : "info";
  const formLocked = status === "pending" || status === "approved";
  const statusText = {
    not_submitted: "Not submitted",
    pending: "Under review",
    approved: "Approved",
    rejected: "Rejected",
  }[status] || status;
  const statusCards = [
    { key: "not_submitted", title: "Not submitted", text: "Complete your application", icon: <DescriptionOutlined />, color: "#64748b" },
    { key: "pending", title: "Under review", text: "Admin review in progress", icon: <PendingOutlined />, color: "#d97706" },
    { key: "approved", title: "Approved", text: "Verification complete", icon: <CheckCircleOutline />, color: "#15803d" },
    { key: "rejected", title: "Action required", text: "Update and resubmit", icon: <ErrorOutline />, color: "#dc2626" },
  ];

  return (
    <Container maxWidth="md" sx={{ py: 5 }}>
      <Card elevation={0} sx={{ overflow: "hidden", borderRadius: 4, border: "1px solid #dce7f5", boxShadow: "0 18px 55px rgba(15, 23, 42, 0.12)" }}>
        <Box sx={{ px: { xs: 2.5, md: 4 }, py: { xs: 3, md: 4 }, color: "white", background: "linear-gradient(135deg, #0f4c81 0%, #1976d2 55%, #38bdf8 100%)" }}>
          <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ sm: "center" }} spacing={2}>
            <Box>
              <Typography variant="overline" sx={{ opacity: 0.85, letterSpacing: 1.4 }}>DOCTOR ACCOUNT</Typography>
              <Typography variant="h4" fontWeight={800}>Verification centre</Typography>
              <Typography sx={{ opacity: 0.88, mt: 0.5 }}>Track your registration review and keep your professional profile active.</Typography>
            </Box>
            <Paper elevation={0} sx={{ px: 2, py: 1.25, borderRadius: 3, minWidth: 175, bgcolor: "rgba(255,255,255,0.96)" }}>
              <Typography variant="caption" color="text.secondary" fontWeight={700}>CURRENT STATUS</Typography>
              <Stack direction="row" alignItems="center" spacing={0.75} sx={{ color: statusCards.find((item) => item.key === status)?.color, mt: 0.3 }}>
                {statusCards.find((item) => item.key === status)?.icon}
                <Typography fontWeight={800}>{statusText}</Typography>
              </Stack>
            </Paper>
          </Stack>
        </Box>
        <CardContent sx={{ p: { xs: 2, md: 4 } }}>
          <Typography color="text.secondary">Your profile becomes discoverable after approval and an active subscription or trial.</Typography>

          <Grid container spacing={1.25} sx={{ mt: 2.5 }}>
            {statusCards.map((item) => {
              const active = item.key === status;
              return <Grid item xs={6} md={3} key={item.key}>
                <Paper
                  elevation={0}
                  sx={{
                    height: "100%", p: 1.5, borderRadius: 3,
                    border: active ? `2px solid ${item.color}` : "1px solid #e2e8f0",
                    bgcolor: active ? `${item.color}12` : "#fff",
                    transition: "all .2s ease",
                    boxShadow: active ? `0 7px 18px ${item.color}26` : "none",
                  }}
                >
                  <Stack direction="row" spacing={1} alignItems="flex-start">
                    <Box sx={{ color: active ? item.color : "#94a3b8", display: "grid", placeItems: "center", mt: 0.15 }}>
                      {active ? item.icon : <RadioButtonUnchecked fontSize="small" />}
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" fontWeight={800} color={active ? item.color : "text.primary"}>{item.title}</Typography>
                      <Typography variant="caption" color="text.secondary">{item.text}</Typography>
                    </Box>
                  </Stack>
                </Paper>
              </Grid>;
            })}
          </Grid>

          <Alert severity={statusColor} sx={{ mt: 3, borderRadius: 2, alignItems: "center" }}>
            <strong>{statusText}.</strong>{status === "pending" && " Your form is securely locked during review. This page refreshes automatically while open."}{status === "not_submitted" && " Submit your council registration details to start the review."}
          </Alert>
          {status === "rejected" && (
            <Alert severity="error" icon={<ErrorOutline />} sx={{ mt: 2, borderRadius: 2 }}>
              <strong>Rejection reason:</strong> {rejectionReason || "Please correct the application and submit it again."}
              <br /><strong>Your previous details are saved below.</strong> Make the requested changes and use the resubmit button.
            </Alert>
          )}
          {status === "approved" && <Alert severity="success" icon={<CheckCircleOutline />} sx={{ mt: 2, borderRadius: 2 }}><strong>Your verification is complete.</strong> Your doctor account is approved.</Alert>}
          {message && <Alert severity={messageType} sx={{ mt: 2 }}>{message}</Alert>}

          {!formLocked && <Box component="form" onSubmit={submit} sx={{ mt: 3 }}>
            <Grid container spacing={2}>
              {[["name", "Full name"], ["email", "Email"], ["phone", "Phone"], ["medicalCouncil", "State Medical Council"], ["medicalLicense", "Council registration number"], ["qualifications", "Qualifications"], ["yearsOfExperience", "Years of experience"], ["city", "City"], ["clinicAddress", "Clinic address"]].map(([name, label]) => (
                <Grid item xs={12} sm={name === "clinicAddress" ? 12 : 6} key={name}>
                  <TextField fullWidth required={["name", "email", "medicalCouncil", "medicalLicense"].includes(name)} name={name} label={label} value={application[name] || ""} onChange={updateField} inputProps={name === "medicalLicense" ? { pattern: "[A-Za-z0-9 /-]{3,40}", maxLength: 40 } : undefined} helperText={name === "medicalLicense" ? "Use the number exactly as issued by your State Medical Council (e.g. DMC/R/12345)." : undefined} />
                </Grid>
              ))}
              <Grid item xs={12} sm={6}>
                <TextField fullWidth required select name="specialization" label="Specialization" value={application.specialization || ""} onChange={updateField}>
                  {['General Physician', 'Cardiologist', 'Dermatologist', 'Neurologist', 'Orthopedic', 'Dentist'].map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
                </TextField>
              </Grid>
              <Grid item xs={12}>
                <Stack spacing={1}>
                  <Typography fontWeight={700}>State Medical Council registration certificate *</Typography>
                  <Button component="label" variant="outlined">{application.licenseDocument ? "Registration certificate selected" : "Upload registration certificate"}<input hidden type="file" accept="image/png,image/jpeg,application/pdf" onChange={handleFile("licenseDocument")} /></Button>
                </Stack>
              </Grid>
            </Grid>
            <Button type="submit" fullWidth variant="contained" size="large" startIcon={status === "rejected" ? <EditOutlined /> : <DescriptionOutlined />} disabled={saving || IsLoading || !isLoggedIn} sx={{ mt: 3, py: 1.35, borderRadius: 2, fontWeight: 800, textTransform: "none", boxShadow: "0 9px 18px rgba(25,118,210,.25)" }}>{saving ? "Submitting..." : status === "rejected" ? "Update & resubmit application" : "Submit for verification"}</Button>
          </Box>}
        </CardContent>
      </Card>
    </Container>
  );
}
