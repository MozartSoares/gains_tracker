import { FastifyDynamicSwaggerOptions } from '@fastify/swagger';
import { FastifySwaggerUiOptions } from '@fastify/swagger-ui';
import { Equipment, MuscleGroups } from '@models/Exercise/enums';
import { ProgramObjective, ProgramLevel } from '@models/Program/enums';
import { env } from '@config/env';

const isProd = env.NODE_ENV === 'production';
const baseUrl = isProd ? 'https://gains-tracker-14tn.onrender.com' : `http://localhost:${env.PORT}`;

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
        url: baseUrl,
        description: isProd ? 'Production server' : 'Development server',
      },
    ],
    security: [
      {
        bearerAuth: [],
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        Exercise: {
          type: 'object',
          required: ['name', 'muscleGroups', 'equipment'],
          properties: {
            id: { type: 'string', format: 'uuid' },
            name: { type: 'string' },
            description: { type: 'string' },
            muscleGroups: {
              type: 'array',
              items: {
                type: 'string',
                enum: Object.values(MuscleGroups),
              },
            },
            equipment: {
              type: 'string',
              enum: Object.values(Equipment),
            },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        WorkoutExercise: {
          type: 'object',
          required: ['exercise', 'sets', 'reps'],
          properties: {
            exercise: { $ref: '#/components/schemas/Exercise' },
            sets: { type: 'number', minimum: 1 },
            reps: { type: 'number', minimum: 1 },
            weight: { type: 'number', minimum: 0 },
          },
        },
        Workout: {
          type: 'object',
          required: ['name', 'duration', 'exercises'],
          properties: {
            id: { type: 'string', format: 'uuid' },
            name: { type: 'string' },
            description: { type: 'string' },
            duration: { type: 'number', minimum: 1, description: 'Duration in minutes' },
            exercises: {
              type: 'array',
              items: { $ref: '#/components/schemas/WorkoutExercise' },
              minItems: 1,
            },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        ProgramWorkout: {
          type: 'object',
          required: ['workout', 'order'],
          properties: {
            workout: { $ref: '#/components/schemas/Workout' },
            order: { type: 'number', minimum: 1 },
            focus: { type: 'string' },
            tips: { type: 'string' },
          },
        },
        Program: {
          type: 'object',
          required: ['name', 'objective', 'duration', 'workouts'],
          properties: {
            id: { type: 'string', format: 'uuid' },
            name: { type: 'string' },
            description: { type: 'string' },
            objective: {
              type: 'string',
              enum: Object.values(ProgramObjective),
            },
            duration: { type: 'number', minimum: 1, description: 'Duration in weeks' },
            workouts: {
              type: 'array',
              items: { $ref: '#/components/schemas/ProgramWorkout' },
              minItems: 1,
            },
            frequency: { type: 'number', minimum: 1, description: 'Workouts per week' },
            level: {
              type: 'string',
              enum: Object.values(ProgramLevel),
            },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        User: {
          type: 'object',
          required: ['email', 'name'],
          properties: {
            id: { type: 'string', format: 'uuid' },
            email: { type: 'string', format: 'email' },
            name: { type: 'string' },
            isEmailVerified: { type: 'boolean', default: false },
            lastLogin: { type: 'string', format: 'date-time' },
            isActive: { type: 'boolean', default: true },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        LoginResponse: {
          type: 'object',
          required: ['user', 'token'],
          properties: {
            user: { $ref: '#/components/schemas/User' },
            token: { type: 'string' },
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
    displayRequestDuration: true,
    filter: true,
    showExtensions: true,
    showCommonExtensions: true,
    persistAuthorization: true,
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
