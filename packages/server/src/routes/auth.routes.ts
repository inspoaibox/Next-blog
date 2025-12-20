import { Router, Response } from 'express';
import { z } from 'zod';
import { userService } from '../services/user.service.js';
import { generateToken, authenticate, AuthRequest } from '../middleware/auth.js';
import { createError } from '../middleware/errorHandler.js';

const router = Router();

// 验证 schema
const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(6, 'New password must be at least 6 characters'),
});

/**
 * POST /api/auth/login
 * 用户登录
 */
router.post('/login', async (req, res, next) => {
  try {
    const { username, password } = loginSchema.parse(req.body);

    const result = await userService.validateCredentials(username, password);

    if (!result.success || !result.user) {
      return next(createError(result.error || 'Login failed', 401, 'LOGIN_FAILED'));
    }

    const token = generateToken({
      userId: result.user.id,
      username: result.user.username,
      role: result.user.role,
    });

    res.json({
      success: true,
      data: {
        token,
        user: {
          id: result.user.id,
          username: result.user.username,
          role: result.user.role,
        },
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return next(createError(error.errors[0].message, 400, 'VALIDATION_ERROR'));
    }
    next(error);
  }
});

/**
 * POST /api/auth/logout
 * 用户登出
 */
router.post('/logout', authenticate, (_req: AuthRequest, res: Response) => {
  // JWT 是无状态的，登出只需要客户端删除 token
  // 如果需要服务端登出，可以实现 token 黑名单
  res.json({
    success: true,
    data: { message: 'Logged out successfully' },
  });
});

/**
 * PUT /api/auth/password
 * 修改密码
 */
router.put('/password', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const { currentPassword, newPassword } = changePasswordSchema.parse(req.body);

    if (!req.user) {
      return next(createError('Authentication required', 401, 'UNAUTHORIZED'));
    }

    const result = await userService.changePassword(
      req.user.userId,
      currentPassword,
      newPassword
    );

    if (!result.success) {
      return next(createError(result.error || 'Password change failed', 400, 'PASSWORD_CHANGE_FAILED'));
    }

    res.json({
      success: true,
      data: { message: 'Password changed successfully' },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return next(createError(error.errors[0].message, 400, 'VALIDATION_ERROR'));
    }
    next(error);
  }
});

/**
 * GET /api/auth/me
 * 获取当前用户信息
 */
router.get('/me', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    if (!req.user) {
      return next(createError('Authentication required', 401, 'UNAUTHORIZED'));
    }

    const user = await userService.findById(req.user.userId);

    if (!user) {
      return next(createError('User not found', 404, 'USER_NOT_FOUND'));
    }

    res.json({
      success: true,
      data: {
        id: user.id,
        username: user.username,
        role: user.role,
        createdAt: user.createdAt,
        lastLoginAt: user.lastLoginAt,
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
