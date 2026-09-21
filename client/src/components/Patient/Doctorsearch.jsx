import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  TextField,
  Select,
  MenuItem,
  Card,
  CardContent,
  Typography,
  Button,
  Avatar,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Box,
  Chip,
  InputAdornment,
  Paper,
  Stack,
} from "@mui/material";
import { CalendarMonth, LocationOn, Search, Star, WorkOutline } from "@mui/icons-material";
import { API_URL } from "../../config";

const DoctorSearch = () => {
  const [doctors, setDoctors] = useState([]);
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedSpecialization, setSelectedSpecialization] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const response = await fetch(`${API_URL}/api/doctorform/doctors`);
        if (response.ok) {
          const data = await response.json();
const mapped = (Array.isArray(data) ? data : data.doctors || []).map((doc) => {
            const rawName = doc.name || doc.username || "Unknown Doctor";
            // If the stored name is just the generic word "doctor", use the full user name instead
            const fullName =
              /^doctor$/i.test(rawName.trim()) && doc.fullName
                ? doc.fullName
                : rawName;
            return {
              id: doc._id,
              name: fullName,
              city: doc.city || "Unknown",
              specialization: doc.specialization || "General Physician",
              rating: 4.5,
              yearsOfExperience: doc.yearsOfExperience,
              clinicAddress: doc.clinicAddress,
              phone: doc.phone,
              qualifications: doc.qualifications,
              bio: doc.bio,
            };
          });
          setDoctors(mapped);
        }
      } catch (error) {
        console.error("Failed to fetch doctors:", error);
      }
    };

    fetchDoctors();
  }, []);

  const filteredDoctors = doctors.filter((doctor) => {
    return (
      (selectedCity === "" || doctor.city.trim().toLowerCase() === selectedCity.trim().toLowerCase()) &&
      (selectedSpecialization === "" ||
        doctor.specialization.trim().toLowerCase() === selectedSpecialization.trim().toLowerCase()) &&
      doctor.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 2, md: 4 } }}>
      <Paper elevation={0} sx={{ p: { xs: 2.5, md: 4 }, mb: 3, borderRadius: 4, color: "white", background: "linear-gradient(125deg, #0f4c81, #1976d2 65%, #38bdf8)" }}>
        <Typography variant="h4" fontWeight={800}>Find the right doctor</Typography>
        <Typography sx={{ opacity: 0.9, mt: 0.75 }}>Search verified specialists and book a time that works for you.</Typography>
      </Paper>
      <Grid container spacing={3}>
      <Grid item xs={12} md={3}>
      <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, border: "1px solid #dbeafe", position: { md: "sticky" }, top: 80 }}>
        <Typography variant="h6" fontWeight={800} color="primary.main">Filters</Typography>

        <TextField
          fullWidth
          label="Search doctor or specialty"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          margin="normal"
          InputProps={{ startAdornment: <InputAdornment position="start"><Search color="primary" /></InputAdornment> }}
        />

        <FormControl fullWidth margin="normal">
          <InputLabel id="city-label">City</InputLabel>
          <Select
            labelId="city-label"
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
          >
            <MenuItem value="">All</MenuItem>
            {[...new Set(doctors.map((doctor) => doctor.city).filter(Boolean))].sort().map((city) => (
              <MenuItem key={city} value={city}>{city}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl fullWidth margin="normal">
          <InputLabel id="specialization-label">Specialization</InputLabel>
          <Select
            labelId="specialization-label"
            value={selectedSpecialization}
            onChange={(e) => setSelectedSpecialization(e.target.value)}
          >
            <MenuItem value="">All</MenuItem>
            {[...new Set(doctors.map((doctor) => doctor.specialization).filter(Boolean))].sort().map((specialization) => (
              <MenuItem key={specialization} value={specialization}>{specialization}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Paper>
      </Grid>

      <Grid item xs={12} md={9}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography fontWeight={700}>{filteredDoctors.length} doctor{filteredDoctors.length === 1 ? "" : "s"} available</Typography>
        {(searchQuery || selectedCity || selectedSpecialization) && <Button size="small" onClick={() => { setSearchQuery(""); setSelectedCity(""); setSelectedSpecialization(""); }}>Clear filters</Button>}
      </Stack>
      <Grid container spacing={2.25}>
        {filteredDoctors.map((doctor) => (
          <Grid item xs={12} sm={6} key={doctor.id}>
            <Card sx={{ height: "100%", borderRadius: 3, border: "1px solid #e2e8f0", boxShadow: "0 5px 18px rgba(15,23,42,.06)", transition: "transform .2s, box-shadow .2s", "&:hover": { transform: "translateY(-4px)", boxShadow: "0 12px 26px rgba(15,76,129,.14)" } }}>
              <CardContent sx={{ p: 2.5 }}>
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <Avatar sx={{ width: 56, height: 56, bgcolor: "primary.light", fontWeight: 800 }}>{doctor.name.slice(0, 1)}</Avatar>
                  <Box sx={{ minWidth: 0 }}><Typography variant="h6" fontWeight={800} noWrap>{doctor.name}</Typography><Chip size="small" label={doctor.specialization} color="primary" variant="outlined" sx={{ mt: 0.5, maxWidth: "100%" }} /></Box>
                </Stack>
                <Stack spacing={0.9} sx={{ mt: 2, color: "text.secondary" }}>
                  <Stack direction="row" spacing={0.75} alignItems="center"><LocationOn fontSize="small" color="primary" /><Typography variant="body2">{doctor.city}</Typography></Stack>
                  <Stack direction="row" spacing={0.75} alignItems="center"><WorkOutline fontSize="small" color="primary" /><Typography variant="body2">{doctor.yearsOfExperience ? `${doctor.yearsOfExperience} years experience` : "Experience available on profile"}</Typography></Stack>
                  <Stack direction="row" spacing={0.5} alignItems="center"><Star fontSize="small" sx={{ color: "#f59e0b" }} /><Typography variant="body2" fontWeight={700}>{doctor.rating} <Typography component="span" variant="caption" color="text.secondary">patient rating</Typography></Typography></Stack>
                </Stack>
                <Stack direction="row" spacing={1} sx={{ mt: 2.25 }}><Button fullWidth variant="outlined" onClick={() => setSelectedDoctor(doctor)}>View profile</Button><Button fullWidth variant="contained" startIcon={<CalendarMonth />} onClick={() => navigate(`/patientappoinment?doctor=${doctor.id}`)}>Book</Button></Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
        {!filteredDoctors.length && <Grid item xs={12}><Paper variant="outlined" sx={{ p: 6, textAlign: "center", borderRadius: 3 }}><Typography variant="h6">No doctors match these filters</Typography><Typography color="text.secondary" sx={{ mt: 1 }}>Try another city, specialty, or search term.</Typography></Paper></Grid>}
      </Grid>
      </Grid>
      </Grid>

      {/* Doctor Details Dialog */}
      <Dialog
        open={Boolean(selectedDoctor)}
        onClose={() => setSelectedDoctor(null)}
        maxWidth="md"
        fullWidth
      >
        {selectedDoctor && (
          <>
            <DialogTitle>{selectedDoctor.name}</DialogTitle>
            <DialogContent>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={4}>
                  <Avatar sx={{ width: 120, height: 120, margin: "auto" }} />
                </Grid>
                <Grid item xs={8}>
                  <Typography variant="h6">
                    {selectedDoctor.specialization}
                  </Typography>
                  <Typography>
                    <strong>City:</strong> {selectedDoctor.city}
                  </Typography>
                  <Typography>
                    <strong>Rating:</strong> {selectedDoctor.rating} ⭐
                  </Typography>
<Typography>
                    <strong>Experience:</strong> {selectedDoctor.yearsOfExperience || "N/A"} years
                  </Typography>
                  <Typography>
                    <strong>Clinic Address:</strong> {selectedDoctor.clinicAddress || "N/A"}
                  </Typography>
                  <Typography>
                    <strong>Qualifications:</strong> {selectedDoctor.qualifications || "N/A"}
                  </Typography>
                  <Typography>
                    <strong>Contact:</strong> {selectedDoctor.phone || "N/A"}
                  </Typography>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setSelectedDoctor(null)}>Close</Button>
              <Button variant="contained" color="primary" onClick={() => navigate(`/patientappoinment?doctor=${selectedDoctor.id}`)}>
                Book Appointment
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Container>
  );
};

export default DoctorSearch;
