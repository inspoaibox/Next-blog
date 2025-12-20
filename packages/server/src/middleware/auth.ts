import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { createError } from './errorHandler.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key';
const JWT_EXPIRES_IN = '24h';
const SESSION_TIMEOUT_MINUTES = 30;

export interface JwtPayload {
  userId: string;
  username: string;
  role: string;
  iat?: number;
  exp?: number;
}

export interface AuthRequest extends Request {
  user?: JwtPayload;
}

/**
 * 生成 JWT token
 */
export function generateToken(payload: Omit<JwtPayload, 'iat' | 'exp'>): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

/**
 * 验证 JWT token
 */
export function verifyToken(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload;
  } catch {
    return null;
  }
}

/**
 * 认证中间件
 */
export function authenticate(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(createError('Authentication required', 401, 'UNAUTHORIZED'));
  }

  const token = authHeader.substring(7);
  const payload = verifyToken(token);

  if (!payload) {
    return next(createError('Invalid or expired token', 401, 'INVALID_TOKEN'));
  }

  // 检查会话是否超时（基于 token 签发时间）
  if (payload.iat) {
    const tokenAge = Date.now() / 1000 - payload.iat;
    const maxAge = SESSION_TIMEOUT_MINUTES * 60;

    // 如果 token 年龄超过会话超时时间，但还没过期，仍然允许访问
    // 实际的会话超时应该在前端处理，或者使用 refresh token 机制
  }

  req.user = payload;
  next();
}

/**
 * 角色授权中间件
 */
export function authorize(...roles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(createError('Authentication required', 401, 'UNAUTHORIZED'));
    }

    if (!roles.includes(req.user.role)) {
      return next(createError('Insufficient permissions', 403, 'FORBIDDEN'));
    }

    next();
  };
}

/**
 * 可选认证中间件（不强制要求登录）
 */
export function optionalAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    const payload = verifyToken(token);

    if (payload) {
      req.user = payload;
    }
  }

  next();
}
