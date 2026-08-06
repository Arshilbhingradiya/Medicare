const Doctor = require("../models/Doctor-model");
const { DoctorSubscription } = require("../models/Subscription-model");

const TRIAL_DAYS = 14;

/**
 * Subscription middleware for protecting doctor features.
 * Allows access if:
 *  - Doctor has an Active subscription, OR
 *  - Doctor is within the free trial period
 * Otherwise returns 403.
 */
const requireSubscription = async (req, res, next) => {
  try {
    const userId = req.userID || req.body.userId;
    if (!userId) {
      return res.status(401).json({ msg: "Not authenticated" });
    }

    const doctor = await Doctor.findOne({ userId });
    if (!doctor) {
      return res
        .status(404)
        .json({ msg: "Doctor profile not found. Please complete your profile first." });
    }

    // Active paid subscription
    if (doctor.subscriptionStatus === "Active" && doctor.subscriptionExpiry) {
      if (new Date(doctor.subscriptionExpiry) > new Date()) {
        return next();
      }
      // Subscription expired in DB
      doctor.subscriptionStatus = "Expired";
      await doctor.save();
    }

    // Free trial check
    if (doctor.trialStartDate) {
      const trialEnd = new Date(doctor.trialStartDate);
      trialEnd.setDate(trialEnd.getDate() + TRIAL_DAYS);
      if (new Date() < trialEnd) {
        return next();
      }
    }

    return res.status(403).json({
      msg: "Subscription required. Please subscribe or activate your free trial to access this feature.",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ msg: "Internal server error" });
  }
};

module.exports = { requireSubscription, TRIAL_DAYS };
