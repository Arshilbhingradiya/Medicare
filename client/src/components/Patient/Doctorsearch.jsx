import { useState } from "react";
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

const doctors = [
  {
    id: 1,
    name: "Dr. Emily Smith",
    city: "Delhi",
    specialization: "Cardiologist",
    rating: 4.8,
  },
  {
    id: 2,
    name: "Dr. John Doe",
    city: "Mumbai",
    specialization: "Dermatologist",
    rating: 4.6,
  },
  {
    id: 3,
    name: "Dr. Sarah Lee",
    city: "Delhi",
    specialization: "Neurologist",
    rating: 4.9,
  },
  {
    id: 4,
    name: "Dr. Michael Brown",
    city: "Bangalore",
    specialization: "Pediatrician",
    rating: 4.5,
  },
];

const DoctorSearch = () => {
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedSpecialization, setSelectedSpecialization] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDoctor, setSelectedDoctor] = useState(null);

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
          <Grid item xs={12} key={doctor.id}>
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
                    <strong>Experience:</strong> 10+ years
                  </Typography>
                  <Typography>
                    <strong>Clinic Address:</strong> XYZ Street,{" "}
                    {selectedDoctor.city}
                  </Typography>
                  <Typography>
                    <strong>Contact:</strong> +91 98765 43210
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
