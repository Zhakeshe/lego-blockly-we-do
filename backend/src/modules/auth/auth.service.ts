import User from '../users/users.model.js';
import { AppError, AuthResponse } from '../../types/index.js';
import { generateTokens, verifyRefreshToken } from '../../config/jwt.js';
import { logger } from '../../utils/logger.js';

export class AuthService {
  async register(email: string, password: string, name: string): Promise<AuthResponse> {
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new AppError('User with this email already exists', 409);
    }

    // Create new user
    const user = await User.create({
      email,
      password,
      name,
      role: 'user',
      subscriptionStatus: 'free',
    });

    logger.info(`New user registered: ${user.email}`);

    // Generate tokens
    const tokens = generateTokens(user._id.toString(), user.email, user.role);

    return {
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        role: user.role,
        subscriptionStatus: user.subscriptionStatus,
      },
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    // Find user with password field
    const user = await User.findOne({ email }).select('+password');
    
    if (!user) {
      throw new AppError('Invalid email or password', 401);
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw new AppError('Invalid email or password', 401);
    }

    logger.info(`User logged in: ${user.email}`);

    // Generate tokens
    const tokens = generateTokens(user._id.toString(), user.email, user.role);

    return {
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        role: user.role,
        subscriptionStatus: user.subscriptionStatus,
      },
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }

  async refreshToken(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
    try {
      const decoded = verifyRefreshToken(refreshToken);

      // Verify user still exists
      const user = await User.findById(decoded.id);
      if (!user) {
        throw new AppError('User not found', 404);
      }

      // Generate new tokens
      const tokens = generateTokens(user._id.toString(), user.email, user.role);

      return tokens;
    } catch (error: any) {
      if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
        throw new AppError('Invalid or expired refresh token', 401);
      }
      throw error;
    }
  }

  async getMe(userId: string) {
    const user = await User.findById(userId);
    
    if (!user) {
      throw new AppError('User not found', 404);
    }

    return {
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
      subscriptionStatus: user.subscriptionStatus,
      subscriptionExpiry: user.subscriptionExpiry,
      createdAt: user.createdAt,
    };
  }
}

export default new AuthService();
