const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Users',
    required: true
  },
  patientUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Users'
  },
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
    required: true
  },
  doctorName: { type: String },
  patientName: { type: String },
  date: {
    type: Date,
    required: true
  },
  time: {
    type: String,
    required: true
  },
  branchId: { type: mongoose.Schema.Types.ObjectId },
  branchName: { type: String },
  branchCity: { type: String },
  paymentMethod: {
    type: String,
    enum: ["cash", "online"],
    default: "cash",
  },
  paymentStatus: {
    type: String,
    enum: ["unpaid", "pending", "paid", "refunded"],
    default: "unpaid",
  },
  paymentReference: { type: String },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'completed'],
    default: 'pending'
  },
  reason: {
    type: String
  },
  notes: {
    type: String
  },
  prescription: {
    type: String
  },
  weight: {
    type: String
  },
  height: {
    type: String
  },
  phone: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Appointment", appointmentSchema);
