const Razorpay = require("razorpay");
const crypto = require("crypto");
const Doctor = require("../models/Doctor-model");
const {
  SubscriptionPlan,
  DoctorSubscription,
} = require("../models/Subscription-model");
const { createNotification } = require("./notification-controller");

const TRIAL_DAYS = 14;

// Compute trial end date from trialStartDate
const getTrialEnd = (trialStartDate) => {
  if (!trialStartDate) return null;
  const end = new Date(trialStartDate);
  end.setDate(end.getDate() + TRIAL_DAYS);
  return end;
};

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// ===== Free Trial =====
const activateTrial = async (req, res) => {
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

    // Already subscribed or trial already started
    if (doctor.subscriptionStatus === "Active") {
      return res
        .status(400)
        .json({ msg: "You already have an active subscription." });
    }
    if (doctor.trialStartDate) {
      return res
        .status(400)
        .json({ msg: "Free trial already activated." });
    }

    const now = new Date();
    doctor.trialStartDate = now;
    doctor.subscriptionStatus = "Free";
    doctor.subscriptionPlan = "Free";
    await doctor.save();

    const trialEnd = new Date(now);
    trialEnd.setDate(trialEnd.getDate() + TRIAL_DAYS);

    return res.status(200).json({
      msg: "Free trial activated for 14 days!",
      doctor,
      trialEnd,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ msg: "Internal server error", error });
  }
};

// ===== Create Razorpay Order =====
const createOrder = async (req, res) => {
  try {
    const { plan } = req.body;
    const userId = req.userID || req.body.userId;
    if (!userId) {
      return res.status(401).json({ msg: "Not authenticated" });
    }

    const planData = await SubscriptionPlan.findOne({ name: plan, active: true });
    if (!planData) {
      return res.status(400).json({ msg: "Invalid subscription plan" });
    }

    const amountInPaise = Math.round(planData.price * 100);

    const options = {
      amount: amountInPaise,
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
      notes: {
        userId,
        plan: planData.name,
      },
    };

    const order = await razorpay.orders.create(options);

    // Save order id on doctor subscription record (pending)
    let subscription = await DoctorSubscription.findOne({ userId });
    if (subscription) {
      subscription.plan = planData.name;
      subscription.price = planData.price;
      subscription.status = "Pending";
      subscription.razorpayOrderId = order.id;
      await subscription.save();
    } else {
      const doctor = await Doctor.findOne({ userId });
      await DoctorSubscription.create({
        userId,
        doctorId: doctor ? doctor._id : null,
        plan: planData.name,
        price: planData.price,
        status: "Pending",
        razorpayOrderId: order.id,
      });
    }

    return res.status(200).json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
      plan: planData,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ msg: "Failed to create order", error });
  }
};

// ===== Verify Payment (client-side signature) =====
const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    const userId = req.userID || req.body.userId;

    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ msg: "Payment verification failed" });
    }

    const subscription = await DoctorSubscription.findOne({
      userId,
      razorpayOrderId: razorpay_order_id,
    });
    if (!subscription) {
      return res.status(404).json({ msg: "Order not found" });
    }

    const planData = await SubscriptionPlan.findOne({ name: subscription.plan });
    const startDate = new Date();
    const expiryDate = new Date(startDate);
    expiryDate.setDate(expiryDate.getDate() + (planData ? planData.durationDays : 30));

    subscription.status = "Active";
    subscription.paymentMethod = "Razorpay";
    subscription.paymentReference = razorpay_payment_id;
    subscription.razorpayPaymentId = razorpay_payment_id;
    subscription.startDate = startDate;
    subscription.expiryDate = expiryDate;
    subscription.renewalReminderSent = false;
    await subscription.save();

    const doctor = await Doctor.findById(subscription.doctorId);
    if (doctor) {
      doctor.subscriptionPlan = subscription.plan;
      doctor.subscriptionStatus = "Active";
      doctor.subscriptionExpiry = expiryDate;
      await doctor.save();
    }

    return res.status(200).json({
      msg: "Payment verified. Subscription activated!",
      subscription,
      doctor,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ msg: "Internal server error", error });
  }
};

