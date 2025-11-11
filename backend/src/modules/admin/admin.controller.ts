import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../types/index.js';
import adminService from './admin.service.js';

export class AdminController {
  async getDashboardStats(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: 'User not authenticated' });
        return;
      }

      const stats = await adminService.getDashboardStats(req.user.id);

      res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  }

  async getAllUsers(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: 'User not authenticated' });
        return;
      }

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const search = req.query.search as string;

      const result = await adminService.getAllUsers(req.user.id, page, limit, search);

      res.status(200).json({
        success: true,
        data: result.users,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  async getUserById(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: 'User not authenticated' });
        return;
      }

      const { id } = req.params;

      const result = await adminService.getUserById(req.user.id, id);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateUserSubscription(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: 'User not authenticated' });
        return;
      }

      const { id } = req.params;
      const { subscriptionStatus, duration } = req.body;

      const user = await adminService.updateUserSubscription(
        req.user.id,
        id,
        subscriptionStatus,
        duration
      );

      res.status(200).json({
        success: true,
        message: 'User subscription updated successfully',
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteUser(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: 'User not authenticated' });
        return;
      }

      const { id } = req.params;

      const result = await adminService.deleteUser(req.user.id, id);

      res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  }

  async getAllPayments(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: 'User not authenticated' });
        return;
      }

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const result = await adminService.getAllPayments(req.user.id, page, limit);

      res.status(200).json({
        success: true,
        data: result.payments,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new AdminController();
