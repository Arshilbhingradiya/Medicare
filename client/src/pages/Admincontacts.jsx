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
} from "@mui/material";
import { Delete, Search, Mail, Refresh } from "@mui/icons-material";

const Admincontacts = () => {
  const { authorizationtoken } = useAuth();
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("info");
  const [deleteContact, setDeleteContact] = useState(null);
  const [openDelete, setOpenDelete] = useState(false);

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
        setMessageType("success");
        setMessage("Contact deleted successfully!");
        setOpenDelete(false);
        getAllContactData();
      } else {
        setMessageType("error");
        setMessage("Failed to delete contact.");
      }
    } catch (error) {
      console.log(error);
      setMessageType("error");
      setMessage("Failed to delete contact.");
    }
  };

  const filteredContacts = contacts.filter((contact) => {
    const q = search.toLowerCase();
    return (
      (contact.username || "").toLowerCase().includes(q) ||
      (contact.email || "").toLowerCase().includes(q) ||
      (contact.message || "").toLowerCase().includes(q)
    );
  });

  return (
    <Container maxWidth="xl" sx={{ py: 4, px: { xs: 2, md: 4 } }}>
      <Paper
        elevation={0}
        sx={{
          p: { xs: 3, md: 4 },
          borderRadius: 4,
          mb: 3,
          background: "linear-gradient(135deg, #7b1fa2 0%, #9c27b0 100%)",
          color: "white",
        }}
      >
        <Typography variant="h4" sx={{ fontWeight: 800 }}>
          Contact Messages
        </Typography>
        <Typography variant="body1" sx={{ opacity: 0.95, mt: 0.5 }}>
          Messages submitted through the contact form.
        </Typography>
      </Paper>

      {message && (
        <Alert severity={messageType} sx={{ mb: 3, borderRadius: 2 }} onClose={() => setMessage("")}>
          {message}
        </Alert>
      )}

      <Paper elevation={2} sx={{ p: 2.5, mb: 3, borderRadius: 3 }}>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems={{ xs: "stretch", sm: "center" }}>
          <TextField
            label="Search contacts"
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
            placeholder="Search by name, email or message"
          />
          <Tooltip title="Refresh">
            <IconButton onClick={getAllContactData} color="primary">
              <Refresh />
            </IconButton>
          </Tooltip>
        </Stack>
      </Paper>

      <Paper elevation={2} sx={{ borderRadius: 3, overflow: "hidden" }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: "#7b1fa2" }}>
                <TableCell sx={{ color: "white", fontWeight: 700 }}>Name</TableCell>
                <TableCell sx={{ color: "white", fontWeight: 700 }}>Email</TableCell>
                <TableCell sx={{ color: "white", fontWeight: 700 }}>Message</TableCell>
                <TableCell sx={{ color: "white", fontWeight: 700 }} align="center">
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ py: 6 }}>
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : filteredContacts.length > 0 ? (
                filteredContacts.map((contact) => (
                  <TableRow key={contact._id} hover>
                    <TableCell>
                      <Stack direction="row" spacing={1.5} alignItems="center">
                        <Avatar sx={{ bgcolor: "#9c27b0", width: 40, height: 40 }}>
                          {(contact.username || "?").charAt(0).toUpperCase()}
                        </Avatar>
                        <Typography variant="subtitle2" fontWeight={600}>
                          {contact.username}
                        </Typography>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={0.5} alignItems="center">
                        <Mail sx={{ fontSize: 16, color: "text.secondary" }} />
                        <Typography variant="body2">{contact.email}</Typography>
                      </Stack>
                    </TableCell>
                    <TableCell sx={{ maxWidth: 300 }}>
                      <Typography variant="body2" noWrap title={contact.message}>
                        {contact.message}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title="Delete contact">
                        <IconButton color="error" onClick={() => handleOpenDelete(contact)} size="small">
                          <Delete />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ py: 6 }}>
                    <Typography color="text.secondary">
                      {contacts.length === 0 ? "No contacts found." : "No contacts match your search."}
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Delete Confirmation */}
      <Dialog open={openDelete} onClose={() => setOpenDelete(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, color: "error.main" }}>
          Delete Contact
        </DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this message from{" "}
            <strong>{deleteContact?.username}</strong>?
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

export default Admincontacts;
