const Review = require('../models/Review');
const Order = require('../models/Order');
const Restaurant = require('../models/Restaurant');
const User = require('../models/User');
const { BONUS_KEYWORDS } = require('../models/Review');

exports.createReview = async (req, res, next) => {
  try {
    const { orderId, reviewText, rating } = req.body;

    const order = await Order.findOne({ _id: orderId, user: req.user._id, status: 'DELIVERED' });
    if (!order) return res.status(400).json({ message: 'Order not found or not delivered yet' });
    if (order.isReviewed) return res.status(400).json({ message: 'Order already reviewed' });

    const review = await Review.create({
      user: req.user._id,
      order: orderId,
      restaurant: order.restaurant,
      reviewText,
      rating
    });

    // Update order reviewed flag
    order.isReviewed = true;
    await order.save();

    // Update restaurant rating
    const allReviews = await Review.find({ restaurant: order.restaurant });
    const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
    await Restaurant.findByIdAndUpdate(order.restaurant, {
      rating: Math.round(avgRating * 10) / 10,
      ratingCount: allReviews.length
    });

    // Award points to user
    await User.findByIdAndUpdate(req.user._id, {
      $inc: { totalPoints: review.pointsEarned, reviewCount: 1 }
    });

    res.status(201).json({ review });
  } catch (err) { next(err); }
};

exports.getRestaurantReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ restaurant: req.params.restaurantId })
      .populate('user', 'name avatar')
      .sort({ createdAt: -1 })
      .limit(50);
    res.json({ reviews });
  } catch (err) { next(err); }
};

// AI Review Assistant - suggest prompts based on ordered items
exports.getReviewSuggestions = async (req, res, next) => {
  try {
    const order = await Order.findOne({ _id: req.params.orderId, user: req.user._id });
    if (!order) return res.status(404).json({ message: 'Order not found' });

    const itemNames = order.items.map(i => i.name.toLowerCase());
    const suggestions = [
      'How was the overall experience?',
      'Was the food delivered on time?',
      'How was the packaging?'
    ];

    // Item-specific suggestions
    if (itemNames.some(n => n.includes('pizza') || n.includes('burger') || n.includes('sandwich'))) {
      suggestions.push('Was the food hot and fresh when it arrived?');
      suggestions.push('How was the portion size?');
    }
    if (itemNames.some(n => n.includes('spicy') || n.includes('curry') || n.includes('chili'))) {
      suggestions.push('Was the food spicy enough to your liking?');
    }
    if (itemNames.some(n => n.includes('salad') || n.includes('veg') || n.includes('healthy'))) {
      suggestions.push('Were the vegetables fresh and crisp?');
    }
    if (itemNames.some(n => n.includes('dessert') || n.includes('cake') || n.includes('ice cream'))) {
      suggestions.push('How was the sweetness level?');
      suggestions.push('Was the dessert well-presented?');
    }

    suggestions.push(`Bonus keywords for extra points: ${BONUS_KEYWORDS.slice(0, 8).join(', ')}`);

    res.json({ suggestions, orderedItems: order.items.map(i => i.name) });
  } catch (err) { next(err); }
};
