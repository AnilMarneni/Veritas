const User = require('../users/User');
const Certification = require('../certifications/Certification');
const Product = require('../products/Product');

// @desc    Get all pending farmer verification requests
// @route   GET /api/v1/admin/verification
// @access  Private (Admin)
exports.getPendingFarmers = async (req, res, next) => {
  try {
    const pendingFarmers = await User.find({
      role: 'farmer',
      farmerVerificationStatus: 'pending'
    }).select('-password');

    res.status(200).json({
      success: true,
      count: pendingFarmers.length,
      data: pendingFarmers
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Approve or reject farmer verification
// @route   PUT /api/v1/admin/verification/:id
// @access  Private (Admin)
exports.verifyFarmer = async (req, res, next) => {
  try {
    const { status } = req.body; // 'verified' or 'rejected'
    if (!['verified', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, error: 'Invalid verification status option' });
    }

    const user = await User.findById(req.params.id);
    if (!user || user.role !== 'farmer') {
      return res.status(404).json({ success: false, error: 'Farmer profile not found' });
    }

    user.farmerVerificationStatus = status;
    await user.save();

    res.status(200).json({
      success: true,
      message: `Farmer status successfully updated to ${status}`,
      data: {
        id: user._id,
        email: user.email,
        farmerVerificationStatus: user.farmerVerificationStatus
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all pending product certifications
// @route   GET /api/v1/admin/certifications
// @access  Private (Admin)
exports.getPendingCertifications = async (req, res, next) => {
  try {
    const pendingCerts = await Certification.find({ status: 'pending' })
      .populate('product', 'name sku')
      .populate('farmer', 'profile.firstName profile.lastName profile.companyName');

    res.status(200).json({
      success: true,
      count: pendingCerts.length,
      data: pendingCerts
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Approve or reject a product certification
// @route   PUT /api/v1/admin/certifications/:id
// @access  Private (Admin)
exports.verifyCertification = async (req, res, next) => {
  try {
    const { status, reviewNotes } = req.body; // 'approved' or 'rejected'
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, error: 'Invalid status option' });
    }

    let certification = await Certification.findById(req.params.id);
    if (!certification) {
      return res.status(404).json({ success: false, error: 'Certification document not found' });
    }

    certification.status = status;
    certification.reviewedBy = req.user._id;
    if (reviewNotes) {
      certification.reviewNotes = reviewNotes;
    }

    await certification.save();

    // If approved, update the product flag organicCertified or similar based on certification type
    if (status === 'approved') {
      const type = certification.certificationType.toLowerCase();
      const updateData = {};
      if (type.includes('organic')) {
        updateData.organicCertified = true;
      }
      if (type.includes('gmo')) {
        updateData.gmoFree = true;
      }

      await Product.findByIdAndUpdate(certification.product, updateData);
    }

    res.status(200).json({
      success: true,
      message: `Certification successfully ${status}`,
      data: certification
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Deactivate or modify any product status (moderation toggle)
// @route   PUT /api/v1/admin/products/:productId/toggle
// @access  Private (Admin)
exports.toggleProductVisibility = async (req, res, next) => {
  try {
    const { status } = req.body; // 'active' or 'inactive'
    if (!['active', 'inactive'].includes(status)) {
      return res.status(400).json({ success: false, error: 'Invalid status option' });
    }

    const product = await Product.findByIdAndUpdate(req.params.productId, { status }, { new: true });
    if (!product) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }

    res.status(200).json({
      success: true,
      message: `Product status successfully toggled to ${status}`,
      data: product
    });
  } catch (error) {
    next(error);
  }
};
