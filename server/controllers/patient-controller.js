const Patient = require("../models/patient-model");
const Appointment = require("../models/appointment-model");
const Doctor = require("../models/Doctor-model");
const { createNotification } = require("./notification-controller");
const { isDoctorBookable } = require("../utils/doctor-eligibility");

const parseDate = (value) => {
  const date = new Date(`${value}T00:00:00.000Z`);
  return Number.isNaN(date.getTime()) ? null : date;
};

const getDayRange = (value) => {
  const start = parseDate(value);
  if (!start) return null;
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 1);
  return { start, end };
};

const isTimeInSchedule = (schedule, time) => {
  const [hour, minute] = String(time).split("-")[0].trim().split(":").map(Number);
  if (!Number.isInteger(hour) || !Number.isInteger(minute)) return false;
  const requestedMinutes = hour * 60 + minute;

  return String(schedule || "").split(",").some((range) => {
    const [rangeStart, rangeEnd] = range.trim().split("-");
    if (!rangeStart || !rangeEnd) return false;
    const [startHour, startMinute] = rangeStart.split(":").map(Number);
    const [endHour, endMinute] = rangeEnd.split(":").map(Number);
    return requestedMinutes >= startHour * 60 + startMinute &&
      requestedMinutes < endHour * 60 + endMinute;
  });
};

const getDoctorBranch = (doctor, branchId) => {
  if (!Array.isArray(doctor.branches) || doctor.branches.length === 0) {
    return { name: "Main clinic", city: doctor.city, clinicAddress: doctor.clinicAddress, availabilitySchedule: doctor.availabilitySchedule, slotCapacity: doctor.slotCapacity };
  }
  const branch = doctor.branches.find((item) => item._id.toString() === String(branchId)) || (!branchId ? doctor.branches[0] : null);
  return branch && branch.active !== false ? branch : null;
};

const getDateStatus = (doctor, date, branchId) => {
  const weekday = new Date(`${date}T12:00:00.000Z`).getUTCDay();
  const weeklyOff = Array.isArray(doctor.weeklyOffDays) && doctor.weeklyOffDays.includes(weekday);
  const holiday = Array.isArray(doctor.holidays) && doctor.holidays.find((item) =>
    item.date === date && (!item.branchId || String(item.branchId) === String(branchId))
  );
  return { closed: weeklyOff || Boolean(holiday), reason: holiday?.reason || (weeklyOff ? "Weekly off" : "") };
};

const patientprofile = async (req, res) => {
  try {
    if (!req.userID) return res.status(401).json({ msg: "Not authenticated" });
    const allowedFields = ["name", "age", "gender", "email", "phone", "address", "medicalHistory", "avatar"];
    const updates = allowedFields.reduce((result, field) => {
      if (req.body[field] !== undefined) result[field] = req.body[field];
      return result;
    }, {});
    const profile = await Patient.findOneAndUpdate(
      { userId: req.userID },
      { $set: updates, $setOnInsert: { userId: req.userID } },
      { new: true, upsert: true, runValidators: true }
    );

    return res.status(200).json(profile);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ msg: "Unable to save patient profile" });
  }
};

const getPatientProfile = async (req, res) => {
  try {
    if (!req.userID) return res.status(401).json({ msg: "Not authenticated" });
    const profile = await Patient.findOne({ userId: req.userID }).lean();
    if (!profile) return res.status(404).json({ msg: "Patient profile not found" });
    return res.status(200).json(profile);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ msg: "Unable to load patient profile" });
  }
};

