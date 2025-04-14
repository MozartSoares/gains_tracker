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

  async findByMuscleGroup(muscleGroup: MuscleGroups, userId: string, publicExercises = true) {
    const query: any = {
      muscleGroups: muscleGroup,
      deleted_at: null
    };

    if (userId && publicExercises) {
      query.$or = [
        { isPrivate: false },
        { userId }
      ];
    } else if (userId) {
      query.userId = userId;
    } else {
      query.isPrivate = false;
    }

    return this.model.find(query);
  }
}
