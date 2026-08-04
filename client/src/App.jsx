import "../node_modules/bootstrap/dist/css/bootstrap.min.css";

import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Box, useMediaQuery, useTheme } from "@mui/material";
import Home from "./pages/home";
import Signup from "./pages/signup";
import Login from "./pages/login";
import Contact from "./pages/contact";
// import Service from "./pages/Service";
import About from "./pages/About";
import Navbar from "./components/Navbar";
import { Logout } from "./pages/logout";
import Adminlayout from "./components/layouts/Admin-layout";
import Adminusers from "./pages/Adminusers";
import Admincontacts from "./pages/Admincontacts";

import PatientDashboard from "./components/Patient/PatientDashboard";
import PatientProfile from "./components/Patient/Patientprofile";
import Patientappoinment from "./components/Patient/Patientappoinment";
import DoctorProfile from "./components/Doctor/Doctorprofile";
import Registerprofile from "./components/Doctor/Registerprofile";
import Doctordashboard from "./components/Doctor/Doctordashboard";
// import DoctorAppoinments from "./components/Doctor/DoctorAppoinment";
import PatientRecords from "./components/Doctor/Patientrecords";
import PatientFilePage from "./components/Doctor/PatientFilePage";
import DoctorSearch from "./components/Patient/Doctorsearch";
import PrivateRoute from "./components/PrivateRoute";
import { useState } from "react";
// import Adminverification from "./pages/Adminverfication";

function App() {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleOpenSidebar = () => setSidebarOpen(true);
  const handleCloseSidebar = () => setSidebarOpen(false);
  const handleToggleSidebar = () => setSidebarOpen((prev) => !prev);

  return (
    <div style={{ overflowX: "hidden", width: "100%", maxWidth: "100vw", minHeight: "100vh" }}>
      <BrowserRouter>
        <Navbar
          sidebarOpen={sidebarOpen}
          onOpenSidebar={handleOpenSidebar}
          onCloseSidebar={handleCloseSidebar}
          onToggleSidebar={handleToggleSidebar}
        />
        <Box
          sx={{
            marginLeft: sidebarOpen ? { xs: 0, md: "280px" } : 0,
            transition: "margin-left 0.3s ease, width 0.3s ease",
            width: sidebarOpen ? { xs: "100%", md: "calc(100% - 280px)" } : "100%",
            minHeight: "100vh",
            overflowX: "hidden",
            boxSizing: "border-box",
          }}
        >
          <Routes>
            <Route path="/" element={<Home />}></Route>
            <Route path="/About" element={<About />}></Route>
            <Route path="/contact" element={<Contact />}></Route>
            {/* <Route path="/service" element={<Service />}></Route> */}
            <Route path="/login" element={<Login />}></Route>
            <Route path="/signup" element={<Signup />}></Route>
            <Route path="/logout" element={<Logout />}></Route>

            {/* patient */}
            <Route
              path="/patientdashboard"
              element={<PatientDashboard />}
            ></Route>
            <Route
              path="/patientprofile"
              element={
                <PrivateRoute>
                  <PatientProfile />
                </PrivateRoute>
              }
            ></Route>
            <Route
              path="/patientappoinment"
              element={
                <PrivateRoute>
                  <Patientappoinment />
                </PrivateRoute>
              }
            ></Route>
            <Route
              path="/doctorsearch"
              element={
                <PrivateRoute>
                  <DoctorSearch />
                </PrivateRoute>
              }
            ></Route>

            <Route path="/verifydoctor" element={<Registerprofile />}></Route>
            <Route
              path="/doctorprofile"
              element={
                <PrivateRoute>
                  <DoctorProfile />
                </PrivateRoute>
              }
            ></Route>
            <Route
              path="/doctordashboard"
              element={
                <PrivateRoute>
                  <Doctordashboard />
                </PrivateRoute>
              }
            ></Route>
            {/* <Route
              path="/doctorappoinment"
              element={<DoctorAppoinments />}
            ></Route> */}
            <Route path="/patientrecords" element={<PatientRecords />}></Route>
            <Route
              path="/patientfile/:appointmentId"
              element={
                <PrivateRoute>
                  <PatientFilePage />
                </PrivateRoute>
              }
            ></Route>

            {/* admin  */}
            <Route path="/admin" element={<Adminlayout />}></Route>
            <Route path="/Admin" element={<Adminlayout />}>
              <Route path="users" element={<Adminusers />} />
              <Route path="contacts" element={<Admincontacts />} />
              {/* <Route path="status" element={<Adminverification />} /> */}
            </Route>
          </Routes>
        </Box>
      </BrowserRouter>
    </div>
  );
}

export default App;
