import { FastifyInstance } from 'fastify';
import { bootstrap } from 'fastify-decorators';
import { ExerciseController } from '../controllers/exercise.controller';

export async function exerciseRoutes(fastify: FastifyInstance) {
  await bootstrap(fastify, {
    controllers: [ExerciseController],
  });
}
