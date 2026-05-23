import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import {
  useRequestAmbulance,
  useTrackAmbulance,
  useNearestHospitals,
} from '../../hooks/useApi';

import { GlassCard, Button } from './ui/ui';
import toast from 'react-hot-toast';

export default function AmbulanceTracker() {
  const [userLoc, setUserLoc] = useState(null);
  const [locLoading, setLocLoading] = useState(false);
  const [trackingRef, setTrackingRef] = useState(null);
  const [dispatched, setDispatched] = useState(false);
  const [etaSecs, setEtaSecs] = useState(0);

  const mapRef = useRef(null);
  const leafletMapRef = useRef(null);
  const userMarkerRef = useRef(null);
  const ambMarkerRef = useRef(null);
  const routeRef = useRef(null);

  const { mutateAsync: requestAmbulance, isPending: requesting } =
    useRequestAmbulance();

  const { data: trackingData } = useTrackAmbulance(
    trackingRef || '',
    !!trackingRef
  );

  const { data: nearestHospitals } = useNearestHospitals(
    userLoc?.lat,
    userLoc?.lng
  );

  // 🔥 INIT MAP
  useEffect(() => {
    if (!mapRef.current || leafletMapRef.current) return;

    import('leaflet').then((L) => {
      const map = L.map(mapRef.current).setView([40.7128, -74.006], 13);

      L.tileLayer(
        'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
      ).addTo(map);

      leafletMapRef.current = map;
    });

    return () => {
      leafletMapRef.current?.remove();
      leafletMapRef.current = null;
    };
  }, []);

  // 🔥 USER LOCATION MARKER
  useEffect(() => {
    if (!leafletMapRef.current || !userLoc) return;

    import('leaflet').then((L) => {
      if (userMarkerRef.current) {
        leafletMapRef.current.removeLayer(userMarkerRef.current);
      }

      userMarkerRef.current = L.marker([userLoc.lat, userLoc.lng]).addTo(
        leafletMapRef.current
      );

      leafletMapRef.current.setView([userLoc.lat, userLoc.lng], 15);
    });
  }, [userLoc]);

  // 🔥 AMBULANCE TRACKING
  useEffect(() => {
    if (!leafletMapRef.current || !trackingData?.ambulance || !userLoc)
      return;

    import('leaflet').then((L) => {
      const { lat, lng } = trackingData.ambulance.currentLocation;

      if (ambMarkerRef.current) {
        leafletMapRef.current.removeLayer(ambMarkerRef.current);
      }

      ambMarkerRef.current = L.marker([lat, lng]).addTo(
        leafletMapRef.current
      );

      if (routeRef.current) {
        leafletMapRef.current.removeLayer(routeRef.current);
      }

      routeRef.current = L.polyline(
        [
          [lat, lng],
          [userLoc.lat, userLoc.lng],
        ],
        { color: '#00d4b4' }
      ).addTo(leafletMapRef.current);
    });
  }, [trackingData, userLoc]);

  // 🔥 ETA TIMER
  useEffect(() => {
    if (!dispatched || etaSecs <= 0) return;

    const iv = setInterval(() => {
      setEtaSecs((s) => Math.max(0, s - 1));
    }, 1000);

    return () => clearInterval(iv);
  }, [dispatched, etaSecs]);

  // 🔥 SHARE LOCATION
  const shareLocation = () => {
    setLocLoading(true);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLoc({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          address: 'Your location',
        });
        setLocLoading(false);
        toast.success('Location captured!');
      },
      () => {
        setLocLoading(false);
        toast.error('Location denied');
      }
    );
  };

  // 🔥 DISPATCH
  const dispatch = async () => {
    if (!userLoc) return;

    const result = await requestAmbulance({
      coordinates: [userLoc.lng, userLoc.lat],
      address: userLoc.address,
    });

    setTrackingRef(result.referenceId);
    setDispatched(true);
    setEtaSecs(result.eta * 60);
  };

  const etaMin = Math.floor(etaSecs / 60);
  const etaSec = etaSecs % 60;

  return (
    <div className="max-w-[1200px] mx-auto px-6 py-10">

      {/* 🔥 MAP */}
      <div
        ref={mapRef}
        className="h-[400px] rounded-xl border border-white/10 mb-6"
      />

      {/* 🔥 CONTROLS */}
      <GlassCard className="p-5">

        <Button
          onClick={shareLocation}
          loading={locLoading}
          className="w-full mb-3"
        >
          Share Location
        </Button>

        <Button
          onClick={dispatch}
          loading={requesting}
          disabled={!userLoc || dispatched}
          variant="danger"
          className="w-full"
        >
          {dispatched ? 'Ambulance Dispatched' : 'Call Ambulance'}
        </Button>

      </GlassCard>

      {/* 🔥 ETA */}
      <AnimatePresence>
        {dispatched && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-4 text-center text-red-400 text-xl"
          >
            ETA: {etaSecs > 0 ? `${etaMin}m ${etaSec}s` : 'Arrived'}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}