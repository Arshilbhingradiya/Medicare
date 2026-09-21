const Doctor = require("../models/Doctor-model");
const User = require("../models/user-model");
const {
  SubscriptionPlan,
  DoctorSubscription,
} = require("../models/Subscription-model");
const { bookableDoctorQuery } = require("../utils/doctor-eligibility");
const Appointment = require("../models/appointment-model");

const getSlotLabels = (schedule) => {
  const slots = [];
  String(schedule || "").split(",").forEach((range) => {
    const [start, end] = range.trim().split("-");
    if (!start || !end) return;
    const [startHour, startMinute] = start.split(":").map(Number);
    const [endHour, endMinute] = end.split(":").map(Number);
    let current = startHour * 60 + startMinute;
    const finish = endHour * 60 + endMinute;
    while (current < finish) {
      const hour = Math.floor(current / 60);
      const minute = current % 60;
      const next = current + 60;
      const nextHour = Math.floor(next / 60);
      const nextMinute = next % 60;
      slots.push({
        label: `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}-${String(nextHour).padStart(2, "0")}:${String(nextMinute).padStart(2, "0")}`,
      });
      current = next;
    }
  });
  return slots;
};

const getDoctorAvailability = async (req, res) => {
  try {
    const { id } = req.params;
    const { date } = req.query;
    if (!date) return res.status(400).json({ msg: "Date is required" });
    const dayStart = new Date(`${date}T00:00:00.000Z`);
    const dayEnd = new Date(dayStart);
    dayEnd.setUTCDate(dayEnd.getUTCDate() + 1);
    if (Number.isNaN(dayStart.getTime())) return res.status(400).json({ msg: "Invalid date" });

    const doctor = await Doctor.findById(id).lean();
    if (!doctor || !require("../utils/doctor-eligibility").isDoctorBookable(doctor)) {
      return res.status(404).json({ msg: "Doctor is not available" });
    }
    const weekday = new Date(`${date}T12:00:00.000Z`).getUTCDay();
    const holiday = doctor.holidays?.find((item) => item.date === date && !item.branchId);
    const weeklyOff = doctor.weeklyOffDays?.includes(weekday);
    const closed = Boolean(holiday || weeklyOff);
    const closedReason = holiday?.reason || (weeklyOff ? "Weekly off" : "");
    const branches = Array.isArray(doctor.branches) && doctor.branches.length
      ? doctor.branches.filter((branch) => branch.active !== false)
      : [{ _id: null, name: "Main clinic", city: doctor.city, clinicAddress: doctor.clinicAddress, availabilitySchedule: doctor.availabilitySchedule, slotCapacity: doctor.slotCapacity }];
    const availability = [];
    for (const branch of branches) {
      const branchHoliday = doctor.holidays?.find((item) => item.date === date && item.branchId && String(item.branchId) === String(branch._id));
      const branchClosed = closed || Boolean(branchHoliday);
      const filter = { doctor: doctor._id, date: { $gte: dayStart, $lt: dayEnd }, status: { $ne: "cancelled" } };
      if (branch._id) filter.branchId = branch._id;
      const appointments = await Appointment.find(filter).select("time").lean();
      const counts = appointments.reduce((result, appointment) => {
        result[appointment.time] = (result[appointment.time] || 0) + 1;
        return result;
      }, {});
      availability.push({
        branchId: branch._id,
        name: branch.name,
        city: branch.city,
        clinicAddress: branch.clinicAddress,
        slotCapacity: branch.slotCapacity,
        closed: branchClosed,
        closedReason: branchHoliday?.reason || closedReason,
        slots: branchClosed ? [] : getSlotLabels(branch.availabilitySchedule).map((slot) => ({
          ...slot,
          remaining: Math.max(0, Number(branch.slotCapacity || 0) - (counts[slot.label] || 0)),
        })),
      });
    }
    return res.status(200).json({ doctorId: doctor._id, date, closed, closedReason, branches: availability });
  } catch (error) {
    console.error("Availability error:", error);
    return res.status(500).json({ msg: "Unable to load doctor availability" });
  }
};

const getVerificationApplication = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ userId: req.userID }).select("name email phone license medicalLicense medicalCouncil qualifications specialization yearsOfExperience city clinicAddress licenseDocument status adminApproved verificationSubmittedAt verificationReviewedAt rejectionReason").lean();
    if (!doctor) return res.status(404).json({ msg: "Doctor profile not found" });
    return res.status(200).json({
      ...doctor,
      verificationStatus: doctor.verificationSubmittedAt ? doctor.status : "not_submitted",
    });
  } catch (error) {
    return res.status(500).json({ msg: "Unable to load verification application" });
  }
};

