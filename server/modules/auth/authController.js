const jwt = require('jsonwebtoken');
const User = require('../users/User');

const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET || 'veritas_secret_key_for_jwt_session_signing_123', {
    expiresIn: '24h'
  });
};

// @desc    Register a new user
// @route   POST /api/v1/auth/register
// @access  Public
exports.register = async (req, res, next) => {
  try {
    const { email, password, role, firstName, lastName, phone, companyName, address } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, error: 'User already exists with this email address' });
    }

    // Role safety validation
    if (role && !['farmer', 'buyer'].includes(role)) {
      return res.status(400).json({ success: false, error: 'Invalid role selection' });
    }

    // Create user
    const user = await User.create({
      email,
      password,
      role,
      profile: {
        firstName,
        lastName,
        phone,
        companyName,
        address
      },
      // Farmer verification status starts as "none"
      farmerVerificationStatus: role === 'farmer' ? 'none' : 'none'
    });

    const token = generateToken(user._id, user.role);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        profile: user.profile,
        farmerVerificationStatus: user.farmerVerificationStatus
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/v1/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Please provide email and password' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid login credentials' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, error: 'Invalid login credentials' });
    }

    if (user.status !== 'active') {
      return res.status(403).json({ success: false, error: 'Your account is suspended or inactive' });
    }

    const token = generateToken(user._id, user.role);

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        profile: user.profile,
        farmerVerificationStatus: user.farmerVerificationStatus
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user profile
// @route   GET /api/v1/auth/profile
// @access  Private
exports.getProfile = async (req, res, next) => {
  try {
    res.status(200).json({
      success: true,
      data: req.user
    });
  } catch (error) {
    next(error);
  }
};
