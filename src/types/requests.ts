import { FastifyRequest } from 'fastify';

export interface CreateRequest<T>
  extends FastifyRequest<{
    Body: Partial<T>;
  }> {}

export interface UpdateRequest<T>
  extends FastifyRequest<{
    Params: { id: string };
    Body: Partial<T>;
  }> {}

export interface IdRequest
  extends FastifyRequest<{
    Params: { id: string };
  }> {}
