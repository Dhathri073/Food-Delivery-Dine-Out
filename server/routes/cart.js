const router = require('express').Router();
const { getCart, addToCart, updateCartItem, clearCart } = require('../controllers/cartController');
const { protect } = require('../middleware/auth');

router.get('/', protect, getCart);
router.post('/add', protect, addToCart);
router.put('/item/:itemId', protect, updateCartItem);
router.delete('/clear', protect, clearCart);

module.exports = router;
