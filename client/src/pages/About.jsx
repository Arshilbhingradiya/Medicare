import {
  Container,
  Typography,
  Grid,
  Button,
  Paper,
  Box,
  Avatar,
} from "@mui/material";
import { Link } from "react-router-dom";

const About = () => {
  return (
    <Box>
      {/* Hero Section */}
      <Box
        sx={{
          textAlign: "center",
          py: 10,
          bgcolor: "#C8E6C9",
          color: "black",
          Height: "70%",
        }}
      >
        <Typography variant="h3" component="h1" gutterBottom>
          About Us
        </Typography>
        <Typography variant="h6" sx={{ maxWidth: "800px", mx: "auto" }}>
          Our mission is to provide a seamless and efficient platform for
          patients to book appointments with top healthcare professionals.
          Revolutionizing healthcare through accessibility and innovation.
        </Typography>
      </Box>

      <Container maxWidth="lg" sx={{ py: 8 }}>
        {/* Team Section */}
        <Box textAlign="center" py={6}>
          <Typography variant="h4" component="h2" gutterBottom>
            Meet Our Team
          </Typography>
          <Grid container spacing={4} justifyContent="center">
            {[
              {
                name: "Arshil patel",
                role: "CEO",
                img: "/john-doe.jpg",
                desc: "Over 10 years of experience in healthcare management.",
              },
              {
                name: "Jay Patel",
                role: "CTO",
                img: "/jane-smith.jpg",
                desc: "Passionate about leveraging technology to improve healthcare.",
              },
              {
                name: "Harshad Patel",
                role: "Lead Developer",
                img: "/alice-johnson.jpg",
                desc: "Ensuring the platform is user-friendly and reliable.",
              },
            ].map((member, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Paper elevation={3} sx={{ p: 4, textAlign: "center" }}>
                  <Avatar
                    alt={member.name}
                    src={member.img}
                    sx={{ width: 100, height: 100, mx: "auto", mb: 2 }}
                  />
                  <Typography variant="h6">{member.name}</Typography>
                  <Typography variant="body1" sx={{ fontWeight: "bold" }}>
                    {member.role}
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    {member.desc}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Achievements Section */}
        <Box sx={{ textAlign: "center", py: 8, bgcolor: "#f0f4f8" }}>
          <Typography variant="h4" component="h2" gutterBottom>
            Our Achievements
          </Typography>
          <Grid container spacing={4} justifyContent="center">
            {[
              {
                title: "10,000+ Patients",
                desc: "We have served over 10,000 patients since our inception.",
              },
              {
                title: "50+ Doctors",
                desc: "Our network includes over 50 highly qualified doctors.",
              },
              {
                title: "24/7 Support",
                desc: "We provide round-the-clock support for our patients.",
              },
            ].map((achievement, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Paper elevation={3} sx={{ p: 4, textAlign: "center" }}>
                  <Typography variant="h6">{achievement.title}</Typography>
                  <Typography variant="body1">{achievement.desc}</Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Call-to-Action Section */}
        <Box textAlign="center" py={6}>
          <Typography variant="h4" gutterBottom>
            Ready to Book Your Appointment?
          </Typography>
          <Button
            variant="contained"
            color="primary"
            size="large"
            component={Link}
            to="/book-appointment"
          >
            Book Now
          </Button>
        </Box>
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
                <Link
                  to="/find"
                  style={{ color: "white", textDecoration: "none" }}
                >
                  Find Doctors
                </Link>
              </Typography>
              <Typography variant="body2">
                <Link
                  to="/about"
                  style={{ color: "white", textDecoration: "none" }}
                >
                  About Us
                </Link>
              </Typography>
              <Typography variant="body2">
                <Link
                  to="/contact"
                  style={{ color: "white", textDecoration: "none" }}
                >
                  Contact
                </Link>
              </Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="h6" gutterBottom>
                Contact Us
              </Typography>
              <Typography variant="body2">
                📍 123 Health St, New York, NY
              </Typography>
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
