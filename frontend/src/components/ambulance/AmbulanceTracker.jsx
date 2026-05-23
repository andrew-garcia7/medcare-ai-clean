import { useEffect, useRef, memo } from 'react';
import 'leaflet/dist/leaflet.css';

const TILE_URL = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
const TILE_ATTR = '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>';

/* ── Custom icons via divIcon ─────────────────────── */
function makeUserIcon(L) {
  return L.divIcon({
    className: '',
    html: `<div class="amb-user-marker">
      <div class="amb-user-dot"></div>
      <div class="amb-user-pulse"></div>
      <div class="amb-user-pulse amb-user-pulse-2"></div>
    </div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });
}

function makeAmbulanceIcon(L) {
  return L.divIcon({
    className: '',
    html: `<div class="amb-vehicle-icon">🚑</div>`,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
  });
}

function makeNearbyAmbIcon(L) {
  return L.divIcon({
    className: '',
    html: `<div class="amb-nearby-icon">🚑</div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });
}

function makeHospitalIcon(L) {
  return L.divIcon({
    className: '',
    html: `<div class="amb-hospital-icon">🏥</div>`,
    iconSize: [26, 26],
    iconAnchor: [13, 13],
  });
}

const AmbulanceMap = memo(function AmbulanceMap({
  userLoc,
  ambulanceLoc,
  nearbyAmbulances,
  hospitals,
  routePoints,
  status,
}) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const userMarkerRef = useRef(null);
  const ambMarkerRef = useRef(null);
  const nearbyMarkersRef = useRef([]);
  const hospitalMarkersRef = useRef([]);
  const routeLineRef = useRef(null);
  const LRef = useRef(null);

  /* ── INIT MAP ──────────────────────────── */
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    let cancelled = false;

    import('leaflet').then((L) => {
      if (cancelled) return;
      LRef.current = L;

      const map = L.map(containerRef.current, {
        zoomControl: false,
        attributionControl: false,
      }).setView([19.076, 72.8777], 14);

      L.tileLayer(TILE_URL, { maxZoom: 19, attribution: TILE_ATTR }).addTo(map);
      L.control.zoom({ position: 'bottomright' }).addTo(map);

      mapRef.current = map;
    });

    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  /* ── USER MARKER ───────────────────────── */
  useEffect(() => {
    const L = LRef.current;
    const map = mapRef.current;
    if (!L || !map || !userLoc) return;

    if (userMarkerRef.current) map.removeLayer(userMarkerRef.current);

    userMarkerRef.current = L.marker([userLoc.lat, userLoc.lng], {
      icon: makeUserIcon(L),
      zIndexOffset: 900,
    }).addTo(map);

    map.setView([userLoc.lat, userLoc.lng], 15, { animate: true });
  }, [userLoc]);

  /* ── AMBULANCE MARKER (smooth movement) ── */
  const animFrameRef = useRef(null);
  const prevLoc = useRef(null);

  useEffect(() => {
    const L = LRef.current;
    const map = mapRef.current;
    if (!L || !map || !ambulanceLoc) return;

    if (!ambMarkerRef.current) {
      ambMarkerRef.current = L.marker([ambulanceLoc.lat, ambulanceLoc.lng], {
        icon: makeAmbulanceIcon(L),
        zIndexOffset: 1000,
      }).addTo(map);
      prevLoc.current = { lat: ambulanceLoc.lat, lng: ambulanceLoc.lng };
      return;
    }

    // Smooth interpolation via requestAnimationFrame
    const startLat = prevLoc.current.lat;
    const startLng = prevLoc.current.lng;
    const endLat = ambulanceLoc.lat;
    const endLng = ambulanceLoc.lng;
    const duration = 800; // ms
    const start = performance.now();

    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);

    const animate = (now) => {
      const elapsed = now - start;
      const t = Math.min(elapsed / duration, 1);
      const ease = t * (2 - t); // easeOutQuad

      const lat = startLat + (endLat - startLat) * ease;
      const lng = startLng + (endLng - startLng) * ease;

      ambMarkerRef.current.setLatLng([lat, lng]);

      if (t < 1) {
        animFrameRef.current = requestAnimationFrame(animate);
      } else {
        prevLoc.current = { lat: endLat, lng: endLng };
      }
    };

    animFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [ambulanceLoc]);

  /* ── NEARBY AMBULANCE MARKERS ──────────── */
  useEffect(() => {
    const L = LRef.current;
    const map = mapRef.current;
    if (!L || !map) return;

    nearbyMarkersRef.current.forEach((m) => map.removeLayer(m));
    nearbyMarkersRef.current = [];

    if (!nearbyAmbulances?.length) return;

    nearbyAmbulances.forEach((amb) => {
      const [lng, lat] = amb.location.coordinates;
      const marker = L.marker([lat, lng], {
        icon: makeNearbyAmbIcon(L),
        zIndexOffset: 500,
      })
        .addTo(map)
        .bindPopup(
          `<div style="text-align:center;font-size:12px;">
            <b style="color:#d97706;">${amb.driverName}</b><br/>
            <span style="color:#888;">${amb.vehicleNumber}</span>
          </div>`
        );
      nearbyMarkersRef.current.push(marker);
    });
  }, [nearbyAmbulances]);

  /* ── HOSPITAL MARKERS ──────────────────── */
  useEffect(() => {
    const L = LRef.current;
    const map = mapRef.current;
    if (!L || !map || !hospitals?.length) return;

    hospitalMarkersRef.current.forEach((m) => map.removeLayer(m));
    hospitalMarkersRef.current = [];

    hospitals.forEach((h) => {
      const marker = L.marker([h.lat, h.lng], { icon: makeHospitalIcon(L) })
        .addTo(map)
        .bindPopup(
          `<div style="text-align:center;font-size:12px;">
            <b style="color:#d97706;">${h.name}</b><br/>
            <span style="color:#888;">${h.distance}</span>
          </div>`
        );
      hospitalMarkersRef.current.push(marker);
    });
  }, [hospitals]);

  /* ── ROUTE LINE ────────────────────────── */
  useEffect(() => {
    const L = LRef.current;
    const map = mapRef.current;
    if (!L || !map) return;

    if (routeLineRef.current) {
      map.removeLayer(routeLineRef.current);
      routeLineRef.current = null;
    }

    if (!routePoints?.length) return;

    routeLineRef.current = L.polyline(routePoints, {
      color: '#fbbf24',
      weight: 3,
      opacity: 0.7,
      dashArray: '8, 12',
      lineCap: 'round',
    }).addTo(map);
  }, [routePoints]);

  /* ── REMOVE NEARBY MARKERS WHEN DISPATCHED ── */
  useEffect(() => {
    if (status === 'dispatched' || status === 'en-route' || status === 'arrived') {
      const map = mapRef.current;
      if (!map) return;
      nearbyMarkersRef.current.forEach((m) => map.removeLayer(m));
      nearbyMarkersRef.current = [];
    }
  }, [status]);

  /* ── CLEANUP ───────────────────────────── */
  useEffect(() => () => {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
  }, []);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0"
      style={{ zIndex: 1 }}
    />
  );
});

export default AmbulanceMap;