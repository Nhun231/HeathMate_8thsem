import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import mongoose from 'mongoose';
import { Goal } from 'src/shared/constants/goal.constant';
import { User, UserDocument } from 'src/shared/schemas/user.schema';

@Schema({ timestamps: true })
export class DietPlan {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: User.name,
    required: true,
  })
  userId: Types.ObjectId | UserDocument;

  @Prop({
    type: String,
    enum: [Goal.GainWeight, Goal.LoseWeight, Goal.MaintainWeight],
    required: true,
  })
  goal: string;

  @Prop({ type: Number })
  targetWeightChange: number;

  @Prop({ type: Number, required: true })
  dailyCalories: number;

  @Prop({ type: Number, required: true })
  durationDays: number;

  @Prop({ type: Date, default: Date.now })
  startDate: Date;

  @Prop({ type: Date })
  endDate: Date;

  @Prop({ type: Number, required: true })
  referenceTDEE: number;
}

export const DietPlanSchema = SchemaFactory.createForClass(DietPlan);

export type DietPlanDocument = HydratedDocument<DietPlan>;
