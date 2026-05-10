const Restaurant = require('../models/Restaurant');

exports.getNearby = async (req, res, next) => {
  try {
    const { lat, lng, radius = 10000, limit = 20, cuisine } = req.query;
    if (!lat || !lng) return res.status(400).json({ message: 'lat and lng are required' });

    const query = { isOpen: true };
    if (cuisine && cuisine.trim()) {
      query.cuisine = { $in: [cuisine] };
    }

    const restaurants = await Restaurant.aggregate([
      {
        $geoNear: {
          near: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] },
          distanceField: 'distance',
          maxDistance: parseInt(radius),
          spherical: true,
          query: query
        }
      },
      { $sort: { distance: 1, rating: -1 } },
      { $limit: parseInt(limit) },
      {
        $project: {
          name: 1, description: 1, cuisine: 1, image: 1,
          rating: 1, ratingCount: 1, deliveryTime: 1,
          deliveryFee: 1, minOrder: 1, address: 1, isOpen: 1,
          distance: { $round: ['$distance', 0] }
        }
      }
    ]);

    res.json({ restaurants, count: restaurants.length });
  } catch (err) { next(err); }
};

exports.getAll = async (req, res, next) => {
  try {
    const { cuisine, search, page = 1, limit = 12 } = req.query;
    const query = { isOpen: true };
    if (cuisine) query.cuisine = { $in: [cuisine] };
    if (search) query.name = { $regex: search, $options: 'i' };

    const restaurants = await Restaurant.find(query)
      .select('-menuItems')
      .sort({ rating: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Restaurant.countDocuments(query);
    res.json({ restaurants, total, page: parseInt(page), pages: Math.ceil(total / limit) });
  } catch (err) { next(err); }
};

exports.getById = async (req, res, next) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id).populate('owner', 'name email');
    if (!restaurant) return res.status(404).json({ message: 'Restaurant not found' });
    res.json({ restaurant });
  } catch (err) { next(err); }
};

exports.create = async (req, res, next) => {
  try {
    const restaurant = await Restaurant.create({ ...req.body, owner: req.user._id });
    res.status(201).json({ restaurant });
  } catch (err) { next(err); }
};

exports.update = async (req, res, next) => {
  try {
    const restaurant = await Restaurant.findOne({ _id: req.params.id, owner: req.user._id });
    if (!restaurant) return res.status(404).json({ message: 'Restaurant not found or unauthorized' });
    Object.assign(restaurant, req.body);
    await restaurant.save();
    res.json({ restaurant });
  } catch (err) { next(err); }
};
