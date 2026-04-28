require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const connectDB = require('./config/db');
const { initSocket } = require('./sockets');
const errorHandler = require('./middleware/errorHandler');

if (!process.env.JWT_SECRET) {
  console.error('❌ Missing JWT_SECRET environment variable.');
  console.error('Please create a .env file from .env.example and set JWT_SECRET.');
  process.exit(1);
}

const app = express();
const server = http.createServer(app);

// Connect Database
connectDB();

// Init Socket.io
initSocket(server);

// Middleware
app.use(cors({ origin: process.env.CLIENT_URL || '*', credentials: true }));
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/restaurants', require('./routes/restaurants'));
app.use('/api/menu', require('./routes/menu'));
app.use('/api/cart', require('./routes/cart'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/reviews', require('./routes/reviews'));
app.use('/api/courier', require('./routes/courier'));
app.use('/api/merchant', require('./routes/merchant'));

app.get('/health', (req, res) => res.json({ status: 'OK', timestamp: new Date() }));

// Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
