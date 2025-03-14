import {
  Box,
  Typography,
  Button,
  Container,
  Grid,
  Paper,
  Avatar,
} from "@mui/material";
import { CalendarToday, LocalHospital, People } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
const Home = () => {
  const navigate = useNavigate();

  const handleBookAppointment = () => {
    navigate("/patientappoinment");
  };

  return (
    <Box sx={{ width: "100vw", overflowX: "hidden" }}>
      {" "}
      {/* Full Page Width */}
      {/* Hero Section */}
      <Box
        sx={{
          width: "100vw",
          minHeight: "80vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          // backgroundImage: "url(/public/img/home.jpeg)", // New High-Quality Image
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          color: "#fff",
          position: "relative",
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "90%",
            backgroundColor: "rgba(57, 50, 50, 0.4)", // Slightly lighter overlay for a clearer image
          },
        }}
      >
        <Typography variant="h2" component="h1" gutterBottom sx={{ zIndex: 1 }}>
          Your Health, Our Priority
        </Typography>
        <Typography variant="h5" component="h2" gutterBottom sx={{ zIndex: 1 }}>
          Book your appointment with the best doctors in town.
        </Typography>
        <Button
          variant="contained"
          color="primary"
          size="large"
          onClick={handleBookAppointment}
          sx={{ mt: 3, zIndex: 1 }}
        >
          Book an Appointment
        </Button>
      </Box>
      {/* Services Section */}
      <Box
        sx={{
          width: "100%",
          textAlign: "center",
          py: 8,
          backgroundColor: "#f8f9fa",
        }}
      >
        <Typography variant="h4" component="h2" gutterBottom>
          Our Services
        </Typography>
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
              desc: "Book Appoinment online.",
            },
            {
              icon: <People fontSize="large" color="primary" />,
              title: "Get Reminder",
              desc: "Get reminder via sms/email.",
            },
          ].map((service, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Paper
                elevation={3}
                sx={{
                  p: 4,
                  textAlign: "center",
                  transition: "0.3s",
                  "&:hover": { transform: "scale(1.05)" },
                }}
              >
                {service.icon}
                <Typography variant="h6" component="h3" sx={{ mt: 2 }}>
                  {service.title}
                </Typography>
                <Typography variant="body1">{service.desc}</Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Box>
      {/* Testimonials Section */}
      <Box
        sx={{
          width: "100%",
          textAlign: "center",
          py: 8,
          backgroundColor: "#e9ecef",
        }}
      >
        <Typography variant="h4" component="h2" gutterBottom>
          What Our Patients Say
        </Typography>
        <Grid container spacing={4} justifyContent="center">
          {[
            {
              img: "/john-doe.jpg",
              name: "Arshil patel",
              review: "The doctors here are amazing!",
            },
            {
              img: "/jane-smith.jpg",
              name: "Jay Patel",
              review: "The online consultation is a lifesaver!",
            },
            {
              img: "/alice-johnson.jpg",
              name: "Harshad Patel",
              review: "Highly recommended for emergency care.",
            },
          ].map((testimonial, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Paper elevation={3} sx={{ p: 4, textAlign: "center" }}>
                <Avatar
                  alt={testimonial.name}
                  src={testimonial.img}
                  sx={{ width: 80, height: 80, mx: "auto" }}
                />
                <Typography variant="h6" component="h3" sx={{ mt: 2 }}>
                  {testimonial.name}
                </Typography>
                <Typography variant="body1">{testimonial.review}</Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Box>
      {/* Blog/News Section */}
      <Box
        sx={{
          width: "100%",
          textAlign: "center",
          py: 8,
          backgroundColor: "#f8f9fa",
        }}
      >
        <Typography variant="h4" component="h2" gutterBottom>
          Latest News
        </Typography>
        <Grid container spacing={4} justifyContent="center">
          {[
            {
              title: "New COVID-19 Guidelines",
              desc: "Stay updated with the latest health guidelines.",
            },
            {
              title: "Healthy Living Tips",
              desc: "Learn how to maintain a healthy lifestyle.",
            },
            {
              title: "Telemedicine Benefits",
              desc: "Discover the advantages of online consultations.",
            },
          ].map((news, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Paper elevation={3} sx={{ p: 4, textAlign: "center" }}>
                <Typography variant="h6" component="h3" sx={{ mt: 2 }}>
                  {news.title}
                </Typography>
                <Typography variant="body1">{news.desc}</Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
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

export default Home;
