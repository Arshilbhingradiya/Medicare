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
} from "@mui/material";
import { Save, UploadFile } from "@mui/icons-material";
import { useAuth } from "../../store/auth"; // Authentication Hook
import { styled } from "@mui/material/styles";

const ProfileContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  maxWidth: 500,
  margin: "auto",
  marginTop: theme.spacing(4),
  boxShadow: theme.shadows[3],
  borderRadius: "12px",
}));

const AvatarInput = styled("input")({
  display: "none",
});

const PatientProfile = () => {
  const { user } = useAuth(); // Fetch logged-in user data
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

  useEffect(() => {
    // Load existing user profile if available
    const savedProfile = localStorage.getItem(`patientProfile_${user?.id}`);
    if (savedProfile) {
      setProfile(JSON.parse(savedProfile));
    }
  }, [user]);

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    localStorage.setItem(`patientProfile_${user?.id}`, JSON.stringify(profile));
    alert("Profile Saved Successfully!");
  };

  const handleAvatarChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setProfile((prev) => ({ ...prev, avatar: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <Container>
      <ProfileContainer>
        <Typography variant="h5" gutterBottom>
          Patient Profile
        </Typography>

        {/* Profile Picture */}
        <div style={{ textAlign: "center", marginBottom: 16 }}>
          <Avatar
            src={profile.avatar || "/default-avatar.png"}
            sx={{ width: 100, height: 100, margin: "auto" }}
          />
          <label htmlFor="avatar-upload">
            <AvatarInput
              accept="image/*"
              id="avatar-upload"
              type="file"
              onChange={handleAvatarChange}
            />
            <IconButton component="span">
              <UploadFile />
            </IconButton>
          </label>
        </div>

        {/* Personal Details Form */}
        <TextField
          fullWidth
          label="Full Name"
          name="name"
          value={profile.name}
          onChange={handleChange}
          margin="normal"
          required
        />
        <TextField
          fullWidth
          label="Age"
          name="age"
          value={profile.age}
          onChange={handleChange}
          margin="normal"
          type="number"
        />
        <TextField
          fullWidth
          select
          label="Gender"
          name="gender"
          value={profile.gender}
          onChange={handleChange}
          margin="normal"
        >
          <MenuItem value="Male">Male</MenuItem>
          <MenuItem value="Female">Female</MenuItem>
          <MenuItem value="Other">Other</MenuItem>
        </TextField>
        <TextField
          fullWidth
          label="Email"
          name="email"
          value={profile.email}
          onChange={handleChange}
          margin="normal"
          type="email"
          required
        />
        <TextField
          fullWidth
          label="Phone Number"
          name="phone"
          value={profile.phone}
          onChange={handleChange}
          margin="normal"
          type="tel"
        />
        <TextField
          fullWidth
          label="Address"
          name="address"
          value={profile.address}
          onChange={handleChange}
          margin="normal"
          multiline
          rows={2}
        />
        <TextField
          fullWidth
          label="Medical History"
          name="medicalHistory"
          value={profile.medicalHistory}
          onChange={handleChange}
          margin="normal"
          multiline
          rows={3}
        />

        {/* Save Button */}
        <Button
          variant="contained"
          color="primary"
          fullWidth
          startIcon={<Save />}
          onClick={handleSave}
          sx={{ mt: 2 }}
        >
          Save Profile
        </Button>
      </ProfileContainer>
    </Container>
  );
};

export default PatientProfile;
