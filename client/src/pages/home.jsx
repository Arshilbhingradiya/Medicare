// Home.jsx - Fixed Version (No Scroll Opacity Issue)
import { Box, Typography, Button, Container, Grid, Paper, Avatar, Chip, Card, CardContent, Stack, Divider, IconButton, useMediaQuery, createTheme, ThemeProvider } from "@mui/material";
import {
  CalendarToday,
  LocalHospital,
  People,
  Verified,
  Speed,
  MedicalServices,
  ArrowForward,
  ArrowUpward,
  Phone,
  Email,
  LocationOn,
  AccessTime,
  Star,
  Favorite,
  HealthAndSafety,
  Emergency,
  Schedule,
  CheckCircle,
  TrendingUp,
  Support,
  Shield,
  KeyboardArrowRight,
  PlayArrow,
  Assignment,
  Person,
  VideoCall,
  NotificationsActive,
  SearchRounded,
} from "@mui/icons-material";
import { useNavigate, Link } from "react-router-dom";
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

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15 } },
};

const Home = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const normalizedRole = user?.role?.toLowerCase();
  const isAdmin = normalizedRole === "admin" || user?.isAdmin;

  const handleBookAppointment = () => {
    navigate("/patientappoinment");
  };

  const handleFindDoctors = () => {
    navigate("/doctorsearch");
  };

  const handleGetStarted = () => {
    navigate(user ? "/dashboard" : "/login");
  };

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ width: "100%", overflowX: "hidden", minHeight: "100vh" }}>
        {/* ========== HERO SECTION ========== */}
        <Box
          sx={{
            width: "100%",
            minHeight: "100vh",
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
                label="Trusted Healthcare Platform"
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
                  fontSize: { xs: "2.5rem", sm: "3.5rem", md: "4.5rem" },
                  lineHeight: 1.2,
                  textShadow: "0 4px 20px rgba(0,0,0,0.3)",
                }}
              >
                Your Health,
                <br />
                <Box component="span" sx={{ color: "#FFEB3B" }}>
                  Our Priority
                </Box>
              </Typography>
            </motion.div>

            {/* Subtitle */}
            <motion.div variants={fadeUp}>
              <Typography
                variant="h5"
                component="h2"
                gutterBottom
                sx={{
                  px: 2,
                  maxWidth: 700,
                  mx: "auto",
                  fontWeight: 400,
                  opacity: 0.95,
                  fontSize: { xs: "1.1rem", sm: "1.3rem", md: "1.5rem" },
                }}
              >
                Book your appointment with the best doctors in town. Get quality healthcare services at your doorstep.
              </Typography>
            </motion.div>

            {/* CTA Buttons */}
            {!isAdmin && (
              <motion.div variants={fadeUp} sx={{ mt: 4 }}>
                <Stack direction={{ xs: "column", sm: "row" }} spacing={2} justifyContent="center">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      variant="contained"
                      color="secondary"
                      size="large"
                      onClick={handleBookAppointment}
                      startIcon={<CalendarToday />}
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
                      Book Appointment
                    </Button>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      variant="outlined"
                      size="large"
                      onClick={handleFindDoctors}
                      startIcon={<SearchRounded />}
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
            )}

            {/* Stats */}
            <motion.div variants={fadeUp} sx={{ mt: 6 }}>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={4} justifyContent="center" alignItems="center">
                {[
                  { icon: <People sx={{ fontSize: 32 }} />, number: "500+", label: "Doctors" },
                  { icon: <HealthAndSafety sx={{ fontSize: 32 }} />, number: "10K+", label: "Patients" },
                  { icon: <Speed sx={{ fontSize: 32 }} />, number: "24/7", label: "Support" },
                ].map((stat, index) => (
                  <Stack key={index} direction="row" alignItems="center" spacing={1.5}>
                    <Box sx={{ color: "#FFEB3B" }}>{stat.icon}</Box>
                    <Box>
                      <Typography variant="h4" sx={{ fontWeight: 800, lineHeight: 1 }}>
                        {stat.number}
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.8 }}>
                        {stat.label}
                      </Typography>
                    </Box>
                  </Stack>
                ))}
              </Stack>
            </motion.div>
          </motion.div>
        </Box>

        {/* ========== FEATURES SECTION ========== */}
        <Box sx={{ width: "100%", py: { xs: 6, md: 10 }, backgroundColor: "#f8f9fa" }}>
          <Container maxWidth="lg">
            <motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }}>
              <motion.div variants={fadeUp} sx={{ textAlign: "center", mb: 6 }}>
                <Chip label="Why Choose Us" color="primary" sx={{ mb: 2, fontWeight: 700 }} />
                <Typography variant="h3" component="h2" gutterBottom sx={{ fontWeight: 800 }}>
                  Comprehensive Healthcare Services
                </Typography>
                <Typography variant="subtitle1" color="text.secondary" sx={{ maxWidth: 600, mx: "auto" }}>
                  We provide the best medical care with advanced technology and experienced doctors.
                </Typography>
              </motion.div>

              <Grid container spacing={4}>
                {[
                  {
                    icon: <LocalHospital sx={{ fontSize: 40 }} />,
                    title: "General Checkup",
                    desc: "Comprehensive health checkups with detailed reports.",
                    color: "#0D47A1",
                  },
                  {
                    icon: <CalendarToday sx={{ fontSize: 40 }} />,
                    title: "Online Booking",
                    desc: "Book appointments anytime, anywhere with our platform.",
                    color: "#FF6F00",
                  },
                  {
                    icon: <NotificationsActive sx={{ fontSize: 40 }} />,
                    title: "Smart Reminders",
                    desc: "Get automatic reminders via SMS and email.",
                    color: "#4CAF50",
                  },
                  {
                    icon: <Speed sx={{ fontSize: 40 }} />,
                    title: "Fast Service",
                    desc: "Quick responses and minimal waiting time.",
                    color: "#9C27B0",
                  },
                  {
                    icon: <VideoCall sx={{ fontSize: 40 }} />,
                    title: "Telemedicine",
                    desc: "Consult with doctors remotely via video calls.",
                    color: "#2196F3",
                  },
                  {
                    icon: <Shield sx={{ fontSize: 40 }} />,
                    title: "Secure Records",
                    desc: "Your medical data is encrypted and secure.",
                    color: "#F44336",
                  },
                ].map((feature, index) => (
                  <Grid item xs={12} sm={6} md={4} key={index}>
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
                            borderColor: feature.color,
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
                            bgcolor: `${feature.color}15`,
                            color: feature.color,
                          }}
                        >
                          {feature.icon}
                        </Box>
                        <Typography variant="h6" component="h3" sx={{ fontWeight: 800, mb: 1 }}>
                          {feature.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {feature.desc}
                        </Typography>
                      </Paper>
                    </motion.div>
                  </Grid>
                ))}
              </Grid>
            </motion.div>
          </Container>
        </Box>

        {/* ========== ABOUT SECTION ========== */}
        <Box sx={{ width: "100%", py: { xs: 6, md: 10 }, backgroundColor: "#fff" }}>
          <Container maxWidth="lg">
            <Grid container spacing={6} alignItems="center">
              <Grid item xs={12} md={6}>
                <motion.div variants={slideFromLeft} initial="hidden" whileInView="visible" viewport={{ once: true }}>
                  <Box sx={{ position: "relative" }}>
                    <Paper
                      sx={{
                        p: 4,
                        borderRadius: 4,
                        background: "linear-gradient(135deg, #0D47A1 0%, #1976D2 100%)",
                        color: "white",
                        position: "relative",
                        overflow: "hidden",
                      }}
                    >
                      <Box sx={{ position: "absolute", top: -40, right: -40, width: 200, height: 200, borderRadius: "50%", bgcolor: "rgba(255,255,255,0.1)" }} />
                      <Box sx={{ position: "absolute", bottom: -30, left: -20, width: 150, height: 150, borderRadius: "50%", bgcolor: "rgba(255,255,255,0.05)" }} />
                      <Box sx={{ position: "relative", zIndex: 1 }}>
                        <Typography variant="h4" fontWeight={800} gutterBottom>
                          About Docify
                        </Typography>
                        <Typography variant="body1" sx={{ opacity: 0.9, mb: 3 }}>
                          We are committed to providing the best healthcare services to our patients. Our platform connects you with top-rated doctors and specialists.
                        </Typography>
                        <Stack spacing={2}>
                          <Stack direction="row" alignItems="center" spacing={1}>
                            <CheckCircle sx={{ color: "#FFEB3B" }} />
                            <Typography>500+ Verified Doctors</Typography>
                          </Stack>
                          <Stack direction="row" alignItems="center" spacing={1}>
                            <CheckCircle sx={{ color: "#FFEB3B" }} />
                            <Typography>10,000+ Happy Patients</Typography>
                          </Stack>
                          <Stack direction="row" alignItems="center" spacing={1}>
                            <CheckCircle sx={{ color: "#FFEB3B" }} />
                            <Typography>24/7 Emergency Support</Typography>
                          </Stack>
                        </Stack>
                      </Box>
                    </Paper>
                  </Box>
                </motion.div>
              </Grid>

              <Grid item xs={12} md={6}>
                <motion.div variants={slideFromRight} initial="hidden" whileInView="visible" viewport={{ once: true }}>
                  <Box>
                    <Chip label="About Us" color="primary" sx={{ mb: 2, fontWeight: 700 }} />
                    <Typography variant="h3" fontWeight={800} gutterBottom>
                      Better Care for Everyone
                    </Typography>
                    <Typography variant="body1" color="text.secondary" paragraph>
                      Our mission is to make healthcare accessible and convenient for everyone. With our platform, you can:
                    </Typography>
                    <Stack spacing={3}>
                      <Stack direction="row" spacing={2} alignItems="flex-start">
                        <Box sx={{ bgcolor: "#e3f2fd", borderRadius: 2, p: 1.5 }}>
                          <Person sx={{ color: "primary.main" }} />
                        </Box>
                        <Box>
                          <Typography variant="subtitle1" fontWeight={800}>Find the Right Doctor</Typography>
                          <Typography variant="body2" color="text.secondary">Search by specialization, location, and availability.</Typography>
                        </Box>
                      </Stack>
                      <Stack direction="row" spacing={2} alignItems="flex-start">
                        <Box sx={{ bgcolor: "#fff3e0", borderRadius: 2, p: 1.5 }}>
                          <Schedule sx={{ color: "#FF6F00" }} />
                        </Box>
                        <Box>
                          <Typography variant="subtitle1" fontWeight={800}>Book Instantly</Typography>
                          <Typography variant="body2" color="text.secondary">Schedule appointments in real-time with instant confirmation.</Typography>
                        </Box>
                      </Stack>
                      <Stack direction="row" spacing={2} alignItems="flex-start">
                        <Box sx={{ bgcolor: "#e8f5e9", borderRadius: 2, p: 1.5 }}>
                          <HealthAndSafety sx={{ color: "#4CAF50" }} />
                        </Box>
                        <Box>
                          <Typography variant="subtitle1" fontWeight={800}>Get Quality Care</Typography>
                          <Typography variant="body2" color="text.secondary">Receive treatment from verified and experienced medical professionals.</Typography>
                        </Box>
                      </Stack>
                    </Stack>
                    <Button
                      variant="contained"
                      color="primary"
                      endIcon={<ArrowForward />}
                      onClick={handleGetStarted}
                      sx={{ mt: 4, borderRadius: 3, px: 4, py: 1.5, fontWeight: 700, textTransform: "none" }}
                    >
                      Get Started Today
                    </Button>
                  </Box>
                </motion.div>
              </Grid>
            </Grid>
          </Container>
        </Box>

        {/* ========== TESTIMONIALS SECTION ========== */}
        <Box sx={{ width: "100%", py: { xs: 6, md: 10 }, backgroundColor: "#f8f9fa" }}>
          <Container maxWidth="lg">
            <motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true }}>
              <motion.div variants={fadeUp} sx={{ textAlign: "center", mb: 6 }}>
                <Chip label="Testimonials" color="secondary" sx={{ mb: 2, fontWeight: 700 }} />
                <Typography variant="h3" component="h2" gutterBottom sx={{ fontWeight: 800 }}>
                  What Our Patients Say
                </Typography>
                <Typography variant="subtitle1" color="text.secondary">
                  Real stories from real patients
                </Typography>
              </motion.div>

              <Grid container spacing={4}>
                {[
                  {
                    name: "Arshil Patel",
                    review: "The doctors here are amazing! I got my appointment scheduled within minutes and the consultation was excellent.",
                    rating: 5,
                    avatarColor: "#0D47A1",
                  },
                  {
                    name: "Jay Patel",
                    review: "The online consultation is a lifesaver! I could consult with a specialist from the comfort of my home.",
                    rating: 5,
                    avatarColor: "#FF6F00",
                  },
                  {
                    name: "Harshad Patel",
                    review: "Highly recommended for emergency care. The staff was professional and the doctors were extremely helpful.",
                    rating: 4,
                    avatarColor: "#4CAF50",
                  },
                ].map((testimonial, index) => (
                  <Grid item xs={12} sm={6} md={4} key={index}>
                    <motion.div
                      variants={fadeUp}
                      whileHover={{ y: -10 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <Card sx={{ height: "100%", borderRadius: 4, boxShadow: "0 8px 30px rgba(0,0,0,0.1)", "&:hover": { boxShadow: "0 16px 48px rgba(0,0,0,0.15)" } }}>
                        <CardContent sx={{ p: 4 }}>
                          <Stack direction="row" spacing={0.5} sx={{ mb: 2 }}>
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} sx={{ color: i < testimonial.rating ? "#FFEB3B" : "#e0e0e0", fontSize: 20 }} />
                            ))}
                          </Stack>
                          <Typography variant="body1" color="text.secondary" paragraph>
                            "{testimonial.review}"
                          </Typography>
                          <Divider sx={{ my: 2 }} />
                          <Stack direction="row" alignItems="center" spacing={2}>
                            <Avatar
                              sx={{
                                bgcolor: testimonial.avatarColor,
                                width: 56,
                                height: 56,
                                fontSize: 22,
                                fontWeight: 800,
                              }}
                            >
                              {testimonial.name.charAt(0)}
                            </Avatar>
                            <Box>
                              <Typography variant="subtitle1" fontWeight={800}>
                                {testimonial.name}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                Verified Patient
                              </Typography>
                            </Box>
                          </Stack>
                        </CardContent>
                      </Card>
                    </motion.div>
                  </Grid>
                ))}
              </Grid>
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
                Ready to Take Control of Your Health?
              </Typography>
              <Typography variant="h6" color="rgba(255,255,255,0.9)" sx={{ mb: 4, maxWidth: 600, mx: "auto" }}>
                Join thousands of satisfied patients who trust Docify for their healthcare needs.
              </Typography>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={2} justifyContent="center">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    variant="contained"
                    color="secondary"
                    size="large"
                    onClick={handleBookAppointment}
                    startIcon={<CalendarToday />}
                    sx={{ px: 5, py: 2, fontWeight: 800, fontSize: "1.1rem", borderRadius: 3, textTransform: "none" }}
                  >
                    Book Appointment
                  </Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    variant="outlined"
                    size="large"
                    onClick={handleFindDoctors}
                    startIcon={<SearchRounded />}
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
                    Docify
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
                    { label: "Book Appointment", path: "/patientappoinment" },
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
                    <Typography variant="body2">support@Docify.com</Typography>
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
                © 2024 Docify. All rights reserved.
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

export default Home;