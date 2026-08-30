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
  Fade,
  Grow,
  Skeleton,
  InputAdornment,
} from "@mui/material";
import { 
  Save, 
  UploadFile, 
  Person, 
  Email, 
  Phone, 
  LocationOn, 
  Cake, 
  Wc, 
  MedicalInformation,
  CloudDone
} from "@mui/icons-material";
import MuiAlert from "@mui/material/Alert";
import { useAuth } from "../../store/auth";
import { styled } from "@mui/material/styles";
import { API_URL } from "../../config";

// --- Styled Components ---
const ProfileContainer = styled(Paper)(({ theme }) => ({
  width: "100%",
  margin: "0 auto",
  boxShadow: "0 10px 40px rgba(13, 71, 161, 0.08)",
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
  
  // State for profile data
  const [profile, setProfile] = useState({
    name: "",
    age: "",
    gender: "",
    email: "",
    phone: "",
    address: "",
    medicalHistory: "",
    avatar: "",
  });

  // UI States
  const [fetching, setFetching] = useState(true); // Initial load from DB
  const [saving, setSaving] = useState(false);    // Saving to DB
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // --- FETCH PROFILE FROM DATABASE ---
  useEffect(() => {
    const fetchProfile = async () => {
      setFetching(true);
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setFetching(false);
          return;
        }

        // Make sure this endpoint matches your backend route for GETting a profile
        const response = await fetch(`${API_URL}/api/patientform/patientprofile`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          // Merge database data, falling back to auth user data, then empty strings
          setProfile({
            name: data.name || user?.name || user?.username || "",
            age: data.age || "",
            gender: data.gender || "",
            email: data.email || user?.email || "",
            phone: data.phone || user?.phone || "",
            address: data.address || "",
            medicalHistory: data.medicalHistory || "",
            avatar: data.avatar || "",
          });
        } else {
          // If profile doesn't exist yet, populate with basic user details
          setProfile((prev) => ({
            ...prev,
            name: user?.name || user?.username || "",
            email: user?.email || "",
            phone: user?.phone || "",
          }));
        }
      } catch (error) {
        console.error("Failed to fetch profile from database", error);
      } finally {
        setFetching(false);
      }
    };

    fetchProfile();
  }, [user]);

  // --- SAVE PROFILE TO DATABASE ---
  const handleSave = async () => {
    if (!profile.name || !profile.email || !profile.phone) {
      setSnackbar({
        open: true,
        message: "Please fill all required fields!",
        severity: "error",
      });
      return;
    }

    setSaving(true);
    const token = localStorage.getItem("token");

    try {
      const response = await fetch(`${API_URL}/api/patientform/patientprofile`, {
        method: "POST", // Change to PUT if your backend uses PUT for updates
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` // Secure API call
        },
        body: JSON.stringify(profile),
      });

      const data = await response.json();

      if (response.ok) {
        window.dispatchEvent(new Event("profile-updated"));
        setSnackbar({
          open: true,
          message: "Profile Saved Successfully!",
          severity: "success",
        });
      } else {
        throw new Error(data.message || "Failed to save profile");
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.message || "Failed to connect to the server!",
        severity: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleAvatarChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const imageData = reader.result;
        setProfile((prev) => ({ ...prev, avatar: imageData }));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 3, md: 5 }, px: { xs: 1.5, md: 3 } }}>
      <Grow in={true} timeout={600}>
        <ProfileContainer elevation={0}>
          
          {/* Animated Hero Header */}
          <Box
            sx={{
              background: "linear-gradient(135deg, #0d47a1 0%, #1e88e5 100%)",
              color: "white",
              p: { xs: 3, md: 5 },
              position: "relative",
            }}
          >
            <Box
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: "radial-gradient(circle at 90% 10%, rgba(255,255,255,0.15) 0%, transparent 50%)",
                pointerEvents: "none",
              }}
            />
            
            <Stack direction={{ xs: "column", md: "row" }} spacing={4} alignItems={{ xs: "center", md: "flex-start" }} position="relative">
              {/* Avatar Upload */}
              <Box sx={{ position: "relative" }}>
                {fetching ? (
                  <Skeleton variant="circular" width={130} height={130} sx={{ border: "4px solid rgba(255,255,255,0.3)" }} />
                ) : (
                  <Fade in>
                    <Avatar
                      src={profile.avatar || "/default-avatar.png"}
                      sx={{ 
                        width: 130, 
                        height: 130, 
                        border: "4px solid white", 
                        boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
                        bgcolor: "grey.300" 
                      }}
                    />
                  </Fade>
                )}
                <label htmlFor="avatar-upload">
                  <AvatarInput accept="image/*" id="avatar-upload" type="file" onChange={handleAvatarChange} disabled={fetching} />
                  <IconButton
                    component="span"
                    disabled={fetching}
                    sx={{
                      position: "absolute",
                      bottom: 4,
                      right: 0,
                      bgcolor: "white",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                      border: "1px solid #e0e0e0",
                      width: 44,
                      height: 44,
                      '&:hover': { bgcolor: "#f5f5f5" },
                      transition: "transform 0.2s",
                      '&:active': { transform: "scale(0.95)" }
                    }}
                  >
                    <UploadFile color="primary" />
                  </IconButton>
                </label>
              </Box>

              <Box sx={{ flex: 1, textAlign: { xs: "center", md: "left" } }}>
                <Typography variant="overline" sx={{ color: "#FFeb3b", fontWeight: 800, letterSpacing: 1.5 }}>
                  Account Settings
                </Typography>
                <Typography variant="h3" sx={{ fontWeight: 800, mb: 1, letterSpacing: "-0.5px" }}>
                  Patient Profile
                </Typography>
                <Typography variant="body1" sx={{ opacity: 0.9, mb: 2.5, maxWidth: 600, fontSize: "1.05rem" }}>
                  Keep your personal and medical details up to date to ensure seamless care.
                </Typography>
                <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} justifyContent={{ xs: "center", md: "flex-start" }}>
                  <Chip 
                    icon={<CloudDone sx={{ color: "#FFEB3B !important" }}/>} 
                    label="Synced securely" 
                    sx={{ bgcolor: "rgba(255,255,255,0.2)", color: "white", fontWeight: 600 }} 
                  />
                </Stack>
              </Box>
            </Stack>
          </Box>

          {/* Form Content */}
          <Box sx={{ p: { xs: 2.5, md: 5 }, bgcolor: "#fafafa" }}>
            
            {/* Personal Information Section */}
            <Fade in timeout={800}>
              <Box sx={{ mb: 4, p: { xs: 3, md: 4 }, borderRadius: 4, border: "1px solid #e0e0e0", bgcolor: "#ffffff", boxShadow: "0 4px 20px rgba(0,0,0,0.02)" }}>
                <Box display="flex" alignItems="center" gap={1.5} mb={3}>
                  <Person color="primary" sx={{ fontSize: 28 }} />
                  <Typography variant="h5" sx={{ fontWeight: 800, color: "primary.dark" }}>
                    Personal Information
                  </Typography>
                </Box>
                
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    {fetching ? <Skeleton variant="rounded" height={56} /> : (
                      <TextField
                        fullWidth
                        label="Full Name"
                        name="name"
                        value={profile.name}
                        onChange={handleChange}
                        required
                        InputProps={{
                          startAdornment: <InputAdornment position="start"><Person color="action" /></InputAdornment>,
                        }}
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                      />
                    )}
                  </Grid>

                  <Grid item xs={12} md={6}>
                    {fetching ? <Skeleton variant="rounded" height={56} /> : (
                      <TextField
                        fullWidth
                        label="Email Address"
                        name="email"
                        value={profile.email}
                        onChange={handleChange}
                        type="email"
                        required
                        InputProps={{
                          startAdornment: <InputAdornment position="start"><Email color="action" /></InputAdornment>,
                        }}
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                      />
                    )}
                  </Grid>

                  <Grid item xs={12} md={6}>
                    {fetching ? <Skeleton variant="rounded" height={56} /> : (
                      <TextField
                        fullWidth
                        label="Phone Number"
                        name="phone"
                        value={profile.phone}
                        onChange={handleChange}
                        type="tel"
                        required
                        InputProps={{
                          startAdornment: <InputAdornment position="start"><Phone color="action" /></InputAdornment>,
                        }}
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                      />
                    )}
                  </Grid>

                  <Grid item xs={12} md={3}>
                    {fetching ? <Skeleton variant="rounded" height={56} /> : (
                      <TextField
                        fullWidth
                        label="Age"
                        name="age"
                        value={profile.age}
                        onChange={handleChange}
                        type="number"
                        InputProps={{
                          startAdornment: <InputAdornment position="start"><Cake color="action" /></InputAdornment>,
                        }}
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                      />
                    )}
                  </Grid>

                  <Grid item xs={12} md={3}>
                    {fetching ? <Skeleton variant="rounded" height={56} /> : (
                      <TextField
                        fullWidth
                        select
                        label="Gender"
                        name="gender"
                        value={profile.gender}
                        onChange={handleChange}
                        InputProps={{
                          startAdornment: <InputAdornment position="start"><Wc color="action" /></InputAdornment>,
                        }}
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                      >
                        <MenuItem value="Male">Male</MenuItem>
                        <MenuItem value="Female">Female</MenuItem>
                        <MenuItem value="Other">Other</MenuItem>
                      </TextField>
                    )}
                  </Grid>

                  <Grid item xs={12}>
                    {fetching ? <Skeleton variant="rounded" height={80} /> : (
                      <TextField
                        fullWidth
                        label="Residential Address"
                        name="address"
                        value={profile.address}
                        onChange={handleChange}
                        multiline
                        rows={2}
                        InputProps={{
                          startAdornment: <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 1.5 }}><LocationOn color="action" /></InputAdornment>,
                        }}
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                      />
                    )}
                  </Grid>
                </Grid>
              </Box>
            </Fade>

            {/* Medical Details Section */}
            <Fade in timeout={1200}>
              <Box sx={{ mb: 4, p: { xs: 3, md: 4 }, borderRadius: 4, border: "1px solid #e0e0e0", bgcolor: "#ffffff", boxShadow: "0 4px 20px rgba(0,0,0,0.02)" }}>
                <Box display="flex" alignItems="center" gap={1.5} mb={3}>
                  <MedicalInformation color="primary" sx={{ fontSize: 28 }} />
                  <Typography variant="h5" sx={{ fontWeight: 800, color: "primary.dark" }}>
                    Medical Details
                  </Typography>
                </Box>
                
                {fetching ? <Skeleton variant="rounded" height={150} /> : (
                  <TextField
                    fullWidth
                    label="Medical History & Allergies"
                    name="medicalHistory"
                    value={profile.medicalHistory}
                    onChange={handleChange}
                    multiline
                    rows={5}
                    placeholder="Please list any ongoing medical conditions, past surgeries, or allergies..."
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  />
                )}
              </Box>
            </Fade>

            {/* Save Button */}
            <Fade in timeout={1500}>
              <Button
                variant="contained"
                size="large"
                fullWidth
                startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <Save />}
                onClick={handleSave}
                disabled={saving || fetching}
                sx={{
                  py: 1.8,
                  borderRadius: 3,
                  fontWeight: 800,
                  fontSize: "1.1rem",
                  textTransform: "none",
                  background: "linear-gradient(135deg, #1e88e5 0%, #0d47a1 100%)",
                  boxShadow: "0 8px 24px rgba(25, 118, 210, 0.3)",
                  '&:hover': {
                    background: "linear-gradient(135deg, #1565c0 0%, #0a2756 100%)",
                    transform: "translateY(-2px)",
                    boxShadow: "0 12px 28px rgba(25, 118, 210, 0.4)",
                  },
                  transition: "all 0.2s"
                }}
              >
                {saving ? "Saving securely to database..." : "Save Profile"}
              </Button>
            </Fade>
          </Box>
        </ProfileContainer>
      </Grow>

      {/* Snackbar for Notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <MuiAlert 
          elevation={6} 
          variant="filled" 
          severity={snackbar.severity}
          sx={{ borderRadius: 2, fontWeight: 600 }}
        >
          {snackbar.message}
        </MuiAlert>
      </Snackbar>
    </Container>
  );
};

export default PatientProfile;