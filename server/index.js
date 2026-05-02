require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const connectDB = require('./config/db');
const { checkDB } = require('./config/db');
const { initSocket } = require('./sockets');
const errorHandler = require('./middleware/errorHandler');

const missing = ['MONGO_URI', 'JWT_SECRET'].filter(k => !process.env[k]);
if (missing.length) {
  console.error(`❌ Missing env vars: ${missing.join(', ')} — check server/.env`);
  process.exit(1);
}

const app = express();
const server = http.createServer(app);

connectDB();
initSocket(server);

app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:3000', credentials: true }));

// ⚠️ Stripe webhook needs raw body — must be BEFORE express.json()
app.post(
  '/api/payment/webhook',
  express.raw({ type: 'application/json' }),
  require('./routes/payment').stripeWebhook || ((req, res) => res.json({ received: true }))
);

app.use(express.json());

app.get('/health', (req, res) => res.json({ status: 'OK', timestamp: new Date() }));

app.use('/api', checkDB);
app.use('/api/auth', require('./routes/auth'));
app.use('/api/restaurants', require('./routes/restaurants'));
app.use('/api/menu', require('./routes/menu'));
app.use('/api/cart', require('./routes/cart'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/payment', require('./routes/payment'));
app.use('/api/reviews', require('./routes/reviews'));
app.use('/api/courier', require('./routes/courier'));
app.use('/api/merchant', require('./routes/merchant'));

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
