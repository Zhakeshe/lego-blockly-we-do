import { Request } from 'express';
import { JwtPayload } from 'jsonwebtoken';

// User Types
export interface IUser {
  _id: string;
  email: string;
  password: string;
  name: string;
  role: 'user' | 'admin';
  subscriptionStatus: 'free' | 'premium' | 'enterprise';
  subscriptionExpiry?: Date;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

// Auth Types
export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

export interface TokenPayload extends JwtPayload {
  id: string;
  email: string;
  role: string;
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
    subscriptionStatus: string;
  };
  accessToken: string;
  refreshToken: string;
}

// Project Types
export interface IProject {
  _id: string;
  userId: string;
  name: string;
  description: string;
  blocklyWorkspace: string;
  robot3DConfig: Robot3DConfig;
  mapId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Robot3DConfig {
  chassis: {
    type: string;
    color: string;
  };
  motors: MotorConfig[];
  sensors: SensorConfig[];
  wheels: WheelConfig[];
}

export interface MotorConfig {
  id: string;
  type: 'motor' | 'servo';
  position: Vector3;
  connectedWheel?: string;
}

export interface SensorConfig {
  id: string;
  type: 'distance' | 'tilt' | 'motion';
  position: Vector3;
  range: number;
}

export interface WheelConfig {
  id: string;
  position: Vector3;
  radius: number;
}

export interface Vector3 {
  x: number;
  y: number;
  z: number;
}

// Payment Types
export interface IPayment {
  _id: string;
  userId: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  subscriptionType: 'premium' | 'enterprise';
  paymentMethod: string;
  transactionId: string;
  stripeSessionId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  currency: string;
  duration: number; // in days
  features: string[];
}

// Map Types
export interface IMap {
  _id: string;
  name: string;
  description: string;
  terrain: TerrainConfig;
  obstacles: ObstacleConfig[];
  startPosition: Vector3;
  createdBy: string;
  isPublic: boolean;
  thumbnail?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TerrainConfig {
  width: number;
  height: number;
  depth: number;
  texture: string;
  heightMap?: number[][];
}

export interface ObstacleConfig {
  id: string;
  type: 'box' | 'cylinder' | 'sphere' | 'custom';
  position: Vector3;
  rotation: Vector3;
  scale: Vector3;
  color: string;
  physics: {
    mass: number;
    friction: number;
    restitution: number;
  };
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// Error Types
export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}
