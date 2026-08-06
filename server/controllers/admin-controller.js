const User = require('../models/user-model');
const Contact = require('../models/contact-model');
const Doctor = require('../models/Doctor-model');
const { DoctorSubscription, SubscriptionPlan } = require('../models/Subscription-model');
const { createNotification } = require('./notification-controller');

const TRIAL_DAYS = 14;

// Compute trial end date from trialStartDate
const getTrialEnd = (trialStartDate) => {
  if (!trialStartDate) return null;
  const end = new Date(trialStartDate);
  end.setDate(end.getDate() + TRIAL_DAYS);
  return end;
};
const getAllUsers = async (req, res) =>{
    try {
        const { role, search } = req.query;
        let filter = {};

        // Filter by role (Patient / Doctor) - case insensitive
        if (role && role !== "All") {
            filter.role = new RegExp(`^${role}$`, "i");
        }

        // Search by name or email
        if (search) {
            const regex = new RegExp(search, "i");
            filter.$or = [{ username: regex }, { email: regex }, { phone: regex }];
        }

        const users = await User.find(filter , {password:0});
        console.log(users);
        
        if(!users || users.length ===0){
            return res.status(404).json({message :"no data found"});
        }
        res.status(200).json(users);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ msg: "Internal server error" });
    }
}
const getAllContacts = async (req, res) =>{
    try {
        const contacts = await Contact.find();
        console.log(contacts);
        
        if(!contacts || contacts.length ===0){
            return res.status(404).json({message :"no data found"});
        }
        res.status(200).json(contacts);
    } catch (error) {
        
    }
}

const getdeleteuserbyid = async (req,res) =>{
    try {
        const id = req.params.id;

        // Delete associated doctor profile and subscription first
        const doctor = await Doctor.findOne({ userId: id });
        if (doctor) {
            await DoctorSubscription.deleteMany({ doctorId: doctor._id });
            await Doctor.deleteOne({ _id: doctor._id });
        }

        const data = await User.deleteOne({_id: id});
        res.status(200).json(data)
    } catch (error) {
        console.log(error);
        return res.status(500).json({ msg: "Internal server error" });
    }
}
const getdeleteContacts = async (req,res) =>{
    try {
        const id = req.params.id;
        const data = await Contact.deleteOne({_id: id});
        res.status(200).json(data)
    } catch (error) {
        
        
    }
}
const userbyid = async (req,res) =>{
    try {
        const id = req.params.id;
        const data = await User.findOne({_id: id} , { password :0});
        res.status(200).json(data)
    } catch (error) {
        
        
    }
}
const updateuserbyid = async (req,res) =>{
    try {
        const id = req.params.id;
        const updateuserdata = req.body;
        const updatedata = await User.updateOne({_id: id} , { $set : updateuserdata,});
        res.status(200).json(updatedata);
    } catch (error) {
        
        
    }
}

// ===== Doctor Subscription Management =====

const getAllDoctors = async (req, res) => {
    try {
        const doctors = await Doctor.find().populate("userId", "username email role");
        // Attach trial info to each doctor
        const enriched = doctors.map((doctor) => {
            const doc = doctor.toObject();
            const trialStart = doc.trialStartDate || null;
            const trialEnd = getTrialEnd(trialStart);
            doc.trialStartDate = trialStart;
            doc.trialEndDate = trialEnd;
            doc.isTrialActive = !!(trialStart && trialEnd && new Date() < trialEnd);
            return doc;
        });
        return res.status(200).json(enriched || []);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ msg: "Internal server error" });
    }
};

const getAllSubscriptions = async (req, res) => {
    try {
        const subscriptions = await DoctorSubscription.find().populate("userId", "username email").populate("doctorId", "name specialization city");
        // Attach trial info from linked doctor
        const enriched = await Promise.all(
            subscriptions.map(async (sub) => {
                const obj = sub.toObject();
                const doctor = obj.doctorId;
                if (doctor) {
                    const trialStart = doctor.trialStartDate || null;
                    obj.trialStartDate = trialStart;
                    obj.trialEndDate = getTrialEnd(trialStart);
                    obj.isTrialActive = !!(trialStart && obj.trialEndDate && new Date() < obj.trialEndDate);
                }
                return obj;
            })
        );
        return res.status(200).json(enriched || []);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ msg: "Internal server error" });
    }
};

const updateDoctorSubscription = async (req, res) => {
    try {
        const { id } = req.params;
        const { subscriptionPlan, subscriptionStatus, subscriptionExpiry } = req.body;

        const updateData = {};
        if (subscriptionPlan) updateData.subscriptionPlan = subscriptionPlan;
        if (subscriptionStatus) updateData.subscriptionStatus = subscriptionStatus;
        if (subscriptionExpiry) updateData.subscriptionExpiry = subscriptionExpiry;

        const doctor = await Doctor.findByIdAndUpdate(id, { $set: updateData }, { new: true });
        if (!doctor) {
            return res.status(404).json({ msg: "Doctor not found" });
        }
        return res.status(200).json(doctor);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ msg: "Internal server error" });
    }
};

