const express = require('express');
const router = express.Router();
const doctorController = require('../controllers/doctor-controller');
const auth = require('../middleware/auth');

// Public routes
router.get('/search', doctorController.searchDoctors);
router.get('/:id', doctorController.getDoctorById);

// Protected routes (require authentication)
router.use(auth);
router.put('/:id', doctorController.updateDoctorProfile);
router.get('/:id/appointments', doctorController.getDoctorAppointments);

module.exports = router; 