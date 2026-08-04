import { useEffect, useState } from "react";
import {
  Box,
  Button,
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
} from "@mui/material";
import { Search } from "@mui/icons-material";
import { useAuth } from "../../store/auth";

const getDoctorKey = (doctorName) =>
  (doctorName || "doctor")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const PatientRecords = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [records, setRecords] = useState([]);

  const doctorName =
    JSON.parse(localStorage.getItem("doctorProfile") || "{}")?.name ||
    user?.username ||
    user?.name ||
    "Dr. Current User";

  useEffect(() => {
    const key = `doctorPatientHistory_${getDoctorKey(doctorName)}`;
    const stored = JSON.parse(localStorage.getItem(key) || "[]");
    setRecords(Array.isArray(stored) ? stored : []);

    const syncRecords = () => {
      const refreshed = JSON.parse(localStorage.getItem(key) || "[]");
      setRecords(Array.isArray(refreshed) ? refreshed : []);
    };

    window.addEventListener("history-updated", syncRecords);
    return () => window.removeEventListener("history-updated", syncRecords);
  }, [doctorName]);

  const filteredRecords = records.filter((record) => {
    const matchesQuery =
      record.patientName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.notes?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDate = selectedDate ? record.date === selectedDate : true;
    return matchesQuery && matchesDate;
  });

  return (
    <Container maxWidth="xl" sx={{ py: 4, px: { xs: 2, md: 4, lg: 6 } }}>
      <Paper elevation={4} sx={{ p: { xs: 3, md: 5, lg: 6 }, borderRadius: 4, background: "linear-gradient(135deg, #f8fbff 0%, #eef4ff 100%)" }}>
        <Typography variant="h4" fontWeight={700} color="primary.main" gutterBottom>
          Patient History
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Track every treated patient for {doctorName}. Records are scoped to this doctor only.
        </Typography>

        <Stack direction={{ xs: "column", md: "row" }} spacing={2} sx={{ mb: 3 }}>
          <TextField
            fullWidth
            label="Search by patient or notes"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
          />
          <TextField
            label="Filter by date"
            type="date"
            value={selectedDate}
            onChange={(event) => setSelectedDate(event.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={{ minWidth: { xs: "100%", md: 240 } }}
          />
        </Stack>

        <Stack direction="row" spacing={1} sx={{ mb: 3, flexWrap: "wrap" }}>
          <Chip label={`${filteredRecords.length} matching visits`} color="primary" variant="outlined" />
          <Chip label="Doctor-specific records" color="secondary" variant="outlined" />
        </Stack>

        <Grid container spacing={2.5}>
          {filteredRecords.length > 0 ? (
            filteredRecords.map((record) => (
              <Grid item xs={12} md={6} lg={4} key={record.id}>
                <Card sx={{ height: "100%", borderRadius: 3, boxShadow: "0 8px 24px rgba(13,71,161,0.08)" }}>
                  <CardContent>
                    <Typography variant="h6" fontWeight={700} color="primary.main">
                      {record.patientName || "Patient"}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                      {record.date} • {record.time}
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 1.5 }}>
                      {record.notes || "No treatment notes yet."}
                    </Typography>
                    <Box sx={{ mt: 2 }}>
                      <Chip label="Completed" color="success" size="small" />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))
          ) : (
            <Grid item xs={12}>
              <Paper sx={{ p: 4, textAlign: "center", borderRadius: 3, bgcolor: "#f8fbff" }}>
                <Typography variant="h6" color="text.secondary">
                  No records found for this doctor yet.
                </Typography>
              </Paper>
            </Grid>
          )}
        </Grid>
      </Paper>
    </Container>
  );
};

export default PatientRecords;
