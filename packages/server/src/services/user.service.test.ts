import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import * as fc from 'fast-check';
import { PrismaClient } from '@prisma/client';
import { UserService } from './user.service.js';

const prisma = new PrismaClient();
const userService = new UserService();

beforeAll(async () => {
  await prisma.user.deleteMany({ where: { username: { startsWith: 'user-test-' } } });
});

afterEach(async () => {
  await prisma.user.deleteMany({ where: { username: { startsWith: 'user-test-' } } });
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe('UserService', () => {
  /**
   * **Feature: blog-system, Property: 密码修改后使用新密码登录成功**
   * **Validates: Requirements 1.3**
   */
  it('Property: 密码修改后使用新密码登录成功', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          username: fc.string({ minLength: 3, maxLength: 10 }).filter(s => /^[a-zA-Z0-9]+$/.test(s)),
          oldPassword: fc.string({ minLength: 6, maxLength: 12 }),
          newPassword: fc.string({ minLength: 6, maxLength: 12 }),
        }),
        async ({ username, oldPassword, newPassword }) => {
          if (oldPassword === newPassword) return true;

          const uniqueUsername = `user-test-${username}-${Date.now()}`;
          const user = await userService.create({
            username: uniqueUsername,
            password: oldPassword,
          });

          const loginWithOld = await userService.validateCredentials(uniqueUsername, oldPassword);
          expect(loginWithOld.success).toBe(true);

          const changeResult = await userService.changePassword(user.id, oldPassword, newPassword);
          expect(changeResult.success).toBe(true);

          const loginWithNew = await userService.validateCredentials(uniqueUsername, newPassword);
          expect(loginWithNew.success).toBe(true);

          const loginWithOldAgain = await userService.validateCredentials(uniqueUsername, oldPassword);
          expect(loginWithOldAgain.success).toBe(false);

          return true;
        }
      ),
      { numRuns: 3 }
    );
  }, 60000);

  it('should hash and verify password correctly', async () => {
    const password = 'testPassword123';
    const hash = await userService.hashPassword(password);

    expect(hash).not.toBe(password);
    expect(await userService.verifyPassword(password, hash)).toBe(true);
    expect(await userService.verifyPassword('wrongPassword', hash)).toBe(false);
  });

  it('should lock account after 5 failed attempts', async () => {
    const user = await userService.create({
      username: 'user-test-lock-' + Date.now(),
      password: 'correctPassword',
    });

    for (let i = 0; i < 5; i++) {
      await userService.validateCredentials(user.username, 'wrongPassword');
    }

    const result = await userService.validateCredentials(user.username, 'correctPassword');
    expect(result.success).toBe(false);
    expect(result.error).toContain('locked');
  }, 60000);
});
