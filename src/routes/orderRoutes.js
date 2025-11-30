const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/authMiddleware');
const orderController = require('../controllers/orderController');

router.post('/', protect, orderController.placeOrder);
router.get('/my', protect, orderController.getMyOrders);
router.get('/', protect, adminOnly, orderController.getAllOrders);

module.exports = router;
