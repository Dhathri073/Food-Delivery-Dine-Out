const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

let io;

const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || '*',
      methods: ['GET', 'POST'],
      credentials: true
    }
  });

  // Auth middleware for socket
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error('Authentication error'));
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');
      if (!user) return next(new Error('User not found'));
      socket.user = user;
      next();
    } catch (err) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    const user = socket.user;
    console.log(`Socket connected: ${user.name} (${user.role})`);

    // Join personal room
    socket.join(`user_${user._id}`);

    // Restaurant owners join their restaurant room
    socket.on('JOIN_RESTAURANT_ROOM', (restaurantId) => {
      if (user.role === 'restaurant_owner') {
        socket.join(`restaurant_${restaurantId}`);
        console.log(`Owner ${user.name} joined restaurant room: ${restaurantId}`);
      }
    });

    // Couriers join courier room
    socket.on('JOIN_COURIER_ROOM', () => {
      if (user.role === 'courier') {
        socket.join('couriers');
      }
    });

    // Customer tracking a specific order
    socket.on('TRACK_ORDER', (orderId) => {
      socket.join(`order_${orderId}`);
    });

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${user.name}`);
    });
  });

  return io;
};

const getIO = () => {
  if (!io) throw new Error('Socket.io not initialized');
  return io;
};

module.exports = { initSocket, getIO };
