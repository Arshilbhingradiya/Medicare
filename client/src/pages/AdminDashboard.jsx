// AdminDashboard.jsx - Full Width Professional Version
import { useEffect, useState } from "react";
import { useAuth } from "../store/auth";
import { API_URL } from "../config";
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Avatar,
  Divider,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Chip,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  LinearProgress,
  Stack,
  IconButton,
  Tooltip,
  Fade,
  Grow,
  useTheme,
  alpha,
  Skeleton,
  Alert,
  Breadcrumbs,
  Link,
  Button,
  CardActionArea,
} from "@mui/material";
import {
  People,
  MedicalServices,
  Mail,
  Payments,
  Groups,
  Person,
  Verified,
  MonetizationOn,
  CalendarToday,
  DateRange,
  LocationCity,
  WorkspacePremium,
  TrendingUp,
  TrendingDown,
  ArrowUpward,
  ArrowDownward,
  AccountBalance,
  ReceiptLong,
  BarChart,
  DonutLarge,
  AdminPanelSettings,
  Refresh,
  Home as HomeIcon,
  Dashboard as DashboardIcon,
  Star,
  Business,
  AccessTime,
  CheckCircle,
  Add,
  Visibility,
  Edit,
  Delete,
} from "@mui/icons-material";

const AdminDashboard = () => {
  const theme = useTheme();
  const { authorizationtoken } = useAuth();
  const [stats, setStats] = useState({
    users: 0,
    patients: 0,
    doctors: 0,
    contacts: 0,
    subscriptions: 0,
  });
  const [recentUsers, setRecentUsers] = useState([]);
  const [analytics, setAnalytics] = useState({
    revenue: {
      totalRevenue: 0,
      monthlyRevenue: 0,
      yearlyRevenue: 0,
      currentMonthRevenue: 0,
      currentYearRevenue: 0,
      activeSubscriptions: 0,
    },
    cityAnalytics: [],
    subscribedDoctors: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      setRefreshing(true);
      setError("");

      const [usersRes, contactsRes, subsRes, analyticsRes] = await Promise.all([
        fetch(`${API_URL}/api/admin/users`, {
          headers: { Authorization: authorizationtoken },
        }),
        fetch(`${API_URL}/api/admin/contacts`, {
          headers: { Authorization: authorizationtoken },
        }),
        fetch(`${API_URL}/api/admin/subscriptions`, {
          headers: { Authorization: authorizationtoken },
        }),
        fetch(`${API_URL}/api/admin/analytics`, {
          headers: { Authorization: authorizationtoken },
        }),
      ]);

      let users = [];
      let contacts = [];
      let subs = [];

      if (usersRes.ok) {
        const data = await usersRes.json();
        users = Array.isArray(data) ? data : [];
      }
      if (contactsRes.ok) {
        const data = await contactsRes.json();
        contacts = Array.isArray(data) ? data : [];
      }
      if (subsRes.ok) {
        const data = await subsRes.json();
        subs = Array.isArray(data) ? data : [];
      }
      if (analyticsRes.ok) {
        const data = await analyticsRes.json();
        setAnalytics({
          revenue: data.revenue || analytics.revenue,
          cityAnalytics: data.cityAnalytics || [],
          subscribedDoctors: data.subscribedDoctors || [],
        });
      }

      const patients = users.filter(
        (u) => (u.role || "").toLowerCase() === "patient"
      ).length;
      const doctors = users.filter(
        (u) => (u.role || "").toLowerCase() === "doctor"
      ).length;

      setStats({
        users: users.length,
        patients,
        doctors,
        contacts: contacts.length,
        subscriptions: subs.length,
      });
      setRecentUsers(users.slice(0, 6));
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      setError("Failed to load some data. Please refresh.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authorizationtoken]);

  const statCards = [
    {
      title: "Total Users",
      value: stats.users,
      icon: <People />,
      color: "#0D47A1",
      bgColor: "rgba(13,71,161,0.12)",
      trend: "+12%",
      trendUp: true,
    },
    {
      title: "Patients",
      value: stats.patients,
      icon: <Person />,
      color: "#00796B",
      bgColor: "rgba(0,121,107,0.12)",
      trend: "+8%",
      trendUp: true,
    },
    {
      title: "Doctors",
      value: stats.doctors,
      icon: <MedicalServices />,
      color: "#E65100",
      bgColor: "rgba(230,81,0,0.12)",
      trend: "+5%",
      trendUp: true,
    },
    {
      title: "Contacts",
      value: stats.contacts,
      icon: <Mail />,
      color: "#7B1FA2",
      bgColor: "rgba(123,31,162,0.12)",
      trend: "-3%",
      trendUp: false,
    },
    {
      title: "Subscriptions",
      value: stats.subscriptions,
      icon: <Payments />,
      color: "#C62828",
      bgColor: "rgba(198,40,40,0.12)",
      trend: "+15%",
      trendUp: true,
    },
  ];

  const revenueCards = [
    {
      title: "Total Revenue",
      value: `₹${(analytics.revenue.totalRevenue || 0).toLocaleString()}`,
      icon: <MonetizationOn />,
      color: "#2E7D32",
      bgColor: "rgba(46,125,50,0.12)",
    },
    {
      title: "Monthly Revenue",
      value: `₹${(analytics.revenue.monthlyRevenue || 0).toLocaleString()}`,
      icon: <DateRange />,
      color: "#0D47A1",
      bgColor: "rgba(13,71,161,0.12)",
    },
    {
      title: "Yearly Revenue",
      value: `₹${(analytics.revenue.yearlyRevenue || 0).toLocaleString()}`,
      icon: <CalendarToday />,
      color: "#E65100",
      bgColor: "rgba(230,81,0,0.12)",
    },
    {
      title: "This Month",
      value: `₹${(analytics.revenue.currentMonthRevenue || 0).toLocaleString()}`,
      icon: <TrendingUp />,
      color: "#00796B",
      bgColor: "rgba(0,121,107,0.12)",
    },
    {
      title: "This Year",
      value: `₹${(analytics.revenue.currentYearRevenue || 0).toLocaleString()}`,
      icon: <TrendingUp />,
      color: "#7B1FA2",
      bgColor: "rgba(123,31,162,0.12)",
    },
    {
      title: "Active Plans",
      value: analytics.revenue.activeSubscriptions || 0,
      icon: <WorkspacePremium />,
      color: "#C62828",
      bgColor: "rgba(198,40,40,0.12)",
    },
  ];

  return (
    <Box sx={{ width: "100%", minHeight: "100vh", bgcolor: "#F4F6F8", overflow: "hidden" }}>
      {/* Main Content Area - No Container Constraints */}
      <Box sx={{ px: { xs: 2, sm: 3, md: 4, lg: 5 }, py: 4, width: "100%" }}>
        {/* Breadcrumbs */}
        <Breadcrumbs sx={{ mb: 3 }}>
          <Link to="/" style={{ textDecoration: "none", color: "inherit" }}>
            <HomeIcon sx={{ fontSize: 18, mr: 0.5, verticalAlign: "middle" }} />
            Home
          </Link>
          <Typography color="text.primary">
            <DashboardIcon sx={{ fontSize: 18, mr: 0.5, verticalAlign: "middle" }} />
            Admin Dashboard
          </Typography>
        </Breadcrumbs>

        {/* Hero Header - Full Width */}
        <Paper
          elevation={0}
          sx={{
            p: { xs: 3, sm: 4, md: 5 },
            borderRadius: 4,
            mb: 4,
            background: "linear-gradient(135deg, #0D47A1 0%, #1565C0 50%, #1976D2 100%)",
            color: "white",
            position: "relative",
            overflow: "hidden",
            width: "100%",
          }}
        >
          <Box sx={{ position: "absolute", top: -50, right: -50, width: 200, height: 200, borderRadius: "50%", background: "rgba(255,255,255,0.1)" }} />
          <Box sx={{ position: "absolute", bottom: -30, left: -20, width: 150, height: 150, borderRadius: "50%", background: "rgba(255,255,255,0.05)" }} />

          <Box sx={{ position: "relative", zIndex: 1 }}>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={3} alignItems={{ xs: "flex-start", sm: "center" }} justifyContent="space-between">
              <Box>
                <Typography variant="h4" fontWeight={800} sx={{ textShadow: "0 2px 4px rgba(0,0,0,0.2)", fontSize: { xs: "1.8rem", sm: "2.2rem", md: "2.5rem" } }}>
                  Admin Dashboard
                </Typography>
                <Typography variant="h6" sx={{ opacity: 0.9, mt: 1, fontSize: { xs: "1rem", sm: "1.1rem", md: "1.2rem" } }}>
                  Overview of users, doctors, contacts, subscriptions and revenue
                </Typography>
              </Box>
              <Stack direction="row" spacing={1}>
                <Chip
                  icon={<AdminPanelSettings />}
                  label="Administrator"
                  color="secondary"
                  sx={{ fontWeight: 800, bgcolor: "rgba(255,255,255,0.15)", color: "white", px: 2, py: 2 }}
                />
                <Tooltip title="Refresh Data">
                  <IconButton
                    onClick={fetchData}
                    sx={{ bgcolor: "rgba(255,255,255,0.15)", color: "white", "&:hover": { bgcolor: "rgba(255,255,255,0.25)" } }}
                  >
                    <Refresh />
                  </IconButton>
                </Tooltip>
              </Stack>
            </Stack>
          </Box>
        </Paper>

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setError("")}>
            {error}
          </Alert>
        )}

        {/* Stat Cards - Full Width Grid */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {statCards.map((card, index) => (
            <Grid item xs={12} sm={6} md={4} lg={2.4} key={card.title}>
              <Grow in={true} timeout={(index + 1) * 200}>
                <Card
                  sx={{
                    borderRadius: 3,
                    boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
                    transition: "all 0.3s ease",
                    "&:hover": { transform: "translateY(-4px)", boxShadow: "0 12px 32px rgba(0,0,0,0.12)" },
                    height: "100%",
                  }}
                >
                  <CardContent sx={{ p: { xs: 2, sm: 2.5, md: 3 } }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                      <Avatar
                        sx={{
                          bgcolor: card.bgColor,
                          color: card.color,
                          width: { xs: 44, sm: 48, md: 52 },
                          height: { xs: 44, sm: 48, md: 52 },
                          borderRadius: 2,
                        }}
                      >
                        {card.icon}
                      </Avatar>
                      <Chip
                        icon={card.trendUp ? <ArrowUpward sx={{ fontSize: 12 }} /> : <ArrowDownward sx={{ fontSize: 12 }} />}
                        label={card.trend}
                        size="small"
                        sx={{
                          bgcolor: card.trendUp ? "rgba(46,125,50,0.12)" : "rgba(211,47,47,0.12)",
                          color: card.trendUp ? "#2E7D32" : "#D32F2F",
                          fontWeight: 700,
                          fontSize: "0.7rem",
                          height: 24,
                        }}
                      />
                    </Stack>
                    {loading ? (
                      <Skeleton width={60} height={40} sx={{ mt: 2 }} />
                    ) : (
                      <Typography variant="h4" sx={{ fontWeight: 800, color: card.color, mt: 2, fontSize: { xs: "1.8rem", sm: "2rem", md: "2.2rem" } }}>
                        {card.value}
                      </Typography>
                    )}
                    <Typography variant="body2" color="text.secondary" fontWeight={600}>
                      {card.title}
                    </Typography>
                  </CardContent>
                </Card>
              </Grow>
            </Grid>
          ))}
        </Grid>

        {/* Revenue Analytics - Full Width */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h5" sx={{ fontWeight: 800, color: "primary.main" }}>
            Revenue Analytics
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Track your platform's financial performance
          </Typography>
        </Box>
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {revenueCards.map((card, index) => (
            <Grid item xs={12} sm={6} md={4} lg={2} key={card.title}>
              <Grow in={true} timeout={(index + 1) * 200}>
                <Card
                  sx={{
                    borderRadius: 3,
                    boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
                    transition: "all 0.3s ease",
                    "&:hover": { transform: "translateY(-4px)", boxShadow: "0 12px 32px rgba(0,0,0,0.12)" },
                    height: "100%",
                  }}
                >
                  <CardContent sx={{ p: { xs: 2, sm: 2.5, md: 3 }, textAlign: "center" }}>
                    <Avatar
                      sx={{
                        bgcolor: card.bgColor,
                        color: card.color,
                        width: { xs: 48, sm: 52, md: 56 },
                        height: { xs: 48, sm: 52, md: 56 },
                        mx: "auto",
                        mb: 1.5,
                      }}
                    >
                      {card.icon}
                    </Avatar>
                    {loading ? (
                      <Skeleton width={80} height={32} sx={{ mx: "auto" }} />
                    ) : (
                      <Typography variant="h6" sx={{ fontWeight: 800, color: card.color, fontSize: { xs: "1rem", sm: "1.1rem", md: "1.2rem" } }}>
                        {card.value}
                      </Typography>
                    )}
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: "0.8rem", sm: "0.85rem", md: "0.9rem" } }}>
                      {card.title}
                    </Typography>
                  </CardContent>
                </Card>
              </Grow>
            </Grid>
          ))}
        </Grid>

        {/* City-wise Subscription Analytics - Full Width */}
        <Paper elevation={0} sx={{ p: { xs: 2, sm: 3, md: 4 }, mb: 4, borderRadius: 4, border: "1px solid #e0e0e0", boxShadow: "0 8px 32px rgba(0,0,0,0.08)", width: "100%" }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800, color: "primary.main" }}>
                City-wise Subscribed Doctors
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Subscription distribution by city
              </Typography>
            </Box>
            <Chip icon={<LocationCity />} label="Analytics" color="primary" variant="outlined" />
          </Stack>
          <Divider sx={{ mb: 2 }} />
          {loading ? (
            <Stack spacing={2}>
              {[1, 2, 3].map((skeleton) => (
                <Skeleton key={skeleton} variant="rounded" height={48} />
              ))}
            </Stack>
          ) : analytics.cityAnalytics.length > 0 ? (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: "#f5f9ff" }}>
                    <TableCell sx={{ fontWeight: 700 }}>City</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Total Doctors</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Subscribed</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Subscription Rate</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Revenue</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {analytics.cityAnalytics.map((city) => (
                    <TableRow key={city.city} hover>
                      <TableCell sx={{ fontWeight: 600 }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <LocationCity sx={{ fontSize: 18, color: "primary.main" }} />
                          {city.city}
                        </Box>
                      </TableCell>
                      <TableCell>{city.totalDoctors}</TableCell>
                      <TableCell>{city.subscribedDoctors}</TableCell>
                      <TableCell sx={{ minWidth: 160 }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <LinearProgress
                            variant="determinate"
                            value={city.subscriptionRate}
                            sx={{ flexGrow: 1, height: 8, borderRadius: 4 }}
                          />
                          <Typography variant="body2" sx={{ fontWeight: 700 }}>
                            {city.subscriptionRate}%
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>₹{city.revenue.toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Typography color="text.secondary" sx={{ textAlign: "center", py: 4 }}>
              No city analytics available.
            </Typography>
          )}
        </Paper>

        {/* Subscribed Doctors - Full Width */}
        <Paper elevation={0} sx={{ p: { xs: 2, sm: 3, md: 4 }, mb: 4, borderRadius: 4, border: "1px solid #e0e0e0", boxShadow: "0 8px 32px rgba(0,0,0,0.08)", width: "100%" }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800, color: "primary.main" }}>
                Subscribed (Premium) Doctors
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Active premium subscribers
              </Typography>
            </Box>
            <Chip icon={<WorkspacePremium />} label={`${analytics.subscribedDoctors.length} Doctors`} color="success" variant="outlined" />
          </Stack>
          <Divider sx={{ mb: 2 }} />
          {loading ? (
            <Stack spacing={2}>
              {[1, 2, 3].map((skeleton) => (
                <Skeleton key={skeleton} variant="rounded" height={48} />
              ))}
            </Stack>
          ) : analytics.subscribedDoctors.length > 0 ? (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: "#f5f9ff" }}>
                    <TableCell sx={{ fontWeight: 700 }}>Doctor</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Specialization</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>City</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Plan</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Price</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Expiry</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {analytics.subscribedDoctors.map((doc) => (
                    <TableRow key={doc.id} hover>
                      <TableCell sx={{ fontWeight: 600 }}>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <Avatar sx={{ width: 32, height: 32, fontSize: 14, bgcolor: "#0D47A1" }}>
                            {doc.name?.charAt(0) || "?"}
                          </Avatar>
                          {doc.name}
                        </Stack>
                      </TableCell>
                      <TableCell>{doc.specialization}</TableCell>
                      <TableCell>{doc.city}</TableCell>
                      <TableCell>
                        <Chip label={doc.plan} color="primary" size="small" variant="outlined" />
                      </TableCell>
                      <TableCell>₹{doc.price}</TableCell>
                      <TableCell>
                        {doc.expiryDate ? new Date(doc.expiryDate).toLocaleDateString() : "—"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Typography color="text.secondary" sx={{ textAlign: "center", py: 4 }}>
              No premium doctors yet.
            </Typography>
          )}
        </Paper>

        {/* Recent Users - Full Width */}
        <Paper elevation={0} sx={{ p: { xs: 2, sm: 3, md: 4 }, borderRadius: 4, border: "1px solid #e0e0e0", boxShadow: "0 8px 32px rgba(0,0,0,0.08)", width: "100%" }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800, color: "primary.main" }}>
                Recent Users
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Latest registered users
              </Typography>
            </Box>
            <Chip icon={<People />} label={`${stats.users} Total`} color="primary" variant="outlined" />
          </Stack>
          <Divider sx={{ mb: 2 }} />
          {loading ? (
            <Stack spacing={2}>
              {[1, 2, 3].map((skeleton) => (
                <Skeleton key={skeleton} variant="rounded" height={56} />
              ))}
            </Stack>
          ) : recentUsers.length > 0 ? (
            <List sx={{ display: "grid", gap: 1 }}>
              {recentUsers.map((user) => (
                <ListItem
                  key={user._id}
                  sx={{
                    borderRadius: 2,
                    bgcolor: "#f8fbff",
                    border: "1px solid #e3f2fd",
                    mb: 1,
                    transition: "all 0.2s",
                    "&:hover": { bgcolor: "#e3f2fd" },
                  }}
                >
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: "#0D47A1", width: 44, height: 44, fontWeight: 700 }}>
                      {(user.username || "?").charAt(0).toUpperCase()}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Typography variant="subtitle1" fontWeight={700}>
                          {user.username}
                        </Typography>
                        <Chip
                          label={user.role}
                          size="small"
                          color={user.role === "Doctor" ? "secondary" : "primary"}
                          icon={user.role === "Doctor" ? <Verified /> : <Person />}
                          variant="outlined"
                          sx={{ fontSize: 11, fontWeight: 700 }}
                        />
                      </Box>
                    }
                    secondary={
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Mail sx={{ fontSize: 14, color: "text.secondary" }} />
                        <Typography variant="caption" color="text.secondary">
                          {user.email}
                        </Typography>
                      </Stack>
                    }
                  />
                </ListItem>
              ))}
            </List>
          ) : (
            <Typography color="text.secondary" sx={{ textAlign: "center", py: 4 }}>
              No users to display.
            </Typography>
          )}
        </Paper>
      </Box>
    </Box>
  );
};

export default AdminDashboard;