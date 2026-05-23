const express = require('express');
const router = express.Router();

const User = require('../models/User');
const {
  Appointment,
  Prescription,
  MedicalRecord,
} = require('../models/Appointment');

const { protect, authorize } = require('../middleware/auth');
const logger = require('../utils/logger');


// ================= DASHBOARD =================
router.get('/dashboard', protect, authorize('patient'), async (req, res) => {
  try {
    const userId = req.user.id;

    const [appointments, prescriptions, records] = await Promise.all([
      Appointment.find({
        patient: userId,
        appointmentDate: { $gte: new Date() },
        status: { $in: ['pending', 'confirmed'] },
      })
        .populate({
          path: 'doctor',
          populate: {
            path: 'user',
            select: 'firstName lastName avatar',
          },
        })
        .sort({ appointmentDate: 1 })
        .limit(5)
        .lean(),

      Prescription.find({
        patient: userId,
        isActive: true,
      })
        .populate({
          path: 'doctor',
          populate: {
            path: 'user',
            select: 'firstName lastName',
          },
        })
        .lean(),

      MedicalRecord.find({
        patient: userId,
        isSharedWithPatient: true,
      })
        .sort({ date: -1 })
        .limit(10)
        .lean(),
    ]);

    res.json({
      success: true,
      data: {
        upcomingAppointments: appointments,
        prescriptions,
        records,
        stats: {
          upcomingCount: appointments.length,
          activePrescriptions: prescriptions.length,
          totalRecords: records.length,
        },
      },
    });

  } catch (err) {
    logger.error(err.message);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});


// ================= GET RECORDS =================
router.get('/records', protect, authorize('patient'), async (req, res) => {
  try {
    const { type, page = 1, limit = 10 } = req.query;

    const filter = {
      patient: req.user.id,
      isSharedWithPatient: true,
    };

    if (type) filter.type = type;

    const records = await MedicalRecord.find(filter)
      .sort({ date: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .lean();

    res.json({
      success: true,
      count: records.length,
      data: records,
    });

  } catch (err) {
    logger.error(err.message);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});


// ================= GET PRESCRIPTIONS =================
router.get('/prescriptions', protect, authorize('patient'), async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const prescriptions = await Prescription.find({
      patient: req.user.id,
    })
      .populate({
        path: 'doctor',
        populate: {
          path: 'user',
          select: 'firstName lastName',
        },
      })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .lean();

    res.json({
      success: true,
      count: prescriptions.length,
      data: prescriptions,
    });

  } catch (err) {
    logger.error(err.message);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});


// ================= EXPORT =================
module.exports = router;