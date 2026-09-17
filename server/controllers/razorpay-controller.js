const Razorpay = require("razorpay");
const crypto = require("crypto");

const Doctor = require("../models/Doctor-model");
const {
  SubscriptionPlan,
  DoctorSubscription,
} = require("../models/Subscription-model");


// ======================================================
// Razorpay configuration
// ======================================================

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});


// ======================================================
// GET SUBSCRIPTION STATUS
// GET /subscription/status
// ======================================================

const checkSubscriptionStatus = async (req, res) => {
  try {
    const userId = req.userID || req.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        msg: "Not authenticated",
      });
    }

    const doctor = await Doctor.findOne({ userId });

    if (!doctor) {
      return res.status(404).json({
        success: false,
        msg: "Doctor profile not found",
      });
    }

    const now = new Date();

    // Your Doctor model currently uses subscriptionExpiry
    if (
      doctor.subscriptionStatus === "Active" &&
      (doctor.expiryDate || doctor.subscriptionExpiry) &&
      new Date(doctor.expiryDate || doctor.subscriptionExpiry) <= now
    ) {
      doctor.subscriptionStatus = "Expired";
      doctor.isSubscribed = false;

      await doctor.save();
    }

    // Trial expiry
    if (
      doctor.subscriptionStatus === "Trial" &&
      doctor.trialEndsAt &&
      new Date(doctor.trialEndsAt) <= now
    ) {
      doctor.subscriptionStatus = "TrialExpired";
      doctor.isSubscribed = false;

      await doctor.save();
    }

    return res.status(200).json({
      success: true,
      status: doctor.subscriptionStatus || "Inactive",
      subscription: {
        isSubscribed: doctor.isSubscribed || false,
        planName: doctor.subscriptionPlan || null,
        status: doctor.subscriptionStatus || "Inactive",
        expiryDate: doctor.subscriptionExpiry || null,
        trialStartDate: doctor.trialStartDate || null,
        trialEndsAt: doctor.trialEndsAt || null,
      },
    });

  } catch (error) {
    console.error("Check subscription status error:", error);

    return res.status(500).json({
      success: false,
      msg: "Failed to check subscription status",
      error: error.message,
    });
  }
};


// ======================================================
// ACTIVATE FREE TRIAL
// POST /subscription/trial
// ======================================================

const activateTrial = async (req, res) => {
  try {
    const userId = req.userID || req.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        msg: "Not authenticated",
      });
    }

    const doctor = await Doctor.findOne({ userId });

    if (!doctor) {
      return res.status(404).json({
        success: false,
        msg: "Doctor profile not found",
      });
    }
    if (doctor.status !== "approved" || doctor.adminApproved !== true) {
      return res.status(403).json({ success: false, msg: "Admin approval is required before starting a free trial." });
    }

    // Prevent using trial more than once
    if (
      doctor.trialStartDate ||
      doctor.trialEndsAt ||
      doctor.subscriptionStatus === "Trial" ||
      doctor.subscriptionStatus === "TrialExpired"
    ) {
      return res.status(400).json({
        success: false,
        msg: "Free trial has already been used",
      });
    }

    const trialDays = 7;

    const trialStartDate = new Date();

    const trialEndsAt = new Date(trialStartDate);

    trialEndsAt.setDate(
      trialEndsAt.getDate() + trialDays
    );

    // Update doctor
    doctor.isSubscribed = true;
    doctor.planName = "Free Trial";
    doctor.subscriptionPlan = "Free Trial";
    doctor.subscriptionStatus = "Trial";

    doctor.trialStartDate = trialStartDate;
    doctor.trialEndsAt = trialEndsAt;

    // Use same expiry field as your existing doctor controller
    doctor.expiryDate = trialEndsAt;
    doctor.subscriptionExpiry = trialEndsAt;

    await doctor.save();

    // Also create/update subscription record
    let subscription = await DoctorSubscription.findOne({
      userId,
    });

    if (subscription) {
      subscription.plan = "Free Trial";
      subscription.price = 0;
      subscription.status = "Active";
      subscription.startDate = trialStartDate;
      subscription.expiryDate = trialEndsAt;

      await subscription.save();
    } else {
      subscription = await DoctorSubscription.create({
        userId,
        doctorId: doctor._id,
        plan: "Free Trial",
        price: 0,
        status: "Active",
        paymentMethod: "Trial",
        paymentReference: `TRIAL-${Date.now()}`,
        startDate: trialStartDate,
        expiryDate: trialEndsAt,
      });
    }

    return res.status(200).json({
      success: true,
      msg: "Free trial activated successfully",

      subscription: {
        plan: "Free Trial",
        status: "Trial",
        startDate: trialStartDate,
        expiryDate: trialEndsAt,
      },
    });

  } catch (error) {
    console.error("Activate trial error:", error);

    return res.status(500).json({
      success: false,
      msg: "Failed to activate trial",
      error: error.message,
    });
  }
};


