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
router.get(
  "/appointments/patient/:patientUserId",
  authMiddleware,
  patientController.getPatientHistory
);
router.patch(
  "/appointments/:id/status",
  authMiddleware,
  patientController.updateAppointmentStatus
);
router.patch(
  "/appointments/:id/reschedule",
  authMiddleware,
  patientController.rescheduleAppointment
);
router.patch(
  "/appointments/:id/details",
  authMiddleware,
  patientController.updateAppointmentDetails
);
router.get(
  "/appointments/:id",
  authMiddleware,
  patientController.getAppointmentById
);

module.exports = router;
