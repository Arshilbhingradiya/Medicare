import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  TextField,
  Select,
  MenuItem,
  Card,
  CardContent,
  Typography,
  Button,
  Avatar,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Box,
  Chip,
  InputAdornment,
  Paper,
  Stack,
  Divider,
  Skeleton,
  IconButton,
  Rating,
  Tooltip,
  alpha,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import {
  CalendarMonth,
  LocationOn,
  Search,
  Star,
  WorkOutline,
  Close,
  Verified,
  Phone,
  LocalHospital,
  School,
  FilterAlt,
  Refresh,
  PersonSearch,
} from "@mui/icons-material";
import { API_URL } from "../../config";

// ---------- Styled Components ----------
const HeroSection = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  borderRadius: theme.spacing(3),
  color: "#fff",
  position: "relative",
  overflow: "hidden",
  background:
    "linear-gradient(125deg, #0f4c81 0%, #1976d2 55%, #38bdf8 100%)",
  "&::before": {
    content: '""',
    position: "absolute",
    top: -80,
    right: -80,
    width: 260,
    height: 260,
    borderRadius: "50%",
    background: alpha("#fff", 0.08),
  },
  "&::after": {
    content: '""',
    position: "absolute",
    bottom: -60,
    left: -60,
    width: 200,
    height: 200,
    borderRadius: "50%",
    background: alpha("#fff", 0.06),
  },
}));

const FilterPanel = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: theme.spacing(2.5),
  border: `1px solid ${alpha(theme.palette.primary.main, 0.12)}`,
  background: theme.palette.background.paper,
  boxShadow: "0 4px 20px rgba(15, 23, 42, 0.04)",
}));

const DoctorCard = styled(Card)(({ theme }) => ({
  height: "100%",
  borderRadius: theme.spacing(2.5),
  border: `1px solid ${alpha(theme.palette.divider, 0.6)}`,
  boxShadow: "0 4px 14px rgba(15, 23, 42, 0.05)",
  transition: "all 0.28s ease",
  position: "relative",
  overflow: "hidden",
  "&:hover": {
    transform: "translateY(-6px)",
    boxShadow: "0 16px 32px rgba(15, 76, 129, 0.15)",
    borderColor: theme.palette.primary.main,
    "& .book-btn": {
      background: theme.palette.primary.dark,
    },
  },
}));

// ---------- Small Info Row ----------
const InfoLine = ({ icon, text, bold }) => (
  <Stack direction="row" spacing={0.9} alignItems="center">
    <Box sx={{ color: "primary.main", display: "flex" }}>{icon}</Box>
    <Typography
      variant="body2"
      sx={{ color: "text.secondary", fontWeight: bold ? 700 : 500 }}
    >
      {text}
    </Typography>
  </Stack>
);

