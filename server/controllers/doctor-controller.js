const Doctor = require("../models/Doctor-model");
const User = require("../models/user-model");
const {
  SubscriptionPlan,
  DoctorSubscription,
} = require("../models/Subscription-model");

// Create / update doctor profile (linked to logged-in user)
const doctorprofile = async (req, res) => {
  try {
    const responce = req.body;

    // Link to the authenticated user if header token present
    let userId = null;
    if (req.userID) {
      userId = req.userID;
    } else if (req.body.userId) {
      userId = req.body.userId;
    }

    const payload = { ...responce };
    if (userId) payload.userId = userId;

    // If a doctor profile already exists for this user, update it
    const existing = userId
      ? await Doctor.findOne({ userId })
      : null;

    let doctor;
    if (existing) {
      doctor = await Doctor.findByIdAndUpdate(existing._id, payload, {
        new: true,
      });
    } else {
      doctor = await Doctor.create(payload);
    }

    return res.status(200).json(doctor);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ msg: "Internal server error", error });
  }
};

// Get all doctors (only those with active subscription are bookable)
const getAllDoctors = async (req, res) => {
  try {
    const onlyActive =
      req.query.active === "true" || req.query.subscribed === "true";

    const filter = onlyActive
      ? {
          $or: [
            { subscriptionStatus: "Active" },
            { subscriptionStatus: { $exists: false } },
          ],
        }
      : {};

    const doctors = await Doctor.find(filter).populate(
      "userId",
      "username name email role isAdmin"
    );

    // Ensure every doctor has a proper full name (fallback to linked user)
    const enriched = doctors
      // Exclude doctors whose linked user is an admin (so patients never see admins)
      .filter((doc) => {
        const linkedUser = doc.userId;
        if (!linkedUser) return true;
        const role = (linkedUser.role || "").toLowerCase();
        return !(linkedUser.isAdmin || role === "admin");
      })
      .map((doc) => {
        const obj = doc.toObject();
        const linkedUser = obj.userId;
        let name = obj.name || linkedUser?.name || linkedUser?.username || "";
        // Strip generic "doctor" placeholder if present
        if (!name || /^(doctor|dr\.?)$/i.test(name.trim())) {
          name = linkedUser?.username || `Dr. ${obj._id}`;
        }
        obj.name = name;
        delete obj.userId;
        return obj;
      });

    return res.status(200).json(enriched);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ msg: "Internal server error", error });
  }
};

// Get single doctor by id
const getDoctorById = async (req, res) => {
  try {
    const { id } = req.params;
    const doctor = await Doctor.findById(id, { userId: 0 });
    if (!doctor) {
      return res.status(404).json({ msg: "Doctor not found" });
    }
    return res.status(200).json(doctor);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ msg: "Internal server error", error });
  }
};

// Update doctor profile
const updateDoctorProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const doctor = await Doctor.findByIdAndUpdate(id, req.body, { new: true });
    if (!doctor) {
      return res.status(404).json({ msg: "Doctor not found" });
    }
    return res.status(200).json(doctor);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ msg: "Internal server error", error });
  }
};

// --- THIS WAS MISSING! ---
// Get doctor profile for the logged-in user
const getDoctorProfile = async (req, res) => {
  try {
    const userId = req.userID;
    
    if (!userId) {
      return res.status(401).json({ msg: "Not authenticated" });
    }

    const doctor = await Doctor.findOne({ userId });
    
    if (!doctor) {
      return res.status(404).json({ msg: "Doctor profile not found" });
    }
    
    return res.status(200).json(doctor);
  } catch (error) {
    console.log("Error getting doctor profile:", error);
    return res.status(500).json({ msg: "Internal server error", error });
  }
};
// --------------------------

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
    console.log(error);
    return res.status(500).json({ msg: "Internal server error", error });
  }
};

// Enroll doctor in a subscription plan (simulated payment)
const enrollSubscription = async (req, res) => {
  try {
    const { plan, paymentMethod = "Card" } = req.body;
    const userId = req.userID || req.body.userId;

    if (!userId) {
      return res
        .status(400)
        .json({ msg: "User not authenticated. Please login." });
    }

    const doctor = await Doctor.findOne({ userId });
    if (!doctor) {
      return res.status(404).json({
        msg: "Doctor profile not found. Please complete your profile first.",
      });
    }

    const planData = await SubscriptionPlan.findOne({ name: plan });
    if (!planData) {
      return res.status(400).json({ msg: "Invalid subscription plan" });
    }

    // Simulated payment
    const paymentReference = `PAY-${Date.now()}-${Math.floor(
      Math.random() * 1000
    )}`;

    const startDate = new Date();
    const expiryDate = new Date(startDate);
    expiryDate.setDate(expiryDate.getDate() + planData.durationDays);

    // Create or update subscription record
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

    return res.status(200).json({
      msg: "Subscription activated successfully",
      subscription,
      doctor,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ msg: "Internal server error", error });
  }
};

// Get current doctor's subscription
const getMySubscription = async (req, res) => {
  try {
    const userId = req.userID;
    if (!userId) {
      return res.status(401).json({ msg: "Not authenticated" });
    }
    const doctor = await Doctor.findOne({ userId });
    const subscription = await DoctorSubscription.findOne({ userId });

    return res.status(200).json({ doctor, subscription });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ msg: "Internal server error", error });
  }
};

module.exports = {
  doctorprofile,
  getAllDoctors,
  getDoctorById,
  getDoctorProfile,
  updateDoctorProfile,
  getPlans,
  enrollSubscription,
  getMySubscription,
};