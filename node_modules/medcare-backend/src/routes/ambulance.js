const express = require('express');
const router = express.Router();
const { v4: uuid } = require('uuid');

// ═══════════════════════════════════════════════════════
//  HARDCODED AMBULANCE FLEET (works without MongoDB)
// ═══════════════════════════════════════════════════════

const AMBULANCE_FLEET = [
  {
    _id: 'amb-1',
    vehicleNumber: 'MH-12-AB-1234',
    driverName: 'Rajesh Kumar',
    phone: '+91 98765 43210',
    photo: 'https://randomuser.me/api/portraits/men/32.jpg',
    rating: 4.9,
    experience: '8 yrs',
    badge: 'Senior Paramedic',
    hospital: { name: 'Apollo Hospital', address: 'Andheri West, Mumbai' },
    type: 'als',
    isAvailable: true,
    status: 'idle',
    location: { type: 'Point', coordinates: [0, 0] },
  },
  {
    _id: 'amb-2',
    vehicleNumber: 'MH-04-CD-5678',
    driverName: 'Priya Sharma',
    phone: '+91 87654 32109',
    photo: 'https://randomuser.me/api/portraits/women/44.jpg',
    rating: 4.8,
    experience: '5 yrs',
    badge: 'Paramedic',
    hospital: { name: 'Fortis Healthcare', address: 'Mulund, Mumbai' },
    type: 'bls',
    isAvailable: true,
    status: 'idle',
    location: { type: 'Point', coordinates: [0, 0] },
  },
  {
    _id: 'amb-3',
    vehicleNumber: 'MH-01-EF-9012',
    driverName: 'Amit Patel',
    phone: '+91 76543 21098',
    photo: 'https://randomuser.me/api/portraits/men/65.jpg',
    rating: 4.95,
    experience: '12 yrs',
    badge: 'Chief Paramedic',
    hospital: { name: 'Kokilaben Hospital', address: 'Andheri West, Mumbai' },
    type: 'icu',
    isAvailable: true,
    status: 'idle',
    location: { type: 'Point', coordinates: [0, 0] },
  },
  {
    _id: 'amb-4',
    vehicleNumber: 'MH-02-GH-3456',
    driverName: 'Sanjay Verma',
    phone: '+91 65432 10987',
    photo: 'https://randomuser.me/api/portraits/men/78.jpg',
    rating: 4.7,
    experience: '6 yrs',
    badge: 'Paramedic',
    hospital: { name: 'Max Super Specialty', address: 'Goregaon, Mumbai' },
    type: 'als',
    isAvailable: true,
    status: 'idle',
    location: { type: 'Point', coordinates: [0, 0] },
  },
  {
    _id: 'amb-5',
    vehicleNumber: 'MH-03-IJ-7890',
    driverName: 'Neha Gupta',
    phone: '+91 54321 09876',
    photo: 'https://randomuser.me/api/portraits/women/68.jpg',
    rating: 4.85,
    experience: '7 yrs',
    badge: 'Senior Paramedic',
    hospital: { name: 'AIIMS Trauma Centre', address: 'Powai, Mumbai' },
    type: 'als',
    isAvailable: true,
    status: 'idle',
    location: { type: 'Point', coordinates: [0, 0] },
  },
];

// In-memory active ride sessions
const activeSessions = new Map();

// ═══════════════════════════════════════════
//  Helper: generate nearby ambulances
// ═══════════════════════════════════════════
function scatterNearUser(userLng, userLat) {
  return AMBULANCE_FLEET.map((amb, i) => {
    const angle = (i / AMBULANCE_FLEET.length) * Math.PI * 2 + Math.random() * 0.5;
    const dist = 0.008 + Math.random() * 0.015;
    return {
      ...amb,
      location: {
        type: 'Point',
        coordinates: [
          userLng + Math.cos(angle) * dist,
          userLat + Math.sin(angle) * dist,
        ],
      },
    };
  });
}

