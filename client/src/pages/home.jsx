import { Box, Typography, Button, Container, Grid, Paper, Avatar } from "@mui/material";
import { CalendarToday, LocalHospital, People, Verified, Speed } from "@mui/icons-material";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../store/auth";
import { motion } from "framer-motion";

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0 },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15 } },
};

const Home = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const normalizedRole = user?.role?.toLowerCase();
  const isAdmin = normalizedRole === "admin" || user?.isAdmin;

  const handleBookAppointment = () => {
    navigate("/patientappoinment");
  };

  return (
    <Box sx={{ width: "100%", overflowX: "hidden" }}>
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <Box
          sx={{
            width: "100%",
            minHeight: "80vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            color: "#fff",
            position: "relative",
            overflow: "hidden",
            backgroundImage:
              "linear-gradient(135deg, #0A3D8F 0%, #1976d2 55%, #42a5f5 100%)",
          }}
        >
          {/* Animated floating blobs */}
          {[
            { color: "rgba(255,255,255,0.08)", top: "10%", left: "8%", size: 220 },
            { color: "rgba(255,235,59,0.12)", top: "65%", left: "80%", size: 260 },
            { color: "rgba(255,255,255,0.06)", top: "15%", left: "70%", size: 160 },
          ].map((blob, i) => (
            <motion.div
              key={i}
              animate={{ y: [0, -30, 0], rotate: [0, 20, 0] }}
              transition={{ duration: 6 + i, repeat: Infinity, ease: "easeInOut" }}
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

          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            style={{ zIndex: 1, position: "relative" }}
          >
            <Typography
              variant="h2"
              component="h1"
              gutterBottom
              sx={{ fontWeight: 800, px: 2, letterSpacing: 1 }}
            >
              Your Health, Our Priority
            </Typography>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            style={{ zIndex: 1, position: "relative" }}
          >
            <Typography variant="h5" component="h2" gutterBottom sx={{ px: 2, maxWidth: 700, mx: "auto" }}>
              Book your appointment with the best doctors in town.
            </Typography>
          </motion.div>
          {!isAdmin && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              style={{ zIndex: 1, position: "relative" }}
            >
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant="contained"
                  color="secondary"
                  size="large"
                  onClick={handleBookAppointment}
                  sx={{ mt: 3, px: 4, py: 1.5, fontWeight: 700, boxShadow: "0 10px 30px rgba(255,111,0,0.4)" }}
                >
                  Book an Appointment
                </Button>
              </motion.div>
            </motion.div>
          )}
        </Box>
      </motion.div>

      {/* Services Section */}
      <Box sx={{ width: "100%", textAlign: "center", py: 8, backgroundColor: "#f8f9fa" }}>
        <motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true }}>
          <motion.div variants={fadeUp}>
            <Typography variant="h4" component="h2" gutterBottom sx={{ fontWeight: 700 }}>
              Our Services
            </Typography>
          </motion.div>
          <Grid container spacing={4} justifyContent="center">
            {[
              {
                icon: <LocalHospital fontSize="large" color="primary" />,
                title: "General Checkup",
                desc: "Comprehensive health checkups.",
              },
              {
                icon: <CalendarToday fontSize="large" color="primary" />,
                title: "Online Booking",
                desc: "Book Appointment online.",
              },
              {
                icon: <People fontSize="large" color="primary" />,
                title: "Get Reminder",
                desc: "Get reminder via sms/email.",
              },
            ].map((service, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <motion.div
                  variants={fadeUp}
                  whileHover={{ y: -8 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Paper
                    elevation={3}
                    sx={{
                      p: 4,
                      textAlign: "center",
                      transition: "0.3s",
                      borderRadius: 4,
                      "&:hover": { boxShadow: "0 12px 32px rgba(13,71,161,0.2)" },
                    }}
                  >
                    {service.icon}
                    <Typography variant="h6" component="h3" sx={{ mt: 2 }}>
                      {service.title}
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      {service.desc}
                    </Typography>
                  </Paper>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </motion.div>
      </Box>

      {/* Testimonials Section */}
      <Box sx={{ width: "100%", textAlign: "center", py: 8, backgroundColor: "#e9ecef" }}>
        <motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true }}>
          <motion.div variants={fadeUp}>
            <Typography variant="h4" component="h2" gutterBottom sx={{ fontWeight: 700 }}>
              What Our Patients Say
            </Typography>
          </motion.div>
          <Grid container spacing={4} justifyContent="center">
            {[
              { name: "Arshil Patel", review: "The doctors here are amazing!" },
              { name: "Jay Patel", review: "The online consultation is a lifesaver!" },
              { name: "Harshad Patel", review: "Highly recommended for emergency care." },
            ].map((testimonial, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <motion.div
                  variants={fadeUp}
                  whileHover={{ y: -8 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Paper elevation={3} sx={{ p: 4, textAlign: "center", borderRadius: 4 }}>
                    <Avatar
                      alt={testimonial.name}
                      sx={{
                        width: 80,
                        height: 80,
                        mx: "auto",
                        bgcolor: "#0D47A1",
                        fontSize: 30,
                        fontWeight: 700,
                      }}
                    >
                      {testimonial.name.charAt(0)}
                    </Avatar>
                    <Typography variant="h6" component="h3" sx={{ mt: 2 }}>
                      {testimonial.name}
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      {testimonial.review}
                    </Typography>
                  </Paper>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </motion.div>
      </Box>

      {/* Blog/News Section */}
      <Box sx={{ width: "100%", textAlign: "center", py: 8, backgroundColor: "#f8f9fa" }}>
        <motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true }}>
          <motion.div variants={fadeUp}>
            <Typography variant="h4" component="h2" gutterBottom sx={{ fontWeight: 700 }}>
              Latest News
            </Typography>
          </motion.div>
          <Grid container spacing={4} justifyContent="center">
            {[
              { title: "New COVID-19 Guidelines", desc: "Stay updated with the latest health guidelines." },
              { title: "Healthy Living Tips", desc: "Learn how to maintain a healthy lifestyle." },
              { title: "Telemedicine Benefits", desc: "Discover the advantages of online consultations." },
            ].map((news, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <motion.div
                  variants={fadeUp}
                  whileHover={{ y: -8 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Paper elevation={3} sx={{ p: 4, textAlign: "center", borderRadius: 4 }}>
                    <Typography variant="h6" component="h3" sx={{ mt: 2 }}>
                      {news.title}
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      {news.desc}
                    </Typography>
                  </Paper>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </motion.div>
      </Box>

      {/* Footer */}
      <Box sx={{ bgcolor: "#0D47A1", color: "white", py: 4, mt: 8 }}>
        <Container maxWidth="lg">
          <Grid container spacing={4} justifyContent="space-between">
            <Grid item xs={12} md={4}>
              <Typography variant="h6" gutterBottom>
                MediCare
              </Typography>
              <Typography variant="body2">
                Your trusted healthcare partner, providing seamless medical
                appointments.
              </Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="h6" gutterBottom>
                Quick Links
              </Typography>
              <Typography variant="body2">
                <Link to="/" style={{ color: "white", textDecoration: "none" }}>
                  Home
                </Link>
              </Typography>
              <Typography variant="body2">
                <Link to="/doctorsearch" style={{ color: "white", textDecoration: "none" }}>
                  Find Doctors
                </Link>
              </Typography>
              <Typography variant="body2">
                <Link to="/about" style={{ color: "white", textDecoration: "none" }}>
                  About Us
                </Link>
              </Typography>
              <Typography variant="body2">
                <Link to="/contact" style={{ color: "white", textDecoration: "none" }}>
                  Contact
                </Link>
              </Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="h6" gutterBottom>
                Contact Us
              </Typography>
              <Typography variant="body2">📍 123 Health St, New York, NY</Typography>
              <Typography variant="body2">📞 +1 800 123 4567</Typography>
              <Typography variant="body2">✉ support@medicare.com</Typography>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </Box>
  );
};

export default Home;