// ===== Subscription Plan Management (Admin) =====

const getAllPlans = async (req, res) => {
    try {
        const plans = await SubscriptionPlan.find();
        return res.status(200).json(plans || []);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ msg: "Internal server error" });
    }
};

const createPlan = async (req, res) => {
    try {
        const { name, price, durationDays, billingCycle, features, popular, active } = req.body;

        if (!name || !price || !durationDays) {
            return res.status(400).json({ msg: "Name, price and durationDays are required" });
        }

        const existing = await SubscriptionPlan.findOne({ name });
        if (existing) {
            return res.status(400).json({ msg: "A plan with this name already exists" });
        }

        const plan = await SubscriptionPlan.create({
            name,
            price,
            durationDays,
            billingCycle: billingCycle || (durationDays >= 300 ? "Yearly" : "Monthly"),
            features: features || [],
            popular: popular || false,
            active: active !== undefined ? active : true,
        });

        return res.status(201).json(plan);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ msg: "Internal server error" });
    }
};

const updatePlan = async (req, res) => {
    try {
        const { id } = req.params;
        const plan = await SubscriptionPlan.findByIdAndUpdate(id, req.body, { new: true });
        if (!plan) {
            return res.status(404).json({ msg: "Plan not found" });
        }
        return res.status(200).json(plan);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ msg: "Internal server error" });
    }
};

const deletePlan = async (req, res) => {
    try {
        const { id } = req.params;
        const plan = await SubscriptionPlan.findByIdAndDelete(id);
        if (!plan) {
            return res.status(404).json({ msg: "Plan not found" });
        }
        return res.status(200).json({ msg: "Plan deleted", plan });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ msg: "Internal server error" });
    }
};

// ===== Analytics & Revenue =====

const getAnalytics = async (req, res) => {
  try {
    // --- Revenue aggregation from DoctorSubscription records ---
    const subscriptions = await DoctorSubscription.find({
      status: "Active",
    }).populate("doctorId", "name specialization city");

    let totalRevenue = 0;
    let monthlyRevenue = 0;
    let yearlyRevenue = 0;
    let currentMonthRevenue = 0;
    let currentYearRevenue = 0;
    let activeSubscriptions = 0;

    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const currentYearStart = new Date(now.getFullYear(), 0, 1);

    subscriptions.forEach((sub) => {
      const price = sub.price || 0;
      totalRevenue += price;
      activeSubscriptions += 1;

      if (sub.plan === "Monthly") monthlyRevenue += price;
      if (sub.plan === "Yearly") yearlyRevenue += price;

      const start = sub.startDate ? new Date(sub.startDate) : null;
      if (start && start >= currentMonthStart && start <= now) {
        currentMonthRevenue += price;
      }
      if (start && start >= currentYearStart && start <= now) {
        currentYearRevenue += price;
      }
    });

    // --- City-wise subscription analytics (active / subscribed doctors) ---
    const cityMap = {};
    subscriptions.forEach((sub) => {
      const city = sub.doctorId?.city || "Unknown";
      if (!cityMap[city]) {
        cityMap[city] = { city, subscribedDoctors: 0, totalDoctors: 0, revenue: 0 };
      }
      cityMap[city].subscribedDoctors += 1;
      cityMap[city].revenue += sub.price || 0;
    });

    // Total doctors per city (registered, regardless of subscription)
    const allDoctors = await Doctor.find();
    allDoctors.forEach((doc) => {
      const city = doc.city || "Unknown";
      if (!cityMap[city]) {
        cityMap[city] = { city, subscribedDoctors: 0, totalDoctors: 0, revenue: 0 };
      }
      cityMap[city].totalDoctors += 1;
    });

    const cityAnalytics = Object.values(cityMap).map((c) => ({
      ...c,
      subscriptionRate: c.totalDoctors > 0 ? Math.round((c.subscribedDoctors / c.totalDoctors) * 100) : 0,
    }));

    // Subscribed (premium) doctors list
    const subscribedDoctors = subscriptions.map((sub) => ({
      id: sub._id,
      name: sub.doctorId?.name || "Unknown",
      city: sub.doctorId?.city || "Unknown",
      specialization: sub.doctorId?.specialization || "N/A",
      plan: sub.plan,
      price: sub.price,
      status: sub.status,
      startDate: sub.startDate,
      expiryDate: sub.expiryDate,
    }));

    return res.status(200).json({
      revenue: {
        totalRevenue,
        monthlyRevenue,
        yearlyRevenue,
        currentMonthRevenue,
        currentYearRevenue,
        activeSubscriptions,
      },
      cityAnalytics,
      subscribedDoctors,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ msg: "Internal server error" });
  }
};

module.exports = {getAllUsers , getAllContacts , getdeleteuserbyid, userbyid , updateuserbyid , getdeleteContacts,
    getAllDoctors, getAllSubscriptions, updateDoctorSubscription,
    getAllPlans, createPlan, updatePlan, deletePlan, getAnalytics};
