const express = require("express");
const router = express.Router();
const doctorprofile = require("../controllers/doctor-controller");

router.post("/doctorprofile", doctorprofile);

module.exports = router;
