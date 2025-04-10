const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const auth = require('../middleware/auth');

// Validation middleware
const registerValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Please enter a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('role').isIn(['interviewer', 'candidate']).withMessage('Invalid role'),
  body('department').trim().notEmpty().withMessage('Department is required'),
  body('skills').isArray().withMessage('Skills must be an array'),
  body('experience').optional().isString(),
  body('preferredRole').optional().isString(),
  body('level').optional().isIn(['junior', 'mid-level', 'senior'])
];

const loginValidation = [
  body('email').isEmail().withMessage('Please enter a valid email'),
  body('password').notEmpty().withMessage('Password is required')
];

const updateProfileValidation = [
  body('name').optional().trim().notEmpty(),
  body('department').optional().trim().notEmpty(),
  body('skills').optional().isArray(),
  body('experience').optional().isString(),
  body('preferredRole').optional().isString(),
  body('level').optional().isIn(['junior', 'mid-level', 'senior']),
  body('availability').optional().isArray()
];

const changePasswordValidation = [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long')
];

// Routes
router.post('/register', registerValidation, authController.register);
router.post('/login', loginValidation, authController.login);
router.get('/me', auth, authController.getCurrentUser);
router.put('/profile', auth, updateProfileValidation, authController.updateProfile);
router.put('/change-password', auth, changePasswordValidation, authController.changePassword);

module.exports = router; 