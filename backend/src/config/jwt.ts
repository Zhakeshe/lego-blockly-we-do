import jwt from 'jsonwebtoken';
import { TokenPayload } from '../types/index.js';

export const jwtConfig = {
  secret: process.env.JWT_SECRET || 'your-secret-key',
  refreshSecret: process.env.REFRESH_TOKEN_SECRET || 'your-refresh-secret',
  accessTokenExpire: process.env.JWT_EXPIRE || '7d',
  refreshTokenExpire: process.env.REFRESH_TOKEN_EXPIRE || '30d',
};

export const generateAccessToken = (payload: Omit<TokenPayload, 'iat' | 'exp'>): string => {
  return jwt.sign(payload, jwtConfig.secret, {
    expiresIn: jwtConfig.accessTokenExpire,
  });
};

export const generateRefreshToken = (payload: Omit<TokenPayload, 'iat' | 'exp'>): string => {
  return jwt.sign(payload, jwtConfig.refreshSecret, {
    expiresIn: jwtConfig.refreshTokenExpire,
  });
};

export const verifyAccessToken = (token: string): TokenPayload => {
  return jwt.verify(token, jwtConfig.secret) as TokenPayload;
};

export const verifyRefreshToken = (token: string): TokenPayload => {
  return jwt.verify(token, jwtConfig.refreshSecret) as TokenPayload;
};

export const generateTokens = (userId: string, email: string, role: string) => {
  const payload = { id: userId, email, role };
  
  return {
    accessToken: generateAccessToken(payload),
    refreshToken: generateRefreshToken(payload),
  };
};
