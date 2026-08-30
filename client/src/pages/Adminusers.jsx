import { useEffect, useState } from "react";
import { useAuth } from "../store/auth";
import { API_URL } from "../config";
import {
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  TextField,
  MenuItem,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
  Chip,
  Alert,
  Avatar,
  CircularProgress,
  Box,
  InputAdornment,
  Tooltip,
  Snackbar,
  Fade,
  alpha,
  useTheme,
} from "@mui/material";
import {
  Delete,
  Edit,
  Search,
  Person,
  MedicalServices,
  AdminPanelSettings,
  Refresh,
} from "@mui/icons-material";

const Adminusers = () => {
  const theme = useTheme();
  const { authorizationtoken } = useAuth();
  
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState("All");
  const [search, setSearch] = useState("");
  
  // Notification State
  const [snackbar, setSnackbar] = useState({ open: false, message: "", type: "info" });

  // Edit dialog state
  const [editUser, setEditUser] = useState(null);
  const [openEdit, setOpenEdit] = useState(false);
  const [editForm, setEditForm] = useState({
    username: "",
    email: "",
    phone: "",
    role: "",
  });

  // Delete confirmation
  const [deleteUser, setDeleteUser] = useState(null);
  const [openDelete, setOpenDelete] = useState(false);

  const showMessage = (message, type = "info") => {
    setSnackbar({ open: true, message, type });
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const getAllUsersData = async () => {
    try {
      setLoading(true);
      const query = new URLSearchParams();
      if (roleFilter && roleFilter !== "All") query.set("role", roleFilter);
      if (search) query.set("search", search);

      const response = await fetch(
        `${API_URL}/api/admin/users?${query.toString()}`,
        {
          method: "GET",
          headers: { Authorization: authorizationtoken },
        }
      );
      const data = await response.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.log(error);
      setUsers([]);
      showMessage("Failed to fetch users.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getAllUsersData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roleFilter, search]);

  const handleOpenEdit = (user) => {
    setEditUser(user);
    setEditForm({
      username: user.username || "",
      email: user.email || "",
      phone: user.phone || "",
      role: user.role || "Patient",
    });
    setOpenEdit(true);
  };

  const handleSaveEdit = async () => {
    if (!editUser) return;
    try {
      const response = await fetch(
        `${API_URL}/api/admin/users/update/${editUser._id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: authorizationtoken,
          },
          body: JSON.stringify(editForm),
        }
      );
      if (response.ok) {
        showMessage("User updated successfully!", "success");
        setOpenEdit(false);
        getAllUsersData();
      } else {
        showMessage("Failed to update user.", "error");
      }
    } catch (error) {
      console.log(error);
      showMessage("Failed to update user.", "error");
    }
  };

  const handleOpenDelete = (user) => {
    setDeleteUser(user);
    setOpenDelete(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteUser) return;
    try {
      const response = await fetch(
        `${API_URL}/api/admin/users/delete/${deleteUser._id}`,
        {
          method: "DELETE",
          headers: { Authorization: authorizationtoken },
        }
      );
      if (response.ok) {
        showMessage("User deleted successfully!", "success");
        setOpenDelete(false);
        getAllUsersData();
      } else {
        showMessage("Failed to delete user.", "error");
      }
    } catch (error) {
      console.log(error);
      showMessage("Failed to delete user.", "error");
    }
  };

  // --- UI Helpers ---
  const getRoleBadge = (role) => {
    const isDoc = (role || "").toLowerCase() === "doctor";
    return (
      <Chip
        icon={isDoc ? <MedicalServices sx={{ fontSize: 16 }} /> : <Person sx={{ fontSize: 16 }} />}
        label={role || 'User'}
        size="small"
        sx={{
          bgcolor: isDoc ? alpha("#00A76F", 0.16) : alpha("#1976D2", 0.16),
          color: isDoc ? "#00A76F" : "#1976D2",
          fontWeight: 700,
          borderRadius: "6px",
          "& .MuiChip-icon": { color: "inherit" }
        }}
      />
    );
  };

  return (
    <Fade in={true} timeout={800}>
      <Box sx={{ flexGrow: 1, minHeight: "100vh", bgcolor: "#F4F6F8", pt: 4, pb: 8, px: { xs: 2, md: 4, xl: 8 } }}>
        
        {/* Floating Snackbar for Notifications */}
        <Snackbar open={snackbar.open} autoHideDuration={5000} onClose={handleCloseSnackbar} anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
          <Alert onClose={handleCloseSnackbar} severity={snackbar.type} sx={{ width: '100%', borderRadius: 2, boxShadow: 3 }}>
            {snackbar.message}
          </Alert>
        </Snackbar>

        {/* Header Section */}
        <Box sx={{ mb: 5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h3" sx={{ fontWeight: 800, color: "#212B36", mb: 1 }}>
              Manage Users
            </Typography>
            <Typography variant="body1" sx={{ color: "#637381" }}>
              View, edit, and manage all registered patients and doctors across the platform.
            </Typography>
          </Box>
        </Box>

        {/* Filters & Actions Card */}
        <Paper 
          sx={{ 
            p: 3, 
            mb: 4, 
            borderRadius: "16px", 
            boxShadow: "rgba(145, 158, 171, 0.2) 0px 0px 2px 0px, rgba(145, 158, 171, 0.12) 0px 12px 24px -4px",
            display: 'flex', 
            flexDirection: { xs: 'column', md: 'row' },
            gap: 3,
            alignItems: 'center'
          }}
        >
          <TextField
            fullWidth
            placeholder="Search by name, email or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search sx={{ color: '#919EAB' }} />
                </InputAdornment>
              ),
              sx: { borderRadius: '10px', bgcolor: '#F4F6F8', '& fieldset': { border: 'none' } }
            }}
          />
          <TextField
            select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            sx={{ 
              minWidth: { xs: '100%', md: 240 },
              '& .MuiOutlinedInput-root': { borderRadius: '10px', bgcolor: '#F4F6F8', '& fieldset': { border: 'none' } } 
            }}
          >
            <MenuItem value="All">All Roles</MenuItem>
            <MenuItem value="Patient">Patients</MenuItem>
            <MenuItem value="Doctor">Doctors</MenuItem>
          </TextField>
          
          <Tooltip title="Refresh Data">
            <IconButton 
              onClick={getAllUsersData} 
              sx={{ 
                bgcolor: alpha("#1976D2", 0.1), 
                color: "#1976D2", 
                borderRadius: '10px',
                p: 1.5,
                '&:hover': { bgcolor: alpha("#1976D2", 0.2) }
              }}
            >
              <Refresh />
            </IconButton>
          </Tooltip>
        </Paper>

        {/* Users Data Table */}
        <Paper sx={{ borderRadius: "16px", boxShadow: "rgba(145, 158, 171, 0.2) 0px 0px 2px 0px, rgba(145, 158, 171, 0.12) 0px 12px 24px -4px", overflow: "hidden" }}>
          <TableContainer>
            <Table sx={{ minWidth: 800 }}>
              <TableHead sx={{ bgcolor: alpha("#919EAB", 0.08) }}>
                <TableRow>
                  <TableCell sx={{ color: "#637381", fontWeight: 700, borderBottom: 'none' }}>USER DETAILS</TableCell>
                  <TableCell sx={{ color: "#637381", fontWeight: 700, borderBottom: 'none' }}>CONTACT</TableCell>
                  <TableCell sx={{ color: "#637381", fontWeight: 700, borderBottom: 'none' }}>ROLE</TableCell>
                  <TableCell sx={{ color: "#637381", fontWeight: 700, borderBottom: 'none', textAlign: 'center' }}>ACTIONS</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={4} align="center" sx={{ py: 10 }}>
                      <CircularProgress sx={{ color: '#1976D2' }} />
                      <Typography variant="body2" sx={{ mt: 2, color: "#637381", fontWeight: 600 }}>Loading Users...</Typography>
                    </TableCell>
                  </TableRow>
                ) : users.length > 0 ? (
                  users.map((user) => (
                    <TableRow key={user._id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                      <TableCell>
                        <Stack direction="row" spacing={2} alignItems="center">
                          <Avatar sx={{ bgcolor: alpha("#1976D2", 0.12), color: "#1976D2", fontWeight: 700, width: 48, height: 48 }}>
                            {(user.username || "?").charAt(0).toUpperCase()}
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "#212B36" }}>
                              {user.username}
                            </Typography>
                            {user.isAdmin && (
                              <Chip
                                icon={<AdminPanelSettings sx={{ fontSize: 14 }} />}
                                label="Administrator"
                                size="small"
                                sx={{ height: 22, fontSize: 11, mt: 0.5, bgcolor: alpha("#FF5630", 0.16), color: "#FF5630", fontWeight: 700 }}
                              />
                            )}
                          </Box>
                        </Stack>
                      </TableCell>
                      
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: "#212B36" }}>{user.email}</Typography>
                        <Typography variant="caption" sx={{ color: "#919EAB" }}>{user.phone || "No phone provided"}</Typography>
                      </TableCell>
                      
                      <TableCell>{getRoleBadge(user.role)}</TableCell>
                      
                      <TableCell align="center">
                        <Stack direction="row" spacing={1} justifyContent="center">
                          <Tooltip title="Edit Profile">
                            <IconButton 
                              onClick={() => handleOpenEdit(user)} 
                              sx={{ color: '#637381', bgcolor: alpha("#919EAB", 0.08), '&:hover': { color: '#1976D2', bgcolor: alpha("#1976D2", 0.12) } }}
                            >
                              <Edit fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title={user.isAdmin ? "Cannot delete admin" : "Delete User"}>
                            <span>
                              <IconButton
                                onClick={() => handleOpenDelete(user)}
                                disabled={user.isAdmin}
                                sx={{ color: '#637381', bgcolor: alpha("#919EAB", 0.08), '&:hover': { color: '#FF5630', bgcolor: alpha("#FF5630", 0.12) } }}
                              >
                                <Delete fontSize="small" />
                              </IconButton>
                            </span>
                          </Tooltip>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} align="center" sx={{ py: 8 }}>
                      <Typography variant="h6" color="#919EAB">No users found matching your criteria.</Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>

        {/* --- Edit Dialog --- */}
        <Dialog open={openEdit} onClose={() => setOpenEdit(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: '16px', p: 1 } }}>
          <DialogTitle sx={{ fontWeight: 800, color: "#212B36", pb: 1 }}>Edit User Profile</DialogTitle>
          <DialogContent>
            <Stack spacing={3} sx={{ mt: 2 }}>
              <TextField
                fullWidth
                label="Username"
                value={editForm.username}
                onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
              />
              <TextField
                fullWidth
                label="Email Address"
                value={editForm.email}
                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
              />
              <TextField
                fullWidth
                label="Phone Number"
                value={editForm.phone}
                onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
              />
              <TextField
                fullWidth
                select
                label="Assigned Role"
                value={editForm.role}
                onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
              >
                <MenuItem value="Patient">Patient</MenuItem>
                <MenuItem value="Doctor">Doctor</MenuItem>
              </TextField>
            </Stack>
          </DialogContent>
          <DialogActions sx={{ p: 3, pt: 0 }}>
            <Button onClick={() => setOpenEdit(false)} sx={{ color: "#637381", fontWeight: 700 }}>Cancel</Button>
            <Button variant="contained" onClick={handleSaveEdit} sx={{ borderRadius: '8px', fontWeight: 700, px: 3, boxShadow: "0 8px 16px 0 rgba(25, 118, 210, 0.24)" }}>
              Save Changes
            </Button>
          </DialogActions>
        </Dialog>

        {/* --- Delete Confirmation Dialog --- */}
        <Dialog open={openDelete} onClose={() => setOpenDelete(false)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: '16px', p: 1 } }}>
          <DialogTitle sx={{ fontWeight: 800, color: "#FF5630", pb: 1 }}>
            Confirm Deletion
          </DialogTitle>
          <DialogContent>
            <Typography sx={{ color: "#637381", lineHeight: 1.6 }}>
              Are you sure you want to permanently delete <strong>{deleteUser?.username}</strong>? 
              This action cannot be undone and will also remove their profile and active subscriptions.
            </Typography>
          </DialogContent>
          <DialogActions sx={{ p: 3, pt: 0 }}>
            <Button onClick={() => setOpenDelete(false)} sx={{ color: "#637381", fontWeight: 700 }}>Cancel</Button>
            <Button 
              variant="contained" 
              color="error" 
              onClick={handleConfirmDelete} 
              sx={{ borderRadius: '8px', fontWeight: 700, px: 3, bgcolor: "#FF5630", boxShadow: "0 8px 16px 0 rgba(255, 86, 48, 0.24)", '&:hover': { bgcolor: '#B71D18' } }}
            >
              Delete User
            </Button>
          </DialogActions>
        </Dialog>

      </Box>
    </Fade>
  );
};

export default Adminusers;