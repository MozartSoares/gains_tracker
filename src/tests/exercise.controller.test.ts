import { ExerciseController } from '../controllers/exercise.controller';
import { ExerciseService } from '@services/exercise.service';
import { FastifyRequest, FastifyReply } from 'fastify';
import { AppError } from '../types/errors';
import { MuscleGroups, Equipment } from '../models/Exercise/enums';
import exerciseMocks from './mocks/exercises.json';
import { getResponseExercise, Exercise } from '../models/Exercise/model';

jest.mock('@services/exercise.service');

// Helper function to convert mock to correct type
const addIdToMock = (exercise: any): Exercise & { _id: string } => ({
  ...exercise,
  _id: 'mock-id',
  muscleGroups: exercise.muscleGroups as MuscleGroups[],
  equipment: exercise.equipment as Equipment,
});

describe('ExerciseController', () => {
  let controller: ExerciseController;
  let mockRequest: Partial<FastifyRequest>;
  let mockReply: Partial<FastifyReply>;

  const mockUser = { id: 'user1', email: 'test@example.com' };

  beforeEach(() => {
    controller = new ExerciseController();
    mockReply = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
  });

  // Reset mocks after each test
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /exercises', () => {
    it('should return all exercises for authenticated user', async () => {
      mockRequest = { user: mockUser };

      const mockExercisesWithId = exerciseMocks.map((e) => addIdToMock(e));
      (ExerciseService.prototype.findAll as jest.Mock).mockResolvedValue(mockExercisesWithId);

      const throwErrorSpy = jest
        .spyOn(require('../utils/throwError'), 'throwError')
        .mockImplementation(() => {});

      await controller.findAll(mockRequest as FastifyRequest, mockReply as FastifyReply);

      expect(ExerciseService.prototype.findAll).toHaveBeenCalledWith('user1');
      expect(mockReply.status).toHaveBeenCalledWith(200);
      expect(mockReply.send).toHaveBeenCalledWith({
        message: 'Exercises retrieved successfully',
        data: expect.any(Array),
      });
      expect(throwErrorSpy).not.toHaveBeenCalled();

      throwErrorSpy.mockRestore();
    });

    it('should return public exercises for unauthenticated user', async () => {
      mockRequest = { user: null };

      const mockExercisesWithId = exerciseMocks.map((e) => addIdToMock(e));
      (ExerciseService.prototype.findAll as jest.Mock).mockResolvedValue(mockExercisesWithId);

      const throwErrorSpy = jest
        .spyOn(require('../utils/throwError'), 'throwError')
        .mockImplementation(() => {});

      await controller.findAll(mockRequest as FastifyRequest, mockReply as FastifyReply);

      expect(ExerciseService.prototype.findAll).toHaveBeenCalledWith(null);
      expect(mockReply.status).toHaveBeenCalledWith(200);
      expect(throwErrorSpy).not.toHaveBeenCalled();

      throwErrorSpy.mockRestore();
    });

    it('should handle service errors', async () => {
      mockRequest = { user: null };

      const testError = new Error('Test error');
      (ExerciseService.prototype.findAll as jest.Mock).mockRejectedValue(testError);

      const throwErrorSpy = jest
        .spyOn(require('../utils/throwError'), 'throwError')
        .mockImplementation(() => {});

      await controller.findAll(mockRequest as FastifyRequest, mockReply as FastifyReply);

      expect(throwErrorSpy).toHaveBeenCalledWith(testError, 'Failed to retrieve exercises');

      throwErrorSpy.mockRestore();
    });
  });

  describe('GET /exercises/default', () => {
    it('should return default exercises', async () => {
      mockRequest = {};

      const mockExercisesWithId = exerciseMocks
        .filter((e) => e.userId === null)
        .map((e) => addIdToMock(e));

      (ExerciseService.prototype.findDefaultExercises as jest.Mock).mockResolvedValue(
        mockExercisesWithId,
      );

      const throwErrorSpy = jest
        .spyOn(require('../utils/throwError'), 'throwError')
        .mockImplementation(() => {});

      await controller.findDefaultExercises(
        mockRequest as FastifyRequest,
        mockReply as FastifyReply,
      );

      expect(ExerciseService.prototype.findDefaultExercises).toHaveBeenCalled();
      expect(mockReply.status).toHaveBeenCalledWith(200);
      expect(mockReply.send).toHaveBeenCalledWith({
        message: 'Default exercises retrieved successfully',
        data: expect.any(Array),
      });
      expect(throwErrorSpy).not.toHaveBeenCalled();

      throwErrorSpy.mockRestore();
    });

    it('should handle service errors', async () => {
      mockRequest = {};

      const testError = new Error('Test error');
      (ExerciseService.prototype.findDefaultExercises as jest.Mock).mockRejectedValue(testError);

      const throwErrorSpy = jest
        .spyOn(require('../utils/throwError'), 'throwError')
        .mockImplementation(() => {});

      await controller.findDefaultExercises(
        mockRequest as FastifyRequest,
        mockReply as FastifyReply,
      );

      expect(throwErrorSpy).toHaveBeenCalledWith(testError, 'Failed to retrieve default exercises');

      throwErrorSpy.mockRestore();
    });
  });

  describe('GET /exercises/me', () => {
    it('should return user exercises', async () => {
      mockRequest = { user: mockUser };

      const mockExercisesWithId = exerciseMocks.map((e) => ({
        ...addIdToMock(e),
        userId: 'user1',
      }));

      (ExerciseService.prototype.findMyExercises as jest.Mock).mockResolvedValue(
        mockExercisesWithId,
      );

      await controller.findMyExercises(mockRequest as FastifyRequest, mockReply as FastifyReply);

      expect(ExerciseService.prototype.findMyExercises).toHaveBeenCalledWith('user1');
      expect(mockReply.status).toHaveBeenCalledWith(200);
      expect(mockReply.send).toHaveBeenCalledWith({
        message: 'User exercises retrieved successfully',
        data: expect.any(Array),
      });
    });
  });

  describe('GET /exercises/:id', () => {
    it('should return exercise by id for authenticated user', async () => {
      mockRequest = {
        params: { id: 'exercise1' },
        user: mockUser,
      };

      const mockExerciseWithId = addIdToMock(exerciseMocks[0]);
      (ExerciseService.prototype.findById as jest.Mock).mockResolvedValue(mockExerciseWithId);

      const throwErrorSpy = jest
        .spyOn(require('../utils/throwError'), 'throwError')
        .mockImplementation(() => {});

      await controller.findById(mockRequest as FastifyRequest, mockReply as FastifyReply);

      expect(ExerciseService.prototype.findById).toHaveBeenCalledWith('exercise1', 'user1');
      expect(mockReply.status).toHaveBeenCalledWith(200);
      expect(mockReply.send).toHaveBeenCalledWith({
        message: 'Exercise retrieved successfully',
        data: expect.any(Object),
      });
      expect(throwErrorSpy).not.toHaveBeenCalled();

      throwErrorSpy.mockRestore();
    });

    it('should return exercise by id for unauthenticated user', async () => {
      mockRequest = {
        params: { id: 'exercise1' },
        user: null,
      };

      const mockExerciseWithId = addIdToMock(exerciseMocks[0]);
      (ExerciseService.prototype.findById as jest.Mock).mockResolvedValue(mockExerciseWithId);

      await controller.findById(mockRequest as FastifyRequest, mockReply as FastifyReply);

      expect(ExerciseService.prototype.findById).toHaveBeenCalledWith('exercise1', null);
      expect(mockReply.status).toHaveBeenCalledWith(200);
    });

    it('should throw 404 when exercise not found', async () => {
      mockRequest = {
        params: { id: 'nonexistent' },
        user: null,
      };

      (ExerciseService.prototype.findById as jest.Mock).mockResolvedValue(null);

      await expect(
        controller.findById(mockRequest as FastifyRequest, mockReply as FastifyReply),
      ).rejects.toThrow(new AppError(404, 'Exercise not found'));
    });

    it('should handle validation errors', async () => {
      mockRequest = {
        params: {},
        user: null,
      };

      const throwErrorSpy = jest
        .spyOn(require('../utils/throwError'), 'throwError')
        .mockImplementation(() => {});

      await controller.findById(mockRequest as FastifyRequest, mockReply as FastifyReply);

      expect(throwErrorSpy).toHaveBeenCalled();

      throwErrorSpy.mockRestore();
    });
  });

  describe('GET /exercises/muscle-group/:muscleGroup', () => {
    it('should return exercises by muscle group for authenticated user', async () => {
      mockRequest = {
        params: { muscleGroup: MuscleGroups.CHEST },
        user: mockUser,
      };

      const mockExercisesWithId = exerciseMocks
        .filter((e) => e.muscleGroups.includes('Chest'))
        .map((e) => addIdToMock(e));

      (ExerciseService.prototype.findByMuscleGroup as jest.Mock).mockResolvedValue(
        mockExercisesWithId,
      );

      await controller.findByMuscleGroup(mockRequest as FastifyRequest, mockReply as FastifyReply);

      expect(ExerciseService.prototype.findByMuscleGroup).toHaveBeenCalledWith(
        MuscleGroups.CHEST,
        'user1',
      );
      expect(mockReply.status).toHaveBeenCalledWith(200);
      expect(mockReply.send).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('Exercises retrieved'),
          data: expect.any(Array),
        }),
      );
    });

    it('should handle invalid muscle group', async () => {
      mockRequest = {
        params: { muscleGroup: 'INVALID' },
        user: null,
      };

      await expect(
        controller.findByMuscleGroup(mockRequest as FastifyRequest, mockReply as FastifyReply),
      ).rejects.toThrow();
    });
  });
});
