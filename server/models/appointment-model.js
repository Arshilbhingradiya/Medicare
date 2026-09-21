const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Users',
    required: true
  },
  patientUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Users'
  },
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
    required: true
  },
  doctorName: { type: String },
  patientName: { type: String },
  date: {
    type: Date,
    required: true
  },
  time: {
    type: String,
    required: true
  },
  startsAt: {
    type: Date,
    index: true,
  },
  endsAt: {
    type: Date,
  },
  idempotencyKey: { type: String, maxlength: 200 },
  branchId: { type: mongoose.Schema.Types.ObjectId },
  branchName: { type: String },
  branchCity: { type: String },
  paymentMethod: {
    type: String,
    enum: ["cash", "online"],
    default: "cash",
  },
  paymentStatus: {
    type: String,
    enum: ["unpaid", "pending", "paid", "refunded"],
    default: "unpaid",
  },
  paymentReference: { type: String },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'completed'],
    default: 'pending'
  },
  reason: {
    type: String
  },
  notes: {
    type: String
  },
  consultation: {
    notes: { type: String, trim: true },
    diagnosis: { type: String, trim: true },
    medicines: [{
      name: { type: String, trim: true },
      dosage: { type: String, trim: true },
      frequency: { type: String, trim: true },
      duration: { type: String, trim: true },
      instructions: { type: String, trim: true },
    }],
    advice: { type: String, trim: true },
    followUpDate: { type: Date },
    completedAt: { type: Date },
  },
  prescription: {
    type: String
  },
  weight: {
    type: String
  },
  height: {
    type: String
  },
  phone: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const activeStatusFilter = { status: { $in: ['pending', 'confirmed'] } };

appointmentSchema.index(
  { doctor: 1, startsAt: 1 },
  { unique: true, partialFilterExpression: activeStatusFilter }
);
appointmentSchema.index(
  { patient: 1, startsAt: 1 },
  { unique: true, partialFilterExpression: activeStatusFilter }
);
appointmentSchema.index(
  { patientUser: 1, idempotencyKey: 1 },
  { unique: true, partialFilterExpression: { idempotencyKey: { $type: "string" } } }
);

appointmentSchema.pre('validate', function preValidate(next) {
  if (this.date && this.time && !this.startsAt) {
    const startLabel = String(this.time).split('-')[0].trim();
    const [hours, minutes] = startLabel.split(':').map(Number);
    if (Number.isInteger(hours) && Number.isInteger(minutes)) {
      const asDate = new Date(this.date);
      if (!Number.isNaN(asDate.getTime())) {
        const localDate = new Date(asDate.getTime());
        localDate.setUTCHours(hours, minutes, 0, 0);
        this.startsAt = new Date(localDate.getTime() + (5 * 60 + 30) * 60 * 1000);
      }
    }
  }
  next();
});

module.exports = mongoose.model("Appointment", appointmentSchema);
