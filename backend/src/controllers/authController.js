const User = require('../models/User');
const { generateToken } = require('../utils/jwt');
const { successResponse, errorResponse } = require('../utils/response');

// Register new user
// POST /api/v1/auth/register
const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return errorResponse(res, 409, 'Email already registered.');
    }

    const user = await User.create({ name, email, password });
    const token = generateToken(user._id, user.role);

    return successResponse(res, 201, 'User registered successfully.', {
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (error) {
    next(error);
  }
};

// Login user
// POST /api/v1/auth/login
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.matchPassword(password))) {
      return errorResponse(res, 401, 'Invalid email or password.');
    }

    const token = generateToken(user._id, user.role);

    return successResponse(res, 200, 'Login successful.', {
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (error) {
    next(error);
  }
};

// Get logged-in user profile
// GET /api/v1/auth/me
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    return successResponse(res, 200, 'Profile fetched.', {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login, getMe };
