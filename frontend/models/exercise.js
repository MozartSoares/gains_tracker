export class Exercise {
  id;
  name;
  description;
  muscleGroups;
  equipment;
  isPrivate;
  userId;

  constructor(exercise) {
    this.id = exercise.id;
    this.name = exercise.name;
    this.description = exercise.description;
    this.muscleGroups = exercise.muscleGroups;
    this.equipment = exercise.equipment;
    this.isPrivate = exercise.isPrivate;
    this.userId = exercise.userId;
  }
}

export const muscleGroups = [
  'Shoulders',
  'Triceps',
  'Biceps',
  'Forearms',
  'Chest',
  'Back',
  'Abs',
  'Glutes',
  'Quadriceps',
  'Hamstrings',
  'Calves',
  'Other',
];

export const equipment = ['Bodyweight', 'Machine', 'Cable Machine', 'Dumbbell', 'Barbell', 'Other'];
