const Doctor = require("../models/Doctor-model");
const { SubscriptionPlan, DoctorSubscription } = require("../models/Subscription-model");

// Get available subscription plans
const getPlans = async (req, res) => {
  try {
    let plans = await SubscriptionPlan.find({ active: true }).lean();

    if (!plans || plans.length === 0) {
      // Seed default plans if none exist
      const defaults = [
        {
          name: "Monthly",
          price: 999,
          durationDays: 30,
          billingCycle: "Monthly",
          features: [
            "Listed in Find Doctors",
            "Online appointment booking",
            "Patient records access",
            "Up to 100 appointments/month",
          ],
        },
        {
          name: "Yearly",
          price: 9999,
          durationDays: 365,
          billingCycle: "Yearly",
          popular: true,
          features: [
            "Everything in Monthly",
            "Save 2 months (₹1,989)",
            "Priority listing in search",
            "Unlimited appointments",
            "Advanced analytics & reports",
            "Priority support",
          ],
        },
      ];
      plans = await SubscriptionPlan.insertMany(defaults);
    }

    return res.status(200).json(plans);
  } catch (error) {
    console.log("Error in getPlans:", error);
    return res.status(500).json({ msg: "Internal server error", error });
  }
};

// Enroll doctor in a subscription plan
const enrollSubscription = async (req, res) => {
  try {
    const { plan, paymentMethod = "Card" } = req.body;
    // BUG FIX: Check both userId and userID to prevent undefined errors
    const userId = req.userId || req.userID || req.body.userId;

    if (!userId) {
      return res.status(400).json({ msg: "User not authenticated. Please login." });
    }

    const doctor = await Doctor.findOne({ userId });
    if (!doctor) {
      return res.status(404).json({ msg: "Doctor profile not found. Please complete your profile first." });
    }

    const planData = await SubscriptionPlan.findOne({ name: plan });
    if (!planData) {
      return res.status(400).json({ msg: "Invalid subscription plan" });
    }

    // Simulated payment logic
    const paymentReference = `PAY-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const startDate = new Date();
    const expiryDate = new Date(startDate);
    expiryDate.setDate(expiryDate.getDate() + planData.durationDays);

    let subscription = await DoctorSubscription.findOne({ userId });
    if (subscription) {
      subscription.plan = planData.name;
      subscription.price = planData.price;
      subscription.status = "Active";
      subscription.paymentMethod = paymentMethod;
      subscription.paymentReference = paymentReference;
      subscription.startDate = startDate;
      subscription.expiryDate = expiryDate;
      await subscription.save();
    } else {
      subscription = await DoctorSubscription.create({
        userId,
        doctorId: doctor._id,
        plan: planData.name,
        price: planData.price,
        status: "Active",
        paymentMethod,
        paymentReference,
        startDate,
        expiryDate,
      });
    }

    // Update doctor record
    doctor.subscriptionPlan = planData.name;
    doctor.subscriptionStatus = "Active";
    doctor.subscriptionExpiry = expiryDate;
    await doctor.save();

    return res.status(200).json({ msg: "Subscription activated successfully", subscription, doctor });
  } catch (error) {
    console.log("Error in enrollSubscription:", error);
    return res.status(500).json({ msg: "Internal server error", error });
  }
};

// Get current doctor's subscription
const getMySubscription = async (req, res) => {
  try {
    const userId = req.userId || req.userID;
    if (!userId) {
      return res.status(401).json({ msg: "Not authenticated" });
    }
    
    const doctor = await Doctor.findOne({ userId });
    const subscription = await DoctorSubscription.findOne({ userId });

    return res.status(200).json({ doctor, subscription });
  } catch (error) {
    console.log("Error in getMySubscription:", error);
    return res.status(500).json({ msg: "Internal server error", error });
  }
};

module.exports = { 
    getPlans,
    enrollSubscription, 
    getMySubscription,
};