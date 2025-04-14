import dotenv from 'dotenv';

dotenv.config({ path: '.env.test' });

jest.mock('@config/env', () => ({
  env: {
    PORT: '3000',
    MONGODB_URI: 'mongodb://localhost:27017/test',
    JWT_SECRET: 'test_secret',
    CORS_ORIGIN: '*',
    NODE_ENV: 'test',
    GITHUB_CLIENT_ID: 'test_client_id',
    GITHUB_CLIENT_SECRET: 'test_client_secret',
    GITHUB_CALLBACK_URL: 'http://localhost:3000/api/auth/github/callback',
  },
}));
