const Order = require('../models/Order');
const Cart = require('../models/Cart');
const { getIO } = require('../sockets');

exports.createOrder = async (req, res, next) => {
  try {
    const { deliveryAddress, deliveryLocation } = req.body;
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

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
      deliveryAddress,
      deliveryLocation,
      statusHistory: [{ status: 'PLACED', note: 'Order placed by customer' }]
    });

    // Clear cart after order
    await Cart.deleteOne({ user: req.user._id });

    // Emit to restaurant owner room
    const io = getIO();
    io.to(`restaurant_${cart.restaurant}`).emit('ORDER_CREATED', { order });
    io.to(`user_${req.user._id}`).emit('ORDER_CREATED', { order });

    res.status(201).json({ order });
  } catch (err) { next(err); }
};

exports.getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate('restaurant', 'name image')
      .sort({ createdAt: -1 });
    res.json({ orders });
  } catch (err) { next(err); }
};

exports.getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('restaurant', 'name image address phone')
      .populate('user', 'name phone')
      .populate('courier', 'name phone');
    if (!order) return res.status(404).json({ message: 'Order not found' });

    // Only allow involved parties
    const userId = req.user._id.toString();
    const isOwner = order.user._id.toString() === userId;
    const isCourier = order.courier?._id?.toString() === userId;
    if (!isOwner && !isCourier && req.user.role !== 'restaurant_owner') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    res.json({ order });
  } catch (err) { next(err); }
};

exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { status, note } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    order.status = status;
    order.statusHistory.push({ status, note: note || '' });
    await order.save();

    const io = getIO();
    const payload = { orderId: order._id, status, statusHistory: order.statusHistory };
    io.to(`user_${order.user}`).emit('ORDER_STATUS_UPDATED', payload);
    io.to(`restaurant_${order.restaurant}`).emit('ORDER_STATUS_UPDATED', payload);
    if (order.courier) io.to(`user_${order.courier}`).emit('ORDER_STATUS_UPDATED', payload);

    res.json({ order });
  } catch (err) { next(err); }
};
