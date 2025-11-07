// Simple stub for payment gateway integration.
// Replace with actual Stripe/Razorpay implementation in production.

async function createPaymentIntent({ amount, currency = 'INR', description, metadata = {} }) {
  if (!amount || amount <= 0) {
    const error = new Error('Invalid amount');
    error.statusCode = 400;
    throw error;
  }

  // Return a mocked payment intent-like object
  return {
    id: 'pi_mock_' + Math.random().toString(36).slice(2),
    amount,
    currency,
    description: description || 'Fee Payment',
    status: 'requires_payment_method',
    clientSecret: 'mock_client_secret_' + Math.random().toString(36).slice(2),
    metadata,
    createdAt: new Date().toISOString(),
  };
}

async function capturePayment({ paymentId }) {
  if (!paymentId) {
    const error = new Error('paymentId is required');
    error.statusCode = 400;
    throw error;
  }
  return {
    id: paymentId,
    status: 'succeeded',
    capturedAt: new Date().toISOString(),
  };
}

module.exports = { createPaymentIntent, capturePayment };