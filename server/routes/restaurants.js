const router = require('express').Router();
const { getNearby, getAll, getById, create, update } = require('../controllers/restaurantController');
const { protect, authorize } = require('../middleware/auth');

router.get('/nearby', getNearby);
router.get('/', getAll);
router.get('/:id', getById);
router.post('/', protect, authorize('restaurant_owner'), create);
router.put('/:id', protect, authorize('restaurant_owner'), update);

module.exports = router;
