const User = require('./User');

// @desc    Submit farmer verification document
// @route   POST /api/v1/users/verification
// @access  Private (Farmer)
exports.requestFarmerVerification = async (req, res, next) => {
  try {
    if (req.user.role !== 'farmer') {
      return res.status(403).json({ success: false, error: 'Only farmers can submit verification requests' });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, error: 'Please upload a verification document (image or PDF)' });
    }

    // CloudinaryStorage sets req.file.path to the HTTPS URL. Multer disk storage sets it to local filepath.
    const fileUrl = req.file.path || `/uploads/${req.file.filename}`;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        farmerVerificationStatus: 'pending',
        verificationDocumentUrl: fileUrl
      },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: 'Farmer verification document submitted successfully. Verification status is pending.',
      data: {
        farmerVerificationStatus: user.farmerVerificationStatus,
        verificationDocumentUrl: user.verificationDocumentUrl
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile & address details
// @route   PUT /api/v1/users/profile
// @access  Private
exports.updateProfile = async (req, res, next) => {
  try {
    const { firstName, lastName, phone, companyName, address } = req.body;

    const updates = {
      profile: {
        firstName: firstName || req.user.profile.firstName,
        lastName: lastName || req.user.profile.lastName,
        phone: phone || req.user.profile.phone,
        companyName: companyName || req.user.profile.companyName,
        address: address || req.user.profile.address
      }
    };

    const user = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
      runValidators: true
    }).select('-password');

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};
