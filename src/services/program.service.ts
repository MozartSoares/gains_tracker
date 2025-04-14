import { Program, ProgramModel } from '@models/Program/model';
import { BaseService } from './base.service';
import { AppError } from '@/types/errors';

export class ProgramService extends BaseService<Program> {
  constructor() {
    super(ProgramModel);
  }

  async findMyPrograms(userId: string) {
    return this.model.find({ userId, deleted_at: { $exists: false } }).exec();
  }

  async findDefaultPrograms() {
    return this.model.find({ userId: null, deleted_at: { $exists: false } }).exec();
  }
}
