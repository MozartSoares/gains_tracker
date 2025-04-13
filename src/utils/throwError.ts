import { AppError } from '../types/errors';
import { ValidationError } from 'yup';

export const throwError = (error: unknown, defaultMessage: string): never => {
  if (error instanceof ValidationError) {
    throw error;
  }

  if (error instanceof AppError) {
    throw error;
  }

  throw new AppError(500, defaultMessage);
};
