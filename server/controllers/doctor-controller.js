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

    // Prioritize the authenticated user token to prevent spoofing
    const userId = req.userID || req.body.userId;
    
    if (!userId) {
      return res.status(401).json({ msg: "User ID is required" });
    }

    const payload = { ...responce, userId };

    const existing = await Doctor.findOne({ userId });

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
    return res.status(500).json({ msg: "Internal server error", error: error.message });
  }
};

// Get all doctors (only those with active subscription are bookable)
// const getAllDoctors = async (req, res) => {
//   try {
//     const onlyActive =
//       req.query.active === "true" || req.query.subscribed === "true";

//     const filter = onlyActive
//       ? {
//           $or: [
//             { subscriptionStatus: "Active" },
//             { subscriptionStatus: { $exists: false } },
//           ],
//         }
//       : {};

//     // Push the admin filtering to the database level
//     const doctors = await Doctor.find(filter)
//       .populate({
//         path: "userId",
//         select: "username name email role isAdmin",
//         match: { 
//           isAdmin: { $ne: true }, 
//           role: { $nin: ["admin", "Admin"] } 
//         }
//       })
//       .lean(); // Returns plain JS objects for much faster processing

//     const enriched = doctors
//       .filter((doc) => doc.userId !== null) // Drops docs where userId failed the match criteria
//       .map((doc) => {
//         const linkedUser = doc.userId;
//         let name = doc.name || linkedUser?.name || linkedUser?.username || "";
        
//         if (!name || /^(doctor|dr\.?)$/i.test(name.trim())) {
//           name = linkedUser?.username || `Dr. ${doc._id}`;
//         }
        
//         doc.name = name;
//         delete doc.userId;
//         return doc;
//       });

//     return res.status(200).json(enriched);
//   } catch (error) {
//     console.log(error);
//     return res.status(500).json({ msg: "Internal server error", error: error.message });
//   }
// };

// Get all doctors (with backward-compatible opt-in pagination)
const getAllDoctors = async (req, res) => {
  try {
    const onlyActive = req.query.active === "true" || req.query.subscribed === "true";
    
    // Check if the frontend explicitly requested pagination
    const isPaginated = req.query.page !== undefined;

    const filter = onlyActive
      ? {
          $or: [
            { subscriptionStatus: "Active" },
            { subscriptionStatus: { $exists: false } },
          ],
        }
      : {};

    // 1. Build the base query
    let query = Doctor.find(filter).populate({
      path: "userId",
      select: "username name email role isAdmin",
      match: { 
        isAdmin: { $ne: true }, 
        role: { $nin: ["admin", "Admin"] } 
      }
    });

    let total = 0;
    let page = 1;
    let limit = 10;

    // 2. Apply pagination limits ONLY if requested
    if (isPaginated) {
      page = parseInt(req.query.page, 10) || 1;
      limit = parseInt(req.query.limit, 10) || 10;
      const skip = (page - 1) * limit;
      
      query = query.skip(skip).limit(limit);
      
      // We only count total documents if we are paginating, saving DB resources
      total = await Doctor.countDocuments(filter);
    }

    // 3. Execute the query
    const doctors = await query.lean();

    // 4. Format the output
    const enriched = doctors
      .filter((doc) => doc.userId !== null) 
      .map((doc) => {
        const linkedUser = doc.userId;
        let name = doc.name || linkedUser?.name || linkedUser?.username || "";
        
        if (!name || /^(doctor|dr\.?)$/i.test(name.trim())) {
          name = linkedUser?.username || `Dr. ${doc._id}`;
        }
        
        doc.name = name;
        delete doc.userId;
        return doc;
      });

    // 5. Backward compatibility return
    if (!isPaginated) {
      // Returns a flat array (Doesn't break your current frontend)
      return res.status(200).json(enriched);
    }

    // 6. Paginated return
    // Returns an object when you call `/api/doctors?page=1&limit=10`
    return res.status(200).json({
      doctors: enriched,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalDoctors: total,
        limit: limit
      }
    });

  } catch (error) {
    console.log(error);
    return res.status(500).json({ msg: "Internal server error", error: error.message });
  }
};

// Get single doctor by id
const getDoctorById = async (req, res) => {
  try {
    const { id } = req.params;
    const doctor = await Doctor.findById(id, { userId: 0 }).lean();
    if (!doctor) {
      return res.status(404).json({ msg: "Doctor not found" });
    }
    return res.status(200).json(doctor);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ msg: "Internal server error", error: error.message });
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
    return res.status(500).json({ msg: "Internal server error", error: error.message });
  }
};

// Get doctor profile for the logged-in user
const getDoctorProfile = async (req, res) => {
  try {
    const userId = req.userID;
    
    if (!userId) {
      return res.status(401).json({ msg: "Not authenticated" });
    }

    const doctor = await Doctor.findOne({ userId }).lean();
    
    if (!doctor) {
      return res.status(404).json({ msg: "Doctor profile not found" });
    }
    
    return res.status(200).json(doctor);
  } catch (error) {
    console.log("Error getting doctor profile:", error);
    return res.status(500).json({ msg: "Internal server error", error: error.message });
  }
};

// Get available subscription plans
const getPlans = async (req, res) => {
  try {
    let plans = await SubscriptionPlan.find({ active: true }).lean();

    if (!plans || plans.length === 0) {
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
    return res.status(500).json({ msg: "Internal server error", error: error.message });
  }
};

// Enroll doctor in a subscription plan (simulated payment)
const enrollSubscription = async (req, res) => {
  try {
    const { plan, paymentMethod = "Card" } = req.body;
    const userId = req.userID || req.body.userId;

    if (!userId) {
      return res.status(400).json({ msg: "User not authenticated. Please login." });
    }

    const doctor = await Doctor.findOne({ userId });
    if (!doctor) {
      return res.status(404).json({
        msg: "Doctor profile not found. Please complete your profile first.",
      });
    }

    // Safeguard: Prevent double billing for the same active plan
    if (doctor.subscriptionStatus === "Active" && doctor.subscriptionPlan === plan) {
      return res.status(400).json({ msg: "You are already actively subscribed to this plan." });
    }

    const planData = await SubscriptionPlan.findOne({ name: plan }).lean();
    if (!planData) {
      return res.status(400).json({ msg: "Invalid subscription plan" });
    }

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
    return res.status(500).json({ msg: "Internal server error", error: error.message });
  }
};

// Get current doctor's subscription
const getMySubscription = async (req, res) => {
  try {
    const userId = req.userID;
    if (!userId) {
      return res.status(401).json({ msg: "Not authenticated" });
    }
    
    // Concurrent execution for faster response
    const [doctor, subscription] = await Promise.all([
      Doctor.findOne({ userId }).lean(),
      DoctorSubscription.findOne({ userId }).lean()
    ]);

    return res.status(200).json({ doctor, subscription });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ msg: "Internal server error", error: error.message });
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