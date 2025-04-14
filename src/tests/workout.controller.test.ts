import { WorkoutController } from '../controllers/workout.controller';
import { WorkoutService } from '@services/workout.service';
import { FastifyRequest, FastifyReply } from 'fastify';
import { AppError } from '../types/errors';
import workoutMocks from './mocks/workouts.json';
import { getResponseWorkout, Workout } from '../models/Workout/model';

jest.mock('@services/workout.service');

// Helper function to convert mock to correct type
const addIdToMock = (workout: any): Workout & { _id: string } => ({
  ...workout,
  _id: 'mock-id',
});

describe('WorkoutController', () => {
  let controller: WorkoutController;
  let mockRequest: Partial<FastifyRequest>;
  let mockReply: Partial<FastifyReply>;

  const mockUser = { id: 'user1', email: 'test@example.com' };

  beforeEach(() => {
    controller = new WorkoutController();
    mockReply = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
  });

  // Reset mocks after each test
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /workouts', () => {
    it('should return all workouts for authenticated user', async () => {
      mockRequest = { user: mockUser };

      const mockWorkoutsWithId = workoutMocks.map((w) => addIdToMock(w));
      (WorkoutService.prototype.findAll as jest.Mock).mockResolvedValue(mockWorkoutsWithId);

      const throwErrorSpy = jest
        .spyOn(require('../utils/throwError'), 'throwError')
        .mockImplementation(() => {});

      await controller.findAll(mockRequest as FastifyRequest, mockReply as FastifyReply);

      expect(WorkoutService.prototype.findAll).toHaveBeenCalledWith('user1');
      expect(mockReply.status).toHaveBeenCalledWith(200);
      expect(mockReply.send).toHaveBeenCalledWith({
        message: 'Data fetched successfully',
        data: expect.any(Array),
      });
      expect(throwErrorSpy).not.toHaveBeenCalled();

      throwErrorSpy.mockRestore();
    });

    it('should return public workouts for unauthenticated user', async () => {
      mockRequest = { user: null };

      const mockWorkoutsWithId = workoutMocks.map((w) => addIdToMock(w));
      (WorkoutService.prototype.findAll as jest.Mock).mockResolvedValue(mockWorkoutsWithId);

      const throwErrorSpy = jest
        .spyOn(require('../utils/throwError'), 'throwError')
        .mockImplementation(() => {});

      await controller.findAll(mockRequest as FastifyRequest, mockReply as FastifyReply);

      expect(WorkoutService.prototype.findAll).toHaveBeenCalledWith(null);
      expect(mockReply.status).toHaveBeenCalledWith(200);
      expect(throwErrorSpy).not.toHaveBeenCalled();

      throwErrorSpy.mockRestore();
    });

    it('should handle service errors', async () => {
      mockRequest = { user: null };

      const testError = new Error('Test error');
      (WorkoutService.prototype.findAll as jest.Mock).mockRejectedValue(testError);

      const throwErrorSpy = jest
        .spyOn(require('../utils/throwError'), 'throwError')
        .mockImplementation(() => {});

      await controller.findAll(mockRequest as FastifyRequest, mockReply as FastifyReply);

      expect(throwErrorSpy).toHaveBeenCalledWith(testError, 'Failed to fetch workouts');

      throwErrorSpy.mockRestore();
    });
  });

  describe('GET /workouts/default', () => {
    it('should return default workouts', async () => {
      mockRequest = {};

      const mockWorkoutsWithId = workoutMocks
        .filter((w) => w.userId === null)
        .map((w) => addIdToMock(w));

      (WorkoutService.prototype.findDefaultWorkouts as jest.Mock).mockResolvedValue(
        mockWorkoutsWithId,
      );

      const throwErrorSpy = jest
        .spyOn(require('../utils/throwError'), 'throwError')
        .mockImplementation(() => {});

      await controller.findDefaultWorkouts(
        mockRequest as FastifyRequest,
        mockReply as FastifyReply,
      );

      expect(WorkoutService.prototype.findDefaultWorkouts).toHaveBeenCalled();
      expect(mockReply.status).toHaveBeenCalledWith(200);
      expect(mockReply.send).toHaveBeenCalledWith({
        message: 'Default workouts retrieved successfully',
        data: expect.any(Array),
      });
      expect(throwErrorSpy).not.toHaveBeenCalled();

      throwErrorSpy.mockRestore();
    });

    it('should handle service errors', async () => {
      mockRequest = {};

      const testError = new Error('Test error');
      (WorkoutService.prototype.findDefaultWorkouts as jest.Mock).mockRejectedValue(testError);

      const throwErrorSpy = jest
        .spyOn(require('../utils/throwError'), 'throwError')
        .mockImplementation(() => {});

      await controller.findDefaultWorkouts(
        mockRequest as FastifyRequest,
        mockReply as FastifyReply,
      );

      expect(throwErrorSpy).toHaveBeenCalledWith(testError, 'Failed to fetch default workouts');

      throwErrorSpy.mockRestore();
    });
  });

  describe('GET /workouts/me', () => {
    it('should return user workouts', async () => {
      mockRequest = { user: mockUser };

      const mockWorkoutsWithId = workoutMocks.map((w) => ({
        ...addIdToMock(w),
        userId: 'user1',
      }));

      (WorkoutService.prototype.findMyWorkouts as jest.Mock).mockResolvedValue(mockWorkoutsWithId);

      const throwErrorSpy = jest
        .spyOn(require('../utils/throwError'), 'throwError')
        .mockImplementation(() => {});

      await controller.findMyWorkouts(mockRequest as FastifyRequest, mockReply as FastifyReply);

      expect(WorkoutService.prototype.findMyWorkouts).toHaveBeenCalledWith('user1');
      expect(mockReply.status).toHaveBeenCalledWith(200);
      expect(mockReply.send).toHaveBeenCalledWith({
        message: 'User workouts retrieved successfully',
        data: expect.any(Array),
      });
      expect(throwErrorSpy).not.toHaveBeenCalled();

      throwErrorSpy.mockRestore();
    });

    it('should handle service errors', async () => {
      mockRequest = { user: mockUser };

      const testError = new Error('Test error');
      (WorkoutService.prototype.findMyWorkouts as jest.Mock).mockRejectedValue(testError);

      const throwErrorSpy = jest
        .spyOn(require('../utils/throwError'), 'throwError')
        .mockImplementation(() => {});

      await controller.findMyWorkouts(mockRequest as FastifyRequest, mockReply as FastifyReply);

      expect(throwErrorSpy).toHaveBeenCalledWith(testError, 'Failed to fetch user workouts');

      throwErrorSpy.mockRestore();
    });
  });

  describe('GET /workouts/:id', () => {
    it('should return workout by id for authenticated user', async () => {
      mockRequest = {
        params: { id: 'workout1' },
        user: mockUser,
      };

      const mockWorkoutWithId = addIdToMock(workoutMocks[0]);
      (WorkoutService.prototype.findById as jest.Mock).mockResolvedValue(mockWorkoutWithId);

      const throwErrorSpy = jest
        .spyOn(require('../utils/throwError'), 'throwError')
        .mockImplementation(() => {});

      await controller.findById(
        mockRequest as FastifyRequest<{ Params: { id: string } }>,
        mockReply as FastifyReply,
      );

      expect(WorkoutService.prototype.findById).toHaveBeenCalledWith('workout1', 'user1');
      expect(mockReply.status).toHaveBeenCalledWith(200);
      expect(mockReply.send).toHaveBeenCalledWith({
        message: 'Data fetched successfully',
        data: expect.any(Object),
      });
      expect(throwErrorSpy).not.toHaveBeenCalled();

      throwErrorSpy.mockRestore();
    });

    it('should return workout by id for unauthenticated user', async () => {
      mockRequest = {
        params: { id: 'workout1' },
        user: null,
      };

      const mockWorkoutWithId = addIdToMock(workoutMocks[0]);
      (WorkoutService.prototype.findById as jest.Mock).mockResolvedValue(mockWorkoutWithId);

      await controller.findById(
        mockRequest as FastifyRequest<{ Params: { id: string } }>,
        mockReply as FastifyReply,
      );

      expect(WorkoutService.prototype.findById).toHaveBeenCalledWith('workout1', null);
      expect(mockReply.status).toHaveBeenCalledWith(200);
    });

    it('should throw 404 when workout not found', async () => {
      mockRequest = {
        params: { id: 'nonexistent' },
        user: null,
      };

      (WorkoutService.prototype.findById as jest.Mock).mockResolvedValue(null);

      await expect(
        controller.findById(
          mockRequest as FastifyRequest<{ Params: { id: string } }>,
          mockReply as FastifyReply,
        ),
      ).rejects.toThrow(new AppError(404, 'Workout not found'));
    });

    it('should handle validation errors', async () => {
      mockRequest = {
        params: {},
        user: null,
      };

      const throwErrorSpy = jest
        .spyOn(require('../utils/throwError'), 'throwError')
        .mockImplementation(() => {});

      await controller.findById(
        mockRequest as FastifyRequest<{ Params: { id: string } }>,
        mockReply as FastifyReply,
      );

      expect(throwErrorSpy).toHaveBeenCalled();

      throwErrorSpy.mockRestore();
    });
  });
});
