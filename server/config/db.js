const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (err) {
    console.error('❌ MongoDB connection error:', err.message);
    console.error('');
    console.error('👉 FIX: Go to MongoDB Atlas → Network Access → Add IP Address');
    console.error('   Add this IP to the whitelist: ' + (process.env.SERVER_IP || 'your current public IP'));
    console.error('   Or add 0.0.0.0/0 to allow all IPs (dev only)');
    console.error('');
    process.exit(1);
  }
};

module.exports = connectDB;
