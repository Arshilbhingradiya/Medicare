import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Typography,
  TextField,
  MenuItem,
} from "@mui/material";
import { motion } from "framer-motion";

const appointmentsData = [
  {
    id: 1,
    patient: "Alice Johnson",
    date: "2025-03-10",
    time: "10:00 AM",
    status: "Pending",
  },
  {
    id: 2,
    patient: "Mark Smith",
    date: "2025-03-11",
    time: "2:00 PM",
    status: "Confirmed",
  },
  {
    id: 3,
    patient: "David Brown",
    date: "2025-03-12",
    time: "4:30 PM",
    status: "Completed",
  },
  {
    id: 4,
    patient: "Sarah Wilson",
    date: "2025-03-14",
    time: "11:15 AM",
    status: "Pending",
  },
];

const statusColors = {
  Pending: "bg-yellow-500",
  Confirmed: "bg-green-500",
  Completed: "bg-blue-500",
  Rejected: "bg-red-500",
};

const DoctorAppointments = () => {
  const [appointments, setAppointments] = useState(appointmentsData);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const handleSearch = (e) => setSearchQuery(e.target.value.toLowerCase());
  const handleStatusChange = (e) => setStatusFilter(e.target.value);

  const handleStatusUpdate = (id, newStatus) => {
    setAppointments((prev) =>
      prev.map((appt) =>
        appt.id === id ? { ...appt, status: newStatus } : appt
      )
    );
  };

  const filteredAppointments = appointments.filter(
    (appt) =>
      (appt.patient.toLowerCase().includes(searchQuery) ||
        searchQuery === "") &&
      (statusFilter === "All" || appt.status === statusFilter)
  );

  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-50 dark:bg-gray-900 p-8">
      <div className="w-full max-w-4xl mx-auto bg-white dark:bg-gray-800 shadow-xl rounded-xl p-6">
        <Typography
          variant="h4"
          className="text-center text-blue-600 dark:text-white font-bold mb-6"
        >
          📅 Doctor Appointments
        </Typography>

        {/* Search & Filter */}
        <div className="flex justify-between items-center mb-6">
          <TextField
            label="🔍 Search Patient"
            variant="outlined"
            className="bg-white dark:bg-gray-700 shadow-md rounded-lg w-1/2"
            onChange={handleSearch}
          />
          <TextField
            select
            label="Filter by Status"
            variant="outlined"
            value={statusFilter}
            onChange={handleStatusChange}
            className="bg-white dark:bg-gray-700 shadow-md rounded-lg w-1/3"
          >
            <MenuItem value="All">All</MenuItem>
            <MenuItem value="Pending">Pending</MenuItem>
            <MenuItem value="Confirmed">Confirmed</MenuItem>
            <MenuItem value="Completed">Completed</MenuItem>
            <MenuItem value="Rejected">Rejected</MenuItem>
          </TextField>
        </div>

        {/* Appointment Table */}
        <TableContainer component={Paper} className="shadow-md rounded-xl">
          <Table>
            <TableHead className="bg-blue-600 dark:bg-blue-800">
              <TableRow>
                <TableCell className="text-white font-bold">
                  Patient Name
                </TableCell>
                <TableCell className="text-white font-bold">Date</TableCell>
                <TableCell className="text-white font-bold">Time</TableCell>
                <TableCell className="text-white font-bold">Status</TableCell>
                <TableCell className="text-white font-bold">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredAppointments.map((appt) => (
                <TableRow
                  key={appt.id}
                  className="hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <TableCell className="font-medium dark:text-white">
                    {appt.patient}
                  </TableCell>
                  <TableCell className="dark:text-gray-300">
                    {appt.date}
                  </TableCell>
                  <TableCell className="dark:text-gray-300">
                    {appt.time}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`text-white px-3 py-1 rounded-full ${
                        statusColors[appt.status]
                      }`}
                    >
                      {appt.status}
                    </span>
                  </TableCell>
                  <TableCell>
                    {appt.status === "Pending" && (
                      <>
                        <motion.button
                          whileTap={{ scale: 0.9 }}
                          className="px-3 py-1 bg-green-500 text-white rounded-lg mr-2"
                          onClick={() =>
                            handleStatusUpdate(appt.id, "Confirmed")
                          }
                        >
                          ✅ Approve
                        </motion.button>
                        <motion.button
                          whileTap={{ scale: 0.9 }}
                          className="px-3 py-1 bg-red-500 text-white rounded-lg"
                          onClick={() =>
                            handleStatusUpdate(appt.id, "Rejected")
                          }
                        >
                          ❌ Reject
                        </motion.button>
                      </>
                    )}
                    {appt.status === "Confirmed" && (
                      <motion.button
                        whileTap={{ scale: 0.9 }}
                        className="px-3 py-1 bg-blue-500 text-white rounded-lg"
                        onClick={() => handleStatusUpdate(appt.id, "Completed")}
                      >
                        ✅ Mark as Done
                      </motion.button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </div>
    </div>
  );
};

export default DoctorAppointments;
