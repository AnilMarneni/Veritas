const express = require('express');
const { requestFarmerVerification, updateProfile } = require('./userController');
const { protect, authorize } = require('../../middleware/auth');
const { upload } = require('../../config/cloudinary');

const router = express.Router();

// Handle farmer verification document uploads
router.post('/verification', protect, authorize('farmer'), upload.single('document'), requestFarmerVerification);

router.put('/profile', protect, updateProfile);

module.exports = router;
