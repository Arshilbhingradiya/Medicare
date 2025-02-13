import "../node_modules/bootstrap/dist/css/bootstrap.min.css";

import { BrowserRouter, Route, Routes } from "react-router-dom";
import Home from "./pages/home";
import Signup from "./pages/signup";
import Login from "./pages/login";
import Contact from "./pages/contact";
import Service from "./pages/Service";
import About from "./pages/About";
import Navbar from "./components/Navbar";
import { Logout } from "./pages/logout";
import Adminlayout from "./components/layouts/Admin-layout";
import Adminusers from "./pages/Adminusers";
import Admincontacts from "./pages/Admincontacts";

import PatientDashboard from "./components/Patient/PatientDashboard";
import PatientProfile from "./components/Patient/Patientprofile";
import Patientappoinment from "./components/Patient/Patientappoinment";

function App() {
  return (
    <div>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />}></Route>
          <Route path="/About" element={<About />}></Route>
          <Route path="/contact" element={<Contact />}></Route>
          <Route path="/service" element={<Service />}></Route>
          <Route path="/login" element={<Login />}></Route>
          <Route path="/signup" element={<Signup />}></Route>
          <Route path="/logout" element={<Logout />}></Route>

          {/* patient */}
          <Route
            path="/patientdashboard"
            element={<PatientDashboard />}
          ></Route>
          <Route path="/patientprofile" element={<PatientProfile />}></Route>
          <Route
            path="/patientappoinment"
            element={<Patientappoinment />}
          ></Route>

          {/* admin  */}
          <Route path="/admin" element={<Adminlayout />}></Route>
          <Route path="/Admin" element={<Adminlayout />}>
            {/* // we not need to write "/users beacuse nested Route is automaticaly consider like " Admin/users" */}
            <Route path="users" element={<Adminusers />} />
            <Route path="contacts" element={<Admincontacts />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
