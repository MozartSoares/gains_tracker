import { getModelForClass, modelOptions, prop } from '@typegoose/typegoose';
import { BaseModel } from '@/models/Base/model';
import { ProgramObjective, ProgramLevel } from './enums';
import { Workout } from '../Workout/model';

@modelOptions({
  schemaOptions: {
    timestamps: true,
  },
})
export class Program extends BaseModel {
  @prop({ required: true })
  public name!: string;

  @prop()
  public description?: string;

  @prop({ required: true, enum: Object.values(ProgramObjective) })
  public objective!: ProgramObjective;

  @prop({ required: true })
  public duration!: number; // in weeks

  @prop({ required: true, type: () => [Object] })
  public workouts!: {
    workout: Workout;
    order: number;
    focus?: string;
    tips?: string;
  }[];

  @prop()
  public frequency?: number; // workouts per week

  @prop({ enum: Object.values(ProgramLevel) })
  public level?: ProgramLevel;

  @prop({ default: false })
  public private?: boolean;

  @prop({ required: false, default: null })
  public userId!: string;
}

export const getResponseProgram = (program: Program & { _id: string }) => {
  return {
    id: program._id,
    name: program.name,
    description: program.description,
    objective: program.objective,
    duration: program.duration,
    workouts: program.workouts,
    frequency: program.frequency,
    level: program.level,
    private: program.private,
    userId: program.userId,
  };
};

export const ProgramModel = getModelForClass(Program);
