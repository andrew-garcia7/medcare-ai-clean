const User = require('../models/User');

// ================= REGISTER =================
exports.register = async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const user = await User.create({
      firstName,
      lastName,
      email,
      password,
    });

    const token = user.getSignedJwtToken();

    res.status(201).json({
      user,
      token,
    });
  } catch (err) {
    if (err.name === 'MongooseError' && err.message.includes('buffering timed out')) {
      return res.status(503).json({ error: 'Database is temporarily unavailable. Please try again in a moment.' });
    }
    res.status(500).json({ error: err.message || 'Registration failed' });
  }
};


// ================= LOGIN =================
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(400).json({ error: 'User not found' });
    }

    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid password' });
    }

    const token = user.getSignedJwtToken();

    res.json({
      user,
      token,
    });
  } catch (err) {
    if (err.name === 'MongooseError' && err.message.includes('buffering timed out')) {
      return res.status(503).json({ error: 'Database is temporarily unavailable. Please try again in a moment.' });
    }
    res.status(500).json({ error: err.message || 'Login failed' });
  }
};


// ================= GET ME =================
exports.getMe = async (req, res) => {
  const user = await User.findById(req.user?.id);

  res.json({
    user,
  });
};

exports.logout = (req, res) => {
  res.json({ message: "Logged out successfully" });
};