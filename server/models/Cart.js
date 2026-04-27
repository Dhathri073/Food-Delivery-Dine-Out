const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
  menuItemId: { type: mongoose.Schema.Types.ObjectId, required: true },
  name: String,
  price: Number,
  quantity: { type: Number, default: 1, min: 1 },
  image: String
});

const cartSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  restaurant: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant' },
  restaurantName: String,
  items: [cartItemSchema],
  totalAmount: { type: Number, default: 0 }
}, { timestamps: true });

cartSchema.methods.calculateTotal = function () {
  this.totalAmount = this.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  return this.totalAmount;
};

module.exports = mongoose.model('Cart', cartSchema);
