const express = require('express');
const crypto = require('crypto');
const router = express.Router();
const { Appointment } = require('../models/Appointment');
const { protect } = require('../middleware/auth');
const logger = require('../utils/logger');

// Only initialize Stripe with a real key (not a placeholder like sk_test_xxxxx)
const stripeKey = process.env.STRIPE_SECRET_KEY;
const isStripeConfigured = stripeKey && stripeKey.startsWith('sk_') && stripeKey.length > 20;
const stripe = isStripeConfigured ? require('stripe')(stripeKey) : null;

// Razorpay initialization
const razorpayKeyId = process.env.RAZORPAY_KEY_ID;
const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET;
const isRazorpayConfigured = razorpayKeyId && razorpayKeySecret && razorpayKeyId.startsWith('rzp_') && razorpayKeySecret.length > 10;
let razorpay = null;
if (isRazorpayConfigured) {
  try {
    const Razorpay = require('razorpay');
    razorpay = new Razorpay({ key_id: razorpayKeyId, key_secret: razorpayKeySecret });
    logger.info('Razorpay initialized successfully');
  } catch (e) {
    logger.warn(`Razorpay init failed: ${e.message}`);
  }
}


// ================= CREATE PAYMENT INTENT =================
router.post('/create-intent', protect, async (req, res) => {
  if (!isStripeConfigured || !stripe) {
    return res.status(503).json({ success: false, error: 'Stripe is not configured. Use the standard payment flow.' });
  }
  try {
    const { appointmentId } = req.body;

    const appointment = await Appointment.findById(appointmentId);

    if (!appointment) {
      return res.status(404).json({ success: false, error: 'Appointment not found' });
    }

    if (appointment.patient.toString() !== req.user.id) {
      return res.status(403).json({ success: false, error: 'Not authorized' });
    }

    if (appointment.payment.status === 'paid') {
      return res.status(400).json({ success: false, error: 'Already paid' });
    }

    // 🔥 CREATE STRIPE PAYMENT
    const paymentIntent = await stripe.paymentIntents.create({
      amount: appointment.payment.amount * 100,
      currency: 'usd',
      metadata: {
        appointmentId: appointment._id.toString(),
        referenceNumber: appointment.referenceNumber,
      },
    });

    // Save intent ID
    appointment.payment.stripePaymentIntentId = paymentIntent.id;
    await appointment.save();

    res.json({
      success: true,
      data: {
        clientSecret: paymentIntent.client_secret,
      },
    });

  } catch (err) {
    logger.error(err.message);
    res.status(500).json({ success: false, error: 'Payment failed' });
  }
});


// ================= STRIPE WEBHOOK =================
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  if (!isStripeConfigured || !stripe) {
    return res.status(503).json({ success: false, error: 'Stripe is not configured' });
  }
  const sig = req.headers['stripe-signature'];

  try {
    const event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );

    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object;

      const appointment = await Appointment.findOne({
        'payment.stripePaymentIntentId': paymentIntent.id,
      });

      if (appointment) {
        appointment.payment.status = 'paid';
        appointment.payment.paidAt = new Date();
        appointment.status = 'confirmed';

        await appointment.save();

        logger.info(`💰 Payment success → ${appointment.referenceNumber}`);
      }
    }

    res.json({ received: true });

  } catch (err) {
    logger.error(`Webhook Error: ${err.message}`);
    res.status(400).send(`Webhook Error: ${err.message}`);
  }
});


// ================= PROCESS PAYMENT (SECURE) =================
// Server-side validated. Uses Stripe when configured, demo mode otherwise.
// Raw card numbers are NEVER sent from frontend — only last 4 digits for display.
router.post('/process-payment', async (req, res) => {
  try {
    const { method, cardLast4, cardType, upiId, bank } = req.body;
    const amount = Number(req.body.amount);

    // ── Validate payment method ──
    if (!method || !['card', 'upi', 'netbanking'].includes(method)) {
      return res.status(400).json({ success: false, error: 'Invalid payment method' });
    }

    // ── Validate amount ──
    if (!amount || isNaN(amount) || amount <= 0 || amount > 500000) {
      return res.status(400).json({ success: false, error: 'Invalid payment amount' });
    }

    // ── Method-specific server-side validation ──
    if (method === 'card') {
      if (!cardLast4 || !/^\d{4}$/.test(cardLast4)) {
        return res.status(400).json({ success: false, error: 'Invalid card details — card number is required' });
      }
    }

    if (method === 'upi') {
      if (!upiId || String(upiId).length < 3) {
        return res.status(400).json({ success: false, error: 'Valid UPI ID or UPI app selection is required' });
      }
    }

    if (method === 'netbanking') {
      if (!bank || typeof bank !== 'string') {
        return res.status(400).json({ success: false, error: 'Please select a bank for net banking' });
      }
    }

    // ── Stripe integration (when configured with a real key) ──
    if (isStripeConfigured && stripe) {
      try {
        const testMethodMap = {
          visa: 'pm_card_visa',
          mastercard: 'pm_card_mastercard',
          rupay: 'pm_card_visa', // No RuPay test token, fallback to Visa
        };

        const paymentIntent = await stripe.paymentIntents.create({
          amount: Math.round(amount * 100),
          currency: 'inr',
          payment_method: testMethodMap[cardType] || 'pm_card_visa',
          confirm: true,
          automatic_payment_methods: { enabled: true, allow_redirects: 'never' },
          metadata: { method, demo: 'false' },
        });

        if (paymentIntent.status === 'succeeded') {
          logger.info(`Stripe payment succeeded: ${paymentIntent.id} | ${method} | ₹${amount}`);
          return res.json({ success: true, paymentId: paymentIntent.id, verified: true });
        }

        return res.status(402).json({
          success: false,
          error: 'Payment was not confirmed by the payment gateway. Please try again.',
        });
      } catch (stripeErr) {
        logger.error(`Stripe error: ${stripeErr.message}`);
        return res.status(402).json({
          success: false,
          error: 'Payment declined by the bank. Please try a different payment method.',
        });
      }
    }

    // ── Demo mode (Stripe not configured) ──
    // All validations passed; generate a demo payment ID
    const paymentId = `TXN${Date.now().toString().slice(-10)}${Math.random().toString(36).substring(2, 5).toUpperCase()}`;
    logger.info(`[DEMO] Payment processed: ${paymentId} | ${method} | ₹${amount}`);

    res.json({ success: true, paymentId, verified: false, demo: true });

  } catch (err) {
    logger.error(`Payment processing error: ${err.message}`);
    res.status(500).json({ success: false, error: 'Payment processing failed. Please try again.' });
  }
});


