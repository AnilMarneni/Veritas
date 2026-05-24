const express = require('express');
const { getPendingFarmers, verifyFarmer, getPendingCertifications, verifyCertification, toggleProductVisibility } = require('./adminController');
const { protect, authorize } = require('../../middleware/auth');

const router = express.Router();

// Enforce auth and admin role for all sub-routes
router.use(protect);
router.use(authorize('admin'));

router.get('/kyc', getPendingFarmers);
router.put('/kyc/:id', verifyFarmer);

router.get('/certifications', getPendingCertifications);
router.put('/certifications/:id', verifyCertification);

router.put('/products/:productId/toggle', toggleProductVisibility);

module.exports = router;
