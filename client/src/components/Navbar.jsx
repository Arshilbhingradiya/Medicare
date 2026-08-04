/* eslint-disable react/prop-types */

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
import { Link } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Box,
  createTheme,
  ThemeProvider,
  Drawer,
  List,
  ListItemButton,
  ListItemText,
  Divider,
  Stack,
  Avatar,
  Menu,
  MenuItem,
  useMediaQuery,
} from "@mui/material";
import {
  AccountCircle,
  Notifications,
  Login as LoginIcon,
  HowToReg as SignupIcon,
  Close as CloseIcon,
  Menu as MenuIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

const Navbar = ({ sidebarOpen = false, onToggleSidebar = () => {}, onCloseSidebar = () => {} }) => {
  const { isLoggedIn, user } = useAuth();
  const navigate = useNavigate();
  const [profileImage, setProfileImage] = useState("");
  const [mobileMenuAnchor, setMobileMenuAnchor] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [notificationMenuAnchor, setNotificationMenuAnchor] = useState(null);
  const theme = createTheme({
    palette: {
      mode: "light",
      primary: {
        main: "#0D47A1", // Deep Blue
      },
      secondary: {
        main: "#FF6F00", // Vibrant Orange
      },
      text: {
        primary: "#0D47A1",
      },
    },
  });

  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  useEffect(() => {
    const loadProfileImage = () => {
      if (!user?.id) {
        setProfileImage("");
        return;
      }

      const role = (user?.role || "").toLowerCase();
      let avatar = "";

      if (role === "doctor") {
        try {
          const storedDoctor = JSON.parse(localStorage.getItem("doctorProfile") || "{}");
          avatar = storedDoctor.profileImage || "";
        } catch {
          avatar = "";
        }
      } else if (role === "patient") {
        try {
          const storedPatient = JSON.parse(localStorage.getItem(`patientProfile_${user.id}`) || "{}");
          avatar = storedPatient.avatar || "";
        } catch {
          avatar = "";
        }
      } else {
        try {
          const storedDoctor = JSON.parse(localStorage.getItem("doctorProfile") || "{}");
          avatar = storedDoctor.profileImage || "";
        } catch (error) {
          console.warn("Could not load doctor avatar", error);
        }

        if (!avatar) {
          try {
            const storedPatient = JSON.parse(localStorage.getItem(`patientProfile_${user.id}`) || "{}");
            avatar = storedPatient.avatar || "";
          } catch (error) {
            console.warn("Could not load patient avatar", error);
          }
        }
      }

      setProfileImage(avatar);
    };

    const updateNotifications = () => {
      try {
        const patientNotification = localStorage.getItem(`patientNotification_${user?.id || "guest"}`);
        if (patientNotification) {
          const parsed = JSON.parse(patientNotification);
          setNotifications([parsed]);
          return;
        }
      } catch {
        // ignore and fall back
      }

      try {
        const stored = JSON.parse(localStorage.getItem("appointmentNotifications") || "[]");
        const patientScoped = (Array.isArray(stored) ? stored : []).filter((item) => item.patientId === (user?.id || null));
        if (patientScoped.length > 0) {
          setNotifications(patientScoped.slice(0, 6));
          return;
        }
      } catch {
        // ignore and fall back
      }

      const latest = localStorage.getItem("latestAppointmentNotification");
      if (latest) {
        try {
          const parsed = JSON.parse(latest);
          setNotifications([parsed]);
        } catch {
          setNotifications([]);
        }
      } else {
        setNotifications([]);
      }
    };

    loadProfileImage();
    updateNotifications();
    window.addEventListener("profile-updated", loadProfileImage);
    window.addEventListener("appointments-updated", updateNotifications);

    return () => {
      window.removeEventListener("profile-updated", loadProfileImage);
      window.removeEventListener("appointments-updated", updateNotifications);
    };
  }, [user?.id, user?.role]);

  const handleProfileMenuOpen = () => {
    onToggleSidebar();
  };

  const handleDrawerClose = () => {
    onCloseSidebar();
  };

  const normalizedRole = user?.role?.toLowerCase();
  const isAdmin = normalizedRole === "admin" || user?.isAdmin;

  const handleNavigate = (path) => {
    navigate(path);
  };

  const handledashboard = () => {
    if (normalizedRole === "doctor") {
      handleNavigate("/doctordashboard");
    } else if (normalizedRole === "patient") {
      handleNavigate("/patientdashboard");
    } else if (isAdmin) {
      handleNavigate("/Admin/users");
    }
  };

  const handleappoinment = () => {
    if (normalizedRole === "patient") {
      handleNavigate("/patientappoinment");
    } else if (normalizedRole === "doctor") {
      handleNavigate("/patientrecords");
    } else if (isAdmin) {
      handleNavigate("/Admin/contacts");
    }
  };

  const handleprofile = () => {
    if (normalizedRole === "doctor") {
      handleNavigate("/doctorprofile");
    } else if (normalizedRole === "patient") {
      handleNavigate("/patientprofile");
    } else if (isAdmin) {
      handleNavigate("/Admin/users");
    }
  };

  const handlepatientrecords = () => {
    handleNavigate("/patientrecords");
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
    handleNavigate("/doctorsearch");
  };
  const handleAppointmentCTA = () => {
    if (isLoggedIn) {
      navigate("/patientappoinment");
    } else {
      navigate("/login");
    }
  };
  const handlemedicare = () => {
    navigate("/");
  };

  const handleMobileMenuOpen = (event) => {
    setMobileMenuAnchor(event.currentTarget);
  };

  const handleMobileMenuClose = () => {
    setMobileMenuAnchor(null);
  };

  const handleNotificationOpen = (event) => {
    setNotificationMenuAnchor(event.currentTarget);
  };

  const handleNotificationClose = () => {
    setNotificationMenuAnchor(null);
  };

  const handleNotificationDismiss = (id) => {
    const next = notifications.filter((item) => item.id !== id);
    localStorage.setItem("appointmentNotifications", JSON.stringify(next));
    setNotifications(next);
    handleNotificationClose();
  };

  const handleMobileNav = (path) => {
    handleMobileMenuClose();
    navigate(path);
  };

  return (
    <ThemeProvider theme={theme}>
      <AppBar position="sticky" sx={{ bgcolor: theme.palette.primary.main, boxShadow: "0 6px 18px rgba(13,71,161,0.18)" }}>
        <Toolbar sx={{ minHeight: { xs: 72, md: 64 }, flexWrap: { xs: "wrap", md: "nowrap" }, gap: { xs: 1, md: 0 } }}>
          <Typography
            type="button"
            variant="h6"
            onClick={handlemedicare}
            sx={{ color: "#FFF", fontWeight: 700, letterSpacing: 0.5, cursor: "pointer", mr: 1 }}
          >
            MediCare
          </Typography>

          {!isMobile && (
            <>
              <Box sx={{ display: "flex", alignItems: "center", flexGrow: 1, justifyContent: "center" }}>
                <Button sx={{ color: "#FFF" }}>
                  <Link to="/" className="nav-link text-white">
                    Home
                  </Link>
                </Button>
                <Button sx={{ color: "#FFF" }}>
                  <Link to="/doctorsearch" className="nav-link text-white">
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
              </Box>

              <Typography variant="body2" sx={{ mx: 1, color: "#FFEB3B", display: { xs: "none", lg: "block" } }}>
                Emergency: +1 800 123 4567
              </Typography>
            </>
          )}

          <Box sx={{ display: "flex", alignItems: "center", ml: "auto", gap: { xs: 0.5, md: 1 } }}>
            <Button
              variant="contained"
              onClick={handleAppointmentCTA}
              sx={{
                bgcolor: theme.palette.secondary.main,
                color: "#FFF",
                minWidth: { xs: "auto", md: "auto" },
                px: { xs: 1.2, md: 2 },
                py: 0.8,
                fontSize: { xs: "0.8rem", md: "0.95rem" },
                "&:hover": { bgcolor: "#E65100" },
              }}
            >
              {isMobile ? "Book" : "Book Appointment"}
            </Button>

            {!isMobile && (
              <IconButton sx={{ color: "#FFF", position: "relative" }} onClick={handleNotificationOpen}>
                <Notifications />
                {notifications.length > 0 && (
                  <Box component="span" sx={{ position: "absolute", top: 6, right: 6, width: 8, height: 8, bgcolor: "#ff9800", borderRadius: "50%" }} />
                )}
              </IconButton>
            )}

            {isLoggedIn ? (
              <>
                {!isMobile && (
                  <IconButton sx={{ color: "#FFF" }} onClick={handleProfileMenuOpen}>
                    {profileImage ? <Avatar src={profileImage} sx={{ width: 28, height: 28 }} /> : <AccountCircle />}
                  </IconButton>
                )}

                {isMobile && (
                  <IconButton sx={{ color: "#FFF" }} onClick={handleMobileMenuOpen}>
                    <MenuIcon />
                  </IconButton>
                )}

                <Drawer
                anchor="left"
                variant={isMobile ? "temporary" : "persistent"}
                open={sidebarOpen}
                onClose={handleDrawerClose}
                ModalProps={{ keepMounted: true }}
                PaperProps={{
                  sx: {
                    width: { xs: "86vw", sm: 280, md: 300 },
                    maxWidth: "100%",
                    bgcolor: "#f8fbff",
                    boxShadow: "-8px 0 24px rgba(13, 71, 161, 0.16)",
                  },
                }}
              >
                <Box sx={{ p: 3, height: "100%", display: "flex", flexDirection: "column" }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                    <Typography variant="h6" sx={{ color: theme.palette.primary.main, fontWeight: 700 }}>
                      Quick Access
                    </Typography>
                    <IconButton onClick={handleDrawerClose} sx={{ color: theme.palette.primary.main }}>
                      <CloseIcon />
                    </IconButton>
                  </Stack>

                  <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                    <Avatar src={profileImage || undefined} sx={{ bgcolor: theme.palette.primary.main, width: 48, height: 48 }}>
                      {!profileImage ? <AccountCircle /> : null}
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                        {user?.username || "User"}
                      </Typography>
                      <Typography variant="body2" sx={{ color: "text.secondary" }}>
                        {user?.role || "Member"}
                      </Typography>
                    </Box>
                  </Stack>

                  <Divider sx={{ mb: 2 }} />

                  <List sx={{ flexGrow: 1 }}>
                    {(normalizedRole === "doctor" || normalizedRole === "patient" || isAdmin) && (
                      <ListItemButton onClick={handleprofile}>
                        <ListItemText primary="Profile" />
                      </ListItemButton>
                    )}

                    {normalizedRole === "doctor" && (
                      <>
                        <ListItemButton onClick={handledashboard}>
                          <ListItemText primary="Dashboard" />
                        </ListItemButton>
                        <ListItemButton onClick={handleappoinment}>
                          <ListItemText primary="Appointments" />
                        </ListItemButton>
                        <ListItemButton onClick={handlepatientrecords}>
                          <ListItemText primary="Patient Records" />
                        </ListItemButton>
                      </>
                    )}

                    {normalizedRole === "patient" && (
                      <>
                        <ListItemButton onClick={handledashboard}>
                          <ListItemText primary="Dashboard" />
                        </ListItemButton>
                        <ListItemButton onClick={handleappoinment}>
                          <ListItemText primary="Appointments" />
                        </ListItemButton>
                        <ListItemButton onClick={handlesearch}>
                          <ListItemText primary="Find Doctors" />
                        </ListItemButton>
                      </>
                    )}

                    {isAdmin && (
                      <>
                        <ListItemButton onClick={() => handleNavigate("/Admin/users")}>
                          <ListItemText primary="Manage Users" />
                        </ListItemButton>
                        <ListItemButton onClick={() => handleNavigate("/Admin/contacts")}>
                          <ListItemText primary="Manage Contacts" />
                        </ListItemButton>
                      </>
                    )}
                  </List>

                  <Divider sx={{ my: 2 }} />

                  <ListItemButton
                    onClick={handleLogout}
                    sx={{
                      borderRadius: 2,
                      bgcolor: "#ffe9e9",
                      color: "#c62828",
                      width: "fit-content",
                      px: 1.25,
                      py: 0.6,
                      mt: 0.5,
                      minHeight: 32,
                      alignSelf: "flex-start",
                    }}
                  >
                    <ListItemText primary="Logout" sx={{ m: 0, '& .MuiTypography-root': { fontSize: '0.95rem' } }} />
                  </ListItemButton>
                </Box>
              </Drawer>
            </>
          ) : (
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <Button
                sx={{ color: "#FFF", minWidth: { xs: "auto", md: "auto" }, px: { xs: 1, md: 1.5 } }}
                startIcon={<LoginIcon />}
                onClick={handleLogin}
              >
                {isMobile ? "" : "Login"}
              </Button>
              <Button
                sx={{
                  bgcolor: theme.palette.secondary.main,
                  color: "#FFF",
                  px: { xs: 1, md: 1.5 },
                  "&:hover": { bgcolor: "#E65100" },
                }}
                startIcon={<SignupIcon />}
                onClick={handleSignup}
              >
                {isMobile ? "" : "Sign Up"}
              </Button>
            </Box>
          )}
          </Box>
        </Toolbar>
      </AppBar>

      <Menu
        anchorEl={notificationMenuAnchor}
        open={Boolean(notificationMenuAnchor)}
        onClose={handleNotificationClose}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
      >
        {notifications.length > 0 ? (
          notifications.map((item) => (
            <MenuItem
              key={item.id}
              onClick={() => handleNotificationDismiss(item.id)}
              sx={{ minWidth: 240, display: "block" }}
            >
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                Booking confirmed
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {item.doctor} • {item.date} • {item.time}
              </Typography>
            </MenuItem>
          ))
        ) : (
          <MenuItem disabled>No new appointments yet</MenuItem>
        )}
      </Menu>

      <Menu
        anchorEl={mobileMenuAnchor}
        open={Boolean(mobileMenuAnchor)}
        onClose={handleMobileMenuClose}
      >
        <MenuItem onClick={() => handleMobileNav("/")}>Home</MenuItem>
        <MenuItem onClick={() => handleMobileNav("/doctorsearch")}>Find Doctors</MenuItem>
        <MenuItem onClick={() => handleMobileNav("/about")}>About</MenuItem>
        <MenuItem onClick={() => handleMobileNav("/contact")}>Contact</MenuItem>
        {isLoggedIn && (
          <MenuItem onClick={() => handleMobileNav("/logout")}>Logout</MenuItem>
        )}
      </Menu>
    </ThemeProvider>
  );
};

export default Navbar;
