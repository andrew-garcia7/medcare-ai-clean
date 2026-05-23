require('dotenv').config();
const mongoose = require('mongoose');

const User = require('../models/User');
const Doctor = require('../models/Doctor');
const { Appointment } = require('../models/Appointment');

const MONGO_URI = process.env.MONGO_URI;

// ================= DATA =================

const DOCTORS_DATA = [
  { firstName: 'Sarah', lastName: 'Johnson', email: 'sarah.johnson@medcare.com', specialization: 'Cardiology', exp: 18, fee: 250 },
  { firstName: 'Marcus', lastName: 'Reid', email: 'marcus.reid@medcare.com', specialization: 'Neurology', exp: 14, fee: 230 },
];

const PATIENT_DATA = [
  { firstName: 'James', lastName: 'Martinez', email: 'james.martinez@email.com' },
  { firstName: 'Priya', lastName: 'Thomas', email: 'priya.thomas@email.com' },
];


// ================= SEED =================

async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log('✅ MongoDB Connected');

  await Promise.all([
    User.deleteMany({}),
    Doctor.deleteMany({}),
    Appointment.deleteMany({}),
  ]);

  console.log('🗑️ Old data cleared');

  // 👑 Admin
  await User.create({
    firstName: 'Admin',
    lastName: 'MedCare',
    email: 'admin@medcare.com',
    password: 'Admin@123',
    role: 'admin',
    isEmailVerified: true,
  });

  // 👥 Patients
  const patients = [];
  for (const p of PATIENT_DATA) {
    const user = await User.create({
      ...p,
      password: 'Password123!',
      role: 'patient',
      isEmailVerified: true,
    });
    patients.push(user);
  }

  console.log(`👥 ${patients.length} patients created`);

  // 🩺 Doctors
  for (const d of DOCTORS_DATA) {
    const user = await User.create({
      firstName: d.firstName,
      lastName: d.lastName,
      email: d.email,
      password: 'Doctor123!',
      role: 'doctor',
      isEmailVerified: true,
    });

    await Doctor.create({
      user: user._id,
      specialization: d.specialization,
      experience: d.exp,

      // ✅ FIXED GEO FORMAT
      hospitals: [{
        name: 'MedCare Hospital',
        city: 'New York',
        location: {
          type: 'Point',
          coordinates: [-73.935242, 40.73061], // [lng, lat]
        },
      }],

      fees: {
        inPerson: d.fee,
        video: Math.round(d.fee * 0.8),
        phone: Math.round(d.fee * 0.6),
      },

      availability: [{
        dayOfWeek: 1,
        startTime: '09:00',
        endTime: '17:00',
        isActive: true,
      }],

      isVerified: true,
    });

    console.log(`🩺 Doctor created: ${d.email}`);
  }

  // 📅 Appointment
  const doctor = await Doctor.findOne();

  await Appointment.create({
    patient: patients[0]._id,
    doctor: doctor._id,
    appointmentDate: new Date(Date.now() + 3 * 86400000),
    timeSlot: { start: '10:00', end: '10:30' },
    status: 'confirmed',
    payment: {
      amount: 250,
      status: 'paid',
    },
  });

  console.log('📅 Sample appointment created');

  console.log('\n🔥 SEED COMPLETE');
  console.log('Admin: admin@medcare.com / Admin@123');

  process.exit();
}

seed();