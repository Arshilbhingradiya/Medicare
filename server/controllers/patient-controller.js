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

// Get a single appointment by id (doctor who owns it, or the patient who booked it)
const getAppointmentById = async (req, res) => {
  try {
    const userId = req.userID;
    const { id } = req.params;
    if (!userId) {
      return res.status(401).json({ msg: "Not authenticated" });
    }

    const appointment = await Appointment.findById(id);
    if (!appointment) {
      return res.status(404).json({ msg: "Appointment not found" });
    }

    // Access control: either the patient who owns it, or the doctor it belongs to
    const isPatientOwner =
      appointment.patientUser &&
      appointment.patientUser.toString() === userId.toString();

    let isDoctorOwner = false;
    if (!isPatientOwner) {
      const doctor = await Doctor.findOne({ userId });
      isDoctorOwner =
        doctor && appointment.doctor.toString() === doctor._id.toString();
    }

    if (!isPatientOwner && !isDoctorOwner) {
      return res.status(403).json({ msg: "Not authorized to view this appointment" });
    }

    return res.status(200).json(appointment);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ msg: "Internal server error" });
  }
};

// Doctor saves/updates the treatment details (vitals, prescription, notes) for a visit
const updateAppointmentDetails = async (req, res) => {
  try {
    const userId = req.userID;
    const { id } = req.params;
    const { weight, height, phone, prescription, notes } = req.body;

    if (!userId) {
      return res.status(401).json({ msg: "Not authenticated" });
    }

    const doctor = await Doctor.findOne({ userId });
    if (!doctor) {
      return res.status(403).json({ msg: "Only doctors can update patient files" });
    }

    const appointment = await Appointment.findOne({ _id: id, doctor: doctor._id });
    if (!appointment) {
      return res.status(404).json({ msg: "Appointment not found" });
    }

    if (weight !== undefined) appointment.weight = weight;
    if (height !== undefined) appointment.height = height;
    if (phone !== undefined) appointment.phone = phone;
    if (prescription !== undefined) appointment.prescription = prescription;
    if (notes !== undefined) appointment.notes = notes;

    await appointment.save();

    return res.status(200).json(appointment);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ msg: "Internal server error" });
  }
};

// Doctor views the full appointment/visit history of a given patient (scoped to this doctor)
const getPatientHistory = async (req, res) => {
  try {
    const userId = req.userID;
    const { patientUserId } = req.params;

    if (!userId) {
      return res.status(401).json({ msg: "Not authenticated" });
    }

    const doctor = await Doctor.findOne({ userId });
    if (!doctor) {
      return res.status(403).json({ msg: "Only doctors can view patient history" });
    }

    const history = await Appointment.find({
      doctor: doctor._id,
      patientUser: patientUserId,
    }).sort({ date: -1 });

    return res.status(200).json(history || []);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ msg: "Internal server error" });
  }
};

// Patient reschedules their own upcoming appointment (date/time), status resets to pending
const rescheduleAppointment = async (req, res) => {
  try {
    const userId = req.userID;
    const { id } = req.params;
    const { date, time } = req.body;

    if (!userId) {
      return res.status(401).json({ msg: "Not authenticated" });
    }
    if (!date || !time) {
      return res.status(400).json({ msg: "Date and time are required" });
    }

    const appointment = await Appointment.findOne({
      _id: id,
      patientUser: userId,
    });

    if (!appointment) {
      return res.status(404).json({ msg: "Appointment not found" });
    }

    if (["cancelled", "completed"].includes(appointment.status)) {
      return res
        .status(400)
        .json({ msg: "Cannot reschedule a cancelled or completed appointment" });
    }

    appointment.date = new Date(date);
    appointment.time = time;
    appointment.status = "pending";
    await appointment.save();

    // Let the doctor know the patient moved their slot
    const doctor = await Doctor.findById(appointment.doctor);
    if (doctor && doctor.userId) {
      await createNotification({
        userId: doctor.userId,
        role: "Doctor",
        type: "booking",
        title: "Appointment Rescheduled",
        message: `${appointment.patientName || "A patient"} rescheduled their appointment to ${new Date(
          date
        ).toLocaleDateString()} at ${time}.`,
        meta: { appointmentId: appointment._id, date, time },
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
  getAppointmentById,
  updateAppointmentDetails,
  getPatientHistory,
  rescheduleAppointment,
};
