import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Container,
  Box,
  Snackbar,
  Alert,
} from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import CancelIcon from "@mui/icons-material/Cancel";

export default function DoctorVerification() {
  const [doctor, setDoctor] = useState({
    name: "",
    email: "",
    license: "",
    specialization: "",
    medicalCertificate: "",
  });
  const [status, setStatus] = useState("pending");
  const [openSnackbar, setOpenSnackbar] = useState(false);

  useEffect(() => {
    // Fetch stored doctor verification status
    const storedDoctor = JSON.parse(localStorage.getItem("doctorVerification"));
    const storedStatus = localStorage.getItem("doctorStatus") || "pending";
    if (storedDoctor) {
      setDoctor(storedDoctor);
    }
    setStatus(storedStatus);
  }, []);

  const handleChange = (e) => {
    setDoctor({ ...doctor, [e.target.name]: e.target.value });
  };

  const handleSubmit = () => {
    // Simulate sending verification request to admin
    console.log("Doctor Verification Submitted", doctor);
    localStorage.setItem("doctorVerification", JSON.stringify(doctor));
    localStorage.setItem("doctorStatus", "pending");
    setStatus("pending");
    setOpenSnackbar(true);
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  const statusColor = {
    pending: "text-yellow-600",
    verified: "text-green-600",
    rejected: "text-red-600",
  };

  const statusIcon = {
    pending: (
      <HourglassEmptyIcon className="text-yellow-600" fontSize="large" />
    ),
    verified: (
      <CheckCircleOutlineIcon className="text-green-600" fontSize="large" />
    ),
    rejected: <CancelIcon className="text-red-600" fontSize="large" />,
  };

  return (
    <Container
      maxWidth="sm"
      className="flex justify-center items-center min-h-screen"
    >
      <Card className="shadow-xl p-6 rounded-xl w-full">
        <CardContent>
          <Typography
            variant="h4"
            className="mb-6 text-center font-bold text-gray-700"
          >
            Doctor Identity Verification
          </Typography>
          <Box className="flex justify-center mb-4">{statusIcon[status]}</Box>
          <Typography
            variant="h6"
            className={`text-center ${statusColor[status]} font-semibold mb-4`}
          >
            Status: {status.charAt(0).toUpperCase() + status.slice(1)}
          </Typography>
          <TextField
            fullWidth
            label="Name"
            name="name"
            variant="outlined"
            className="mb-4"
            value={doctor.name}
            onChange={handleChange}
          />
          <TextField
            fullWidth
            label="Email"
            name="email"
            variant="outlined"
            className="mb-4"
            value={doctor.email}
            onChange={handleChange}
          />
          <TextField
            fullWidth
            label="License Number"
            name="license"
            variant="outlined"
            className="mb-4"
            value={doctor.license}
            onChange={handleChange}
          />
          <TextField
            fullWidth
            label="Specialization"
            name="specialization"
            variant="outlined"
            className="mb-4"
            value={doctor.specialization}
            onChange={handleChange}
          />
          <TextField
            fullWidth
            label="Medical Certificate ID"
            name="medicalCertificate"
            variant="outlined"
            className="mb-4"
            value={doctor.medicalCertificate}
            onChange={handleChange}
          />
          <Button
            fullWidth
            variant="contained"
            color="primary"
            onClick={handleSubmit}
            className="py-3 text-lg"
          >
            Submit for Verification
          </Button>
        </CardContent>
      </Card>
      <Snackbar
        open={openSnackbar}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity="info"
          sx={{ width: "100%" }}
        >
          Verification request submitted! Waiting for admin approval.
        </Alert>
      </Snackbar>
    </Container>
  );
}
