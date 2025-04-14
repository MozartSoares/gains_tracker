import { Exercise } from '../Exercise';

export interface WorkoutExercise {
  exercise: Exercise;
  sets: number;
  reps: number;
  weight?: number;
}
