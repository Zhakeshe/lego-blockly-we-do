import User from '../users/users.model.js';
import Payment from '../payments/payments.model.js';
import Project from '../projects/projects.model.js';
import Map from '../maps/maps.model.js';
import { AppError } from '../../types/index.js';
import { logger } from '../../utils/logger.js';

export class AdminService {
  async verifyAdmin(userId: string) {
    const user = await User.findById(userId);
    if (!user || user.role !== 'admin') {
      throw new AppError('Access denied. Admin privileges required.', 403);
    }
    return user;
  }

  async getDashboardStats(userId: string) {
    await this.verifyAdmin(userId);

    const [
      totalUsers,
      totalProjects,
      totalMaps,
      totalPayments,
      premiumUsers,
      enterpriseUsers,
      recentPayments,
    ] = await Promise.all([
      User.countDocuments(),
      Project.countDocuments(),
      Map.countDocuments(),
      Payment.countDocuments({ status: 'completed' }),
      User.countDocuments({ subscriptionStatus: 'premium' }),
      User.countDocuments({ subscriptionStatus: 'enterprise' }),
      Payment.find({ status: 'completed' })
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),
    ]);

    const totalRevenue = await Payment.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);

    return {
      users: {
        total: totalUsers,
        free: totalUsers - premiumUsers - enterpriseUsers,
        premium: premiumUsers,
        enterprise: enterpriseUsers,
      },
      content: {
        projects: totalProjects,
        maps: totalMaps,
      },
      revenue: {
        total: totalRevenue[0]?.total || 0,
        payments: totalPayments,
      },
      recentPayments,
    };
  }

  async getAllUsers(userId: string, page: number = 1, limit: number = 10, search?: string) {
    await this.verifyAdmin(userId);

    const skip = (page - 1) * limit;
    const query: any = {};

    if (search) {
      query.$or = [
        { email: { $regex: search, $options: 'i' } },
        { name: { $regex: search, $options: 'i' } },
      ];
    }

    const [users, total] = await Promise.all([
      User.find(query)
        .select('-password')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      User.countDocuments(query),
    ]);

    return {
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async getUserById(userId: string, targetUserId: string) {
    await this.verifyAdmin(userId);

    const user = await User.findById(targetUserId).select('-password');

    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Get user's projects and payments
    const [projects, payments] = await Promise.all([
      Project.find({ userId: targetUserId }).countDocuments(),
      Payment.find({ userId: targetUserId, status: 'completed' }).lean(),
    ]);

    return {
      user,
      stats: {
        projectCount: projects,
        totalSpent: payments.reduce((sum, p) => sum + p.amount, 0),
        paymentHistory: payments,
      },
    };
  }

  async updateUserSubscription(
    adminId: string,
    targetUserId: string,
    subscriptionStatus: 'free' | 'premium' | 'enterprise',
    duration?: number
  ) {
    await this.verifyAdmin(adminId);

    const user = await User.findById(targetUserId);

    if (!user) {
      throw new AppError('User not found', 404);
    }

    user.subscriptionStatus = subscriptionStatus;

    if (subscriptionStatus !== 'free' && duration) {
      const expiry = new Date();
      expiry.setDate(expiry.getDate() + duration);
      user.subscriptionExpiry = expiry;
    } else {
      user.subscriptionExpiry = undefined;
    }

    await user.save();

    logger.info(`Admin ${adminId} updated subscription for user ${targetUserId} to ${subscriptionStatus}`);

    return user;
  }

  async deleteUser(adminId: string, targetUserId: string) {
    await this.verifyAdmin(adminId);

    const user = await User.findById(targetUserId);

    if (!user) {
      throw new AppError('User not found', 404);
    }

    if (user.role === 'admin') {
      throw new AppError('Cannot delete admin users', 403);
    }

    // Delete user's projects
    await Project.deleteMany({ userId: targetUserId });

    // Delete user
    await User.findByIdAndDelete(targetUserId);

    logger.warn(`Admin ${adminId} deleted user ${targetUserId}`);

    return { message: 'User and associated data deleted successfully' };
  }

  async getAllPayments(userId: string, page: number = 1, limit: number = 10) {
    await this.verifyAdmin(userId);

    const skip = (page - 1) * limit;

    const [payments, total] = await Promise.all([
      Payment.find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Payment.countDocuments(),
    ]);

    // Populate user emails
    const paymentsWithUsers = await Promise.all(
      payments.map(async (payment) => {
        const user = await User.findById(payment.userId).select('email name');
        return {
          ...payment,
          userEmail: user?.email,
          userName: user?.name,
        };
      })
    );

    return {
      payments: paymentsWithUsers,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }
}

export default new AdminService();
