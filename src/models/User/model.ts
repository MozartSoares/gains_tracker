import { prop, getModelForClass, modelOptions } from '@typegoose/typegoose';
import { BaseModel } from '../Base/model';
import { AuthProviders } from './auth';

@modelOptions({
  schemaOptions: {
    timestamps: true,
    collection: 'users',
  },
})
export class User extends BaseModel {
  @prop({ required: true, unique: true })
  email!: string;

  @prop()
  password?: string;

  @prop({ required: true })
  name!: string;

  @prop()
  lastLogin?: Date;

  @prop()
  googleId?: string;

  @prop()
  githubId?: string;

  @prop()
  avatar?: string;

  @prop({ default: AuthProviders.LOCAL, type: () => [String], enum: Object.values(AuthProviders) })
  provider!: AuthProviders;
}

export const UserModel = getModelForClass(User);
