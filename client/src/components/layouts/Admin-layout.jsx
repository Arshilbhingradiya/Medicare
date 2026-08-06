import { Link, Navigate, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../store/auth";
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
  Divider,
  Avatar,
  useMediaQuery,
  Stack,
  ListItemButton,
} from "@mui/material";
import {
  DashboardRounded,
  Group,
  Mail,
  CreditCard,
  Logout,
  MedicalServices,
} from "@mui/icons-material";

export default function AdminLayout() {
const { user, IsLoading, LogoutUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useMediaQuery("(max-width: 900px)");

  if (IsLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <Typography variant="h5">Loading...</Typography>
      </Box>
    );
  }

if (!user?.isAdmin && (user?.role || "").toLowerCase() !== "admin") {
    return <Navigate to="/" />;
  }

  const navItems = [
    { label: "Dashboard", path: "/Admin", icon: <DashboardRounded /> },
{ label: "Users", path: "/Admin/users", icon: <Group /> },
    { label: "Contacts", path: "/Admin/contacts", icon: <Mail /> },
    { label: "Subscriptions", path: "/Admin/subscriptions", icon: <CreditCard /> },
  ];

const handleLogout = () => {
    LogoutUser();
    navigate("/logout");
  };

  const sidebarContent = (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column", bgcolor: "#0d47a1", color: "white" }}>
      <Box sx={{ p: 3, textAlign: "center" }}>
        <MedicalServices sx={{ fontSize: 40, color: "#FFEB3B" }} />
        <Typography variant="h6" sx={{ fontWeight: 800, mt: 1 }}>
          Admin Panel
        </Typography>
        <Typography variant="caption" sx={{ opacity: 0.8 }}>
          MediCare Administration
        </Typography>
      </Box>
      <Divider sx={{ bgcolor: "rgba(255,255,255,0.2)" }} />
      <Box sx={{ px: 3, py: 2 }}>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Avatar sx={{ bgcolor: "#FFEB3B", color: "#0d47a1", fontWeight: 700 }}>
            {(user?.username || "A").charAt(0).toUpperCase()}
          </Avatar>
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {user?.username}
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.8 }}>
              Administrator
            </Typography>
          </Box>
        </Stack>
      </Box>
      <Divider sx={{ bgcolor: "rgba(255,255,255,0.2)" }} />
      <List sx={{ flexGrow: 1, px: 2, py: 2 }}>
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <ListItem key={item.path} disablePadding sx={{ mb: 1 }}>
              <ListItemButton
                component={Link}
                to={item.path}
                sx={{
                  borderRadius: 2,
                  color: "white",
                  bgcolor: isActive ? "rgba(255,255,255,0.18)" : "transparent",
                  "&:hover": { bgcolor: "rgba(255,255,255,0.12)" },
                }}
              >
                <ListItemIcon sx={{ color: isActive ? "#FFEB3B" : "white", minWidth: 40 }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.label} />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
      <Divider sx={{ bgcolor: "rgba(255,255,255,0.2)" }} />
      <Box sx={{ p: 2 }}>
        <ListItemButton
          onClick={handleLogout}
          sx={{ borderRadius: 2, color: "#ffcdd2", "&:hover": { bgcolor: "rgba(255,0,0,0.15)" } }}
        >
<ListItemIcon sx={{ color: "#ef5350", minWidth: 40 }}>
            <Logout />
          </ListItemIcon>
          <ListItemText primary="Logout" />
        </ListItemButton>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "#f3f6fb" }}>
      {/* Sidebar */}
      <Drawer
        variant={isMobile ? "temporary" : "permanent"}
        open={isMobile ? false : true}
        sx={{
          width: 260,
          flexShrink: 0,
          "& .MuiDrawer-paper": { width: 260, boxSizing: "border-box", border: "none" },
        }}
      >
        {sidebarContent}
      </Drawer>

      {/* Main content */}
      <Box sx={{ flexGrow: 1, p: { xs: 2, md: 3 }, width: "100%" }}>
        <Outlet />
      </Box>
    </Box>
  );
}
