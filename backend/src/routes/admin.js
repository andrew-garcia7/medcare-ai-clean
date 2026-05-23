const express = require('express');
const router = express.Router();

const User = require('../models/User');
const Doctor = require('../models/Doctor');
const { Appointment, AmbulanceRequest } = require('../models/Appointment');

const { protect, authorize } = require('../middleware/auth');
const logger = require('../utils/logger');

// 🔐 Protect all routes
router.use(protect, authorize('admin'));


// ================= DASHBOARD STATS =================
router.get('/stats', async (req, res) => {
  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const [
      totalUsers,
      totalDoctors,
      totalAppointments,
      pendingAppointments,
      todayAppointments,
      activeAmbulance,
    ] = await Promise.all([
      User.countDocuments({ role: 'patient' }),
      Doctor.countDocuments({ isVerified: true }),
      Appointment.countDocuments(),
      Appointment.countDocuments({ status: 'pending' }),
      Appointment.countDocuments({
        appointmentDate: { $gte: todayStart, $lte: todayEnd },
      }),
      AmbulanceRequest.countDocuments({
        status: { $in: ['dispatched', 'en-route'] },
      }),
    ]);

    const revenueAgg = await Appointment.aggregate([
      { $match: { 'payment.status': 'paid' } },
      { $group: { _id: null, total: { $sum: '$payment.amount' } } },
    ]);

    res.json({
      success: true,
      data: {
        totalPatients: totalUsers,
        totalDoctors,
        totalAppointments,
        pendingAppointments,
        todayAppointments,
        activeAmbulance,
        totalRevenue: revenueAgg[0]?.total || 0,
      },
    });

  } catch (err) {
    logger.error(err.message);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});


// ================= VERIFY DOCTOR =================
router.patch('/doctors/:id/verify', async (req, res) => {
  try {
    const doctor = await Doctor.findByIdAndUpdate(
      req.params.id,
      { isVerified: req.body.isVerified },
      { new: true }
    );

    if (!doctor) {
      return res.status(404).json({ success: false, error: 'Doctor not found' });
    }

    res.json({ success: true, data: doctor });

  } catch (err) {
    logger.error(err.message);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});


// ================= GET USERS =================
router.get('/users', async (req, res) => {
  try {
    const { role, page = 1, limit = 20 } = req.query;

    const filter = {};
    if (role) filter.role = role;

    const users = await User.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .lean();

    const total = await User.countDocuments(filter);

    res.json({
      success: true,
      total,
      data: users,
    });

  } catch (err) {
    logger.error(err.message);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});


// ================= TOGGLE USER =================
router.patch('/users/:id/toggle-active', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.json({
      success: true,
      data: { isActive: user.isActive },
    });

  } catch (err) {
    logger.error(err.message);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});


// ================= GET APPOINTMENTS =================
router.get('/appointments', async (req, res) => {
  try {
    const { status, date, page = 1, limit = 20 } = req.query;

    const filter = {};

    if (status) filter.status = status;

    if (date) {
      const d = new Date(date);

      const start = new Date(d.setHours(0, 0, 0, 0));
      const end = new Date(d.setHours(23, 59, 59, 999));

      filter.appointmentDate = { $gte: start, $lte: end };
    }

    const appointments = await Appointment.find(filter)
      .populate('patient', 'firstName lastName email')
      .populate({
        path: 'doctor',
        populate: { path: 'user', select: 'firstName lastName' },
      })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .lean();

    const total = await Appointment.countDocuments(filter);

    res.json({
      success: true,
      total,
      data: appointments,
    });

  } catch (err) {
    logger.error(err.message);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});


// ================= EXPORT =================
module.exports = router;