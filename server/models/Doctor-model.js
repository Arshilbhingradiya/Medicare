const mongoose = require("mongoose");

const DoctorSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Users",
  },
  name: { type: String, required: true },
  email: {
    type: String,
    required: true,
  },
  license: { type: String },
  specialization: { type: String, required: true },
  phone: { type: String },
  clinicAddress: { type: String },
  city: { type: String },
  yearsOfExperience: { type: String },
  qualifications: { type: String },
  availability: { type: String },
  bio: { type: String },
  availabilitySchedule: { type: String, default: "09:00-13:00,17:00-20:00" },
  slotCapacity: { type: Number, default: 4 },
  profileImage: { type: String },
  subscriptionPlan: { type: String, default: "Free" },
  subscriptionStatus: {
    type: String,
    enum: ["Free", "Active", "Expired", "Pending"],
    default: "Free",
  },
  subscriptionExpiry: { type: Date },
  trialStartDate: { type: Date },
}); // Adds createdAt & updatedAt

module.exports = mongoose.model("Doctor", DoctorSchema);
