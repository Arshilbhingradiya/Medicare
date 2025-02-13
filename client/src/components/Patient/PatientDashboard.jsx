// import { useState, useEffect } from "react";

// import { useAuth } from "../../store/auth";

// function Influprofile() {
//   const { user } = useAuth();

//   // Initialize state with data from localStorage (if available)
//   const [profileData, setProfileData] = useState(() => {
//     const savedProfileData = localStorage.getItem("profileData");
//     return savedProfileData
//       ? JSON.parse(savedProfileData)
//       : {
//           fullname: user?.fullname || "",
//           email: user?.email || "",
//           phone: "",
//           aboutMe: "",
//           instagramFollowers: "",
//           posts: "",
//           collaborations: "",
//           address: "",
//           pinCode: "",
//         };
//   });

//   const [isEditing, setIsEditing] = useState(false);

//   // Handle form input changes
//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setProfileData({ ...profileData, [name]: value });
//   };

//   // Handle form submission and save profile data to localStorage
//   const handleSubmit = (e) => {
//     e.preventDefault();
//     localStorage.setItem("profileData", JSON.stringify(profileData));
//     console.log("Updated profile data:", profileData);
//     setIsEditing(false);
//   };

//   // Sync localStorage with updated profile data on each change
//   useEffect(() => {
//     localStorage.setItem("profileData", JSON.stringify(profileData));
//   }, [profileData]);

//   return (
//     <div className="profile-container">
//       <div className="profile-cover">
//         <img
//           src="/path/to/cover-photo.jpg"
//           alt="Cover"
//           className="cover-image"
//         />
//       </div>

//       <div className="profile-header">
//         <img
//           src="/path/to/profile-pic.jpg"
//           alt="Profile"
//           className="profile-image"
//         />
//         <div className="profile-details">
//           <h1 className="profile-name">{user.username}</h1>
//           <p className="profile-title">Influencer & Content Creator</p>
//         </div>
//         <button
//           className="edit-button"
//           onClick={() => setIsEditing(!isEditing)}
//         >
//           {isEditing ? "Cancel" : "Edit Profile"}
//         </button>
//       </div>

//       <form
//         onSubmit={handleSubmit}
//         className={`profile-form ${isEditing ? "editing" : ""}`}
//       >
//         {/* Basic Information Section */}
//         <div className="profile-section">
//           <h2>Basic Information</h2>
//           <div className="form-group">
//             <label htmlFor="fullname">Full Name</label>
//             <input
//               type="text"
//               id="fullname"
//               name="fullname"
//               value={profileData.fullname}
//               onChange={handleChange}
//               disabled={!isEditing}
//             />
//           </div>
//           <div className="form-group">
//             <label htmlFor="email">Email</label>
//             <input
//               type="email"
//               id="email"
//               name="email"
//               value={profileData.email}
//               onChange={handleChange}
//               disabled={!isEditing}
//             />
//           </div>
//           <div className="form-group">
//             <label htmlFor="user">Phone Number</label>
//             <input
//               type="number"
//               id="phone"
//               name="phone"
//               value={profileData.phone}
//               onChange={handleChange}
//               disabled={!isEditing}
//             />
//           </div>
//           <div className="form-group">
//             <label htmlFor="address">Address</label>
//             <input
//               type="text"
//               id="address"
//               name="address"
//               value={profileData.address}
//               onChange={handleChange}
//               disabled={!isEditing}
//             />
//           </div>
//           <div className="form-group">
//             <label htmlFor="pinCode">Pin Code</label>
//             <input
//               type="text"
//               id="pinCode"
//               name="pinCode"
//               value={profileData.pinCode}
//               onChange={handleChange}
//               disabled={!isEditing}
//             />
//           </div>
//         </div>

//         {/* About Me Section */}
//         <div className="profile-section">
//           <h2>About Me</h2>
//           <textarea
//             id="aboutMe"
//             name="aboutMe"
//             value={profileData.aboutMe}
//             onChange={handleChange}
//             rows="4"
//             disabled={!isEditing}
//           ></textarea>
//         </div>

