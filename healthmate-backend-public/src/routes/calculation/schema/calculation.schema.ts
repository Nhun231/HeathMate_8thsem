import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import mongoose from 'mongoose';
import { ActivityLevel } from 'src/shared/constants/auth.constant';
import { User, UserDocument } from 'src/shared/schemas/user.schema';

@Schema({ timestamps: true })
export class Calculation {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: User.name,
    required: true,
  })
  userId: Types.ObjectId | UserDocument;

  @Prop({ type: Number, required: true })
  height: number;

  @Prop({ type: Number, required: true })
  weight: number;

  @Prop({
    type: String,
    enum: [
      ActivityLevel.Sedentary,
      ActivityLevel.Light,
      ActivityLevel.Moderate,
      ActivityLevel.Active,
      ActivityLevel.VeryActive,
    ],
    required: true,
  })
  activityLevel: string;

  @Prop({ type: Number, required: true })
  bmr: number;

  @Prop({ type: Number, required: true })
  tdee: number;

  @Prop({ type: Number, required: true })
  bmi: number;

  @Prop({ type: Number, required: true })
  waterNeeded: number;

  @Prop({ type: Number, required: true })
  protein: number;

  @Prop({ type: Number, required: true })
  fat: number;

  @Prop({ type: Number, required: true })
  carbs: number;

  @Prop({ type: Number, required: true })
  fiber: number;
}

export const CalculationSchema = SchemaFactory.createForClass(Calculation);

CalculationSchema.index({ userId: 1, createdAt: -1 });

export type CalculationDocument = HydratedDocument<Calculation>;
