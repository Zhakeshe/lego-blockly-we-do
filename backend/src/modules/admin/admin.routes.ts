import { Router } from 'express';
import adminController from './admin.controller.js';
import { authenticate, authorize } from '../../middleware/auth.js';
import { validate } from '../../middleware/validation.js';
import { paginationValidator, idValidator } from '../../utils/validators.js';
import { body } from 'express-validator';

const router = Router();

// All routes require admin authentication
router.use(authenticate);
router.use(authorize('admin'));

/**
 * @route   GET /api/admin/stats
 * @desc    Get dashboard statistics
 * @access  Private (Admin)
 */
router.get('/stats', adminController.getDashboardStats);

/**
 * @route   GET /api/admin/users
 * @desc    Get all users with pagination and search
 * @access  Private (Admin)
 */
router.get('/users', paginationValidator, validate, adminController.getAllUsers);

/**
 * @route   GET /api/admin/users/:id
 * @desc    Get user by ID with details
 * @access  Private (Admin)
 */
router.get('/users/:id', idValidator, validate, adminController.getUserById);

/**
 * @route   PUT /api/admin/users/:id/subscription
 * @desc    Update user subscription
 * @access  Private (Admin)
 */
router.put(
  '/users/:id/subscription',
  [
    ...idValidator,
    body('subscriptionStatus')
      .isIn(['free', 'premium', 'enterprise'])
      .withMessage('Invalid subscription status'),
    body('duration')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Duration must be a positive integer'),
  ],
  validate,
  adminController.updateUserSubscription
);

/**
 * @route   DELETE /api/admin/users/:id
 * @desc    Delete user and associated data
 * @access  Private (Admin)
 */
router.delete('/users/:id', idValidator, validate, adminController.deleteUser);

/**
 * @route   GET /api/admin/payments
 * @desc    Get all payments
 * @access  Private (Admin)
 */
router.get('/payments', paginationValidator, validate, adminController.getAllPayments);

export default router;
