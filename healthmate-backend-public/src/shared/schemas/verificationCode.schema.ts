import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { TypeOfVerificationCode } from 'src/shared/constants/auth.constant';

@Schema({ timestamps: { createdAt: true, updatedAt: true } })
export class VerificationCode {
  @Prop({ type: String, required: true, notNull: true })
  email: string;

  @Prop({ type: String })
  code: string;

  @Prop({
    type: String,
    enum: [
      TypeOfVerificationCode.REGISTER,
      TypeOfVerificationCode.FORGOT_PASSWORD,
    ],
  })
  type: string;

  @Prop({ type: Date })
  expiresAt: Date;
}

export const VerificationCodeSchema =
  SchemaFactory.createForClass(VerificationCode);

export type VerificationCodeDocument = HydratedDocument<VerificationCode>;

VerificationCodeSchema.index({ email: 1, code: 1, type: 1 }, { unique: true });
