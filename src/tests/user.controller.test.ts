import { UserController } from '@controllers/user.controller';
import { UserService } from '@services/user.service';
import { FastifyRequest, FastifyReply } from 'fastify';
import { AppError } from '../types/errors';
import { UserModel } from '@models/User/model';

jest.mock('@services/user.service');

describe('UserController', () => {
  let controller: UserController;
  let mockRequest: Partial<FastifyRequest>;
  let mockReply: Partial<FastifyReply>;

  beforeEach(() => {
    controller = new UserController();
    mockReply = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
  });

  describe('GET /users/profile', () => {
    it('should return user profile', async () => {
      mockRequest = { user: { id: 'user1', email: 'user@example.com' } };
      const mockUser = {
        _id: 'user1',
        name: 'Test User',
        email: 'user@example.com',
        isEmailVerified: true,
      };

      (UserService.prototype.getProfile as jest.Mock).mockResolvedValue(mockUser);

      await controller.getProfile(mockRequest as FastifyRequest, mockReply as FastifyReply);

      expect(mockReply.status).toHaveBeenCalledWith(200);
      expect(mockReply.send).toHaveBeenCalledWith({
        message: 'Profile retrieved successfully',
        data: expect.any(Object),
      });
    });

    it('should handle errors', async () => {
      mockRequest = { user: { id: 'user1', email: 'user@example.com' } };
      (UserService.prototype.getProfile as jest.Mock).mockRejectedValue(new Error('Test error'));

      await expect(
        controller.getProfile(mockRequest as FastifyRequest, mockReply as FastifyReply),
      ).rejects.toThrow();
    });
  });
});
