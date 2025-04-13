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

  @prop({ required: true, enum: MuscleGroups })
  public muscleGroup!: MuscleGroups;

  @prop({ required: true, enum: Equipment })
  public equipment!: Equipment;
}
export const ExerciseModel = getModelForClass(Exercise);
