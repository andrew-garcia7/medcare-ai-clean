const jwt = require('jsonwebtoken');
const User = require('../models/User');


// ================= GET TOKEN =================
const getTokenFromRequest = (req) => {
  if (req.headers.authorization?.startsWith('Bearer')) {
    return req.headers.authorization.split(' ')[1];
  }

  if (req.cookies?.token) {
    return req.cookies.token;
  }

  return null;
};


// ================= PROTECT ROUTE =================
const protect = async (req, res, next) => {
  try {
    const token = getTokenFromRequest(req);

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized. No token provided.',
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select('+isActive');

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'User not found',
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        error: 'Account is deactivated',
      });
    }

    req.user = user;
    next();

  } catch (err) {
    return res.status(401).json({
      success: false,
      error: 'Token invalid or expired',
    });
  }
};


// ================= ROLE AUTH =================
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: `Role '${req.user?.role}' is not authorized`,
      });
    }
    next();
  };
};


// ================= OPTIONAL AUTH =================
const optionalAuth = async (req, res, next) => {
  try {
    const token = getTokenFromRequest(req);

    if (!token) return next();

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id);

    if (user) {
      req.user = user;
    }

  } catch (err) {
    // silently fail (important for optional auth)
  }

  next();
};


module.exports = {
  protect,
  authorize,
  optionalAuth,
};