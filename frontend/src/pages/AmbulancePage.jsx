import { useState, useEffect, useRef, useCallback, useMemo, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';
import api from '../services/api';
import AmbulanceMap from '../components/ambulance/AmbulanceTracker';

/* ── Animated Back Button ── */
function BackButton({ onClick, light = false }) {
  return (
    <motion.button
      onClick={onClick}
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -20, opacity: 0 }}
      whileHover={{ scale: 1.1, x: -3 }}
      whileTap={{ scale: 0.9 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      className={`flex items-center justify-center w-10 h-10 rounded-full backdrop-blur-md border shadow-lg transition-colors ${
        light
          ? 'bg-white/80 border-slate-200 text-slate-700 hover:bg-white'
          : 'bg-white/10 border-white/15 text-white hover:bg-white/20'
      }`}
      aria-label="Go back"
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 12H5" />
        <path d="M12 19l-7-7 7-7" />
      </svg>
    </motion.button>
  );
}

/* ════════════════════════════════════════════
   CONSTANTS
   ════════════════════════════════════════════ */

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

const TYPE_META = {
  bls: { name: 'Basic Life Support',    icon: '🚑', color: '#60a5fa' },
  als: { name: 'Advanced Life Support', icon: '🏥', color: '#fbbf24' },
  icu: { name: 'ICU On Wheels',         icon: '💊', color: '#f87171' },
};

const TIMELINE_STEPS = [
  { key: 'confirmed',  label: 'Confirmed',  icon: '✅' },
  { key: 'dispatched', label: 'Dispatched', icon: '🚑' },
  { key: 'en-route',   label: 'En Route',   icon: '🛣\uFE0F' },
  { key: 'arrived',    label: 'Arrived',    icon: '🏁' },
];

/* ════════════════════════════════════════════
   HELPERS
   ════════════════════════════════════════════ */

function generateHospitals(lat, lng) {
  const names = [
    'Apollo Hospital', 'Fortis Healthcare', 'Max Super Specialty',
    'Medanta Medical City', 'Kokilaben Hospital', 'AIIMS Trauma Centre',
  ];
  return names.map((name, i) => {
    const angle = (i / names.length) * Math.PI * 2;
    const dist = 0.01 + Math.random() * 0.012;
    return {
      name,
      lat: lat + Math.cos(angle) * dist,
      lng: lng + Math.sin(angle) * dist,
      distance: `${(1.2 + Math.random() * 3.5).toFixed(1)} km`,
    };
  });
}

/* ════════════════════════════════════════════
   MAIN COMPONENT
   ════════════════════════════════════════════ */

export default function AmbulancePage() {
  const navigate = useNavigate();

  // UI state
  const [phase, setPhase]           = useState('idle'); // idle | locating | ready | requesting | tracking | arrived
  const [panelOpen, setPanelOpen]   = useState(false);
  const [selectedType, setSelectedType] = useState('als');

  // Location & data
  const [userLoc, setUserLoc]               = useState(null);
  const [nearbyAmbulances, setNearbyAmb]    = useState([]);
  const [hospitals, setHospitals]           = useState([]);

  // Session / tracking
  const [sessionId, setSessionId]           = useState(null);
  const [driver, setDriver]                 = useState(null);
  const [ambulanceLoc, setAmbulanceLoc]     = useState(null);
  const [routePoints, setRoutePoints]       = useState(null);
  const [etaSeconds, setEtaSeconds]         = useState(0);
  const [status, setStatus]                 = useState('idle');

  // Socket ref
  const socketRef = useRef(null);

  // Touch swipe for bottom panel
  const touchStartY = useRef(0);

  /* ── DETECT LOCATION ─────────────────────── */
  const detectLocation = useCallback(() => {
    setPhase('locating');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUserLoc(loc);
        setHospitals(generateHospitals(loc.lat, loc.lng));
        setPhase('ready');
        fetchNearby(loc);
        toast.success('Location detected');
      },
      () => {
        // Fallback: Mumbai
        const loc = { lat: 19.076, lng: 72.8777 };
        setUserLoc(loc);
        setHospitals(generateHospitals(loc.lat, loc.lng));
        setPhase('ready');
        fetchNearby(loc);
        toast('Using default location (Mumbai)', { icon: '📍' });
      },
      { enableHighAccuracy: true, timeout: 8000 },
    );
  }, []);

  /* ── FETCH NEARBY AMBULANCES ─────────────── */
  const fetchNearby = async (loc) => {
    try {
      const { data } = await api.get(`/ambulance/nearby?lat=${loc.lat}&lng=${loc.lng}`);
      if (data.success) setNearbyAmb(data.data);
    } catch {
      // silent — api might be down
    }
  };

  /* ── REQUEST AMBULANCE ───────────────────── */
  const requestAmbulance = useCallback(async () => {
    if (!userLoc) return;
    setPhase('requesting');

    try {
      const { data } = await api.post('/ambulance/request', {
        lat: userLoc.lat,
        lng: userLoc.lng,
        type: selectedType,
      });

      if (!data.success) throw new Error('Request failed');

      const { sessionId: sid, ambulance, ambulanceLocation, route, etaSeconds: eta } = data.data;

      setSessionId(sid);
      setDriver(ambulance);
      setAmbulanceLoc(ambulanceLocation);
      setRoutePoints(route);
      setEtaSeconds(eta);
      setStatus('confirmed');
      setPhase('tracking');
      setPanelOpen(true);

      // Connect socket
      connectSocket(sid);

      toast.success('Ambulance dispatched!');
    } catch (err) {
      toast.error(err.message || 'Failed to request ambulance');
      setPhase('ready');
    }
  }, [userLoc, selectedType]);

  /* ── SOCKET.IO CONNECTION ────────────────── */
  const connectSocket = useCallback((sid) => {
    if (socketRef.current) socketRef.current.disconnect();

    const socket = io(SOCKET_URL, { transports: ['websocket', 'polling'] });
    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('⚡ Socket connected:', socket.id);
      socket.emit('join_session', sid);
    });

    socket.on('location_update', (payload) => {
      setAmbulanceLoc({ lat: payload.lat, lng: payload.lng });
      setEtaSeconds(payload.etaSeconds);
      if (payload.route?.length) setRoutePoints(payload.route);
      if (payload.status) setStatus(payload.status);
    });

    socket.on('status_update', (payload) => {
      setStatus(payload.status);
      if (payload.status === 'arrived') {
        setPhase('arrived');
        setRoutePoints(null);
        toast.success('Ambulance has arrived!', { icon: '🏁', duration: 6000 });
      }
    });

    socket.on('session_cancelled', () => {
      resetAll();
      toast('Session cancelled', { icon: '❌' });
    });

    socket.on('disconnect', () => console.log('Socket disconnected'));
  }, []);

  /* ── CANCEL ──────────────────────────────── */
  const cancelSession = useCallback(async () => {
    if (!sessionId) return;
    try {
      await api.post(`/ambulance/cancel/${sessionId}`);
      socketRef.current?.emit('cancel_session', sessionId);
    } catch { /* ignore */ }
    resetAll();
    toast('Ride cancelled', { icon: '🚫' });
  }, [sessionId]);

  /* ── RESET ───────────────────────────────── */
  const resetAll = useCallback(() => {
    socketRef.current?.disconnect();
    socketRef.current = null;
    setSessionId(null);
    setDriver(null);
    setAmbulanceLoc(null);
    setRoutePoints(null);
    setEtaSeconds(0);
    setStatus('idle');
    setPhase('ready');
    setPanelOpen(false);
    if (userLoc) fetchNearby(userLoc);
  }, [userLoc]);

  /* ── CLEANUP ─────────────────────────────── */
  useEffect(() => () => {
    socketRef.current?.disconnect();
  }, []);

  /* ── ETA DISPLAY ─────────────────────────── */
  const etaMin = Math.floor(etaSeconds / 60);
  const etaSec = etaSeconds % 60;

  /* ── TIMELINE INDEX ──────────────────────── */
  const timelineIdx = useMemo(() => {
    const idx = TIMELINE_STEPS.findIndex((s) => s.key === status);
    return idx >= 0 ? idx : -1;
  }, [status]);

  /* ══════════════════════════════════════════
     RENDER — FULL SCREEN UBER-LIKE LAYOUT
     ══════════════════════════════════════════ */
  return (
    <div className="relative w-full" style={{ height: 'calc(100vh - 72px)' }}>

      {/* ═══ BACK BUTTON (visible on ready phase, over map) ═══ */}
      {(phase === 'ready' || phase === 'requesting') && (
        <div className="absolute top-4 left-4 z-[25]">
          <BackButton onClick={() => navigate(-1)} light />
        </div>
      )}

      {/* ═══ FULL SCREEN MAP (z-1, always behind UI) ═══ */}
      <AmbulanceMap
        userLoc={userLoc}
        ambulanceLoc={ambulanceLoc}
        nearbyAmbulances={phase === 'ready' ? nearbyAmbulances : []}
        hospitals={hospitals}
        routePoints={routePoints}
        status={status}
      />

      {/* ═══ TOP STATUS BAR (during tracking) ═══ */}
      <AnimatePresence>
        {phase === 'tracking' && (
          <motion.div
            initial={{ y: -80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -80, opacity: 0 }}
            className="absolute top-4 left-4 right-4 z-[30]"
          >
            <div className="rounded-2xl bg-slate-900/90 backdrop-blur-lg border border-white/10 shadow-lg">
              <div className="px-5 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <BackButton onClick={() => navigate(-1)} />
                  <div className={`w-3 h-3 rounded-full ${status === 'en-route' ? 'bg-green-400 animate-pulse' : 'bg-amber-400'}`} />
                  <span className="text-white font-medium text-sm capitalize">
                    {status === 'en-route' ? 'Ambulance En Route' : status}
                  </span>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-amber-400/70 uppercase tracking-widest block">ETA</span>
                  <span className="text-white font-bold font-mono text-lg">
                    {String(etaMin).padStart(2, '0')}:{String(etaSec).padStart(2, '0')}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══ ARRIVED OVERLAY ═══ */}
      <AnimatePresence>
        {phase === 'arrived' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-[40] flex items-center justify-center bg-black/40 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.8, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              transition={{ type: 'spring', damping: 20 }}
              className="text-center space-y-4"
            >
              <div className="text-7xl">✅</div>
              <h2 className="text-4xl font-bold text-white">Ambulance Arrived</h2>
              <p className="text-amber-400 text-sm">Help is here. Stay calm.</p>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={resetAll}
                className="mt-4 px-8 py-3 rounded-full bg-gradient-to-r from-yellow-500 to-amber-500 text-white font-semibold text-sm shadow-lg"
              >
                Done
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══ SOS BUTTON (idle / locating) ═══ */}
      <AnimatePresence>
        {phase === 'idle' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.7 }}
            className="absolute inset-0 z-[30] flex items-center justify-center bg-slate-900/70 backdrop-blur-sm"
          >
            {/* Back button */}
            <div className="absolute top-5 left-5">
              <BackButton onClick={() => navigate(-1)} />
            </div>

            <div className="text-center space-y-6">
              <h1 className="text-4xl sm:text-5xl font-bold luxury-text">Emergency Ambulance</h1>
              <p className="text-slate-400 text-sm max-w-sm mx-auto">
                Tap SOS to detect your location and request the nearest ambulance immediately.
              </p>
              <motion.button
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.93 }}
                onClick={detectLocation}
                className="relative w-36 h-36 mx-auto rounded-full bg-gradient-to-br from-yellow-400 via-amber-500 to-yellow-600 text-white font-bold shadow-lg sos-pulse flex flex-col items-center justify-center gap-1"
              >
                <span className="text-4xl">🚨</span>
                <span className="text-sm tracking-[0.25em] uppercase">SOS</span>
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══ LOCATING OVERLAY ═══ */}
      <AnimatePresence>
        {phase === 'locating' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-[30] flex items-center justify-center bg-slate-900/70 backdrop-blur-sm"
          >
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto border-4 border-amber-400 border-t-transparent rounded-full animate-spin" style={{ animationDuration: '0.8s' }} />
              <p className="text-amber-400 font-medium">Detecting your location\u2026</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══ BOTTOM PANEL ═══ */}
      <div
        className={`absolute bottom-0 left-0 right-0 z-[20] transition-all duration-500 ease-out ${
          phase === 'idle' || phase === 'locating' || phase === 'arrived' ? 'translate-y-full' : ''
        }`}
      >
        {/* Panel drag handle with swipe */}
        <div
          className="flex justify-center py-3 cursor-pointer"
          onClick={() => setPanelOpen((v) => !v)}
          onTouchStart={(e) => { touchStartY.current = e.touches[0].clientY; }}
          onTouchEnd={(e) => {
            const diff = touchStartY.current - e.changedTouches[0].clientY;
            if (diff > 40) setPanelOpen(true);
            if (diff < -40) setPanelOpen(false);
          }}
        >
          <div className="w-10 h-1.5 rounded-full bg-white/30" />
        </div>

        <div
          className="bg-slate-900/95 backdrop-blur-xl border-t border-white/10 rounded-t-3xl overflow-y-auto transition-all duration-500"
          style={{ maxHeight: panelOpen ? '65vh' : phase === 'tracking' ? '220px' : '340px' }}
        >
          <div className="px-5 pb-6 pt-2 space-y-5">

            {/* ── AMBULANCE TYPE SELECTION ── */}
            <AnimatePresence>
              {phase === 'ready' && (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  className="space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-white font-semibold text-sm">Select Ambulance</h3>
                    {userLoc && (
                      <span className="text-[11px] text-green-400 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" /> Location active
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-2.5">
                    {Object.entries(TYPE_META).map(([key, meta]) => (
                      <motion.button
                        key={key}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setSelectedType(key)}
                        className={`relative rounded-xl p-3 text-center border transition-all duration-300 ${
                          selectedType === key
                            ? 'bg-amber-500/15 border-amber-400/50 shadow-[0_0_20px_rgba(251,191,36,0.15)]'
                            : 'bg-white/5 border-white/10 hover:border-amber-400/20'
                        }`}
                      >
                        <span className="text-2xl block mb-1">{meta.icon}</span>
                        <span className="text-white text-[11px] font-medium block">{meta.name}</span>
                        {selectedType === key && (
                          <motion.div
                            layoutId="type-dot"
                            className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-400 flex items-center justify-center text-[8px] text-white font-bold"
                          >✓</motion.div>
                        )}
                      </motion.button>
                    ))}
                  </div>

                  <motion.button
                    whileHover={{ y: -1 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={requestAmbulance}
                    className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-yellow-500 to-amber-500 text-white font-bold text-sm shadow-lg hover:shadow-xl transition-shadow duration-300 active:scale-[0.98]"
                  >
                    🚑 Request Ambulance Now
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* ── REQUESTING SPINNER ── */}
            <AnimatePresence>
              {phase === 'requesting' && (
                <motion.div
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="text-center py-8 space-y-3"
                >
                  <div className="w-14 h-14 mx-auto border-4 border-amber-400 border-t-transparent rounded-full animate-spin" style={{ animationDuration: '0.7s' }} />
                  <div className="text-amber-400 font-medium text-sm">Finding nearest ambulance\u2026</div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* ── TRACKING PANEL ── */}
            <AnimatePresence>
              {(phase === 'tracking') && driver && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="space-y-4"
                >
                  {/* Driver Card */}
                  <div className="flex items-center gap-4">
                    <img
                      src={driver.photo}
                      alt={driver.driverName}
                      className="w-14 h-14 rounded-2xl border-2 border-amber-400/30 object-cover shadow-[0_0_16px_rgba(251,191,36,0.12)]"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="text-white font-semibold truncate">{driver.driverName}</h4>
                        <span className="text-amber-400 text-xs font-medium flex items-center gap-1">
                          \u2B50 {driver.rating}
                        </span>
                      </div>
                      <div className="text-slate-500 text-xs mt-0.5">{driver.vehicleNumber} • {driver.badge}</div>
                      <div className="text-slate-600 text-[11px]">{driver.hospital?.name}</div>
                    </div>
                  </div>

                  {/* ETA + type */}
                  <div className="flex items-center gap-3">
                    <div className="flex-1 rounded-xl bg-white/5 border border-white/8 px-4 py-3 text-center">
                      <div className="text-[10px] text-amber-400/70 uppercase tracking-wider mb-0.5">ETA</div>
                      <div className="text-white font-bold font-mono text-xl">
                        {String(etaMin).padStart(2, '0')}
                        <span className="text-amber-400 animate-pulse">:</span>
                        {String(etaSec).padStart(2, '0')}
                      </div>
                    </div>
                    <div className="flex-1 rounded-xl bg-white/5 border border-white/8 px-4 py-3 text-center">
                      <div className="text-[10px] text-amber-400/70 uppercase tracking-wider mb-0.5">Type</div>
                      <div className="text-white text-sm font-medium">{TYPE_META[driver.type]?.name || 'ALS'}</div>
                    </div>
                  </div>

                  {/* Timeline */}
                  <div className="flex items-center justify-between gap-1">
                    {TIMELINE_STEPS.map((step, i) => (
                      <div key={step.key} className="flex-1 flex flex-col items-center gap-1.5">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs transition-all duration-500 ${
                          i <= timelineIdx
                            ? 'bg-gradient-to-br from-yellow-400 to-amber-500 shadow-[0_0_12px_rgba(251,191,36,0.4)]'
                            : 'bg-white/5 border border-white/10'
                        }`}>
                          {step.icon}
                        </div>
                        <span className={`text-[9px] transition-colors ${
                          i <= timelineIdx ? 'text-amber-400 font-medium' : 'text-slate-600'
                        }`}>{step.label}</span>
                      </div>
                    ))}
                  </div>

                  {/* Action buttons */}
                  <div className="flex gap-2.5">
                    <a
                      href={`tel:${driver.phone?.replace(/\s/g, '')}`}
                      className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-yellow-500 to-amber-500 text-white text-center text-xs font-semibold shadow-[0_0_20px_rgba(251,191,36,0.2)]"
                    >
                      📞 Call Driver
                    </a>
                    <button
                      onClick={cancelSession}
                      className="flex-1 py-2.5 rounded-xl border border-red-500/30 text-red-400 text-xs font-semibold hover:bg-red-500/10 transition-colors"
                    >
                      ✕ Cancel
                    </button>
                  </div>

                  {/* Expand hint */}
                  {!panelOpen && (
                    <button
                      onClick={() => setPanelOpen(true)}
                      className="w-full text-center text-slate-500 text-[11px] hover:text-amber-400 transition-colors pt-1"
                    >
                      Swipe up for details ↑
                    </button>
                  )}

                  {/* Expanded Section */}
                  <AnimatePresence>
                    {panelOpen && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-4 overflow-hidden"
                      >
                        {/* Nearby Hospitals */}
                        <div>
                          <h4 className="text-white/70 text-xs font-medium mb-2 uppercase tracking-wider">Nearby Hospitals</h4>
                          <div className="space-y-2">
                            {hospitals.slice(0, 4).map((h, i) => (
                              <div key={i} className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-white/5 border border-white/5">
                                <div className="flex items-center gap-2.5">
                                  <span className="text-sm">🏥</span>
                                  <div>
                                    <div className="text-white text-xs font-medium">{h.name}</div>
                                  </div>
                                </div>
                                <span className="text-amber-400 text-[11px] font-medium">{h.distance}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Share Location */}
                        <button
                          onClick={() => {
                            if (!navigator.geolocation) {
                              toast.error('Geolocation not supported');
                              return;
                            }
                            toast.loading('Getting location...', { id: 'share-loc' });
                            navigator.geolocation.getCurrentPosition(
                              (pos) => {
                                const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
                                setUserLoc(loc);
                                toast.success('Location updated & shared!', { id: 'share-loc' });
                                if (navigator.share) {
                                  navigator.share({
                                    title: 'My Live Location',
                                    text: `Emergency! My location: ${loc.lat.toFixed(6)}, ${loc.lng.toFixed(6)}`,
                                    url: `https://www.google.com/maps?q=${loc.lat},${loc.lng}`,
                                  }).catch(() => {});
                                } else {
                                  navigator.clipboard?.writeText(
                                    `https://www.google.com/maps?q=${loc.lat},${loc.lng}`
                                  );
                                  toast.success('Location link copied!', { id: 'share-loc' });
                                }
                              },
                              () => toast.error('Location access denied', { id: 'share-loc' }),
                              { enableHighAccuracy: true, timeout: 8000 },
                            );
                          }}
                          className="w-full py-2.5 rounded-xl border border-white/10 text-slate-400 text-xs hover:border-amber-400/25 hover:text-amber-400 transition-all active:scale-[0.98]"
                        >
                          📍 Share Live Location
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}
            </AnimatePresence>

          </div>
        </div>
      </div>
    </div>
  );
}