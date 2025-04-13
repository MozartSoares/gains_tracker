import { FastifyDynamicSwaggerOptions } from '@fastify/swagger';
import { FastifySwaggerUiOptions } from '@fastify/swagger-ui';
import { Equipment, MuscleGroups } from '../models/Exercise/enums';

export const swaggerOptions: FastifyDynamicSwaggerOptions = {
  openapi: {
    info: {
      title: 'Gains Tracker API',
      description: 'API for tracking workout exercises and progress',
      version: '1.0.0',
      contact: {
        name: 'API Support',
        email: 'support@gainstracker.com',
      },
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server',
      },
    ],
    tags: [
      {
        name: 'exercises',
        description: 'Exercise related endpoints',
      },
    ],
    components: {
      schemas: {
        Exercise: {
          type: 'object',
          required: ['name', 'muscleGroup', 'equipment'],
          properties: {
            id: { type: 'string', format: 'uuid' },
            name: { type: 'string' },
            description: { type: 'string' },
            muscleGroup: {
              type: 'string',
              enum: Object.values(MuscleGroups),
            },
            equipment: {
              type: 'string',
              enum: Object.values(Equipment),
            },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        Error: {
          type: 'object',
          required: ['status', 'message'],
          properties: {
            status: { type: 'number' },
            message: { type: 'string' },
          },
        },
      },
    },
  },
};

export const swaggerUiOptions: FastifySwaggerUiOptions = {
  routePrefix: '/api/api-docs',
  uiConfig: {
    docExpansion: 'list',
    deepLinking: false,
  },
  uiHooks: {
    onRequest: function (request, reply, next) {
      next();
    },
    preHandler: function (request, reply, next) {
      next();
    },
  },
  staticCSP: true,
  transformStaticCSP: (header) => header,
};
