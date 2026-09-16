const mongoose = require("mongoose");

const DoctorSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    adminApproved: { type: Boolean, default: false },
    verificationSubmittedAt: { type: Date },
    rejectionReason: { type: String },
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
    degree: { type: String },
    medicalLicense: { type: String },
    degreeDocument: { type: String },
    licenseDocument: { type: String },
    availability: { type: String },
    bio: { type: String },
    availabilitySchedule: { type: String, default: "09:00-13:00,17:00-20:00" },
    slotCapacity: { type: Number, default: 4 },
    consultationFee: { type: Number, default: 0, min: 0 },
    weeklyOffDays: [{ type: Number, min: 0, max: 6 }],
    holidays: [{
      date: { type: String, required: true },
      reason: { type: String, default: "Holiday" },
      branchId: { type: mongoose.Schema.Types.ObjectId },
    }],
    profileImage: { type: String },
    branches: [{
      name: { type: String, required: true },
      city: { type: String, required: true },
      clinicAddress: { type: String },
      availabilitySchedule: { type: String, default: "09:00-13:00,17:00-20:00" },
      slotCapacity: { type: Number, default: 4, min: 1 },
      active: { type: Boolean, default: true },
    }],

    // ==========================================
    // SUBSCRIPTION & PAYMENT FIELDS
    // ==========================================
    isSubscribed: {
      type: Boolean,
      default: false,
    },
    planName: {
      type: String,
      default: "Free",
    },
    subscriptionPlan: { type: String },
    subscriptionStatus: {
      type: String,
      // Added "Trial", "TrialExpired", and "None" to match frontend UI logic
      enum: ["None", "Free", "Trial", "Active", "TrialExpired", "Expired", "Pending"],
      default: "Free",
    },
    expiryDate: { 
      type: Date 
    },
    subscriptionExpiry: { type: Date },
    paymentReference: { 
      type: String 
    },

    // ==========================================
    // TRIAL TRACKING FIELDS
    // ==========================================
    trialStartDate: { 
      type: Date 
    },
    trialEndsAt: { 
      type: Date 
    },
  },
  { 
    timestamps: true // This officially adds the createdAt & updatedAt fields
  }
);

module.exports = mongoose.model("Doctor", DoctorSchema);