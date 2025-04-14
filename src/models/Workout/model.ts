import { getModelForClass, modelOptions, prop } from '@typegoose/typegoose';
import { BaseModel } from '@/models/Base/model';
import { WorkoutExercise } from './types';

@modelOptions({
  schemaOptions: {
    timestamps: true,
  },
  options: {
    allowMixed: 0,
  },
})
export class Workout extends BaseModel {
  @prop({ required: true })
  public name!: string;

  @prop()
  public description?: string;

  @prop({ required: true })
  public duration!: number; // in seconds

  @prop({ required: true, type: () => Object })
  public exercises!: WorkoutExercise[];

  @prop({ default: false })
  public isPrivate?: boolean;

  @prop({ required: false, default: null })
  public userId!: string;
}

export const getResponseWorkout = (workout: Workout & { _id: string }) => {
  return {
    id: workout._id,
    name: workout.name,
    description: workout.description,
    duration: workout.duration,
    exercises: workout.exercises,
    isPrivate: workout.isPrivate,
    userId: workout.userId,
  };
};

export const WorkoutModel = getModelForClass(Workout);
