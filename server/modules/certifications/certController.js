const Certification = require('./Certification');
const Product = require('../products/Product');

// @desc    Submit a new product certification
// @route   POST /api/v1/certifications
// @access  Private (Farmer)
exports.submitCertification = async (req, res, next) => {
  try {
    const { product, certificationType, certificateNumber, issuingAuthority, expiryDate } = req.body;

    // Check if product exists and belongs to the farmer
    const productRecord = await Product.findById(product);
    if (!productRecord) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }

    if (productRecord.farmer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, error: 'Not authorized to certify this product' });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, error: 'Please upload the certificate document' });
    }

    const documentUrl = req.file.path || `/uploads/${req.file.filename}`;

    const certification = await Certification.create({
      product,
      farmer: req.user._id,
      certificationType,
      certificateNumber,
      issuingAuthority,
      expiryDate,
      certificateUrl: documentUrl,
      status: 'pending' // default is pending approval by admin
    });

    res.status(201).json({
      success: true,
      data: certification
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all verified certifications for a product
// @route   GET /api/v1/certifications/product/:productId
// @access  Public
exports.getCertificationsByProduct = async (req, res, next) => {
  try {
    const certifications = await Certification.find({
      product: req.params.productId,
      status: 'approved'
    }).populate('reviewedBy', 'profile.firstName profile.lastName');

    res.status(200).json({
      success: true,
      data: certifications
    });
  } catch (error) {
    next(error);
  }
};
