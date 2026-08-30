// Admincontacts.jsx - Professional Version
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
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stack,
  Alert,
  Avatar,
  CircularProgress,
  TextField,
  InputAdornment,
  Tooltip,
  Box,
  Fade,
  Grow,
  Chip,
  Snackbar,
  useTheme,
  alpha,
} from "@mui/material";
import {
  Delete,
  Search,
  Mail,
  Refresh,
  Person,
  Email,
  Message,
  Close,
  CheckCircle,
  Error,
  Warning,
  Info,
  AccessTime,
} from "@mui/icons-material";

const Admincontacts = () => {
  const theme = useTheme();
  const { authorizationtoken } = useAuth();
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("info");
  const [deleteContact, setDeleteContact] = useState(null);
  const [openDelete, setOpenDelete] = useState(false);
  const [viewContact, setViewContact] = useState(null);
  const [openView, setOpenView] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "info" });

  const getAllContactData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/admin/contacts`, {
        method: "GET",
        headers: { Authorization: authorizationtoken },
      });
      const data = await response.json();
      setContacts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.log(error);
      setContacts([]);
      setSnackbar({ open: true, message: "Failed to load contacts", severity: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getAllContactData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleOpenDelete = (contact) => {
    setDeleteContact(contact);
    setOpenDelete(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteContact) return;
    try {
      const response = await fetch(
        `${API_URL}/api/admin/contacts/delete/${deleteContact._id}`,
        {
          method: "DELETE",
          headers: { Authorization: authorizationtoken },
        }
      );
      if (response.ok) {
        setSnackbar({ open: true, message: "Contact deleted successfully!", severity: "success" });
        setOpenDelete(false);
        getAllContactData();
      } else {
        setSnackbar({ open: true, message: "Failed to delete contact.", severity: "error" });
      }
    } catch (error) {
      console.log(error);
      setSnackbar({ open: true, message: "Failed to delete contact.", severity: "error" });
    }
  };

  const handleViewContact = (contact) => {
    setViewContact(contact);
    setOpenView(true);
  };

  const filteredContacts = contacts.filter((contact) => {
    const q = search.toLowerCase();
    return (
      (contact.username || "").toLowerCase().includes(q) ||
      (contact.email || "").toLowerCase().includes(q) ||
      (contact.message || "").toLowerCase().includes(q)
    );
  });

  const getInitials = (name) => {
    if (!name) return "?";
    return name.charAt(0).toUpperCase();
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4, px: { xs: 2, md: 4, lg: 6 } }}>
      {/* Breadcrumbs */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="body2" color="text.secondary">
          Admin / <strong>Contact Messages</strong>
        </Typography>
      </Box>

      {/* Hero Header */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 3, md: 5 },
          borderRadius: 4,
          mb: 4,
          background: "linear-gradient(135deg, #7B1FA2 0%, #9C27B0 50%, #AB47BC 100%)",
          color: "white",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <Box sx={{ position: "absolute", top: -50, right: -50, width: 200, height: 200, borderRadius: "50%", background: "rgba(255,255,255,0.1)" }} />
        <Box sx={{ position: "absolute", bottom: -30, left: -20, width: 150, height: 150, borderRadius: "50%", background: "rgba(255,255,255,0.05)" }} />

        <Box sx={{ position: "relative", zIndex: 1 }}>
          <Stack direction={{ xs: "column", md: "row" }} spacing={3} alignItems={{ xs: "flex-start", md: "center" }}>
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="h3" fontWeight={800} sx={{ textShadow: "0 2px 4px rgba(0,0,0,0.2)" }}>
                Contact Messages
              </Typography>
              <Typography variant="h6" sx={{ opacity: 0.9, mt: 1 }}>
                Messages submitted through the contact form
              </Typography>
            </Box>
            <Chip
              icon={<Mail />}
              label={`${contacts.length} Messages`}
              color="secondary"
              sx={{ fontWeight: 700, bgcolor: "rgba(255,255,255,0.15)", color: "white", px: 2, py: 2 }}
            />
          </Stack>
        </Box>
      </Paper>

      {/* Error Alert */}
      {message && (
        <Alert severity={messageType} sx={{ mb: 3, borderRadius: 2 }} onClose={() => setMessage("")}>
          {message}
        </Alert>
      )}

      {/* Search & Actions */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 4,
          borderRadius: 3,
          bgcolor: "white",
          border: "1px solid #e0e0e0",
        }}
      >
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems={{ xs: "stretch", sm: "center" }}>
          <TextField
            label="Search contacts"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            size="small"
            fullWidth
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
              endAdornment: search && (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => setSearch("")}>
                    <Close fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ),
              sx: { borderRadius: 2 },
            }}
            placeholder="Search by name, email or message"
          />
          <Tooltip title="Refresh">
            <IconButton
              onClick={getAllContactData}
              color="primary"
              sx={{ bgcolor: "#f5f9ff", borderRadius: 2, p: 1.2 }}
            >
              <Refresh />
            </IconButton>
          </Tooltip>
        </Stack>
      </Paper>

      {/* Contacts Table */}
      <Paper
        elevation={0}
        sx={{
          borderRadius: 4,
          overflow: "hidden",
          border: "1px solid #e0e0e0",
          boxShadow: "0 8px 32px rgba(0,0,0,0.08)",
        }}
      >
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: "#7B1FA2" }}>
                <TableCell sx={{ color: "white", fontWeight: 800, fontSize: "0.9rem" }}>User</TableCell>
                <TableCell sx={{ color: "white", fontWeight: 800, fontSize: "0.9rem" }}>Email</TableCell>
                <TableCell sx={{ color: "white", fontWeight: 800, fontSize: "0.9rem" }}>Message</TableCell>
                <TableCell sx={{ color: "white", fontWeight: 800, fontSize: "0.9rem" }}>Date</TableCell>
                <TableCell sx={{ color: "white", fontWeight: 800, fontSize: "0.9rem" }} align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 8 }}>
                    <CircularProgress sx={{ color: "#7B1FA2" }} />
                    <Typography variant="body2" sx={{ mt: 2, color: "text.secondary", fontWeight: 600 }}>
                      Loading contacts...
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : filteredContacts.length > 0 ? (
                filteredContacts.map((contact, index) => (
                  <Grow in={true} timeout={(index + 1) * 200} key={contact._id}>
                    <TableRow hover sx={{ "&:hover": { bgcolor: "rgba(123,31,162,0.04)" } }}>
                      <TableCell>
                        <Stack direction="row" spacing={1.5} alignItems="center">
                          <Avatar
                            sx={{
                              bgcolor: "#9C27B0",
                              width: 44,
                              height: 44,
                              fontWeight: 700,
                              fontSize: 18,
                              boxShadow: "0 4px 12px rgba(156,39,176,0.3)",
                            }}
                          >
                            {getInitials(contact.username)}
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle2" fontWeight={700}>
                              {contact.username}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {contact.phone || "No phone"}
                            </Typography>
                          </Box>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={0.5} alignItems="center">
                          <Email sx={{ fontSize: 16, color: "text.secondary" }} />
                          <Typography variant="body2" color="text.secondary">
                            {contact.email}
                          </Typography>
                        </Stack>
                      </TableCell>
                      <TableCell sx={{ maxWidth: 300 }}>
                        <Typography
                          variant="body2"
                          noWrap
                          title={contact.message}
                          sx={{ cursor: "pointer" }}
                          onClick={() => handleViewContact(contact)}
                        >
                          {contact.message}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {formatDate(contact.createdAt)}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Stack direction="row" spacing={1} justifyContent="center">
                          <Tooltip title="View Message">
                            <IconButton
                              size="small"
                              onClick={() => handleViewContact(contact)}
                              sx={{ color: "#7B1FA2", "&:hover": { bgcolor: "rgba(123,31,162,0.1)" } }}
                            >
                              <Mail fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete contact">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleOpenDelete(contact)}
                              sx={{ "&:hover": { bgcolor: "rgba(244,67,54,0.1)" } }}
                            >
                              <Delete fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  </Grow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 8 }}>
                    <Mail sx={{ fontSize: 48, color: "#bdbdbd", mb: 2 }} />
                    <Typography variant="h6" color="text.secondary">
                      {contacts.length === 0 ? "No contacts found." : "No contacts match your search."}
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* View Contact Dialog */}
      <Dialog
        open={openView}
        onClose={() => setOpenView(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 4 } }}
      >
        <DialogTitle sx={{ fontWeight: 800, display: "flex", alignItems: "center", gap: 1 }}>
          <Mail color="secondary" />
          Message Details
        </DialogTitle>
        <DialogContent>
          {viewContact && (
            <Stack spacing={3} sx={{ mt: 2 }}>
              <Paper sx={{ p: 2.5, borderRadius: 3, bgcolor: "#f8fbff", border: "1px solid #e3f2fd" }}>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Avatar sx={{ bgcolor: "#9C27B0", width: 56, height: 56, fontWeight: 700, fontSize: 24 }}>
                    {getInitials(viewContact.username)}
                  </Avatar>
                  <Box>
                    <Typography variant="h6" fontWeight={800}>
                      {viewContact.username}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {viewContact.email}
                    </Typography>
                    {viewContact.phone && (
                      <Typography variant="body2" color="text.secondary">
                        {viewContact.phone}
                      </Typography>
                    )}
                  </Box>
                </Stack>
              </Paper>

              <Paper sx={{ p: 3, borderRadius: 3, bgcolor: "#fafafa", border: "1px solid #e0e0e0" }}>
                <Typography variant="subtitle2" fontWeight={800} color="text.primary" sx={{ mb: 1 }}>
                  Message
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.8 }}>
                  {viewContact.message}
                </Typography>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 2 }}>
                  <AccessTime sx={{ fontSize: 16, color: "text.secondary" }} />
                  <Typography variant="caption" color="text.secondary">
                    {formatDate(viewContact.createdAt)}
                  </Typography>
                </Stack>
              </Paper>
            </Stack>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button onClick={() => setOpenView(false)} color="inherit">
            Close
          </Button>
          <Button
            variant="contained"
            color="error"
            startIcon={<Delete />}
            onClick={() => {
              setOpenView(false);
              handleOpenDelete(viewContact);
            }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog
        open={openDelete}
        onClose={() => setOpenDelete(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: 4 } }}
      >
        <DialogTitle sx={{ fontWeight: 800, color: "error.main" }}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Delete />
            Delete Contact
          </Stack>
        </DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this message from{" "}
            <strong>{deleteContact?.username}</strong>?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button onClick={() => setOpenDelete(false)}>Cancel</Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleConfirmDelete}
            sx={{ borderRadius: 2, fontWeight: 700 }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: "100%", borderRadius: 2 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Admincontacts;