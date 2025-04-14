import { Workout, WorkoutModel } from '@models/Workout/model';
import { BaseService } from './base.service';
import { AppError } from '@/types/errors';

export class WorkoutService extends BaseService<Workout> {
  constructor() {
    super(WorkoutModel);
  }

  async findMyWorkouts(userId: string) {
    return this.model.find({ userId, deleted_at: { $exists: false } }).exec();
  }

  async findDefaultWorkouts() {
    return this.model.find({ userId: null, deleted_at: { $exists: false } }).exec();
  }
}
