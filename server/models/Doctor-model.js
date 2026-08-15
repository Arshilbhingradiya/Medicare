const mongoose = require("mongoose");

const DoctorSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users", // Make sure your User model is actually exported as "Users" (or change to "User")
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
    subscriptionStatus: {
      type: String,
      // Added "Trial", "TrialExpired", and "None" to match frontend UI logic
      enum: ["None", "Free", "Trial", "Active", "TrialExpired", "Expired", "Pending"],
      default: "Free",
    },
    expiryDate: { 
      type: Date 
    },
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