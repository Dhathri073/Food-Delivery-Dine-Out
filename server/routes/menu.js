const router = require('express').Router();
const { addItem, updateItem, deleteItem, toggleAvailability } = require('../controllers/menuController');
const { protect, authorize } = require('../middleware/auth');

const owner = [protect, authorize('restaurant_owner')];

router.post('/:restaurantId/items', ...owner, addItem);
router.put('/:restaurantId/items/:itemId', ...owner, updateItem);
router.delete('/:restaurantId/items/:itemId', ...owner, deleteItem);
router.patch('/:restaurantId/items/:itemId/toggle', ...owner, toggleAvailability);

module.exports = router;
