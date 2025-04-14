import { FastifyRequest, FastifyReply } from 'fastify';
import { Controller, GET } from 'fastify-decorators';
import { OAuthService } from '@services/oauth.service';
import { UserService } from '@services/user.service';
import { UserModel } from '@models/User/model';
import { env } from '@config/env';
import { AppError } from '../types/errors';
import { throwError } from '@utils/throwError';

@Controller({ route: '/auth', tags: ['auth'] })
export class OAuthController {
  private oauthService: OAuthService;
  private userService: UserService;

  constructor() {
    this.userService = new UserService(UserModel);
    this.oauthService = new OAuthService(this.userService);
  }

  @GET('/github', {
    schema: {
      tags: ['auth'],
      summary: 'Redirect to GitHub for authentication',
      description: 'Redirects to GitHub for authentication',
    },
  })
  async githubAuth(request: FastifyRequest, reply: FastifyReply) {
    const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${env.GITHUB_CLIENT_ID}&scope=user:email`;
    return reply.redirect(githubAuthUrl);
  }

  @GET('/github/callback', {
    schema: {
      tags: ['auth'],
      summary: 'Handle GitHub callback',
      description: 'Handles the GitHub callback',
    },
  })
  async githubCallback(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { code } = request.query as { code: string };
      if (!code) {
        throw new AppError(400, 'Code is required');
      }

      const { user, token } = await this.oauthService.handleGithubCallback(code);

      return reply.status(200).send({
        message: 'GitHub authentication successful',
        data: { user, token },
      });
    } catch (error) {
      throwError(error, 'Failed to login with GitHub');
    }
  }
}