// ======================================================
// CREATE RAZORPAY ORDER
// POST /subscription/create-order
// ======================================================

const createOrder = async (req, res) => {
  try {
    const userId = req.userID || req.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        msg: "Not authenticated",
      });
    }

    const {
      plan,
      planName,
    } = req.body;

    // Accept either plan or planName
    const selectedPlan = plan || planName;

    if (!selectedPlan) {
      return res.status(400).json({
        success: false,
        msg: "Plan name is required",
      });
    }

    // Find plan from DB
    const planData = await SubscriptionPlan.findOne({
      name: selectedPlan,
      active: true,
    });

    if (!planData) {
      return res.status(404).json({
        success: false,
        msg: "Subscription plan not found",
      });
    }

    // Find doctor
    const doctor = await Doctor.findOne({
      userId,
    });

    if (!doctor) {
      return res.status(404).json({
        success: false,
        msg: "Doctor profile not found",
      });
    }
      if (doctor.status !== "approved" || doctor.adminApproved !== true) {
        return res.status(403).json({ success: false, msg: "Admin approval is required before creating a subscription order." });
      }
    if (doctor.status !== "approved" || doctor.adminApproved !== true) {
      return res.status(403).json({ success: false, msg: "Admin approval is required before activating a subscription." });
    }

    // Razorpay amount is paise
    const amount = Math.round(planData.price * 100);

    const options = {
      amount,
      currency: "INR",

      receipt: `MED-${Date.now()}`,

      notes: {
        userId: String(userId),
        doctorId: String(doctor._id),
        plan: planData.name,
      },
    };

    // Create Razorpay order
    const order = await razorpay.orders.create(options);

    // Find existing subscription
    let subscription = await DoctorSubscription.findOne({
      userId,
    });

    if (subscription) {
      subscription.plan = planData.name;
      subscription.price = planData.price;
      subscription.status = "Pending";

      // Store Razorpay order
      subscription.razorpayOrderId = order.id;

      await subscription.save();

    } else {
      subscription = await DoctorSubscription.create({
        userId,
        doctorId: doctor._id,
        plan: planData.name,
        price: planData.price,
        status: "Pending",
        razorpayOrderId: order.id,
      });
    }

    return res.status(200).json({
      success: true,

      order: {
        id: order.id,
        amount: order.amount,
        currency: order.currency,
      },

      key: process.env.RAZORPAY_KEY_ID,

      plan: {
        name: planData.name,
        price: planData.price,
        durationDays: planData.durationDays,
        billingCycle: planData.billingCycle,
      },
    });

  } catch (error) {
    console.error("Create Razorpay order error:", error);

    return res.status(500).json({
      success: false,
      msg: "Failed to create Razorpay order",
      error: error.message,
    });
  }
};


// ======================================================
// VERIFY RAZORPAY PAYMENT
// POST /subscription/verify
// ======================================================