const DoctorSearch = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedSpecialization, setSelectedSpecialization] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const navigate = useNavigate();

  const fetchDoctors = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/doctorform/doctors`);
      if (response.ok) {
        const data = await response.json();
        const mapped = (Array.isArray(data) ? data : data.doctors || []).map(
          (doc) => {
            const rawName = doc.name || doc.username || "Unknown Doctor";
            const fullName =
              /^doctor$/i.test(rawName.trim()) && doc.fullName
                ? doc.fullName
                : rawName;
            return {
              id: doc._id,
              name: fullName,
              city: doc.city || "Unknown",
              specialization: doc.specialization || "General Physician",
              rating: 4.5,
              yearsOfExperience: doc.yearsOfExperience,
              clinicAddress: doc.clinicAddress,
              phone: doc.phone,
              qualifications: doc.qualifications,
              bio: doc.bio,
            };
          }
        );
        setDoctors(mapped);
      }
    } catch (error) {
      console.error("Failed to fetch doctors:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  const filteredDoctors = doctors.filter((doctor) => {
    return (
      (selectedCity === "" ||
        doctor.city.trim().toLowerCase() ===
          selectedCity.trim().toLowerCase()) &&
      (selectedSpecialization === "" ||
        doctor.specialization.trim().toLowerCase() ===
          selectedSpecialization.trim().toLowerCase()) &&
      doctor.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const cities = [
    ...new Set(doctors.map((doctor) => doctor.city).filter(Boolean)),
  ].sort();
  const specializations = [
    ...new Set(doctors.map((doctor) => doctor.specialization).filter(Boolean)),
  ].sort();
  const hasFilters =
    searchQuery || selectedCity || selectedSpecialization;

  return (
    <Box sx={{ bgcolor: "background.default", minHeight: "100vh", pb: 6 }}>
      <Container maxWidth="xl" sx={{ py: { xs: 3, md: 4 } }}>
        {/* ---------- HERO ---------- */}
        <HeroSection elevation={0} sx={{ mb: 4 }}>
          <Stack
            direction={{ xs: "column", md: "row" }}
            alignItems={{ xs: "flex-start", md: "center" }}
            justifyContent="space-between"
            spacing={2}
            sx={{ position: "relative", zIndex: 1 }}
          >
            <Box>
              <Typography
                variant="h3"
                fontWeight={800}
                sx={{ fontSize: { xs: "1.75rem", md: "2.25rem" } }}
              >
                Find the Right Doctor 👨‍⚕️
              </Typography>
              <Typography
                sx={{
                  opacity: 0.92,
                  mt: 1,
                  maxWidth: 620,
                  fontSize: { xs: "0.95rem", md: "1.05rem" },
                }}
              >
                Browse verified specialists, filter by city or expertise, and
                book your appointment in seconds.
              </Typography>
            </Box>
            <Stack direction="row" spacing={3}>
              <Box sx={{ textAlign: "center" }}>
                <Typography variant="h4" fontWeight={800}>
                  {doctors.length}
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.85 }}>
                  Doctors
                </Typography>
              </Box>
              <Divider
                orientation="vertical"
                flexItem
                sx={{ bgcolor: alpha("#fff", 0.25) }}
              />
              <Box sx={{ textAlign: "center" }}>
                <Typography variant="h4" fontWeight={800}>
                  {cities.length}
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.85 }}>
                  Cities
                </Typography>
              </Box>
              <Divider
                orientation="vertical"
                flexItem
                sx={{ bgcolor: alpha("#fff", 0.25) }}
              />
              <Box sx={{ textAlign: "center" }}>
                <Typography variant="h4" fontWeight={800}>
                  {specializations.length}
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.85 }}>
                  Specialties
                </Typography>
              </Box>
            </Stack>
          </Stack>
        </HeroSection>

        <Grid container spacing={3}>
          {/* ---------- FILTERS ---------- */}
          <Grid item xs={12} md={3}>
            <FilterPanel
              elevation={0}
              sx={{ position: { md: "sticky" }, top: 90 }}
            >
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                sx={{ mb: 2 }}
              >
                <Stack direction="row" spacing={1} alignItems="center">
                  <FilterAlt color="primary" />
                  <Typography variant="h6" fontWeight={800}>
                    Filters
                  </Typography>
                </Stack>
                <Tooltip title="Reset">
                  <span>
                    <IconButton
                      size="small"
                      disabled={!hasFilters}
                      onClick={() => {
                        setSearchQuery("");
                        setSelectedCity("");
                        setSelectedSpecialization("");
                      }}
                    >
                      <Refresh fontSize="small" />
                    </IconButton>
                  </span>
                </Tooltip>
              </Stack>

              <Divider sx={{ mb: 2 }} />

              <TextField
                fullWidth
                size="small"
                label="Search doctor or specialty"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                margin="normal"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search color="primary" fontSize="small" />
                    </InputAdornment>
                  ),
                }}
              />

              <FormControl fullWidth size="small" margin="normal">
                <InputLabel id="city-label">City</InputLabel>
                <Select
                  labelId="city-label"
                  label="City"
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                >
                  <MenuItem value="">All Cities</MenuItem>
                  {cities.map((city) => (
                    <MenuItem key={city} value={city}>
                      {city}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth size="small" margin="normal">
                <InputLabel id="specialization-label">
                  Specialization
                </InputLabel>
                <Select
                  labelId="specialization-label"
                  label="Specialization"
                  value={selectedSpecialization}
                  onChange={(e) => setSelectedSpecialization(e.target.value)}
                >
                  <MenuItem value="">All Specialties</MenuItem>
                  {specializations.map((spec) => (
                    <MenuItem key={spec} value={spec}>
                      {spec}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {hasFilters && (
                <Button
                  fullWidth
                  variant="text"
                  size="small"
                  sx={{ mt: 2, textTransform: "none" }}
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCity("");
                    setSelectedSpecialization("");
                  }}
                >
                  Clear all filters
                </Button>
              )}
            </FilterPanel>
          </Grid>

          {/* ---------- RESULTS ---------- */}
          <Grid item xs={12} md={9}>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              sx={{ mb: 2 }}
            >
              <Box>
                <Typography variant="h6" fontWeight={800}>
                  {loading
                    ? "Loading doctors..."
                    : `${filteredDoctors.length} doctor${
                        filteredDoctors.length === 1 ? "" : "s"
                      } available`}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Verified specialists ready to help you
                </Typography>
              </Box>
            </Stack>

            {loading ? (
              <Grid container spacing={2.5}>
                {[1, 2, 3, 4].map((i) => (
                  <Grid item xs={12} sm={6} key={i}>
                    <Skeleton
                      variant="rounded"
                      height={260}
                      sx={{ borderRadius: 2.5 }}
                    />
                  </Grid>
                ))}
              </Grid>
            ) : filteredDoctors.length === 0 ? (
              <Paper
                variant="outlined"
                sx={{
                  p: 6,
                  textAlign: "center",
                  borderRadius: 3,
                  border: "2px dashed",
                  borderColor: "divider",
                }}
              >
                <PersonSearch
                  sx={{ fontSize: 64, color: "text.disabled", mb: 1 }}
                />
                <Typography variant="h6" fontWeight={700}>
                  No doctors match these filters
                </Typography>
                <Typography color="text.secondary" sx={{ mt: 1 }}>
                  Try another city, specialty, or search term.
                </Typography>
                <Button
                  sx={{ mt: 2, textTransform: "none" }}
                  variant="contained"
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCity("");
                    setSelectedSpecialization("");
                  }}
                >
                  Reset filters
                </Button>
              </Paper>
            ) : (
              <Grid container spacing={2.5}>
                {filteredDoctors.map((doctor) => (
                  <Grid item xs={12} sm={6} key={doctor.id}>
                    <DoctorCard>
                      <CardContent sx={{ p: 3 }}>
                        {/* Doctor header */}
                        <Stack
                          direction="row"
                          spacing={2}
                          alignItems="center"
                        >
                          <Avatar
                            sx={{
                              width: 60,
                              height: 60,
                              bgcolor: "primary.main",
                              fontSize: 22,
                              fontWeight: 800,
                            }}
                          >
                            {doctor.name.slice(0, 1).toUpperCase()}
                          </Avatar>
                          <Box sx={{ minWidth: 0, flexGrow: 1 }}>
                            <Stack
                              direction="row"
                              alignItems="center"
                              spacing={0.5}
                            >
                              <Typography
                                variant="h6"
                                fontWeight={800}
                                noWrap
                                sx={{ fontSize: "1.05rem" }}
                              >
                                {doctor.name}
                              </Typography>
                              <Tooltip title="Verified Doctor">
                                <Verified
                                  sx={{
                                    color: "primary.main",
                                    fontSize: 18,
                                  }}
                                />
                              </Tooltip>
                            </Stack>
                            <Chip
                              size="small"
                              label={doctor.specialization}
                              color="primary"
                              variant="outlined"
                              sx={{
                                mt: 0.5,
                                maxWidth: "100%",
                                fontWeight: 600,
                              }}
                            />
                          </Box>
                        </Stack>

                        {/* Info */}
                        <Stack spacing={1} sx={{ mt: 2.25 }}>
                          <InfoLine
                            icon={<LocationOn fontSize="small" />}
                            text={doctor.city}
                          />
                          <InfoLine
                            icon={<WorkOutline fontSize="small" />}
                            text={
                              doctor.yearsOfExperience
                                ? `${doctor.yearsOfExperience} years experience`
                                : "Experience available on profile"
                            }
                          />
                          <Stack
                            direction="row"
                            spacing={0.75}
                            alignItems="center"
                          >
                            <Rating
                              value={doctor.rating}
                              precision={0.1}
                              size="small"
                              readOnly
                            />
                            <Typography
                              variant="body2"
                              fontWeight={700}
                              color="text.primary"
                            >
                              {doctor.rating}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              patient rating
                            </Typography>
                          </Stack>
                        </Stack>

                        {/* Actions */}
                        <Stack
                          direction="row"
                          spacing={1.25}
                          sx={{ mt: 3 }}
                        >
                          <Button
                            fullWidth
                            variant="outlined"
                            onClick={() => setSelectedDoctor(doctor)}
                            sx={{
                              borderRadius: 2,
                              textTransform: "none",
                              fontWeight: 700,
                            }}
                          >
                            View Profile
                          </Button>
                          <Button
                            fullWidth
                            className="book-btn"
                            variant="contained"
                            startIcon={<CalendarMonth />}
                            onClick={() =>
                              navigate(
                                `/patientappoinment?doctor=${doctor.id}`
                              )
                            }
                            sx={{
                              borderRadius: 2,
                              textTransform: "none",
                              fontWeight: 700,
                              transition: "background 0.25s",
                            }}
                          >
                            Book
                          </Button>
                        </Stack>
                      </CardContent>
                    </DoctorCard>
                  </Grid>
                ))}
              </Grid>
            )}
          </Grid>
        </Grid>
      </Container>

      {/* ---------- DOCTOR DETAILS DIALOG ---------- */}
      <Dialog
        open={Boolean(selectedDoctor)}
        onClose={() => setSelectedDoctor(null)}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        {selectedDoctor && (
          <>
            {/* Header with gradient */}
            <Box
              sx={{
                position: "relative",
                background:
                  "linear-gradient(125deg, #0f4c81, #1976d2 65%, #38bdf8)",
                color: "#fff",
                p: 3,
                pb: 6,
              }}
            >
              <IconButton
                onClick={() => setSelectedDoctor(null)}
                sx={{
                  position: "absolute",
                  top: 12,
                  right: 12,
                  color: "#fff",
                  bgcolor: alpha("#fff", 0.15),
                  "&:hover": { bgcolor: alpha("#fff", 0.25) },
                }}
              >
                <Close fontSize="small" />
              </IconButton>

              <Stack direction="row" spacing={2.5} alignItems="center">
                <Avatar
                  sx={{
                    width: 84,
                    height: 84,
                    bgcolor: alpha("#fff", 0.2),
                    fontSize: 32,
                    fontWeight: 800,
                    border: `3px solid ${alpha("#fff", 0.4)}`,
                  }}
                >
                  {selectedDoctor.name.slice(0, 1).toUpperCase()}
                </Avatar>
                <Box>
                  <Stack
                    direction="row"
                    alignItems="center"
                    spacing={1}
                  >
                    <Typography variant="h5" fontWeight={800}>
                      {selectedDoctor.name}
                    </Typography>
                    <Verified />
                  </Stack>
                  <Typography sx={{ opacity: 0.9 }}>
                    {selectedDoctor.specialization}
                  </Typography>
                  <Stack
                    direction="row"
                    spacing={1}
                    alignItems="center"
                    sx={{ mt: 0.5 }}
                  >
                    <Rating
                      value={selectedDoctor.rating}
                      precision={0.1}
                      size="small"
                      readOnly
                      sx={{ color: "#fbbf24" }}
                    />
                    <Typography variant="body2">
                      {selectedDoctor.rating} · Patient rating
                    </Typography>
                  </Stack>
                </Box>
              </Stack>
            </Box>

            {/* Content */}
            <DialogContent sx={{ mt: -4 }}>
              <Paper
                elevation={3}
                sx={{ borderRadius: 3, p: 3, mb: 2 }}
              >
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Stack spacing={1.25}>
                      <InfoLine
                        icon={<LocalHospital fontSize="small" />}
                        text={`Specialization: ${
                          selectedDoctor.specialization || "N/A"
                        }`}
                      />
                      <InfoLine
                        icon={<LocationOn fontSize="small" />}
                        text={`City: ${selectedDoctor.city || "N/A"}`}
                      />
                      <InfoLine
                        icon={<WorkOutline fontSize="small" />}
                        text={`Experience: ${
                          selectedDoctor.yearsOfExperience || "N/A"
                        } years`}
                      />
                    </Stack>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Stack spacing={1.25}>
                      <InfoLine
                        icon={<School fontSize="small" />}
                        text={`Qualifications: ${
                          selectedDoctor.qualifications || "N/A"
                        }`}
                      />
                      <InfoLine
                        icon={<Phone fontSize="small" />}
                        text={`Contact: ${selectedDoctor.phone || "N/A"}`}
                      />
                      <InfoLine
                        icon={<LocationOn fontSize="small" />}
                        text={`Clinic: ${
                          selectedDoctor.clinicAddress || "N/A"
                        }`}
                      />
                    </Stack>
                  </Grid>
                </Grid>

                {selectedDoctor.bio && (
                  <>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="subtitle2" fontWeight={700} gutterBottom>
                      About
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {selectedDoctor.bio}
                    </Typography>
                  </>
                )}
              </Paper>
            </DialogContent>

            <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
              <Button
                onClick={() => setSelectedDoctor(null)}
                sx={{
                  borderRadius: 2,
                  textTransform: "none",
                  fontWeight: 600,
                }}
              >
                Close
              </Button>
              <Button
                variant="contained"
                startIcon={<CalendarMonth />}
                onClick={() =>
                  navigate(`/patientappoinment?doctor=${selectedDoctor.id}`)
                }
                sx={{
                  borderRadius: 2,
                  textTransform: "none",
                  fontWeight: 700,
                  px: 3,
                }}
              >
                Book Appointment
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default DoctorSearch;