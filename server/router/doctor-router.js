const express = require("express");
const router = express.Router();
const doctorController = require("../controllers/doctor-controller");
const authMiddleware = require("../middleware/auth-middleware");
const doctorMiddleware = require("../middleware/doctor-middleware");
const razorpayController = require("../controllers/razorpay-controller");

router.get("/doctors", doctorController.getAllDoctors);
router.get("/recommendations", doctorController.getDoctorRecommendations);
router.get("/doctors/:id/availability", doctorController.getDoctorAvailability);
router.get("/plans", doctorController.getPlans);

// Protected routes (require authentication)
router.use(authMiddleware);
router.use(doctorMiddleware);
router.get("/summary", doctorController.getDoctorSummary);
router.get("/verification", doctorController.getVerificationApplication);
router.post("/verification", doctorController.submitVerificationApplication);
router.post("/doctorprofile", doctorController.doctorprofile);
router.get("/profile/mine", doctorController.getDoctorProfile);
router.get("/subscription/mine", doctorController.getMySubscription);
router.get("/subscription/status", razorpayController.checkSubscriptionStatus);
router.post("/subscription/trial", razorpayController.activateTrial);
router.post("/subscription/create-order", razorpayController.createOrder);
router.post("/subscription/verify", razorpayController.verifyPayment);
// NOTE: "/subscription/enroll" was removed - it activated a doctor's
// subscription as "Active" without verifying any real payment (no Razorpay
// signature check at all), so any authenticated doctor could get a paid
// plan for free by calling it directly. Use create-order -> verify instead.
router.put("/:id", doctorController.updateDoctorProfile);

// Public-ish single doctor (kept last to avoid param capture)
router.get("/:id", doctorController.getDoctorById);

module.exports = router;
