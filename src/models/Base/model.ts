import { prop, getModelForClass, modelOptions } from '@typegoose/typegoose';

@modelOptions({
  schemaOptions: {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
})
export class BaseModel {
  @prop()
  public created_at?: Date;

  @prop()
  public updated_at?: Date;

  @prop()
  public deleted_at?: Date;
}