// ================= RAZORPAY: CREATE ORDER =================
router.post('/razorpay/create-order', async (req, res) => {
  try {
    const { method } = req.body;
    const amount = Number(req.body.amount);

    // Validate amount
    if (!amount || isNaN(amount) || amount <= 0 || amount > 500000) {
      return res.status(400).json({ success: false, error: 'Invalid payment amount' });
    }

    // If Razorpay is configured, create a real order
    if (isRazorpayConfigured && razorpay) {
      const options = {
        amount: Math.round(amount * 100), // paise
        currency: 'INR',
        receipt: `rcpt_${Date.now().toString().slice(-10)}`,
        notes: { method: method || 'card', platform: 'medcare' },
      };

      const order = await razorpay.orders.create(options);
      logger.info(`Razorpay order created: ${order.id} | ₹${amount}`);

      return res.json({
        success: true,
        order: {
          id: order.id,
          amount: order.amount,
          currency: order.currency,
        },
        key: razorpayKeyId, // public key safe to send to frontend
        gateway: 'razorpay',
      });
    }

    // Demo mode — simulate order creation
    const demoOrderId = `order_demo_${Date.now().toString().slice(-10)}`;
    logger.info(`[DEMO] Razorpay order created: ${demoOrderId} | ₹${amount}`);

    return res.json({
      success: true,
      order: {
        id: demoOrderId,
        amount: Math.round(amount * 100),
        currency: 'INR',
      },
      key: 'rzp_demo_key',
      gateway: 'demo',
    });

  } catch (err) {
    logger.error(`Razorpay create-order error: ${err.message}`);
    res.status(500).json({ success: false, error: 'Failed to create payment order' });
  }
});


// ================= RAZORPAY: VERIFY PAYMENT =================
router.post('/razorpay/verify', async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ success: false, error: 'Missing payment verification data' });
    }

    // If Razorpay is configured, do real HMAC verification
    if (isRazorpayConfigured && razorpayKeySecret) {
      const sign = razorpay_order_id + '|' + razorpay_payment_id;
      const expectedSignature = crypto
        .createHmac('sha256', razorpayKeySecret)
        .update(sign)
        .digest('hex');

      if (expectedSignature !== razorpay_signature) {
        logger.warn(`Razorpay signature mismatch for order ${razorpay_order_id}`);
        return res.status(400).json({ success: false, error: 'Payment verification failed — signature mismatch' });
      }

      logger.info(`Razorpay payment verified: ${razorpay_payment_id} | order: ${razorpay_order_id}`);
      return res.json({
        success: true,
        paymentId: razorpay_payment_id,
        orderId: razorpay_order_id,
        verified: true,
      });
    }

    // Demo mode — accept any signature
    const paymentId = `pay_demo_${Date.now().toString().slice(-10)}`;
    logger.info(`[DEMO] Razorpay payment verified: ${paymentId}`);
    return res.json({
      success: true,
      paymentId,
      orderId: razorpay_order_id,
      verified: false,
      demo: true,
    });

  } catch (err) {
    logger.error(`Razorpay verify error: ${err.message}`);
    res.status(500).json({ success: false, error: 'Payment verification failed' });
  }
});


// ================= RAZORPAY: CONFIG CHECK =================
router.get('/razorpay/config', (req, res) => {
  res.json({
    configured: isRazorpayConfigured && !!razorpay,
    key: isRazorpayConfigured ? razorpayKeyId : null,
  });
});


module.exports = router;