//         {/* Social Media & Contact Section */}
//         <div className="profile-section">
//           <h2>Social Media & Contact</h2>
//           <div className="form-group">
//             <label htmlFor="instagramFollowers">Instagram Followers</label>
//             <input
//               type="text"
//               id="instagramFollowers"
//               name="instagramFollowers"
//               value={profileData.instagramFollowers}
//               onChange={handleChange}
//               disabled={!isEditing}
//             />
//           </div>
//           <div className="form-group">
//             <label htmlFor="posts">Posts</label>
//             <input
//               type="text"
//               id="posts"
//               name="posts"
//               value={profileData.posts}
//               onChange={handleChange}
//               disabled={!isEditing}
//             />
//           </div>
//           <div className="form-group">
//             <label htmlFor="collaborations">Collaborations</label>
//             <input
//               type="text"
//               id="collaborations"
//               name="collaborations"
//               value={profileData.collaborations}
//               onChange={handleChange}
//               disabled={!isEditing}
//             />
//           </div>
//         </div>

//         {isEditing && (
//           <div className="form-actions">
//             <button type="submit" className="save-button">
//               Save Changes
//             </button>
//           </div>
//         )}
//       </form>
//     </div>
//   );
// }

// export default Influprofile;

import {
  Container,
  Grid,
  Typography,
  Paper,
  Box,
  Button,
  Avatar,
} from "@mui/material";
import { useAuth } from "../../store/auth";
import {
  CalendarToday,
  LocalHospital,
  History,
  Person,
} from "@mui/icons-material";

const PatientDashboard = () => {
  // Sample data
  const { user } = useAuth();
  const upcomingAppointments = [
    {
      id: 1,
      doctor: "Dr. Sarah Smith",
      date: "2023-08-25 10:00 AM",
      specialty: "Cardiology",
    },
    {
      id: 2,
      doctor: "Dr. John Doe",
      date: "2023-08-28 02:30 PM",
      specialty: "Dermatology",
    },
  ];

  const healthMetrics = [
    { title: "Blood Pressure", value: "120/80 mmHg" },
    { title: "Weight", value: "68 kg" },
    { title: "Last Visit", value: "2023-08-10" },
  ];

  return (
    <Container>
      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "center", py: 4 }}>
        <Avatar sx={{ width: 56, height: 56, mr: 2 }}>
          <Person fontSize="large" />
        </Avatar>
        <Typography variant="h4">Welcome Back, {user.username}</Typography>
      </Box>

      {/* Quick Stats */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, textAlign: "center" }}>
            <LocalHospital color="primary" sx={{ fontSize: 40 }} />
            <Typography variant="h6" sx={{ mt: 1 }}>
              Upcoming Appointments
            </Typography>
            <Typography variant="h4">2</Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, textAlign: "center" }}>
            <History color="primary" sx={{ fontSize: 40 }} />
            <Typography variant="h6" sx={{ mt: 1 }}>
              Past Consultations
            </Typography>
            <Typography variant="h4">12</Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, textAlign: "center" }}>
            <CalendarToday color="primary" sx={{ fontSize: 40 }} />
            <Typography variant="h6" sx={{ mt: 1 }}>
              Next Appointment
            </Typography>
            <Typography variant="h6">25 Aug 2023</Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Upcoming Appointments */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="h5" gutterBottom>
          Upcoming Appointments
        </Typography>
        {upcomingAppointments.map((appointment) => (
          <Paper key={appointment.id} sx={{ p: 3, mb: 2 }}>
            <Grid container alignItems="center">
              <Grid item xs={8}>
                <Typography variant="h6">{appointment.doctor}</Typography>
                <Typography variant="body1">{appointment.specialty}</Typography>
                <Typography variant="body2" color="textSecondary">
                  {appointment.date}
                </Typography>
              </Grid>
              <Grid item xs={4} sx={{ textAlign: "right" }}>
                <Button variant="contained" color="primary" sx={{ mr: 1 }}>
                  View Details
                </Button>
                <Button variant="outlined" color="error">
                  Cancel
                </Button>
              </Grid>
            </Grid>
          </Paper>
        ))}
      </Box>
    </Container>
  );
};

export default PatientDashboard;
