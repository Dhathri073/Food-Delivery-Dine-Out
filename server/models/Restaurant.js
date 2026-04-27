const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, default: '' },
  price: { type: Number, required: true },
  category: { type: String, required: true },
  image: { type: String, default: '' },
  isAvailable: { type: Boolean, default: true },
  tags: [String]
}, { timestamps: true });

const restaurantSchema = new mongoose.Schema({
  name: { type: String, required: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  description: { type: String, default: '' },
  cuisine: [String],
  image: { type: String, default: '' },
  phone: { type: String, default: '' },
  address: { type: String, default: '' },
  // GeoJSON for 2dsphere index
  location: {
    type: { type: String, enum: ['Point'], required: true, default: 'Point' },
    coordinates: { type: [Number], required: true } // [longitude, latitude]
  },
  rating: { type: Number, default: 0, min: 0, max: 5 },
  ratingCount: { type: Number, default: 0 },
  menuItems: [menuItemSchema],
  isOpen: { type: Boolean, default: true },
  deliveryTime: { type: Number, default: 30 }, // minutes
  deliveryFee: { type: Number, default: 2.99 },
  minOrder: { type: Number, default: 10 }
}, { timestamps: true });

// 2dsphere index for geospatial queries
restaurantSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Restaurant', restaurantSchema);
