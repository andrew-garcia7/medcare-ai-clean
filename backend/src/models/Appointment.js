const mongoose = require('mongoose');


// ================= APPOINTMENT =================

const AppointmentSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },

  doctor: {
    type: mongoose.Schema.ObjectId,
    ref: 'Doctor',
    required: true,
    index: true,
  },

  appointmentDate: {
    type: Date,
    required: true,
    index: true,
  },

  timeSlot: {
    start: { type: String, required: true },
    end: { type: String, required: true },
  },

  consultationType: {
    type: String,
    enum: ['in-person', 'video', 'phone'],
    default: 'in-person',
  },

  hospital: {
    name: String,
    address: String,
    city: String,
  },

  status: {
    type: String,
    enum: [
      'pending',
      'confirmed',
      'in-progress',
      'completed',
      'cancelled',
      'no-show',
    ],
    default: 'pending',
    index: true,
  },

  reasonForVisit: String,
  symptoms: [String],

  notes: {
    patientNotes: String,
    doctorNotes: String,
    privateNotes: { type: String, select: false },
  },

  // 💳 PAYMENT
  payment: {
    amount: { type: Number, required: true },
    currency: { type: String, default: 'usd' },

    status: {
      type: String,
      enum: ['pending', 'paid', 'refunded', 'failed'],
      default: 'pending',
    },

    method: {
      type: String,
      enum: ['card', 'insurance', 'cash'],
    },

    stripePaymentIntentId: String,
    stripeChargeId: String,

    paidAt: Date,
    refundedAt: Date,
  },

  // 📸 FILES (REPORTS / PRESCRIPTIONS)
  attachments: [
    {
      public_id: String,
      url: String,
      fileType: String,
      uploadedAt: { type: Date, default: Date.now },
    },
  ],

  // 🎥 VIDEO CALL
  videoCall: {
    roomId: String,
    joinUrl: String,
    startedAt: Date,
    endedAt: Date,
  },

  // 🧾 PRESCRIPTION
  prescription: {
    type: mongoose.Schema.ObjectId,
    ref: 'Prescription',
  },

  // 🔐 SLOT LOCK (IMPORTANT)
  slotLocked: {
    type: Boolean,
    default: false,
  },

  referenceNumber: {
    type: String,
    unique: true,
  },

  cancelledAt: Date,
  cancellationReason: String,
  completedAt: Date,

  // 📊 AUDIT TRAIL
  timeline: [
    {
      status: String,
      timestamp: { type: Date, default: Date.now },
      note: String,
    },
  ],

}, { timestamps: true });


// 🔥 PREVENT DOUBLE BOOKING
AppointmentSchema.index(
  { doctor: 1, appointmentDate: 1, 'timeSlot.start': 1 },
  { unique: true }
);


// 🔥 AUTO REF NUMBER
AppointmentSchema.pre('save', function (next) {
  if (!this.referenceNumber) {
    this.referenceNumber =
      `MC-${Date.now().toString().slice(-6)}-${Math.random()
        .toString(36)
        .substring(2, 5)
        .toUpperCase()}`;
  }
  next();
});


// ================= PRESCRIPTION =================

const PrescriptionSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.ObjectId, ref: 'User' },
  doctor: { type: mongoose.Schema.ObjectId, ref: 'Doctor' },
  appointment: { type: mongoose.Schema.ObjectId, ref: 'Appointment' },

  medications: [
    {
      name: String,
      dosage: String,
      frequency: String,
      duration: String,
      instructions: String,
    },
  ],

  diagnosis: String,
  notes: String,

  file: {
    public_id: String,
    url: String,
  },

  expiryDate: Date,

}, { timestamps: true });


// ================= AMBULANCE =================

const AmbulanceRequestSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.ObjectId, ref: 'User' },

  callerName: String,
  callerPhone: String,

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
    address: String,
  },

  emergencyType: String,
  severity: String,

  status: {
    type: String,
    enum: [
      'requested',
      'dispatched',
      'en-route',
      'arrived',
      'completed',
    ],
    default: 'requested',
    index: true,
  },

  assignedAmbulance: {
    vehicleNumber: String,
    paramedicName: String,
    currentLocation: {
      type: [Number],
    },
  },

  eta: Number,

  // 🔥 REAL TIME TRACKING
  liveTracking: [
    {
      coordinates: [Number],
      timestamp: { type: Date, default: Date.now },
    },
  ],

  referenceId: String,

}, { timestamps: true });


// ================= MEDICAL RECORD =================

const MedicalRecordSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.ObjectId, ref: 'User' },
  doctor: { type: mongoose.Schema.ObjectId, ref: 'Doctor' },

  type: String,
  title: String,

  file: {
    public_id: String,
    url: String,
  },

  results: mongoose.Schema.Types.Mixed,

}, { timestamps: true });


// ================= EXPORT =================

module.exports = {
  Appointment: mongoose.model('Appointment', AppointmentSchema),
  Prescription: mongoose.model('Prescription', PrescriptionSchema),
  AmbulanceRequest: mongoose.model('AmbulanceRequest', AmbulanceRequestSchema),
  MedicalRecord: mongoose.model('MedicalRecord', MedicalRecordSchema),
};