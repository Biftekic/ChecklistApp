import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { AuthService } from '../auth-service';
import { DatabaseService } from '../database';
import type { User, AuthCredentials, AuthResult, Session } from '@/lib/types/auth';

// Mock bcryptjs
vi.mock('bcryptjs', () => ({
  default: {
    hash: vi.fn((password: string) => Promise.resolve(`hashed_${password}`)),
    compare: vi.fn((password: string, hash: string) => 
      Promise.resolve(hash === `hashed_${password}`)
    )
  }
}));

// Mock JWT
vi.mock('jsonwebtoken', () => ({
  default: {
    sign: vi.fn((payload: any) => `token_${payload.userId}`),
    verify: vi.fn((token: string) => {
      if (token.startsWith('token_')) {
        return { userId: token.replace('token_', '') };
      }
      throw new Error('Invalid token');
    })
  }
}));

describe('Authentication Service', () => {
  let authService: AuthService;
  let dbService: DatabaseService;

  beforeEach(async () => {
    dbService = new DatabaseService();
    await dbService.initialize();
    authService = new AuthService(dbService);
  });

  afterEach(async () => {
    await dbService.close();
  });

  describe('User Registration', () => {
    it('should handle user registration', async () => {
      const credentials: AuthCredentials = {
        email: 'test@example.com',
        password: 'SecurePassword123!',
        name: 'Test User'
      };

      const result = await authService.register(credentials);

      expect(result.success).toBe(true);
      expect(result.user).toBeDefined();
      expect(result.user?.email).toBe('test@example.com');
      expect(result.user?.password).not.toBe('SecurePassword123!'); // Should be hashed
      expect(result.token).toBeDefined();
    });

    it('should validate email format', async () => {
      const credentials: AuthCredentials = {
        email: 'invalid-email',
        password: 'SecurePassword123!'
      };

      const result = await authService.register(credentials);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid email format');
    });

    it('should validate password strength', async () => {
      const weakPasswords = ['short', '12345678', 'password', 'noNumbers!'];

      for (const password of weakPasswords) {
        const result = await authService.register({
          email: 'test@example.com',
          password
        });

        expect(result.success).toBe(false);
        expect(result.error).toContain('Password requirements');
      }
    });

    it('should prevent duplicate email registration', async () => {
      const credentials: AuthCredentials = {
        email: 'duplicate@example.com',
        password: 'SecurePassword123!'
      };

      // First registration
      await authService.register(credentials);

      // Attempt duplicate
      const result = await authService.register(credentials);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Email already registered');
    });

    it('should hash passwords securely', async () => {
      const credentials: AuthCredentials = {
        email: 'hash@example.com',
        password: 'SecurePassword123!'
      };

      const result = await authService.register(credentials);

      expect(result.user?.password).toBe('hashed_SecurePassword123!');
      expect(result.user?.password).not.toBe(credentials.password);
    });
  });

  describe('User Login', () => {
    beforeEach(async () => {
      // Register a test user
      await authService.register({
        email: 'login@example.com',
        password: 'TestPassword123!',
        name: 'Login Test'
      });
    });

    it('should validate email and password', async () => {
      const result = await authService.login({
        email: 'login@example.com',
        password: 'TestPassword123!'
      });

      expect(result.success).toBe(true);
      expect(result.user).toBeDefined();
      expect(result.token).toBeDefined();
      expect(result.session).toBeDefined();
    });

    it('should reject invalid credentials', async () => {
      const result = await authService.login({
        email: 'login@example.com',
        password: 'WrongPassword123!'
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid credentials');
    });

    it('should handle non-existent users', async () => {
      const result = await authService.login({
        email: 'nonexistent@example.com',
        password: 'AnyPassword123!'
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid credentials');
    });

    it('should create session on successful login', async () => {
      const result = await authService.login({
        email: 'login@example.com',
        password: 'TestPassword123!'
      });

      expect(result.session).toMatchObject({
        userId: expect.any(String),
        token: expect.any(String),
        expiresAt: expect.any(Date)
      });
    });

    it('should implement rate limiting', async () => {
      const email = 'ratelimit@example.com';
      await authService.register({
        email,
        password: 'TestPassword123!'
      });

      // Attempt multiple failed logins
      for (let i = 0; i < 5; i++) {
        await authService.login({
          email,
          password: 'WrongPassword!'
        });
      }

      // Should be rate limited now
      const result = await authService.login({
        email,
        password: 'TestPassword123!' // Even with correct password
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('Too many attempts');
    });
  });

  describe('JWT Token Management', () => {
    it('should manage JWT tokens securely', async () => {
      const token = await authService.generateToken({
        id: 'user123',
        email: 'test@example.com'
      });

      expect(token).toBeDefined();
      expect(token).toContain('token_user123');
    });

    it('should validate JWT tokens', async () => {
      const token = await authService.generateToken({
        id: 'user123',
        email: 'test@example.com'
      });

      const valid = await authService.validateToken(token);

      expect(valid).toBe(true);
    });

    it('should reject invalid tokens', async () => {
      const valid = await authService.validateToken('invalid_token');
      expect(valid).toBe(false);
    });

    it('should refresh expired tokens', async () => {
      const oldToken = 'token_user123';
      const newToken = await authService.refreshToken(oldToken);

      expect(newToken).toBeDefined();
      expect(newToken).not.toBe(oldToken);
    });

    it('should handle token expiration', async () => {
      const token = await authService.generateToken(
        { id: 'user123', email: 'test@example.com' },
        '1ms' // Very short expiration
      );

      // Wait for expiration
      await new Promise(resolve => setTimeout(resolve, 10));

      const valid = await authService.validateToken(token);
      expect(valid).toBe(false);
    });
  });

  describe('Password Reset', () => {
    it('should handle password reset', async () => {
      await authService.register({
        email: 'reset@example.com',
        password: 'OldPassword123!'
      });

      const resetResult = await authService.requestPasswordReset('reset@example.com');

      expect(resetResult.success).toBe(true);
      expect(resetResult.resetToken).toBeDefined();
    });

    it('should validate reset tokens', async () => {
      await authService.register({
        email: 'reset2@example.com',
        password: 'OldPassword123!'
      });

      const { resetToken } = await authService.requestPasswordReset('reset2@example.com');

      const result = await authService.resetPassword(resetToken!, 'NewPassword123!');

      expect(result.success).toBe(true);
    });

    it('should expire reset tokens', async () => {
      await authService.register({
        email: 'expire@example.com',
        password: 'OldPassword123!'
      });

      const { resetToken } = await authService.requestPasswordReset('expire@example.com');

      // Simulate token expiration
      await authService.expireResetToken(resetToken!);

      const result = await authService.resetPassword(resetToken!, 'NewPassword123!');

      expect(result.success).toBe(false);
      expect(result.error).toContain('expired');
    });

    it('should invalidate old passwords after reset', async () => {
      await authService.register({
        email: 'invalidate@example.com',
        password: 'OldPassword123!'
      });

      const { resetToken } = await authService.requestPasswordReset('invalidate@example.com');
      await authService.resetPassword(resetToken!, 'NewPassword123!');

      // Try to login with old password
      const oldLoginResult = await authService.login({
        email: 'invalidate@example.com',
        password: 'OldPassword123!'
      });

      expect(oldLoginResult.success).toBe(false);

      // Login with new password
      const newLoginResult = await authService.login({
        email: 'invalidate@example.com',
        password: 'NewPassword123!'
      });

      expect(newLoginResult.success).toBe(true);
    });
  });

  describe('Session Management', () => {
    it('should manage sessions', async () => {
      const { session } = await authService.register({
        email: 'session@example.com',
        password: 'Password123!'
      });

      const activeSession = await authService.getSession(session!.id);

      expect(activeSession).toBeDefined();
      expect(activeSession?.userId).toBe(session!.userId);
    });

    it('should validate sessions', async () => {
      const { session } = await authService.register({
        email: 'validate@example.com',
        password: 'Password123!'
      });

      const isValid = await authService.validateSession(session!.id);

      expect(isValid).toBe(true);
    });

    it('should invalidate sessions on logout', async () => {
      const { session } = await authService.register({
        email: 'logout@example.com',
        password: 'Password123!'
      });

      await authService.logout(session!.id);

      const isValid = await authService.validateSession(session!.id);
      expect(isValid).toBe(false);
    });

    it('should handle session expiration', async () => {
      const { session } = await authService.register({
        email: 'expire@example.com',
        password: 'Password123!'
      });

      // Manually expire the session
      await authService.expireSession(session!.id);

      const isValid = await authService.validateSession(session!.id);
      expect(isValid).toBe(false);
    });

    it('should clean up expired sessions', async () => {
      // Create multiple sessions
      for (let i = 0; i < 5; i++) {
        await authService.register({
          email: `cleanup${i}@example.com`,
          password: 'Password123!'
        });
      }

      // Expire all sessions
      await authService.cleanupExpiredSessions();

      const activeSessions = await authService.getActiveSessions();
      expect(activeSessions.length).toBe(0);
    });
  });

  describe('CSRF Protection', () => {
    it('should implement CSRF protection', async () => {
      const token = await authService.generateCSRFToken();

      expect(token).toBeDefined();
      expect(token.length).toBeGreaterThan(20);
    });

    it('should validate CSRF tokens', async () => {
      const token = await authService.generateCSRFToken();
      const isValid = await authService.validateCSRFToken(token);

      expect(isValid).toBe(true);
    });

    it('should reject invalid CSRF tokens', async () => {
      const isValid = await authService.validateCSRFToken('invalid_csrf_token');
      expect(isValid).toBe(false);
    });
  });

  describe('Security Features', () => {
    it('should implement password hashing', async () => {
      const password = 'TestPassword123!';
      const hash = await authService.hashPassword(password);

      expect(hash).not.toBe(password);
      expect(hash).toContain('hashed_');
    });

    it('should verify password hashes', async () => {
      const password = 'TestPassword123!';
      const hash = await authService.hashPassword(password);

      const isValid = await authService.verifyPassword(password, hash);
      expect(isValid).toBe(true);

      const isInvalid = await authService.verifyPassword('WrongPassword', hash);
      expect(isInvalid).toBe(false);
    });

    it('should sanitize user input', () => {
      const maliciousInput = '<script>alert("XSS")</script>';
      const sanitized = authService.sanitizeInput(maliciousInput);

      expect(sanitized).not.toContain('<script>');
      expect(sanitized).not.toContain('</script>');
    });

    it('should validate email addresses', () => {
      const validEmails = [
        'test@example.com',
        'user+tag@domain.co.uk',
        'name.surname@company.org'
      ];

      const invalidEmails = [
        'invalid',
        '@example.com',
        'user@',
        'user @example.com',
        'user@.com'
      ];

      for (const email of validEmails) {
        expect(authService.validateEmail(email)).toBe(true);
      }

      for (const email of invalidEmails) {
        expect(authService.validateEmail(email)).toBe(false);
      }
    });
  });
});