const verifyPayment = async (req, res) => {
  try {
    const userId = req.userID || req.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        msg: "Not authenticated",
      });
    }

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    if (
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature
    ) {
      return res.status(400).json({
        success: false,
        msg: "Payment details are missing",
      });
    }

    // ------------------------------------------
    // Verify Razorpay signature
    // ------------------------------------------

    const generatedSignature = crypto
      .createHmac(
        "sha256",
        process.env.RAZORPAY_KEY_SECRET
      )
      .update(
        `${razorpay_order_id}|${razorpay_payment_id}`
      )
      .digest("hex");

    const generatedBuf = Buffer.from(generatedSignature);
    const receivedBuf = Buffer.from(String(razorpay_signature));
    const signatureValid =
      generatedBuf.length === receivedBuf.length &&
      crypto.timingSafeEqual(generatedBuf, receivedBuf);

    if (!signatureValid) {
      return res.status(400).json({
        success: false,
        msg: "Invalid payment signature",
      });
    }

    // ------------------------------------------
    // Find pending subscription
    // ------------------------------------------

    const subscription =
      await DoctorSubscription.findOne({
        userId,
        razorpayOrderId: razorpay_order_id,
      });

    if (!subscription) {
      return res.status(404).json({
        success: false,
        msg: "Subscription order not found",
      });
    }

    // ------------------------------------------
    // Find doctor
    // ------------------------------------------

    const doctor = await Doctor.findOne({
      userId,
    });

    if (!doctor) {
      return res.status(404).json({
        success: false,
        msg: "Doctor profile not found",
      });
    }

    // ------------------------------------------
    // Find plan
    // ------------------------------------------

    const planData =
      await SubscriptionPlan.findOne({
        name: subscription.plan,
        active: true,
      });

    if (!planData) {
      return res.status(404).json({
        success: false,
        msg: "Subscription plan not found",
      });
    }

    const now = new Date();

    // ------------------------------------------
    // Start date
    // ------------------------------------------

    let startDate = now;

    // If current subscription is still active,
    // extend from current expiry instead of today.
    if (
      doctor.subscriptionStatus === "Active" &&
      (doctor.expiryDate || doctor.subscriptionExpiry) &&
      new Date(doctor.expiryDate || doctor.subscriptionExpiry) > now
    ) {
      startDate = new Date(
        doctor.subscriptionExpiry
      );
    }

    // ------------------------------------------
    // Calculate expiry
    // ------------------------------------------

    const expiryDate = new Date(startDate);

    expiryDate.setDate(
      expiryDate.getDate() + planData.durationDays
    );

    // ------------------------------------------
    // Update DoctorSubscription
    // ------------------------------------------

    subscription.status = "Active";

    subscription.startDate = startDate;

    subscription.expiryDate = expiryDate;

    subscription.paymentReference =
      razorpay_payment_id;

    // Only save this if your schema has this field
    subscription.razorpayPaymentId =
      razorpay_payment_id;

    await subscription.save();

    // ------------------------------------------
    // Update Doctor
    // ------------------------------------------

    doctor.isSubscribed = true;

    doctor.planName = planData.name;
    doctor.subscriptionPlan = planData.name;

    doctor.subscriptionStatus = "Active";

    doctor.expiryDate = expiryDate;
    doctor.subscriptionExpiry = expiryDate;

    doctor.paymentReference =
      razorpay_payment_id;

    // Trial is no longer relevant after payment
    doctor.trialStartDate = undefined;
    doctor.trialEndsAt = undefined;

    await doctor.save();

    return res.status(200).json({
      success: true,

      msg: "Payment verified successfully",

      subscription: {
        plan: planData.name,
        status: "Active",
        startDate,
        expiryDate,
        paymentReference:
          razorpay_payment_id,
      },
    });

  } catch (error) {
    console.error(
      "Razorpay payment verification error:",
      error
    );

    return res.status(500).json({
      success: false,
      msg: "Payment verification failed",
      error: error.message,
    });
  }
};


// ======================================================
// RAZORPAY WEBHOOK
// POST /api/doctorform/subscription/webhook
// Registered in server.js with express.raw() BEFORE express.json(),
// so req.rawBody holds the exact bytes Razorpay signed.
// ======================================================

