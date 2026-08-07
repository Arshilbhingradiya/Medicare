import { useEffect, useState } from "react";
import { useAuth } from "../store/auth";
import { API_URL } from "../config";
import {
  Container,
  Paper,
  Typography,
  Grid,
  Box,
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
} from "@mui/icons-material";

const AdminDashboard = () => {
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

  useEffect(() => {
    const fetchData = async () => {
      try {
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
        setRecentUsers(users.slice(0, 5));
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authorizationtoken]);

  const statCards = [
    {
      title: "Total Users",
      value: stats.users,
      icon: <People />,
      color: "#0d47a1",
    },
    {
      title: "Patients",
      value: stats.patients,
      icon: <Person />,
      color: "#00796b",
    },
    {
      title: "Doctors",
      value: stats.doctors,
      icon: <MedicalServices />,
      color: "#e65100",
    },
    {
      title: "Contacts",
      value: stats.contacts,
      icon: <Mail />,
      color: "#7b1fa2",
    },
    {
      title: "Subscriptions",
      value: stats.subscriptions,
      icon: <Payments />,
      color: "#c62828",
    },
  ];

  const revenueCards = [
    {
      title: "Total Revenue",
      value: `₹${analytics.revenue.totalRevenue.toLocaleString()}`,
      icon: <MonetizationOn />,
      color: "#2e7d32",
    },
    {
      title: "Monthly Revenue",
      value: `₹${analytics.revenue.monthlyRevenue.toLocaleString()}`,
      icon: <DateRange />,
      color: "#0d47a1",
    },
    {
      title: "Yearly Revenue",
      value: `₹${analytics.revenue.yearlyRevenue.toLocaleString()}`,
      icon: <CalendarToday />,
      color: "#e65100",
    },
    {
      title: "This Month",
      value: `₹${analytics.revenue.currentMonthRevenue.toLocaleString()}`,
      icon: <MonetizationOn />,
      color: "#00796b",
    },
    {
      title: "This Year",
      value: `₹${analytics.revenue.currentYearRevenue.toLocaleString()}`,
      icon: <DateRange />,
      color: "#7b1fa2",
    },
    {
      title: "Active Plans",
      value: analytics.revenue.activeSubscriptions,
      icon: <WorkspacePremium />,
      color: "#c62828",
    },
  ];

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4, px: { xs: 2, md: 4 } }}>
      <Paper
        elevation={0}
        sx={{
          p: { xs: 3, md: 4 },
          borderRadius: 4,
          mb: 3,
          background: "linear-gradient(135deg, #0d47a1 0%, #1976d2 100%)",
          color: "white",
        }}
      >
        <Typography variant="h4" sx={{ fontWeight: 800 }}>
          Admin Dashboard
        </Typography>
        <Typography variant="body1" sx={{ opacity: 0.95, mt: 0.5 }}>
          Overview of users, doctors, contacts, subscriptions and revenue across the platform.
        </Typography>
      </Paper>

      {/* Stat Cards */}
      <Grid container spacing={3}>
        {statCards.map((card) => (
          <Grid item xs={12} sm={6} md={4} lg={2.4} key={card.title}>
            <Card
              sx={{
                borderRadius: 3,
                boxShadow: "0 8px 24px rgba(13,71,161,0.1)",
                transition: "transform 0.2s ease",
                "&:hover": { transform: "translateY(-4px)" },
              }}
            >
              <CardContent sx={{ textAlign: "center" }}>
                <Avatar
                  sx={{
                    bgcolor: card.color,
                    width: 56,
                    height: 56,
                    mx: "auto",
                    mb: 1.5,
                  }}
                >
                  {card.icon}
                </Avatar>
                <Typography variant="h4" sx={{ fontWeight: 800, color: card.color }}>
                  {card.value}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {card.title}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Revenue Cards */}
      <Box sx={{ mt: 4, mb: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 800, color: "primary.main", mb: 2 }}>
          Revenue Analytics
        </Typography>
      </Box>
      <Grid container spacing={3}>
        {revenueCards.map((card) => (
          <Grid item xs={12} sm={6} md={4} lg={2} key={card.title}>
            <Card
              sx={{
                borderRadius: 3,
                boxShadow: "0 8px 24px rgba(13,71,161,0.1)",
                transition: "transform 0.2s ease",
                "&:hover": { transform: "translateY(-4px)" },
              }}
            >
              <CardContent sx={{ textAlign: "center" }}>
                <Avatar
                  sx={{
                    bgcolor: card.color,
                    width: 48,
                    height: 48,
                    mx: "auto",
                    mb: 1.5,
                  }}
                >
                  {card.icon}
                </Avatar>
                <Typography variant="h6" sx={{ fontWeight: 800, color: card.color }}>
                  {card.value}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {card.title}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* City-wise Subscription Analytics */}
      <Paper elevation={2} sx={{ p: 3, mt: 3, borderRadius: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: "primary.main" }}>
          City-wise Subscribed Doctors
        </Typography>
        <Divider sx={{ mb: 2 }} />
        {analytics.cityAnalytics.length > 0 ? (
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
          <Typography color="text.secondary">No city analytics available.</Typography>
        )}
      </Paper>

      {/* Subscribed Doctors */}
      <Paper elevation={2} sx={{ p: 3, mt: 3, borderRadius: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: "primary.main" }}>
          Subscribed (Premium) Doctors
        </Typography>
        <Divider sx={{ mb: 2 }} />
        {analytics.subscribedDoctors.length > 0 ? (
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
                    <TableCell sx={{ fontWeight: 600 }}>{doc.name}</TableCell>
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
          <Typography color="text.secondary">No premium doctors yet.</Typography>
        )}
      </Paper>

      {/* Recent Users */}
      <Paper elevation={2} sx={{ p: 3, mt: 3, borderRadius: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: "primary.main" }}>
          Recent Users
        </Typography>
        <Divider sx={{ mb: 2 }} />
        {recentUsers.length > 0 ? (
          <List sx={{ display: "grid", gap: 1 }}>
            {recentUsers.map((user) => (
              <ListItem
                key={user._id}
                divider
                sx={{
                  borderRadius: 2,
                  bgcolor: "#f8fbff",
                  border: "1px solid #e3f2fd",
                  mb: 1,
                }}
              >
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: "#0d47a1" }}>
                    {(user.username || "?").charAt(0).toUpperCase()}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Typography variant="subtitle1" fontWeight={600}>
                        {user.username}
                      </Typography>
                      <Chip
                        label={user.role}
                        size="small"
                        color={user.role === "Doctor" ? "secondary" : "primary"}
                        icon={user.role === "Doctor" ? <Verified /> : <Groups />}
                        variant="outlined"
                      />
                    </Box>
                  }
                  secondary={user.email}
                />
              </ListItem>
            ))}
          </List>
        ) : (
          <Typography color="text.secondary">No users to display.</Typography>
        )}
      </Paper>
    </Container>
  );
};

export default AdminDashboard;
