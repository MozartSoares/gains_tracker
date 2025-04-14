import { FastifyRequest, FastifyReply } from 'fastify';
import jwt from 'jsonwebtoken';
import { AppError } from '@/types/errors';
import { env } from '@config/env';
import { UserService } from '@services/user.service';
import { UserModel } from '@models/User/model';

const userService = new UserService(UserModel);

declare module 'fastify' {
  interface FastifyRequest {
    user?: {
      id: string;
      email: string;
    } | null;
  }
}

export const authMiddleware = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const authHeader = request.headers.authorization;
    if (!authHeader) {
      throw new AppError(401, 'No token provided');
    }

    const [, token] = authHeader.split(' ');
    if (!token) {
      throw new AppError(401, 'Invalid token format');
    }

    if (!env.JWT_SECRET) {
      throw new AppError(500, 'JWT secret not configured');
    }

    const decoded = jwt.verify(token, env.JWT_SECRET) as {
      id: string;
      email: string;
      sessionToken: string;
    };
    const isValidSession = await userService.validateSession(decoded.id, decoded.sessionToken);

    if (!isValidSession) {
      throw new AppError(401, 'Session expired');
    }

    request.user = { id: decoded.id, email: decoded.email };
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      throw new AppError(401, 'Invalid token');
    }
    throw error;
  }
};

export const optionalAuthMiddleware = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    await authMiddleware(request, reply);
  } catch (error) {
    request.user = null;
  }
};
