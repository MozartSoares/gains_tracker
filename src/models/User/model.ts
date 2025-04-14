import { prop, getModelForClass, modelOptions, DocumentType } from '@typegoose/typegoose';
import { BaseModel } from '../Base/model';
import { AuthProviders } from './auth';

@modelOptions({
  schemaOptions: {
    timestamps: true,
    collection: 'users',
  },
  options: {
    allowMixed: 0,
  },
})
export class User extends BaseModel {
  @prop({ required: true, unique: true })
  email!: string;

  @prop({ select: false })
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

  @prop({ select: false })
  sessionToken?: string;
}

export const getResponseUser = (user: User & { _id: string }) => {
  return {
    id: user._id.toString(),
    email: user.email,
    name: user.name,
    lastLogin: user.lastLogin,
    avatar: user.avatar,
    provider: user.provider,
    googleId: user.googleId,
    githubId: user.githubId,
  };
};

export const UserModel = getModelForClass(User);
