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
} from "@mui/material";
import { PhotoCamera } from "@mui/icons-material";
import { useAuth } from "../../store/auth";

export default function DoctorProfile() {
  const [doctor, setDoctor] = useState({
    name: "",
    email: "",
    license: "",
    specialization: "",
    phone: "",
    clinicAddress: "",
    city: "",
    yearsOfExperience: "",
    qualifications: "",
    availability: "",
    bio: "",
    profileImage: "",
  });

  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [imagePreview, setImagePreview] = useState("");
  const { user } = useAuth();

  useEffect(() => {
    // ✅ Load saved profile from localStorage
    const storedDoctor = JSON.parse(localStorage.getItem("doctorProfile"));

    if (storedDoctor) {
      setDoctor(storedDoctor);
      setImagePreview(storedDoctor.profileImage || "");
    } else if (user) {
      // Populate with user data initially
      setDoctor((prev) => ({
        ...prev,
        name: user.name || "",
        email: user.email || "",
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
        setImagePreview(reader.result);
        setDoctor((prev) => ({ ...prev, profileImage: reader.result }));
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

    // ✅ Check if data is identical before saving
    if (storedDoctor && isEqual(doctor, storedDoctor)) {
      console.log("No changes detected. Skipping save.");
      alert("No changes made.");
      return; // Skip saving if no changes
    }

    try {
      // ✅ Save only unique data to localStorage
      localStorage.setItem("doctorProfile", JSON.stringify(doctor));
      console.log("Profile saved:", doctor);
      setOpenSnackbar(true);

      // Simulate API call
      const response = await fetch(
        "http://localhost:3000/api/doctorform/doctorprofile",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(doctor),
        }
      );

      if (response.ok) {
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
    <Container
      maxWidth="lg"
      className="min-h-screen flex justify-center items-center bg-gray-50 py-10"
    >
      <Card className="w-full shadow-2xl p-8 rounded-2xl bg-white">
        <CardContent>
          <Typography
            variant="h4"
            className="mb-8 text-center font-semibold text-gray-700"
          >
            Doctor Profile Setup
          </Typography>

          {/* Image Upload */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <Avatar
                src={imagePreview || "https://via.placeholder.com/150"}
                alt="Doctor Profile"
                sx={{ width: 120, height: 120 }}
                className="shadow-md"
              />
              <IconButton
                color="primary"
                aria-label="upload picture"
                component="label"
                className="absolute bottom-0 right-0 bg-white shadow rounded-full"
              >
                <input
                  hidden
                  accept="image/*"
                  type="file"
                  onChange={handleImageChange}
                />
                <PhotoCamera />
              </IconButton>
            </div>
          </div>

          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                required
                label="Full Name"
                name="name"
                variant="outlined"
                value={doctor.name}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                required
                label="Email Address"
                name="email"
                variant="outlined"
                value={doctor.email}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="License Number (Optional)"
                name="license"
                variant="outlined"
                value={doctor.license}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                required
                select
                label="Specialization"
                name="specialization"
                variant="outlined"
                value={doctor.specialization}
                onChange={handleChange}
              >
                <MenuItem value="General Physician">General Physician</MenuItem>
                <MenuItem value="Cardiologist">Cardiologist</MenuItem>
                <MenuItem value="Dermatologist">Dermatologist</MenuItem>
                <MenuItem value="Neurologist">Neurologist</MenuItem>
                <MenuItem value="Orthopedic">Orthopedic</MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Phone Number"
                name="phone"
                variant="outlined"
                value={doctor.phone}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                required
                label="City"
                name="city"
                variant="outlined"
                value={doctor.city}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Clinic Address"
                name="clinicAddress"
                variant="outlined"
                value={doctor.clinicAddress}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Years of Experience"
                name="yearsOfExperience"
                variant="outlined"
                value={doctor.yearsOfExperience}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Qualifications (Optional)"
                name="qualifications"
                variant="outlined"
                value={doctor.qualifications}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Availability (Optional)"
                name="availability"
                variant="outlined"
                value={doctor.availability}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Short Bio (Optional)"
                name="bio"
                variant="outlined"
                value={doctor.bio}
                onChange={handleChange}
              />
            </Grid>
          </Grid>

          <Button
            fullWidth
            variant="contained"
            color="primary"
            size="large"
            onClick={handleSubmit}
            className="mt-6"
          >
            Save Profile
          </Button>

          <Snackbar
            open={openSnackbar}
            autoHideDuration={3000}
            onClose={handleCloseSnackbar}
          >
            <Alert
              onClose={handleCloseSnackbar}
              severity="success"
              sx={{ width: "100%" }}
            >
              Profile saved successfully!
            </Alert>
          </Snackbar>
        </CardContent>
      </Card>
    </Container>
  );
}