const submitVerificationApplication = async (req, res) => {
  try {
    const requiredFields = ["name", "email", "medicalCouncil", "medicalLicense", "licenseDocument", "specialization"];
    const missing = requiredFields.filter((field) => !String(req.body?.[field] || "").trim());
    if (missing.length) return res.status(400).json({ msg: `Please complete: ${missing.join(", ")}` });
    const licenseNumber = String(req.body.medicalLicense).trim();
    if (!/^[A-Za-z0-9][A-Za-z0-9 /-]{2,39}$/.test(licenseNumber)) {
      return res.status(400).json({ msg: "Enter a valid State Medical Council registration number (3–40 letters, numbers, spaces, / or - only)." });
    }
    const existing = await Doctor.findOne({ userId: req.userID }).select("status verificationSubmittedAt").lean();
    if (!existing) return res.status(404).json({ msg: "Doctor profile not found" });
    if (existing.status === "pending" && existing.verificationSubmittedAt) {
      return res.status(409).json({ msg: "Your verification is already under review." });
    }
    if (existing.status === "approved") {
      return res.status(409).json({ msg: "Your verification is already approved." });
    }
    const doctor = await Doctor.findOneAndUpdate(
      { userId: req.userID },
      { $set: { name: req.body.name.trim(), email: req.body.email.trim().toLowerCase(), phone: req.body.phone?.trim(), license: licenseNumber, medicalLicense: licenseNumber, medicalCouncil: req.body.medicalCouncil.trim(), qualifications: req.body.qualifications?.trim(), specialization: req.body.specialization.trim(), yearsOfExperience: req.body.yearsOfExperience?.trim(), city: req.body.city?.trim(), clinicAddress: req.body.clinicAddress?.trim(), licenseDocument: req.body.licenseDocument, status: "pending", adminApproved: false, rejectionReason: "", verificationSubmittedAt: new Date(), verificationReviewedAt: undefined } },
      { new: true, runValidators: true }
    );
    if (!doctor) return res.status(404).json({ msg: "Doctor profile not found" });
    return res.status(200).json({ msg: "Verification application submitted", doctor });
  } catch (error) {
    console.error("Verification submission error:", error);
    return res.status(500).json({ msg: "Unable to submit verification application" });
  }
};

const getDoctorRecommendations = async (req, res) => {
  try {
    const query = String(req.query.query || "").trim();
    const filter = bookableDoctorQuery();
    if (query) {
      const expression = new RegExp(query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
      filter.$or = [{ name: expression }, { city: expression }, { specialization: expression }, { qualifications: expression }];
    }
    const doctors = await Doctor.find(filter).sort({ yearsOfExperience: -1 }).limit(20).lean();
    return res.status(200).json({ doctors, query, message: doctors.length ? "Recommended doctors found" : "No matching eligible doctors found" });
  } catch (error) {
    return res.status(500).json({ msg: "Unable to get doctor recommendations" });
  }
};

const getDoctorSummary = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ userId: req.userID }).lean();
    if (!doctor) return res.status(404).json({ msg: "Doctor profile not found" });
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const Appointment = require("../models/appointment-model");
    const appointments = await Appointment.find({ doctor: doctor._id, date: { $gte: start } }).lean();
    return res.status(200).json({
      today: appointments.filter((item) => new Date(item.date).toDateString() === new Date().toDateString()).length,
      pending: appointments.filter((item) => item.status === "pending").length,
      confirmed: appointments.filter((item) => item.status === "confirmed").length,
      completed: appointments.filter((item) => item.status === "completed").length,
      nextAppointment: appointments.filter((item) => item.status !== "cancelled").sort((a, b) => new Date(a.date) - new Date(b.date))[0] || null,
    });
  } catch (error) {
    return res.status(500).json({ msg: "Unable to load doctor summary" });
  }
};

// Create / update doctor profile (linked to logged-in user)
const doctorprofile = async (req, res) => {
  try {
    const userId = req.userID;

    if (!userId) {
      return res.status(401).json({
        msg: "User not authenticated",
      });
    }

    const allowedFields = [
      "name", "email", "license", "specialization", "phone", "clinicAddress",
      "city", "yearsOfExperience", "qualifications", "availability", "bio",
      "availabilitySchedule", "slotCapacity", "consultationFee", "profileImage", "branches", "weeklyOffDays", "holidays", "degree", "medicalLicense", "degreeDocument", "licenseDocument",
    ];
    const payload = allowedFields.reduce((result, field) => {
      if (req.body[field] !== undefined) result[field] = req.body[field];
      return result;
    }, { userId });

    const existing = await Doctor.findOne({ userId });

    let doctor;

    if (existing) {
      doctor = await Doctor.findByIdAndUpdate(
        existing._id,
        payload,
        {
          new: true,
          runValidators: true,
        }
      );
    } else {
      doctor = await Doctor.create(payload);
    }

    return res.status(200).json(doctor);
  } catch (error) {
    console.error("Error saving doctor profile:", error);

    return res.status(500).json({
      msg: "Internal server error",
      error: error.message,
    });
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
    const filter = bookableDoctorQuery();
    if (req.query.city) filter.city = new RegExp(`^${req.query.city.trim()}$`, "i");
    if (req.query.specialization) {
      filter.specialization = new RegExp(`^${req.query.specialization.trim()}$`, "i");
    }

    // Check if the frontend explicitly requested pagination
    const isPaginated = req.query.page !== undefined;

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
    const { isDoctorBookable } = require("../utils/doctor-eligibility");
    if (!doctor || !isDoctorBookable(doctor)) {
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
    if (!req.userID) return res.status(401).json({ msg: "Not authenticated" });
    const allowedFields = [
      "name", "email", "license", "specialization", "phone", "clinicAddress",
      "city", "yearsOfExperience", "qualifications", "availability", "bio",
      "availabilitySchedule", "slotCapacity", "profileImage",
    ];
    const updates = allowedFields.reduce((result, field) => {
      if (req.body[field] !== undefined) result[field] = req.body[field];
      return result;
    }, {});
    const doctor = await Doctor.findOneAndUpdate(
      { userId: req.userID },
      { $set: updates },
      { new: true, runValidators: true }
    );
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

// NOTE: the old enrollSubscription() controller was removed here.
// It activated doctor.subscriptionStatus = "Active" directly from client
// input with no Razorpay signature verification, so any authenticated
// doctor could call it to get a paid plan for free. Real subscription
// activation now only happens through razorpayController.verifyPayment
// (and the webhook), both of which verify a genuine Razorpay signature.

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
  getVerificationApplication,
  submitVerificationApplication,
  getDoctorRecommendations,
  getDoctorSummary,
  getDoctorAvailability,
  doctorprofile,
  getAllDoctors,
  getDoctorById,
  getDoctorProfile,
  updateDoctorProfile,
  getPlans,
  getMySubscription,
};
