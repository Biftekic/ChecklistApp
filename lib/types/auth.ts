export interface User {
  id: string;
  email: string;
  password?: string;
  name?: string;
  image?: string;
  role?: 'user' | 'admin';
  emailVerified?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthCredentials {
  email: string;
  password: string;
  name?: string;
}

export interface AuthResult {
  success: boolean;
  user?: User;
  token?: string;
  session?: Session;
  error?: string;
}

export interface Session {
  id: string;
  userId: string;
  token: string;
  expiresAt: Date;
  createdAt: Date;
}

export interface PasswordResetResult {
  success: boolean;
  resetToken?: string;
  error?: string;
}

export interface TokenPayload {
  userId: string;
  email: string;
  iat?: number;
  exp?: number;
}
