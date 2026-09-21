import { useEffect, useState } from "react";
import { Alert, Box, Button, Card, CardContent, Container, Dialog, DialogActions, DialogContent, DialogTitle, Stack, TextField, Typography } from "@mui/material";
import { API_URL } from "../config";

const Adminverification = () => {
  const [doctors, setDoctors] = useState([]);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("info");
  const [updatingId, setUpdatingId] = useState("");
  const [rejectingDoctor, setRejectingDoctor] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");

  const loadDoctors = async () => {
    const response = await fetch(`${API_URL}/api/admin/doctors`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    const data = await response.json();
    if (response.ok) setDoctors(Array.isArray(data) ? data : []);
    else {
      setMessage(data.msg || "Unable to load doctors");
      setMessageType("error");
    }
  };

  useEffect(() => {
    loadDoctors().catch(() => setMessage("Unable to load doctors"));
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
      setDoctors((current) => current.map((doctor) => doctor._id === id ? data : doctor));
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

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" sx={{ mb: 2 }}>Doctor Verification</Typography>
      {message && <Alert severity={messageType} sx={{ mb: 2 }}>{message}</Alert>}
      <Stack spacing={2}>
        {doctors.map((doctor) => (
          <Card key={doctor._id}>
            <CardContent>
              <Typography variant="h6">{doctor.name}</Typography>
              <Typography color="text.secondary">{doctor.email} | {doctor.phone || "No phone"}</Typography>
              <Typography>Specialization: {doctor.specialization || "Not provided"}</Typography>
              <Typography>Qualifications: {doctor.qualifications || "Not provided"}</Typography>
              <Typography>Degree: {doctor.degree || "Not provided"}</Typography>
              <Typography>Medical license: {doctor.medicalLicense || doctor.license || "Not provided"}</Typography>
              <Typography>Experience: {doctor.yearsOfExperience || "Not provided"}</Typography>
              <Typography>City: {doctor.city || "Not provided"}</Typography>
              <Typography>Submitted: {doctor.verificationSubmittedAt ? new Date(doctor.verificationSubmittedAt).toLocaleString() : "Not submitted"}</Typography>
              {doctor.rejectionReason && <Alert severity="error" sx={{ mt: 1 }}>{doctor.rejectionReason}</Alert>}
              <Stack direction={{ xs: "column", sm: "row" }} spacing={1} sx={{ mt: 1 }}>
                {doctor.degreeDocument && <Button size="small" variant="outlined" component="a" href={doctor.degreeDocument} target="_blank" rel="noreferrer">View degree document</Button>}
                {doctor.licenseDocument && <Button size="small" variant="outlined" component="a" href={doctor.licenseDocument} target="_blank" rel="noreferrer">View license document</Button>}
              </Stack>
              <Typography sx={{ mt: 1 }}>Status: {doctor.status || "pending"}</Typography>
              <Box sx={{ display: "flex", gap: 1, mt: 2 }}>
                <Button variant="contained" color="success" disabled={updatingId === doctor._id} onClick={() => updateStatus(doctor._id, "approved")}>Approve</Button>
                <Button variant="outlined" color="error" disabled={updatingId === doctor._id} onClick={() => setRejectingDoctor(doctor)}>Reject</Button>
              </Box>
            </CardContent>
          </Card>
        ))}
      </Stack>
      <Dialog open={Boolean(rejectingDoctor)} onClose={() => setRejectingDoctor(null)} fullWidth maxWidth="sm">
        <DialogTitle>Reject doctor verification</DialogTitle>
        <DialogContent>
          <Typography sx={{ mb: 2 }}>Add a reason so the doctor knows what to correct before resubmitting.</Typography>
          <TextField fullWidth multiline minRows={3} label="Rejection reason" value={rejectionReason} onChange={(event) => setRejectionReason(event.target.value)} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRejectingDoctor(null)}>Cancel</Button>
          <Button color="error" variant="contained" disabled={!rejectionReason.trim()} onClick={rejectDoctor}>Reject application</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Adminverification;