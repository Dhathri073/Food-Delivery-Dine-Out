const router = require('express').Router();
const { createReview, getRestaurantReviews, getReviewSuggestions } = require('../controllers/reviewController');
const { protect } = require('../middleware/auth');

router.post('/', protect, createReview);
router.get('/restaurant/:restaurantId', getRestaurantReviews);
router.get('/suggestions/:orderId', protect, getReviewSuggestions);

module.exports = router;
