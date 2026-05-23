const mongoose = require('mongoose');

// ================= SUB SCHEMAS =================

// Availability
const AvailabilitySlotSchema = new mongoose.Schema({
  dayOfWeek: { type: Number, min: 0, max: 6 },
  startTime: String,
  endTime: String,
  slotDuration: { type: Number, default: 30 },
  isActive: { type: Boolean, default: true },
});

// Reviews
const ReviewSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
  },
  rating: { type: Number, min: 1, max: 5, required: true },
  comment: { type: String, maxlength: 500 },
  isVerified: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

// Prevent duplicate reviews by same user
ReviewSchema.index({ patient: 1 }, { unique: true });


// ================= MAIN SCHEMA =================

const DoctorSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },

    title: {
      type: String,
      enum: ['Dr.', 'Prof.', 'Assoc. Prof.'],
      default: 'Dr.',
    },

    specialization: {
      type: String,
      required: true,
      index: true,
    },

    subSpecialization: String,

    bio: {
      type: String,
      maxlength: 1000,
    },

    photo: {
      public_id: String,
      url: { type: String, default: '' },
    },

    // 🎓 Education
    education: [
      {
        degree: String,
        institution: String,
        year: Number,
        country: String,
      },
    ],

    experience: { type: Number, default: 0 },

    boardCertifications: [String],

    languages: [{ type: String }],

    // 📍 Location with GEO support
    hospitals: [
      {
        name: String,
        address: String,
        city: { type: String, index: true },
        state: String,

        location: {
          type: {
            type: String,
            enum: ['Point'],
            default: 'Point',
          },
          coordinates: {
            type: [Number], // [lng, lat]
            index: '2dsphere',
          },
        },
      },
    ],

    // 🕒 Availability
    availability: [AvailabilitySlotSchema],

    consultationModes: {
      inPerson: { type: Boolean, default: true },
      video: { type: Boolean, default: true },
      phone: { type: Boolean, default: false },
    },

    // 💰 Fees
    fees: {
      inPerson: { type: Number, default: 250 },
      video: { type: Number, default: 180 },
      phone: { type: Number, default: 120 },
    },

    // ⭐ Reviews
    reviews: [ReviewSchema],

    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
      index: true,
    },

    totalReviews: { type: Number, default: 0 },

    // 📊 Stats
    totalPatients: { type: Number, default: 0 },
    totalAppointments: { type: Number, default: 0 },

    // ✅ Status
    isVerified: { type: Boolean, default: false, index: true },
    isAvailableToday: { type: Boolean, default: false },
    acceptingNewPatients: { type: Boolean, default: true, index: true },

    licenseNumber: String,
    npiNumber: String,
  },
  {
    timestamps: true,
  }
);


// ================= MIDDLEWARE =================

// Calculate rating
DoctorSchema.pre('save', function (next) {
  if (this.reviews.length > 0) {
    const total = this.reviews.reduce((acc, r) => acc + r.rating, 0);

    this.averageRating =
      Math.round((total / this.reviews.length) * 10) / 10;

    this.totalReviews = this.reviews.length;
  } else {
    this.averageRating = 0;
    this.totalReviews = 0;
  }

  next();
});


// ================= METHODS =================

// Check availability today
DoctorSchema.methods.checkTodayAvailability = function () {
  const today = new Date().getDay();

  return this.availability.some(
    (slot) => slot.dayOfWeek === today && slot.isActive
  );
};


// ================= INDEXES =================

// DoctorSchema.index({ specialization: 1 });
// DoctorSchema.index({ user: 1 });
DoctorSchema.index({ averageRating: -1 });

DoctorSchema.index({
  specialization: 'text',
  subSpecialization: 'text',
  bio: 'text',
});


// ================= EXPORT =================

module.exports = mongoose.model('Doctor', DoctorSchema);