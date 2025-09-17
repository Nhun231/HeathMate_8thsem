import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

@Schema({ timestamps: true })
export class RefreshToken {
  @Prop({ type: String, required: true, unique: true, notNull: true })
  token: string;

  @Prop({ type: String })
  userId: string;

  @Prop({ type: String })
  deviceId: string;

  @Prop({ type: Date })
  expiresAt: Date;
}

export const RefreshTokenSchema = SchemaFactory.createForClass(RefreshToken);

export type RefreshTokenDocument = HydratedDocument<RefreshToken>;
