import { useAuth } from "../store/auth";
import { Link } from "react-router-dom";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../config";
import {
  Container,
  Typography,
  TextField,
  Button,
  Grid,
  Box,
  Paper,
  Divider,
} from "@mui/material";
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import SendIcon from '@mui/icons-material/Send';

const Contact = () => {
  const [contact, setcontact] = useState({
    username: "",
    email: "",
    message: "",
  });
  
  const navigate = useNavigate();
  const [userData, setuserData] = useState(true);
  const { user } = useAuth();

  if (userData && user) {
    setcontact({
      username: user.username,
      email: user.email,
      message: "",
    });
    setuserData(false);
  }

  const handleInput = (e) => {
    const name = e.target.name;
    const value = e.target.value;
    setcontact({ ...contact, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_URL}/api/form/contact`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(contact),
      });

      if (response.ok) {
        setcontact({
          username: "",
          email: "",
          message: "",
        });
        navigate("/contact");
        alert("Form Submitted Successfully");
      }
    } catch (error) {
      alert("Error in submitting the form");
      console.log("contact ", error);
    }
  };

  return (
    <Box sx={{ bgcolor: "#f4f6f8", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Container sx={{ flexGrow: 1, py: 8 }}>
        {/* Header Section */}
        <Box sx={{ textAlign: "center", mb: 6 }}>
          <Typography variant="h3" component="h1" fontWeight="bold" color="primary" gutterBottom>
            Get in Touch
          </Typography>
          <Typography variant="h6" color="textSecondary" sx={{ maxWidth: "600px", mx: "auto" }}>
            We'd love to hear from you. Please fill out this form or shoot us an email.
          </Typography>
        </Box>

        {/* Main Content Area */}
        <Paper elevation={4} sx={{ borderRadius: 4, overflow: "hidden" }}>
          <Grid container>
            {/* Contact Information Side Panel */}
            <Grid 
              item 
              xs={12} 
              md={5} 
              sx={{ 
                bgcolor: "primary.main", 
                color: "white", 
                p: { xs: 4, md: 6 },
                display: "flex",
                flexDirection: "column",
                justifyContent: "center"
              }}
            >
              <Typography variant="h4" fontWeight="bold" gutterBottom>
                Contact Information
              </Typography>
              <Typography variant="body1" sx={{ mb: 4, opacity: 0.9 }}>
                Fill up the form and our Team will get back to you within 24 hours.
              </Typography>

              <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                <PhoneIcon sx={{ mr: 2, fontSize: 28 }} />
                <Typography variant="h6" fontSize="1.1rem">+1 234 567 890</Typography>
              </Box>

              <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                <EmailIcon sx={{ mr: 2, fontSize: 28 }} />
                <Typography variant="h6" fontSize="1.1rem">support@docify.com</Typography>
              </Box>

              <Box sx={{ display: "flex", alignItems: "center" }}>
                <LocationOnIcon sx={{ mr: 2, fontSize: 32 }} />
                <Typography variant="h6" fontSize="1.1rem">
                  123 Healthcare St,<br />
                  New York, NY 10001
                </Typography>
              </Box>
            </Grid>

            {/* Contact Form Section */}
            <Grid item xs={12} md={7} sx={{ p: { xs: 4, md: 6 }, bgcolor: "white" }}>
              <form onSubmit={handleSubmit}>
                <Typography variant="h5" fontWeight="bold" color="textPrimary" sx={{ mb: 4 }}>
                  Send us a Message
                </Typography>

                <TextField
                  fullWidth
                  label="Your Username"
                  type="text"
                  name="username"
                  variant="outlined"
                  value={contact.username}
                  onChange={handleInput}
                  required
                  sx={{ mb: 3 }}
                />

                <TextField
                  fullWidth
                  label="Email Address"
                  type="email"
                  name="email"
                  variant="outlined"
                  value={contact.email}
                  onChange={handleInput}
                  required
                  sx={{ mb: 3 }}
                />

                <TextField
                  fullWidth
                  label="Message"
                  name="message"
                  variant="outlined"
                  multiline
                  rows={4}
                  value={contact.message}
                  onChange={handleInput}
                  required
                  sx={{ mb: 4 }}
                />

                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  size="large"
                  endIcon={<SendIcon />}
                  sx={{ 
                    py: 1.5, 
                    px: 4, 
                    borderRadius: 2,
                    fontSize: "1.1rem",
                    textTransform: "none",
                    boxShadow: 3
                  }}
                >
                  Send Message
                </Button>
              </form>
            </Grid>
          </Grid>
        </Paper>
      </Container>

      {/* Footer Section */}
      <Box sx={{ bgcolor: "#0a192f", color: "white", py: 6, mt: "auto" }}>
        <Container maxWidth="lg">
          <Grid container spacing={4} justifyContent="space-between">
            <Grid item xs={12} md={4}>
              <Typography variant="h5" fontWeight="bold" gutterBottom color="primary.light">
                MediCare
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.7, lineHeight: 1.8 }}>
                Your trusted healthcare partner, providing seamless medical
                appointments and expert care when you need it most.
              </Typography>
            </Grid>

            <Grid item xs={12} md={4}>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Quick Links
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                <Link to="/" style={{ color: "#a9b3c1", textDecoration: "none", transition: "0.3s" }}>
                  Home
                </Link>
                <Link to="/find" style={{ color: "#a9b3c1", textDecoration: "none", transition: "0.3s" }}>
                  Find Doctors
                </Link>
                <Link to="/about" style={{ color: "#a9b3c1", textDecoration: "none", transition: "0.3s" }}>
                  About Us
                </Link>
                <Link to="/contact" style={{ color: "white", textDecoration: "none", fontWeight: "bold" }}>
                  Contact
                </Link>
              </Box>
            </Grid>

            <Grid item xs={12} md={4}>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Reach Us
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5, opacity: 0.8 }}>
                <Typography variant="body2" sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <LocationOnIcon fontSize="small" /> 123 Health St, New York, NY
                </Typography>
                <Typography variant="body2" sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <PhoneIcon fontSize="small" /> +1 800 123 4567
                </Typography>
                <Typography variant="body2" sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <EmailIcon fontSize="small" /> support@docify.com
                </Typography>
              </Box>
            </Grid>
          </Grid>
          
          <Divider sx={{ my: 4, borderColor: "rgba(255,255,255,0.1)" }} />
          
          <Typography variant="body2" align="center" sx={{ opacity: 0.6 }}>
            © {new Date().getFullYear()} Docify. All rights reserved.
          </Typography>
        </Container>
      </Box>
    </Box>
  );
};

export default Contact;