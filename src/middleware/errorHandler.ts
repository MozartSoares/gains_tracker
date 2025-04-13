import { FastifyError, FastifyReply, FastifyRequest } from 'fastify';
import { AppError } from '../types/errors';

export const errorHandler = (error: FastifyError, request: FastifyRequest, reply: FastifyReply) => {
  request.log.error(error);

  if (error instanceof AppError) {
    return reply.status(error.statusCode).send({
      status: 'error',
      code: error.code,
      message: error.message,
    });
  }

  return reply.status(500).send({
    status: 'error',
    code: 'INTERNAL_SERVER_ERROR',
    message: 'Internal server error',
  });
};
