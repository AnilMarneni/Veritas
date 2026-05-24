const express = require('express');
const { recordStage, verifyProduct, getQRCode, getProductScans } = require('./traceController');
const { protect, authorize } = require('../../middleware/auth');

const router = express.Router();

// Public route for QR code scans
router.get('/verify/:productId', verifyProduct);

// Protected routes for farmers/admins
router.post('/record', protect, authorize('farmer'), recordStage);
router.get('/qr/:productId', protect, authorize('farmer', 'admin'), getQRCode);
router.get('/scans/:productId', protect, authorize('farmer', 'admin'), getProductScans);

module.exports = router;
