import { useEffect, useState } from "react";
import { useAuth } from "../store/auth";
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
  const { authorizationtoken } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("info");

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

  const getAllUsersData = async () => {
    try {
      setLoading(true);
      const query = new URLSearchParams();
      if (roleFilter && roleFilter !== "All") query.set("role", roleFilter);
      if (search) query.set("search", search);

      const response = await fetch(
        `http://localhost:3000/api/admin/users?${query.toString()}`,
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
        `http://localhost:3000/api/admin/users/update/${editUser._id}`,
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
        setMessageType("success");
        setMessage("User updated successfully!");
        setOpenEdit(false);
        getAllUsersData();
      } else {
        setMessageType("error");
        setMessage("Failed to update user.");
      }
    } catch (error) {
      console.log(error);
      setMessageType("error");
      setMessage("Failed to update user.");
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
        `http://localhost:3000/api/admin/users/delete/${deleteUser._id}`,
        {
          method: "DELETE",
          headers: { Authorization: authorizationtoken },
        }
      );
      if (response.ok) {
        setMessageType("success");
        setMessage("User deleted successfully!");
        setOpenDelete(false);
        getAllUsersData();
      } else {
        setMessageType("error");
        setMessage("Failed to delete user.");
      }
    } catch (error) {
      console.log(error);
      setMessageType("error");
      setMessage("Failed to delete user.");
    }
  };

  const getRoleIcon = (role) => {
    const r = (role || "").toLowerCase();
    if (r === "doctor") return <MedicalServices sx={{ fontSize: 16 }} />;
    return <Person sx={{ fontSize: 16 }} />;
  };

  const getRoleColor = (role) => {
    const r = (role || "").toLowerCase();
    if (r === "doctor") return "secondary";
    return "primary";
  };

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
          Manage Users
        </Typography>
        <Typography variant="body1" sx={{ opacity: 0.95, mt: 0.5 }}>
          View, edit and manage all registered patients and doctors.
        </Typography>
      </Paper>

      {message && (
        <Alert severity={messageType} sx={{ mb: 3, borderRadius: 2 }} onClose={() => setMessage("")}>
          {message}
        </Alert>
      )}

      {/* Filters */}
      <Paper elevation={2} sx={{ p: 2.5, mb: 3, borderRadius: 3 }}>
        <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems={{ xs: "stretch", md: "center" }}>
          <TextField
            label="Search users"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ flex: 1 }}
            size="small"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
            placeholder="Search by name, email or phone"
          />
          <TextField
            select
            label="Filter by Role"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            sx={{ minWidth: 200 }}
            size="small"
          >
            <MenuItem value="All">All Roles</MenuItem>
            <MenuItem value="Patient">Patients</MenuItem>
            <MenuItem value="Doctor">Doctors</MenuItem>
          </TextField>
          <Tooltip title="Refresh">
            <IconButton onClick={getAllUsersData} color="primary">
              <Refresh />
            </IconButton>
          </Tooltip>
        </Stack>
      </Paper>

      {/* Users Table */}
      <Paper elevation={2} sx={{ borderRadius: 3, overflow: "hidden" }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: "#0d47a1" }}>
                <TableCell sx={{ color: "white", fontWeight: 700 }}>User</TableCell>
                <TableCell sx={{ color: "white", fontWeight: 700 }}>Email</TableCell>
                <TableCell sx={{ color: "white", fontWeight: 700 }}>Role</TableCell>
                <TableCell sx={{ color: "white", fontWeight: 700 }}>Phone</TableCell>
                <TableCell sx={{ color: "white", fontWeight: 700 }} align="center">
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : users.length > 0 ? (
                users.map((user) => (
                  <TableRow key={user._id} hover>
                    <TableCell>
                      <Stack direction="row" spacing={1.5} alignItems="center">
                        <Avatar sx={{ bgcolor: "#1976d2", width: 40, height: 40 }}>
                          {(user.username || "?").charAt(0).toUpperCase()}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle2" fontWeight={600}>
                            {user.username}
                          </Typography>
                          {user.isAdmin && (
                            <Chip
                              icon={<AdminPanelSettings sx={{ fontSize: 14 }} />}
                              label="Admin"
                              size="small"
                              color="error"
                              variant="outlined"
                              sx={{ height: 20, fontSize: 11 }}
                            />
                          )}
                        </Box>
                      </Stack>
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Chip
                        icon={getRoleIcon(user.role)}
                        label={user.role}
                        color={getRoleColor(user.role)}
                        variant="outlined"
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{user.phone}</TableCell>
                    <TableCell align="center">
                      <Stack direction="row" spacing={1} justifyContent="center">
                        <Tooltip title="Edit user">
                          <IconButton color="primary" onClick={() => handleOpenEdit(user)} size="small">
                            <Edit />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete user">
                          <IconButton
                            color="error"
                            onClick={() => handleOpenDelete(user)}
                            disabled={user.isAdmin}
                            size="small"
                          >
                            <Delete />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                    <Typography color="text.secondary">No users found.</Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Edit Dialog */}
      <Dialog open={openEdit} onClose={() => setOpenEdit(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Edit User</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              fullWidth
              label="Username"
              value={editForm.username}
              onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
            />
            <TextField
              fullWidth
              label="Email"
              value={editForm.email}
              onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
            />
            <TextField
              fullWidth
              label="Phone"
              value={editForm.phone}
              onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
            />
            <TextField
              fullWidth
              select
              label="Role"
              value={editForm.role}
              onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
            >
              <MenuItem value="Patient">Patient</MenuItem>
              <MenuItem value="Doctor">Doctor</MenuItem>
            </TextField>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button onClick={() => setOpenEdit(false)}>Cancel</Button>
          <Button variant="contained" color="primary" onClick={handleSaveEdit}>
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={openDelete} onClose={() => setOpenDelete(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, color: "error.main" }}>
          Delete User
        </DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete{" "}
            <strong>{deleteUser?.username}</strong>? This action cannot be
            undone and will also remove their doctor profile and subscription if
            applicable.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button onClick={() => setOpenDelete(false)}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handleConfirmDelete}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Adminusers;
