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

const Registerprofile = () => {
  const [profile, setProfile] = useState(initialDoctorProfile);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleRegister = () => {
    setProfile({ ...profile, verified: true });
    alert("Registration successful. Verification pending.");
    navigate("/profile");
  };

  return (
    <div className="container mx-auto p-4 text-center">
      <h2>Doctor Registration</h2>
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
      <Button variant="contained" color="primary" onClick={handleRegister}>
        Register
      </Button>
    </div>
  );
};

export default Registerprofile;
