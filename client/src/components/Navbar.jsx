/* eslint-disable react/prop-types */

import { useAuth } from "../store/auth";
import { Link, useNavigate } from "react-router-dom";
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
  ListItemIcon,
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
  DashboardRounded,
  CalendarMonthRounded,
  PersonRounded,
  SearchRounded,
  GroupRounded,
  ContactsRounded,
LogoutRounded,
  WorkspacePremiumRounded,
} from "@mui/icons-material";
import { useEffect, useState } from "react";
import { API_URL } from "../config";
const Navbar = ({
  sidebarOpen = false,
  onToggleSidebar = () => {},
  onCloseSidebar = () => {},
}) => {
const { isLoggedIn, user, authorizationtoken } = useAuth();
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
          const storedDoctor = JSON.parse(
            localStorage.getItem("doctorProfile") || "{}"
          );
          avatar = storedDoctor.profileImage || "";
        } catch {
          avatar = "";
        }
      } else if (role === "patient") {
        try {
          const storedPatient = JSON.parse(
            localStorage.getItem(`patientProfile_${user.id}`) || "{}"
          );
          avatar = storedPatient.avatar || "";
        } catch {
          avatar = "";
        }
      } else {
        try {
          const storedDoctor = JSON.parse(
            localStorage.getItem("doctorProfile") || "{}"
          );
          avatar = storedDoctor.profileImage || "";
        } catch (error) {
          console.warn("Could not load doctor avatar", error);
        }

        if (!avatar) {
          try {
            const storedPatient = JSON.parse(
              localStorage.getItem(`patientProfile_${user.id}`) || "{}"
            );
            avatar = storedPatient.avatar || "";
          } catch (error) {
            console.warn("Could not load patient avatar", error);
          }
        }
      }

      setProfileImage(avatar);
    };

const updateNotifications = async () => {
      if (!user?.id || !authorizationtoken) {
        setNotifications([]);
        return;
      }

      try {
        const response = await fetch(
          "${API_URL}/api/notifications",
          {
            method: "GET",
            headers: { Authorization: authorizationtoken },
          }
        );
        if (response.ok) {
          const data = await response.json();
          const list = Array.isArray(data) ? data : [];
          setNotifications(list.slice(0, 6));
          return;
        }
      } catch {
        // ignore
      }

      // Fallback to localStorage if backend unavailable
      try {
        const patientKey = `patientNotifications_${user?.id || "guest"}`;
        const stored = JSON.parse(localStorage.getItem(patientKey) || "[]");
        if (Array.isArray(stored) && stored.length > 0) {
          setNotifications(stored.slice(0, 6));
          return;
        }
      } catch {
        setNotifications([]);
      }

      setNotifications([]);
    };

    loadProfileImage();
    updateNotifications();
    window.addEventListener("profile-updated", loadProfileImage);
    window.addEventListener("appointments-updated", updateNotifications);

    return () => {
      window.removeEventListener("profile-updated", loadProfileImage);
      window.removeEventListener("appointments-updated", updateNotifications);
    };
  }, [user?.id, user?.role, authorizationtoken]);

  const handleProfileMenuOpen = () => {
    onToggleSidebar();
  };

  const handleDrawerClose = () => {
    onCloseSidebar();
  };

