import { OAuthController } from '@controllers/oauth.controller';
import { OAuthService } from '@services/oauth.service';
import { FastifyRequest, FastifyReply } from 'fastify';
import { AppError } from '../types/errors';
import { env } from '@config/env';

jest.mock('@services/oauth.service');
jest.mock('@services/user.service');

describe('OAuthController', () => {
  let controller: OAuthController;
  let mockRequest: Partial<FastifyRequest>;
  let mockReply: Partial<FastifyReply>;

  beforeEach(() => {
    controller = new OAuthController();
    mockReply = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
      redirect: jest.fn(),
    };
  });

  describe('GET /auth/github', () => {
    it('should redirect to GitHub auth', async () => {
      await controller.githubAuth(mockRequest as FastifyRequest, mockReply as FastifyReply);

      expect(mockReply.redirect).toHaveBeenCalledWith(
        `https://github.com/login/oauth/authorize?client_id=${env.GITHUB_CLIENT_ID}&scope=user:email`,
      );
    });
  });

  describe('GET /auth/github/callback', () => {
    it('should handle GitHub callback successfully', async () => {
      mockRequest = { query: { code: 'test_code' } };
      const mockResponse = {
        user: { id: 'user1', email: 'user@example.com', name: 'Test User' },
        token: 'test_token',
      };

      (OAuthService.prototype.handleGithubCallback as jest.Mock).mockResolvedValue(mockResponse);

      await controller.githubCallback(mockRequest as FastifyRequest, mockReply as FastifyReply);

      expect(mockReply.status).toHaveBeenCalledWith(200);
      expect(mockReply.send).toHaveBeenCalledWith({
        message: 'GitHub authentication successful',
        data: mockResponse,
      });
    });

    it('should handle missing code', async () => {
      mockRequest = { query: {} };

      await expect(
        controller.githubCallback(mockRequest as FastifyRequest, mockReply as FastifyReply),
      ).rejects.toThrow(new AppError(400, 'Code is required'));
    });

    it('should handle GitHub auth errors', async () => {
      mockRequest = { query: { code: 'test_code' } };
      (OAuthService.prototype.handleGithubCallback as jest.Mock).mockRejectedValue(
        new AppError(401, 'GitHub authentication failed'),
      );

      await expect(
        controller.githubCallback(mockRequest as FastifyRequest, mockReply as FastifyReply),
      ).rejects.toThrow(new AppError(401, 'GitHub authentication failed'));
    });
  });
});
