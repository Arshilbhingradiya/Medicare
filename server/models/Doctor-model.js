const mongoose = require("mongoose");

const DoctorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: {
    type: String,
    required: true,
  },
  license: { type: String, required: true },
  specialization: { type: String, required: true },
  phone: { type: String, required: true },
  clinicAddress: { type: String, required: true },
  city: { type: String, required: true },
  yearsOfExperience: { type: String },
  qualifications: { type: String },
  availability: { type: String },
  bio: { type: String },
}); // Adds createdAt & updatedAt

// const VerificationSchema = new mongoose.Schema({
//   name: {
//     type: String,
//     required: true,
//   },
//   email: {
//     type: String,
//     required: true,
//   },
//   license: {
//     type: String,
//     required: true,
//     unique: true,
//   },
//   specialization: {
//     type: String,
//     required: true,
//   },
//   medicalCertificate: {
//     type: String,
//     required: true,
//   },
//   // status: {
//   //   type: String,
//   //   enum: ["pending", "verified", "rejected"],
//   //   default: "pending",
//   // },
// });
// Verification = mongoose.model("Verification", VerificationSchema);
module.exports = mongoose.model("Doctor", DoctorSchema);
