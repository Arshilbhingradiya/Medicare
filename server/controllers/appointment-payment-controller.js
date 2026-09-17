const crypto = require("crypto");
const Razorpay = require("razorpay");
const Appointment = require("../models/appointment-model");
const Doctor = require("../models/Doctor-model");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const createAppointmentOrder = async (req, res) => {
  try {
    const appointment = await Appointment.findOne({ _id: req.body.appointmentId, patientUser: req.userID });
    if (!appointment) return res.status(404).json({ msg: "Appointment not found" });
    const doctor = await Doctor.findById(appointment.doctor).select("consultationFee name");
    const amount = Math.round(Number(doctor?.consultationFee || 0) * 100);
    if (!amount) return res.status(400).json({ msg: "This doctor has not configured an online consultation fee" });

    const order = await razorpay.orders.create({
      amount,
      currency: "INR",
      receipt: `APT-${appointment._id}`,
      notes: { appointmentId: String(appointment._id), doctorId: String(appointment.doctor) },
    });
    appointment.paymentMethod = "online";
    appointment.paymentStatus = "pending";
    appointment.paymentReference = order.id;
    await appointment.save();
    return res.status(200).json({ order, key: process.env.RAZORPAY_KEY_ID, amount: amount / 100, doctorName: doctor?.name });
  } catch (error) {
    console.error("Appointment payment order error:", error);
    return res.status(500).json({ msg: "Unable to start online payment" });
  }
};

const verifyAppointmentPayment = async (req, res) => {
  try {
    const { appointmentId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    const appointment = await Appointment.findOne({ _id: appointmentId, patientUser: req.userID });
    if (!appointment) return res.status(404).json({ msg: "Appointment not found" });
    const expected = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET).update(`${razorpay_order_id}|${razorpay_payment_id}`).digest("hex");
    const expectedBuf = Buffer.from(expected);
    const receivedBuf = Buffer.from(String(razorpay_signature || ""));
    const signatureValid =
      expectedBuf.length === receivedBuf.length &&
      crypto.timingSafeEqual(expectedBuf, receivedBuf);
    if (!signatureValid || appointment.paymentReference !== razorpay_order_id) return res.status(400).json({ msg: "Invalid payment verification" });
    appointment.paymentStatus = "paid";
    appointment.paymentReference = razorpay_payment_id;
    await appointment.save();
    return res.status(200).json({ msg: "Payment successful", appointment });
  } catch (error) {
    console.error("Appointment payment verification error:", error);
    return res.status(500).json({ msg: "Unable to verify payment" });
  }
};

module.exports = { createAppointmentOrder, verifyAppointmentPayment };
