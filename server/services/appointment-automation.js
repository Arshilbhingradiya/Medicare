const Appointment = require("../models/appointment-model");
const Notification = require("../models/notification-model");
const { createNotification } = require("../controllers/notification-controller");

const sendAppointmentReminders = async () => {
  const now = new Date();
  const appointments = await Appointment.find({
    status: { $in: ["pending", "confirmed"] },
    date: { $gte: new Date(now.toISOString().slice(0, 10)) },
  }).lean();

  for (const appointment of appointments) {
    const slotStart = String(appointment.time || "").split("-")[0];
    const appointmentAt = new Date(`${appointment.date.toISOString().slice(0, 10)}T${slotStart}`);
    if (Number.isNaN(appointmentAt.getTime()) || appointmentAt < now || appointmentAt > new Date(now.getTime() + 60 * 60 * 1000)) continue;
    const reminderKey = `${appointment._id}:${appointment.date.toISOString()}:${appointment.time}`;
    const alreadySent = await Notification.exists({
      userId: appointment.patientUser,
      type: "appointment_reminder",
      "meta.reminderKey": reminderKey,
    });
    if (appointment.patientUser && !alreadySent) {
      await createNotification({
        userId: appointment.patientUser,
        role: "Patient",
        type: "appointment_reminder",
        title: "Appointment reminder",
        message: `Your appointment with ${appointment.doctorName || "your doctor"} is scheduled soon at ${appointment.time}.`,
        meta: { appointmentId: appointment._id, reminderKey },
      });
    }
  }
};

module.exports = { sendAppointmentReminders };