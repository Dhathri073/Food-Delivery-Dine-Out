const mongoose = require('mongoose');

const PAYMENT_METHODS = ['card', 'cod']; // card = Stripe, cod = Cash on Delivery
const PAYMENT_STATUSES = ['pending', 'processing', 'succeeded', 'failed', 'refunded'];

const paymentSchema = new mongoose.Schema({
  order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true, unique: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  method: { type: String, enum: PAYMENT_METHODS, required: true },
  status: { type: String, enum: PAYMENT_STATUSES, default: 'pending' },
  amount: { type: Number, required: true }, // in dollars
  currency: { type: String, default: 'usd' },

  // Stripe fields (only for card payments)
  stripePaymentIntentId: { type: String, default: null },
  stripeClientSecret: { type: String, default: null },
  stripeChargeId: { type: String, default: null },

  // Receipt
  receiptUrl: { type: String, default: null },
  paidAt: { type: Date, default: null },
  failureReason: { type: String, default: null },

  // Refund
  refundId: { type: String, default: null },
  refundedAt: { type: Date, default: null },
  refundAmount: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Payment', paymentSchema);
