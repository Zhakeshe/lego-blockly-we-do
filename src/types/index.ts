// User and Auth Types
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
  subscriptionStatus: 'free' | 'premium' | 'enterprise';
  subscriptionExpiry?: Date;
  createdAt: Date;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
}

// Robot 3D Types
export interface Vector3 {
  x: number;
  y: number;
  z: number;
}

export interface MotorConfig {
  id: string;
  type: 'motor' | 'servo';
  position: Vector3;
  connectedWheel?: string;
  power?: number;
}

export interface SensorConfig {
  id: string;
  type: 'distance' | 'tilt' | 'motion';
  position: Vector3;
  range: number;
  value?: number;
}

export interface WheelConfig {
  id: string;
  position: Vector3;
  radius: number;
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

// Project Types
export interface Project {
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

export interface CreateProjectData {
  name: string;
  description?: string;
  blocklyWorkspace?: string;
  robot3DConfig?: Robot3DConfig;
  mapId?: string;
}

// Map Types
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

export interface Map {
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

// Payment Types
export interface Payment {
  _id: string;
  userId: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  subscriptionType: 'premium' | 'enterprise';
  paymentMethod: string;
  transactionId: string;
  createdAt: Date;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  currency: string;
  duration: number;
  features: string[];
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

// Admin Types
export interface DashboardStats {
  users: {
    total: number;
    free: number;
    premium: number;
    enterprise: number;
  };
  content: {
    projects: number;
    maps: number;
  };
  revenue: {
    total: number;
    payments: number;
  };
  recentPayments: Payment[];
}

export interface UserWithStats {
  user: User;
  stats: {
    projectCount: number;
    totalSpent: number;
    paymentHistory: Payment[];
  };
}
