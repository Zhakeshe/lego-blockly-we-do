import { Router } from 'express';
import express from 'express';
import paymentController from './payments.controller.js';
import { authenticate } from '../../middleware/auth.js';
import { validate } from '../../middleware/validation.js';
import { paginationValidator } from '../../utils/validators.js';

const router = Router();

/**
 * @route   GET /api/payments/plans
 * @desc    Get all subscription plans
 * @access  Public
 */
router.get('/plans', paymentController.getSubscriptionPlans);

/**
 * @route   POST /api/payments/create-checkout
 * @desc    Create Stripe checkout session
 * @access  Private
 */
router.post('/create-checkout', authenticate, paymentController.createCheckoutSession);

/**
 * @route   POST /api/payments/webhook
 * @desc    Handle Stripe webhook events
 * @access  Public (Stripe)
 */
router.post(
  '/webhook',
  express.raw({ type: 'application/json' }),
  paymentController.handleWebhook
);

/**
 * @route   GET /api/payments/history
 * @desc    Get payment history for current user
 * @access  Private
 */
router.get('/history', authenticate, paginationValidator, validate, paymentController.getPaymentHistory);

/**
 * @route   GET /api/payments/verify/:sessionId
 * @desc    Verify payment session
 * @access  Public
 */
router.get('/verify/:sessionId', paymentController.verifySession);

export default router;
