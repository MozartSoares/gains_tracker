import { UserService } from '../services/user.service';
import { FastifyRequest, FastifyReply } from 'fastify';
import { Controller, GET, POST } from 'fastify-decorators';
import * as yup from 'yup';
import { AppError } from '../types/errors';
import { throwError } from '@utils/throwError';
import { authMiddleware, optionalAuthMiddleware } from '@middleware/auth.middleware';
import { User, UserModel, getResponseUser } from '@models/User/model';

@Controller({ route: '/users', tags: ['user'] })
export class UserController {
  private service: UserService;

  constructor() {
    this.service = new UserService(UserModel);
  }

  @POST('/register', {
    schema: {
      body: {
        type: 'object',
        properties: {
          email: { type: 'string', format: 'email' },
          password: { type: 'string', minLength: 6 },
          name: { type: 'string' },
        },
        required: ['email', 'password', 'name'],
      },
    },
  })
  async register(request: FastifyRequest, reply: FastifyReply) {
    try {
      const data = await yup
        .object({
          email: yup.string().email().required(),
          password: yup.string().min(6).required(),
          name: yup.string().required(),
        })
        .validate(request.body);

      const user = await this.service.register(data);
      return reply.status(201).send({
        message: 'User registered successfully',
        data: { name: user.name, email: user.email },
      });
    } catch (error) {
      throwError(error, 'Failed to register user');
    }
  }

  @POST('/login', {
    schema: {
      body: {
        type: 'object',
        properties: {
          email: { type: 'string', format: 'email' },
          password: { type: 'string' },
        },
        required: ['email', 'password'],
      },
    },
  })
  async login(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { email, password } = await yup
        .object({
          email: yup.string().email().required(),
          password: yup.string().required(),
        })
        .validate(request.body);

      const result = await this.service.login(email, password);
      return reply.status(200).send({
        message: 'Login successful',
        data: { name: result.user.name, email: result.user.email, token: result.token },
      });
    } catch (error) {
      if (error instanceof AppError && error.message === 'Please login with GitHub') {
        return reply.status(401).send({
          message: 'Please login with GitHub',
          githubAuthUrl: '/auth/github',
        });
      }
      throwError(error, 'Failed to login');
    }
  }

  @POST('/change-password', {
    schema: {
      body: {
        type: 'object',
        properties: {
          oldPassword: { type: 'string' },
          newPassword: { type: 'string' },
        },
        required: ['newPassword'],
      },
    },
    preHandler: [authMiddleware],
  })
  async changePassword(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { oldPassword, newPassword } = await yup
        .object({
          oldPassword: yup.string().default(null),
          newPassword: yup.string().min(6).required(),
        })
        .validate(request.body);

      await this.service.changePassword(request.user!.id, oldPassword, newPassword);
      return reply.status(200).send({ message: 'Password changed successfully' });
    } catch (error) {
      throwError(error, 'Failed to change password');
    }
  }

  @GET('/profile', { preHandler: [authMiddleware] })
  async getProfile(request: FastifyRequest, reply: FastifyReply) {
    try {
      const user = await this.service.getProfile(request.user!.id);
      const userResponse = getResponseUser(user as unknown as User & { _id: string });
      return reply
        .status(200)
        .send({ message: 'Profile retrieved successfully', data: userResponse });
    } catch (error) {
      throwError(error, 'Failed to retrieve profile');
    }
  }

  @POST('/logout', {
    schema: {
      security: [{ bearerAuth: [] }],
    },
    preHandler: [optionalAuthMiddleware],
  })
  async logout(request: FastifyRequest, reply: FastifyReply) {
    try {
      await this.service.logout(request.user!.id);
      return reply.status(200).send({ message: 'Logged out successfully' });
    } catch (error) {
      throwError(error, 'Failed to logout');
    }
  }
}
