const express = require("express");
const {
  authMiddleware,
  chat,
  summarizePatientRecord,
} = require("../controllers/assistant-controller");
const doctorMiddleware = require("../middleware/doctor-middleware");

const router = express.Router();

router.post("/chat", authMiddleware, chat);
router.post(
  "/summarize-record",
  authMiddleware,
  doctorMiddleware,
  summarizePatientRecord
);

module.exports = router;