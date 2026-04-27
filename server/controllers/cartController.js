const Cart = require('../models/Cart');
const Restaurant = require('../models/Restaurant');

exports.getCart = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id }).populate('restaurant', 'name image deliveryFee');
    res.json({ cart: cart || { items: [], totalAmount: 0 } });
  } catch (err) { next(err); }
};

exports.addToCart = async (req, res, next) => {
  try {
    const { restaurantId, menuItemId, quantity = 1 } = req.body;

    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) return res.status(404).json({ message: 'Restaurant not found' });

    const menuItem = restaurant.menuItems.id(menuItemId);
    if (!menuItem || !menuItem.isAvailable) {
      return res.status(400).json({ message: 'Menu item not available' });
    }

    let cart = await Cart.findOne({ user: req.user._id });

    if (cart && cart.restaurant && cart.restaurant.toString() !== restaurantId) {
      return res.status(400).json({
        message: 'Cannot add items from multiple restaurants. Clear your cart first.',
        currentRestaurant: cart.restaurantName
      });
    }

    if (!cart) {
      cart = new Cart({ user: req.user._id, restaurant: restaurantId, restaurantName: restaurant.name, items: [] });
    }

    const existingItem = cart.items.find(i => i.menuItemId.toString() === menuItemId);
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.items.push({ menuItemId, name: menuItem.name, price: menuItem.price, quantity, image: menuItem.image });
    }

    cart.restaurant = restaurantId;
    cart.restaurantName = restaurant.name;
    cart.calculateTotal();
    await cart.save();
    res.json({ cart });
  } catch (err) { next(err); }
};

exports.updateCartItem = async (req, res, next) => {
  try {
    const { quantity } = req.body;
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.status(404).json({ message: 'Cart not found' });

    const item = cart.items.find(i => i.menuItemId.toString() === req.params.itemId);
    if (!item) return res.status(404).json({ message: 'Item not in cart' });

    if (quantity <= 0) {
      cart.items = cart.items.filter(i => i.menuItemId.toString() !== req.params.itemId);
    } else {
      item.quantity = quantity;
    }

    if (cart.items.length === 0) {
      await Cart.deleteOne({ user: req.user._id });
      return res.json({ cart: null });
    }

    cart.calculateTotal();
    await cart.save();
    res.json({ cart });
  } catch (err) { next(err); }
};

exports.clearCart = async (req, res, next) => {
  try {
    await Cart.deleteOne({ user: req.user._id });
    res.json({ message: 'Cart cleared' });
  } catch (err) { next(err); }
};
