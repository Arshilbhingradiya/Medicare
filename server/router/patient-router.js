const express = require("express");
const router = express.Router();
const patientController = require("../controllers/patient-controller");
const authMiddleware = require("../middleware/auth-middleware");

router.post("/patientprofile", patientController.patientprofile);

// Appointment routes
router.post(
  "/appointments",
  authMiddleware,
  patientController.bookAppointment
);
router.get(
  "/appointments/mine",
  authMiddleware,
  patientController.getMyAppointments
);
router.get(
  "/appointments/doctor",
  authMiddleware,
  patientController.getDoctorAppointments
);
router.patch(
  "/appointments/:id/status",
  authMiddleware,
  patientController.updateAppointmentStatus
);

module.exports = router;
