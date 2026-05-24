const express = require('express');
const { createOrder, getBuyerOrders, getSellerOrders, updateOrderStatus } = require('./orderController');
const { protect, authorize } = require('../../middleware/auth');

const router = express.Router();

router.use(protect);

router.post('/', authorize('buyer'), createOrder);
router.get('/buyer', authorize('buyer'), getBuyerOrders);
router.get('/seller', authorize('farmer'), getSellerOrders);
router.patch('/:id/status', authorize('farmer', 'admin'), updateOrderStatus);

module.exports = router;
