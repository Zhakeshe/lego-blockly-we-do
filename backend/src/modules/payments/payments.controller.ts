import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../../types/index.js';
import paymentService from './payments.service.js';
import { subscriptionPlans } from '../../config/payment.js';

export class PaymentController {
  async createCheckoutSession(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: 'User not authenticated' });
        return;
      }

      const { planId } = req.body;

      if (!planId) {
        res.status(400).json({ success: false, error: 'Plan ID is required' });
        return;
      }

      const result = await paymentService.createCheckoutSession(req.user.id, planId);

      res.status(200).json({
        success: true,
        message: 'Checkout session created',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async handleWebhook(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const signature = req.headers['stripe-signature'] as string;

      if (!signature) {
        res.status(400).json({ success: false, error: 'Missing stripe signature' });
        return;
      }

      const result = await paymentService.handleWebhook(signature, req.body);

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  async getPaymentHistory(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: 'User not authenticated' });
        return;
      }

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const result = await paymentService.getPaymentHistory(req.user.id, page, limit);

      res.status(200).json({
        success: true,
        data: result.payments,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  async getSubscriptionPlans(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      res.status(200).json({
        success: true,
        data: subscriptionPlans,
      });
    } catch (error) {
      next(error);
    }
  }

  async verifySession(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { sessionId } = req.params;

      if (!sessionId) {
        res.status(400).json({ success: false, error: 'Session ID is required' });
        return;
      }

      const result = await paymentService.verifySession(sessionId);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new PaymentController();
