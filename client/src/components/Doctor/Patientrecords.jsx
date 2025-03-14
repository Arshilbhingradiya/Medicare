import { useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  Avatar,
  TextField,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  Button,
  InputAdornment,
  Grid,
  Divider,
  Paper,
} from "@mui/material";
import { Search, Visibility } from "@mui/icons-material";
import { motion } from "framer-motion";

const patientsData = [
  {
    id: 1,
    name: "Alice Johnson",
    age: 28,
    contact: "alice@example.com",
    details: "Diabetes, Hypertension",
  },
  {
    id: 2,
    name: "Mark Smith",
    age: 35,
    contact: "mark@example.com",
    details: "Asthma, Allergy",
  },
  {
    id: 3,
    name: "David Brown",
    age: 40,
    contact: "david@example.com",
    details: "High BP, Obesity",
  },
  {
    id: 4,
    name: "Sarah Wilson",
    age: 30,
    contact: "sarah@example.com",
    details: "Migraine, Anxiety",
  },
];

const PatientRecords = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleSearch = (e) => setSearchQuery(e.target.value.toLowerCase());

  const filteredPatients = patientsData.filter((patient) =>
    patient.name.toLowerCase().includes(searchQuery)
  );

  const handleViewDetails = (patient) => {
    setSelectedPatient(patient);
    setIsDialogOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-50 dark:bg-gray-900 p-8">
      <div className="w-full max-w-4xl bg-white dark:bg-gray-800 shadow-xl rounded-xl p-6">
        <Typography
          variant="h4"
          className="text-center text-blue-600 dark:text-white font-bold mb-6"
        >
          🏥 Patient Records
        </Typography>

        {/* Search Bar */}
        <div className="mb-6">
          <TextField
            variant="outlined"
            label="🔍 Search Patients"
            fullWidth
            onChange={handleSearch}
            className="bg-white dark:bg-gray-700 shadow-md rounded-lg"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
          />
        </div>

        {/* Patient List Grid */}
        <Grid container spacing={3}>
          {filteredPatients.map((patient) => (
            <Grid item xs={12} sm={6} key={patient.id}>
              <motion.div
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                className="cursor-pointer"
              >
                <Card className="shadow-md bg-gradient-to-r from-white to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-xl">
                  <CardContent className="flex flex-col items-center p-6">
                    <Avatar
                      className="bg-blue-500 text-white mb-3"
                      sx={{ width: 70, height: 70, fontSize: "1.5rem" }}
                    >
                      {patient.name[0]}
                    </Avatar>
                    <Typography
                      variant="h6"
                      className="font-semibold dark:text-white"
                    >
                      {patient.name}
                    </Typography>
                    <Typography
                      variant="body2"
                      className="text-gray-600 dark:text-gray-300"
                    >
                      Age: {patient.age}
                    </Typography>
                    <Typography
                      variant="body2"
                      className="text-gray-600 dark:text-gray-300"
                    >
                      Contact: {patient.contact}
                    </Typography>
                    <Button
                      variant="contained"
                      color="primary"
                      className="mt-4"
                      onClick={() => handleViewDetails(patient)}
                    >
                      View Details
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </div>

      {/* Patient Details Dialog with Vertical Layout */}
      <Dialog
        open={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle className="text-blue-700 dark:text-white font-bold text-center">
          🩺 Patient Details
        </DialogTitle>
        <DialogContent>
          {selectedPatient && (
            <Paper
              elevation={3}
              className="p-6 rounded-lg bg-gray-50 dark:bg-gray-800"
            >
              <Grid container spacing={2} justifyContent="center">
                <Grid item xs={12} className="flex justify-center">
                  <Avatar
                    sx={{
                      width: 90,
                      height: 90,
                      fontSize: "2rem",
                      bgcolor: "primary.main",
                    }}
                  >
                    {selectedPatient.name[0]}
                  </Avatar>
                </Grid>

                {/* Basic Info */}
                <Grid item xs={12} className="text-center">
                  <Typography
                    variant="h5"
                    className="font-bold text-blue-700 dark:text-white"
                  >
                    {selectedPatient.name}
                  </Typography>
                  <Typography
                    variant="body2"
                    className="text-gray-600 dark:text-gray-300"
                  >
                    Age: {selectedPatient.age}
                  </Typography>
                  <Typography
                    variant="body2"
                    className="text-gray-600 dark:text-gray-300"
                  >
                    Contact: {selectedPatient.contact}
                  </Typography>
                </Grid>

                <Divider className="w-full mt-3" />

                {/* Medical History in Vertical Panel */}
                <Grid item xs={12} className="mt-4">
                  <Typography
                    variant="h6"
                    className="text-blue-700 dark:text-white font-semibold"
                  >
                    📜 Medical History
                  </Typography>
                  <Typography
                    variant="body1"
                    className="mt-2 text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 p-4 rounded-lg shadow-sm"
                  >
                    {selectedPatient.details}
                  </Typography>
                </Grid>

                {/* Close Button */}
                <Grid item xs={12} className="flex justify-center mt-4">
                  <Button
                    variant="contained"
                    color="secondary"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Close
                  </Button>
                </Grid>
              </Grid>
            </Paper>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PatientRecords;
