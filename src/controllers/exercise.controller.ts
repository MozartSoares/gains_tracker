import { Exercise, getResponseExercise } from '@models/Exercise/model';
import { ExerciseService } from '../services/exercise.service';
import { FastifyRequest, FastifyReply } from 'fastify';
import { Controller, GET, POST, PUT, DELETE } from 'fastify-decorators';
import * as yup from 'yup';
import { Equipment, MuscleGroups } from '@models/Exercise/enums';
import { AppError } from '../types/errors';
import { throwError } from '../utils/throwError';
import { authMiddleware, optionalAuthMiddleware } from '../middleware/auth.middleware';

@Controller({ route: '/exercises', tags: ['exercises'] })
export class ExerciseController {
  private service: ExerciseService;

  constructor() {
    this.service = new ExerciseService();
  }

  @GET('/', {
    preHandler: [optionalAuthMiddleware],
    schema: {
      security: [{ bearerAuth: [] }],
    },
  })
  async findAll(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id: userId } = request.user || { id: null };
      const rawExercises = await this.service.findAll(userId);
      const exercises = rawExercises.map((exercise) => getResponseExercise(exercise as unknown as Exercise & {_id: string}));
      
      return reply.status(200).send({ message: 'Exercises retrieved successfully', data: exercises });
    } catch (error) {
      throwError(error, 'Failed to retrieve exercises');
    }
  }

  @GET('/default', {
    schema: {
      security: [{ bearerAuth: [] }],
    },
    preHandler: [optionalAuthMiddleware],
  })
  async findDefaultExercises(request: FastifyRequest, reply: FastifyReply) {
    try {
      const rawExercises = await this.service.findDefaultExercises();
      const exercises = rawExercises.map((exercise) => getResponseExercise(exercise as unknown as Exercise & {_id: string}));
      return reply.status(200).send({ message: 'Default exercises retrieved successfully', data: exercises });
    } catch (error) {
      throwError(error, 'Failed to retrieve default exercises');
    }
  }

  @GET('/me', {
    schema: {
      security: [{ bearerAuth: [] }],
    },
    preHandler: [authMiddleware],
  })
  async findMyExercises(request: FastifyRequest, reply: FastifyReply) {
    const { id: userId } = request.user!
    const rawExercises = await this.service.findMyExercises(userId);
    const exercises = rawExercises.map((exercise) => getResponseExercise(exercise as unknown as Exercise & {_id: string}));
    return reply.status(200).send({ message: 'User exercises retrieved successfully', data: exercises });
  }

  @GET('/:id', {
    schema: {
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' },
        },  
      },
      security: [{ bearerAuth: [] }],
    },
    preHandler: [optionalAuthMiddleware],
  })
  async findById(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = await yup
        .object({
          id: yup.string().required('ID is required'),
        })
        .validate(request.params);
      const { id: userId } = request.user || { id: null };

      const rawExercise = await this.service.findById(id, userId);
      if (!rawExercise) {
        throw new AppError(404, 'Exercise not found');
      }
      const exercise = getResponseExercise(rawExercise as unknown as Exercise & {_id: string});
      
      return reply.status(200).send({ message: 'Exercise retrieved successfully', data: exercise });
    } catch (error) {
      throwError(error, 'Failed to retrieve exercise');
    }
  }

  @POST('/', {
    schema: {
      body: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          description: { type: 'string' },
          muscleGroups: { 
            type: 'array',
            items: { type: 'string', enum: Object.values(MuscleGroups) },
            minItems: 1
          },
          equipment: { type: 'string', enum: Object.values(Equipment) },
          isPrivate: { type: 'boolean', default: false }
        },
        required: ['name', 'muscleGroups', 'equipment']
      },
      security: [{ bearerAuth: [] }],
    },
    preHandler: [authMiddleware],
  })
  async create(request: FastifyRequest<{ Body: any }>, reply: FastifyReply) {
    try {
      const data = (await yup
        .object({
          name: yup.string().required('Name is required'),
          description: yup.string().optional(),
          muscleGroups: yup
            .array()
            .of(yup.mixed<MuscleGroups>().oneOf(Object.values(MuscleGroups), 'Invalid muscle group'))
            .min(1, 'At least one muscle group is required')
            .required('Muscle groups are required'),
          equipment: yup
            .mixed<Equipment>()
            .oneOf(Object.values(Equipment), 'Invalid equipment')
            .required('Equipment is required'),
        })
        .validate(request.body)) as Exercise;

      const exercise = await this.service.create(data, request.user!.id);
      return reply.status(201).send({ message: 'Exercise created successfully', data: exercise });
    } catch (error) {
      throwError(error, 'Failed to create exercise');
    }
  }

  @PUT('/:id', {
    schema: {
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' },
        },
      },
      body: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          description: { type: 'string' },
          muscleGroups: { 
            type: 'array',
            items: { type: 'string', enum: Object.values(MuscleGroups) },
            minItems: 1
          },
          equipment: { type: 'string', enum: Object.values(Equipment) },
          isPrivate: { type: 'boolean', default: false }
        }
      },
      security: [{ bearerAuth: [] }],
    },
    preHandler: [authMiddleware],
  })
  async update(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = await yup
        .object({
          id: yup.string().required('ID is required'),
        })
        .validate(request.params);

      const data = (await yup
        .object({
          name: yup.string().optional(),
          description: yup.string().optional(),
          muscleGroups: yup
            .array()
            .of(yup.mixed<MuscleGroups>().oneOf(Object.values(MuscleGroups), 'Invalid muscle group'))
            .min(1, 'At least one muscle group is required')
            .optional(),
          equipment: yup.mixed<Equipment>().oneOf(Object.values(Equipment), 'Invalid equipment').optional(),
        })
        .validate(request.body)) as Partial<Exercise>;

      const exercise = await this.service.findById(id, request.user!.id);
      if (!exercise) {
        throw new AppError(404, 'Exercise not found');
      }

      if (!exercise.userId) {
        throw new AppError(403, 'Cannot update default exercise');
      }

      const updatedExercise = await this.service.update(id, data, request.user!.id);
      return reply.status(200).send({ message: 'Exercise updated successfully', data: updatedExercise });
    } catch (error) {
      throwError(error, 'Failed to update exercise');
    }
  }

  @DELETE('/:id', {
    schema: {
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' },
        },
      },
      security: [{ bearerAuth: [] }],
    },
    preHandler: [authMiddleware],
  })
  async delete(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = await yup
        .object({
          id: yup.string().required('ID is required'),
        })
        .validate(request.params);

      const exercise = await this.service.findById(id, request.user!.id);
      if (!exercise) {
        throw new AppError(404, 'Exercise not found');
      }

      if (!exercise.userId) {
        throw new AppError(403, 'Cannot delete default exercise');
      }

      await this.service.delete(id, request.user!.id);
      return reply.status(200).send({ message: 'Exercise deleted successfully' });
    } catch (error) {
      throwError(error, 'Failed to delete exercise');
    }
  }

  @GET('/muscle-group/:muscleGroup',{
    schema: {
      params: {
        type: 'object',
        properties: {
          muscleGroup: { type: 'string', enum: [...Object.values(MuscleGroups),'ERROR'] },
        },
      },
      security: [{ bearerAuth: [] }],
    },
    preHandler:[optionalAuthMiddleware]
  })
  async findByMuscleGroup(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { muscleGroup } = await yup
        .object({
          muscleGroup: yup
            .mixed<MuscleGroups>()
            .oneOf(Object.values(MuscleGroups), 'Invalid muscle group')
            .required('Muscle group is required'),
        })
        .validate(request.params);

      const exercises = await this.service.findByMuscleGroup(muscleGroup, request.user!.id);
      return reply.status(200).send({ message: 'Exercises retrieved by muscle group successfully', data: exercises });
    } catch (error) {
      throwError(error, 'Failed to fetch exercises by muscle group');
    }
  }
}
