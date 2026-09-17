const mongoose = require("mongoose");

// Tracks how many appointments are currently booked into a given
// doctor/branch/date/time slot. This exists purely so capacity can be
// checked-and-incremented atomically at the database layer (via
// findOneAndUpdate + a unique index), closing the race condition where two
// patients booking the same last-available slot at the same moment could
// both pass a plain countDocuments() check before either appointment was
// written.
const appointmentSlotSchema = new mongoose.Schema({
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Doctor",
    required: true,
  },
  // null when the doctor has no branches configured (single-clinic doctor)
  branchId: {
    type: mongoose.Schema.Types.ObjectId,
    default: null,
  },
  // Plain "YYYY-MM-DD" string, matching the `date` value the booking APIs
  // already receive from the frontend.
  dateKey: { type: String, required: true },
  time: { type: String, required: true },
  bookedCount: { type: Number, default: 0, min: 0 },
});

appointmentSlotSchema.index(
  { doctor: 1, branchId: 1, dateKey: 1, time: 1 },
  { unique: true }
);

module.exports = mongoose.model("AppointmentSlot", appointmentSlotSchema);
