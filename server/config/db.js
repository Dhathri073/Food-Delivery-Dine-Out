const mongoose = require('mongoose');

let isConnected = false;

const connectDB = async () => {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error('❌ MONGO_URI is not set in .env');
    process.exit(1);
  }

  const safeUri = uri.replace(/:([^@]+)@/, ':****@');
  console.log(`🔌 Connecting to MongoDB: ${safeUri}`);

  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 15000,
      socketTimeoutMS: 45000,
    });
    isConnected = true;
    console.log(`✅ MongoDB Connected: ${mongoose.connection.host}`);
  } catch (err) {
    console.error('❌ MongoDB connection failed:', err.message);
    if (err.message.includes('ECONNREFUSED') || err.message.includes('querySrv')) {
      console.error('');
      console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.error('FIX: Your IP is not whitelisted in MongoDB Atlas.');
      console.error('1. Go to https://cloud.mongodb.com');
      console.error('2. Network Access → Add IP Address → 0.0.0.0/0');
      console.error('3. Restart this server');
      console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    }
    // Don't exit — let server stay up so frontend gets a proper error message
  }
};

const checkDB = (req, res, next) => {
  if (!isConnected) {
    return res.status(503).json({
      message: 'Database not connected. Please check server logs and MongoDB Atlas IP whitelist.'
    });
  }
  next();
};

module.exports = connectDB;
module.exports.checkDB = checkDB;
