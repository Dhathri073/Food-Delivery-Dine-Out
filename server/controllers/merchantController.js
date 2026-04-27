const Order = require('../models/Order');
const Restaurant = require('../models/Restaurant');
const { getIO } = require('../sockets');

exports.getMyRestaurant = async (req, res, next) => {
  try {
    const restaurant = await Restaurant.findOne({ owner: req.user._id });
    if (!restaurant) return res.status(404).json({ message: 'No restaurant found' });
    res.json({ restaurant });
  } catch (err) { next(err); }
};

exports.getRestaurantOrders = async (req, res, next) => {
  try {
    const restaurant = await Restaurant.findOne({ owner: req.user._id });
    if (!restaurant) return res.status(404).json({ message: 'No restaurant found' });

    const { status, page = 1, limit = 20 } = req.query;
    const query = { restaurant: restaurant._id };
    if (status) query.status = status;

    const orders = await Order.find(query)
      .populate('user', 'name phone')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({ orders });
  } catch (err) { next(err); }
};

exports.acceptOrder = async (req, res, next) => {
  try {
    const restaurant = await Restaurant.findOne({ owner: req.user._id });
    const order = await Order.findOne({ _id: req.params.orderId, restaurant: restaurant._id, status: 'PLACED' });
    if (!order) return res.status(404).json({ message: 'Order not found or already processed' });

    order.status = 'ACCEPTED';
    order.statusHistory.push({ status: 'ACCEPTED', note: 'Order accepted by restaurant' });
    order.estimatedDelivery = new Date(Date.now() + 45 * 60 * 1000); // 45 min estimate
    await order.save();

    const io = getIO();
    io.to(`user_${order.user}`).emit('ORDER_ACCEPTED', { orderId: order._id, estimatedDelivery: order.estimatedDelivery });
    io.to(`restaurant_${restaurant._id}`).emit('ORDER_STATUS_UPDATED', { orderId: order._id, status: 'ACCEPTED' });

    res.json({ order });
  } catch (err) { next(err); }
};

exports.rejectOrder = async (req, res, next) => {
  try {
    const restaurant = await Restaurant.findOne({ owner: req.user._id });
    const order = await Order.findOne({ _id: req.params.orderId, restaurant: restaurant._id, status: 'PLACED' });
    if (!order) return res.status(404).json({ message: 'Order not found' });

    order.status = 'CANCELLED';
    order.statusHistory.push({ status: 'CANCELLED', note: req.body.reason || 'Rejected by restaurant' });
    await order.save();

    const io = getIO();
    io.to(`user_${order.user}`).emit('ORDER_STATUS_UPDATED', { orderId: order._id, status: 'CANCELLED' });

    res.json({ order });
  } catch (err) { next(err); }
};

exports.getRevenueSummary = async (req, res, next) => {
  try {
    const restaurant = await Restaurant.findOne({ owner: req.user._id });
    if (!restaurant) return res.status(404).json({ message: 'No restaurant found' });

    const today = new Date(); today.setHours(0, 0, 0, 0);
    const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const [todayStats, monthStats, totalStats] = await Promise.all([
      Order.aggregate([
        { $match: { restaurant: restaurant._id, status: 'DELIVERED', createdAt: { $gte: today } } },
        { $group: { _id: null, revenue: { $sum: '$totalAmount' }, count: { $sum: 1 } } }
      ]),
      Order.aggregate([
        { $match: { restaurant: restaurant._id, status: 'DELIVERED', createdAt: { $gte: thisMonth } } },
        { $group: { _id: null, revenue: { $sum: '$totalAmount' }, count: { $sum: 1 } } }
      ]),
      Order.aggregate([
        { $match: { restaurant: restaurant._id, status: 'DELIVERED' } },
        { $group: { _id: null, revenue: { $sum: '$totalAmount' }, count: { $sum: 1 } } }
      ])
    ]);

    res.json({
      today: todayStats[0] || { revenue: 0, count: 0 },
      thisMonth: monthStats[0] || { revenue: 0, count: 0 },
      total: totalStats[0] || { revenue: 0, count: 0 },
      restaurant: { name: restaurant.name, rating: restaurant.rating }
    });
  } catch (err) { next(err); }
};
