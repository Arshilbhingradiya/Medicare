const mongoose = require("mongoose");

// Predefined subscription plans
const SubscriptionPlanSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true }, // Monthly, Yearly
  price: { type: Number, required: true },
  durationDays: { type: Number, required: true },
  billingCycle: { type: String, enum: ["Monthly", "Yearly"], default: "Monthly" },
  features: [{ type: String }],
  popular: { type: Boolean, default: false },
  active: { type: Boolean, default: true },
});

// A doctor's subscription record
const DoctorSubscriptionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
      required: true,
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
    },
    plan: { type: String, required: true },
    price: { type: Number, required: true },
    status: {
      type: String,
      enum: ["Active", "Expired", "Pending", "Cancelled"],
      default: "Pending",
    },
    paymentMethod: { type: String, default: "Card" },
    paymentReference: { type: String },
    startDate: { type: Date },
    expiryDate: { type: Date },
    renewalReminderSent: { type: Boolean, default: false },
    renewalReminderDate: { type: Date },
    razorpayOrderId: { type: String },
    razorpayPaymentId: { type: String },
  },
  { timestamps: true }
);

const SubscriptionPlan = mongoose.model("SubscriptionPlan", SubscriptionPlanSchema);
const DoctorSubscription = mongoose.model("DoctorSubscription", DoctorSubscriptionSchema);

module.exports = { SubscriptionPlan, DoctorSubscription };