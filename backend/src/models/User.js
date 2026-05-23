const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const UserSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
      maxlength: [50, 'First name cannot exceed 50 characters'],
    },

    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true,
      maxlength: [50, 'Last name cannot exceed 50 characters'],
    },

    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
    },

    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      select: false,
    },

    role: {
      type: String,
      enum: ['patient', 'doctor', 'admin', 'staff'],
      default: 'patient',
      index: true,
    },

    phone: {
      type: String,
      match: [/^\+?[\d\s\-().]{7,20}$/, 'Invalid phone number'],
    },

    avatar: {
      public_id: String,
      url: { type: String, default: '' },
    },

    dateOfBirth: Date,

    gender: {
      type: String,
      enum: ['male', 'female', 'other', 'prefer_not_to_say'],
    },

    address: {
      street: String,
      city: { type: String, index: true },
      state: String,
      zipCode: String,
      country: { type: String, default: 'US' },
    },

    // 🧬 Health Info
    healthInfo: {
      bloodType: {
        type: String,
        enum: ['A+','A-','B+','B-','O+','O-','AB+','AB-','Unknown'],
      },
      height: String,
      weight: String,
      allergies: [String],
      conditions: [String],
      medications: [String],
      emergencyContact: {
        name: String,
        relationship: String,
        phone: String,
      },
    },

    // 💳 Insurance
    insurance: {
      provider: String,
      memberId: String,
      groupNumber: String,
      expiryDate: Date,
    },

    isEmailVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },

    lastLogin: Date,

    emailVerificationToken: String,
    emailVerificationExpire: Date,

    resetPasswordToken: String,
    resetPasswordExpire: Date,

    oauthProvider: {
      type: String,
      enum: ['google', 'apple', 'local'],
      default: 'local',
    },

    oauthId: String,

    notificationPreferences: {
      email: { type: Boolean, default: true },
      sms: { type: Boolean, default: true },
      appointmentReminders: { type: Boolean, default: true },
      healthInsights: { type: Boolean, default: true },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);


// ================= VIRTUALS =================

// Full Name
UserSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`;
});

// Age
UserSchema.virtual('age').get(function () {
  if (!this.dateOfBirth) return null;
  return Math.floor(
    (Date.now() - this.dateOfBirth) / (365.25 * 24 * 60 * 60 * 1000)
  );
});


// ================= MIDDLEWARE =================

// Hash password
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});


// ================= METHODS =================

// Compare password
UserSchema.methods.matchPassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

// Generate JWT
UserSchema.methods.getSignedJwtToken = function () {
  return jwt.sign(
    { id: this._id, role: this.role },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRE || '7d',
    }
  );
};

// Email verification token
UserSchema.methods.getEmailVerificationToken = function () {
  const token = crypto.randomBytes(20).toString('hex');

  this.emailVerificationToken = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');

  this.emailVerificationExpire =
    Date.now() + 24 * 60 * 60 * 1000;

  return token;
};

// Reset password token
UserSchema.methods.getResetPasswordToken = function () {
  const token = crypto.randomBytes(20).toString('hex');

  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');

  this.resetPasswordExpire =
    Date.now() + 10 * 60 * 1000;

  return token;
};


// ================= INDEXES =================

// Indexes are already defined in schema fields above
// UserSchema.index({ email: 1 }, { unique: true });
// UserSchema.index({ role: 1 });
// UserSchema.index({ 'address.city': 1 });


// ================= EXPORT =================

module.exports = mongoose.model('User', UserSchema);