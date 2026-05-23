const express = require('express');
const router = express.Router();
const { protect, optionalAuth } = require('../middleware/auth');

// ─── In-Memory Appointments Store (works without MongoDB) ───
const appointmentsStore = new Map();
let idCounter = 1;

// ─── In-Memory Payment Data Store (for post-payment page reload support) ───
const paymentsStore = new Map();

// Doctor lookup for enriching appointment data
const DOCTORS_MAP = {
  d1:  { name: 'Dr. Priya Sharma',    specialization: 'Cardiology',    photo: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=400&fit=crop&crop=face', fee: 1200 },
  d2:  { name: 'Dr. Rajesh Kapoor',    specialization: 'Cardiology',    photo: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&h=400&fit=crop&crop=face', fee: 1500 },
  d3:  { name: 'Dr. Aisha Patel',      specialization: 'Orthopedics',   photo: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=400&h=400&fit=crop&crop=face', fee: 800 },
  d4:  { name: 'Dr. Vikram Singh',     specialization: 'Orthopedics',   photo: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&h=400&fit=crop&crop=face', fee: 1000 },
  d5:  { name: 'Dr. Meera Reddy',      specialization: 'Dermatology',   photo: 'https://images.unsplash.com/photo-1651008376811-b90baee60c1f?w=400&h=400&fit=crop&crop=face', fee: 700 },
  d6:  { name: 'Dr. Arjun Nair',       specialization: 'Neurology',     photo: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=400&h=400&fit=crop&crop=face', fee: 1800 },
  d7:  { name: 'Dr. Sneha Gupta',      specialization: 'Pediatrics',    photo: 'https://images.unsplash.com/photo-1527613426441-4da17471b66d?w=400&h=400&fit=crop&crop=face', fee: 600 },
  d8:  { name: 'Dr. Rohan Desai',      specialization: 'General',       photo: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=400&h=400&fit=crop&crop=face', fee: 500 },
  d9:  { name: 'Dr. Kavitha Menon',    specialization: 'Gynecology',    photo: 'https://images.unsplash.com/photo-1643297654416-05795d62e39c?w=400&h=400&fit=crop&crop=face', fee: 900 },
  d10: { name: 'Dr. Sanjay Rao',       specialization: 'Oncology',      photo: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&h=400&fit=crop&crop=face', fee: 2000 },
};

// Seed some sample appointments
function seedSampleData(userId) {
  if (appointmentsStore.size > 0) return;
  const uid = userId || 'demo-user';
  const now = new Date();

  const samples = [
    {
      doctorId: 'd1', date: new Date(now.getTime() + 2 * 86400000).toISOString().split('T')[0],
      timeSlot: '10:30 AM', mode: 'in-person', reason: 'Routine cardiac check-up',
      status: 'confirmed',
    },
    {
      doctorId: 'd6', date: new Date(now.getTime() + 5 * 86400000).toISOString().split('T')[0],
      timeSlot: '2:00 PM', mode: 'video', reason: 'Follow-up for migraines',
      status: 'pending',
    },
    {
      doctorId: 'd5', date: new Date(now.getTime() - 10 * 86400000).toISOString().split('T')[0],
      timeSlot: '11:00 AM', mode: 'in-person', reason: 'Skin rash on forearm',
      status: 'completed', doctorNotes: 'Contact dermatitis. Prescribed hydrocortisone cream. Follow up in 2 weeks.',
      diagnosis: 'Contact Dermatitis',
    },
    {
      doctorId: 'd7', date: new Date(now.getTime() - 25 * 86400000).toISOString().split('T')[0],
      timeSlot: '3:30 PM', mode: 'video', reason: 'Child fever and cough',
      status: 'completed', doctorNotes: 'Viral upper respiratory infection. Rest and fluids advised. Paracetamol for fever.',
      diagnosis: 'Viral URI',
    },
    {
      doctorId: 'd3', date: new Date(now.getTime() - 45 * 86400000).toISOString().split('T')[0],
      timeSlot: '9:00 AM', mode: 'in-person', reason: 'Knee pain while walking',
      status: 'completed', doctorNotes: 'Mild ligament strain. Physiotherapy recommended 3x/week. Knee brace advised.',
      diagnosis: 'Lateral Collateral Ligament Strain',
    },
  ];

  samples.forEach(s => {
    const id = `apt-${idCounter++}`;
    const doc = DOCTORS_MAP[s.doctorId] || DOCTORS_MAP.d1;
    appointmentsStore.set(id, {
      _id: id,
      userId: uid,
      doctorId: s.doctorId,
      doctorName: doc.name,
      doctorSpecialization: doc.specialization,
      doctorPhoto: doc.photo,
      date: s.date,
      timeSlot: s.timeSlot,
      mode: s.mode,
      reason: s.reason,
      status: s.status,
      doctorNotes: s.doctorNotes || null,
      diagnosis: s.diagnosis || null,
      payment: { amount: doc.fee, status: s.status === 'completed' ? 'paid' : 'pending', currency: 'INR' },
      referenceNumber: `MC-${Date.now().toString().slice(-6)}-${Math.random().toString(36).substring(2, 5).toUpperCase()}`,
      createdAt: new Date(s.date).toISOString(),
    });
  });
}

// ─── SEED prescriptions & records stores ───
const prescriptionsStore = new Map();
let rxCounter = 1;

function seedPrescriptions(userId) {
  if (prescriptionsStore.size > 0) return;
  const uid = userId || 'demo-user';

  const samples = [
    {
      doctorId: 'd5', date: new Date(Date.now() - 10 * 86400000).toISOString().split('T')[0],
      diagnosis: 'Contact Dermatitis',
      medications: [
        { name: 'Hydrocortisone Cream 1%', dosage: 'Apply thin layer', frequency: 'Twice daily', duration: '14 days', instructions: 'Apply to affected area after washing' },
        { name: 'Cetirizine 10mg', dosage: '1 tablet', frequency: 'Once daily at night', duration: '7 days', instructions: 'Take before sleep' },
      ],
      notes: 'Avoid contact with irritants. Use mild soap. Follow up in 2 weeks if no improvement.',
    },
    {
      doctorId: 'd7', date: new Date(Date.now() - 25 * 86400000).toISOString().split('T')[0],
      diagnosis: 'Viral Upper Respiratory Infection',
      medications: [
        { name: 'Paracetamol 500mg', dosage: '1 tablet', frequency: 'Every 6 hours (if fever)', duration: '5 days', instructions: 'Take with food' },
        { name: 'Ambroxol Syrup', dosage: '10ml', frequency: 'Three times daily', duration: '5 days', instructions: 'After meals' },
        { name: 'Vitamin C 500mg', dosage: '1 tablet', frequency: 'Once daily', duration: '10 days', instructions: 'After breakfast' },
      ],
      notes: 'Plenty of warm fluids. Rest for 3 days. Return if fever persists beyond 3 days.',
    },
    {
      doctorId: 'd3', date: new Date(Date.now() - 45 * 86400000).toISOString().split('T')[0],
      diagnosis: 'Lateral Collateral Ligament Strain',
      medications: [
        { name: 'Diclofenac 50mg', dosage: '1 tablet', frequency: 'Twice daily', duration: '7 days', instructions: 'Take after meals with antacid' },
        { name: 'Thiocolchicoside 4mg', dosage: '1 capsule', frequency: 'Twice daily', duration: '5 days', instructions: 'Muscle relaxant — may cause drowsiness' },
        { name: 'Calcium + Vitamin D3', dosage: '1 tablet', frequency: 'Once daily', duration: '30 days', instructions: 'After dinner' },
      ],
      notes: 'Use knee brace during walking. Start physiotherapy after 1 week. Avoid stairs & squatting for 2 weeks.',
    },
    {
      doctorId: 'd1', date: new Date(Date.now() - 90 * 86400000).toISOString().split('T')[0],
      diagnosis: 'Hypertension Stage 1',
      medications: [
        { name: 'Amlodipine 5mg', dosage: '1 tablet', frequency: 'Once daily morning', duration: '90 days', instructions: 'Take on empty stomach' },
        { name: 'Atorvastatin 20mg', dosage: '1 tablet', frequency: 'Once daily at night', duration: '90 days', instructions: 'Take after dinner' },
        { name: 'Aspirin 75mg', dosage: '1 tablet', frequency: 'Once daily after lunch', duration: '90 days', instructions: 'Do not take on empty stomach' },
      ],
      notes: 'Reduce salt intake. Walk 30 min daily. Monitor BP weekly. Follow up in 3 months.',
    },
  ];

  samples.forEach(s => {
    const id = `rx-${rxCounter++}`;
    const doc = DOCTORS_MAP[s.doctorId] || DOCTORS_MAP.d1;
    prescriptionsStore.set(id, {
      _id: id,
      userId: uid,
      doctorId: s.doctorId,
      doctorName: doc.name,
      doctorSpecialization: doc.specialization,
      doctorPhoto: doc.photo,
      date: s.date,
      diagnosis: s.diagnosis,
      medications: s.medications,
      notes: s.notes,
      createdAt: new Date(s.date).toISOString(),
    });
  });
}

const recordsStore = new Map();
let recCounter = 1;

function seedRecords(userId) {
  if (recordsStore.size > 0) return;
  const uid = userId || 'demo-user';

  const samples = [
    { type: 'visit', title: 'Cardiac Check-up', doctorId: 'd1', date: new Date(Date.now() - 90 * 86400000).toISOString().split('T')[0], diagnosis: 'Hypertension Stage 1', notes: 'BP 145/92. Started on Amlodipine. Follow-up in 3 months.' },
    { type: 'lab', title: 'Complete Blood Count (CBC)', doctorId: 'd1', date: new Date(Date.now() - 88 * 86400000).toISOString().split('T')[0], diagnosis: null, notes: 'All values normal. Hb: 14.2, WBC: 7200, Platelets: 2.5L', results: { hemoglobin: '14.2 g/dL', wbc: '7,200 /μL', platelets: '2.5 L/μL', rbc: '4.8 M/μL' } },
    { type: 'visit', title: 'Knee Pain Consultation', doctorId: 'd3', date: new Date(Date.now() - 45 * 86400000).toISOString().split('T')[0], diagnosis: 'LCL Strain', notes: 'X-ray normal. MRI shows mild ligament strain. Physiotherapy advised.' },
    { type: 'imaging', title: 'Knee MRI — Left', doctorId: 'd3', date: new Date(Date.now() - 43 * 86400000).toISOString().split('T')[0], diagnosis: null, notes: 'Mild partial-thickness tear of lateral collateral ligament. No fracture. Menisci intact.' },
    { type: 'visit', title: 'Skin Rash Follow-up', doctorId: 'd5', date: new Date(Date.now() - 10 * 86400000).toISOString().split('T')[0], diagnosis: 'Contact Dermatitis', notes: 'Rash improving with hydrocortisone. Continue for 1 more week.' },
    { type: 'lab', title: 'Lipid Panel', doctorId: 'd1', date: new Date(Date.now() - 5 * 86400000).toISOString().split('T')[0], diagnosis: null, notes: 'LDL slightly elevated. Continue Atorvastatin.', results: { totalCholesterol: '210 mg/dL', ldl: '138 mg/dL', hdl: '45 mg/dL', triglycerides: '160 mg/dL' } },
    { type: 'visit', title: 'Child Fever — Video Consult', doctorId: 'd7', date: new Date(Date.now() - 25 * 86400000).toISOString().split('T')[0], diagnosis: 'Viral URI', notes: 'Symptomatic treatment. Fever resolved in 2 days.' },
  ];

  samples.forEach(s => {
    const id = `rec-${recCounter++}`;
    const doc = DOCTORS_MAP[s.doctorId] || DOCTORS_MAP.d1;
    recordsStore.set(id, {
      _id: id,
      userId: uid,
      type: s.type,
      title: s.title,
      doctorId: s.doctorId,
      doctorName: doc.name,
      doctorSpecialization: doc.specialization,
      date: s.date,
      diagnosis: s.diagnosis,
      notes: s.notes,
      results: s.results || null,
      createdAt: new Date(s.date).toISOString(),
    });
  });
}


// ═══════════════════ ROUTES ═══════════════════

// ── GET available time slots for a doctor on a date ──
router.get('/slots', (req, res) => {
  const { doctorId, date } = req.query;
  if (!doctorId || !date) {
    return res.status(400).json({ success: false, error: 'doctorId and date are required' });
  }

  // Generate slots (9AM — 5PM, 30min each)
  const allSlots = [];
  for (let h = 9; h < 17; h++) {
    allSlots.push(`${h > 12 ? h - 12 : h}:00 ${h >= 12 ? 'PM' : 'AM'}`);
    allSlots.push(`${h > 12 ? h - 12 : h}:30 ${h >= 12 ? 'PM' : 'AM'}`);
  }

  // Remove booked slots
  const booked = new Set();
  appointmentsStore.forEach(apt => {
    if (apt.doctorId === doctorId && apt.date === date && apt.status !== 'cancelled') {
      booked.add(apt.timeSlot);
    }
  });

  const available = allSlots.filter(s => !booked.has(s));

  res.json({ success: true, data: { slots: available, date, doctorId } });
});


// ── POST create appointment ──
router.post('/', (req, res) => {
  const { doctorId, date, timeSlot, mode, reason } = req.body;

  if (!doctorId || !date || !timeSlot) {
    return res.status(400).json({ success: false, error: 'doctorId, date, and timeSlot are required' });
  }

  // Check for double booking
  let conflict = false;
  appointmentsStore.forEach(apt => {
    if (apt.doctorId === doctorId && apt.date === date && apt.timeSlot === timeSlot && apt.status !== 'cancelled') {
      conflict = true;
    }
  });

  if (conflict) {
    return res.status(409).json({ success: false, error: 'This slot is already booked' });
  }

  const doc = DOCTORS_MAP[doctorId] || { name: 'Unknown Doctor', specialization: 'General', photo: '', fee: 500 };
  const id = `apt-${idCounter++}`;
  const userId = req.user?.id || req.body.userId || 'demo-user';

  const appointment = {
    _id: id,
    userId,
    doctorId,
    doctorName: doc.name,
    doctorSpecialization: doc.specialization,
    doctorPhoto: doc.photo,
    date,
    timeSlot,
    mode: mode || 'in-person',
    reason: reason || '',
    status: 'confirmed',
    doctorNotes: null,
    diagnosis: null,
    payment: { amount: doc.fee, status: 'pending', currency: 'INR' },
    referenceNumber: `MC-${Date.now().toString().slice(-6)}-${Math.random().toString(36).substring(2, 5).toUpperCase()}`,
    createdAt: new Date().toISOString(),
  };

  appointmentsStore.set(id, appointment);

  res.status(201).json({ success: true, data: appointment });
});


// ── GET user appointments ──
router.get('/user', (req, res) => {
  const userId = req.user?.id || 'demo-user';
  seedSampleData(userId);

  const { status, upcoming } = req.query;
  let results = [...appointmentsStore.values()].filter(a => a.userId === userId);

  if (status) results = results.filter(a => a.status === status);
  if (upcoming === 'true') {
    const today = new Date().toISOString().split('T')[0];
    results = results.filter(a => a.date >= today && a.status !== 'cancelled' && a.status !== 'completed');
  }

  results.sort((a, b) => new Date(b.date) - new Date(a.date));

  res.json({ success: true, count: results.length, data: results });
});


// ── GET single appointment ──
router.get('/:id', (req, res) => {
  const apt = appointmentsStore.get(req.params.id);
  if (!apt) return res.status(404).json({ success: false, error: 'Appointment not found' });
  res.json({ success: true, data: apt });
});


// ── PUT cancel appointment ──
router.put('/:id/cancel', (req, res) => {
  const apt = appointmentsStore.get(req.params.id);
  if (!apt) return res.status(404).json({ success: false, error: 'Appointment not found' });

  apt.status = 'cancelled';
  apt.cancelledAt = new Date().toISOString();
  apt.cancellationReason = req.body.reason || 'Cancelled by patient';
  appointmentsStore.set(req.params.id, apt);

  res.json({ success: true, data: apt });
});


// ═══════════ PRESCRIPTIONS ═══════════

router.get('/data/prescriptions', (req, res) => {
  const userId = req.user?.id || 'demo-user';
  seedPrescriptions(userId);

  const results = [...prescriptionsStore.values()]
    .filter(p => p.userId === userId)
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  res.json({ success: true, count: results.length, data: results });
});

router.get('/data/prescriptions/:id', (req, res) => {
  const rx = prescriptionsStore.get(req.params.id);
  if (!rx) return res.status(404).json({ success: false, error: 'Prescription not found' });
  res.json({ success: true, data: rx });
});

router.delete('/data/prescriptions', (req, res) => {
  const userId = req.user?.id || 'demo-user';
  const toDelete = [...prescriptionsStore.entries()].filter(([, v]) => v.userId === userId);
  toDelete.forEach(([k]) => prescriptionsStore.delete(k));
  res.json({ success: true, deleted: toDelete.length });
});


// ═══════════ RECORDS ═══════════

router.get('/data/records', (req, res) => {
  const userId = req.user?.id || 'demo-user';
  seedRecords(userId);

  const { type } = req.query;
  let results = [...recordsStore.values()].filter(r => r.userId === userId);

  if (type) results = results.filter(r => r.type === type);

  results.sort((a, b) => new Date(b.date) - new Date(a.date));

  res.json({ success: true, count: results.length, data: results });
});

router.delete('/data/records', (req, res) => {
  const userId = req.user?.id || 'demo-user';
  const toDelete = [...recordsStore.entries()].filter(([, v]) => v.userId === userId);
  toDelete.forEach(([k]) => recordsStore.delete(k));
  res.json({ success: true, deleted: toDelete.length });
});


// ═══════════ PROFILE ═══════════

const profileStore = new Map();

router.get('/data/profile', (req, res) => {
  const userId = req.user?.id || 'demo-user';

  if (!profileStore.has(userId)) {
    profileStore.set(userId, {
      userId,
      firstName: 'Ajoy',
      lastName: 'Dev',
      email: 'ajoy@medcare.com',
      phone: '+91 98765 43210',
      age: 28,
      gender: 'Male',
      bloodType: 'B+',
      address: '42, Marine Drive, Mumbai 400020',
      allergies: ['Penicillin', 'Dust'],
      medications: ['Atorvastatin 20mg', 'Amlodipine 5mg'],
      conditions: ['Hypertension Stage 1'],
      emergencyContact: { name: 'Priya Dev', relation: 'Spouse', phone: '+91 98765 12345' },
      insurance: { provider: 'Star Health', policyNumber: 'SH-2026-48210', validUntil: '2027-03-31' },
      avatar: null,
    });
  }

  res.json({ success: true, data: profileStore.get(userId) });
});


router.put('/data/profile', (req, res) => {
  const userId = req.user?.id || 'demo-user';

  const existing = profileStore.get(userId) || {};
  const updated = { ...existing, ...req.body, userId };
  profileStore.set(userId, updated);

  res.json({ success: true, data: updated });
});


// ── GET payment / transaction history ──
router.get('/payments/history', (req, res) => {
  const userId = req.user?.id || 'demo-user';
  seedSampleData(userId);

  const appointments = [...appointmentsStore.values()].filter(a => a.userId === userId);

  const transactions = appointments
    .map(a => ({
      _id: `txn-${a._id}`,
      appointmentId: a._id,
      referenceNumber: a.referenceNumber,
      doctorName: a.doctorName,
      doctorSpecialization: a.doctorSpecialization,
      doctorPhoto: a.doctorPhoto,
      date: a.date,
      timeSlot: a.timeSlot,
      amount: a.payment?.amount || 0,
      currency: a.payment?.currency || 'INR',
      status: a.payment?.status || 'pending',
      method: a.payment?.method || 'card',
      appointmentStatus: a.status,
      createdAt: a.createdAt,
    }))
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  const totalPaid = transactions.filter(t => t.status === 'paid').reduce((s, t) => s + t.amount, 0);
  const totalPending = transactions.filter(t => t.status === 'pending').reduce((s, t) => s + t.amount, 0);

  res.json({
    success: true,
    count: transactions.length,
    summary: { totalPaid, totalPending, currency: 'INR' },
    data: transactions,
  });
});


router.delete('/payments/history', (req, res) => {
  const userId = req.user?.id || 'demo-user';
  const toDelete = [...appointmentsStore.entries()].filter(([, v]) => v.userId === userId);
  toDelete.forEach(([k]) => appointmentsStore.delete(k));
  res.json({ success: true, deleted: toDelete.length });
});


// ── SAVE payment data (called after successful payment) ──
router.post('/payment/save', (req, res) => {
  const {
    paymentId, doctorName, patientName, patientPhone, patientEmail,
    fee, method, maskedCard, date, time, visitReason, appointmentId,
    doctor,
  } = req.body;

  if (!paymentId) {
    return res.status(400).json({ success: false, error: 'paymentId is required' });
  }

  const paymentData = {
    paymentId,
    doctorName: doctorName || 'Doctor',
    patientName: patientName || '',
    patientPhone: patientPhone || '',
    patientEmail: patientEmail || '',
    fee: fee || 500,
    method: method || 'Card',
    maskedCard: maskedCard || '',
    date: date || null,
    time: time || null,
    visitReason: visitReason || '',
    appointmentId: appointmentId || null,
    doctor: doctor || null,
    status: 'paid',
    paidAt: new Date().toISOString(),
  };

  paymentsStore.set(paymentId, paymentData);

  res.json({ success: true, data: paymentData });
});


// ── GET payment data by paymentId (for page reload support) ──
router.get('/payment/:pid', (req, res) => {
  const { pid } = req.params;
  const paymentData = paymentsStore.get(pid);

  if (!paymentData) {
    return res.status(404).json({ success: false, error: 'Payment not found' });
  }

  res.json({ success: true, data: paymentData });
});


module.exports = router;