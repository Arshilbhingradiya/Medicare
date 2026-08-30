// About.jsx - Updated with Login Protection
import { Container, Typography, Grid, Button, Paper, Box, Avatar, Chip, Card, CardContent, Stack, Divider, IconButton, useMediaQuery, createTheme, ThemeProvider } from "@mui/material";
import {
  MedicalServices,
  ArrowForward,
  ArrowUpward,
  Phone,
  Email,
  LocationOn,
  AccessTime,
  Star,
  HealthAndSafety,
  Speed,
  Verified,
  People,
  TrendingUp,
  Assignment,
  Person,
  VideoCall,
  Support,
  Shield,
  CheckCircle,
  Business,
  LocalHospital,
  CalendarToday,
  Schedule,
  Favorite,
  Bloodtype,
  MonitorHeart,
  Psychology,
  Medication,
  VolunteerActivism,
  WorkOutline,
  School,
  EmojiEvents,
  Group,
  Handshake,
  RocketLaunch,
  Login as LoginIcon,
} from "@mui/icons-material";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../store/auth";
import { motion } from "framer-motion";
import { useState } from "react";

const theme = createTheme({
  palette: {
    primary: { main: "#0D47A1" },
    secondary: { main: "#FF6F00" },
    success: { main: "#4CAF50" },
  },
});

const fadeUp = {
  hidden: { opacity: 0, y: 60 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } },
};

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 1 } },
};

const scaleUp = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.6 } },
};

const slideFromLeft = {
  hidden: { opacity: 0, x: -80 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.8 } },
};

const slideFromRight = {
  hidden: { opacity: 0, x: 80 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.8 } },
};

const slideFromBottom = {
  hidden: { opacity: 0, y: 60 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8 } },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15 } },
};

