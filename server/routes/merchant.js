const router = require('express').Router();
const { getMyRestaurant, getRestaurantOrders, acceptOrder, rejectOrder, getRevenueSummary } = require('../controllers/merchantController');
const { protect, authorize } = require('../middleware/auth');

const owner = [protect, authorize('restaurant_owner')];

router.get('/restaurant', ...owner, getMyRestaurant);
router.get('/orders', ...owner, getRestaurantOrders);
router.patch('/orders/:orderId/accept', ...owner, acceptOrder);
router.patch('/orders/:orderId/reject', ...owner, rejectOrder);
router.get('/revenue', ...owner, getRevenueSummary);

module.exports = router;
