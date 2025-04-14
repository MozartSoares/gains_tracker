import { env } from '@config/env';
import { UserService } from '@services/user.service';
import { AppError } from '../types/errors';
import axios from 'axios';
import { AuthProviders } from '@models/User/auth';

export class OAuthService {
  constructor(private userService: UserService) {}

  async handleGithubCallback(code: string) {
    try {
      const tokenResponse = await axios.post(
        'https://github.com/login/oauth/access_token',
        {
          client_id: env.GITHUB_CLIENT_ID,
          client_secret: env.GITHUB_CLIENT_SECRET,
          code,
        },
        {
          headers: {
            Accept: 'application/json',
          },
        },
      );

      const accessToken = tokenResponse.data.access_token;
      if (!accessToken) {
        throw new AppError(401, 'Failed to get access token');
      }

      // Get user profile from GitHub
      const userResponse = await axios.get('https://api.github.com/user', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const emailResponse = await axios.get('https://api.github.com/user/emails', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const primaryEmail = emailResponse.data.find((email: any) => email.primary)?.email;

      const profile = {
        id: userResponse.data.id.toString(),
        email: primaryEmail || userResponse.data.email,
        name: userResponse.data.name || userResponse.data.login,
      };

      return this.userService.findOrCreateOAuthUser(profile, AuthProviders.GITHUB);
    } catch (error) {
      throw new AppError(401, 'GitHub authentication failed');
    }
  }
}
