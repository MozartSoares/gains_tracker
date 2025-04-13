import { FastifyDynamicSwaggerOptions } from '@fastify/swagger';
import { FastifySwaggerUiOptions } from '@fastify/swagger-ui';
import { Equipment, MuscleGroups } from '../models/Exercise/enums';

export const swaggerOptions: FastifyDynamicSwaggerOptions = {
  openapi: {
    info: {
      title: 'Gains Tracker API',
      description: 'API for tracking workout exercises and progress',
      version: '1.0.0',
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
            name: { type: 'string', example: 'Bench Press' },
            description: {
              type: 'string',
              example: 'Classic chest exercise performed lying on a flat bench',
            },
            muscleGroup: {
              type: 'string',
              enum: Object.values(MuscleGroups),
              example: 'CHEST',
            },
            equipment: {
              type: 'string',
              enum: Object.values(Equipment),
              example: 'BARBELL',
            },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        CreateExercise: {
          type: 'object',
          required: ['name', 'muscleGroup', 'equipment'],
          properties: {
            name: { type: 'string', example: 'Bench Press' },
            description: {
              type: 'string',
              example: 'Classic chest exercise performed lying on a flat bench',
            },
            muscleGroup: {
              type: 'string',
              enum: Object.values(MuscleGroups),
              example: 'CHEST',
            },
            equipment: {
              type: 'string',
              enum: Object.values(Equipment),
              example: 'BARBELL',
            },
          },
        },
        UpdateExercise: {
          type: 'object',
          properties: {
            name: { type: 'string', example: 'Bench Press' },
            description: {
              type: 'string',
              example: 'Classic chest exercise performed lying on a flat bench',
            },
            muscleGroup: {
              type: 'string',
              enum: Object.values(MuscleGroups),
              example: 'CHEST',
            },
            equipment: {
              type: 'string',
              enum: Object.values(Equipment),
              example: 'BARBELL',
            },
          },
        },
        Error: {
          type: 'object',
          required: ['status', 'message'],
          properties: {
            status: { type: 'number', example: 400 },
            message: { type: 'string', example: 'Validation error' },
          },
        },
      },
    },
  },
};

export const swaggerUiOptions: FastifySwaggerUiOptions = {
  routePrefix: '/api/docs',
  uiConfig: {
    docExpansion: 'list',
    deepLinking: false,
    displayRequestDuration: true,
    filter: true,
    showExtensions: true,
    showCommonExtensions: true,
  },
  staticCSP: true,
};
