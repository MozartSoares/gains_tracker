import { FastifyError, FastifyReply, FastifyRequest } from 'fastify';
import { AppError } from '../types/errors';
import { ValidationError } from 'yup';

export const errorHandler = (error: FastifyError, request: FastifyRequest, reply: FastifyReply) => {
  request.log.error(error);

  if (error instanceof ValidationError) {
    return reply.status(400).send({
      status: 'error',
      code: 'VALIDATION_ERROR',
      message: error.message,
      errors: error.errors,
    });
  }

  if (error instanceof AppError) {
    return reply.status(error.statusCode).send({
      status: 'error',
      code: error.code || 'APP_ERROR',
      message: error.message,
    });
  }

  return reply.status(500).send({
    status: 'error',
    code: 'INTERNAL_SERVER_ERROR',
    message: 'An unexpected error occurred',
  });
};
