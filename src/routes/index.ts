import { FastifyInstance } from 'fastify';
import { bootstrap } from 'fastify-decorators';
import { ExerciseController } from '@controllers/exercise.controller';
import { WorkoutController } from '@controllers/workout.controller';
import { ProgramController } from '@controllers/program.controller';
import { OAuthController } from '@controllers/oauth.controller';
import { UserController } from '@/controllers/user.controller';

export async function routes(fastify: FastifyInstance) {
  fastify.get('/', async () => {
    return { message: 'Welcome to the gains tracker API' };
  });

  await bootstrap(fastify, {
    controllers: [
      ExerciseController,
      WorkoutController,
      ProgramController,
      OAuthController,
      UserController,
    ],
  });
}

export default routes;
