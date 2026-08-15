import { useState, useEffect } from "react";
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
} from "@mui/material";
import { Star } from "@mui/icons-material";
import { API_URL } from "../../config";

const DoctorSearch = () => {
  const [doctors, setDoctors] = useState([]);
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedSpecialization, setSelectedSpecialization] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDoctor, setSelectedDoctor] = useState(null);

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
      (selectedCity === "" || doctor.city === selectedCity) &&
      (selectedSpecialization === "" ||
        doctor.specialization === selectedSpecialization) &&
      doctor.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <Container maxWidth="lg" sx={{ display: "flex", mt: 4 }}>
      {/* Filter Sidebar */}
      <div style={{ width: "250px", marginRight: "20px" }}>
        <Typography variant="h6" gutterBottom>
          Filter Doctors
        </Typography>

        <TextField
          fullWidth
          label="Search by Name"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          margin="normal"
        />

        <FormControl fullWidth margin="normal">
          <InputLabel id="city-label">City</InputLabel>
          <Select
            labelId="city-label"
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="Delhi">Delhi</MenuItem>
            <MenuItem value="Mumbai">Mumbai</MenuItem>
            <MenuItem value="Bangalore">Bangalore</MenuItem>
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
            <MenuItem value="Cardiologist">Cardiologist</MenuItem>
            <MenuItem value="Dermatologist">Dermatologist</MenuItem>
            <MenuItem value="Neurologist">Neurologist</MenuItem>
            <MenuItem value="Pediatrician">Pediatrician</MenuItem>
          </Select>
        </FormControl>
      </div>

      {/* Doctor List */}
      <Grid container spacing={2}>
        {filteredDoctors.map((doctor) => (
          <Grid item xs={12} key={doctor.name}>
            <Card sx={{ display: "flex", alignItems: "center", padding: 2 }}>
              <Avatar sx={{ width: 60, height: 60, marginRight: 2 }} />
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="h6">{doctor.name}</Typography>
                <Typography color="textSecondary">
                  {doctor.specialization}
                </Typography>
                <Typography color="textSecondary">{doctor.city}</Typography>
                <Typography color="gold">
                  <Star sx={{ fontSize: 16 }} /> {doctor.rating}
                </Typography>
              </CardContent>
              <Button
                variant="contained"
                onClick={() => setSelectedDoctor(doctor)}
              >
                View Details
              </Button>
            </Card>
          </Grid>
        ))}
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
              <Button variant="contained" color="primary">
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
