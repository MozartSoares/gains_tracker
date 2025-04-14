import { FastifyRequest, FastifyReply } from 'fastify';
import jwt from 'jsonwebtoken';
import { AppError } from '@/types/errors';
import { env } from '@config/env';

declare module 'fastify' {
  interface FastifyRequest {
    user?: {
      id: string;
      email: string;
      provider?: string;
    };
  }
}

export const authMiddleware = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const authHeader = request.headers.authorization;
    if (!authHeader) {
      throw new AppError(401, 'No token provided');
    }
    console.log('optionalAuthMiddleware', authHeader);

    const token = authHeader.split(' ')[1];
    if (!token) {
      throw new AppError(401, 'Invalid token format');
    }

    if (!env.JWT_SECRET) {
      throw new AppError(500, 'JWT secret not configured');
    }

    const decoded = jwt.verify(token, env.JWT_SECRET) as {
      id: string;
      email: string;
      provider?: string;
    };
    console.log('🚀 ~ decoded ~ decoded:', decoded);

    request.user = decoded;
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      throw new AppError(401, 'Invalid token');
    }
    throw error;
  }
};

export const optionalAuthMiddleware = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const authHeader = request.headers.authorization;
    if (!authHeader) {
      return;
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return;
    }

    if (!env.JWT_SECRET) {
      return;
    }

    const decoded = jwt.verify(token, env.JWT_SECRET) as {
      id: string;
      email: string;
      provider?: string;
    };

    request.user = decoded;
  } catch (error) {
    // Silently fail for optional auth
    return;
  }
};
