import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

@Schema({ timestamps: { createdAt: true, updatedAt: true } })
export class Role {
  @Prop({ type: String, required: true, notNull: true })
  name: string;

  @Prop({ type: String })
  description: string;
}

export const RoleSchema = SchemaFactory.createForClass(Role);

export type RoleDocument = HydratedDocument<Role>;
