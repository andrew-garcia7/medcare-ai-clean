const mongoose = require('mongoose');

const AmbulanceSchema = new mongoose.Schema({
  vehicleNumber: { type: String, required: true },
  driverName: { type: String, required: true },
  phone: String,
  photo: String,
  rating: { type: Number, default: 4.5 },
  experience: String,
  badge: String,

  hospital: {
    name: String,
    address: String,
  },

  type: {
    type: String,
    enum: ['bls', 'als', 'icu'],
    default: 'als',
  },

  location: {
    type: {
      type: String,
      default: 'Point',
    },
    coordinates: {
      type: [Number], // [lng, lat]
      index: '2dsphere',
    },
  },

  isAvailable: { type: Boolean, default: true },

  equipment: [String],

  status: {
    type: String,
    enum: ['idle', 'assigned', 'en-route', 'arrived'],
    default: 'idle',
  },

}, { timestamps: true });

module.exports = mongoose.model('Ambulance', AmbulanceSchema);