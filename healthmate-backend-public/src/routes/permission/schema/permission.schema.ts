import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument, Types } from 'mongoose';
import { Role, RoleDocument } from 'src/shared/schemas/role.schema';

@Schema({ timestamps: true })
export class Permission {
  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: String, required: false })
  description: string;

  @Prop({ type: String, required: true })
  path: string;

  @Prop({
    type: String,
    required: true,
  })
  method: string;

  @Prop({
    type: [mongoose.Schema.Types.ObjectId],
    ref: Role.name,
    required: true,
  })
  roleId: [Types.ObjectId] | [RoleDocument];
}

export const PermissionSchema = SchemaFactory.createForClass(Permission);

export type PermissionDocument = HydratedDocument<Permission>;
