const Restaurant = require('../models/Restaurant');

/**
 * Get nearby restaurants based on user coordinates
 * Uses geospatial queries with MongoDB 2dsphere index
 * Returns: restaurants sorted by distance (nearest first)
 */
exports.getNearby = async (req, res, next) => {
  try {
    const { lat, lng, radius = 5000, limit = 20, cuisine } = req.query;
    
    // Validate required parameters
    if (!lat || !lng) {
      return res.status(400).json({ 
        message: 'Latitude and longitude are required' 
      });
    }

    // Validate coordinates
    const latNum = parseFloat(lat);
    const lngNum = parseFloat(lng);
    const radiusNum = parseInt(radius);
    const limitNum = parseInt(limit);

    if (isNaN(latNum) || isNaN(lngNum) || latNum < -90 || latNum > 90 || lngNum < -180 || lngNum > 180) {
      return res.status(400).json({ 
        message: 'Invalid latitude/longitude values' 
      });
    }

    const query = { isOpen: true };
    
    // Add cuisine filter if provided
    if (cuisine && cuisine.trim()) {
      query.cuisine = { $in: [cuisine] };
    }

    // Use $geoNear aggregation for accurate distance calculation
    const restaurants = await Restaurant.aggregate([
      {
        $geoNear: {
          near: { 
            type: 'Point', 
            coordinates: [lngNum, latNum] // GeoJSON format: [longitude, latitude]
          },
          distanceField: 'distance', // Distance in meters
          maxDistance: radiusNum, // Max distance in meters
          spherical: true, // Use spherical geometry (Earth is round)
          query: query
        }
      },
      { 
        $sort: { 
          distance: 1,    // Sort by distance (nearest first)
          rating: -1      // Then by rating (highest first)
        } 
      },
      { 
        $limit: limitNum 
      },
      {
        $project: {
          _id: 1,
          name: 1, 
          description: 1, 
          cuisine: 1, 
          image: 1,
          rating: 1, 
          ratingCount: 1, 
          deliveryTime: 1,
          deliveryFee: 1, 
          minOrder: 1, 
          address: 1, 
          isOpen: 1,
          phone: 1,
          location: 1,
          createdAt: 1,
          updatedAt: 1,
          distance: { $round: ['$distance', 0] } // Round to nearest meter
        }
      }
    ]);

    res.json({ 
      restaurants, 
      count: restaurants.length,
      meta: {
        center: { lat: latNum, lng: lngNum },
        radius: radiusNum,
        accuracy: 'meters'
      }
    });
  } catch (err) { 
    next(err); 
  }
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
