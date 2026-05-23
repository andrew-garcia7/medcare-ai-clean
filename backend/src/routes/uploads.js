const express = require('express');
const multer = require('multer');
const router = express.Router();

const cloudinary = require('../config/cloudinary');
const { protect } = require('../middleware/auth');

const User = require('../models/User');
const Doctor = require('../models/Doctor');
const { MedicalRecord } = require('../models/Appointment');

const logger = require('../utils/logger');

// ================= MULTER =================
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
});


// ================= CLOUDINARY UPLOAD =================
const uploadToCloudinary = (fileBuffer, folder) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      { folder },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    ).end(fileBuffer);
  });
};


// ================= AVATAR =================
router.post('/avatar', protect, upload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No file uploaded' });
    }

    const result = await uploadToCloudinary(req.file.buffer, 'avatars');

    await User.findByIdAndUpdate(req.user.id, {
      avatar: {
        public_id: result.public_id,
        url: result.secure_url,
      },
    });

    res.json({
      success: true,
      data: { url: result.secure_url },
    });

  } catch (err) {
    logger.error(err.message);
    res.status(500).json({ success: false, error: 'Upload failed' });
  }
});


// ================= DOCTOR PHOTO =================
router.post('/doctor-photo', protect, upload.single('photo'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No file uploaded' });
    }

    const result = await uploadToCloudinary(req.file.buffer, 'doctors');

    await Doctor.findOneAndUpdate(
      { user: req.user.id },
      {
        photo: {
          public_id: result.public_id,
          url: result.secure_url,
        },
      }
    );

    res.json({
      success: true,
      data: { url: result.secure_url },
    });

  } catch (err) {
    logger.error(err.message);
    res.status(500).json({ success: false, error: 'Upload failed' });
  }
});


// ================= MEDICAL RECORD =================
router.post('/medical-record', protect, upload.single('document'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No file uploaded' });
    }

    const result = await uploadToCloudinary(req.file.buffer, 'medical-records');

    const record = await MedicalRecord.create({
      patient: req.user.id,
      type: req.body.type || 'other',
      title: req.body.title || req.file.originalname,
      description: req.body.description,
      file: {
        public_id: result.public_id,
        url: result.secure_url,
        filename: req.file.originalname,
        mimeType: req.file.mimetype,
        size: req.file.size,
      },
      isSharedWithPatient: true,
    });

    res.status(201).json({
      success: true,
      data: record,
    });

  } catch (err) {
    logger.error(err.message);
    res.status(500).json({ success: false, error: 'Upload failed' });
  }
});


module.exports = router;