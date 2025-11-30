const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const cartController = require('../controllers/cartController');

// GET /api/cart  — user's cart
router.get('/', protect, cartController.getCart);
// POST /api/cart/add  — add or increase quantity
router.post('/add', protect, cartController.addToCart);
// DELETE /api/cart/remove  — decrease quantity or remove item
router.delete('/remove', protect, cartController.removeFromCart);
// DELETE /api/cart/clear  — clear entire cart
router.delete('/clear', protect, cartController.clearCart);

module.exports = router;
