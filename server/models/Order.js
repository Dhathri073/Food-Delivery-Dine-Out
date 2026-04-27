const mongoose = require('mongoose');

const ORDER_STATES = ['PLACED', 'ACCEPTED', 'PREPARING', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'];

const orderItemSchema = new mongoose.Schema({
  menuItemId: mongoose.Schema.Types.ObjectId,
  name: String,
  price: Number,
  quantity: Number
});

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  restaurant: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true },
  restaurantName: String,
  courier: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  items: [orderItemSchema],
  status: { type: String, enum: ORDER_STATES, default: 'PLACED' },
  totalAmount: { type: Number, required: true },
  deliveryFee: { type: Number, default: 2.99 },
  deliveryAddress: { type: String, required: true },
  deliveryLocation: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: [Number]
  },
  statusHistory: [{
    status: String,
    timestamp: { type: Date, default: Date.now },
    note: String
  }],
  estimatedDelivery: Date,
  isReviewed: { type: Boolean, default: false }
}, { timestamps: true });

orderSchema.index({ deliveryLocation: '2dsphere' });

module.exports = mongoose.model('Order', orderSchema);
module.exports.ORDER_STATES = ORDER_STATES;
