const express = require("express");
const router = express.Router();
const patientController = require("../controllers/patient-controller");
const authMiddleware = require("../middleware/auth-middleware");
const doctorMiddleware = require("../middleware/doctor-middleware");
const appointmentPaymentController = require("../controllers/appointment-payment-controller");

router.get("/patientprofile", authMiddleware, patientController.getPatientProfile);
router.post("/patientprofile", authMiddleware, patientController.patientprofile);

// Appointment routes
router.post(
  "/appointments",
  authMiddleware,
  patientController.bookAppointment
);
router.post("/appointments/payment/order", authMiddleware, appointmentPaymentController.createAppointmentOrder);
router.post("/appointments/payment/verify", authMiddleware, appointmentPaymentController.verifyAppointmentPayment);
router.get(
  "/appointments/mine",
  authMiddleware,
  patientController.getMyAppointments
);
router.get(
  "/appointments/doctor",
  authMiddleware,
  doctorMiddleware,
  patientController.getDoctorAppointments
);
router.get(
  "/appointments/patient/:patientUserId",
  authMiddleware,
  doctorMiddleware,
  patientController.getPatientHistory
);
router.patch(
  "/appointments/:id/status",
  authMiddleware,
  patientController.updateAppointmentStatus
);
router.patch(
  "/appointments/:id/complete",
  authMiddleware,
  doctorMiddleware,
  patientController.completeAppointment
);
router.patch(
  "/appointments/:id/reschedule",
  authMiddleware,
  patientController.rescheduleAppointment
);
router.patch(
  "/appointments/:id/details",
  authMiddleware,
  doctorMiddleware,
  patientController.updateAppointmentDetails
);
router.get(
  "/appointments/:id",
  authMiddleware,
  patientController.getAppointmentById
);

module.exports = router;
