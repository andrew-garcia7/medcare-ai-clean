const { Server } = require('socket.io');

let io;
const simulations = new Map(); // sessionId → intervalId

const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:5173',
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket) => {
    console.log('⚡ User connected:', socket.id);

    // ── Client joins a tracking session room ──
    socket.on('join_session', (sessionId) => {
      socket.join(sessionId);
      console.log(`📍 Socket ${socket.id} joined session ${sessionId}`);
      startSimulation(sessionId);
    });

    // ── Client cancels session ──
    socket.on('cancel_session', (sessionId) => {
      stopSimulation(sessionId);
      io.to(sessionId).emit('session_cancelled', { sessionId });
      console.log(`🚫 Session ${sessionId} cancelled`);
    });

    socket.on('disconnect', () => {
      console.log('❌ User disconnected:', socket.id);
    });
  });
};

// ═══════════════════════════════════════════════
//  AMBULANCE MOVEMENT SIMULATION ENGINE
// ═══════════════════════════════════════════════
function startSimulation(sessionId) {
  // Avoid double-starting
  if (simulations.has(sessionId)) return;

  // Lazy-require to avoid circular dependency
  const { activeSessions } = require('./routes/ambulance');
  const session = activeSessions.get(sessionId);
  if (!session) return;

  const { route } = session;
  const totalSteps = route.length;
  const totalDurationMs = session.etaSeconds * 1000;
  const intervalMs = totalDurationMs / totalSteps;

  console.log(`🚑 Simulation started: ${sessionId} (${totalSteps} steps, ${intervalMs.toFixed(0)}ms each)`);

  // Emit initial statuses with delays
  setTimeout(() => {
    session.status = 'dispatched';
    io.to(sessionId).emit('status_update', { sessionId, status: 'dispatched' });
  }, 1500);

  setTimeout(() => {
    session.status = 'en-route';
    io.to(sessionId).emit('status_update', { sessionId, status: 'en-route' });
  }, 3500);

  const iv = setInterval(() => {
    session.routeStep++;
    const step = session.routeStep;

    if (step >= totalSteps) {
      clearInterval(iv);
      simulations.delete(sessionId);
      session.status = 'arrived';
      session.etaSeconds = 0;

      io.to(sessionId).emit('location_update', {
        sessionId,
        lat: route[totalSteps - 1][0],
        lng: route[totalSteps - 1][1],
        step,
        totalSteps,
        etaSeconds: 0,
        status: 'arrived',
        route: [],
      });

      io.to(sessionId).emit('status_update', { sessionId, status: 'arrived' });
      console.log(`🏁 Ambulance arrived: ${sessionId}`);
      return;
    }

    // Update ETA
    const remaining = totalSteps - step;
    session.etaSeconds = Math.round((remaining / totalSteps) * (totalDurationMs / 1000));

    const pos = route[step];
    const remainingRoute = route.slice(step);

    io.to(sessionId).emit('location_update', {
      sessionId,
      lat: pos[0],
      lng: pos[1],
      step,
      totalSteps,
      etaSeconds: session.etaSeconds,
      status: session.status,
      route: remainingRoute,
    });
  }, intervalMs);

  simulations.set(sessionId, iv);
}

function stopSimulation(sessionId) {
  const iv = simulations.get(sessionId);
  if (iv) {
    clearInterval(iv);
    simulations.delete(sessionId);
  }
  const { activeSessions } = require('./routes/ambulance');
  activeSessions.delete(sessionId);
}

const getIO = () => {
  if (!io) throw new Error('Socket not initialized');
  return io;
};

module.exports = { initSocket, getIO };