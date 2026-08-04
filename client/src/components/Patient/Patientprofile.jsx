import { useState, useEffect } from "react";
import {
  Container,
  TextField,
  Button,
  Typography,
  Paper,
  MenuItem,
  Avatar,
  IconButton,
  Snackbar,
  CircularProgress,
  Box,
  Grid,
  Divider,
  Stack,
  Chip,
} from "@mui/material";
import { Save, UploadFile } from "@mui/icons-material";
import MuiAlert from "@mui/material/Alert";
import { useAuth } from "../../store/auth";
import { styled } from "@mui/material/styles";

const ProfileContainer = styled(Paper)(({ theme }) => ({
  width: "100%",
  margin: "0 auto",
  boxShadow: "0 22px 50px rgba(13, 71, 161, 0.16)",
  borderRadius: "24px",
  overflow: "hidden",
  backgroundColor: theme.palette.mode === "dark" ? "#1e1e1e" : "#fff",
  color: theme.palette.text.primary,
}));

const AvatarInput = styled("input")({
  display: "none",
});

const PatientProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState({
    name: user?.name || user?.username || "",
    age: "",
    gender: "",
    email: user?.email || "",
    phone: user?.phone || "",
    address: "",
    medicalHistory: "",
    avatar: "",
  });

  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  useEffect(() => {
    const savedProfile = localStorage.getItem(`patientProfile_${user?.id}`);
    let parsedProfile = {};

    if (savedProfile) {
      try {
        parsedProfile = JSON.parse(savedProfile);
      } catch (error) {
        console.warn("Failed to parse saved patient profile", error);
      }
    }

    setProfile({
      name: parsedProfile.name || user?.name || user?.username || "",
      age: parsedProfile.age || "",
      gender: parsedProfile.gender || "",
      email: parsedProfile.email || user?.email || "",
      phone: parsedProfile.phone || user?.phone || "",
      address: parsedProfile.address || "",
      medicalHistory: parsedProfile.medicalHistory || "",
      avatar: parsedProfile.avatar || "",
    });
  }, [user?.id, user?.name, user?.username, user?.email, user?.phone]);

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    if (!profile.name || !profile.email || !profile.phone) {
      setSnackbar({
        open: true,
        message: "Please fill all required fields!",
        severity: "error",
      });
      return;
    }

    setLoading(true);
    localStorage.setItem(`patientProfile_${user?.id}`, JSON.stringify(profile));

    try {
      const response = await fetch(
        "http://localhost:3000/api/patientform/patientprofile",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(profile),
        }
      );

      await response.json();
      window.dispatchEvent(new Event("profile-updated"));
      setSnackbar({
        open: true,
        message: "Profile Saved Successfully!",
        severity: "success",
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: "Failed to save profile!",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const imageData = reader.result;
        setProfile((prev) => ({ ...prev, avatar: imageData }));
        window.dispatchEvent(new Event("profile-updated"));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <Container maxWidth={false} sx={{ py: { xs: 2, md: 4 }, px: { xs: 1.5, md: 3 } }}>
      <ProfileContainer>
        <Box
          sx={{
            background: "linear-gradient(135deg, #0d47a1 0%, #1976d2 100%)",
            color: "white",
            p: { xs: 3, md: 4 },
          }}
        >
          <Stack direction={{ xs: "column", md: "row" }} spacing={3} justifyContent="space-between" alignItems={{ xs: "center", md: "flex-start" }}>
            <Box sx={{ position: "relative" }}>
              <Avatar
                src={profile.avatar || "/default-avatar.png"}
                sx={{ width: 118, height: 118, border: "4px solid white", boxShadow: 3 }}
              />
              <label htmlFor="avatar-upload">
                <AvatarInput accept="image/*" id="avatar-upload" type="file" onChange={handleAvatarChange} />
                <IconButton
                  component="span"
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
                  <UploadFile color="primary" />
                </IconButton>
              </label>
            </Box>

            <Box sx={{ flex: 1 }}>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                Patient Profile
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.95, mb: 2 }}>
                Keep your personal and medical details organized in a clear, polished layout.
              </Typography>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2} flexWrap="wrap">
                <Chip label="Saved locally" color="secondary" sx={{ bgcolor: "rgba(255,255,255,0.18)", color: "white" }} />
                <Chip label="Registration details synced" sx={{ bgcolor: "rgba(255,255,255,0.16)", color: "white" }} />
              </Stack>
            </Box>
          </Stack>
        </Box>

        <Box sx={{ p: { xs: 3, md: 4 }, background: "linear-gradient(180deg, #ffffff 0%, #f8fbff 100%)" }}>
          <Divider sx={{ mb: 3 }} />

          <Box sx={{ mb: 3, p: { xs: 2, md: 2.5 }, borderRadius: 3, border: "1px solid #e3f2fd", bgcolor: "#f8fbff" }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "#0d47a1", mb: 2 }}>
              Personal Information
            </Typography>
            <Grid container spacing={2.5}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Full Name"
                  name="name"
                  value={profile.name}
                  onChange={handleChange}
                  required
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Age"
                  name="age"
                  value={profile.age}
                  onChange={handleChange}
                  type="number"
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  select
                  label="Gender"
                  name="gender"
                  value={profile.gender}
                  onChange={handleChange}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                >
                  <MenuItem value="Male">Male</MenuItem>
                  <MenuItem value="Female">Female</MenuItem>
                  <MenuItem value="Other">Other</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  value={profile.email}
                  onChange={handleChange}
                  type="email"
                  required
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Phone Number"
                  name="phone"
                  value={profile.phone}
                  onChange={handleChange}
                  type="tel"
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Address"
                  name="address"
                  value={profile.address}
                  onChange={handleChange}
                  multiline
                  rows={2}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
              </Grid>
            </Grid>
          </Box>

          <Box sx={{ p: { xs: 2, md: 2.5 }, borderRadius: 3, border: "1px solid #e3f2fd", bgcolor: "#fcfdff" }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "#0d47a1", mb: 2 }}>
              Medical Details
            </Typography>
            <TextField
              fullWidth
              label="Medical History"
              name="medicalHistory"
              value={profile.medicalHistory}
              onChange={handleChange}
              multiline
              rows={5}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />
          </Box>

          <Button
            variant="contained"
            fullWidth
            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <Save />}
            onClick={handleSave}
            sx={{
              mt: 3,
              borderRadius: 2,
              py: 1.3,
              fontWeight: 700,
              textTransform: "none",
              background: "linear-gradient(135deg, #0d47a1 0%, #1976d2 100%)",
              boxShadow: "0 8px 20px rgba(25, 118, 210, 0.25)",
              '&:hover': {
                background: "linear-gradient(135deg, #08306b 0%, #1565c0 100%)",
              },
            }}
            disabled={loading}
          >
            {loading ? "Saving..." : "Save Profile"}
          </Button>
        </Box>
      </ProfileContainer>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <MuiAlert elevation={6} variant="filled" severity={snackbar.severity}>
          {snackbar.message}
        </MuiAlert>
      </Snackbar>
    </Container>
  );
};

export default PatientProfile;
