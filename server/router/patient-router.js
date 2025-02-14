const express = require("express");
const router = express.Router();
const patientprofile = require("../controllers/patient-controller");

router.post("/patientprofile", patientprofile);

module.exports = router;
