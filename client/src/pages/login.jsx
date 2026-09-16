// Login.jsx - Professional Version
import { useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
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
  Chip,
  Avatar,
  CircularProgress,
  Fade,
  Zoom,
} from "@mui/material";
import {
  Email,
  Lock,
  Visibility,
  VisibilityOff,
  Person,
  LocalHospital,
  Google,
  Verified,
  ArrowForward,
  CheckCircle,
  MedicalServices,
  Security,
  HealthAndSafety,
  Support,
  Speed,
} from "@mui/icons-material";
import { motion, AnimatePresence } from "framer-motion";
import { API_URL } from "../config";

export default function Login() {
  const { storeTokenInLS, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [log, setLog] = useState({
    email: "",
    password: "",
    role: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Get redirect path from state
  const from = location.state?.from || "";

  const handleGoogleLogin = () => {
    window.open(`${API_URL}/auth/google`, "_self");
  };

  const handleInput = (e) => {
    const { name, value } = e.target;
    setLog({ ...log, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!log.role) {
      setError("Please select a role: Patient or Doctor");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(log),
      });

      const res_data = await response.json();

      if (response.ok) {
        storeTokenInLS(res_data.token);
        setLog({ email: "", password: "", role: "" });
        setShowSuccess(true);
        
        setTimeout(() => {
          // Admin (role "Admin" or isAdmin) always goes to the Admin panel
          if (res_data.isAdmin || res_data.role === "Admin") {
            navigate("/Admin");
            return;
          }
          
          // If redirected from protected page, go there
          if (from) {
            navigate(from);
            return;
          }
          
          navigate(res_data.role === "Doctor" ? "/doctordashboard" : "/patientdashboard");
        }, 1000);
      } else {
        setError(res_data?.msg || "Invalid email or password");
        setLoading(false);
      }
    } catch (error) {
      console.error("Login error:", error);
      setError("Failed to connect to server.");
      setLoading(false);
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
        py: { xs: 4, md: 6 },
      }}
    >
      {/* Animated Background Elements */}
      {[
        { color: "rgba(255,255,255,0.08)", top: "5%", left: "8%", size: 260 },
        { color: "rgba(255,235,59,0.12)", top: "70%", left: "75%", size: 300 },
        { color: "rgba(255,255,255,0.06)", top: "20%", left: "70%", size: 180 },
        { color: "rgba(76,175,80,0.1)", top: "80%", left: "10%", size: 220 },
      ].map((blob, i) => (
        <motion.div
          key={i}
          animate={{ y: [0, -30, 0], x: [0, 20, 0], rotate: [0, 20, 0] }}
          transition={{ duration: 7 + i * 2, repeat: Infinity, ease: "easeInOut" }}
          style={{
            position: "absolute",
            top: blob.top,
            left: blob.left,
            width: blob.size,
            height: blob.size,
            borderRadius: "50%",
            background: blob.color,
            filter: "blur(20px)",
            zIndex: 0,
          }}
        />
      ))}

      {/* Medical Pattern */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          opacity: 0.03,
          zIndex: 0,
          backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)",
          backgroundSize: "30px 30px",
        }}
      />

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
              background: "rgba(255,255,255,0.98)",
              boxShadow: "0 30px 60px rgba(0,0,0,0.25)",
              backdropFilter: "blur(10px)",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Top Accent Line */}
            <Box
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: 5,
                background: "linear-gradient(90deg, #0D47A1 0%, #1976d2 50%, #42a5f5 100%)",
              }}
            />

            {/* Logo Section */}
            <Stack spacing={2} alignItems="center" sx={{ mb: 3, mt: 2 }}>
              <motion.div
                animate={{ rotate: [0, 8, -8, 0], scale: [1, 1.05, 1] }}
                transition={{ duration: 3, repeat: Infinity, repeatType: "reverse" }}
              >
                <Box
                  sx={{
                    width: 80,
                    height: 80,
                    borderRadius: 4,
                    bgcolor: "#0D47A1",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                    boxShadow: "0 10px 25px rgba(13,71,161,0.4)",
                    position: "relative",
                  }}
                >
                  <LocalHospital sx={{ fontSize: 44 }} />
                  <Box
                    sx={{
                      position: "absolute",
                      bottom: -4,
                      right: -4,
                      bgcolor: "#4CAF50",
                      borderRadius: "50%",
                      width: 24,
                      height: 24,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      border: "2px solid white",
                    }}
                  >
                    <Verified sx={{ fontSize: 14, color: "white" }} />
                  </Box>
                </Box>
              </motion.div>
              <Box textAlign="center">
                <Typography variant="h4" sx={{ fontWeight: 800, color: "#0D47A1", letterSpacing: "-0.5px" }}>
                  Welcome Back
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Sign in to continue to Docify
                </Typography>
              </Box>
            </Stack>

            {/* Success Message */}
            <AnimatePresence>
              {showSuccess && (
                <Fade in={showSuccess}>
                  <Alert
                    severity="success"
                    sx={{ mb: 2, borderRadius: 3, bgcolor: "#e8f5e9", border: "1px solid #a5d6a7" }}
                    icon={<CheckCircle />}
                  >
                    Login successful! Redirecting...
                  </Alert>
                </Fade>
              )}
            </AnimatePresence>

            {/* Error Message */}
            {error && (
              <Fade in={!!error}>
                <Alert
                  severity="error"
                  sx={{ mb: 2, borderRadius: 3, bgcolor: "#ffebee", border: "1px solid #ef9a9a" }}
                  onClose={() => setError("")}
                >
                  {error}
                </Alert>
              </Fade>
            )}

            {/* Form */}
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
                  sx: {
                    borderRadius: 3,
                    "& .MuiOutlinedInput-root": {
                      "& fieldset": { borderColor: "#e0e0e0" },
                      "&:hover fieldset": { borderColor: "#1976d2" },
                    },
                  },
                }}
                sx={{
                  "& .MuiOutlinedInput-root": { borderRadius: 3 },
                  "& .MuiInputLabel-root": { fontWeight: 600 },
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
                  sx: {
                    borderRadius: 3,
                    "& .MuiOutlinedInput-root": {
                      "& fieldset": { borderColor: "#e0e0e0" },
                      "&:hover fieldset": { borderColor: "#1976d2" },
                    },
                  },
                }}
                sx={{
                  "& .MuiOutlinedInput-root": { borderRadius: 3 },
                  "& .MuiInputLabel-root": { fontWeight: 600 },
                }}
              />

              {/* Role Selection */}
              <Typography variant="subtitle2" sx={{ mt: 2, mb: 1, fontWeight: 800, color: "#0D47A1" }}>
                Select Role
              </Typography>
              <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
                {[
                  { key: "Patient", label: "Patient", icon: <Person />, color: "#4CAF50" },
                  { key: "Doctor", label: "Doctor", icon: <LocalHospital />, color: "#1976d2" },
                ].map((r) => (
                  <motion.div
                    key={r.key}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    style={{ flex: 1 }}
                  >
                    <Box
                      onClick={() => setLog({ ...log, role: r.key })}
                      sx={{
                        border: log.role === r.key ? `2px solid ${r.color}` : "2px solid #e0e0e0",
                        padding: "14px",
                        borderRadius: 3,
                        cursor: "pointer",
                        textAlign: "center",
                        bgcolor: log.role === r.key ? `${r.color}10` : "transparent",
                        transition: "all 0.2s ease",
                        position: "relative",
                      }}
                    >
                      {log.role === r.key && (
                        <Box
                          sx={{
                            position: "absolute",
                            top: 8,
                            right: 8,
                            width: 20,
                            height: 20,
                            borderRadius: "50%",
                            bgcolor: r.color,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <CheckCircle sx={{ fontSize: 14, color: "white" }} />
                        </Box>
                      )}
                      <Box sx={{ color: log.role === r.key ? r.color : "text.secondary", mb: 0.5 }}>
                        {r.icon}
                      </Box>
                      <Typography
                        variant="body2"
                        fontWeight={700}
                        color={log.role === r.key ? r.color : "text.secondary"}
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
                  disabled={loading}
                  startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <ArrowForward />}
                  sx={{
                    py: 1.8,
                    fontWeight: 800,
                    fontSize: "1rem",
                    borderRadius: 3,
                    background: "linear-gradient(135deg, #0D47A1 0%, #1976d2 100%)",
                    boxShadow: "0 10px 25px rgba(25,118,210,0.35)",
                    "&:hover": { background: "linear-gradient(135deg, #08306b 0%, #1565c0 100%)", boxShadow: "0 15px 30px rgba(25,118,210,0.45)" },
                    "&:disabled": { opacity: 0.7 },
                  }}
                >
                  {loading ? "Signing in..." : "Sign In"}
                </Button>
              </motion.div>
            </form>

            <Divider sx={{ my: 3 }}>
              <Chip label="OR" size="small" sx={{ fontWeight: 800 }} />
            </Divider>

            <Button
              fullWidth
              variant="outlined"
              size="large"
              startIcon={<Google />}
              onClick={handleGoogleLogin}
              disabled={loading}
              sx={{
                py: 1.4,
                borderRadius: 3,
                borderColor: "#4285F4",
                color: "#4285F4",
                fontWeight: 700,
                textTransform: "none",
                "&:hover": { bgcolor: "rgba(66,133,244,0.08)", borderColor: "#4285F4" },
              }}
            >
              Sign in with Google
            </Button>

            {/* Trust Indicators */}
            <Stack direction="row" spacing={1} justifyContent="center" sx={{ mt: 3, mb: 2 }}>
              <Chip
                icon={<Security sx={{ fontSize: 14 }} />}
                label="Secure"
                size="small"
                sx={{ fontSize: 11, fontWeight: 600 }}
              />
              <Chip
                icon={<Speed sx={{ fontSize: 14 }} />}
                label="Fast"
                size="small"
                sx={{ fontSize: 11, fontWeight: 600 }}
              />
              <Chip
                icon={<Support sx={{ fontSize: 14 }} />}
                label="24/7 Support"
                size="small"
                sx={{ fontSize: 11, fontWeight: 600 }}
              />
            </Stack>

            <Stack direction="row" spacing={0.5} justifyContent="center">
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