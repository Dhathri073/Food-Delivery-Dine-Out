const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Payment = require('../models/Payment');
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const { getIO } = require('../sockets');

// ─── Step 1: Create order + payment intent ───────────────────────────────────
exports.createPaymentIntent = async (req, res, next) => {
  try {
    const { deliveryAddress, deliveryLocation, paymentMethod = 'card' } = req.body;

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    const deliveryFee = 2.99;
    const taxes = parseFloat((cart.totalAmount * 0.05).toFixed(2));
    const grandTotal = parseFloat((cart.totalAmount + deliveryFee + taxes).toFixed(2));

    // Create order in PENDING_PAYMENT state
    const order = await Order.create({
      user: req.user._id,
      restaurant: cart.restaurant,
      restaurantName: cart.restaurantName,
      items: cart.items.map(i => ({
        menuItemId: i.menuItemId,
        name: i.name,
        price: i.price,
        quantity: i.quantity
      })),
      totalAmount: cart.totalAmount,
      deliveryFee,
      taxes,
      grandTotal,
      deliveryAddress,
      deliveryLocation: deliveryLocation || { type: 'Point', coordinates: [0, 0] },
      paymentMethod,
      paymentStatus: 'pending',
      status: 'PENDING_PAYMENT',
      statusHistory: [{ status: 'PENDING_PAYMENT', note: 'Awaiting payment' }]
    });

    // ── COD: no Stripe needed ──────────────────────────────────────────────
    if (paymentMethod === 'cod') {
      const payment = await Payment.create({
        order: order._id,
        user: req.user._id,
        method: 'cod',
        status: 'pending',
        amount: grandTotal
      });

      order.payment = payment._id;
      order.status = 'PLACED';
      order.paymentStatus = 'pending'; // paid on delivery
      order.statusHistory.push({ status: 'PLACED', note: 'Cash on delivery order placed' });
      await order.save();

      // Ensure we clear the specific cart for this user
      await Cart.findOneAndDelete({ user: req.user._id });

      const io = getIO();
      if (io) {
        io.to(`restaurant_${cart.restaurant}`).emit('ORDER_CREATED', { order });
        io.to(`user_${req.user._id}`).emit('ORDER_CREATED', { order });
      }

      return res.status(201).json({ order, payment, paymentMethod: 'cod' });
    }

    // ── Card: create Stripe PaymentIntent ─────────────────────────────────
    const amountInCents = Math.round(grandTotal * 100);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: 'usd',
      metadata: {
        orderId: order._id.toString(),
        userId: req.user._id.toString(),
        restaurantName: cart.restaurantName
      },
      description: `FoodHub order from ${cart.restaurantName}`
    });

    const payment = await Payment.create({
      order: order._id,
      user: req.user._id,
      method: 'card',
      status: 'processing',
      amount: grandTotal,
      stripePaymentIntentId: paymentIntent.id,
      stripeClientSecret: paymentIntent.client_secret
    });

    order.payment = payment._id;
    await order.save();

    res.status(201).json({
      order,
      payment,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    });
  } catch (err) { next(err); }
};

// ─── Step 2: Confirm card payment (called after Stripe confirms on frontend) ──
exports.confirmPayment = async (req, res, next) => {
  try {
    const { paymentIntentId } = req.body;

    const payment = await Payment.findOne({ stripePaymentIntentId: paymentIntentId });
    if (!payment) return res.status(404).json({ message: 'Payment not found' });

    // Verify with Stripe
    const intent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (intent.status === 'succeeded') {
      payment.status = 'succeeded';
      payment.paidAt = new Date();
      payment.stripeChargeId = intent.latest_charge;
      if (intent.latest_charge) {
        const charge = await stripe.charges.retrieve(intent.latest_charge);
        payment.receiptUrl = charge.receipt_url;
      }
      await payment.save();

      const order = await Order.findById(payment.order);
      order.status = 'PLACED';
      order.paymentStatus = 'paid';
      order.statusHistory.push({ status: 'PLACED', note: 'Payment confirmed via card' });
      await order.save();

      // Clear cart
      await Cart.findOneAndDelete({ user: req.user._id });

      const io = getIO();
      if (io) {
        io.to(`restaurant_${order.restaurant}`).emit('ORDER_CREATED', { order });
        io.to(`user_${req.user._id}`).emit('ORDER_CREATED', { order });
      }

      return res.json({ success: true, order, payment });
    }

    if (intent.status === 'payment_failed') {
      payment.status = 'failed';
      payment.failureReason = intent.last_payment_error?.message || 'Payment failed';
      await payment.save();

      const order = await Order.findById(payment.order);
      order.status = 'CANCELLED';
      order.paymentStatus = 'failed';
      order.statusHistory.push({ status: 'CANCELLED', note: 'Payment failed' });
      await order.save();

      return res.status(400).json({ success: false, message: payment.failureReason });
    }

    res.json({ success: false, message: `Payment status: ${intent.status}` });
  } catch (err) { next(err); }
};

// ─── Get payment details for an order ────────────────────────────────────────
exports.getPaymentByOrder = async (req, res, next) => {
  try {
    const order = await Order.findOne({ _id: req.params.orderId, user: req.user._id });
    if (!order) return res.status(404).json({ message: 'Order not found' });

    const payment = await Payment.findOne({ order: req.params.orderId });
    if (!payment) return res.status(404).json({ message: 'Payment not found' });

    res.json({ payment });
  } catch (err) { next(err); }
};

// ─── Refund ───────────────────────────────────────────────────────────────────
exports.refundPayment = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findOne({ _id: orderId, user: req.user._id });
    if (!order) return res.status(404).json({ message: 'Order not found' });

    const payment = await Payment.findOne({ order: orderId });
    if (!payment) return res.status(404).json({ message: 'Payment not found' });

    if (payment.method === 'cod') {
      return res.status(400).json({ message: 'COD orders cannot be refunded online' });
    }
    if (payment.status !== 'succeeded') {
      return res.status(400).json({ message: 'Only successful payments can be refunded' });
    }

    const refund = await stripe.refunds.create({
      payment_intent: payment.stripePaymentIntentId,
      reason: 'requested_by_customer'
    });

    payment.status = 'refunded';
    payment.refundId = refund.id;
    payment.refundedAt = new Date();
    payment.refundAmount = refund.amount / 100;
    await payment.save();

    order.paymentStatus = 'refunded';
    order.status = 'CANCELLED';
    order.statusHistory.push({ status: 'CANCELLED', note: 'Refund issued' });
    await order.save();

    res.json({ success: true, refund, payment });
  } catch (err) { next(err); }
};

// ─── Stripe Webhook (raw body required) ──────────────────────────────────────
exports.stripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const intent = event.data.object;
        await Payment.findOneAndUpdate(
          { stripePaymentIntentId: intent.id },
          { status: 'succeeded', paidAt: new Date() }
        );
        break;
      }
      case 'payment_intent.payment_failed': {
        const intent = event.data.object;
        await Payment.findOneAndUpdate(
          { stripePaymentIntentId: intent.id },
          { status: 'failed', failureReason: intent.last_payment_error?.message }
        );
        break;
      }
    }
    res.json({ received: true });
  } catch (err) {
    console.error('Webhook handler error:', err);
    res.status(500).json({ error: 'Webhook handler failed' });
  }
};
