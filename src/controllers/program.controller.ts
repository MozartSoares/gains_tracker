import { Program, getResponseProgram } from '@models/Program/model';
import { ProgramService } from '../services/program.service';
import { FastifyRequest, FastifyReply } from 'fastify';
import { Controller, GET, POST, PUT, DELETE } from 'fastify-decorators';
import * as yup from 'yup';
import { AppError } from '../types/errors';
import { throwError } from '../utils/throwError';
import { ProgramObjective, ProgramLevel } from '@models/Program/enums';
import { Workout } from '@models/Workout/model';
import { optionalAuthMiddleware, authMiddleware } from '@/middleware/auth.middleware';

@Controller({ route: '/programs', tags: ['programs'] })
export class ProgramController {
  private service: ProgramService;

  constructor() {
    this.service = new ProgramService();
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
      const programs = await this.service.findAll(userId);
      const data = programs.map((program) =>
        getResponseProgram(program as unknown as Program & { _id: string }),
      );
      return reply.status(200).send({ message: 'Programs retrieved successfully', data });
    } catch (error) {
      throwError(error, 'Failed to retrieve programs');
    }
  }

  @GET('/default', {
    schema: {
      security: [{ bearerAuth: [] }],
    },
    preHandler: [optionalAuthMiddleware],
  })
  async findDefaultPrograms(request: FastifyRequest, reply: FastifyReply) {
    try {
      const programs = await this.service.findDefaultPrograms();
      const data = programs.map((program) =>
        getResponseProgram(program as unknown as Program & { _id: string }),
      );
      return reply.status(200).send({ message: 'Default programs retrieved successfully', data });
    } catch (error) {
      throwError(error, 'Failed to retrieve default programs');
    }
  }

  @GET('/me', {
    schema: {
      security: [{ bearerAuth: [] }],
    },
    preHandler: [authMiddleware],
  })
  async findMyPrograms(request: FastifyRequest, reply: FastifyReply) {
    try {
      const programs = await this.service.findMyPrograms(request.user!.id);
      const data = programs.map((program) =>
        getResponseProgram(program as unknown as Program & { _id: string }),
      );
      return reply.status(200).send({ message: 'User programs retrieved successfully', data });
    } catch (error) {
      throwError(error, 'Failed to retrieve user programs');
    }
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
      const program = await this.service.findById(id, userId);
      if (!program) {
        throw new AppError(404, 'Program not found');
      }
      const data = getResponseProgram(program as unknown as Program & { _id: string });
      return reply.status(200).send({ message: 'Program retrieved successfully', data });
    } catch (error) {
      throwError(error, 'Failed to retrieve program');
    }
  }

  @POST('/', {
    schema: {
      body: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          description: { type: 'string' },
          objective: { type: 'string', enum: Object.values(ProgramObjective) },
          duration: { type: 'number' },
          workouts: { type: 'array', items: { type: 'object' } },
          frequency: { type: 'number' },
          level: { type: 'string', enum: Object.values(ProgramLevel) },
          private: { type: 'boolean' },
        },
        required: ['name', 'objective', 'duration', 'workouts'],
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
          objective: yup
            .mixed<ProgramObjective>()
            .oneOf(Object.values(ProgramObjective), 'Invalid objective')
            .required('Objective is required'),
          duration: yup
            .number()
            .min(1, 'Duration must be at least 1 week')
            .required('Duration is required'),
          workouts: yup
            .array()
            .of(
              yup.object({
                workout: yup.mixed<Workout>().required('Workout is required'),
                order: yup
                  .number()
                  .min(1, 'Order must be at least 1')
                  .required('Order is required'),
                focus: yup.string().optional(),
                tips: yup.string().optional(),
              }),
            )
            .min(1, 'At least one workout is required')
            .required('Workouts are required'),
          frequency: yup.number().min(1, 'Frequency must be at least 1').optional(),
          level: yup
            .mixed<ProgramLevel>()
            .oneOf(Object.values(ProgramLevel), 'Invalid level')
            .optional(),
          private: yup.boolean().optional().default(false),
        })
        .validate(request.body);

      const program = await this.service.create(data, request.user!.id);
      const responseProgram = getResponseProgram(program as unknown as Program & { _id: string });
      return reply
        .status(201)
        .send({ message: 'Program created successfully', data: responseProgram });
    } catch (error) {
      throwError(error, 'Failed to create program');
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
          objective: { type: 'string', enum: Object.values(ProgramObjective) },
          duration: { type: 'number' },
          workouts: { type: 'array', items: { type: 'object' } },
          frequency: { type: 'number' },
          level: { type: 'string', enum: Object.values(ProgramLevel) },
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
          objective: yup
            .mixed<ProgramObjective>()
            .oneOf(Object.values(ProgramObjective), 'Invalid objective')
            .optional(),
          duration: yup.number().min(1, 'Duration must be at least 1 week').optional(),
          workouts: yup
            .array()
            .of(
              yup.object({
                workout: yup.mixed<Workout>().required('Workout is required'),
                order: yup
                  .number()
                  .min(1, 'Order must be at least 1')
                  .required('Order is required'),
                focus: yup.string().optional(),
                tips: yup.string().optional(),
              }),
            )
            .min(1, 'At least one workout is required')
            .optional(),
          frequency: yup.number().min(1, 'Frequency must be at least 1').optional(),
          level: yup
            .mixed<ProgramLevel>()
            .oneOf(Object.values(ProgramLevel), 'Invalid level')
            .optional(),
          private: yup.boolean().optional().default(false),
        })
        .validate(request.body);

      const program = await this.service.findById(id, request.user!.id);
      if (!program) {
        throw new AppError(404, 'Program not found');
      }

      if (!program.userId) {
        throw new AppError(403, 'Cannot update default program');
      }

      const updatedProgram = await this.service.update(id, data, request.user!.id);
      const responseProgram = getResponseProgram(
        updatedProgram as unknown as Program & { _id: string },
      );
      return reply
        .status(200)
        .send({ message: 'Program updated successfully', data: responseProgram });
    } catch (error) {
      throwError(error, 'Failed to update program');
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

      const program = await this.service.findById(id, request.user!.id);
      if (!program) {
        throw new AppError(404, 'Program not found');
      }

      if (!program.userId) {
        throw new AppError(403, 'Cannot delete default program');
      }

      await this.service.delete(id, request.user!.id);
      return reply.status(204).send({ message: 'Program deleted successfully' });
    } catch (error) {
      throwError(error, 'Failed to delete program');
    }
  }
}
