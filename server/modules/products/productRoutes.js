const express = require('express');
const { createProduct, getProducts, getProductById, updateProduct, deleteProduct } = require('./productController');
const { protect, authorize, verifyFarmerStatus } = require('../../middleware/auth');
const { upload } = require('../../config/cloudinary');

const router = express.Router();

router.route('/')
  .post(protect, authorize('farmer'), verifyFarmerStatus, upload.array('images', 5), createProduct)
  .get(getProducts);

router.route('/:id')
  .get(getProductById)
  .put(protect, authorize('farmer'), verifyFarmerStatus, upload.array('images', 5), updateProduct)
  .delete(protect, authorize('farmer'), verifyFarmerStatus, deleteProduct);

module.exports = router;
