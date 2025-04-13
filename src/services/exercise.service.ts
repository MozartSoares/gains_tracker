import { Exercise, ExerciseModel } from '../models/Exercise/model';
import { BaseService } from './base.service';
import { MuscleGroups } from '../models/Exercise/enums';

export class ExerciseService extends BaseService<Exercise> {
  constructor() {
    super(ExerciseModel);
  }

  async findByMuscleGroup(muscleGroup: MuscleGroups) {
    return this.model.find({ muscleGroup }).exec();
  }

}
