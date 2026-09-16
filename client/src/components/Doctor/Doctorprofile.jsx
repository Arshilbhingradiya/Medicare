import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Container,
  Snackbar,
  Alert,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Grid,
  Avatar,
  IconButton,
  Box,
  Stack,
  Divider,
} from "@mui/material";
import { Add, Delete, PhotoCamera } from "@mui/icons-material";
import { useAuth } from "../../store/auth";
import { API_URL } from "../../config";
export default function DoctorProfile() {
  const [doctor, setDoctor] = useState({
    name: "",
    email: "",
    phone: "",
    license: "",
    specialization: "",
    clinicAddress: "",
    city: "",
    yearsOfExperience: "",
    qualifications: "",
    availability: "",
    availabilitySchedule: "09:00-13:00,17:00-20:00",
    slotCapacity: "4",
    bio: "",
    profileImage: "",
    consultationFee: "",
    branches: [],
    weeklyOffDays: [],
    holidays: [],
  });

  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("success");
  const [saving, setSaving] = useState(false);
  const [imagePreview, setImagePreview] = useState("");
  const { authorizationtoken, IsLoading, isLoggedIn } = useAuth();

 useEffect(() => {
  const fetchProfile = async () => {
    if (IsLoading || !isLoggedIn || !authorizationtoken) {
      return;
    }

    try {
      const res = await fetch(
        `${API_URL}/api/doctorform/profile/mine`,
        {
          method: "GET",
          headers: {
            Authorization: authorizationtoken,
          },
        }
      );

      const data = await res.json();

      if (res.ok) {
        setDoctor((prev) => ({
          ...prev,
          ...data,
        }));

        setImagePreview(data.profileImage || "");

        console.log("Doctor profile loaded:", data);
      } else if (res.status === 404) {
        // Profile doesn't exist yet
        // Keep the empty form
        console.log("Doctor profile not created yet");
      } else {
        setMessage(data.msg || "Unable to load your doctor profile.");
        setMessageType("error");
      }
    } catch (error) {
      console.error(
        "Error fetching doctor profile:",
        error
      );
    }
  };

  fetchProfile();
}, [IsLoading, isLoggedIn, authorizationtoken]);

  const handleChange = (e) => {
    setDoctor({ ...doctor, [e.target.name]: e.target.value });
  };

  const updateBranch = (index, field, value) => {
    setDoctor((current) => ({
      ...current,
      branches: current.branches.map((branch, branchIndex) => branchIndex === index ? { ...branch, [field]: value } : branch),
    }));
  };

  const addBranch = () => {
    setDoctor((current) => ({
      ...current,
      branches: [...current.branches, { name: "", city: "", clinicAddress: "", availabilitySchedule: "09:00-13:00,17:00-20:00", slotCapacity: 4, active: true }],
    }));
  };

  const addHoliday = () => {
    setDoctor((current) => ({
      ...current,
      holidays: [...current.holidays, { date: "", reason: "Holiday" }],
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const imageData = reader.result;
        setImagePreview(imageData);
        setDoctor((prev) => ({ ...prev, profileImage: imageData }));
        window.dispatchEvent(new Event("profile-updated"));
      };
      reader.readAsDataURL(file);
    }
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  setMessage("");

  try {
    if (IsLoading || !isLoggedIn || !authorizationtoken) {
      setMessage("Your login session is not ready. Please log in again and try once more.");
      setMessageType("error");
      return;
    }

    if ((doctor.holidays || []).some((holiday) => !holiday.date)) {
      setMessage("Please select a date for every holiday, or remove the empty holiday row.");
      setMessageType("error");
      return;
    }

    setSaving(true);

    const response = await fetch(
      `${API_URL}/api/doctorform/doctorprofile`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: authorizationtoken,
        },
        body: JSON.stringify(doctor),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.msg || "Failed to save profile");
    }

    // Update React state with the data returned by backend
    setDoctor((prev) => ({
      ...prev,
      ...data,
    }));

    // Update profile image preview
    setImagePreview(data.profileImage || "");

    // Notify other components if they need profile information
    window.dispatchEvent(new Event("profile-updated"));

    setMessage("Profile saved successfully.");
    setMessageType("success");
    setOpenSnackbar(true);

    console.log("Doctor profile saved successfully:", data);
  } catch (error) {
    console.error("Error saving doctor profile:", error);
    setMessage(error.message || "Unable to save your profile. Please try again.");
    setMessageType("error");
  } finally {
    setSaving(false);
  }
};

  const handleCloseSnackbar = () => setOpenSnackbar(false);

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Card
        sx={{
          borderRadius: 4,
          overflow: "hidden",
          boxShadow: "0 20px 45px rgba(13, 71, 161, 0.16)",
          border: "1px solid #e3f2fd",
        }}
      >
        <Box
          sx={{
            background: "linear-gradient(135deg, #0d47a1 0%, #1976d2 100%)",
            color: "white",
            p: { xs: 3, md: 4 },
          }}
        >
          <Stack direction={{ xs: "column", md: "row" }} spacing={3} alignItems={{ xs: "center", md: "flex-start" }}>
            <Box sx={{ position: "relative" }}>
              <Avatar
                src={imagePreview || "https://via.placeholder.com/150"}
                alt="Doctor Profile"
                sx={{ width: 120, height: 120, border: "4px solid white", boxShadow: 3 }}
              />
              <IconButton
                aria-label="upload picture"
                component="label"
                sx={{
                  position: "absolute",
                  bottom: 0,
                  right: -4,
                  bgcolor: "white",
                  boxShadow: 2,
                  border: "1px solid #ddd",
                  width: 42,
                  height: 42,
                }}
              >
                <input hidden accept="image/*" type="file" onChange={handleImageChange} />
                <PhotoCamera />
              </IconButton>
            </Box>

            <Box>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                Doctor Profile Setup
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.95 }}>
                Present your professional details in a clean, modern format for patients.
              </Typography>
            </Box>
          </Stack>
        </Box>

        <CardContent sx={{ p: { xs: 3, md: 4 } }}>
          <Divider sx={{ mb: 3 }} />

          <Box sx={{ p: { xs: 2, md: 2.5 }, borderRadius: 3, bgcolor: "#f8fbff", border: "1px solid #e3f2fd", mb: 3 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "#0d47a1", mb: 2 }}>
              Personal & Professional Details
            </Typography>
            <Grid container spacing={2.5}>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth required label="Full Name" name="name" variant="outlined" value={doctor.name} onChange={handleChange} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth required label="Email Address" name="email" variant="outlined" value={doctor.email} onChange={handleChange} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="License Number (Optional)" name="license" variant="outlined" value={doctor.license} onChange={handleChange} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth required select label="Specialization" name="specialization" variant="outlined" value={doctor.specialization} onChange={handleChange} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}>
                  <MenuItem value="General Physician">General Physician</MenuItem>
                  <MenuItem value="Cardiologist">Cardiologist</MenuItem>
                  <MenuItem value="Dermatologist">Dermatologist</MenuItem>
                  <MenuItem value="Neurologist">Neurologist</MenuItem>
                  <MenuItem value="Orthopedic">Orthopedic</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Years of Experience" name="yearsOfExperience" variant="outlined" value={doctor.yearsOfExperience} onChange={handleChange} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Qualifications (Optional)" name="qualifications" variant="outlined" value={doctor.qualifications} onChange={handleChange} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
              </Grid>
            </Grid>
          </Box>

          <Box sx={{ p: { xs: 2, md: 2.5 }, borderRadius: 3, bgcolor: "#fcfdff", border: "1px solid #e3f2fd" }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "#0d47a1", mb: 2 }}>
              Contact & Availability
            </Typography>
            <Grid container spacing={2.5}>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Phone Number" name="phone" variant="outlined" value={doctor.phone} onChange={handleChange} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth required label="City" name="city" variant="outlined" value={doctor.city} onChange={handleChange} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Availability Schedule" name="availabilitySchedule" variant="outlined" value={doctor.availabilitySchedule} onChange={handleChange} helperText="Example: 09:00-13:00,17:00-20:00" sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Patients per slot" name="slotCapacity" type="number" variant="outlined" value={doctor.slotCapacity} onChange={handleChange} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Consultation fee (INR)" name="consultationFee" type="number" variant="outlined" value={doctor.consultationFee} onChange={handleChange} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Clinic Address" name="clinicAddress" variant="outlined" value={doctor.clinicAddress} onChange={handleChange} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Availability (Optional)" name="availability" variant="outlined" value={doctor.availability} onChange={handleChange} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
              </Grid>
              <Grid item xs={12}>
                <TextField fullWidth multiline rows={4} label="Short Bio (Optional)" name="bio" variant="outlined" value={doctor.bio} onChange={handleChange} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
              </Grid>
            </Grid>
          </Box>

          <Box sx={{ mt: 3, p: { xs: 2, md: 2.5 }, borderRadius: 3, bgcolor: "#fffaf5", border: "1px solid #ffe0b2" }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "#9a4d00" }}>Clinic branches</Typography>
                <Typography variant="body2" color="text.secondary">Each branch can have its own city, timing, address, and hourly capacity.</Typography>
              </Box>
              <Button size="small" startIcon={<Add />} onClick={addBranch}>Add branch</Button>
            </Stack>
            <Stack spacing={2}>
              {doctor.branches.map((branch, index) => (
                <Box key={branch._id || index} sx={{ p: 2, bgcolor: "white", borderRadius: 2, border: "1px solid #ffe0b2" }}>
                  <Grid container spacing={2}>
                    {[["name", "Branch name"], ["city", "City"], ["clinicAddress", "Clinic address"], ["availabilitySchedule", "Schedule e.g. 09:00-13:00,17:00-20:00"]].map(([field, label]) => (
                      <Grid item xs={12} sm={field === "availabilitySchedule" || field === "clinicAddress" ? 6 : 4} key={field}>
                        <TextField fullWidth label={label} value={branch[field] || ""} onChange={(event) => updateBranch(index, field, event.target.value)} size="small" />
                      </Grid>
                    ))}
                    <Grid item xs={10} sm={3}><TextField fullWidth label="Patients per slot" type="number" value={branch.slotCapacity || 4} onChange={(event) => updateBranch(index, "slotCapacity", Number(event.target.value))} size="small" /></Grid>
                    <Grid item xs={2} sm={1} sx={{ display: "flex", alignItems: "center" }}><IconButton color="error" aria-label="Remove branch" onClick={() => setDoctor((current) => ({ ...current, branches: current.branches.filter((_, branchIndex) => branchIndex !== index) }))}><Delete /></IconButton></Grid>
                  </Grid>
                </Box>
              ))}
            </Stack>
          </Box>

          <Box sx={{ mt: 3, p: { xs: 2, md: 2.5 }, borderRadius: 3, bgcolor: "#fff8f8", border: "1px solid #ffcdd2" }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "#b71c1c", mb: 1 }}>Time off and holidays</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>Patients cannot book on selected weekly off-days or holiday dates.</Typography>
            <FormControl fullWidth size="small" sx={{ mb: 2 }}>
              <InputLabel>Weekly off-days</InputLabel>
              <Select multiple value={doctor.weeklyOffDays || []} label="Weekly off-days" onChange={(event) => setDoctor((current) => ({ ...current, weeklyOffDays: event.target.value }))} renderValue={(selected) => selected.map((day) => ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][day]).join(", ")}>
                {["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].map((day, index) => <MenuItem key={day} value={index}>{day}</MenuItem>)}
              </Select>
            </FormControl>
            <Stack spacing={1.5}>
              {(doctor.holidays || []).map((holiday, index) => (
                <Stack direction={{ xs: "column", sm: "row" }} spacing={1} key={index}>
                  <TextField fullWidth size="small" type="date" label="Holiday date" InputLabelProps={{ shrink: true }} value={holiday.date || ""} onChange={(event) => setDoctor((current) => ({ ...current, holidays: current.holidays.map((item, itemIndex) => itemIndex === index ? { ...item, date: event.target.value } : item) }))} />
                  <TextField fullWidth size="small" label="Reason" value={holiday.reason || ""} onChange={(event) => setDoctor((current) => ({ ...current, holidays: current.holidays.map((item, itemIndex) => itemIndex === index ? { ...item, reason: event.target.value } : item) }))} />
                  <IconButton color="error" aria-label="Remove holiday" onClick={() => setDoctor((current) => ({ ...current, holidays: current.holidays.filter((_, itemIndex) => itemIndex !== index) }))}><Delete /></IconButton>
                </Stack>
              ))}
              <Button variant="outlined" size="small" startIcon={<Add />} onClick={addHoliday} sx={{ alignSelf: "flex-start" }}>Add holiday</Button>
            </Stack>
          </Box>

          {message && (
            <Alert severity={messageType} sx={{ mt: 3 }}>
              {message}
            </Alert>
          )}

          <Button fullWidth variant="contained" size="large" onClick={handleSubmit} disabled={saving || IsLoading || !isLoggedIn} sx={{ mt: 4, borderRadius: 2, py: 1.4, fontWeight: 700, textTransform: "none", background: "linear-gradient(135deg, #0d47a1 0%, #1976d2 100%)", boxShadow: "0 8px 20px rgba(25, 118, 210, 0.25)", '&:hover': { background: "linear-gradient(135deg, #08306b 0%, #1565c0 100%)" } }}>
            {saving ? "Saving profile..." : IsLoading ? "Checking login..." : "Save Profile"}
          </Button>

          <Snackbar open={openSnackbar} autoHideDuration={3000} onClose={handleCloseSnackbar}>
            <Alert onClose={handleCloseSnackbar} severity="success" sx={{ width: "100%" }}>
              Profile saved successfully!
            </Alert>
          </Snackbar>
        </CardContent>
      </Card>
    </Container>
  );
}
