import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useMemo } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import api from '../services/api';
import { useNotificationStore } from '../store/notificationStore';

/* ───────────────── SVG ICON COMPONENTS ───────────────── */

const VisaIcon = () => (
  <svg viewBox="0 0 48 32" className="w-10 h-7">
    <rect width="48" height="32" rx="4" fill="#1A1F71"/>
    <path d="M19.5 21h-2.7l1.7-10.5h2.7L19.5 21zm11.1-10.2c-.5-.2-1.4-.4-2.4-.4-2.7 0-4.5 1.4-4.5 3.4 0 1.5 1.4 2.3 2.4 2.8 1 .5 1.4.8 1.4 1.3 0 .7-.8 1-1.6 1-1.1 0-1.6-.2-2.5-.5l-.3-.2-.4 2.2c.6.3 1.8.5 3 .5 2.8 0 4.7-1.4 4.7-3.5 0-1.2-.7-2.1-2.3-2.8-.9-.5-1.5-.8-1.5-1.3 0-.4.5-.9 1.5-.9.9 0 1.5.2 2 .4l.2.1.3-2.1zM35.8 21h2.3l-2-10.5h-2.1c-.5 0-.9.3-1.1.7L29 21h2.8l.6-1.6h3.4l.3 1.6h-.3zm-2.9-3.8l1.4-3.9.8 3.9h-2.2zM15.3 10.5l-2.6 7.2-.3-1.4c-.5-1.7-2-3.5-3.7-4.4l2.4 9.1h2.8l4.2-10.5h-2.8z" fill="#fff"/>
    <path d="M10.3 10.5H6.1l0 .2c3.3.8 5.6 2.9 6.5 5.4l-.9-4.7c-.2-.7-.6-.9-1.1-.9h-.3z" fill="#F7B600"/>
  </svg>
);

const MastercardIcon = () => (
  <svg viewBox="0 0 48 32" className="w-10 h-7">
    <rect width="48" height="32" rx="4" fill="#252525"/>
    <circle cx="19" cy="16" r="8.5" fill="#EB001B"/>
    <circle cx="29" cy="16" r="8.5" fill="#F79E1B"/>
    <path d="M24 9.2a8.48 8.48 0 013 6.8 8.48 8.48 0 01-3 6.8 8.48 8.48 0 01-3-6.8 8.48 8.48 0 013-6.8z" fill="#FF5F00"/>
  </svg>
);

const RupayIcon = () => (
  <svg viewBox="0 0 48 32" className="w-10 h-7">
    <rect width="48" height="32" rx="4" fill="#0D2C6B"/>
    <path d="M8 12h4.5c1.8 0 3 .8 3 2.3 0 1.2-.8 2-1.8 2.2l2.2 3.5h-2.5l-1.8-3.2h-1.4V20H8V12zm2.2 3.3h1.8c.8 0 1.2-.4 1.2-1 0-.6-.4-1-1.2-1h-1.8v2zm10.8-3.3V20h-2.2v-4.5L16 12h2.5l1.8 3 1.8-3h2.5l-2.8 3.5H21z" fill="#fff"/>
    <path d="M27 12h6.5v1.8H29.2v1.5h3.8v1.7h-3.8v1.2h4.3V20H27V12z" fill="#F7931E"/>
    <rect x="35" y="12" width="5" height="8" rx="1" fill="#3CAF50" opacity="0.9"/>
    <rect x="36" y="12" width="5" height="8" rx="1" fill="#F15B2D" opacity="0.8"/>
  </svg>
);

const AmexIcon = () => (
  <svg viewBox="0 0 48 32" className="w-10 h-7">
    <rect width="48" height="32" rx="4" fill="#006FCF"/>
    <path d="M6 13h3l.5 1.2.5-1.2h3v5.5l-2.5-5.5h-2l-2.7 6h1.6l.5-1.2h2.5l.5 1.2h3v-6h-1.8l-2.1 4.5-2-4.5H6V13zm2.7 2.5l.8-1.8.8 1.8h-1.6zM17.5 13v6h2V16l1.5 3h1.5l1.5-3v3h2v-6h-2.5l-1.5 3-1.5-3h-3zm10 0v6h5v-1.3h-3v-1h3v-1.2h-3v-1.2h3V13h-5zm6 0v6h5v-1.3h-3v-1h3v-1.2h-3v-1.2h3V13h-5z" fill="#fff"/>
  </svg>
);

/* ─── PAYMENT APP ICONS (Realistic) ─── */

/* ─── UPI APP LOGOS (official brand SVGs from /public/logos/) ─── */

/* ─── BANK LOGO COMPONENTS (Realistic SVGs) ─── */

const SBILogo = () => (
  <svg viewBox="0 0 40 40" className="w-10 h-10">
    <circle cx="20" cy="20" r="18" fill="#22409A"/>
    <circle cx="20" cy="14" r="5" fill="none" stroke="#fff" strokeWidth="2"/>
    <path d="M20 19v8" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"/>
    <circle cx="20" cy="14" r="2" fill="#fff"/>
    <text x="20" y="36" textAnchor="middle" fill="#22409A" fontSize="5" fontWeight="bold" fontFamily="Arial">SBI</text>
  </svg>
);

const HDFCLogo = () => (
  <svg viewBox="0 0 40 40" className="w-10 h-10">
    <rect x="1" y="1" width="38" height="38" rx="8" fill="#004B87"/>
    <rect x="4" y="4" width="32" height="15" rx="2" fill="#ED1C24"/>
    <text x="20" y="15" textAnchor="middle" fill="#fff" fontSize="8" fontWeight="900" fontFamily="Arial">HDFC</text>
    <text x="20" y="29" textAnchor="middle" fill="#fff" fontSize="6" fontWeight="600" fontFamily="Arial">BANK</text>
  </svg>
);

const ICICILogo = () => (
  <svg viewBox="0 0 40 40" className="w-10 h-10">
    <rect x="1" y="1" width="38" height="38" rx="8" fill="#fff"/>
    <rect x="4" y="6" width="32" height="11" rx="2" fill="#F37021"/>
    <text x="20" y="14" textAnchor="middle" fill="#fff" fontSize="7" fontWeight="900" fontFamily="Arial">ICICI</text>
    <rect x="4" y="20" width="32" height="3" rx="1" fill="#B02A30"/>
    <text x="20" y="32" textAnchor="middle" fill="#B02A30" fontSize="6" fontWeight="700" fontFamily="Arial">BANK</text>
  </svg>
);

const AxisLogo = () => (
  <svg viewBox="0 0 40 40" className="w-10 h-10">
    <rect x="1" y="1" width="38" height="38" rx="8" fill="#97144D"/>
    <text x="20" y="18" textAnchor="middle" fill="#fff" fontSize="10" fontWeight="900" fontFamily="Arial">A</text>
    <text x="20" y="30" textAnchor="middle" fill="#fff" fontSize="5.5" fontWeight="700" fontFamily="Arial" letterSpacing="1">AXIS</text>
    <rect x="8" y="32" width="24" height="1.5" rx="0.5" fill="#fff" opacity="0.5"/>
  </svg>
);

const PNBLogo = () => (
  <svg viewBox="0 0 40 40" className="w-10 h-10">
    <rect x="1" y="1" width="38" height="38" rx="8" fill="#FFD700"/>
    <circle cx="20" cy="16" r="8" fill="#D4232A"/>
    <text x="20" y="19" textAnchor="middle" fill="#fff" fontSize="7" fontWeight="900" fontFamily="Arial">PNB</text>
    <text x="20" y="33" textAnchor="middle" fill="#D4232A" fontSize="4" fontWeight="700" fontFamily="Arial">Punjab National</text>
  </svg>
);

const KotakLogo = () => (
  <svg viewBox="0 0 40 40" className="w-10 h-10">
    <rect x="1" y="1" width="38" height="38" rx="8" fill="#fff"/>
    <path d="M10 20c0-5.5 4.5-10 10-10s10 4.5 10 10" stroke="#ED1C24" strokeWidth="3" fill="none"/>
    <path d="M10 20c0 5.5 4.5 10 10 10s10-4.5 10-10" stroke="#003DA5" strokeWidth="3" fill="none"/>
    <text x="20" y="33" textAnchor="middle" fill="#003DA5" fontSize="5" fontWeight="800" fontFamily="Arial">KOTAK</text>
  </svg>
);

