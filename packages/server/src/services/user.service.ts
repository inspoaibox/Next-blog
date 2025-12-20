import bcrypt from 'bcrypt';
import { prisma } from '../lib/prisma.js';
import type { User } from '@prisma/client';

const SALT_ROUNDS = 10;
const MAX_LOGIN_ATTEMPTS = 5;
const LOCK_DURATION_MINUTES = 15;

export interface CreateUserInput {
  username: string;
  password: string;
  role?: string;
}

export interface UpdateUserInput {
  username?: string;
  role?: string;
}

export class UserService {
  /**
   * 哈希密码
   */
  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, SALT_ROUNDS);
  }

  /**
   * 验证密码
   */
  async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  /**
   * 创建用户
   */
  async create(input: CreateUserInput): Promise<User> {
    const passwordHash = await this.hashPassword(input.password);

    return prisma.user.create({
      data: {
        username: input.username,
        passwordHash,
        role: input.role || 'ADMIN',
      },
    });
  }

  /**
   * 根据 ID 获取用户
   */
  async findById(id: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { id } });
  }

  /**
   * 根据用户名获取用户
   */
  async findByUsername(username: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { username } });
  }

  /**
   * 验证用户凭据
   */
  async validateCredentials(
    username: string,
    password: string
  ): Promise<{ success: boolean; user?: User; error?: string }> {
    const user = await this.findByUsername(username);

    if (!user) {
      return { success: false, error: 'Invalid credentials' };
    }

    // 检查账户是否被锁定
    if (user.lockedUntil && user.lockedUntil > new Date()) {
      const remainingMinutes = Math.ceil(
        (user.lockedUntil.getTime() - Date.now()) / 60000
      );
      return {
        success: false,
        error: `Account locked. Try again in ${remainingMinutes} minutes`,
      };
    }

    // 验证密码
    const isValid = await this.verifyPassword(password, user.passwordHash);

    if (!isValid) {
      // 增加登录失败次数
      const newAttempts = user.loginAttempts + 1;
      const updateData: { loginAttempts: number; lockedUntil?: Date } = {
        loginAttempts: newAttempts,
      };

      // 如果超过最大尝试次数，锁定账户
      if (newAttempts >= MAX_LOGIN_ATTEMPTS) {
        updateData.lockedUntil = new Date(
          Date.now() + LOCK_DURATION_MINUTES * 60 * 1000
        );
      }

      await prisma.user.update({
        where: { id: user.id },
        data: updateData,
      });

      return { success: false, error: 'Invalid credentials' };
    }

    // 登录成功，重置登录尝试次数
    await prisma.user.update({
      where: { id: user.id },
      data: {
        loginAttempts: 0,
        lockedUntil: null,
        lastLoginAt: new Date(),
      },
    });

    return { success: true, user };
  }

  /**
   * 修改密码
   */
  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ): Promise<{ success: boolean; error?: string }> {
    const user = await this.findById(userId);

    if (!user) {
      return { success: false, error: 'User not found' };
    }

    // 验证当前密码
    const isValid = await this.verifyPassword(currentPassword, user.passwordHash);

    if (!isValid) {
      return { success: false, error: 'Current password is incorrect' };
    }

    // 更新密码
    const newPasswordHash = await this.hashPassword(newPassword);

    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash: newPasswordHash },
    });

    return { success: true };
  }

  /**
   * 更新用户信息
   */
  async update(id: string, input: UpdateUserInput): Promise<User> {
    return prisma.user.update({
      where: { id },
      data: input,
    });
  }

  /**
   * 删除用户
   */
  async delete(id: string): Promise<void> {
    await prisma.user.delete({ where: { id } });
  }

  /**
   * 获取所有用户
   */
  async findAll(): Promise<User[]> {
    return prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * 解锁用户账户
   */
  async unlock(id: string): Promise<User> {
    return prisma.user.update({
      where: { id },
      data: {
        loginAttempts: 0,
        lockedUntil: null,
      },
    });
  }
}

export const userService = new UserService();
