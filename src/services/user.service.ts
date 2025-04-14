import { User, getResponseUser } from '../models/User/model';
import { AppError } from '../types/errors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '../config';
import { ReturnModelType, DocumentType } from '@typegoose/typegoose';
import { AuthProviders, providerMap, providerNameMap } from '@models/User/auth';
import crypto from 'crypto';
import { Types } from 'mongoose';

export class UserService {
  constructor(protected model: ReturnModelType<new () => User>) {}

  private generateSessionToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  private generateToken(user: DocumentType<User>, sessionToken: string): string {
    if (!env.JWT_SECRET) {
      throw new AppError(500, 'JWT secret not configured');
    }

    return jwt.sign(
      {
        id: user._id.toString(),
        email: user.email,
        sessionToken,
      },
      env.JWT_SECRET,
      { expiresIn: '1d' },
    );
  }

  async findByEmail(email: string) {
    return this.model.findOne({ email }).select('+sessionToken');
  }

  async register(data: { email: string; password: string; name: string }) {
    const existingUser = await this.model.findOne({ email: data.email });
    if (existingUser) {
      throw new AppError(400, 'Email already registered');
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);
    const sessionToken = this.generateSessionToken();

    const user = await this.model.create({
      ...data,
      password: hashedPassword,
      provider: AuthProviders.LOCAL,
      sessionToken,
    });

    return user;
  }

  async login(email: string, password: string): Promise<{ user: User; token: string }> {
    const user = await this.model.findOne({ email }).select('+sessionToken +password');
    if (!user) {
      throw new AppError(401, 'Invalid credentials');
    }

    if (!user.password && user.provider !== AuthProviders.LOCAL) {
      throw new AppError(401, `Please login with ${providerNameMap[user.provider]}`);
    }

    if (!user.password && user.provider === AuthProviders.LOCAL) {
      throw new AppError(401, 'Please login with GitHub');
    }

    const isValidPassword = await bcrypt.compare(password, user.password!);
    if (!isValidPassword) {
      throw new AppError(401, 'Invalid credentials');
    }

    // Generate new session token on login
    const sessionToken = this.generateSessionToken();
    user.sessionToken = sessionToken;
    await user.save();

    const token = this.generateToken(user, sessionToken);

    return { user, token };
  }

  async logout(userId: string): Promise<void> {
    const user = await this.model.findById(userId).select('+sessionToken');
    if (!user) {
      throw new AppError(404, 'User not found');
    }

    // Invalidate current session by generating a new token
    user.sessionToken = undefined;
    await user.save();
  }

  async validateSession(userId: string, sessionToken: string): Promise<boolean> {
    const user = await this.model.findById(userId).select('+sessionToken');
    if (!user || !user.sessionToken) {
      return false;
    }

    return user.sessionToken === sessionToken;
  }

  async getProfile(userId: string) {
    const user = await this.model.findById(userId);
    if (!user) {
      throw new AppError(404, 'User not found');
    }
    return {
      message: 'User profile retrieved successfully',
      data: user,
    };
  }

  async changePassword(
    userId: string,
    oldPassword: string | null,
    newPassword: string,
  ): Promise<void> {
    const user = await this.model.findById(userId).select('+password');
    if (!user) {
      throw new AppError(404, 'User not found');
    }

    if (user.password) {
      const isValidPassword = await bcrypt.compare(oldPassword!, user.password);
      if (!isValidPassword) {
        throw new AppError(401, 'Invalid current password');
      }
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const user = await this.model
      .findOne({
        resetPasswordToken: token,
        resetPasswordExpires: { $gt: Date.now() },
      })
      .select('+password');

    if (!user) {
      throw new AppError(400, 'Invalid or expired reset token');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();
  }

  async findOrCreateOAuthUser(profile: any, provider: AuthProviders) {
    const { id, email, name } = profile;
    const providerId = providerMap[provider] as keyof User;

    let user = await this.model.findOne({ [providerId]: id }).select('+sessionToken');

    if (!user) {
      user = (await this.model.findOne({ email }).select('+sessionToken')) as DocumentType<User>;
      if (user) {
        user[providerId] = id;
        user.provider = provider;
        await user.save();
      } else {
        const sessionToken = this.generateSessionToken();
        user = await this.model.create({
          email,
          name,
          [providerId]: id,
          provider,
          sessionToken,
        });
      }
    }

    // Generate new session token on login
    const sessionToken = this.generateSessionToken();
    user.sessionToken = sessionToken;
    await user.save();

    const token = this.generateToken(user, sessionToken);

    return { user, token };
  }
}
