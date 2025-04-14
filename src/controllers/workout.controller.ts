import { getResponseWorkout, Workout } from '@models/Workout/model';
import { WorkoutService } from '../services/workout.service';
import { FastifyRequest, FastifyReply } from 'fastify';
import { Controller, GET, POST, PUT, DELETE } from 'fastify-decorators';
import * as yup from 'yup';
import { AppError } from '../types/errors';
import { throwError } from '../utils/throwError';
import { Exercise } from '@models/Exercise';
import { optionalAuthMiddleware, authMiddleware } from '@/middleware/auth.middleware';

@Controller({ route: '/workouts', tags: ['workouts'] })
export class WorkoutController {
  private workoutService: WorkoutService;

  constructor() {
    this.workoutService = new WorkoutService();
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
      const workouts = await this.workoutService.findAll(userId);

      const data = workouts.map((workout) =>
        getResponseWorkout(workout as unknown as Workout & { _id: string }),
      );
      return reply.status(200).send({ message: 'Data fetched successfully', data });
    } catch (error) {
      throwError(error, 'Failed to fetch workouts');
    }
  }

  @GET('/default', {
    schema: {
      security: [{ bearerAuth: [] }],
    },
    preHandler: [optionalAuthMiddleware],
  })
  async findDefaultWorkouts(request: FastifyRequest, reply: FastifyReply) {
    try {
      const workouts = await this.workoutService.findDefaultWorkouts();
      const data = workouts.map((workout) =>
        getResponseWorkout(workout as unknown as Workout & { _id: string }),
      );
      return reply.status(200).send({ message: 'Default workouts retrieved successfully', data });
    } catch (error) {
      throwError(error, 'Failed to fetch default workouts');
    }
  }

  @GET('/me', {
    schema: {
      security: [{ bearerAuth: [] }],
    },
    preHandler: [authMiddleware],
  })
  async findMyWorkouts(request: FastifyRequest, reply: FastifyReply) {
    try {
      const workouts = await this.workoutService.findMyWorkouts(request.user!.id);
      const data = workouts.map((workout) =>
        getResponseWorkout(workout as unknown as Workout & { _id: string }),
      );
      return reply.status(200).send({ message: 'User workouts retrieved successfully', data });
    } catch (error) {
      throwError(error, 'Failed to fetch user workouts');
    }
  }

  @GET('/:id', {
    preHandler: [optionalAuthMiddleware],
    schema: {
      security: [{ bearerAuth: [] }],
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' },
        },
      },
    },
  })
  async findById(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    try {
      const { id } = await yup
        .object({
          id: yup.string().required('ID is required'),
        })
        .validate(request.params);

      const { id: userId } = request.user || { id: null };
      const workout = await this.workoutService.findById(id, userId);
      if (!workout) {
        throw new AppError(404, 'Workout not found');
      }
      const data = getResponseWorkout(workout as unknown as Workout & { _id: string });
      return reply.status(200).send({ message: 'Data fetched successfully', data });
    } catch (error) {
      throwError(error, 'Failed to fetch workout');
    }
  }

  @POST('/', {
    schema: {
      body: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          description: { type: 'string' },
          duration: { type: 'number', minimum: 1 },
          exercises: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                exercise: { type: 'object' },
                sets: { type: 'number', minimum: 1 },
                reps: { type: 'number', minimum: 1 },
                weight: { type: 'number', minimum: 0 },
              },
              required: ['exercise', 'sets', 'reps'],
            },
            minItems: 1,
          },
          private: { type: 'boolean' },
        },
        required: ['name', 'duration', 'exercises'],
      },
      security: [{ bearerAuth: [] }],
    },
    preHandler: [authMiddleware],
  })
  async create(request: FastifyRequest, reply: FastifyReply) {
    try {
      const data = await yup
        .object({
          name: yup.string().required('Name is required'),
          description: yup.string().optional(),
          duration: yup
            .number()
            .min(1, 'Duration must be at least 1 second')
            .required('Duration is required'),
          exercises: yup
            .array()
            .of(
              yup.object({
                exercise: yup.mixed<Exercise>().required('Exercise is required'),
                sets: yup.number().min(1, 'Sets must be at least 1').required('Sets are required'),
                reps: yup.number().min(1, 'Reps must be at least 1').required('Reps are required'),
                weight: yup.number().min(0, 'Weight must be at least 0').optional(),
              }),
            )
            .min(1, 'At least one exercise is required')
            .required('Exercises are required'),
          private: yup.boolean().optional().default(false),
        })
        .validate(request.body);

      const workout = await this.workoutService.create(data, request.user!.id);
      const responseWorkout = getResponseWorkout(workout as unknown as Workout & { _id: string });
      return reply
        .status(201)
        .send({ message: 'Workout created successfully', data: responseWorkout });
    } catch (error) {
      throwError(error, 'Failed to create workout');
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
          duration: { type: 'number', minimum: 1 },
          exercises: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                exercise: { type: 'object' },
                sets: { type: 'number', minimum: 1 },
                reps: { type: 'number', minimum: 1 },
                weight: { type: 'number', minimum: 0 },
              },
              required: ['exercise', 'sets', 'reps'],
            },
            minItems: 1,
          },
          private: { type: 'boolean' },
        },
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

      const data = await yup
        .object({
          name: yup.string().optional(),
          description: yup.string().optional(),
          duration: yup.number().min(1, 'Duration must be at least 1 minute').optional(),
          exercises: yup
            .array()
            .of(
              yup.object({
                exercise: yup.mixed<Exercise>().required('Exercise is required'),
                sets: yup.number().min(1, 'Sets must be at least 1').required('Sets are required'),
                reps: yup.number().min(1, 'Reps must be at least 1').required('Reps are required'),
                weight: yup.number().min(0, 'Weight must be at least 0').optional(),
              }),
            )
            .min(1, 'At least one exercise is required')
            .optional(),
          private: yup.boolean().optional().default(false),
        })
        .validate(request.body);

      const workout = await this.workoutService.findById(id, request.user!.id);
      if (!workout) {
        throw new AppError(404, 'Workout not found');
      }

      if (!workout.userId) {
        throw new AppError(403, 'Cannot update default workout');
      }

      const updatedWorkout = await this.workoutService.update(id, data, request.user!.id);
      const responseWorkout = getResponseWorkout(
        updatedWorkout as unknown as Workout & { _id: string },
      );
      return reply
        .status(200)
        .send({ message: 'Workout updated successfully', data: responseWorkout });
    } catch (error) {
      throwError(error, 'Failed to update workout');
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
  async delete(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    try {
      const { id } = await yup
        .object({
          id: yup.string().required('ID is required'),
        })
        .validate(request.params);

      const workout = await this.workoutService.findById(id, request.user!.id);
      if (!workout) {
        throw new AppError(404, 'Workout not found');
      }

      if (!workout.userId) {
        throw new AppError(403, 'Cannot delete default workout');
      }

      await this.workoutService.delete(id, request.user!.id);
      return reply.status(204).send({ message: 'Workout deleted successfully' });
    } catch (error) {
      throwError(error, 'Failed to delete workout');
    }
  }
}
