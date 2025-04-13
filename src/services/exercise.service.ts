import { Exercise, ExerciseModel } from '../models/Exercise/model';

export class ExerciseService {
  async findAll(): Promise<Exercise[]> {
    return ExerciseModel.find();
  }

  async findById(id: string): Promise<Exercise | null> {
    return ExerciseModel.findById(id);
  }

  async create(data: Exercise): Promise<Exercise> {
    const exercise = new ExerciseModel(data);
    return exercise.save();
  }

  async update(id: string, data: Partial<Exercise>): Promise<Exercise | null> {
    return ExerciseModel.findByIdAndUpdate(id, { ...data, updatedAt: new Date() }, { new: true });
  }

  async delete(id: string): Promise<boolean> {
    const result = await ExerciseModel.findByIdAndDelete(id);
    return !!result;
  }
}
