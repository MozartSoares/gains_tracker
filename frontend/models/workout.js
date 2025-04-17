export class Workout {
  id;
  name;
  description;
  duration; // in seconds
  exercises; // array of WorkoutExercise
  isPrivate;
  userId;

  constructor(workout) {
    this.id = workout.id;
    this.name = workout.name;
    this.description = workout.description;
    this.duration = workout.duration;
    this.exercises = workout.exercises;
    this.isPrivate = workout.isPrivate;
    this.userId = workout.userId;
  }
}

export class WorkoutExercise {
  exercise;
  sets;
  reps;
  weight;

  constructor(workoutExercise) {
    this.exercise = workoutExercise.exercise;
    this.sets = workoutExercise.sets;
    this.reps = workoutExercise.reps;
    this.weight = workoutExercise.weight;
  }
}

// Sample workout durations in minutes
export const workoutDurations = [15, 30, 45, 60, 90, 120];

// Sample set ranges
export const setRanges = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

// Sample rep ranges
export const repRanges = [1, 2, 3, 4, 5, 6, 8, 10, 12, 15, 20];
