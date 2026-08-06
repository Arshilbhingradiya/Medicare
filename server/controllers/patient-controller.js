const Patient = require("../models/patient-model");
const Appointment = require("../models/appointment-model");
const Doctor = require("../models/Doctor-model");
const { createNotification } = require("./notification-controller");

const patientprofile = async (req, res) => {
  try {
    const responce = req.body;
    const formcreated = await Patient.create(responce);

    res.status(200).json(req.body);
  } catch (error) {
    console.log(error);
  }
};

// Book an appointment (persist to backend + create notification for patient)
const bookAppointment = async (req, res) => {
  try {
    const userId = req.userID || req.body.userId;
    const {
      doctorId,
      doctorName,
      date,
      time,
      reason,
      patientName,
      patientUser,
    } = req.body;

    if (!doctorId || !date || !time) {
      return res
        .status(400)
        .json({ msg: "Doctor, date and time are required" });
    }

    const patientUserRef = userId || patientUser;

    const appointment = await Appointment.create({
      patient: req.body.patientId || patientUserRef,
      patientUser: patientUserRef,
      doctor: doctorId,
      doctorName: doctorName || "",
      patientName: patientName || "Patient",
      date: new Date(date),
      time,
      status: "pending",
      reason: reason || "Appointment booking",
    });

    // Notify the patient that their booking was received
    await createNotification({
      userId: patientUserRef,
      role: "Patient",
      type: "booking",
      title: "Appointment Booked",
      message: `Your appointment with ${doctorName || "the doctor"} on ${new Date(
        date
      ).toLocaleDateString()} at ${time} has been booked successfully.`,
      meta: { appointmentId: appointment._id, doctorName, date, time },
    });

    // Notify the doctor about a new appointment
    const doctor = await Doctor.findById(doctorId);
    if (doctor && doctor.userId) {
      await createNotification({
        userId: doctor.userId,
        role: "Doctor",
        type: "booking",
        title: "New Appointment Request",
        message: `${patientName || "A patient"} requested an appointment on ${new Date(
          date
        ).toLocaleDateString()} at ${time}.`,
        meta: { appointmentId: appointment._id, patientName, date, time },
      });
    }

    return res.status(201).json({ msg: "Appointment booked successfully", appointment });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ msg: "Internal server error", error });
  }
};

// Get appointments for the logged-in patient
const getMyAppointments = async (req, res) => {
  try {
    const userId = req.userID;
    if (!userId) {
      return res.status(401).json({ msg: "Not authenticated" });
    }

    const appointments = await Appointment.find({
      $or: [{ patientUser: userId }, { patient: userId }],
    }).sort({ date: -1 });

    return res.status(200).json(appointments || []);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ msg: "Internal server error" });
  }
};

// Get appointments for the logged-in doctor
const getDoctorAppointments = async (req, res) => {
  try {
    const userId = req.userID;
    if (!userId) {
      return res.status(401).json({ msg: "Not authenticated" });
    }

    const doctor = await Doctor.findOne({ userId });
    if (!doctor) {
      return res.status(404).json({ msg: "Doctor profile not found" });
    }

    const appointments = await Appointment.find({ doctor: doctor._id }).sort({
      date: -1,
    });

    return res.status(200).json(appointments || []);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ msg: "Internal server error" });
  }
};

// Update appointment status (doctor confirms/cancels)
const updateAppointmentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["pending", "confirmed", "cancelled", "completed"].includes(status)) {
      return res.status(400).json({ msg: "Invalid status" });
    }

    const appointment = await Appointment.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );
    if (!appointment) {
      return res.status(404).json({ msg: "Appointment not found" });
    }

    // Notify patient when confirmed/cancelled
    if (appointment.patientUser) {
      await createNotification({
        userId: appointment.patientUser,
        role: "Patient",
        type:
          status === "confirmed"
            ? "booking_confirmed"
            : status === "cancelled"
            ? "booking_cancelled"
            : "booking",
        title:
          status === "confirmed"
            ? "Appointment Confirmed"
            : status === "cancelled"
            ? "Appointment Cancelled"
            : "Appointment Updated",
        message:
          status === "confirmed"
            ? `Your appointment with ${appointment.doctorName || "the doctor"} on ${new Date(
                appointment.date
              ).toLocaleDateString()} at ${
                appointment.time
              } has been confirmed.`
            : status === "cancelled"
            ? `Your appointment with ${appointment.doctorName || "the doctor"} on ${new Date(
                appointment.date
              ).toLocaleDateString()} has been cancelled.`
            : `Your appointment status has been updated to ${status}.`,
        meta: { appointmentId: appointment._id },
      });
    }

    return res.status(200).json(appointment);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ msg: "Internal server error" });
  }
};

module.exports = {
  patientprofile,
  bookAppointment,
  getMyAppointments,
  getDoctorAppointments,
  updateAppointmentStatus,
};
