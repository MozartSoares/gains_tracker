import fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import { env } from './config';
import { errorHandler } from './middleware/errorHandler';
import routes from './routes';

const app = fastify({
  logger: true,
});

app.register(cors, {
  origin: env.corsOrigin,
});
app.register(helmet);
app.register(swagger, {
  swagger: {
    info: {
      title: 'GymPal API',
      description: 'API for tracking gym progress',
      version: '1.0.0',
    },
  },
});
app.register(swaggerUi, {
  routePrefix: '/api-docs',
});

app.setErrorHandler(errorHandler);

app.register(routes, { prefix: '/api' });

export default app;
