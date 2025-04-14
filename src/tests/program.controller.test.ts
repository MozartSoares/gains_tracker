import { ProgramController } from '../controllers/program.controller';
import { ProgramService } from '@services/program.service';
import { FastifyRequest, FastifyReply } from 'fastify';
import { AppError } from '../types/errors';
import { ProgramObjective, ProgramLevel } from '../models/Program/enums';
import programMocks from './mocks/programs.json';
import { getResponseProgram, Program } from '../models/Program/model';

jest.mock('@services/program.service');

// Helper function to convert mock to correct type
const addIdToMock = (program: any): Program & { _id: string } => ({
  ...program,
  _id: 'mock-id',
  objective: program.objective as ProgramObjective,
  level: program.level as ProgramLevel,
});

describe('ProgramController', () => {
  let controller: ProgramController;
  let mockRequest: Partial<FastifyRequest>;
  let mockReply: Partial<FastifyReply>;

  const mockUser = { id: 'user1', email: 'test@example.com' };

  beforeEach(() => {
    controller = new ProgramController();
    mockReply = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
  });

  // Reset mocks after each test
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /programs', () => {
    it('should return all programs for authenticated user', async () => {
      mockRequest = { user: mockUser };

      const mockProgramsWithId = programMocks.map((p) => addIdToMock(p));
      (ProgramService.prototype.findAll as jest.Mock).mockResolvedValue(mockProgramsWithId);

      const throwErrorSpy = jest
        .spyOn(require('../utils/throwError'), 'throwError')
        .mockImplementation(() => {});

      await controller.findAll(mockRequest as FastifyRequest, mockReply as FastifyReply);

      expect(ProgramService.prototype.findAll).toHaveBeenCalledWith('user1');
      expect(mockReply.status).toHaveBeenCalledWith(200);
      expect(mockReply.send).toHaveBeenCalledWith({
        message: 'Programs retrieved successfully',
        data: expect.any(Array),
      });
      expect(throwErrorSpy).not.toHaveBeenCalled();

      throwErrorSpy.mockRestore();
    });

    it('should return public programs for unauthenticated user', async () => {
      mockRequest = { user: null };

      const mockProgramsWithId = programMocks.map((p) => addIdToMock(p));
      (ProgramService.prototype.findAll as jest.Mock).mockResolvedValue(mockProgramsWithId);

      const throwErrorSpy = jest
        .spyOn(require('../utils/throwError'), 'throwError')
        .mockImplementation(() => {});

      await controller.findAll(mockRequest as FastifyRequest, mockReply as FastifyReply);

      expect(ProgramService.prototype.findAll).toHaveBeenCalledWith(null);
      expect(mockReply.status).toHaveBeenCalledWith(200);
      expect(throwErrorSpy).not.toHaveBeenCalled();

      throwErrorSpy.mockRestore();
    });

    it('should handle service errors', async () => {
      mockRequest = { user: null };

      const testError = new Error('Test error');
      (ProgramService.prototype.findAll as jest.Mock).mockRejectedValue(testError);

      const throwErrorSpy = jest
        .spyOn(require('../utils/throwError'), 'throwError')
        .mockImplementation(() => {});

      await controller.findAll(mockRequest as FastifyRequest, mockReply as FastifyReply);

      expect(throwErrorSpy).toHaveBeenCalledWith(testError, 'Failed to retrieve programs');

      throwErrorSpy.mockRestore();
    });
  });

  describe('GET /programs/default', () => {
    it('should return default programs', async () => {
      mockRequest = {};

      const mockProgramsWithId = programMocks
        .filter((p) => p.userId === null)
        .map((p) => addIdToMock(p));

      (ProgramService.prototype.findDefaultPrograms as jest.Mock).mockResolvedValue(
        mockProgramsWithId,
      );

      const throwErrorSpy = jest
        .spyOn(require('../utils/throwError'), 'throwError')
        .mockImplementation(() => {});

      await controller.findDefaultPrograms(
        mockRequest as FastifyRequest,
        mockReply as FastifyReply,
      );

      expect(ProgramService.prototype.findDefaultPrograms).toHaveBeenCalled();
      expect(mockReply.status).toHaveBeenCalledWith(200);
      expect(mockReply.send).toHaveBeenCalledWith({
        message: 'Default programs retrieved successfully',
        data: expect.any(Array),
      });
      expect(throwErrorSpy).not.toHaveBeenCalled();

      throwErrorSpy.mockRestore();
    });

    it('should handle service errors', async () => {
      mockRequest = {};

      const testError = new Error('Test error');
      (ProgramService.prototype.findDefaultPrograms as jest.Mock).mockRejectedValue(testError);

      const throwErrorSpy = jest
        .spyOn(require('../utils/throwError'), 'throwError')
        .mockImplementation(() => {});

      await controller.findDefaultPrograms(
        mockRequest as FastifyRequest,
        mockReply as FastifyReply,
      );

      expect(throwErrorSpy).toHaveBeenCalledWith(testError, 'Failed to retrieve default programs');

      throwErrorSpy.mockRestore();
    });
  });

  describe('GET /programs/me', () => {
    it('should return user programs', async () => {
      mockRequest = { user: mockUser };

      const mockProgramsWithId = programMocks.map((p) => ({
        ...addIdToMock(p),
        userId: 'user1',
      }));

      (ProgramService.prototype.findMyPrograms as jest.Mock).mockResolvedValue(mockProgramsWithId);

      const throwErrorSpy = jest
        .spyOn(require('../utils/throwError'), 'throwError')
        .mockImplementation(() => {});

      await controller.findMyPrograms(mockRequest as FastifyRequest, mockReply as FastifyReply);

      expect(ProgramService.prototype.findMyPrograms).toHaveBeenCalledWith('user1');
      expect(mockReply.status).toHaveBeenCalledWith(200);
      expect(mockReply.send).toHaveBeenCalledWith({
        message: 'User programs retrieved successfully',
        data: expect.any(Array),
      });
      expect(throwErrorSpy).not.toHaveBeenCalled();

      throwErrorSpy.mockRestore();
    });

    it('should handle service errors', async () => {
      mockRequest = { user: mockUser };

      const testError = new Error('Test error');
      (ProgramService.prototype.findMyPrograms as jest.Mock).mockRejectedValue(testError);

      const throwErrorSpy = jest
        .spyOn(require('../utils/throwError'), 'throwError')
        .mockImplementation(() => {});

      await controller.findMyPrograms(mockRequest as FastifyRequest, mockReply as FastifyReply);

      expect(throwErrorSpy).toHaveBeenCalledWith(testError, 'Failed to retrieve user programs');

      throwErrorSpy.mockRestore();
    });
  });

  describe('GET /programs/:id', () => {
    it('should return program by id for authenticated user', async () => {
      mockRequest = {
        params: { id: 'program1' },
        user: mockUser,
      };

      const mockProgramWithId = addIdToMock(programMocks[0]);
      (ProgramService.prototype.findById as jest.Mock).mockResolvedValue(mockProgramWithId);

      const throwErrorSpy = jest
        .spyOn(require('../utils/throwError'), 'throwError')
        .mockImplementation(() => {});

      await controller.findById(mockRequest as FastifyRequest, mockReply as FastifyReply);

      expect(ProgramService.prototype.findById).toHaveBeenCalledWith('program1', 'user1');
      expect(mockReply.status).toHaveBeenCalledWith(200);
      expect(mockReply.send).toHaveBeenCalledWith({
        message: 'Program retrieved successfully',
        data: expect.any(Object),
      });
      expect(throwErrorSpy).not.toHaveBeenCalled();

      throwErrorSpy.mockRestore();
    });

    it('should return program by id for unauthenticated user', async () => {
      mockRequest = {
        params: { id: 'program1' },
        user: null,
      };

      const mockProgramWithId = addIdToMock(programMocks[0]);
      (ProgramService.prototype.findById as jest.Mock).mockResolvedValue(mockProgramWithId);

      await controller.findById(mockRequest as FastifyRequest, mockReply as FastifyReply);

      expect(ProgramService.prototype.findById).toHaveBeenCalledWith('program1', null);
      expect(mockReply.status).toHaveBeenCalledWith(200);
    });

    it('should throw 404 when program not found', async () => {
      mockRequest = {
        params: { id: 'nonexistent' },
        user: null,
      };

      (ProgramService.prototype.findById as jest.Mock).mockResolvedValue(null);

      await expect(
        controller.findById(mockRequest as FastifyRequest, mockReply as FastifyReply),
      ).rejects.toThrow(new AppError(404, 'Program not found'));
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
});