// ═══════════════════════════════════════════
//  Helper: generate smooth route
// ═══════════════════════════════════════════
function generateRoute(startLat, startLng, endLat, endLng, steps = 200) {
  const pts = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const curve = Math.sin(t * Math.PI) * 0.0015 * (Math.random() > 0.5 ? 1 : -1);
    pts.push([
      startLat + (endLat - startLat) * t + curve * 0.4,
      startLng + (endLng - startLng) * t + curve,
    ]);
  }
  return pts;
}

// ═══════════════════════════════════════════
//  GET /nearby — ambulances near a location
// ═══════════════════════════════════════════
router.get('/nearby', (req, res) => {
  const { lat, lng } = req.query;
  if (!lat || !lng) {
    return res.status(400).json({ success: false, error: 'lat and lng required' });
  }

  const ambulances = scatterNearUser(parseFloat(lng), parseFloat(lat))
    .filter((a) => a.isAvailable);

  res.json({ success: true, data: ambulances });
});

// ═══════════════════════════════════════════
//  POST /request — request an ambulance
// ═══════════════════════════════════════════
router.post('/request', (req, res) => {
  const { lat, lng, type = 'als' } = req.body;
  if (!lat || !lng) {
    return res.status(400).json({ success: false, error: 'lat and lng required' });
  }

  // Pick best ambulance (matching type or nearest)
  const fleet = scatterNearUser(parseFloat(lng), parseFloat(lat));
  const matched = fleet.find((a) => a.type === type && a.isAvailable) || fleet[0];

  const sessionId = uuid();
  const ambLat = matched.location.coordinates[1];
  const ambLng = matched.location.coordinates[0];
  const route = generateRoute(ambLat, ambLng, parseFloat(lat), parseFloat(lng), 200);

  const session = {
    sessionId,
    ambulance: {
      _id: matched._id,
      vehicleNumber: matched.vehicleNumber,
      driverName: matched.driverName,
      phone: matched.phone,
      photo: matched.photo,
      rating: matched.rating,
      experience: matched.experience,
      badge: matched.badge,
      hospital: matched.hospital,
      type: matched.type,
    },
    route,
    routeStep: 0,
    status: 'confirmed',
    userLocation: { lat: parseFloat(lat), lng: parseFloat(lng) },
    etaSeconds: 180,
    createdAt: Date.now(),
  };

  activeSessions.set(sessionId, session);

  res.json({
    success: true,
    data: {
      sessionId,
      ambulance: session.ambulance,
      ambulanceLocation: { lat: route[0][0], lng: route[0][1] },
      route: route.map(([la, ln]) => [la, ln]),
      etaSeconds: session.etaSeconds,
      status: 'confirmed',
    },
  });
});

// ═══════════════════════════════════════════
//  GET /session/:id — get session status
// ═══════════════════════════════════════════
router.get('/session/:id', (req, res) => {
  const session = activeSessions.get(req.params.id);
  if (!session) {
    return res.status(404).json({ success: false, error: 'Session not found' });
  }

  const { route, routeStep } = session;
  const currentPos = route[Math.min(routeStep, route.length - 1)];

  res.json({
    success: true,
    data: {
      sessionId: session.sessionId,
      ambulance: session.ambulance,
      ambulanceLocation: { lat: currentPos[0], lng: currentPos[1] },
      status: session.status,
      etaSeconds: session.etaSeconds,
      routeStep,
      totalSteps: route.length,
    },
  });
});

// ═══════════════════════════════════════════
//  POST /cancel/:id — cancel a session
// ═══════════════════════════════════════════
router.post('/cancel/:id', (req, res) => {
  const session = activeSessions.get(req.params.id);
  if (!session) {
    return res.status(404).json({ success: false, error: 'Session not found' });
  }
  session.status = 'cancelled';
  activeSessions.delete(req.params.id);
  res.json({ success: true, message: 'Session cancelled' });
});

module.exports = { router, activeSessions, generateRoute };