const About = () => {
  const { user, isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [showAllMembers, setShowAllMembers] = useState(false);

  const normalizedRole = user?.role?.toLowerCase();
  const isAdmin = normalizedRole === "admin" || user?.isAdmin;

  const teamMembers = [
    {
      name: "Dr. Arshil Bhingradiya",
      role: "CEO & Founder",
      desc: "Over 15 years of experience in healthcare management and digital health innovation.",
      image: "./profile.png",
      specialty: "Healthcare Management",
    },
    {
      name: "Dr. Priya Sharma",
      role: "CTO & Co-Founder",
      desc: "Passionate about leveraging AI and technology to transform healthcare delivery.",
      image: "./profile.png",
      specialty: "HealthTech & AI",
    },
    {
      name: "Dr. Raj Patel",
      role: "Head of Medical Affairs",
      desc: "Ensuring the highest standards of medical care and patient safety across platforms.",
      image: "./profile.png",
      specialty: "Medical Director",
    },
    {
      name: "Dr. Sarah Johnson",
      role: "Lead Developer",
      desc: "Building robust, user-friendly healthcare solutions with modern technology.",
      image: "./profile.png",
      specialty: "Full Stack Development",
    },
    {
      name: "Dr. Amit Kumar",
      role: "Head of Operations",
      desc: "Managing seamless operations and ensuring excellent patient experiences.",
      image: "./profile.png",
      specialty: "Operations & Logistics",
    },
    {
      name: "Dr. Emily Chen",
      role: "Head of Patient Care",
      desc: "Dedicated to providing exceptional patient support and care coordination.",
      image: "./profile.png",
      specialty: "Patient Relations",
    },
  ];

  const achievements = [
    { icon: <People sx={{ fontSize: 40 }} />, title: "10,000+", desc: "Happy Patients", color: "#0D47A1" },
    { icon: <LocalHospital sx={{ fontSize: 40 }} />, title: "50+", desc: "Specialist Doctors", color: "#FF6F00" },
    { icon: <Support sx={{ fontSize: 40 }} />, title: "24/7", desc: "Customer Support", color: "#4CAF50" },
    { icon: <Speed sx={{ fontSize: 40 }} />, title: "99.9%", desc: "Uptime Guarantee", color: "#9C27B0" },
    { icon: <Verified sx={{ fontSize: 40 }} />, title: "100%", desc: "Verified Doctors", color: "#2196F3" },
    { icon: <TrendingUp sx={{ fontSize: 40 }} />, title: "4.9/5", desc: "Patient Rating", color: "#F44336" },
  ];

  const values = [
    {
      icon: <HealthAndSafety sx={{ fontSize: 32 }} />,
      title: "Patient First",
      desc: "Every decision we make prioritizes patient health and well-being.",
      color: "#0D47A1",
    },
    {
      icon: <Shield sx={{ fontSize: 32 }} />,
      title: "Security & Trust",
      desc: "Your medical data is encrypted and protected with bank-level security.",
      color: "#FF6F00",
    },
    {
      icon: <Speed sx={{ fontSize: 32 }} />,
      title: "Innovation",
      desc: "We continuously improve our platform with cutting-edge technology.",
      color: "#4CAF50",
    },
    {
      icon: <Support sx={{ fontSize: 32 }} />,
      title: "Accessibility",
      desc: "Making healthcare accessible to everyone, everywhere, anytime.",
      color: "#9C27B0",
    },
  ];

  const milestones = [
    {
      year: "2020",
      title: "Founded",
      desc: "MediCare was founded with a vision to revolutionize healthcare access.",
      icon: <RocketLaunch sx={{ fontSize: 24 }} />,
    },
    {
      year: "2021",
      title: "10K Users",
      desc: "Reached 10,000 active users on our platform.",
      icon: <People sx={{ fontSize: 24 }} />,
    },
    {
      year: "2022",
      title: "50+ Doctors",
      desc: "Expanded our network to include 50+ specialist doctors.",
      icon: <LocalHospital sx={{ fontSize: 24 }} />,
    },
    {
      year: "2023",
      title: "AI Integration",
      desc: "Introduced AI-powered health recommendations.",
      icon: <MonitorHeart sx={{ fontSize: 24 }} />,
    },
    {
      year: "2024",
      title: "Global Expansion",
      desc: "Started expanding services to international markets.",
      icon: <Business sx={{ fontSize: 24 }} />,
    },
  ];

  // Handle booking appointment - redirect to login if not logged in
  const handleBookAppointment = () => {
    if (!isLoggedIn) {
      navigate("/login", { 
        state: { 
          from: "/patientappoinment",
          message: "Please login to book an appointment"
        } 
      });
      return;
    }
    
    if (normalizedRole === "doctor") {
      navigate("/doctordashboard");
      return;
    }
    
    navigate("/patientappoinment");
  };

  // Handle find doctors - allow access but redirect to login for booking
  const handleFindDoctors = () => {
    navigate("/doctorsearch");
  };

  // Handle get started - redirect to signup if not logged in
  const handleGetStarted = () => {
    if (!isLoggedIn) {
      navigate("/signup", {
        state: { 
          from: "/",
          message: "Create an account to get started"
        }
      });
      return;
    }
    
    navigate("/dashboard");
  };

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ width: "100%", overflowX: "hidden", minHeight: "100vh" }}>
        {/* ========== HERO SECTION ========== */}
        <Box
          sx={{
            width: "100%",
            minHeight: "70vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            color: "#fff",
            position: "relative",
            overflow: "hidden",
            background: "linear-gradient(135deg, #0A3D8F 0%, #1976d2 55%, #42a5f5 100%)",
          }}
        >
          {/* Animated Background Elements */}
          {[
            { color: "rgba(255,255,255,0.08)", top: "10%", left: "8%", size: 300 },
            { color: "rgba(255,235,59,0.12)", top: "65%", left: "80%", size: 350 },
            { color: "rgba(255,255,255,0.06)", top: "15%", left: "70%", size: 200 },
            { color: "rgba(76,175,80,0.1)", top: "75%", left: "15%", size: 280 },
            { color: "rgba(255,255,255,0.04)", top: "40%", left: "40%", size: 400 },
          ].map((blob, i) => (
            <motion.div
              key={i}
              animate={{ y: [0, -50, 0], x: [0, 30, 0], rotate: [0, 25, 0] }}
              transition={{ duration: 8 + i * 2, repeat: Infinity, ease: "easeInOut" }}
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

          {/* Main Content */}
          <motion.div
            variants={stagger}
            initial="hidden"
            animate="visible"
            style={{ zIndex: 2, position: "relative", maxWidth: 900, px: 4 }}
          >
            {/* Badge */}
            <motion.div variants={fadeUp}>
              <Chip
                icon={<Verified sx={{ fontSize: 20 }} />}
                label="About MediCare"
                sx={{
                  mb: 4,
                  bgcolor: "rgba(255,255,255,0.15)",
                  color: "white",
                  fontWeight: 700,
                  fontSize: "1rem",
                  px: 2,
                  py: 2,
                  backdropFilter: "blur(10px)",
                  border: "1px solid rgba(255,255,255,0.3)",
                }}
              />
            </motion.div>

            {/* Main Title */}
            <motion.div variants={fadeUp}>
              <Typography
                variant="h2"
                component="h1"
                gutterBottom
                sx={{
                  fontWeight: 800,
                  letterSpacing: 1,
                  fontSize: { xs: "2.5rem", sm: "3.5rem", md: "4rem" },
                  lineHeight: 1.2,
                  textShadow: "0 4px 20px rgba(0,0,0,0.3)",
                }}
              >
                Revolutionizing
                <br />
                <Box component="span" sx={{ color: "#FFEB3B" }}>
                  Healthcare Access
                </Box>
              </Typography>
            </motion.div>

            {/* Subtitle */}
            <motion.div variants={fadeUp}>
              <Typography
                variant="h6"
                sx={{
                  px: 2,
                  maxWidth: 700,
                  mx: "auto",
                  fontWeight: 400,
                  opacity: 0.95,
                  fontSize: { xs: "1rem", sm: "1.2rem", md: "1.3rem" },
                }}
              >
                Our mission is to provide a seamless and efficient platform for patients to book appointments with top healthcare professionals. We're revolutionizing healthcare through accessibility and innovation.
              </Typography>
            </motion.div>

            {/* CTA Buttons */}
            <motion.div variants={fadeUp} sx={{ mt: 4 }}>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={2} justifyContent="center">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    variant="contained"
                    color="secondary"
                    size="large"
                    onClick={handleBookAppointment}
                    startIcon={!isLoggedIn ? <LoginIcon /> : <CalendarToday />}
                    sx={{
                      px: 4,
                      py: 2,
                      fontWeight: 800,
                      fontSize: "1.1rem",
                      borderRadius: 3,
                      boxShadow: "0 10px 30px rgba(255,111,0,0.4)",
                      textTransform: "none",
                    }}
                  >
                    {!isLoggedIn ? "Login to Book" : "Book Appointment"}
                  </Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    variant="outlined"
                    size="large"
                    onClick={handleFindDoctors}
                    startIcon={<ArrowForward />}
                    sx={{
                      px: 4,
                      py: 2,
                      fontWeight: 800,
                      fontSize: "1.1rem",
                      borderRadius: 3,
                      borderColor: "rgba(255,255,255,0.5)",
                      color: "white",
                      textTransform: "none",
                      "&:hover": {
                        borderColor: "white",
                        bgcolor: "rgba(255,255,255,0.1)",
                      },
                    }}
                  >
                    Find Doctors
                  </Button>
                </motion.div>
              </Stack>
            </motion.div>

            {/* Login Prompt for Non-Logged Users */}
            {!isLoggedIn && (
              <motion.div variants={fadeUp} sx={{ mt: 3 }}>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                  <Link to="/login" style={{ color: "#FFEB3B", fontWeight: 700, textDecoration: "none" }}>
                    Login
                  </Link>
                  {" "}or{" "}
                  <Link to="/signup" style={{ color: "#FFEB3B", fontWeight: 700, textDecoration: "none" }}>
                    Sign Up
                  </Link>
                  {" "}to book appointments and access full features
                </Typography>
              </motion.div>
            )}
          </motion.div>
        </Box>

        {/* ========== MISSION & VALUES SECTION ========== */}
        <Box sx={{ width: "100%", py: { xs: 6, md: 10 }, backgroundColor: "#f8f9fa" }}>
          <Container maxWidth="lg">
            <motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }}>
              <motion.div variants={fadeUp} sx={{ textAlign: "center", mb: 6 }}>
                <Chip label="Our Mission" color="primary" sx={{ mb: 2, fontWeight: 700 }} />
                <Typography variant="h3" component="h2" gutterBottom sx={{ fontWeight: 800 }}>
                  What Drives Us
                </Typography>
                <Typography variant="subtitle1" color="text.secondary" sx={{ maxWidth: 600, mx: "auto" }}>
                  We believe in making quality healthcare accessible to everyone through technology and compassion.
                </Typography>
              </motion.div>

              <Grid container spacing={4}>
                {values.map((value, index) => (
                  <Grid item xs={12} sm={6} md={3} key={index}>
                    <motion.div
                      variants={fadeUp}
                      whileHover={{ y: -10, scale: 1.02 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <Paper
                        elevation={2}
                        sx={{
                          p: 4,
                          textAlign: "center",
                          height: "100%",
                          borderRadius: 4,
                          transition: "all 0.3s ease",
                          border: "1px solid #e3f2fd",
                          "&:hover": {
                            boxShadow: "0 16px 40px rgba(13,71,161,0.15)",
                            borderColor: value.color,
                          },
                        }}
                      >
                        <Box
                          sx={{
                            width: 80,
                            height: 80,
                            mx: "auto",
                            mb: 3,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            borderRadius: 3,
                            bgcolor: `${value.color}15`,
                            color: value.color,
                          }}
                        >
                          {value.icon}
                        </Box>
                        <Typography variant="h6" component="h3" sx={{ fontWeight: 800, mb: 1 }}>
                          {value.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {value.desc}
                        </Typography>
                      </Paper>
                    </motion.div>
                  </Grid>
                ))}
              </Grid>
            </motion.div>
          </Container>
        </Box>

        {/* ========== ACHIEVEMENTS SECTION ========== */}
        <Box sx={{ width: "100%", py: { xs: 6, md: 10 }, backgroundColor: "#fff" }}>
          <Container maxWidth="lg">
            <motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true }}>
              <motion.div variants={fadeUp} sx={{ textAlign: "center", mb: 6 }}>
                <Chip label="Our Achievements" color="secondary" sx={{ mb: 2, fontWeight: 700 }} />
                <Typography variant="h3" component="h2" gutterBottom sx={{ fontWeight: 800 }}>
                  Numbers Speak
                </Typography>
                <Typography variant="subtitle1" color="text.secondary">
                  Our track record of success and trust
                </Typography>
              </motion.div>

              <Grid container spacing={4}>
                {achievements.map((achievement, index) => (
                  <Grid item xs={12} sm={6} md={4} key={index}>
                    <motion.div
                      variants={fadeUp}
                      whileHover={{ y: -10 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <Paper
                        elevation={2}
                        sx={{
                          p: 4,
                          textAlign: "center",
                          height: "100%",
                          borderRadius: 4,
                          transition: "all 0.3s ease",
                          "&:hover": { boxShadow: "0 16px 40px rgba(0,0,0,0.15)" },
                        }}
                      >
                        <Box
                          sx={{
                            width: 80,
                            height: 80,
                            mx: "auto",
                            mb: 3,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            borderRadius: "50%",
                            bgcolor: `${achievement.color}15`,
                            color: achievement.color,
                          }}
                        >
                          {achievement.icon}
                        </Box>
                        <Typography variant="h3" sx={{ fontWeight: 800, color: achievement.color }}>
                          {achievement.title}
                        </Typography>
                        <Typography variant="body1" color="text.secondary" fontWeight={600}>
                          {achievement.desc}
                        </Typography>
                      </Paper>
                    </motion.div>
                  </Grid>
                ))}
              </Grid>
            </motion.div>
          </Container>
        </Box>

        {/* ========== TEAM SECTION ========== */}
        <Box sx={{ width: "100%", py: { xs: 6, md: 10 }, backgroundColor: "#f8f9fa" }}>
          <Container maxWidth="lg">
            <motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true }}>
              <motion.div variants={fadeUp} sx={{ textAlign: "center", mb: 6 }}>
                <Chip label="Our Team" color="primary" sx={{ mb: 2, fontWeight: 700 }} />
                <Typography variant="h3" component="h2" gutterBottom sx={{ fontWeight: 800 }}>
                  Meet Our Experts
                </Typography>
                <Typography variant="subtitle1" color="text.secondary">
                  The passionate team behind MediCare
                </Typography>
              </motion.div>

              <Grid container spacing={4}>
                {(showAllMembers ? teamMembers : teamMembers.slice(0, 3)).map((member, index) => (
                  <Grid item xs={12} sm={6} md={4} key={index}>
                    <motion.div
                      variants={fadeUp}
                      whileHover={{ y: -10 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <Card sx={{ height: "100%", borderRadius: 4, boxShadow: "0 8px 30px rgba(0,0,0,0.1)", "&:hover": { boxShadow: "0 16px 48px rgba(0,0,0,0.15)" } }}>
                        <CardContent sx={{ p: 4, textAlign: "center" }}>
                          <Box sx={{ position: "relative", display: "inline-block", mb: 3 }}>
                            <Avatar
                              alt={member.name}
                              src={member.image}
                              sx={{
                                width: 120,
                                height: 120,
                                mx: "auto",
                                bgcolor: "#0D47A1",
                                fontSize: 40,
                                fontWeight: 800,
                                border: "4px solid #e3f2fd",
                                boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
                              }}
                            >
                              {member.name.charAt(0)}
                            </Avatar>
                            <Box
                              sx={{
                                position: "absolute",
                                bottom: 0,
                                right: 0,
                                bgcolor: "#4CAF50",
                                borderRadius: "50%",
                                width: 28,
                                height: 28,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                border: "2px solid white",
                              }}
                            >
                              <Verified sx={{ fontSize: 16, color: "white" }} />
                            </Box>
                          </Box>
                          <Typography variant="h6" fontWeight={800}>
                            {member.name}
                          </Typography>
                          <Chip
                            label={member.role}
                            color="primary"
                            size="small"
                            sx={{ mb: 1, fontWeight: 700 }}
                          />
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            {member.specialty}
                          </Typography>
                          <Divider sx={{ my: 2 }} />
                          <Typography variant="body2" color="text.secondary">
                            {member.desc}
                          </Typography>
                        </CardContent>
                      </Card>
                    </motion.div>
                  </Grid>
                ))}
              </Grid>

              {teamMembers.length > 3 && (
                <Box sx={{ textAlign: "center", mt: 4 }}>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      variant="outlined"
                      color="primary"
                      onClick={() => setShowAllMembers(!showAllMembers)}
                      endIcon={showAllMembers ? <ArrowUpward /> : <ArrowForward />}
                      sx={{ borderRadius: 3, px: 4, py: 1.5, fontWeight: 700 }}
                    >
                      {showAllMembers ? "Show Less" : "View All Team Members"}
                    </Button>
                  </motion.div>
                </Box>
              )}
            </motion.div>
          </Container>
        </Box>

        {/* ========== MILESTONES SECTION ========== */}
        <Box sx={{ width: "100%", py: { xs: 6, md: 10 }, backgroundColor: "#fff" }}>
          <Container maxWidth="lg">
            <motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true }}>
              <motion.div variants={fadeUp} sx={{ textAlign: "center", mb: 6 }}>
                <Chip label="Our Journey" color="secondary" sx={{ mb: 2, fontWeight: 700 }} />
                <Typography variant="h3" component="h2" gutterBottom sx={{ fontWeight: 800 }}>
                  Milestones We've Achieved
                </Typography>
                <Typography variant="subtitle1" color="text.secondary">
                  Growing and improving every year
                </Typography>
              </motion.div>

              <Box sx={{ position: "relative", maxWidth: 800, mx: "auto" }}>
                {milestones.map((milestone, index) => (
                  <motion.div
                    key={index}
                    variants={fadeUp}
                    whileHover={{ scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems="center" sx={{ mb: 3 }}>
                      <Box
                        sx={{
                          width: 56,
                          height: 56,
                          borderRadius: "50%",
                          bgcolor: "#0D47A1",
                          color: "white",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          boxShadow: "0 4px 12px rgba(13,71,161,0.3)",
                          flexShrink: 0,
                        }}
                      >
                        {milestone.icon}
                      </Box>
                      <Paper
                        sx={{
                          p: 3,
                          flexGrow: 1,
                          borderRadius: 3,
                          border: "1px solid #e3f2fd",
                          transition: "all 0.3s ease",
                          "&:hover": { boxShadow: "0 8px 24px rgba(13,71,161,0.1)" },
                        }}
                      >
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                          <Chip
                            label={milestone.year}
                            color="primary"
                            size="small"
                            sx={{ fontWeight: 800 }}
                          />
                          <Typography variant="h6" fontWeight={800}>
                            {milestone.title}
                          </Typography>
                        </Stack>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                          {milestone.desc}
                        </Typography>
                      </Paper>
                    </Stack>
                  </motion.div>
                ))}
              </Box>
            </motion.div>
          </Container>
        </Box>

        {/* ========== CTA SECTION ========== */}
        <Box sx={{ width: "100%", py: { xs: 6, md: 10 }, background: "linear-gradient(135deg, #0D47A1 0%, #1976D2 100%)" }}>
          <Container maxWidth="lg">
            <motion.div
              variants={scaleUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              style={{ textAlign: "center" }}
            >
              <Typography variant="h3" color="white" fontWeight={800} gutterBottom>
                Ready to Experience Better Healthcare?
              </Typography>
              <Typography variant="h6" color="rgba(255,255,255,0.9)" sx={{ mb: 4, maxWidth: 600, mx: "auto" }}>
                Join thousands of satisfied patients who trust MediCare for their healthcare needs.
              </Typography>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={2} justifyContent="center">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    variant="contained"
                    color="secondary"
                    size="large"
                    onClick={handleBookAppointment}
                    startIcon={!isLoggedIn ? <LoginIcon /> : <CalendarToday />}
                    sx={{ px: 5, py: 2, fontWeight: 800, fontSize: "1.1rem", borderRadius: 3, textTransform: "none" }}
                  >
                    {!isLoggedIn ? "Login to Book" : "Book Appointment"}
                  </Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    variant="outlined"
                    size="large"
                    onClick={handleFindDoctors}
                    startIcon={<ArrowForward />}
                    sx={{ px: 5, py: 2, fontWeight: 800, fontSize: "1.1rem", borderRadius: 3, borderColor: "white", color: "white", textTransform: "none", "&:hover": { bgcolor: "rgba(255,255,255,0.1)", borderColor: "white" } }}
                  >
                    Find Doctors
                  </Button>
                </motion.div>
              </Stack>
            </motion.div>
          </Container>
        </Box>

        {/* ========== FOOTER ========== */}
        <Box sx={{ bgcolor: "#0D47A1", color: "white", py: 6 }}>
          <Container maxWidth="lg">
            <Grid container spacing={4}>
              <Grid item xs={12} md={4}>
                <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 2 }}>
                  <Box sx={{ bgcolor: "rgba(255,255,255,0.15)", borderRadius: 2, p: 1 }}>
                    <MedicalServices sx={{ color: "#FFEB3B", fontSize: 32 }} />
                  </Box>
                  <Typography variant="h5" fontWeight={800}>
                    MediCare
                  </Typography>
                </Stack>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Your trusted healthcare partner, providing seamless medical appointments and quality care.
                </Typography>
              </Grid>
              <Grid item xs={12} md={4}>
                <Typography variant="h6" fontWeight={800} gutterBottom>
                  Quick Links
                </Typography>
                <Stack spacing={1}>
                  {[
                    { label: "Home", path: "/" },
                    { label: "Find Doctors", path: "/doctorsearch" },
                    { label: "About Us", path: "/about" },
                    { label: "Contact", path: "/contact" },
                    { label: "Book Appointment", path: "/patientappoinment", protected: true },
                  ].map((link, index) => (
                    <Link key={index} to={link.path} style={{ color: "rgba(255,255,255,0.8)", textDecoration: "none", transition: "color 0.3s" }}>
                      <Typography variant="body2" sx={{ "&:hover": { color: "#FFEB3B" } }}>
                        {link.label}
                      </Typography>
                    </Link>
                  ))}
                </Stack>
              </Grid>
              <Grid item xs={12} md={4}>
                <Typography variant="h6" fontWeight={800} gutterBottom>
                  Contact Us
                </Typography>
                <Stack spacing={1.5}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <LocationOn sx={{ fontSize: 20 }} />
                    <Typography variant="body2">123 Health St, New York, NY</Typography>
                  </Stack>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Phone sx={{ fontSize: 20 }} />
                    <Typography variant="body2">+1 800 123 4567</Typography>
                  </Stack>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Email sx={{ fontSize: 20 }} />
                    <Typography variant="body2">support@medicare.com</Typography>
                  </Stack>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <AccessTime sx={{ fontSize: 20 }} />
                    <Typography variant="body2">Mon-Sat: 9:00 AM - 9:00 PM</Typography>
                  </Stack>
                </Stack>
              </Grid>
            </Grid>
            <Divider sx={{ my: 4, bgcolor: "rgba(255,255,255,0.2)" }} />
            <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" alignItems="center">
              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                © 2024 MediCare. All rights reserved.
              </Typography>
              <Stack direction="row" spacing={2}>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>Privacy Policy</Typography>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>Terms of Service</Typography>
              </Stack>
            </Stack>
          </Container>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default About;