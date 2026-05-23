const express = require('express');
const router = express.Router();

const passport = require("passport");

const {
  register,
  login,
  getMe,
  logout,
} = require('../controllers/authController');


// NORMAL ROUTES
router.post('/register', register);
router.post('/login', login);
router.get('/me', getMe);
router.post('/logout', logout);


// ================= GOOGLE AUTH =================

// GOOGLE LOGIN
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
  })
);

// GOOGLE CALLBACK
router.get(
  "/google/callback",

  passport.authenticate("google", {
    failureRedirect: "/login",
    session: true,
  }),

  async (req, res) => {
    const token = req.user.getSignedJwtToken();

res.redirect(
  `http://localhost:5173/oauth-success?token=${token}`
);
  }
);


module.exports = router;