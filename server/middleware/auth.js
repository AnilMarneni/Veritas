const jwt = require('jsonwebtoken');
const User = require('../modules/users/User');

// Middleware to verify standard JWT presence and authenticity
const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ success: false, error: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'veritas_secret_key_for_jwt_session_signing_123');
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    if (user.status !== 'active') {
      return res.status(403).json({ success: false, error: 'Your account is currently inactive or suspended' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, error: 'Invalid or expired token' });
  }
};

// Middleware to restrict endpoints based on user roles
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: `Role '${req.user ? req.user.role : 'anonymous'}' is not authorized to access this resource`
      });
    }
    next();
  };
};

// Middleware to ensure a farmer has completed verification before posting listings
const verifyFarmerStatus = (req, res, next) => {
  if (req.user.role === 'farmer' && req.user.farmerVerificationStatus !== 'verified') {
    return res.status(403).json({
      success: false,
      error: 'Account verification pending. Verified farmers only can publish products.'
    });
  }
  next();
};

module.exports = { protect, authorize, verifyFarmerStatus };
