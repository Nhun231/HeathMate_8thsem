import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { User, UserDocument } from '../../../shared/schemas/user.schema';

export type ScheduleItemDocument = HydratedDocument<ScheduleItem>;
export type WaterReminderSettingDocument = HydratedDocument<WaterReminderSetting>;

@Schema()
export class ScheduleItem {

  @Prop({ type: String, required: true })
  time: string; // ví dụ: "06:00"

  @Prop({ type: Number, required: true })
  amount: number; // ví dụ: "250ml"
}

export const ScheduleItemSchema = SchemaFactory.createForClass(ScheduleItem);

@Schema({ timestamps: true })
export class WaterReminderSetting {
  _id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: User.name, required: true, unique: true })
  userId: Types.ObjectId | UserDocument;

  @Prop({ type: String, required: true })
  wakeUpTime: string; // ví dụ: "06:00"

  @Prop({ type: String, required: true })
  sleepTime: string; // ví dụ: "23:00"

  @Prop({ type: Number, required: true })
  reminderGap: number; // minutes

  @Prop({ type: String })
  expoPushToken?: string; // ExponentPushToken[...]

  @Prop({ type: [ScheduleItemSchema], _id: false }) 
  schedule?: ScheduleItem[];
}

export const WaterReminderSettingSchema = SchemaFactory.createForClass(WaterReminderSetting);
