import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { DatabaseService, User } from './DatabaseService.js';

export interface AuthRequest {
  username?: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  token?: string;
  user?: Omit<User, 'password'>;
  message?: string;
}

export interface JWTPayload {
  userId: number;
  email: string;
  iat?: number;
  exp?: number;
}

export class AuthService {
  private dbService: DatabaseService;
  private jwtSecret: string;

  constructor(dbService: DatabaseService) {
    this.dbService = dbService;
    this.jwtSecret = process.env.JWT_SECRET || 'your-secret-key-change-this-in-production';
  }

  async register(authRequest: AuthRequest): Promise<AuthResponse> {
    try {
      const { username, email, password } = authRequest;

      if (!username || !email || !password) {
        return {
          success: false,
          message: 'Username, email, and password are required'
        };
      }

      // Check if user already exists
      const existingUser = await this.dbService.getUserByEmail(email);
      if (existingUser) {
        return {
          success: false,
          message: 'User with this email already exists'
        };
      }

      // Hash password
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Create user
      const newUser = await this.dbService.createUser(username, email, hashedPassword);

      // Generate JWT token
      const token = this.generateToken({
        userId: newUser.id,
        email: newUser.email
      });

      return {
        success: true,
        token,
        user: {
          id: newUser.id,
          username: newUser.username,
          email: newUser.email,
          created_at: newUser.created_at,
          updated_at: newUser.updated_at
        }
      };
    } catch (error: any) {
      console.error('Registration error:', error);
      return {
        success: false,
        message: error.message || 'Registration failed'
      };
    }
  }

  async login(authRequest: AuthRequest): Promise<AuthResponse> {
    try {
      const { email, password } = authRequest;

      if (!email || !password) {
        return {
          success: false,
          message: 'Email and password are required'
        };
      }

      // Find user by email
      const user = await this.dbService.getUserByEmail(email);
      if (!user) {
        return {
          success: false,
          message: 'Invalid email or password'
        };
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return {
          success: false,
          message: 'Invalid email or password'
        };
      }

      // Generate JWT token
      const token = this.generateToken({
        userId: user.id,
        email: user.email
      });

      return {
        success: true,
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          created_at: user.created_at,
          updated_at: user.updated_at
        }
      };
    } catch (error: any) {
      console.error('Login error:', error);
      return {
        success: false,
        message: error.message || 'Login failed'
      };
    }
  }

  async verifyToken(token: string): Promise<{ success: boolean; user?: Omit<User, 'password'>; message?: string }> {
    try {
      const decoded = jwt.verify(token, this.jwtSecret) as JWTPayload;
      const user = await this.dbService.getUserById(decoded.userId);

      if (!user) {
        return {
          success: false,
          message: 'User not found'
        };
      }

      return {
        success: true,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          created_at: user.created_at,
          updated_at: user.updated_at
        }
      };
    } catch (error: any) {
      console.error('Token verification error:', error);
      return {
        success: false,
        message: 'Invalid or expired token'
      };
    }
  }

  private generateToken(payload: JWTPayload): string {
    return jwt.sign(payload, this.jwtSecret, { expiresIn: '7d' });
  }

  async refreshToken(token: string): Promise<AuthResponse> {
    const verificationResult = await this.verifyToken(token);
    
    if (!verificationResult.success || !verificationResult.user) {
      return {
        success: false,
        message: verificationResult.message || 'Token refresh failed'
      };
    }

    // Generate new token
    const newToken = this.generateToken({
      userId: verificationResult.user.id,
      email: verificationResult.user.email
    });

    return {
      success: true,
      token: newToken,
      user: verificationResult.user
    };
  }
}