// ===== Razorpay Webhook (server-side confirmation) =====
const razorpayWebhook = async (req, res) => {
  try {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    const signature = req.headers["x-razorpay-signature"];

    if (!secret || !signature) {
      return res.status(400).json({ ok: false });
    }

    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(req.rawBody || JSON.stringify(req.body))
      .digest("hex");

    if (expectedSignature !== signature) {
      return res.status(400).json({ ok: false });
    }

    const { event, payload } = req.body;

    if (event === "payment.captured" || event === "order.paid") {
      const payment = payload.payment?.entity || payload.order?.entity || {};
      const orderId = payment.order_id || payment.id;
      const paymentId = payment.id;

      const subscription = await DoctorSubscription.findOne({
        $or: [{ razorpayOrderId: orderId }, { razorpayOrderId: paymentId }],
      });

      if (subscription) {
        const planData = await SubscriptionPlan.findOne({ name: subscription.plan });
        const startDate = new Date();
        const expiryDate = new Date(startDate);
        expiryDate.setDate(expiryDate.getDate() + (planData ? planData.durationDays : 30));

        subscription.status = "Active";
        subscription.paymentReference = paymentId;
        subscription.razorpayPaymentId = paymentId;
        subscription.paymentMethod = "Razorpay";
        subscription.startDate = startDate;
        subscription.expiryDate = expiryDate;
        subscription.renewalReminderSent = false;
        await subscription.save();

        const doctor = await Doctor.findById(subscription.doctorId);
        if (doctor) {
          doctor.subscriptionPlan = subscription.plan;
          doctor.subscriptionStatus = "Active";
          doctor.subscriptionExpiry = expiryDate;
          await doctor.save();
        }
      }
    }

    return res.status(200).json({ ok: true });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ ok: false });
  }
};

// ===== Get Subscription Status =====
const checkSubscriptionStatus = async (req, res) => {
  try {
    const userId = req.userID || req.body.userId;
    if (!userId) {
      return res.status(401).json({ msg: "Not authenticated" });
    }

    const doctor = await Doctor.findOne({ userId });
    const subscription = await DoctorSubscription.findOne({ userId });

let status = "None";
    let plan = "Free";
    let trialActive = false;
    let trialStartDate = null;
    let trialEndsAt = null;
    let expiryDate = null;

    if (doctor) {
      plan = doctor.subscriptionPlan || "Free";
      expiryDate = doctor.subscriptionExpiry || null;
      trialStartDate = doctor.trialStartDate || null;

      if (doctor.subscriptionStatus === "Active") {
        status = "Active";
      } else if (doctor.subscriptionStatus === "Expired") {
        status = "Expired";
      } else if (
        doctor.subscriptionStatus === "Free" &&
        doctor.trialStartDate
      ) {
        trialEndsAt = getTrialEnd(doctor.trialStartDate);
        trialActive = new Date() < trialEndsAt;
        status = trialActive ? "Trial" : "TrialExpired";
      }
    }

    return res.status(200).json({
      status,
      plan,
      trialActive,
      trialStartDate,
      trialEndsAt,
      expiryDate,
      subscription,
      doctor,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ msg: "Internal server error" });
  }
};

// ===== Renewal Reminder helper (called by periodic job) =====
const sendRenewalReminders = async () => {
  try {
    const now = new Date();
    const threeDaysLater = new Date(now);
    threeDaysLater.setDate(threeDaysLater.getDate() + 3);

    const subscriptions = await DoctorSubscription.find({
      status: "Active",
      expiryDate: { $gte: now, $lte: threeDaysLater },
      renewalReminderSent: { $ne: true },
    });

    for (const sub of subscriptions) {
      const doctor = await Doctor.findById(sub.doctorId);
      const reminderDate = new Date(sub.expiryDate);
      reminderDate.setDate(reminderDate.getDate() - 3);

      sub.renewalReminderSent = true;
      sub.renewalReminderDate = reminderDate;
      await sub.save();

      // In-app style reminder (no email service configured):
      console.log(
        `[RENEWAL REMINDER] Doctor: ${doctor?.name || sub.userId} | Plan: ${
          sub.plan
        } | Expires: ${sub.expiryDate.toLocaleDateString()} | Reminder sent ${reminderDate.toLocaleDateString()}`
      );
    }
  } catch (error) {
    console.log("Renewal reminder cron error:", error);
  }
};

module.exports = {
  activateTrial,
  createOrder,
  verifyPayment,
  razorpayWebhook,
  checkSubscriptionStatus,
  sendRenewalReminders,
  TRIAL_DAYS,
};