const normalizedRole = user?.role?.toLowerCase();
  const isAdmin = user?.isAdmin || normalizedRole === "admin";

  const handleNavigate = (path) => {
    navigate(path);
  };

  const handledashboard = () => {
    if (isAdmin) {
      handleNavigate("/Admin/users");
    } else if (normalizedRole === "doctor") {
      handleNavigate("/doctordashboard");
    } else if (normalizedRole === "patient") {
      handleNavigate("/patientdashboard");
    }
  };

  const handleappoinment = () => {
    if (isAdmin) {
      handleNavigate("/Admin/contacts");
    } else if (normalizedRole === "patient") {
      handleNavigate("/patientappoinment");
    } else if (normalizedRole === "doctor") {
      handleNavigate("/patientrecords");
    }
  };

  const handleprofile = () => {
    if (isAdmin) {
      handleNavigate("/Admin/users");
    } else if (normalizedRole === "doctor") {
      handleNavigate("/doctorprofile");
    } else if (normalizedRole === "patient") {
      handleNavigate("/patientprofile");
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
    if (normalizedRole === "doctor") {
      // Doctors should not book appointments; send to their dashboard
      navigate("/doctordashboard");
    } else if (isLoggedIn) {
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

const handleNotificationRead = async (id, event) => {
    if (event) event.stopPropagation();
    // Optimistically mark as read in UI
    setNotifications((prev) =>
      prev.map((item) => (item._id === id ? { ...item, read: true } : item))
    );
    try {
      await fetch(
        `${API_URL}/api/notifications/${id}/read`,
        {
          method: "PATCH",
          headers: { Authorization: authorizationtoken },
        }
      );
    } catch {
      // ignore
    }
  };

  const handleNotificationDismiss = async (id, event) => {
    if (event) event.stopPropagation();
    setNotifications((prev) => prev.filter((item) => item._id !== id));
    try {
      await fetch(`${API_URL}/api/notifications/${id}`, {
        method: "DELETE",
        headers: { Authorization: authorizationtoken },
      });
    } catch {
      // ignore
    }
  };

  const handleMobileNav = (path) => {
    handleMobileMenuClose();
    navigate(path);
  };

  // Reusable custom styles for Drawer List Items
  const drawerItemStyles = {
    borderRadius: 2,
    mb: 1,
    "&:hover": { bgcolor: "rgba(13, 71, 161, 0.08)" },
  };

  return (
    <ThemeProvider theme={theme}>
<AppBar
        position="fixed"
        sx={{
          bgcolor: theme.palette.primary.main,
          boxShadow: "0 6px 18px rgba(13,71,161,0.18)",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1200,
        }}
      >
        <Toolbar
          sx={{
            minHeight: { xs: 72, md: 64 },
            flexWrap: { xs: "wrap", md: "nowrap" },
            gap: { xs: 1, md: 0 },
          }}
        >
          <Typography
            type="button"
            variant="h6"
            onClick={handlemedicare}
            sx={{
              color: "#FFF",
              fontWeight: 700,
              letterSpacing: 0.5,
              cursor: "pointer",
              mr: 1,
            }}
          >
            MediCare
          </Typography>

          {!isMobile && (
            <>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  flexGrow: 1,
                  justifyContent: "center",
                }}
              >
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

              <Typography
                variant="body2"
                sx={{ mx: 1, color: "#FFEB3B", display: { xs: "none", lg: "block" } }}
              >
                Emergency: +1 800 123 4567
              </Typography>
            </>
          )}

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              ml: "auto",
              gap: { xs: 0.5, md: 1 },
            }}
          >
{isAdmin ? (
              <IconButton
                sx={{ color: "#FFF" }}
                onClick={handleProfileMenuOpen}
              >
                <DashboardRounded />
              </IconButton>
            ) : normalizedRole === "doctor" ? (
              <IconButton
                sx={{ color: "#FFF" }}
                onClick={handleProfileMenuOpen}
              >
                <DashboardRounded />
              </IconButton>
            ) : (
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
            )}

            {!isMobile && (
              <IconButton
                sx={{ color: "#FFF", position: "relative" }}
                onClick={handleNotificationOpen}
              >
<Notifications />
                {notifications.some((item) => !item.read) && (
                  <Box
                    component="span"
                    sx={{
                      position: "absolute",
                      top: 6,
                      right: 6,
                      width: 8,
                      height: 8,
                      bgcolor: "#ff9800",
                      borderRadius: "50%",
                    }}
                  />
                )}
              </IconButton>
            )}

            {isLoggedIn ? (
              <>
                {!isMobile && (
                  <IconButton
                    sx={{ color: "#FFF" }}
                    onClick={handleProfileMenuOpen}
                  >
                    {profileImage ? (
                      <Avatar src={profileImage} sx={{ width: 28, height: 28 }} />
                    ) : (
                      <AccountCircle />
                    )}
                  </IconButton>
                )}

                {isMobile && (
                  <IconButton
                    sx={{ color: "#FFF" }}
                    onClick={handleMobileMenuOpen}
                  >
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
                  <Box
                    sx={{
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    {/* --- Sidebar Header --- */}
                    <Box sx={{ p: 3, pb: 2 }}>
                      <Stack
                        direction="row"
                        justifyContent="space-between"
                        alignItems="center"
                      >
                        <Typography
                          variant="h6"
                          sx={{
                            color: theme.palette.primary.main,
                            fontWeight: 700,
                          }}
                        >
                          Quick Access
                        </Typography>
                        <IconButton
                          onClick={handleDrawerClose}
                          sx={{ color: theme.palette.primary.main }}
                        >
                          <CloseIcon />
                        </IconButton>
                      </Stack>
                    </Box>

                    <Divider />

                    {/* --- User Profile Snippet --- */}
                    <Box sx={{ px: 3, py: 2 }}>
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Avatar
                          src={profileImage || undefined}
                          sx={{
                            bgcolor: theme.palette.primary.main,
                            width: 50,
                            height: 50,
                            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                          }}
                        >
                          {!profileImage ? <AccountCircle /> : null}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                            {user?.username || "User"}
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{
                              color: "text.secondary",
                              textTransform: "capitalize",
                            }}
                          >
                            {user?.role || "Member"}
                          </Typography>
                        </Box>
                      </Stack>
                    </Box>

                    <Divider />

                    {/* --- Navigation Links --- */}
                    <Box sx={{ flexGrow: 1, overflowY: "auto", px: 2, py: 2 }}>
                      <List disablePadding>
                        {(normalizedRole === "doctor" ||
                          normalizedRole === "patient" ||
                          isAdmin) && (
                          <ListItemButton
                            onClick={handleprofile}
                            sx={drawerItemStyles}
                          >
                            <ListItemIcon sx={{ minWidth: 40 }}>
                              <PersonRounded color="primary" />
                            </ListItemIcon>
                            <ListItemText primary="Profile" />
                          </ListItemButton>
                        )}

                        {normalizedRole === "doctor" && (
                          <>
                            <ListItemButton
                              onClick={handledashboard}
                              sx={drawerItemStyles}
                            >
                              <ListItemIcon sx={{ minWidth: 40 }}>
                                <DashboardRounded color="primary" />
                              </ListItemIcon>
                              <ListItemText primary="Dashboard" />
                            </ListItemButton>
                            <ListItemButton
                              onClick={handleappoinment}
                              sx={drawerItemStyles}
                            >
                              <ListItemIcon sx={{ minWidth: 40 }}>
                                <CalendarMonthRounded color="primary" />
                              </ListItemIcon>
                              <ListItemText primary="Appointments" />
                            </ListItemButton>
<ListItemButton
                              onClick={handlepatientrecords}
                              sx={drawerItemStyles}
                            >
                              <ListItemIcon sx={{ minWidth: 40 }}>
                                <ContactsRounded color="primary" />
                              </ListItemIcon>
                              <ListItemText primary="Patient Records" />
                            </ListItemButton>
                            <ListItemButton
                              onClick={() => handleNavigate("/subscription")}
                              sx={drawerItemStyles}
                            >
                              <ListItemIcon sx={{ minWidth: 40 }}>
                                <WorkspacePremiumRounded color="primary" />
                              </ListItemIcon>
                              <ListItemText primary="Subscription Plan" />
                            </ListItemButton>
                          </>
                        )}

                        {normalizedRole === "patient" && (
                          <>
                            <ListItemButton
                              onClick={handledashboard}
                              sx={drawerItemStyles}
                            >
                              <ListItemIcon sx={{ minWidth: 40 }}>
                                <DashboardRounded color="primary" />
                              </ListItemIcon>
                              <ListItemText primary="Dashboard" />
                            </ListItemButton>
                            <ListItemButton
                              onClick={handleappoinment}
                              sx={drawerItemStyles}
                            >
                              <ListItemIcon sx={{ minWidth: 40 }}>
                                <CalendarMonthRounded color="primary" />
                              </ListItemIcon>
                              <ListItemText primary="Appointments" />
                            </ListItemButton>
                            <ListItemButton
                              onClick={handlesearch}
                              sx={drawerItemStyles}
                            >
                              <ListItemIcon sx={{ minWidth: 40 }}>
                                <SearchRounded color="primary" />
                              </ListItemIcon>
                              <ListItemText primary="Find Doctors" />
                            </ListItemButton>
                          </>
                        )}

                        {isAdmin && (
                          <>
                            <ListItemButton
                              onClick={() => handleNavigate("/Admin/users")}
                              sx={drawerItemStyles}
                            >
                              <ListItemIcon sx={{ minWidth: 40 }}>
                                <GroupRounded color="primary" />
                              </ListItemIcon>
                              <ListItemText primary="Manage Users" />
                            </ListItemButton>
                            <ListItemButton
                              onClick={() => handleNavigate("/Admin/contacts")}
                              sx={drawerItemStyles}
                            >
                              <ListItemIcon sx={{ minWidth: 40 }}>
                                <ContactsRounded color="primary" />
                              </ListItemIcon>
                              <ListItemText primary="Manage Contacts" />
                            </ListItemButton>
                          </>
                        )}
                      </List>
                    </Box>

                    {/* --- Sticky Footer Logout --- */}
                    <Divider />
                    <Box sx={{ p: 2 }}>
                      <Button
                        fullWidth
                        variant="contained"
                        startIcon={<LogoutRounded />}
                        onClick={handleLogout}
                        sx={{
                          bgcolor: "#ffe9e9",
                          color: "#c62828",
                          boxShadow: "none",
                          textTransform: "none",
                          fontWeight: 600,
                          "&:hover": {
                            bgcolor: "#ffcdd2",
                            boxShadow: "none",
                          },
                        }}
                      >
                        Logout
                      </Button>
                    </Box>
                  </Box>
                </Drawer>
              </>
            ) : (
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <Button
                  sx={{
                    color: "#FFF",
                    minWidth: { xs: "auto", md: "auto" },
                    px: { xs: 1, md: 1.5 },
                  }}
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
          notifications.map((item) => {
            const id = item._id || item.id;
            const title = item.title || "Notification";
            const message = item.message || "";
            const meta = item.meta || {};
            const isRead = !!item.read;
            return (
              <MenuItem
                key={id}
                onClick={(e) => handleNotificationRead(id, e)}
                sx={{
                  minWidth: 300,
                  display: "block",
                  bgcolor: isRead ? "transparent" : "rgba(13,71,161,0.06)",
                }}
              >
                <Stack direction="row" spacing={1} alignItems="center">
                  <Typography
                    variant="subtitle2"
                    sx={{ fontWeight: isRead ? 500 : 700 }}
                  >
                    {title}
                  </Typography>
                  {!isRead && (
                    <Box
                      sx={{
                        width: 8,
                        height: 8,
                        bgcolor: "#ff9800",
                        borderRadius: "50%",
                      }}
                    />
                  )}
                </Stack>
                <Typography variant="body2" color="text.secondary">
                  {message}
                </Typography>
                {meta.doctorName && (
                  <Typography variant="caption" color="text.secondary">
                    {meta.doctorName} • {meta.date || ""} • {meta.time || ""}
                  </Typography>
                )}
                <Button
                  size="small"
                  color={isRead ? "default" : "primary"}
                  onClick={(e) => handleNotificationDismiss(id, e)}
                  sx={{ textTransform: "none", mt: 0.5 }}
                >
                  {isRead ? "Remove" : "Mark as read & remove"}
                </Button>
              </MenuItem>
            );
          })
        ) : (
          <MenuItem disabled>No notifications yet</MenuItem>
        )}
      </Menu>

      <Menu
        anchorEl={mobileMenuAnchor}
        open={Boolean(mobileMenuAnchor)}
        onClose={handleMobileMenuClose}
      >
        <MenuItem onClick={() => handleMobileNav("/")}>Home</MenuItem>
        <MenuItem onClick={() => handleMobileNav("/doctorsearch")}>
          Find Doctors
        </MenuItem>
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