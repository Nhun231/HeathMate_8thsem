import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument, Types } from 'mongoose';
import { Gender, UserStatus } from 'src/shared/constants/auth.constant';
import { Role, RoleDocument } from './role.schema';

@Schema({ timestamps: true })
export class User {
  @Prop({ type: String, required: true, unique: true })
  email: string;

  @Prop({ type: String, required: true })
  password: string;

  @Prop({ type: String, required: true })
  fullname: string;

  @Prop({ type: String, enum: [Gender.Male, Gender.Female, Gender.Other] })
  gender: string;

  @Prop({ type: Date })
  dob: Date;

  @Prop({ type: String })
  phoneNumber: string;

  @Prop({ type: String })
  avatar: string;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: Role.name,
    required: true,
  })
  roleId: Types.ObjectId | RoleDocument;

  @Prop({
    type: String,
    enum: [UserStatus.Active, UserStatus.Inactive, UserStatus.Banned],
    default: UserStatus.Active,
  })
  status: string;
}

export const UserSchema = SchemaFactory.createForClass(User);

export type UserDocument = HydratedDocument<User>;
