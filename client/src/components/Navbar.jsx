// import React from "react";
// // import Link from "react-link";
// import {
//   AppBar,
//   Toolbar,
//   Typography,
//   Button,
//   IconButton,
//   Menu,
//   MenuItem,
//   TextField,
//   InputAdornment,
// } from "@mui/material";
// import {
//   Search,
//   AccountCircle,
//   Notifications,
//   Menu as MenuIcon,
// } from "@mui/icons-material";

// const Navbar = () => {
//   const [anchorEl, setAnchorEl] = React.useState(null);

//   const handleProfileMenuOpen = (event) => {
//     setAnchorEl(event.currentTarget);
//   };

//   const handleMenuClose = () => {
//     setAnchorEl(null);
//   };

//   return (
//     <AppBar position="sticky" sx={{ backgroundColor: "#fff", color: "#333" }}>
//       <Toolbar>
//         {/* Logo */}
//         <Typography variant="h6" sx={{ flexGrow: 1 }}>
//           <img src="/logo.png" alt="Logo" style={{ height: "40px" }} />
//         </Typography>

//         {/* Search Bar */}
//         <TextField
//           variant="outlined"
//           size="small"
//           placeholder="Search doctors, specialties..."
//           InputProps={{
//             startAdornment: (
//               <InputAdornment position="start">
//                 <Search />
//               </InputAdornment>
//             ),
//           }}
//           sx={{ mx: 2, width: "300px" }}
//         />

//         {/* Navigation Links */}
//         <Button color="inherit">Home</Button>
//         <Button color="inherit">Find Doctors</Button>
//         <Button color="inherit">Services</Button>
//         <Button color="inherit">About</Button>

//         {/* Emergency Hotline */}
//         <Typography variant="body2" sx={{ mx: 2, color: "red" }}>
//           Emergency: +1 800 123 4567
//         </Typography>

//         {/* Book Appointment CTA */}
//         <Button variant="contained" color="primary" sx={{ mx: 2 }}>
//           Book Appointment
//         </Button>

//         {/* Notifications */}
//         <IconButton color="inherit">
//           <Notifications />
//         </IconButton>

//         {/* Profile Dropdown */}
//         <IconButton color="inherit" onClick={handleProfileMenuOpen}>
//           <AccountCircle />
//         </IconButton>
//         <Menu
//           anchorEl={anchorEl}
//           open={Boolean(anchorEl)}
//           onClose={handleMenuClose}
//         >
//           <MenuItem onClick={handleMenuClose}>My Appointments</MenuItem>
//           <MenuItem onClick={handleMenuClose}>Profile</MenuItem>
//           <MenuItem onClick={handleMenuClose}>Logout</MenuItem>
//         </Menu>

//         {/* Mobile Menu */}
//         <IconButton
//           color="inherit"
//           sx={{ display: { xs: "block", md: "none" } }}
//         >
//           <MenuIcon />
//         </IconButton>
//       </Toolbar>
//     </AppBar>
//   );
// };

