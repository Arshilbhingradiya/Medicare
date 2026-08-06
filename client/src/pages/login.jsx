import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../store/auth";
import {
  Container,
  TextField,
  Button,
  Typography,
  Paper,
  Box,
  Stack,
  Divider,
  InputAdornment,
  IconButton,
  Alert,
} from "@mui/material";
import {
  Email,
  Lock,
  Visibility,
  VisibilityOff,
  Person,
  LocalHospital,
  Google,
} from "@mui/icons-material";
import { motion } from "framer-motion";
import "./css/login.css";

export default function Login() {
  const { storeTokenInLS } = useAuth();
  const [log, setlog] = useState({
    email: "",
    password: "",
    role: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleGoogleLogin = () => {
    window.open("http://localhost:3000/auth/google", "_self");
  };

  const handleInput = (e) => {
    const { name, value } = e.target;
    setlog({ ...log, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!log.role) {
      setError("Please select a role: Patient or Doctor");
      return;
    }

    try {
      const response = await fetch("http://localhost:3000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(log),
      });

      const res_data = await response.json();

if (response.ok) {
        storeTokenInLS(res_data.token);
        setlog({ email: "", password: "", role: "" });
        // Admin (role "Admin" or isAdmin) always goes to the Admin panel
        if (res_data.isAdmin || res_data.role === "Admin") {
          navigate("/Admin");
          return;
        }
        navigate(res_data.role === "Doctor" ? "/doctordashboard" : "/patientdashboard");
      } else {
        setError(res_data?.msg || "Invalid email or password");
      }
    } catch (error) {
      console.error("Login error:", error);
      setError("Failed to connect to server.");
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #0A3D8F 0%, #1976d2 50%, #42a5f5 100%)",
        position: "relative",
        overflow: "hidden",
        py: 4,
      }}
    >
      {[
        { color: "rgba(255,255,255,0.08)", top: "5%", left: "8%", size: 260 },
        { color: "rgba(255,235,59,0.12)", top: "70%", left: "75%", size: 300 },
        { color: "rgba(255,255,255,0.06)", top: "20%", left: "70%", size: 180 },
      ].map((blob, i) => (
        <motion.div
          key={i}
          animate={{ y: [0, -30, 0], rotate: [0, 20, 0] }}
          transition={{ duration: 7 + i, repeat: Infinity, ease: "easeInOut" }}
          style={{
            position: "absolute",
            top: blob.top,
            left: blob.left,
            width: blob.size,
            height: blob.size,
            borderRadius: "50%",
            background: blob.color,
            filter: "blur(10px)",
            zIndex: 0,
          }}
        />
      ))}

      <Container maxWidth="sm" sx={{ position: "relative", zIndex: 1 }}>
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <Paper
            elevation={0}
            sx={{
              p: { xs: 3, md: 5 },
              borderRadius: 5,
              background: "rgba(255,255,255,0.96)",
              boxShadow: "0 30px 60px rgba(0,0,0,0.25)",
              backdropFilter: "blur(10px)",
            }}
          >
            <Stack spacing={2} alignItems="center" sx={{ mb: 3 }}>
              <motion.div
                animate={{ rotate: [0, 8, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Box
                  sx={{
                    width: 70,
                    height: 70,
                    borderRadius: 3,
                    bgcolor: "#0D47A1",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                    boxShadow: "0 10px 25px rgba(13,71,161,0.4)",
                  }}
                >
                  <LocalHospital sx={{ fontSize: 40 }} />
                </Box>
              </motion.div>
              <Box textAlign="center">
                <Typography variant="h4" sx={{ fontWeight: 800, color: "#0D47A1" }}>
                  Welcome Back
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Sign in to continue to MediCare
                </Typography>
              </Box>
            </Stack>

            {error && (
              <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
                {error}
              </Alert>
            )}

            <form onSubmit={handleSubmit}>
              <TextField
                fullWidth
                label="Email Address"
                name="email"
                type="email"
                placeholder="Enter your email"
                value={log.email}
                onChange={handleInput}
                required
                margin="normal"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Email color="primary" />
                    </InputAdornment>
                  ),
                }}
              />
              <TextField
                fullWidth
                label="Password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={log.password}
                onChange={handleInput}
                required
                margin="normal"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock color="primary" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPassword((s) => !s)} edge="end">
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <Typography variant="subtitle2" sx={{ mt: 2, mb: 1, fontWeight: 700 }}>
                Select Role
              </Typography>
              <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
                {[
                  { key: "Patient", label: "Patient", icon: <Person /> },
                  { key: "Doctor", label: "Doctor", icon: <LocalHospital /> },
                ].map((r) => (
                  <motion.div
                    key={r.key}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    style={{ flex: 1 }}
                  >
                    <Box
                      onClick={() => setlog({ ...log, role: r.key })}
                      sx={{
                        border: log.role === r.key ? "2px solid #0D47A1" : "2px solid #e0e0e0",
                        padding: "12px",
                        borderRadius: 3,
                        cursor: "pointer",
                        textAlign: "center",
                        bgcolor: log.role === r.key ? "rgba(13,71,161,0.08)" : "transparent",
                        transition: "all 0.2s ease",
                      }}
                    >
                      <Box sx={{ color: log.role === r.key ? "#0D47A1" : "text.secondary" }}>
                        {r.icon}
                      </Box>
                      <Typography
                        variant="body2"
                        fontWeight={700}
                        color={log.role === r.key ? "primary" : "text.secondary"}
                      >
                        {r.label}
                      </Typography>
                    </Box>
                  </motion.div>
                ))}
              </Stack>

              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size="large"
                  sx={{
                    py: 1.5,
                    fontWeight: 800,
                    borderRadius: 3,
                    background: "linear-gradient(135deg, #0D47A1 0%, #1976d2 100%)",
                    boxShadow: "0 10px 25px rgba(25,118,210,0.35)",
                    "&:hover": { background: "linear-gradient(135deg, #08306b 0%, #1565c0 100%)" },
                  }}
                >
                  Sign In
                </Button>
              </motion.div>
            </form>

            <Divider sx={{ my: 3 }}>or</Divider>

            <Button
              fullWidth
              variant="outlined"
              size="large"
              startIcon={<Google />}
              onClick={handleGoogleLogin}
              sx={{
                py: 1.3,
                borderRadius: 3,
                borderColor: "#4285F4",
                color: "#4285F4",
                fontWeight: 700,
                "&:hover": { bgcolor: "rgba(66,133,244,0.08)", borderColor: "#4285F4" },
              }}
            >
              Sign in with Google
            </Button>

            <Stack direction="row" spacing={0.5} justifyContent="center" sx={{ mt: 3 }}>
              <Typography variant="body2" color="text.secondary">
Don&apos;t have an account?
              </Typography>
              <Link to="/signup" style={{ color: "#0D47A1", fontWeight: 700, textDecoration: "none" }}>
                Sign Up
              </Link>
            </Stack>
          </Paper>
        </motion.div>
      </Container>
    </Box>
  );
}
