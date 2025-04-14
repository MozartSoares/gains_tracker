import { Exercise, ExerciseModel } from '@models/Exercise/model';
import { BaseService } from './base.service';
import { MuscleGroups } from '@models/Exercise/enums';
import { AppError } from '@/types/errors';

export class ExerciseService extends BaseService<Exercise> {
  constructor() {
    super(ExerciseModel);
  }

  async findMyExercises(userId: string) {
    return this.model.find({ userId, deleted_at: { $exists: false } }).exec();
  }

  async findDefaultExercises() {
    return this.model.find({ userId: null, deleted_at: { $exists: false } }).exec();
  }

  async findByMuscleGroup(muscleGroup: MuscleGroups, userId: string,defaults = true,mine = true) {
    return this.model.find({ 
      muscleGroups: muscleGroup, 
      deleted_at: { $exists: false },
      $or: [
        { userId },
        { private: false }
      ]
    }).exec();
  }
}
