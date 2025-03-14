import { useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Card,
  CardContent,
  Grid,
  Button,
  Avatar,
} from "@mui/material";
import {
  Menu as MenuIcon,
  CalendarToday,
  People,
  AccountCircle,
  MonetizationOn,
  ExitToApp,
} from "@mui/icons-material";
import { Link } from "react-router-dom";

const Doctordashboard = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  return (
    <div className="flex">
      {/* Sidebar Drawer */}
      <Drawer open={drawerOpen} onClose={toggleDrawer} variant="temporary">
        <List className="w-64 bg-blue-900 h-full text-white">
          <ListItem className="py-4">
            <Avatar src="/doctor-avatar.jpg" className="mr-3" />
            <Typography variant="h6">Dr. John Doe</Typography>
          </ListItem>
          <ListItem button component={Link} to="/doctor/appointments">
            <ListItemIcon>
              <CalendarToday className="text-white" />
            </ListItemIcon>
            <ListItemText primary="Appointments" />
          </ListItem>
          <ListItem button component={Link} to="/doctor/patients">
            <ListItemIcon>
              <People className="text-white" />
            </ListItemIcon>
            <ListItemText primary="Patients" />
          </ListItem>
          <ListItem button component={Link} to="/doctor/profile">
            <ListItemIcon>
              <AccountCircle className="text-white" />
            </ListItemIcon>
            <ListItemText primary="Profile" />
          </ListItem>
          <ListItem button component={Link} to="/doctor/earnings">
            <ListItemIcon>
              <MonetizationOn className="text-white" />
            </ListItemIcon>
            <ListItemText primary="Earnings" />
          </ListItem>
          <ListItem button component={Link} to="/logout">
            <ListItemIcon>
              <ExitToApp className="text-white" />
            </ListItemIcon>
            <ListItemText primary="Logout" />
          </ListItem>
        </List>
      </Drawer>

      {/* Main Content */}
      <div className="flex-1">
        {/* Navbar */}
        <AppBar position="sticky" className="bg-blue-900">
          <Toolbar>
            <IconButton onClick={toggleDrawer} className="text-white">
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" className="flex-grow text-white">
              Doctor Dashboard
            </Typography>
          </Toolbar>
        </AppBar>

        {/* Dashboard Stats */}
        <div className="p-6">
          <Grid container spacing={3}>
            <Grid item xs={12} md={3}>
              <Card className="shadow-lg">
                <CardContent>
                  <Typography variant="h6">Total Appointments</Typography>
                  <Typography variant="h4" className="text-blue-600">
                    24
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={3}>
              <Card className="shadow-lg">
                <CardContent>
                  <Typography variant="h6">Patients</Typography>
                  <Typography variant="h4" className="text-green-600">
                    120
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={3}>
              <Card className="shadow-lg">
                <CardContent>
                  <Typography variant="h6">Earnings</Typography>
                  <Typography variant="h4" className="text-orange-600">
                    $3,500
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={3}>
              <Card className="shadow-lg">
                <CardContent>
                  <Typography variant="h6">Ratings</Typography>
                  <Typography variant="h4" className="text-yellow-600">
                    4.8 ⭐
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Upcoming Appointments */}
          <div className="mt-6 bg-white p-4 rounded-lg shadow-md">
            <Typography variant="h6" className="mb-4">
              Upcoming Appointments
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Card className="shadow-md">
                  <CardContent>
                    <Typography variant="subtitle1">
                      Patient: Alice Johnson
                    </Typography>
                    <Typography variant="body2">
                      Date: March 10, 2025
                    </Typography>
                    <Typography variant="body2">Time: 3:00 PM</Typography>
                    <Button
                      variant="contained"
                      color="primary"
                      className="mt-2"
                    >
                      View Details
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={6}>
                <Card className="shadow-md">
                  <CardContent>
                    <Typography variant="subtitle1">
                      Patient: Mark Smith
                    </Typography>
                    <Typography variant="body2">
                      Date: March 12, 2025
                    </Typography>
                    <Typography variant="body2">Time: 11:00 AM</Typography>
                    <Button
                      variant="contained"
                      color="primary"
                      className="mt-2"
                    >
                      View Details
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Doctordashboard;