/* ───────────────── CARD TYPE DETECTION ───────────────── */
function detectCardType(number) {
  const n = number.replace(/\s/g, '');
  if (n.startsWith('4')) return 'visa';
  if (/^5[1-5]/.test(n) || /^2[2-7]/.test(n)) return 'mastercard';
  if (/^3[47]/.test(n)) return 'amex';
  if (/^6[0-9]/.test(n) || /^81/.test(n) || /^82/.test(n)) return 'rupay';
  return null;
}

/* ───────────────── VALIDATION HELPERS ───────────────── */
function luhnCheck(num) {
  const digits = num.replace(/\s/g, '').split('').reverse().map(Number);
  let sum = 0;
  for (let i = 0; i < digits.length; i++) {
    let d = digits[i];
    if (i % 2 === 1) { d *= 2; if (d > 9) d -= 9; }
    sum += d;
  }
  return sum % 10 === 0;
}

function isExpiryValid(exp) {
  if (!/^\d{2}\/\d{2}$/.test(exp)) return false;
  const [mm, yy] = exp.split('/').map(Number);
  if (mm < 1 || mm > 12) return false;
  const now = new Date();
  return new Date(2000 + yy, mm) > now;
}

function isValidUpiId(id) {
  return /^[\w.\-]+@[\w]+$/.test(id);
}

/* ───────────────── PROCESSING STEP CONFIG ───────────────── */
const processingSteps = [
  { text: 'Initiating payment...', icon: 'lock' },
  { text: 'Connecting to bank...', icon: 'bank' },
  { text: 'Processing transaction...', icon: 'process' },
  { text: 'Verifying payment...', icon: 'verify' },
];

