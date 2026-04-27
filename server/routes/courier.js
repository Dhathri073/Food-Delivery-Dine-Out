const router = require('express').Router();
const { getAvailableDeliveries, acceptDelivery, markDelivered, getMyDeliveries, updateLocation } = require('../controllers/courierController');
const { protect, authorize } = require('../middleware/auth');

const courier = [protect, authorize('courier')];

router.get('/available', ...courier, getAvailableDeliveries);
router.patch('/:orderId/accept', ...courier, acceptDelivery);
router.patch('/:orderId/delivered', ...courier, markDelivered);
router.get('/my-deliveries', ...courier, getMyDeliveries);
router.post('/location', ...courier, updateLocation);

module.exports = router;
