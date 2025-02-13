// import React from "react";
import {
  Container,
  Typography,
  Grid,
  Button,
  Paper,
  Box,
  Avatar,
} from "@mui/material";

const About = () => {
  return (
    <Container>
      {/* Mission and Vision Section */}
      <Box sx={{ textAlign: "center", py: 8 }}>
        <Typography variant="h3" component="h1" gutterBottom>
          About Us
        </Typography>
        <Typography variant="body1" sx={{ maxWidth: "800px", mx: "auto" }}>
          Our mission is to provide a seamless and efficient platform for
          patients to book appointments with qualified doctors. We aim to
          revolutionize healthcare by making it accessible and convenient for
          everyone.
        </Typography>
      </Box>

      {/* Team Section */}
      <Box sx={{ textAlign: "center", py: 8 }}>
        <Typography variant="h4" component="h2" gutterBottom>
          Meet Our Team
        </Typography>
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Paper elevation={3} sx={{ p: 3, textAlign: "center" }}>
              <Avatar
                alt="John Doe"
                src="/john-doe.jpg"
                sx={{ width: 100, height: 100, mx: "auto" }}
              />
              <Typography variant="h6" component="h3" sx={{ mt: 2 }}>
                John Doe
              </Typography>
              <Typography variant="body1">CEO</Typography>
              <Typography variant="body2">
                John has over 10 years of experience in healthcare management.
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper elevation={3} sx={{ p: 3, textAlign: "center" }}>
              <Avatar
                alt="Jane Smith"
                src="/jane-smith.jpg"
                sx={{ width: 100, height: 100, mx: "auto" }}
              />
              <Typography variant="h6" component="h3" sx={{ mt: 2 }}>
                Jane Smith
              </Typography>
              <Typography variant="body1">CTO</Typography>
              <Typography variant="body2">
                Jane is passionate about leveraging technology to improve
                healthcare.
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper elevation={3} sx={{ p: 3, textAlign: "center" }}>
              <Avatar
                alt="Alice Johnson"
                src="/alice-johnson.jpg"
                sx={{ width: 100, height: 100, mx: "auto" }}
              />
              <Typography variant="h6" component="h3" sx={{ mt: 2 }}>
                Alice Johnson
              </Typography>
              <Typography variant="body1">Lead Developer</Typography>
              <Typography variant="body2">
                Alice ensures the platform is user-friendly and reliable.
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Box>

      {/* Achievements Section */}
      <Box sx={{ textAlign: "center", py: 8, backgroundColor: "#f0f4f8" }}>
        <Typography variant="h4" component="h2" gutterBottom>
          Our Achievements
        </Typography>
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Paper elevation={3} sx={{ p: 3, textAlign: "center" }}>
              <Typography variant="h6" component="h3" sx={{ mt: 2 }}>
                10,000+ Patients
              </Typography>
              <Typography variant="body1">
                We have served over 10,000 patients since our inception.
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper elevation={3} sx={{ p: 3, textAlign: "center" }}>
              <Typography variant="h6" component="h3" sx={{ mt: 2 }}>
                50+ Doctors
              </Typography>
              <Typography variant="body1">
                Our network includes over 50 highly qualified doctors.
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper elevation={3} sx={{ p: 3, textAlign: "center" }}>
              <Typography variant="h6" component="h3" sx={{ mt: 2 }}>
                24/7 Support
              </Typography>
              <Typography variant="body1">
                We provide round-the-clock support for our patients.
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Box>

      {/* Call-to-Action Section */}
      <Box sx={{ textAlign: "center", py: 8 }}>
        <Typography variant="h4" component="h2" gutterBottom>
          Ready to Book Your Appointment?
        </Typography>
        <Button
          variant="contained"
          color="primary"
          size="large"
          // eslint-disable-next-line no-undef
          onClick={() => navigate("/book-appointment")}
        >
          Book Now
        </Button>
      </Box>
    </Container>
  );
};

export default About;
