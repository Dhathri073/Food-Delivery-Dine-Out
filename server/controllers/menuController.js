const Restaurant = require('../models/Restaurant');

exports.addItem = async (req, res, next) => {
  try {
    const restaurant = await Restaurant.findOne({ _id: req.params.restaurantId, owner: req.user._id });
    if (!restaurant) return res.status(404).json({ message: 'Restaurant not found or unauthorized' });
    restaurant.menuItems.push(req.body);
    await restaurant.save();
    res.status(201).json({ menuItem: restaurant.menuItems[restaurant.menuItems.length - 1] });
  } catch (err) { next(err); }
};

exports.updateItem = async (req, res, next) => {
  try {
    const restaurant = await Restaurant.findOne({ _id: req.params.restaurantId, owner: req.user._id });
    if (!restaurant) return res.status(404).json({ message: 'Restaurant not found or unauthorized' });
    const item = restaurant.menuItems.id(req.params.itemId);
    if (!item) return res.status(404).json({ message: 'Menu item not found' });
    Object.assign(item, req.body);
    await restaurant.save();
    res.json({ menuItem: item });
  } catch (err) { next(err); }
};

exports.deleteItem = async (req, res, next) => {
  try {
    const restaurant = await Restaurant.findOne({ _id: req.params.restaurantId, owner: req.user._id });
    if (!restaurant) return res.status(404).json({ message: 'Restaurant not found or unauthorized' });
    restaurant.menuItems.pull({ _id: req.params.itemId });
    await restaurant.save();
    res.json({ message: 'Menu item removed' });
  } catch (err) { next(err); }
};

exports.toggleAvailability = async (req, res, next) => {
  try {
    const restaurant = await Restaurant.findOne({ _id: req.params.restaurantId, owner: req.user._id });
    if (!restaurant) return res.status(404).json({ message: 'Restaurant not found or unauthorized' });
    const item = restaurant.menuItems.id(req.params.itemId);
    if (!item) return res.status(404).json({ message: 'Menu item not found' });
    item.isAvailable = !item.isAvailable;
    await restaurant.save();
    res.json({ menuItem: item });
  } catch (err) { next(err); }
};