/* ───────────────── MAIN COMPONENT ───────────────── */
export default function PaymentPage() {
  const { appointmentId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { addNotification } = useNotificationStore();
  const locationState = location.state || {};
  const {
    doctor,
    date,
    time,
    fee,
    patientName,
    patientPhone,
    patientEmail,
    visitReason,
    patientNotes
  } = locationState;

  const [method, setMethod] = useState('card');
  const [processing, setProcessing] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardName, setCardName] = useState('');
  const [selectedBank, setSelectedBank] = useState('');
  const [selectedUpiApp, setSelectedUpiApp] = useState('');
  const [upiId, setUpiId] = useState('');
  const [saveCard, setSaveCard] = useState(false);
  const [savedCard, setSavedCard] = useState(() => {
    try { return JSON.parse(localStorage.getItem('medcare_saved_card')); } catch { return null; }
  });
  const [usingSavedCard, setUsingSavedCard] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [payStep, setPayStep] = useState(0);
  const [showProcessingOverlay, setShowProcessingOverlay] = useState(false);
  const [processingPhase, setProcessingPhase] = useState(0);
  const [payError, setPayError] = useState('');
  const [cvvFocused, setCvvFocused] = useState(false);

  const doctorName = doctor ? `Dr. ${doctor?.user?.firstName} ${doctor?.user?.lastName}` : 'Doctor';
  const consultFee = Number(fee || doctor?.consultationFee || 500) || 500;
  const cardType = useMemo(() => detectCardType(cardNumber), [cardNumber]);

  const isFormValid = useMemo(() => {
    if (method === 'card') {
      const raw = cardNumber.replace(/\s/g, '');
      const cvvLen = cardType === 'amex' ? 4 : 3;
      return raw.length === 16 && isExpiryValid(expiry) && cvv.length === cvvLen;
    }
    if (method === 'upi') return selectedUpiApp !== '' || isValidUpiId(upiId);
    if (method === 'netbanking') return selectedBank !== '';
    return false;
  }, [method, cardNumber, expiry, cvv, selectedUpiApp, upiId, selectedBank]);

  // Per-field validation errors (only shown after user has started typing)
  const cardErrors = useMemo(() => {
    const raw = cardNumber.replace(/\s/g, '');
    const errors = {};
    if (raw.length > 0 && raw.length < 16) errors.cardNumber = 'Card number must be 16 digits';
    if (expiry.length === 5 && !isExpiryValid(expiry)) {
      const [mm] = expiry.split('/').map(Number);
      if (mm < 1 || mm > 12) errors.expiry = 'Invalid month (01–12)';
      else errors.expiry = 'Card is expired';
    }
    if (cvv.length > 0 && cvv.length < (cardType === 'amex' ? 4 : 3)) errors.cvv = `CVV must be ${cardType === 'amex' ? 4 : 3} digits`;
    return errors;
  }, [cardNumber, expiry, cvv]);

  const formatCard = (v) => v.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim().slice(0, 19);
  const formatExpiry = (v) => {
    const d = v.replace(/\D/g, '').slice(0, 4);
    return d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d;
  };

  const maskedCard = cardNumber ? `\u2022\u2022\u2022\u2022 ${cardNumber.replace(/\s/g, '').slice(-4)}` : '';

  const upiApps = [
    { key: 'gpay', name: 'Google Pay', logo: 'https://upload.wikimedia.org/wikipedia/commons/f/f2/Google_Pay_Logo.svg' },
    { key: 'phonepe', name: 'PhonePe', logo: 'https://upload.wikimedia.org/wikipedia/commons/7/71/PhonePe_Logo.svg' },
    { key: 'paytm', name: 'Paytm', logo: 'https://upload.wikimedia.org/wikipedia/commons/2/24/Paytm_Logo_%28standalone%29.svg' },
    { key: 'bhim', name: 'BHIM', logo: 'https://upload.wikimedia.org/wikipedia/commons/e/e1/UPI-Logo-vector.svg' },
  ];

  const banks = [
    { key: 'sbi', name: 'SBI', Logo: SBILogo },
    { key: 'hdfc', name: 'HDFC Bank', Logo: HDFCLogo },
    { key: 'icici', name: 'ICICI Bank', Logo: ICICILogo },
    { key: 'pnb', name: 'PNB', Logo: PNBLogo },
    { key: 'axis', name: 'Axis Bank', Logo: AxisLogo },
    { key: 'kotak', name: 'Kotak', Logo: KotakLogo },
  ];

  // Determine payment method label
  const getMethodLabel = () => {
    if (method === 'card') return cardType === 'visa' ? 'Visa Card' : cardType === 'mastercard' ? 'Mastercard' : cardType === 'amex' ? 'American Express' : cardType === 'rupay' ? 'RuPay Card' : 'Card';
    if (method === 'upi') return selectedUpiApp ? upiApps.find(a => a.key === selectedUpiApp)?.name || 'UPI' : upiId || 'UPI';
    if (method === 'netbanking') return selectedBank ? banks.find(b => b.key === selectedBank)?.name || 'Net Banking' : 'Net Banking';
    return 'Card';
  };

  const handlePay = async () => {
    if (!isFormValid || processing) return;

    setPayError('');
    setShowProcessingOverlay(true);
    setProcessingPhase(0);
    setPayStep(1);
    setProcessing(true);

    const delay = (ms) => new Promise(r => setTimeout(r, ms));

    try {
      await delay(500);
      setProcessingPhase(1); // Connecting to bank

      // Step 1: Create Razorpay order via backend
      const orderPayload = { amount: consultFee, method };
      const [orderRes] = await Promise.all([
        api.post('/payments/razorpay/create-order', orderPayload),
        delay(800),
      ]);

      if (!orderRes.data?.success) {
        throw new Error(orderRes.data?.error || 'Failed to create payment order');
      }

      const { order, key, gateway } = orderRes.data;

      // ── Razorpay LIVE checkout ──
      if (gateway === 'razorpay' && window.Razorpay) {
        setProcessingPhase(2); // Processing transaction
        setShowProcessingOverlay(false); // Hide overlay while Razorpay popup is open

        const paymentId = await new Promise((resolve, reject) => {
          const options = {
            key,
            amount: order.amount,
            currency: order.currency,
            name: 'MedCare',
            description: `Doctor Appointment — ${doctorName}`,
            order_id: order.id,
            handler: async function (response) {
              try {
                // Verify payment on backend
                const verifyRes = await api.post('/payments/razorpay/verify', {
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                });
                if (verifyRes.data?.success) {
                  resolve(verifyRes.data.paymentId);
                } else {
                  reject(new Error('Payment verification failed'));
                }
              } catch (err) {
                reject(err);
              }
            },
            prefill: {
              name: patientName || '',
              email: patientEmail || '',
              contact: patientPhone || '',
            },
            notes: { appointmentId: appointmentId || '', method },
            theme: { color: '#f59e0b' },
            modal: {
              ondismiss: function () {
                reject(new Error('Payment cancelled by user'));
              },
              confirm_close: true,
            },
          };

          const rzp = new window.Razorpay(options);
          rzp.on('payment.failed', function (response) {
            reject(new Error(response.error?.description || 'Payment failed'));
          });
          rzp.open();
        });

        // Payment verified — show coin push + success animation
        setShowProcessingOverlay(true);
        setProcessingPhase(5); // Coin push phase
        await delay(1800);
        setProcessingPhase(4); // Success!
        setPayStep(3);
        setProcessing(false);
        await delay(1200);

        // Build payment state and navigate
        const paymentState = buildPaymentState(paymentId);
        api.post('/appointments/payment/save', paymentState).catch(() => {});
        saveCardIfOptedIn();
        addNotification({ type: 'payment', title: 'Payment Successful', message: `₹${consultFee} paid for your appointment with ${doctorName}. Receipt has been generated.` });
        setShowProcessingOverlay(false);
        navigate(`/payment-success?pid=${paymentId}`, { state: paymentState, replace: true });
        return;
      }

      // ── DEMO mode fallback (Razorpay not configured) ──
      // Use existing /process-payment endpoint
      const payload = {
        method,
        amount: consultFee,
        ...(method === 'card' && { cardLast4: cardNumber.replace(/\s/g, '').slice(-4), cardType: cardType || 'card' }),
        ...(method === 'upi' && { upiId: upiId || selectedUpiApp }),
        ...(method === 'netbanking' && { bank: selectedBank }),
      };

      const [response] = await Promise.all([
        api.post('/payments/process-payment', payload),
        delay(600),
      ]);

      if (!response.data?.success) {
        throw new Error(response.data?.error || 'Payment failed');
      }

      const demoPaymentId = response.data.paymentId;

      // Coin push animation
      setProcessingPhase(5);
      await delay(1800);
      setProcessingPhase(4); // Done!
      setPayStep(3);
      setProcessing(false);
      await delay(1200);

      const paymentState = buildPaymentState(demoPaymentId);
      api.post('/appointments/payment/save', paymentState).catch(() => {});
      saveCardIfOptedIn();
      addNotification({ type: 'payment', title: 'Payment Successful', message: `₹${consultFee} paid for your appointment with ${doctorName}. Receipt has been generated.` });
      setShowProcessingOverlay(false);
      navigate(`/payment-success?pid=${demoPaymentId}`, { state: paymentState, replace: true });

    } catch (err) {
      setShowProcessingOverlay(false);
      setProcessing(false);
      setPayStep(0);
      setProcessingPhase(0);
      setPayError(
        err.response?.data?.error || err.message || 'Payment failed. Please try again.'
      );
      addNotification({ type: 'error', title: 'Payment Failed', message: err.response?.data?.error || err.message || 'Your payment could not be processed. Please try again.' });
    }
  };

  // Helper: build payment state object for navigation
  const buildPaymentState = (paymentId) => ({
    doctor,
    doctorName,
    date,
    time,
    fee: consultFee,
    patientName,
    patientPhone,
    patientEmail,
    visitReason,
    paymentId,
    method: getMethodLabel(),
    maskedCard: cardNumber ? `\u2022\u2022\u2022\u2022 ${cardNumber.replace(/\s/g, '').slice(-4)}` : '',
    appointmentId,
  });

  // Helper: save card to localStorage if user opted in
  const saveCardIfOptedIn = () => {
    if (saveCard && method === 'card' && cardNumber) {
      const raw = cardNumber.replace(/\s/g, '');
      localStorage.setItem('medcare_saved_card', JSON.stringify({
        last4: raw.slice(-4),
        cardType: cardType || 'card',
        name: cardName,
        expiry,
      }));
    }
  };

  const methodTabs = [
    { key: 'card', label: 'Card', icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <rect x="2" y="5" width="20" height="14" rx="3"/><path d="M2 10h20"/>
      </svg>
    )},
    { key: 'upi', label: 'UPI', icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path d="M12 18h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"/>
      </svg>
    )},
    { key: 'netbanking', label: 'Net Banking', icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path d="M3 21h18M3 10h18M5 6l7-3 7 3M4 10v11M20 10v11M8 14v3M12 14v3M16 14v3"/>
      </svg>
    )},
  ];

  /* ── NO BOOKING DATA → redirect ── */
  if (!doctor && !appointmentId) {
    return (
      <div className="min-h-screen bg-[#0a0e1a] flex flex-col items-center justify-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-[#0f172a] border border-white/10 flex items-center justify-center">
          <svg className="w-7 h-7 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p className="text-slate-400 text-sm">No booking data found.</p>
        <div className="flex gap-3">
          <button onClick={() => navigate('/doctors')} className="px-4 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-yellow-500 to-amber-600 text-white">Browse Doctors</button>
          <button onClick={() => navigate('/dashboard')} className="px-4 py-2 rounded-xl text-xs font-medium bg-white/[0.05] border border-white/10 text-slate-400 hover:text-white transition-all">Dashboard</button>
        </div>
      </div>
    );
  }

  /* ── QR SCANNER MODAL ── */
  const QrModal = () => (
    <AnimatePresence>
      {showQrModal && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowQrModal(false)}>
          <motion.div initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.85, opacity: 0 }} transition={{ type: 'spring', damping: 22 }} className="relative bg-[#0f172a] rounded-3xl border border-white/10 p-8 max-w-sm w-full" onClick={(e) => e.stopPropagation()}>
            {/* Close */}
            <button onClick={() => setShowQrModal(false)} className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
            </button>

            <h3 className="luxury-text font-semibold text-lg text-center mb-6">Scan to Pay</h3>

            {/* QR Container */}
            <div className="relative mx-auto w-56 h-56 rounded-2xl bg-white p-4 shadow-[0_0_60px_rgba(251,191,36,0.15)]">
              {/* Animated scan line */}
              <motion.div
                animate={{ y: [0, 192, 0] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute left-2 right-2 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent z-10 shadow-[0_0_10px_rgba(251,191,36,0.6)]"
                style={{ top: '16px' }}
              />
              {/* Corner brackets */}
              <div className="absolute top-2 left-2 w-5 h-5 border-t-2 border-l-2 border-amber-400 rounded-tl" />
              <div className="absolute top-2 right-2 w-5 h-5 border-t-2 border-r-2 border-amber-400 rounded-tr" />
              <div className="absolute bottom-2 left-2 w-5 h-5 border-b-2 border-l-2 border-amber-400 rounded-bl" />
              <div className="absolute bottom-2 right-2 w-5 h-5 border-b-2 border-r-2 border-amber-400 rounded-br" />
              <QRCodeSVG
                value={`upi://pay?pa=medcare@upi&pn=MedCare&am=${consultFee}&cu=INR`}
                size={192}
                bgColor="#ffffff"
                fgColor="#0f172a"
                level="M"
              />
            </div>

            {/* Pulsing glow */}
            <motion.div animate={{ opacity: [0.3, 0.6, 0.3] }} transition={{ duration: 2, repeat: Infinity }} className="absolute inset-0 rounded-3xl bg-gradient-to-b from-amber-400/5 to-transparent pointer-events-none" />

            <div className="text-center mt-5">
              <p className="text-slate-400 text-xs">Scan with any UPI app to pay</p>
              <p className="text-amber-400 font-bold text-lg mt-1">{'\u20B9'}{consultFee}</p>
              <p className="text-slate-600 text-[10px] mt-1 font-mono">medcare@upi</p>
            </div>

            <div className="flex justify-center gap-3 mt-4">
              {upiApps.map((app) => (
                <div key={app.key} className="w-8 h-8 rounded-lg overflow-hidden opacity-60 bg-white p-1"><img src={app.logo} alt={app.name} className="w-full h-full object-contain" /></div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  /* ── CARD PREVIEW (with flip animation) ── */
  const CardPreview = () => {
    const raw = cardNumber.replace(/\s/g, '');
    if (raw.length < 1) return null;
    const gradients = {
      visa: 'from-blue-900 via-blue-800 to-indigo-900',
      mastercard: 'from-gray-900 via-gray-800 to-slate-900',
      rupay: 'from-indigo-900 via-blue-900 to-blue-950',
      amex: 'from-[#006FCF] via-[#0055A5] to-[#003E7E]',
    };
    return (
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mb-5" style={{ perspective: 1000 }}>
        <motion.div
          animate={{ rotateY: cvvFocused ? 180 : 0 }}
          transition={{ duration: 0.6, type: 'spring', damping: 20 }}
          className="relative w-full max-w-xs mx-auto aspect-[1.6/1]"
          style={{ transformStyle: 'preserve-3d' }}
        >
          {/* FRONT */}
          <div className="absolute inset-0 rounded-2xl overflow-hidden" style={{ backfaceVisibility: 'hidden' }}>
            <div className={`absolute inset-0 bg-gradient-to-br ${gradients[cardType] || 'from-slate-800 via-slate-700 to-gray-800'}`} />
            <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-white/5" />
            <div className="absolute -right-4 top-8 w-24 h-24 rounded-full bg-white/5" />
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTTAgMGg0MHY0MEgweiIgZmlsbD0ibm9uZSIvPjxjaXJjbGUgY3g9IjIwIiBjeT0iMjAiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wMykiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IGZpbGw9InVybCgjZykiIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiLz48L3N2Zz4=')] opacity-50" />
            <div className="relative p-5 h-full flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <div className="w-10 h-7 rounded bg-gradient-to-br from-yellow-300 to-yellow-500 opacity-80 shadow-lg">
                  <div className="w-full h-full rounded grid grid-cols-3 gap-[1px] p-[3px] opacity-60">
                    {[...Array(6)].map((_, i) => <div key={i} className="bg-yellow-700/50 rounded-[1px]" />)}
                  </div>
                </div>
                <div className="opacity-90">
                  {cardType === 'visa' && <VisaIcon />}
                  {cardType === 'mastercard' && <MastercardIcon />}
                  {cardType === 'rupay' && <RupayIcon />}
                  {cardType === 'amex' && <AmexIcon />}
                </div>
              </div>
              <div className="font-mono text-white/90 text-sm tracking-[0.2em]">
                {cardNumber || '\u2022\u2022\u2022\u2022 \u2022\u2022\u2022\u2022 \u2022\u2022\u2022\u2022 \u2022\u2022\u2022\u2022'}
              </div>
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-white/40 text-[8px] uppercase tracking-wider">Card Holder</p>
                  <p className="text-white/80 text-xs font-medium uppercase tracking-wide">{cardName || 'YOUR NAME'}</p>
                </div>
                <div className="text-right">
                  <p className="text-white/40 text-[8px] uppercase tracking-wider">Expires</p>
                  <p className="text-white/80 text-xs font-mono">{expiry || 'MM/YY'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* BACK (CVV side) */}
          <div className="absolute inset-0 rounded-2xl overflow-hidden" style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
            <div className={`absolute inset-0 bg-gradient-to-br ${gradients[cardType] || 'from-slate-800 via-slate-700 to-gray-800'}`} />
            <div className="relative h-full flex flex-col">
              <div className="w-full h-10 bg-black/60 mt-6" />
              <div className="flex-1 flex flex-col justify-center px-5">
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-8 rounded bg-white/90 flex items-center justify-end pr-3">
                    <span className="font-mono text-gray-800 text-sm tracking-widest">{cvv || '\u2022\u2022\u2022'}</span>
                  </div>
                  <p className="text-white/50 text-[9px]">CVV</p>
                </div>
              </div>
              <div className="flex justify-end px-5 pb-4">
                <div className="opacity-70">
                  {cardType === 'visa' && <VisaIcon />}
                  {cardType === 'mastercard' && <MastercardIcon />}
                  {cardType === 'rupay' && <RupayIcon />}
                  {cardType === 'amex' && <AmexIcon />}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    );
  };

  /* ── MAIN PAYMENT UI ── */
  return (
    <div className="min-h-screen bg-[#0a0e1a] pb-32">
      <QrModal />

      {/* ═══ PROCESSING OVERLAY MODAL ═══ */}
      <AnimatePresence>
        {showProcessingOverlay && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-md flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', damping: 20 }}
              className="relative w-full max-w-sm mx-4"
            >
              <div className="rounded-3xl bg-[#0f172a] border border-white/[0.08] shadow-[0_20px_80px_rgba(0,0,0,0.8)] p-10 text-center overflow-hidden">
                {/* Background glow */}
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{ background: 'radial-gradient(circle at center, rgba(251,191,36,0.06) 0%, transparent 70%)' }}
                />

                <AnimatePresence mode="wait">
                  {processingPhase < 4 && processingPhase !== 5 ? (
                    <motion.div key="processing-anim" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, scale: 0.9 }}>
                      {/* Circular loader */}
                      <div className="relative w-28 h-28 mx-auto mb-6">
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                          className="absolute inset-0 rounded-full border-[3px] border-transparent border-t-amber-400 border-r-amber-400/30"
                        />
                        <motion.div
                          animate={{ rotate: -360 }}
                          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                          className="absolute inset-2 rounded-full border-[2px] border-transparent border-t-yellow-300/60 border-l-yellow-300/20"
                        />
                        <motion.div
                          animate={{ scale: [0.8, 1.1, 0.8], opacity: [0.4, 0.8, 0.4] }}
                          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                          className="absolute inset-4 rounded-full bg-gradient-to-br from-amber-500/20 to-yellow-400/10 backdrop-blur-sm"
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <motion.div
                            animate={{ scale: [1, 1.1, 1] }}
                            transition={{ duration: 1, repeat: Infinity }}
                            className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-500 to-yellow-500 flex items-center justify-center shadow-[0_0_30px_rgba(251,191,36,0.4)]"
                          >
                            {processingPhase <= 0 && (
                              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" /></svg>
                            )}
                            {processingPhase === 1 && (
                              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path d="M3 21h18M3 10h18M5 6l7-3 7 3M4 10v11M20 10v11M8 14v3M12 14v3M16 14v3"/></svg>
                            )}
                            {processingPhase === 2 && (
                              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5"/></svg>
                            )}
                            {processingPhase === 3 && (
                              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"/></svg>
                            )}
                          </motion.div>
                        </div>
                      </div>

                      {/* Step text */}
                      <AnimatePresence mode="wait">
                        <motion.p
                          key={processingPhase}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -8 }}
                          className="text-white font-medium text-sm mb-2"
                        >
                          {processingSteps[processingPhase]?.text || 'Processing...'}
                        </motion.p>
                      </AnimatePresence>

                      {/* Progress bar */}
                      <div className="w-48 mx-auto h-1 rounded-full bg-white/[0.06] overflow-hidden mt-4">
                        <motion.div
                          initial={{ width: '0%' }}
                          animate={{ width: `${((processingPhase + 1) / 4) * 100}%` }}
                          transition={{ duration: 0.6, ease: 'easeOut' }}
                          className="h-full rounded-full bg-gradient-to-r from-amber-400 to-yellow-400"
                        />
                      </div>

                      {/* Steps dots */}
                      <div className="flex items-center justify-center gap-2 mt-4">
                        {processingSteps.map((_, i) => (
                          <motion.div
                            key={i}
                            animate={{
                              scale: i === processingPhase ? 1.3 : 1,
                              backgroundColor: i <= processingPhase ? '#f59e0b' : 'rgba(255,255,255,0.1)',
                            }}
                            className="w-2 h-2 rounded-full"
                          />
                        ))}
                      </div>

                      <p className="text-slate-600 text-[10px] mt-4">Do not close or refresh this page</p>

                      {/* Trust indicators */}
                      <div className="flex items-center justify-center gap-3 mt-5 pt-4 border-t border-white/[0.04]">
                        <div className="flex items-center gap-1 text-[9px] text-slate-500">
                          <svg className="w-3 h-3 text-green-500/80" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" /></svg>
                          256-bit SSL
                        </div>
                        <div className="w-px h-3 bg-white/[0.06]" />
                        <div className="flex items-center gap-1 text-[9px] text-slate-500">
                          <svg className="w-3 h-3 text-blue-400/80" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
                          PCI DSS
                        </div>
                        <div className="w-px h-3 bg-white/[0.06]" />
                        <div className="flex items-center gap-1 text-[9px] text-slate-500">
                          <svg className="w-3 h-3 text-amber-400/80" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                          RBI Verified
                        </div>
                      </div>
                    </motion.div>

                  ) : processingPhase === 5 ? (
                    /* ═══ COIN PUSH ANIMATION (Razorpay-style) ═══ */
                    <motion.div key="coin-push" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="py-4">
                      {/* Coin glow trail */}
                      <div className="relative w-40 h-40 mx-auto mb-6">
                        {/* Ambient glow behind coin */}
                        <motion.div
                          animate={{ scale: [0.6, 1.2, 0.6], opacity: [0.15, 0.4, 0.15] }}
                          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                          className="absolute inset-0 rounded-full blur-3xl"
                          style={{ background: 'radial-gradient(circle, rgba(251,191,36,0.5) 0%, transparent 70%)' }}
                        />
                        {/* Trail particles */}
                        {[...Array(6)].map((_, i) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -80, y: 20 + i * 10 }}
                            animate={{ opacity: [0, 0.8, 0], x: [- 80, -20 + i * 15, 60], y: [20, -10 + i * 5, -30] }}
                            transition={{ duration: 1.2, delay: i * 0.15, repeat: Infinity, repeatDelay: 0.3 }}
                            className="absolute left-1/2 top-1/2 w-2 h-2 rounded-full"
                            style={{ background: `rgba(251,191,36,${0.3 + i * 0.1})`, filter: 'blur(1px)' }}
                          />
                        ))}
                        {/* Main coin */}
                        <motion.div
                          initial={{ x: -120, opacity: 0, scale: 0.5, rotateY: 0 }}
                          animate={{ x: 0, opacity: 1, scale: [0.5, 1.3, 1], rotateY: [0, 360, 720] }}
                          transition={{ duration: 1.2, ease: [0.25, 0.46, 0.45, 0.94] }}
                          className="absolute inset-0 flex items-center justify-center"
                        >
                          <div className="relative">
                            {/* Coin body */}
                            <motion.div
                              animate={{ boxShadow: ['0 0 20px rgba(251,191,36,0.3)', '0 0 50px rgba(251,191,36,0.6)', '0 0 20px rgba(251,191,36,0.3)'] }}
                              transition={{ duration: 1, repeat: Infinity }}
                              className="w-24 h-24 rounded-full flex items-center justify-center"
                              style={{
                                background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 30%, #d97706 60%, #fbbf24 100%)',
                                border: '3px solid rgba(255,255,255,0.3)',
                              }}
                            >
                              {/* Inner ring */}
                              <div className="w-20 h-20 rounded-full border-2 border-yellow-300/40 flex items-center justify-center">
                                <motion.span
                                  animate={{ scale: [1, 1.1, 1] }}
                                  transition={{ duration: 0.8, repeat: Infinity }}
                                  className="text-3xl font-bold text-white drop-shadow-lg"
                                  style={{ textShadow: '0 2px 8px rgba(0,0,0,0.3)' }}
                                >
                                  {'\u20B9'}
                                </motion.span>
                              </div>
                            </motion.div>
                            {/* Shine effect */}
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                              className="absolute inset-0 rounded-full"
                              style={{ background: 'conic-gradient(from 0deg, transparent 0%, rgba(255,255,255,0.2) 10%, transparent 20%)' }}
                            />
                          </div>
                        </motion.div>
                      </div>

                      {/* Amount text */}
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                        className="text-center"
                      >
                        <p className="text-amber-400 font-bold text-2xl mb-1">
                          {'\u20B9'}{consultFee}
                        </p>
                        <motion.p
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.9 }}
                          className="text-slate-400 text-xs"
                        >
                          Payment received successfully
                        </motion.p>
                      </motion.div>

                      {/* Bouncing dots */}
                      <div className="flex items-center justify-center gap-1.5 mt-5">
                        {[0, 1, 2].map((i) => (
                          <motion.div
                            key={i}
                            animate={{ y: [-3, 3, -3], opacity: [0.4, 1, 0.4] }}
                            transition={{ duration: 0.6, delay: i * 0.15, repeat: Infinity }}
                            className="w-2 h-2 rounded-full bg-amber-400"
                          />
                        ))}
                      </div>
                    </motion.div>

                  ) : (
                    <motion.div key="overlay-success" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: 'spring', damping: 15 }}>
                      <div className="relative w-32 h-32 mx-auto">
                        <motion.div
                          animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.4, 0.2] }}
                          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                          className="absolute inset-0 rounded-full blur-2xl"
                          style={{ background: 'radial-gradient(circle,rgba(52,211,153,0.4) 0%, transparent 70%)' }}
                        />
                        <svg viewBox="0 0 200 200" className="w-full h-full relative z-10">
                          <circle cx="100" cy="100" r="70" fill="#2ecc71" opacity="0.9">
                            <animate attributeName="r" from="0" to="70" dur="0.5s" fill="freeze" />
                          </circle>
                          <path d="M72 98 L90 118 L132 78" fill="none" stroke="white" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="100" strokeDashoffset="100">
                            <animate attributeName="stroke-dashoffset" from="100" to="0" dur="0.4s" begin="0.5s" fill="freeze" />
                          </path>
                        </svg>
                      </div>
                      <motion.p
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="text-emerald-400 font-bold text-lg mt-2"
                      >
                        Payment Successful!
                      </motion.p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="w-full px-4 sm:px-6 lg:px-12 xl:px-20 pt-8 max-w-7xl mx-auto">
        {/* Back + Header */}
        <motion.button initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} onClick={() => navigate(-1)} className="group flex items-center gap-2 mb-6 px-4 py-2 rounded-xl bg-[#0f172a]/60 backdrop-blur-sm border border-amber-400/20 text-slate-400 hover:text-amber-300 hover:border-amber-400/40 hover:bg-amber-500/[0.06] hover:shadow-[0_4px_16px_rgba(251,191,36,0.15)] transition-all duration-300">
          <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span className="text-xs font-medium">Back</span>
        </motion.button>

        <div className="flex items-center justify-between mb-8">
          <motion.h1 initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="text-2xl md:text-3xl luxury-text font-bold tracking-wide">
            Secure Checkout
          </motion.h1>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/20">
            <svg className="w-3.5 h-3.5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
            </svg>
            <span className="text-green-400 text-[11px] font-medium">256-bit Encrypted</span>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

          {/* ═══════════ LEFT: PAYMENT FORM ═══════════ */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="lg:col-span-3">
            <div className="rounded-2xl bg-[#0f172a]/95 backdrop-blur-xl border border-white/[0.06] shadow-[0_8px_40px_rgba(0,0,0,0.4)] overflow-hidden">
              <div className="h-[2px] w-full bg-gradient-to-r from-yellow-400 via-amber-300 to-yellow-500" />
              <div className="p-6">
                {/* Method Tabs */}
                <p className="text-slate-500 text-[10px] uppercase tracking-widest mb-3 font-medium">Choose Payment Method</p>
                <div className="flex gap-2 mb-6">
                  {methodTabs.map((m) => (
                    <motion.button
                      key={m.key}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => setMethod(m.key)}
                      className={`flex-1 flex flex-col items-center gap-2 py-3.5 rounded-xl text-xs font-medium transition-all duration-300 relative overflow-hidden ${
                        method === m.key
                          ? 'bg-gradient-to-br from-yellow-500/15 to-amber-500/10 border-2 border-amber-400/50 text-amber-300 shadow-[0_0_24px_rgba(251,191,36,0.12)]'
                          : 'bg-white/[0.03] border border-white/[0.08] text-slate-500 hover:text-slate-300 hover:bg-white/[0.05]'
                      }`}
                    >
                      {method === m.key && <motion.div layoutId="activeTab" className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-yellow-400/5 rounded-xl" />}
                      <span className="relative z-10">{m.icon}</span>
                      <span className="relative z-10">{m.label}</span>
                    </motion.button>
                  ))}
                </div>

                <AnimatePresence mode="wait">

                  {/* ──── CARD ──── */}
                  {method === 'card' && (
                    <motion.div key="card" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
                      <CardPreview />
                      <div className="space-y-4">
                        <div>
                          <label className="text-slate-400 text-[11px] font-medium block mb-1.5">Cardholder Name</label>
                          <input type="text" value={cardName} onChange={(e) => setCardName(e.target.value)} placeholder="Enter name on card" className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.1] text-white text-sm placeholder:text-slate-600 focus:outline-none focus:border-amber-400/50 focus:ring-2 focus:ring-amber-500/10 focus:shadow-[0_0_20px_rgba(251,191,36,0.08)] transition-all duration-300" />
                        </div>
                        <div>
                          <label className="text-slate-400 text-[11px] font-medium block mb-1.5">Card Number</label>
                          <div className="relative">
                            <input type="text" value={cardNumber} onChange={(e) => setCardNumber(formatCard(e.target.value))} placeholder="4242 4242 4242 4242" maxLength={19} className="w-full px-4 py-3 pr-16 rounded-xl bg-white/[0.04] border border-white/[0.1] text-white text-sm placeholder:text-slate-600 focus:outline-none focus:border-amber-400/50 focus:ring-2 focus:ring-amber-500/10 focus:shadow-[0_0_20px_rgba(251,191,36,0.08)] transition-all duration-300 font-mono tracking-wider" />
                            <div className="absolute right-3 top-1/2 -translate-y-1/2">
                              <AnimatePresence mode="wait">
                                {cardType && (
                                  <motion.div key={cardType} initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.5 }} transition={{ duration: 0.2 }}>
                                    {cardType === 'visa' && <VisaIcon />}
                                    {cardType === 'mastercard' && <MastercardIcon />}
                                    {cardType === 'rupay' && <RupayIcon />}
                                    {cardType === 'amex' && <AmexIcon />}
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          </div>
                          <AnimatePresence>
                            {cardType && !cardErrors.cardNumber && (
                              <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="text-[10px] mt-1.5 text-amber-400/70">
                                {cardType === 'visa' ? '\u2713 Visa Card Detected' : cardType === 'mastercard' ? '\u2713 Mastercard Detected' : cardType === 'amex' ? '\u2713 American Express Detected' : '\u2713 RuPay Card Detected'}
                              </motion.p>
                            )}
                            {cardErrors.cardNumber && (
                              <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="text-[10px] mt-1.5 text-red-400">
                                ✕ {cardErrors.cardNumber}
                              </motion.p>
                            )}
                          </AnimatePresence>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-slate-400 text-[11px] font-medium block mb-1.5">Expiry Date</label>
                            <input type="text" value={expiry} onChange={(e) => setExpiry(formatExpiry(e.target.value))} placeholder="MM/YY" maxLength={5} className={`w-full px-4 py-3 rounded-xl bg-white/[0.04] border ${cardErrors.expiry ? 'border-red-500/50' : 'border-white/[0.1]'} text-white text-sm placeholder:text-slate-600 focus:outline-none focus:border-amber-400/50 focus:ring-2 focus:ring-amber-500/10 transition-all duration-300 font-mono`} />
                            {cardErrors.expiry && <p className="text-red-400 text-[10px] mt-1">✕ {cardErrors.expiry}</p>}
                          </div>
                          <div>
                            <label className="text-slate-400 text-[11px] font-medium block mb-1.5">CVV</label>
                            <div className="relative">
                              <input type="password" value={cvv} onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, cardType === 'amex' ? 4 : 3))} onFocus={() => setCvvFocused(true)} onBlur={() => setCvvFocused(false)} placeholder="\u2022\u2022\u2022" maxLength={cardType === 'amex' ? 4 : 3} className={`w-full px-4 py-3 rounded-xl bg-white/[0.04] border ${cardErrors.cvv ? 'border-red-500/50' : 'border-white/[0.1]'} text-white text-sm placeholder:text-slate-600 focus:outline-none focus:border-amber-400/50 focus:ring-2 focus:ring-amber-500/10 transition-all duration-300 font-mono`} />
                              <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                              </svg>
                            </div>
                          </div>
                        </div>

                        {/* ─── Card Actions: Save / Reset / Saved Card ─── */}
                        <div className="space-y-3">
                          {/* Save card toggle */}
                          <label className="flex items-center gap-2.5 cursor-pointer group">
                            <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all duration-200 ${saveCard ? 'bg-amber-500 border-amber-500' : 'border-white/20 group-hover:border-amber-400/50'}`} onClick={() => setSaveCard(!saveCard)}>
                              {saveCard && (
                                <motion.svg initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7"/>
                                </motion.svg>
                              )}
                            </div>
                            <span className="text-slate-400 text-xs group-hover:text-slate-300 transition-colors">Save card for future payments</span>
                          </label>

                          {/* Reset Card (always visible when there's input) */}
                          {(cardNumber || cardName || expiry || cvv) && (
                            <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                              <div className="flex items-center gap-2">
                                <span className="text-slate-500 text-[10px]">Card ending:</span>
                                <span className="text-amber-400 text-xs font-mono font-medium">{maskedCard || '\u2022\u2022\u2022\u2022'}</span>
                              </div>
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => {
                                  setCardNumber('');
                                  setCardName('');
                                  setExpiry('');
                                  setCvv('');
                                  setUsingSavedCard(false);
                                  setPayError('');
                                }}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-700/50 text-slate-400 text-[10px] font-medium hover:bg-red-500/15 hover:text-red-400 transition-all duration-200"
                              >
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                                Reset Card
                              </motion.button>
                            </motion.div>
                          )}

                          {/* Saved Card: Use or Forget */}
                          {savedCard && !usingSavedCard && (
                            <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="px-3.5 py-3 rounded-xl bg-gradient-to-r from-amber-500/[0.06] to-yellow-400/[0.04] border border-amber-400/20">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2.5">
                                  <div className="w-8 h-5 rounded bg-gradient-to-r from-blue-500 to-blue-700 flex items-center justify-center">
                                    <span className="text-white text-[7px] font-bold uppercase">{savedCard.cardType || 'Card'}</span>
                                  </div>
                                  <div>
                                    <p className="text-white text-xs font-medium">\u2022\u2022\u2022\u2022 {savedCard.last4}</p>
                                    <p className="text-slate-500 text-[9px]">{savedCard.name} \u00B7 Exp {savedCard.expiry}</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <motion.button whileTap={{ scale: 0.95 }} onClick={() => {
                                    setCardNumber(formatCard('4242424242424242'));
                                    setCardName(savedCard.name);
                                    setExpiry(savedCard.expiry);
                                    setCvv('');
                                    setUsingSavedCard(true);
                                  }} className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-400 text-[10px] font-medium hover:bg-amber-500/30 transition-colors">
                                    Use
                                  </motion.button>
                                  <motion.button whileTap={{ scale: 0.95 }} onClick={() => {
                                    setCardNumber('');
                                    setCardName('');
                                    setExpiry('');
                                    setCvv('');
                                    localStorage.removeItem('medcare_saved_card');
                                    setSavedCard(null);
                                    setUsingSavedCard(false);
                                  }} className="px-2.5 py-1 rounded-lg bg-red-500/10 text-red-400 text-[10px] font-medium hover:bg-red-500/20 transition-colors">
                                    Forget
                                  </motion.button>
                                </div>
                              </div>
                              <p className="text-slate-600 text-[9px] mt-1.5">Forget to clear saved card, or enter new details above and save again to update.</p>
                            </motion.div>
                          )}

                          {/* Using saved card indicator */}
                          {usingSavedCard && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center justify-between px-3 py-2 rounded-lg bg-green-500/[0.06] border border-green-500/20">
                              <div className="flex items-center gap-2">
                                <svg className="w-3.5 h-3.5 text-green-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                                <span className="text-green-400 text-[11px]">Using saved card \u2022\u2022\u2022\u2022 {savedCard?.last4}</span>
                              </div>
                              <motion.button whileTap={{ scale: 0.95 }} onClick={() => {
                                setCardNumber('');
                                setCardName('');
                                setExpiry('');
                                setCvv('');
                                setUsingSavedCard(false);
                              }} className="text-slate-500 text-[10px] hover:text-white transition-colors">
                                Enter new card
                              </motion.button>
                            </motion.div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* ──── UPI ──── */}
                  {method === 'upi' && (
                    <motion.div key="upi" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }} className="space-y-5">
                      <div>
                        <p className="text-slate-400 text-[11px] font-medium mb-3">Pay using UPI App</p>
                        <div className="grid grid-cols-4 gap-3">
                          {upiApps.map((app) => (
                            <motion.button
                              key={app.key}
                              whileHover={{ scale: 1.05, y: -4, boxShadow: '0 12px 32px rgba(0,0,0,0.25)' }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => setSelectedUpiApp(app.key)}
                              className={`relative flex flex-col items-center gap-2.5 py-4 rounded-2xl transition-all duration-300 ${
                                selectedUpiApp === app.key
                                  ? 'bg-white border-2 border-amber-400/70 shadow-[0_0_28px_rgba(251,191,36,0.18),0_4px_16px_rgba(0,0,0,0.15)]'
                                  : 'bg-white/95 border border-white/20 shadow-[0_2px_8px_rgba(0,0,0,0.12)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.2)] hover:border-white/40'
                              }`}
                            >
                              {/* Pulse glow on selection */}
                              {selectedUpiApp === app.key && (
                                <motion.div
                                  animate={{ opacity: [0.1, 0.25, 0.1] }}
                                  transition={{ duration: 2, repeat: Infinity }}
                                  className="absolute inset-0 rounded-2xl bg-gradient-to-b from-amber-400/15 to-transparent pointer-events-none"
                                />
                              )}
                              <div className={`w-12 h-12 rounded-xl overflow-hidden flex items-center justify-center p-1.5 transition-all duration-300 ${selectedUpiApp === app.key ? 'ring-2 ring-amber-400/30' : ''}`}>
                                <img src={app.logo} alt={app.name} className="w-full h-full object-contain" draggable={false} />
                              </div>
                              <span className={`text-[10px] font-semibold transition-colors ${selectedUpiApp === app.key ? 'text-amber-600' : 'text-slate-600'}`}>{app.name}</span>
                              {selectedUpiApp === app.key && (
                                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', damping: 12 }} className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center shadow-lg">
                                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7"/></svg>
                                </motion.div>
                              )}
                            </motion.button>
                          ))}
                        </div>
                      </div>

                      {/* Open in App CTA */}
                      {selectedUpiApp && (
                        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-amber-500/[0.08] to-yellow-400/[0.04] border border-amber-400/20">
                          <motion.div animate={{ scale: [1, 1.15, 1] }} transition={{ duration: 1.5, repeat: Infinity }} className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                            <svg className="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
                          </motion.div>
                          <div className="flex-1">
                            <p className="text-white text-xs font-medium">Open {upiApps.find(a => a.key === selectedUpiApp)?.name}</p>
                            <p className="text-slate-500 text-[10px]">You'll receive a payment request of {'\u20B9'}{consultFee}</p>
                          </div>
                        </motion.div>
                      )}

                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-px bg-white/[0.06]" />
                        <span className="text-slate-600 text-[10px] uppercase tracking-widest font-medium">or</span>
                        <div className="flex-1 h-px bg-white/[0.06]" />
                      </div>

                      <div>
                        <label className="text-slate-400 text-[11px] font-medium block mb-1.5">Enter UPI ID</label>
                        <div className="relative">
                          <input type="text" value={upiId} onChange={(e) => setUpiId(e.target.value)} placeholder="yourname@okaxis" className="w-full px-4 py-3 pr-20 rounded-xl bg-white/[0.04] border border-white/[0.1] text-white text-sm placeholder:text-slate-600 focus:outline-none focus:border-amber-400/50 focus:ring-2 focus:ring-amber-500/10 transition-all duration-300" />
                          {upiId && (
                            <motion.button initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-lg bg-amber-500/20 text-amber-400 text-[10px] font-medium hover:bg-amber-500/30 transition-colors">
                              Verify
                            </motion.button>
                          )}
                        </div>
                      </div>

                      <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setShowQrModal(true)} className="w-full flex items-center justify-center gap-3 py-3.5 rounded-xl bg-white/[0.03] border border-dashed border-amber-400/30 text-amber-400/80 hover:text-amber-300 hover:bg-amber-500/[0.05] hover:border-amber-400/50 transition-all duration-300">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"/>
                        </svg>
                        <span className="text-xs font-medium">Scan QR Code</span>
                      </motion.button>

                      <div className="flex items-start gap-3 p-3.5 rounded-xl bg-amber-500/[0.05] border border-amber-500/10">
                        <svg className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                        <p className="text-amber-400/70 text-xs leading-relaxed">A payment request of <span className="text-amber-300 font-semibold">{'\u20B9'}{consultFee}</span> will be sent to your UPI app for approval.</p>
                      </div>
                    </motion.div>
                  )}

                  {/* ──── NET BANKING ──── */}
                  {method === 'netbanking' && (
                    <motion.div key="netbanking" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }} className="space-y-4">
                      <p className="text-slate-400 text-[11px] font-medium">Popular Banks</p>
                      <div className="grid grid-cols-3 gap-3">
                        {banks.map((bank) => (
                          <motion.button
                            key={bank.key}
                            whileHover={{ scale: 1.04, y: -3, boxShadow: '0 8px 30px rgba(0,0,0,0.3)' }}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => setSelectedBank(bank.key)}
                            className={`relative flex flex-col items-center gap-2.5 py-4 rounded-xl transition-all duration-300 ${
                              selectedBank === bank.key
                                ? 'bg-gradient-to-br from-yellow-500/10 to-amber-500/5 border-2 border-amber-400/50 text-amber-300 shadow-[0_0_24px_rgba(251,191,36,0.12)]'
                                : 'bg-white/[0.02] border border-white/[0.06] text-slate-400 hover:text-white hover:bg-white/[0.04] hover:border-white/[0.12]'
                            }`}
                          >
                            {/* Pulse glow on selection */}
                            {selectedBank === bank.key && (
                              <motion.div
                                animate={{ opacity: [0.1, 0.25, 0.1] }}
                                transition={{ duration: 2, repeat: Infinity }}
                                className="absolute inset-0 rounded-xl bg-gradient-to-b from-amber-400/10 to-transparent pointer-events-none"
                              />
                            )}
                            <div className="relative">
                              <bank.Logo />
                              {selectedBank === bank.key && (
                                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', damping: 12 }} className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center shadow-lg">
                                  <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7"/></svg>
                                </motion.div>
                              )}
                            </div>
                            <span className="text-[10px] font-medium relative z-10">{bank.name}</span>
                          </motion.button>
                        ))}
                      </div>

                      <div>
                        <label className="text-slate-400 text-[11px] font-medium block mb-1.5">Other Banks</label>
                        <select className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.1] text-slate-400 text-sm focus:outline-none focus:border-amber-400/50 focus:ring-2 focus:ring-amber-500/10 transition-all duration-300 appearance-none cursor-pointer">
                          <option value="">Select your bank</option>
                          <option value="bob">Bank of Baroda</option>
                          <option value="canara">Canara Bank</option>
                          <option value="union">Union Bank</option>
                          <option value="idbi">IDBI Bank</option>
                          <option value="yes">Yes Bank</option>
                          <option value="indusind">IndusInd Bank</option>
                        </select>
                      </div>

                      {selectedBank && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-500/[0.06] border border-amber-400/10">
                          <svg className="w-3.5 h-3.5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          <span className="text-amber-400/80 text-xs">You will be redirected to {banks.find(b => b.key === selectedBank)?.name || 'your bank'}'s secure portal</span>
                        </motion.div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Payment Error Display */}
                <AnimatePresence>
                  {payError && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      className="mt-4 p-3.5 rounded-xl bg-red-500/10 border border-red-500/20"
                    >
                      <div className="flex items-start gap-2.5">
                        <svg className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                        <div>
                          <p className="text-red-400 text-xs font-semibold">Payment Failed</p>
                          <p className="text-red-400/70 text-[11px] mt-0.5">{payError}</p>
                        </div>
                        <button onClick={() => setPayError('')} className="ml-auto text-red-400/50 hover:text-red-400 transition-colors">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Validation Hint */}
                {!isFormValid && !processing && (
                  <div className="mt-3 text-[10px] text-center">
                    {method === 'card' && (
                      <div className="space-y-0.5">
                        {Object.keys(cardErrors).length > 0 ? (
                          <p className="text-red-400/80">Fix the highlighted errors above to proceed</p>
                        ) : (
                          <p className="text-slate-600">Fill in all card details to proceed</p>
                        )}
                        <p className="text-slate-700">Use test card: 4242 4242 4242 4242 \u00B7 any future expiry \u00B7 any 3-digit CVV</p>
                      </div>
                    )}
                    {method === 'upi' && <p className="text-slate-600">Select a UPI app or enter a valid UPI ID (e.g. name@bank)</p>}
                    {method === 'netbanking' && <p className="text-slate-600">Select a bank to continue</p>}
                  </div>
                )}

                {/* PAY BUTTON */}
                <motion.button
                  whileHover={{ scale: (!isFormValid || processing) ? 1 : 1.02 }}
                  whileTap={{ scale: (!isFormValid || processing) ? 1 : 0.98 }}
                  onClick={handlePay}
                  disabled={!isFormValid || processing}
                  className={`w-full mt-4 py-4 rounded-xl text-sm font-bold transition-all duration-300 relative overflow-hidden ${
                    !isFormValid
                      ? 'bg-slate-700/50 text-slate-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-500 text-white shadow-[0_4px_24px_rgba(251,191,36,0.3)] hover:shadow-[0_8px_40px_rgba(251,191,36,0.45)] disabled:opacity-70 disabled:cursor-not-allowed'
                  }`}
                >
                  {!processing && isFormValid && (
                    <motion.div animate={{ x: ['-100%', '200%'] }} transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }} className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12" />
                  )}
                  <span className="relative z-10">
                    {payStep === 1 ? (
                      <span className="flex items-center justify-center gap-2">
                        <motion.span animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }} className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />
                        Processing Payment...
                      </span>
                    ) : payStep === 2 ? (
                      <span className="flex items-center justify-center gap-2">
                        <motion.span animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }} className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />
                        Verifying with Bank...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        {isFormValid && (
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                          </svg>
                        )}
                        Pay {'\u20B9'}{consultFee}
                      </span>
                    )}
                  </span>
                </motion.button>

                {/* Trust Footer */}
                <div className="mt-5 flex flex-col items-center gap-3">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1 text-[10px] text-slate-500">
                      <svg className="w-3 h-3 text-green-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" /></svg>
                      Secure
                    </div>
                    <div className="flex items-center gap-1 text-[10px] text-slate-500">
                      <svg className="w-3 h-3 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
                      PCI DSS Compliant
                    </div>
                    <div className="flex items-center gap-1 text-[10px] text-slate-500">
                      <svg className="w-3 h-3 text-amber-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                      RBI Verified
                    </div>
                  </div>
                  <div className="flex items-center gap-2 opacity-40">
                    <VisaIcon /><MastercardIcon /><RupayIcon /><AmexIcon />
                  </div>
                  <div className="flex items-center gap-1.5 mt-1">
                    <svg className="w-3 h-3 text-green-500/60" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" /></svg>
                    <span className="text-[9px] text-slate-600">Secured by <span className="text-amber-500/70 font-semibold">MedCare Payment Gateway</span></span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* ═══════════ RIGHT: BOOKING SUMMARY ═══════════ */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="lg:col-span-2">
            <div className="rounded-2xl bg-[#0f172a]/95 backdrop-blur-xl border border-white/[0.06] shadow-[0_8px_40px_rgba(0,0,0,0.4)] sticky top-24 overflow-hidden">
              <div className="h-[2px] w-full bg-gradient-to-r from-yellow-400 via-amber-300 to-yellow-500" />
              <div className="p-6">
                <h3 className="luxury-text font-semibold text-sm mb-4 flex items-center gap-2">
                  <span className="w-1 h-4 rounded-full bg-gradient-to-b from-yellow-400 to-amber-500" />
                  Booking Summary
                </h3>

                <div className="flex items-center gap-3 mb-5">
                  <div className="w-14 h-14 rounded-xl overflow-hidden border border-white/10 flex-shrink-0">
                    {doctor?.photo?.url ? (
                      <img src={doctor.photo.url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center text-white text-sm font-bold">
                        {doctor?.user?.firstName?.[0]}{doctor?.user?.lastName?.[0]}
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="text-white/90 font-semibold text-sm">{doctorName}</p>
                    <p className="text-amber-400/80 text-xs">{doctor?.specialization}</p>
                  </div>
                </div>

                <div className="space-y-2.5 py-4 border-t border-b border-white/[0.06]">
                  {[
                    { label: 'Date', value: date ? new Date(date).toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' }) : '\u2014' },
                    { label: 'Time', value: time || '\u2014' },
                    { label: 'Type', value: 'In-Person' },
                  ].map((row) => (
                    <div key={row.label} className="flex justify-between text-xs">
                      <span className="text-slate-500">{row.label}</span>
                      <span className="text-white/80 font-medium">{row.value}</span>
                    </div>
                  ))}
                </div>

                {patientName && (
                  <div className="space-y-2 py-4 border-b border-white/[0.06]">
                    <p className="text-[10px] uppercase tracking-widest text-amber-400/80 font-semibold mb-2">Patient Info</p>
                    {[
                      { label: 'Name', value: patientName },
                      patientPhone && { label: 'Phone', value: patientPhone },
                      patientEmail && { label: 'Email', value: patientEmail },
                      visitReason && { label: 'Reason', value: visitReason },
                      patientNotes && { label: 'Notes', value: patientNotes, italic: true },
                    ].filter(Boolean).map((row) => (
                      <div key={row.label} className="flex justify-between text-xs">
                        <span className="text-slate-500">{row.label}</span>
                        <span className={`${row.italic ? 'text-white/50 italic' : 'text-white/80 font-medium'} max-w-[60%] text-right`}>{row.value}</span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="pt-4 space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Consultation Fee</span>
                    <span className="text-white/80">{'\u20B9'}{consultFee}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Platform Fee</span>
                    <span className="text-emerald-400 font-medium">FREE</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">GST</span>
                    <span className="text-slate-500">Included</span>
                  </div>
                  <div className="h-px bg-white/[0.06] my-1" />
                  <div className="flex justify-between items-center">
                    <span className="text-white/70 font-medium text-sm">Total</span>
                    <span className="font-bold text-lg luxury-text">{'\u20B9'}{consultFee}</span>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-white/[0.06]">
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { icon: '\uD83D\uDD12', label: 'Secure', sub: '256-bit SSL' },
                      { icon: '\u26A1', label: 'Instant', sub: 'Confirmation' },
                      { icon: '\u2705', label: 'Verified', sub: 'Doctor' },
                    ].map((badge) => (
                      <div key={badge.label} className="flex flex-col items-center gap-1 py-2 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                        <span className="text-sm">{badge.icon}</span>
                        <span className="text-[9px] text-slate-400 font-medium">{badge.label}</span>
                        <span className="text-[8px] text-slate-600">{badge.sub}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-center gap-1.5 text-[9px] text-slate-600">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                  Protected by MedCare Payment Gateway
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
