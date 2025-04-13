import { Exercise } from '../models/Exercise/model';
import { ExerciseService } from '../services/exercise.service';
import { FastifyRequest, FastifyReply } from 'fastify';
import { Controller, GET, POST, PUT, DELETE } from 'fastify-decorators';
import * as yup from 'yup';
import { Equipment, MuscleGroups } from '../models/Exercise/enums';
import { AppError } from '../types/errors';
import { throwError } from '../utils/throwError';


@Controller({ route: '/exercises' })
export class ExerciseController {
  private service: ExerciseService;

  constructor() {
    this.service = new ExerciseService();
  }

  @GET('/')
  async findAll() {
    try {
      return await this.service.findAll();
    } catch (error) {
      throwError(error, 'Failed to fetch exercises');
    }
  }

  @GET('/:id',{
    schema: {
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' },
        },
      },
    },
  })
  
  async findById(request: any) {
    try {
      const { id } = await yup
        .object({
          id: yup.string().required('ID is required'),
        })
        .validate(request.params);

      const exercise = await this.service.findById(id);
      if (!exercise) {
        throw new AppError(404, 'Exercise not found');
      }
      return exercise;
    } catch (error) {
      throwError(error, 'Failed to fetch exercise');
    }
  }

  @POST('/',{
    schema: {
      body: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          description: { type: 'string' },
          muscleGroup: { type: 'string', enum: Object.values(MuscleGroups) },
          equipment: { type: 'string', enum: Object.values(Equipment) },
        },
      },
    },
  })
  async create(request: any) {
    try {
      const data = await yup
        .object({
          name: yup.string().required('Name is required'),
          description: yup.string().optional(),
          muscleGroup: yup
            .string()
            .oneOf(Object.values(MuscleGroups), 'Invalid muscle group')
            .required('Muscle group is required'),
          equipment: yup
            .string()
            .oneOf(Object.values(Equipment), 'Invalid equipment')
            .required('Equipment is required'),
        })
        .validate(request.body);

      const exercise = await this.service.create(data);
      return exercise;
    } catch (error) {
      throwError(error, 'Failed to create exercise');
    }
  }

  @PUT('/:id',{
    schema: {
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' },
        },
      },
    },
  })
  async update(request: any) {
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
          muscleGroup: yup
            .string()
            .oneOf(Object.values(MuscleGroups), 'Invalid muscle group')
            .optional(),
          equipment: yup.string().oneOf(Object.values(Equipment), 'Invalid equipment').optional(),
        })
        .validate(request.body);

      const exercise = await this.service.update(id, data);
      if (!exercise) {
        throw new AppError(404, 'Exercise not found');
      }
      return exercise;
    } catch (error) {
      throwError(error, 'Failed to update exercise');
    }
  }

  @DELETE('/:id',{
    schema: {
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' },
        },
      },
    },
  })
  async delete(request: any) {
    try {
      const { id } = await yup
        .object({
          id: yup.string().required('ID is required'),
        })
        .validate(request.params);

      const success = await this.service.delete(id);
      if (!success) {
        throw new AppError(404, 'Exercise not found');
      }
      return { statusCode: 204 };
    } catch (error) {
      throwError(error, 'Failed to delete exercise');
    }
  }

  @GET('/muscle-group/:muscleGroup',{
    schema: {
      params: {
        type: 'object',
        properties: {
          muscleGroup: { type: 'string', enum: Object.values(MuscleGroups) },
        },
      },
    },
  })
  async findByMuscleGroup(request: any) {
    try {
      const { muscleGroup } = await yup
        .object({
          muscleGroup: yup
            .string()
            .oneOf(Object.values(MuscleGroups), 'Invalid muscle group')
            .required('Muscle group is required'),
        })
        .validate(request.params);

      const exercises = await this.service.findByMuscleGroup(muscleGroup as MuscleGroups);
      return exercises;
    } catch (error) {
      throwError(error, 'Failed to fetch exercises by muscle group');
    }
  }
}
