import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Container,
  Snackbar,
  Alert,
  MenuItem,
  Grid,
  Avatar,
  IconButton,
  Box,
  Stack,
  Divider,
} from "@mui/material";
import { PhotoCamera } from "@mui/icons-material";
import { useAuth } from "../../store/auth";

export default function DoctorProfile() {
  const [doctor, setDoctor] = useState({
    name: "",
    email: "",
    phone: "",
    license: "",
    specialization: "",
    clinicAddress: "",
    city: "",
    yearsOfExperience: "",
    qualifications: "",
    availability: "",
    availabilitySchedule: "09:00-13:00,17:00-20:00",
    slotCapacity: "4",
    bio: "",
    profileImage: "",
  });

  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [imagePreview, setImagePreview] = useState("");
  const { user } = useAuth();

  useEffect(() => {
    const storedDoctor = JSON.parse(localStorage.getItem("doctorProfile"));

    if (storedDoctor) {
      setDoctor(storedDoctor);
      setImagePreview(storedDoctor.profileImage || "");
    } else if (user) {
      setDoctor((prev) => ({
        ...prev,
        name: user.name || user.username || "",
        email: user.email || "",
        phone: user.phone || "",
      }));
    }
  }, [user]);

  const handleChange = (e) => {
    setDoctor({ ...doctor, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const imageData = reader.result;
        setImagePreview(imageData);
        setDoctor((prev) => ({ ...prev, profileImage: imageData }));
        window.dispatchEvent(new Event("profile-updated"));
      };
      reader.readAsDataURL(file);
    }
  };

  const isEqual = (obj1, obj2) => {
    return JSON.stringify(obj1) === JSON.stringify(obj2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const storedDoctor = JSON.parse(localStorage.getItem("doctorProfile"));

    if (storedDoctor && isEqual(doctor, storedDoctor)) {
      console.log("No changes detected. Skipping save.");
      alert("No changes made.");
      return;
    }

    try {
      localStorage.setItem("doctorProfile", JSON.stringify(doctor));
      console.log("Profile saved:", doctor);
      setOpenSnackbar(true);

      const response = await fetch(
        "http://localhost:3000/api/doctorform/doctorprofile",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(doctor),
        }
      );

      if (response.ok) {
        window.dispatchEvent(new Event("profile-updated"));
        console.log("Profile saved to server");
      } else {
        console.error("Failed to save profile");
      }
    } catch (error) {
      console.error("Error saving profile:", error);
    }
  };

  const handleCloseSnackbar = () => setOpenSnackbar(false);

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Card
        sx={{
          borderRadius: 4,
          overflow: "hidden",
          boxShadow: "0 20px 45px rgba(13, 71, 161, 0.16)",
          border: "1px solid #e3f2fd",
        }}
      >
        <Box
          sx={{
            background: "linear-gradient(135deg, #0d47a1 0%, #1976d2 100%)",
            color: "white",
            p: { xs: 3, md: 4 },
          }}
        >
          <Stack direction={{ xs: "column", md: "row" }} spacing={3} alignItems={{ xs: "center", md: "flex-start" }}>
            <Box sx={{ position: "relative" }}>
              <Avatar
                src={imagePreview || "https://via.placeholder.com/150"}
                alt="Doctor Profile"
                sx={{ width: 120, height: 120, border: "4px solid white", boxShadow: 3 }}
              />
              <IconButton
                aria-label="upload picture"
                component="label"
                sx={{
                  position: "absolute",
                  bottom: 0,
                  right: -4,
                  bgcolor: "white",
                  boxShadow: 2,
                  border: "1px solid #ddd",
                  width: 42,
                  height: 42,
                }}
              >
                <input hidden accept="image/*" type="file" onChange={handleImageChange} />
                <PhotoCamera />
              </IconButton>
            </Box>

            <Box>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                Doctor Profile Setup
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.95 }}>
                Present your professional details in a clean, modern format for patients.
              </Typography>
            </Box>
          </Stack>
        </Box>

        <CardContent sx={{ p: { xs: 3, md: 4 } }}>
          <Divider sx={{ mb: 3 }} />

          <Box sx={{ p: { xs: 2, md: 2.5 }, borderRadius: 3, bgcolor: "#f8fbff", border: "1px solid #e3f2fd", mb: 3 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "#0d47a1", mb: 2 }}>
              Personal & Professional Details
            </Typography>
            <Grid container spacing={2.5}>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth required label="Full Name" name="name" variant="outlined" value={doctor.name} onChange={handleChange} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth required label="Email Address" name="email" variant="outlined" value={doctor.email} onChange={handleChange} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="License Number (Optional)" name="license" variant="outlined" value={doctor.license} onChange={handleChange} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth required select label="Specialization" name="specialization" variant="outlined" value={doctor.specialization} onChange={handleChange} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}>
                  <MenuItem value="General Physician">General Physician</MenuItem>
                  <MenuItem value="Cardiologist">Cardiologist</MenuItem>
                  <MenuItem value="Dermatologist">Dermatologist</MenuItem>
                  <MenuItem value="Neurologist">Neurologist</MenuItem>
                  <MenuItem value="Orthopedic">Orthopedic</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Years of Experience" name="yearsOfExperience" variant="outlined" value={doctor.yearsOfExperience} onChange={handleChange} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Qualifications (Optional)" name="qualifications" variant="outlined" value={doctor.qualifications} onChange={handleChange} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
              </Grid>
            </Grid>
          </Box>

          <Box sx={{ p: { xs: 2, md: 2.5 }, borderRadius: 3, bgcolor: "#fcfdff", border: "1px solid #e3f2fd" }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "#0d47a1", mb: 2 }}>
              Contact & Availability
            </Typography>
            <Grid container spacing={2.5}>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Phone Number" name="phone" variant="outlined" value={doctor.phone} onChange={handleChange} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth required label="City" name="city" variant="outlined" value={doctor.city} onChange={handleChange} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Availability Schedule" name="availabilitySchedule" variant="outlined" value={doctor.availabilitySchedule} onChange={handleChange} helperText="Example: 09:00-13:00,17:00-20:00" sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Patients per slot" name="slotCapacity" type="number" variant="outlined" value={doctor.slotCapacity} onChange={handleChange} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Clinic Address" name="clinicAddress" variant="outlined" value={doctor.clinicAddress} onChange={handleChange} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Availability (Optional)" name="availability" variant="outlined" value={doctor.availability} onChange={handleChange} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
              </Grid>
              <Grid item xs={12}>
                <TextField fullWidth multiline rows={4} label="Short Bio (Optional)" name="bio" variant="outlined" value={doctor.bio} onChange={handleChange} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
              </Grid>
            </Grid>
          </Box>

          <Button fullWidth variant="contained" size="large" onClick={handleSubmit} sx={{ mt: 4, borderRadius: 2, py: 1.4, fontWeight: 700, textTransform: "none", background: "linear-gradient(135deg, #0d47a1 0%, #1976d2 100%)", boxShadow: "0 8px 20px rgba(25, 118, 210, 0.25)", '&:hover': { background: "linear-gradient(135deg, #08306b 0%, #1565c0 100%)" } }}>
            Save Profile
          </Button>

          <Snackbar open={openSnackbar} autoHideDuration={3000} onClose={handleCloseSnackbar}>
            <Alert onClose={handleCloseSnackbar} severity="success" sx={{ width: "100%" }}>
              Profile saved successfully!
            </Alert>
          </Snackbar>
        </CardContent>
      </Card>
    </Container>
  );
}