const activateSubscriptionFromOrder = async (orderId, paymentId) => {
  const subscription = await DoctorSubscription.findOne({ razorpayOrderId: orderId });
  if (!subscription || subscription.status === "Active") return;

  const planData = await SubscriptionPlan.findOne({ name: subscription.plan, active: true });
  if (!planData) return;

  const doctor = await Doctor.findById(subscription.doctorId);
  if (!doctor) return;

  const now = new Date();
  let startDate = now;
  if (
    doctor.subscriptionStatus === "Active" &&
    (doctor.expiryDate || doctor.subscriptionExpiry) &&
    new Date(doctor.expiryDate || doctor.subscriptionExpiry) > now
  ) {
    startDate = new Date(doctor.subscriptionExpiry);
  }
  const expiryDate = new Date(startDate);
  expiryDate.setDate(expiryDate.getDate() + planData.durationDays);

  subscription.status = "Active";
  subscription.startDate = startDate;
  subscription.expiryDate = expiryDate;
  subscription.paymentReference = paymentId;
  subscription.razorpayPaymentId = paymentId;
  await subscription.save();

  doctor.isSubscribed = true;
  doctor.planName = planData.name;
  doctor.subscriptionPlan = planData.name;
  doctor.subscriptionStatus = "Active";
  doctor.expiryDate = expiryDate;
  doctor.subscriptionExpiry = expiryDate;
  doctor.paymentReference = paymentId;
  doctor.trialStartDate = undefined;
  doctor.trialEndsAt = undefined;
  await doctor.save();
};

const razorpayWebhook = async (req, res) => {
  try {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    const signature = req.headers["x-razorpay-signature"];

    if (!secret) {
      console.error("RAZORPAY_WEBHOOK_SECRET is not configured");
      return res.status(500).json({ success: false, msg: "Webhook not configured" });
    }
    if (!signature || !req.rawBody) {
      return res.status(400).json({ success: false, msg: "Missing webhook signature" });
    }

    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(req.rawBody)
      .digest("hex");

    const expectedBuf = Buffer.from(expectedSignature);
    const receivedBuf = Buffer.from(String(signature));
    const isValid =
      expectedBuf.length === receivedBuf.length &&
      crypto.timingSafeEqual(expectedBuf, receivedBuf);

    if (!isValid) {
      return res.status(400).json({ success: false, msg: "Invalid webhook signature" });
    }

    const event = req.body?.event;
    const payment = req.body?.payload?.payment?.entity;

    if (event === "payment.captured" && payment?.order_id) {
      await activateSubscriptionFromOrder(payment.order_id, payment.id);
    }

    // Always acknowledge receipt so Razorpay doesn't keep retrying
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Razorpay webhook error:", error);
    // Still ack with 200 to avoid endless retries for a permanently-broken payload;
    // the error is logged for investigation.
    return res.status(200).json({ success: false });
  }
};

// ======================================================
// SEND RENEWAL REMINDERS
// Called on a 6-hour interval from server.js
// ======================================================

const sendRenewalReminders = async () => {
  try {
    const { createNotification } = require("./notification-controller");
    const now = new Date();
    const reminderWindowEnd = new Date(now);
    reminderWindowEnd.setDate(reminderWindowEnd.getDate() + 3);

    const dueSoon = await DoctorSubscription.find({
      status: "Active",
      renewalReminderSent: { $ne: true },
      expiryDate: { $gte: now, $lte: reminderWindowEnd },
    }).lean();

    for (const subscription of dueSoon) {
      const doctor = await Doctor.findById(subscription.doctorId).lean();
      if (!doctor) continue;

      await createNotification({
        userId: subscription.userId,
        role: "Doctor",
        type: "subscription_renewal",
        title: "Subscription Renewal Reminder",
        message: `Your ${subscription.plan} plan expires on ${new Date(
          subscription.expiryDate
        ).toLocaleDateString()}. Renew soon to keep receiving bookings.`,
        meta: { subscriptionId: subscription._id, expiryDate: subscription.expiryDate },
      });

      await DoctorSubscription.updateOne(
        { _id: subscription._id },
        { renewalReminderSent: true, renewalReminderDate: now }
      );
    }
  } catch (error) {
    // Never let this throw - it runs inside an unguarded setInterval in server.js,
    // and an uncaught error there would crash the whole process.
    console.error("sendRenewalReminders error:", error);
  }
};

// ======================================================
// EXPORTS
// ======================================================

module.exports = {
  checkSubscriptionStatus,
  activateTrial,
  createOrder,
  verifyPayment,
  razorpayWebhook,
  sendRenewalReminders,
};