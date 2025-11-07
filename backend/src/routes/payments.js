const express = require('express');
const router = express.Router();
const { createPaymentIntent, capturePayment } = require('../services/paymentService');

// Create payment intent for fee payment
router.post('/create', async (req, res) => {
  try {
    const { amount, currency, description, metadata } = req.body || {};
    const intent = await createPaymentIntent({ amount, currency, description, metadata });
    res.status(201).json({ success: true, intent });
  } catch (err) {
    res.status(err.statusCode || 500).json({ success: false, message: err.message });
  }
});

// Capture payment after successful confirmation
router.post('/capture', async (req, res) => {
  try {
    const { paymentId } = req.body || {};
    const result = await capturePayment({ paymentId });
    res.status(200).json({ success: true, payment: result });
  } catch (err) {
    res.status(err.statusCode || 500).json({ success: false, message: err.message });
  }
});

module.exports = router;