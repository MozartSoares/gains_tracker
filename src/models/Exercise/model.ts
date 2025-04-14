import { getModelForClass, modelOptions, prop } from '@typegoose/typegoose';
import { BaseModel } from '@/models/Base/model';
import { Equipment, MuscleGroups } from './enums';

@modelOptions({
  schemaOptions: {
    timestamps: true,
  },
})
export class Exercise extends BaseModel {
  @prop({ required: true })
  public name!: string;

  @prop()
  public description?: string;

  @prop({ required: true, type: () => [String], enum: Object.values(MuscleGroups) })
  public muscleGroups!: MuscleGroups[];

  @prop({ required: true, enum: Object.values(Equipment) })
  public equipment!: Equipment;

  @prop({ required: false, default: null })
  public userId!: string;

  @prop({ default: false })
  public isPrivate!: boolean;
}

export const getResponseExercise = (exercise: Exercise & {_id: string}) => {
  return {
    id: exercise._id,
    name: exercise.name,
    description: exercise.description,
    muscleGroups: exercise.muscleGroups,
    equipment: exercise.equipment,
    isPrivate: exercise.isPrivate,
    userId: exercise.userId,
  };
};

export const ExerciseModel = getModelForClass(Exercise);
