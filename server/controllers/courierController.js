const Order = require('../models/Order');
const User = require('../models/User');
const { getIO } = require('../sockets');

exports.getAvailableDeliveries = async (req, res, next) => {
  try {
    const orders = await Order.find({ status: 'PREPARING', courier: null })
      .populate('restaurant', 'name address location')
      .populate('user', 'name phone')
      .sort({ createdAt: 1 });
    res.json({ orders });
  } catch (err) { next(err); }
};

exports.acceptDelivery = async (req, res, next) => {
  try {
    const order = await Order.findOne({ _id: req.params.orderId, status: 'PREPARING', courier: null });
    if (!order) return res.status(400).json({ message: 'Order not available for pickup' });

    order.courier = req.user._id;
    order.status = 'OUT_FOR_DELIVERY';
    order.statusHistory.push({ status: 'OUT_FOR_DELIVERY', note: 'Courier picked up the order' });
    await order.save();

    const io = getIO();
    io.to(`user_${order.user}`).emit('ORDER_STATUS_UPDATED', {
      orderId: order._id, status: 'OUT_FOR_DELIVERY',
      courier: { name: req.user.name, phone: req.user.phone }
    });
    io.to(`restaurant_${order.restaurant}`).emit('ORDER_STATUS_UPDATED', { orderId: order._id, status: 'OUT_FOR_DELIVERY' });

    res.json({ order });
  } catch (err) { next(err); }
};

exports.markDelivered = async (req, res, next) => {
  try {
    const order = await Order.findOne({ _id: req.params.orderId, courier: req.user._id, status: 'OUT_FOR_DELIVERY' });
    if (!order) return res.status(404).json({ message: 'Order not found' });

    order.status = 'DELIVERED';
    order.statusHistory.push({ status: 'DELIVERED', note: 'Delivered by courier' });
    await order.save();

    const io = getIO();
    io.to(`user_${order.user}`).emit('ORDER_STATUS_UPDATED', { orderId: order._id, status: 'DELIVERED' });
    io.to(`restaurant_${order.restaurant}`).emit('ORDER_STATUS_UPDATED', { orderId: order._id, status: 'DELIVERED' });

    res.json({ order });
  } catch (err) { next(err); }
};

exports.getMyDeliveries = async (req, res, next) => {
  try {
    const orders = await Order.find({ courier: req.user._id })
      .populate('restaurant', 'name address')
      .populate('user', 'name phone')
      .sort({ createdAt: -1 });
    res.json({ orders });
  } catch (err) { next(err); }
};

exports.updateLocation = async (req, res, next) => {
  try {
    const { lat, lng } = req.body;
    await User.findByIdAndUpdate(req.user._id, {
      currentLocation: { type: 'Point', coordinates: [lng, lat] },
      isAvailable: true
    });
    res.json({ message: 'Location updated' });
  } catch (err) { next(err); }
};
