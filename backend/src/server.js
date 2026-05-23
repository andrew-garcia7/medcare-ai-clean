const path = require('path');
require('dotenv').config();

console.log("✅ ELEVEN KEY:", process.env.ELEVENLABS_API_KEY);
console.log("✅ OPENAI KEY:", process.env.OPENAI_API_KEY);

require('express-async-errors');

const express = require('express');
const fetch = require('node-fetch');
const http = require('http');

const cors = require('cors');
const helmet = require('helmet');

const session = require("express-session");
const passport = require("passport");

require("./config/passport");
const compression = require('compression');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const swaggerUi = require('swagger-ui-express');

const connectDB = require('./config/database');
const swaggerSpec = require('./config/swagger');
const errorHandler = require('./middleware/errorHandler');
const logger = require('./utils/logger');

// Routes
const authRoutes = require('./routes/auth');
const doctorRoutes = require('./routes/doctors');
const patientRoutes = require('./routes/patients');
const appointmentRoutes = require('./routes/appointments');
const ambulanceRoutes = require('./routes/ambulance').router;
const paymentRoutes = require('./routes/payments');
const uploadRoutes = require('./routes/uploads');
const adminRoutes = require('./routes/admin');

const app = express();
const server = http.createServer(app);

// DB connect
connectDB();

// Security
app.use(helmet());

// Rate limit
app.use('/api', rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));

// CORS
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

app.use(
  session({
    secret: process.env.JWT_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.initialize());
app.use(passport.session());

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());
app.use(compression());

// Logging
app.use(morgan('dev'));

// Swagger
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Health
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: "API Running 🚀" });
});

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/doctors', doctorRoutes);
app.use('/api/v1/patients', patientRoutes);
app.use('/api/v1/appointments', appointmentRoutes);
app.use('/api/v1/ambulance', ambulanceRoutes);
app.use('/api/v1/payments', paymentRoutes);
app.use('/api/v1/uploads', uploadRoutes);
app.use('/api/v1/admin', adminRoutes);



// =========================================
// 🤖 CHAT ROUTE (REAL AI)
// =========================================
app.post('/chat', async (req, res) => {
  try {
    console.log("CHAT HIT ✅");

    const { messages } = req.body;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages,
        temperature: 0.7
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("OpenAI error:", data);
      return res.status(500).json({
        reply: "AI service error"
      });
    }

    res.json({
      reply: data.choices?.[0]?.message?.content || "No response"
    });

  } catch (err) {
    console.error("Chat crash:", err);
    res.status(500).json({ reply: "Chat failed" });
  }
});



// =========================================
// 🔊 VOICE ROUTE (MALE + FEMALE)
// =========================================
app.post('/voice', async (req, res) => {
  try {
    console.log("VOICE HIT ✅");

    const { text, gender } = req.body;

    const voiceId =
      gender === "male"
        ? "pNInz6obpgDQGcFmaJgB"   // male voice
        : "EXAVITQu4vr4xnSDxMaL"; // female voice

    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        method: "POST",
        headers: {
          "xi-api-key": process.env.ELEVENLABS_API_KEY,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          text,
          model_id: "eleven_multilingual_v2",
          voice_settings: {
            stability: 0.4,
            similarity_boost: 0.9,
            style: 0.7,
            use_speaker_boost: true
          }
        })
      }
    );

    if (!response.ok) {
      const err = await response.text();
      console.error("ElevenLabs error:", err);
      return res.status(500).send("Voice error");
    }

    const audio = await response.arrayBuffer();

    console.log("Audio size:", audio.byteLength);

    res.set({
      "Content-Type": "audio/mpeg",
      "Content-Length": audio.byteLength
    });

    res.send(Buffer.from(audio));

  } catch (err) {
    console.error("Voice crash:", err);
    res.status(500).send("Voice failed");
  }
});



// 404
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: `Route ${req.originalUrl} not found`,
  });
});

// Error handler
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

// Crash safety
process.on('unhandledRejection', (err) => {
  console.error(err.message);
  process.exit(1);
});

process.on('SIGTERM', () => {
  server.close(() => process.exit(0));
});

module.exports = app;