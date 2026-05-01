const router = require('express').Router();
const {
  createPaymentIntent,
  confirmPayment,
  getPaymentByOrder,
  refundPayment,
  stripeWebhook
} = require('../controllers/paymentController');
const { protect } = require('../middleware/auth');

// Stripe webhook — must use raw body, no auth
router.post('/webhook', stripeWebhook);

// Protected routes
router.post('/create-intent', protect, createPaymentIntent);
router.post('/confirm', protect, confirmPayment);
router.get('/order/:orderId', protect, getPaymentByOrder);
router.post('/refund/:orderId', protect, refundPayment);

module.exports = router;
