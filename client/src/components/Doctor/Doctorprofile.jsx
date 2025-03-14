import React, { useState } from "react";
import { Card, CardContent, Button, Avatar, TextField } from "@mui/material";
import "bootstrap/dist/css/bootstrap.min.css";
import { useNavigate } from "react-router-dom";

const initialDoctorProfile = {
  name: "",
  specialization: "",
  experience: "",
  email: "",
  phone: "",
  clinic: "",
  verified: true,
};

const DoctorProfile = () => {
  const [profile, setProfile] = useState(initialDoctorProfile);
  const [editMode, setEditMode] = useState(false);

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  return (
    <div className="container mx-auto p-4 text-center">
      <Avatar
        alt={profile.name}
        src="/doctor-avatar.png"
        sx={{ width: 100, height: 100, margin: "auto" }}
      />
      {profile.verified ? (
        editMode ? (
          <>
            <TextField
              label="Name"
              name="name"
              value={profile.name}
              onChange={handleChange}
              fullWidth
              margin="normal"
            />
            <TextField
              label="Specialization"
              name="specialization"
              value={profile.specialization}
              onChange={handleChange}
              fullWidth
              margin="normal"
            />
            <TextField
              label="Experience"
              name="experience"
              value={profile.experience}
              onChange={handleChange}
              fullWidth
              margin="normal"
            />
            <TextField
              label="Email"
              name="email"
              value={profile.email}
              onChange={handleChange}
              fullWidth
              margin="normal"
            />
            <TextField
              label="Phone"
              name="phone"
              value={profile.phone}
              onChange={handleChange}
              fullWidth
              margin="normal"
            />
            <TextField
              label="Clinic"
              name="clinic"
              value={profile.clinic}
              onChange={handleChange}
              fullWidth
              margin="normal"
            />
            <Button
              variant="contained"
              color="primary"
              onClick={() => setEditMode(false)}
            >
              Save
            </Button>
          </>
        ) : (
          <>
            <h2>{profile.name}</h2>
            <p>
              {profile.specialization} - {profile.experience}
            </p>
            <p>Email: {profile.email}</p>
            <p>Phone: {profile.phone}</p>
            <p>Clinic: {profile.clinic}</p>
            <Button
              variant="outlined"
              color="secondary"
              onClick={() => setEditMode(true)}
            >
              Edit Profile
            </Button>
          </>
        )
      ) : (
        <p>Your account is not verified. Please contact admin.</p>
      )}
    </div>
  );
};

export default DoctorProfile;
