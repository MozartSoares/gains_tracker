import { BaseService } from './base.service';
import { User, UserModel } from '../models/User/model';
import { AppError } from '../types/errors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '../config';
import { ReturnModelType } from '@typegoose/typegoose';
import { AuthProviders, providerMap, providerNameMap } from '@models/User/auth';
import { Controller } from 'fastify-decorators';

export class UserService {
  constructor(protected model: ReturnModelType<new () => User>) {}

  async findByEmail(email: string): Promise<User | null> {
    return this.model.findOne({ email });
  }

  async register(data: { email: string; password: string; name: string }): Promise<User> {
    const existingUser = await this.model.findOne({ email: data.email });
    if (existingUser) {
      throw new AppError(400, 'Email already registered');
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);
    return this.model.create({
      ...data,
      password: hashedPassword,
      provider: AuthProviders.LOCAL,
    });
  }

  async login(email: string, password: string): Promise<{ user: User; token: string }> {
    const user = await this.model.findOne({ email });
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

    if (!env.JWT_SECRET) {
      throw new AppError(500, 'JWT secret not configured');
    }

    const token = jwt.sign({ id: user._id, email: user.email }, env.JWT_SECRET, {
      expiresIn: '1d',
    });

    user.lastLogin = new Date();
    await user.save();

    return { user, token };
  }

  async getProfile(userId: string): Promise<{ message: string; data: User }> {
    const user = await this.model.findById(userId).select('-password');
    if (!user) {
      throw new AppError(404, 'User not found');
    }
    return { message: 'User profile retrieved successfully', data: user };
  }

  async changePassword(
    userId: string,
    oldPassword: string | null,
    newPassword: string,
  ): Promise<void> {
    const user = await this.model.findById(userId);
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
    const user = await this.model.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      throw new AppError(400, 'Invalid or expired reset token');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();
  }

  async logout(userId: string): Promise<void> {}

  async findOrCreateOAuthUser(
    profile: any,
    provider: AuthProviders,
  ): Promise<{ user: User; token: string }> {
    const { id, email, name } = profile;
    const providerId = providerMap[provider] as keyof User;

    let user = await this.model.findOne({ [providerId]: id });

    if (!user) {
      user = await this.model.findOne({ email });
      if (user) {
        user[providerId] = id;
        user.provider = provider;
        await user.save();
      } else {
        user = await this.model.create({
          email,
          name,
          [providerId]: id,
          provider,
        });
      }
    }

    if (!env.JWT_SECRET) {
      throw new AppError(500, 'JWT secret not configured');
    }

    const token = jwt.sign({ id: user._id, email: user.email }, env.JWT_SECRET, {
      expiresIn: '7d',
    });

    user.lastLogin = new Date();
    await user.save();

    return { user, token };
  }
}
