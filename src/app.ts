import fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import { env } from './config';
import { errorHandler } from './middleware/errorHandler';
import { exerciseRoutes } from './routes/exercise.routes';
import { swaggerOptions, swaggerUiOptions } from './docs/swagger';
import { connectDB } from './config/database';

const app = fastify({
  logger: true,
});

// Connect to MongoDB
connectDB();

app.register(cors, {
  origin: env.CORS_ORIGIN,
});
app.register(helmet);
app.register(swagger, {
  ...swaggerOptions,
  mode: 'dynamic',
});
app.register(swaggerUi, swaggerUiOptions);

app.setErrorHandler(errorHandler);

app.register(exerciseRoutes, { prefix: '/api' });

export default app;
