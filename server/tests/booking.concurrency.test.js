const assert = require('node:assert/strict');
const { before, after, test } = require('node:test');
const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

const User = require('../models/user-model');
const Doctor = require('../models/Doctor-model');
const Appointment = require('../models/appointment-model');
const Patient = require('../models/patient-model');
const patientController = require('../controllers/patient-controller');

let app;
let mongoServer;
let doctorId;
let patientIds;

before(async () => {
  mongoServer = await MongoMemoryServer.create({
    binary: {
      version: '7.0.14',
    },
  });
  process.env.MONGODB_URI = mongoServer.getUri();
  process.env.MONGODB_DB_NAME = 'medicare-test';
  process.env.JWT_SECRET = 'test-secret';
  process.env.CLIENT_URL = 'http://localhost:5173';
  process.env.SERVER_URL = 'http://localhost:3000';
  process.env.SESSION_SECRET = 'test-secret';

  await mongoose.connect(process.env.MONGODB_URI, {
    dbName: 'medicare-test',
  });

  const doctor = await Doctor.create({
    name: 'Dr. Shah',
    email: 'doctor@example.com',
    specialization: 'Cardiology',
    clinicAddress: 'Main Clinic',
    city: 'Surat',
    availabilitySchedule: '09:00-13:00,17:00-20:00',
    slotCapacity: 1,
    status: 'approved',
    adminApproved: true,
    subscriptionStatus: 'Trial',
    trialEndsAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
  });
  doctorId = doctor._id.toString();

  patientIds = await Promise.all(
    Array.from({ length: 50 }, (_, index) =>
      User.create({
        username: `Patient ${index + 1}`,
        email: `patient${index + 1}@example.com`,
        phone: `90000000${String(index + 1).padStart(2, '0')}`,
        password: 'hashed-password',
        role: 'Patient',
      }).then((user) => user._id)
    )
  );

  await Promise.all(
    patientIds.map((userId, index) =>
      Patient.create({
        userId,
        name: `Patient ${index + 1}`,
        age: '30',
        gender: 'Male',
        email: `patient${index + 1}@example.com`,
        phone: `90000000${String(index + 1).padStart(2, '0')}`,
        address: 'Test Address',
      })
    )
  );

  app = express();
  app.use(express.json());
  app.use((req, res, next) => {
    const authUserId = req.headers['x-user-id'];
    const patient = authUserId ? patientIds.find((id) => id.toString() === authUserId.toString()) : patientIds[0];
    if (!patient) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    req.userID = patient;
    req.user = { _id: patient, role: 'Patient', username: 'Test Patient' };
    next();
  });
  app.post('/api/patientform/appointments', patientController.bookAppointment);
  app.patch('/api/patientform/appointments/:id/status', patientController.updateAppointmentStatus);
});

after(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

test('50 parallel bookings for one slot produce exactly one success and 49 conflicts', async () => {
  const slotDate = '2035-02-15';
  const slotTime = '09:00-09:30';

  const requests = patientIds.map((patientId) =>
    request(app)
      .post('/api/patientform/appointments')
      .set('x-user-id', patientId.toString())
      .send({
        doctorId,
        date: slotDate,
        time: slotTime,
        reason: 'Follow-up',
        paymentMethod: 'cash',
      })
  );

  const responses = await Promise.all(requests);
  const successCount = responses.filter((res) => res.status === 201).length;
  const conflictCount = responses.filter((res) => res.status === 409).length;
  const activeAppointments = await Appointment.countDocuments({
    doctor: doctorId,
    date: new Date(`${slotDate}T00:00:00.000Z`),
    time: slotTime,
    status: { $in: ['pending', 'confirmed'] },
  });

  assert.equal(successCount, 1);
  assert.equal(conflictCount, 49);
  assert.equal(activeAppointments, 1);
});

test('same patient cannot overlap slots, cancelled slots can be reused, and past-date bookings are rejected', async () => {
  const patientId = patientIds[0];

  const first = await request(app)
    .post('/api/patientform/appointments')
    .set('x-user-id', patientId.toString())
    .send({
      doctorId,
      date: '2035-02-16',
      time: '10:00-10:30',
      reason: 'First checkup',
      paymentMethod: 'cash',
    });

  assert.equal(first.status, 201);

  const overlap = await request(app)
    .post('/api/patientform/appointments')
    .set('x-user-id', patientId.toString())
    .send({
      doctorId,
      date: '2035-02-16',
      time: '10:15-10:45',
      reason: 'Overlap attempt',
      paymentMethod: 'cash',
    });

  assert.equal(overlap.status, 409);

  const appointmentId = first.body.appointment._id || first.body.appointment.id;
  const cancelled = await request(app)
    .patch(`/api/patientform/appointments/${appointmentId}/status`)
    .set('x-user-id', patientId.toString())
    .send({ status: 'cancelled' });

  assert.equal(cancelled.status, 200);

  const rebook = await request(app)
    .post('/api/patientform/appointments')
    .set('x-user-id', patientId.toString())
    .send({
      doctorId,
      date: '2035-02-16',
      time: '10:00-10:30',
      reason: 'Rebook after cancel',
      paymentMethod: 'cash',
    });

  assert.equal(rebook.status, 201);

  const pastDate = await request(app)
    .post('/api/patientform/appointments')
    .set('x-user-id', patientId.toString())
    .send({
      doctorId,
      date: '2020-01-01',
      time: '09:00-09:30',
      reason: 'Past date',
      paymentMethod: 'cash',
    });

  assert.equal(pastDate.status, 400);
});