// Book an appointment (persist to backend + create notification for patient)
const bookAppointment = async (req, res) => {
  try {
    const userId = req.userID;
    const {
      doctorId,
      date,
      time,
      reason,
      branchId,
      paymentMethod = "cash",
    } = req.body;

    if (!userId || !doctorId || !date || !time || !["cash", "online"].includes(paymentMethod)) {
      return res
        .status(400)
        .json({ msg: "Doctor, date and time are required" });
    }

    if (req.user?.role !== "Patient") {
      return res.status(403).json({ msg: "Only patients can book appointments" });
    }

    const doctor = await Doctor.findById(doctorId);
    if (!doctor || !isDoctorBookable(doctor)) {
      return res.status(409).json({ msg: "Doctor is currently unavailable for appointments." });
    }

    const branch = getDoctorBranch(doctor, branchId);
    if (!branch) return res.status(409).json({ msg: "Selected clinic branch is unavailable" });
    const patientUserRef = userId;
    const dateStatus = getDateStatus(doctor, date, branch._id);
    if (dateStatus.closed) return res.status(409).json({ msg: `Doctor is unavailable on this date${dateStatus.reason ? ` (${dateStatus.reason})` : ""}` });

    const dayRange = getDayRange(date);
    const today = parseDate(new Date().toISOString().slice(0, 10));
    if (!dayRange || dayRange.start < today) {
      return res.status(400).json({ msg: "Appointment date must be valid and not in the past" });
    }
    const requestedMinutes = String(time).split("-")[0];
    const selectedStart = new Date(`${date}T${requestedMinutes}`);
    if (dayRange.start.getTime() === today.getTime() && selectedStart <= new Date()) {
      return res.status(400).json({ msg: "This time has already passed today. Please choose a later slot." });
    }
    if (!isTimeInSchedule(branch.availabilitySchedule, time)) {
      return res.status(409).json({ msg: "Selected time is outside the doctor's availability" });
    }

    const capacityFilter = {
      doctor: doctor._id,
      date: { $gte: dayRange.start, $lt: dayRange.end },
      time,
      status: { $ne: "cancelled" },
    };
    if (Array.isArray(doctor.branches) && doctor.branches.length) capacityFilter.branchId = branch._id;
    const bookedCount = await Appointment.countDocuments(capacityFilter);
    if (bookedCount >= Number(branch.slotCapacity || doctor.slotCapacity || 0)) {
      return res.status(409).json({ msg: "No appointment slots are available at this time" });
    }

    const patientConflict = await Appointment.exists({
      patientUser: patientUserRef,
      date: { $gte: dayRange.start, $lt: dayRange.end },
      time,
      status: { $ne: "cancelled" },
    });
    if (patientConflict) {
      return res.status(409).json({ msg: "You already have an appointment at this date and time" });
    }

    const patientProfile = await Patient.findOne({ userId }).lean();
    const patientName = patientProfile?.name || req.user.username || "Patient";

    const appointment = await Appointment.create({
      patient: patientUserRef,
      patientUser: patientUserRef,
      doctor: doctor._id,
      doctorName: doctor.name,
      branchId: Array.isArray(doctor.branches) && doctor.branches.length ? branch._id : undefined,
      branchName: branch.name,
      branchCity: branch.city,
      patientName,
      date: dayRange.start,
      time,
      status: "pending",
      reason: reason || "Appointment booking",
      paymentMethod,
      paymentStatus: paymentMethod === "online" ? "pending" : "unpaid",
    });

    // Notify the patient that their booking was received
    await createNotification({
      userId: patientUserRef,
      role: "Patient",
      type: "booking",
      title: "Appointment Booked",
      message: `Your appointment with ${doctor.name || "the doctor"} on ${new Date(
        date
      ).toLocaleDateString()} at ${time} has been booked successfully.`,
      meta: { appointmentId: appointment._id, doctorName: doctor.name, date, time },
    });

    // Notify the doctor about a new appointment
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

    const filter = { doctor: doctor._id };
    if (req.query.date) {
      const dayRange = getDayRange(req.query.date);
      if (!dayRange) return res.status(400).json({ msg: "Invalid appointment date" });
      filter.date = { $gte: dayRange.start, $lt: dayRange.end };
    }

    const appointments = await Appointment.find(filter).sort({
      date: -1,
    }).lean();
    const patientUserIds = appointments.map((appointment) => appointment.patientUser).filter(Boolean);
    const profiles = await Patient.find({ userId: { $in: patientUserIds } }).select("userId name").lean();
    const namesByUserId = new Map(profiles.map((profile) => [profile.userId.toString(), profile.name]));
    const enrichedAppointments = appointments.map((appointment) => ({
      ...appointment,
      patientName: namesByUserId.get(appointment.patientUser?.toString()) || appointment.patientName || "Patient",
    }));

    return res.status(200).json(enrichedAppointments);
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

    if (["admin", "patient"].includes((req.user?.role || "").toLowerCase())) {
      return res.status(403).json({ msg: "Only the assigned doctor can manage appointment status" });
    }

    if (!["pending", "confirmed", "cancelled", "completed"].includes(status)) {
      return res.status(400).json({ msg: "Invalid status" });
    }

    const doctor = await Doctor.findOne({ userId: req.userID });
    const isDoctorOwner = doctor && await Appointment.exists({ _id: id, doctor: doctor._id });
    const isPatientOwner = await Appointment.exists({ _id: id, patientUser: req.userID });

    if (!isDoctorOwner && (!isPatientOwner || status !== "cancelled")) {
      return res.status(403).json({ msg: "You are not authorized to update this appointment" });
    }

    const appointment = await Appointment.findByIdAndUpdate(id, { status }, { new: true });
    if (!appointment) {
      return res.status(404).json({ msg: "Appointment not found" });
    }

    const patientProfile = appointment.patientUser
      ? await Patient.findOne({ userId: appointment.patientUser }).select("name").lean()
      : null;
    if (patientProfile?.name) appointment.patientName = patientProfile.name;

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
    const patientProfile = appointment.patientUser
      ? await Patient.findOne({ userId: appointment.patientUser }).select("name").lean()
      : null;
    if (patientProfile?.name) appointment.patientName = patientProfile.name;

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

    const doctor = await Doctor.findById(appointment.doctor);
    if (!doctor || !isDoctorBookable(doctor)) {
      return res.status(409).json({ msg: "Doctor is currently unavailable for appointments." });
    }
    const dayRange = getDayRange(date);
    const today = parseDate(new Date().toISOString().slice(0, 10));
    if (!dayRange || dayRange.start < today) {
      return res.status(400).json({ msg: "Appointment date must be valid and not in the past" });
    }
    const branch = getDoctorBranch(doctor, appointment.branchId);
    if (!branch) return res.status(409).json({ msg: "The selected clinic branch is unavailable" });
    const selectedStart = new Date(`${date}T${String(time).split("-")[0]}`);
    if (dayRange.start.getTime() === today.getTime() && selectedStart <= new Date()) {
      return res.status(400).json({ msg: "This time has already passed today. Please choose a later slot." });
    }
    if (!isTimeInSchedule(branch.availabilitySchedule, time)) {
      return res.status(409).json({ msg: "Selected time is outside the doctor's availability" });
    }
    const capacityFilter = {
      _id: { $ne: appointment._id },
      doctor: doctor._id,
      date: { $gte: dayRange.start, $lt: dayRange.end },
      time,
      status: { $ne: "cancelled" },
    };
    if (appointment.branchId) capacityFilter.branchId = appointment.branchId;
    const bookedCount = await Appointment.countDocuments(capacityFilter);
    if (bookedCount >= Number(branch.slotCapacity || doctor.slotCapacity || 0)) {
      return res.status(409).json({ msg: "No appointment slots are available at this time" });
    }

    appointment.date = dayRange.start;
    appointment.time = time;
    appointment.doctorName = doctor.name;
    appointment.status = "pending";
    await appointment.save();

    // Let the doctor know the patient moved their slot
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
  getPatientProfile,
  bookAppointment,
  getMyAppointments,
  getDoctorAppointments,
  updateAppointmentStatus,
  getAppointmentById,
  updateAppointmentDetails,
  getPatientHistory,
  rescheduleAppointment,
};
