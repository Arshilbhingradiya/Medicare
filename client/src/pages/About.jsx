import { Container, Typography, Grid, Button, Paper, Box, Avatar } from "@mui/material";
import { Link } from "react-router-dom";
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

const About = () => {
  const { user } = useAuth();
  const normalizedRole = user?.role?.toLowerCase();
  const isAdmin = normalizedRole === "admin" || user?.isAdmin;

  return (
    <Box>
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <Box
          sx={{
            textAlign: "center",
            py: 10,
            bgcolor: "#0D47A1",
            color: "white",
            position: "relative",
            overflow: "hidden",
            background: "linear-gradient(135deg, #0A3D8F 0%, #1976d2 60%, #42a5f5 100%)",
          }}
        >
          {[
            { color: "rgba(255,255,255,0.08)", top: "-5%", left: "10%", size: 200 },
            { color: "rgba(255,235,59,0.12)", top: "70%", left: "80%", size: 240 },
          ].map((blob, i) => (
            <motion.div
              key={i}
              animate={{ y: [0, -25, 0], rotate: [0, 15, 0] }}
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
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            style={{ position: "relative", zIndex: 1 }}
          >
            <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 800 }}>
              About Us
            </Typography>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            style={{ position: "relative", zIndex: 1 }}
          >
            <Typography variant="h6" sx={{ maxWidth: "800px", mx: "auto", px: 2 }}>
              Our mission is to provide a seamless and efficient platform for
              patients to book appointments with top healthcare professionals.
              Revolutionizing healthcare through accessibility and innovation.
            </Typography>
          </motion.div>
        </Box>
      </motion.div>

      <Container maxWidth="lg" sx={{ py: 8 }}>
        {/* Team Section */}
        <Box textAlign="center" py={6}>
          <motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <motion.div variants={fadeUp}>
              <Typography variant="h4" component="h2" gutterBottom sx={{ fontWeight: 700 }}>
                Meet Our Team
              </Typography>
            </motion.div>
            <Grid container spacing={4} justifyContent="center">
              {[
                { name: "Arshil Patel", role: "CEO", desc: "Over 10 years of experience in healthcare management." },
                { name: "Jay Patel", role: "CTO", desc: "Passionate about leveraging technology to improve healthcare." },
                { name: "Harshad Patel", role: "Lead Developer", desc: "Ensuring the platform is user-friendly and reliable." },
              ].map((member, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <motion.div
                    variants={fadeUp}
                    whileHover={{ y: -8 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <Paper elevation={3} sx={{ p: 4, textAlign: "center", borderRadius: 4 }}>
                      <Avatar
                        alt={member.name}
                        sx={{
                          width: 100,
                          height: 100,
                          mx: "auto",
                          mb: 2,
                          bgcolor: "#0D47A1",
                          fontSize: 36,
                          fontWeight: 700,
                        }}
                      >
                        {member.name.charAt(0)}
                      </Avatar>
                      <Typography variant="h6">{member.name}</Typography>
                      <Typography variant="body1" sx={{ fontWeight: "bold", color: "primary.main" }}>
                        {member.role}
                      </Typography>
                      <Typography variant="body2" sx={{ mt: 1, color: "text.secondary" }}>
                        {member.desc}
                      </Typography>
                    </Paper>
                  </motion.div>
                </Grid>
              ))}
            </Grid>
          </motion.div>
        </Box>

        {/* Achievements Section */}
        <Box sx={{ textAlign: "center", py: 8, bgcolor: "#f0f4f8", borderRadius: 4 }}>
          <motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <motion.div variants={fadeUp}>
              <Typography variant="h4" component="h2" gutterBottom sx={{ fontWeight: 700 }}>
                Our Achievements
              </Typography>
            </motion.div>
            <Grid container spacing={4} justifyContent="center">
              {[
                { title: "10,000+ Patients", desc: "We have served over 10,000 patients since our inception." },
                { title: "50+ Doctors", desc: "Our network includes over 50 highly qualified doctors." },
                { title: "24/7 Support", desc: "We provide round-the-clock support for our patients." },
              ].map((achievement, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <motion.div
                    variants={fadeUp}
                    whileHover={{ y: -8 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <Paper elevation={3} sx={{ p: 4, textAlign: "center", borderRadius: 4 }}>
                      <Typography variant="h6" sx={{ color: "primary.main", fontWeight: 700 }}>
                        {achievement.title}
                      </Typography>
                      <Typography variant="body1" color="text.secondary">
                        {achievement.desc}
                      </Typography>
                    </Paper>
                  </motion.div>
                </Grid>
              ))}
            </Grid>
          </motion.div>
        </Box>

{/* Call-to-Action Section */}
        {!isAdmin && (
          <Box textAlign="center" py={6}>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <Typography variant="h4" gutterBottom sx={{ fontWeight: 700 }}>
                Ready to Book Your Appointment?
              </Typography>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant="contained"
                  color="primary"
                  size="large"
                  component={Link}
                  to="/book-appointment"
                  sx={{ px: 4, py: 1.5, fontWeight: 700 }}
                >
                  Book Now
                </Button>
              </motion.div>
            </motion.div>
          </Box>
        )}
      </Container>

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

export default About;
