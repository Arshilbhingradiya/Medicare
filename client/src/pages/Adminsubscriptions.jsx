import { useEffect, useState } from "react";
import { useAuth } from "../store/auth";
import { API_URL } from "../config";
import {
  Container,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Select,
  MenuItem,
FormControl,
  InputLabel,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Stack,
  Alert,
} from "@mui/material";

const Adminsubscriptions = () => {
  const { authorizationtoken } = useAuth();
  const [doctors, setDoctors] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [editDoctor, setEditDoctor] = useState(null);
  const [editStatus, setEditStatus] = useState("");
  const [editPlan, setEditPlan] = useState("");
  const [editExpiry, setEditExpiry] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("info");

  const fetchData = async () => {
    try {
      const [docsRes, subsRes] = await Promise.all([
        fetch(`${API_URL}/api/admin/doctors`, {
          headers: { Authorization: authorizationtoken },
        }),
        fetch(`${API_URL}/api/admin/subscriptions`, {
          headers: { Authorization: authorizationtoken },
        }),
      ]);
      if (docsRes.ok) {
        const data = await docsRes.json();
        setDoctors(Array.isArray(data) ? data : []);
      }
      if (subsRes.ok) {
        const data = await subsRes.json();
        setSubscriptions(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error("Error fetching admin data:", error);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleOpenEdit = (doctor) => {
    setEditDoctor(doctor);
    setEditStatus(doctor.subscriptionStatus || "Free");
    setEditPlan(doctor.subscriptionPlan || "Free");
    setEditExpiry(
      doctor.subscriptionExpiry
        ? new Date(doctor.subscriptionExpiry).toISOString().split("T")[0]
        : ""
    );
    setOpenDialog(true);
  };

  const handleSave = async () => {
    if (!editDoctor) return;
    try {
      const response = await fetch(
        `${API_URL}/api/admin/doctors/subscription/${editDoctor._id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: authorizationtoken,
          },
          body: JSON.stringify({
            subscriptionStatus: editStatus,
            subscriptionPlan: editPlan,
            subscriptionExpiry: editExpiry || undefined,
          }),
        }
      );
      if (response.ok) {
        setMessageType("success");
        setMessage("Subscription updated successfully!");
        setOpenDialog(false);
        fetchData();
      } else {
        setMessageType("error");
        setMessage("Failed to update subscription.");
      }
    } catch (error) {
      console.error("Error updating subscription:", error);
      setMessageType("error");
      setMessage("Failed to update subscription.");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Active":
        return "success";
      case "Expired":
        return "error";
      case "Pending":
        return "warning";
      default:
        return "default";
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4, px: { xs: 2, md: 4 } }}>
      <Paper elevation={0} sx={{ p: 3, mb: 3, borderRadius: 3, background: "linear-gradient(135deg, #0d47a1 0%, #1976d2 100%)", color: "white" }}>
        <Typography variant="h4" sx={{ fontWeight: 800 }}>
          Manage Doctor Subscriptions
        </Typography>
        <Typography variant="body1" sx={{ opacity: 0.95, mt: 0.5 }}>
          View and manage subscription plans for all registered doctors.
        </Typography>
      </Paper>

      {message && (
        <Alert severity={messageType} sx={{ mb: 3, borderRadius: 2 }} onClose={() => setMessage("")}>
          {message}
        </Alert>
      )}

      <Paper elevation={2} sx={{ p: 3, borderRadius: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: "primary.main" }}>
          Doctors & Their Subscriptions
        </Typography>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: "#f5f9ff" }}>
<TableCell sx={{ fontWeight: 700 }}>Doctor</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Specialization</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>City</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Plan</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Trial</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Trial Start</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Trial End</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Expiry</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {doctors.length > 0 ? (
                doctors.map((doctor) => (
                  <TableRow key={doctor._id} hover>
                    <TableCell sx={{ fontWeight: 600 }}>{doctor.name}</TableCell>
                    <TableCell>{doctor.specialization}</TableCell>
                    <TableCell>{doctor.city}</TableCell>
                    <TableCell>
                      <Chip label={doctor.subscriptionPlan || "Free"} color="primary" size="small" variant="outlined" />
                    </TableCell>
<TableCell>
                      <Chip
                        label={doctor.subscriptionStatus || "Free"}
                        color={getStatusColor(doctor.subscriptionStatus)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {doctor.isTrialActive ? (
                        <Chip label="Trial Active" color="info" size="small" />
                      ) : doctor.trialStartDate ? (
                        <Chip label="Expired" color="default" size="small" />
                      ) : (
                        "—"
                      )}
                    </TableCell>
                    <TableCell>
                      {doctor.trialStartDate
                        ? new Date(doctor.trialStartDate).toLocaleDateString()
                        : "—"}
                    </TableCell>
                    <TableCell>
                      {doctor.trialEndDate
                        ? new Date(doctor.trialEndDate).toLocaleDateString()
                        : "—"}
                    </TableCell>
                    <TableCell>
                      {doctor.subscriptionExpiry
                        ? new Date(doctor.subscriptionExpiry).toLocaleDateString()
                        : "—"}
                    </TableCell>
                    <TableCell>
                      <Button size="small" variant="outlined" onClick={() => handleOpenEdit(doctor)}>
                        Manage
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={10} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary">No doctors found.</Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Paper elevation={2} sx={{ p: 3, mt: 3, borderRadius: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: "primary.main" }}>
          Subscription Transactions
        </Typography>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: "#f5f9ff" }}>
                <TableCell sx={{ fontWeight: 700 }}>Doctor</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Plan</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Price</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Payment Ref</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Expiry</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {subscriptions.length > 0 ? (
                subscriptions.map((sub) => (
                  <TableRow key={sub._id} hover>
                    <TableCell sx={{ fontWeight: 600 }}>
                      {sub.doctorId?.name || sub.userId?.username || "Unknown"}
                    </TableCell>
                    <TableCell>{sub.plan}</TableCell>
                    <TableCell>₹{sub.price}</TableCell>
                    <TableCell>{sub.paymentReference || "—"}</TableCell>
                    <TableCell>
                      <Chip label={sub.status} color={getStatusColor(sub.status)} size="small" />
                    </TableCell>
                    <TableCell>
                      {sub.expiryDate ? new Date(sub.expiryDate).toLocaleDateString() : "—"}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary">No subscriptions found.</Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Edit Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Manage Subscription</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            {editDoctor && (
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                {editDoctor.name} - {editDoctor.specialization}
              </Typography>
            )}
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={editStatus}
                label="Status"
                onChange={(e) => setEditStatus(e.target.value)}
              >
                <MenuItem value="Free">Free</MenuItem>
                <MenuItem value="Active">Active</MenuItem>
                <MenuItem value="Expired">Expired</MenuItem>
                <MenuItem value="Pending">Pending</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Plan</InputLabel>
<Select value={editPlan} label="Plan" onChange={(e) => setEditPlan(e.target.value)}>
                <MenuItem value="Free">Free</MenuItem>
                <MenuItem value="Monthly">Monthly</MenuItem>
                <MenuItem value="Yearly">Yearly</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Expiry Date"
              type="date"
              value={editExpiry}
              onChange={(e) => setEditExpiry(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button variant="contained" color="primary" onClick={handleSave}>
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Adminsubscriptions;
