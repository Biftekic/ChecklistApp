import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import type { DatabaseService } from './database';
import type { User, AuthCredentials, AuthResult, Session, PasswordResetResult } from '@/lib/types/auth';

export class AuthService {
  private db: DatabaseService;
  private readonly JWT_SECRET = process.env.JWT_SECRET || 'development-secret-key';
  private readonly SALT_ROUNDS = 10;
  private loginAttempts: Map<string, { count: number; lastAttempt: Date }> = new Map();
  private csrfTokens: Set<string> = new Set();
  private resetTokens: Map<string, { userId: string; expiresAt: Date }> = new Map();
  private sessions: Map<string, Session> = new Map();

  constructor(database: DatabaseService) {
    this.db = database;
  }

  async register(credentials: AuthCredentials): Promise<AuthResult> {
    try {
      // Validate email
      if (!this.validateEmail(credentials.email)) {
        return { success: false, error: 'Invalid email format' };
      }

      // Validate password strength
      const passwordValidation = this.validatePasswordStrength(credentials.password);
      if (!passwordValidation.valid) {
        return { success: false, error: `Password requirements: ${passwordValidation.error}` };
      }

      // Check for existing user
      const existingUser = await this.getUserByEmail(credentials.email);
      if (existingUser) {
        return { success: false, error: 'Email already registered' };
      }

      // Hash password
      const hashedPassword = await this.hashPassword(credentials.password);

      // Create user
      const user: User = {
        id: uuidv4(),
        email: credentials.email,
        password: hashedPassword,
        name: credentials.name,
        role: 'user',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Save to database
      await this.saveUser(user);

      // Generate token
      const token = await this.generateToken({ id: user.id, email: user.email });

      // Create session
      const session = await this.createSession(user.id, token);

      // Remove password from response
      const { password, ...userWithoutPassword } = user;

      return {
        success: true,
        user: userWithoutPassword,
        token,
        session
      };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }

  async login(credentials: Pick<AuthCredentials, 'email' | 'password'>): Promise<AuthResult> {
    try {
      // Check rate limiting
      if (this.isRateLimited(credentials.email)) {
        return { success: false, error: 'Too many attempts. Please try again later.' };
      }

      // Get user
      const user = await this.getUserByEmail(credentials.email);
      if (!user || !user.password) {
        this.recordFailedAttempt(credentials.email);
        return { success: false, error: 'Invalid credentials' };
      }

      // Verify password
      const isValid = await this.verifyPassword(credentials.password, user.password);
      if (!isValid) {
        this.recordFailedAttempt(credentials.email);
        return { success: false, error: 'Invalid credentials' };
      }

      // Clear failed attempts
      this.loginAttempts.delete(credentials.email);

      // Generate token
      const token = await this.generateToken({ id: user.id, email: user.email });

      // Create session
      const session = await this.createSession(user.id, token);

      // Remove password from response
      const { password, ...userWithoutPassword } = user;

      return {
        success: true,
        user: userWithoutPassword,
        token,
        session
      };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }

  async logout(sessionId: string): Promise<void> {
    this.sessions.delete(sessionId);
  }

  async generateToken(payload: { id: string; email: string }, expiresIn: string = '7d'): Promise<string> {
    const signOptions = { expiresIn: expiresIn as any };
    return jwt.sign(payload, this.JWT_SECRET, signOptions);
  }

  async validateToken(token: string): Promise<boolean> {
    try {
      jwt.verify(token, this.JWT_SECRET);
      return true;
    } catch {
      return false;
    }
  }

  async refreshToken(oldToken: string): Promise<string> {
    try {
      const decoded = jwt.verify(oldToken, this.JWT_SECRET) as any;
      return await this.generateToken({ id: decoded.id || decoded.userId, email: decoded.email });
    } catch {
      throw new Error('Invalid token');
    }
  }

  async requestPasswordReset(email: string): Promise<PasswordResetResult> {
    const user = await this.getUserByEmail(email);
    if (!user) {
      // Don't reveal if email exists
      return { success: true, resetToken: undefined };
    }

    const resetToken = uuidv4();
    this.resetTokens.set(resetToken, {
      userId: user.id,
      expiresAt: new Date(Date.now() + 3600000) // 1 hour
    });

    // In production, send email here
    return { success: true, resetToken };
  }

  async resetPassword(resetToken: string, newPassword: string): Promise<AuthResult> {
    const tokenData = this.resetTokens.get(resetToken);
    
    if (!tokenData || tokenData.expiresAt < new Date()) {
      return { success: false, error: 'Reset token is invalid or expired' };
    }

    // Validate new password
    const passwordValidation = this.validatePasswordStrength(newPassword);
    if (!passwordValidation.valid) {
      return { success: false, error: `Password requirements: ${passwordValidation.error}` };
    }

    // Hash new password
    const hashedPassword = await this.hashPassword(newPassword);

    // Update user password
    await this.updateUserPassword(tokenData.userId, hashedPassword);

    // Remove reset token
    this.resetTokens.delete(resetToken);

    return { success: true };
  }

  async expireResetToken(token: string): Promise<void> {
    this.resetTokens.delete(token);
  }

  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, this.SALT_ROUNDS);
  }

  async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  validatePasswordStrength(password: string): { valid: boolean; error?: string } {
    if (password.length < 8) {
      return { valid: false, error: 'At least 8 characters' };
    }
    if (!/[A-Z]/.test(password)) {
      return { valid: false, error: 'At least one uppercase letter' };
    }
    if (!/[a-z]/.test(password)) {
      return { valid: false, error: 'At least one lowercase letter' };
    }
    if (!/[0-9]/.test(password)) {
      return { valid: false, error: 'At least one number' };
    }
    if (!/[!@#$%^&*]/.test(password)) {
      return { valid: false, error: 'At least one special character' };
    }
    return { valid: true };
  }

  sanitizeInput(input: string): string {
    return input
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  }

  async generateCSRFToken(): Promise<string> {
    const token = uuidv4();
    this.csrfTokens.add(token);
    // Clean old tokens periodically
    if (this.csrfTokens.size > 1000) {
      // More efficient cleanup - remove oldest tokens
      const tokensArray = Array.from(this.csrfTokens);
      const tokensToRemove = tokensArray.slice(0, 500);
      tokensToRemove.forEach(t => this.csrfTokens.delete(t));
    }
    return token;
  }

  async validateCSRFToken(token: string): Promise<boolean> {
    if (this.csrfTokens.has(token)) {
      this.csrfTokens.delete(token); // Single use
      return true;
    }
    return false;
  }

  private async createSession(userId: string, token: string): Promise<Session> {
    const session: Session = {
      id: uuidv4(),
      userId,
      token,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      createdAt: new Date()
    };

    this.sessions.set(session.id, session);
    return session;
  }

  async getSession(sessionId: string): Promise<Session | undefined> {
    return this.sessions.get(sessionId);
  }

  async validateSession(sessionId: string): Promise<boolean> {
    const session = this.sessions.get(sessionId);
    if (!session) return false;
    if (session.expiresAt < new Date()) {
      this.sessions.delete(sessionId);
      return false;
    }
    return true;
  }

  async expireSession(sessionId: string): Promise<void> {
    this.sessions.delete(sessionId);
  }

  async getActiveSessions(): Promise<Session[]> {
    const now = new Date();
    return Array.from(this.sessions.values()).filter(s => s.expiresAt > now);
  }

  async cleanupExpiredSessions(): Promise<void> {
    const now = new Date();
    for (const [id, session] of this.sessions.entries()) {
      if (session.expiresAt < now) {
        this.sessions.delete(id);
      }
    }
  }

  private isRateLimited(email: string): boolean {
    const attempts = this.loginAttempts.get(email);
    if (!attempts) return false;

    const timeSinceLastAttempt = Date.now() - attempts.lastAttempt.getTime();
    if (timeSinceLastAttempt > 15 * 60 * 1000) { // 15 minutes
      this.loginAttempts.delete(email);
      return false;
    }

    return attempts.count >= 5;
  }

  private recordFailedAttempt(email: string): void {
    const attempts = this.loginAttempts.get(email) || { count: 0, lastAttempt: new Date() };
    attempts.count++;
    attempts.lastAttempt = new Date();
    this.loginAttempts.set(email, attempts);
  }

  // Mock database methods (would use real DB in production)
  private users: Map<string, User> = new Map();

  private async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(u => u.email === email);
  }

  private async saveUser(user: User): Promise<void> {
    this.users.set(user.id, user);
  }

  private async updateUserPassword(userId: string, hashedPassword: string): Promise<void> {
    const user = this.users.get(userId);
    if (user) {
      user.password = hashedPassword;
      user.updatedAt = new Date();
    }
  }
}
