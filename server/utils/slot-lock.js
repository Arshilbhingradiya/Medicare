const AppointmentSlot = require("../models/appointment-slot-model");

// Atomically claims one seat in a slot if capacity allows it.
// Returns true if the seat was claimed, false if the slot is full.
// Relies on the unique index on {doctor, branchId, dateKey, time}: if the
// filter (which requires bookedCount < capacity) matches nothing because the
// slot is already full, the upsert attempt collides with that unique index
// and throws E11000, which we treat as "slot full" rather than an error.
const reserveSlot = async ({ doctor, branchId, dateKey, time, capacity }) => {
  if (!(capacity > 0)) return false;
  try {
    const result = await AppointmentSlot.findOneAndUpdate(
      {
        doctor,
        branchId: branchId || null,
        dateKey,
        time,
        bookedCount: { $lt: capacity },
      },
      {
        $inc: { bookedCount: 1 },
        $setOnInsert: { doctor, branchId: branchId || null, dateKey, time },
      },
      { new: true, upsert: true }
    );
    return Boolean(result);
  } catch (error) {
    if (error && error.code === 11000) return false; // slot was already full
    throw error;
  }
};

// Frees one seat in a slot (e.g. on cancellation or reschedule-away).
// Never lets bookedCount go negative.
const releaseSlot = async ({ doctor, branchId, dateKey, time }) => {
  await AppointmentSlot.updateOne(
    { doctor, branchId: branchId || null, dateKey, time, bookedCount: { $gt: 0 } },
    { $inc: { bookedCount: -1 } }
  );
};

module.exports = { reserveSlot, releaseSlot };
