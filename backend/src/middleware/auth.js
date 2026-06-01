const { verifyToken } = require('../utils/jwt');
const User = require('../models/User');
const { errorResponse } = require('../utils/response');

// Protect routes 
const protect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return errorResponse(res, 401, 'Access denied. No token provided.');
    }

    const decoded = verifyToken(token);
    const user = await User.findById(decoded.id);

    if (!user) {
      return errorResponse(res, 401, 'User not found. Token invalid.');
    }

    req.user = user;
    next();

  } catch (error) {
    return errorResponse(res, 401, 'Token is invalid or expired.');
  }
};




// Restrict to specific role
const authorize = (...roles) => {

  return (req, res, next) => {

    if (!roles.includes(req.user.role)) {

      return errorResponse(
        res,
        403,
        `Role '${req.user.role}' is not authorized to access this route.`
      );

    }

    next();

  };
  
};

module.exports = { protect, authorize };
