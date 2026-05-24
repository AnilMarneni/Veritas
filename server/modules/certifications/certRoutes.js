const express = require('express');
const { submitCertification, getCertificationsByProduct } = require('./certController');
const { protect, authorize, verifyFarmerStatus } = require('../../middleware/auth');
const { upload } = require('../../config/cloudinary');

const router = express.Router();

router.post('/', protect, authorize('farmer'), verifyFarmerStatus, upload.single('certificateFile'), submitCertification);
router.get('/product/:productId', getCertificationsByProduct);

module.exports = router;