import { useAuth } from "../store/auth";
import { useState } from "react";
import { Link } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Menu,
  MenuItem,
  TextField,
  InputAdornment,
  Box,
  createTheme,
  ThemeProvider,
} from "@mui/material";
import {
  Search,
  AccountCircle,
  Notifications,
  Menu as MenuIcon,
  Brightness4,
  Brightness7,
  Login as LoginIcon,
  HowToReg as SignupIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

const Navbar = () => {
  const { isLoggedIn, user } = useAuth();
  const [anchorEl, setAnchorEl] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const navigate = useNavigate();

  // Theme configuration with updated colors
  const theme = createTheme({
    palette: {
      mode: darkMode ? "dark" : "light",
      primary: {
        main: "#0D47A1", // Deep Blue
      },
      secondary: {
        main: "#FF6F00", // Vibrant Orange
      },
      text: {
        primary: darkMode ? "#ffffff" : "#0D47A1",
      },
    },
  });

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handledashboard = () => {
    setAnchorEl(null);
    if (user?.role === "Doctor") {
      navigate("/doctordashboard");
    } else if (user?.role === "Patient") {
      navigate("/patientdashboard");
    }
  };
  const handleappoinment = () => {
    setAnchorEl(null);
    if (user?.role === "Patient") {
      navigate("/patientappoinment");
    } else if (user?.role === "Doctor") {
      navigate("/doctorappoinment");
    }
  };
  const handleprofile = () => {
    setAnchorEl(null);
    if (user?.role === "Doctor") {
      navigate("/doctorprofile");
    } else if (user?.role === "Patient") {
      navigate("/patientprofile");
    }
  };
  const handlepatientrecords = () => {
    setAnchorEl(null);
    navigate("/patientrecords");
  };
  // const handledoctorsettings = () => {};
  const handleThemeToggle = () => {
    setDarkMode(!darkMode);
  };

  const handleLogin = () => {
    navigate("/login");
  };

  const handleSignup = () => {
    navigate("/signup");
  };

  const handleLogout = () => {
    navigate("/logout");
  };
  const handlesearch = () => {
    navigate("/doctorsearch");
  };
  const handleAppointmentCTA = () => {
    if (user.role == "patient") {
      navigate("/patientappoinment");
    }
  };
  const handlemedicare = () => {
    navigate("/");
  };

  return (
    <ThemeProvider theme={theme}>
      <AppBar position="sticky" sx={{ bgcolor: theme.palette.primary.main }}>
        <Toolbar>
          {/* Logo */}
          <Typography
            type="button"
            variant="h6"
            onClick={handlemedicare}
            sx={{ flexGrow: 1, marginLeft: "50px", color: "#FFF" }}
          >
            MediCare
          </Typography>

          {/* Search Bar */}
          <TextField
            variant="outlined"
            size="small"
            placeholder="Search doctors, specialties..."
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
            sx={{
              mx: 2,
              width: "300px",
              bgcolor: "#FFF",
              borderRadius: "5px",
            }}
          />

          {/* Navigation Links */}
          <Button sx={{ color: "#FFF" }}>
            <Link to="/" className="nav-link text-white">
              Home
            </Link>
          </Button>
          <Button sx={{ color: "#FFF" }}>
            <Link to="/find" className="nav-link text-white">
              Find Doctors
            </Link>
          </Button>
          <Button sx={{ color: "#FFF" }}>
            <Link to="/about" className="nav-link text-white">
              About
            </Link>
          </Button>
          <Button sx={{ color: "#FFF" }}>
            <Link to="/contact" className="nav-link text-white">
              Contact
            </Link>
          </Button>

          {/* Emergency Hotline */}
          <Typography variant="body2" sx={{ mx: 2, color: "#FF0000" }}>
            Emergency: +1 800 123 4567
          </Typography>

          {/* Book Appointment CTA */}
          <Button
            variant="contained"
            onClick={handleAppointmentCTA}
            sx={{
              bgcolor: theme.palette.secondary.main,
              color: "#FFF",
              mx: 2,
              "&:hover": { bgcolor: "#E65100" },
            }}
          >
            Book Appointment
          </Button>

          {/* Notifications */}
          <IconButton sx={{ color: "#FFF" }}>
            <Notifications />
          </IconButton>

          {/* Theme Toggle */}
          {/* <IconButton sx={{ color: "#FFF" }} onClick={handleThemeToggle}>
            {darkMode ? <Brightness7 /> : <Brightness4 />}
          </IconButton> */}

          {/* Auth Section */}
          {isLoggedIn ? (
            <>
              <IconButton
                sx={{ color: "#FFF" }}
                onClick={handleProfileMenuOpen}
              >
                <AccountCircle />
              </IconButton>
              {/* <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleprofile}
              >
                <MenuItem onClick={handleprofile}>Profile</MenuItem>
                <MenuItem onClick={handleappoinment}>Appointments</MenuItem>
                <MenuItem onClick={handledashboard}>Dashboard</MenuItem>
                <MenuItem onClick={handleLogout}>Logout</MenuItem>
              </Menu> */}
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleprofile}
              >
                <MenuItem onClick={handleprofile}>Profile</MenuItem>
                {user?.role === "Doctor" && (
                  <>
                    <MenuItem onClick={handledashboard}>Dashboard</MenuItem>
                    <MenuItem onClick={handleappoinment}>Appoinment</MenuItem>
                    <MenuItem onClick={handlepatientrecords}>
                      Patient-records
                    </MenuItem>
                    {/* <MenuItem onClick={handledoctorsetting}>Settings</MenuItem> */}
                  </>
                )}
                {user?.role === "Patient" && (
                  <>
                    <MenuItem onClick={handleappoinment}>Appointments</MenuItem>
                    <MenuItem onClick={handledashboard}>Dahboard</MenuItem>
                    <MenuItem onClick={handlesearch}>Doctor search</MenuItem>
                  </>
                )}
                <MenuItem onClick={handleLogout}>Logout</MenuItem>
              </Menu>
            </>
          ) : (
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Button
                sx={{ color: "#FFF" }}
                startIcon={<LoginIcon />}
                onClick={handleLogin}
              >
                Login
              </Button>
              <Button
                sx={{
                  bgcolor: theme.palette.secondary.main,
                  color: "#FFF",
                  mx: 1,
                  "&:hover": { bgcolor: "#E65100" },
                }}
                startIcon={<SignupIcon />}
                onClick={handleSignup}
              >
                Sign Up
              </Button>
            </Box>
          )}
        </Toolbar>
      </AppBar>
    </ThemeProvider>
  );
};

export default Navbar;
