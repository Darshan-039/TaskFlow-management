const { body, validationResult } = require('express-validator');
const { errorResponse } = require('../utils/response');

const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return errorResponse(res, 400, 'Validation failed', errors.array());
  }
  next();
};

const registerValidator = [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 50 }),
  body('email').trim().isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  handleValidation,
];

const loginValidator = [
  body('email').trim().isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
  handleValidation,
];

const taskValidator = [
  body('title').trim().notEmpty().withMessage('Title is required').isLength({ max: 100 }),
  body('description').optional().trim().isLength({ max: 500 }),
  body('status')
    .optional()
    .isIn(['pending', 'in-progress', 'completed'])
    .withMessage('Status must be pending, in-progress, or completed'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high'])
    .withMessage('Priority must be low, medium, or high'),
  handleValidation,
];

module.exports = { registerValidator, loginValidator, taskValidator };
