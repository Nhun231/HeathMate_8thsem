import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { User, UserDocument } from '../../../shared/schemas/user.schema';

export type WaterHistoryDocument = HydratedDocument<WaterHistory>;
export type UserWaterDataDocument = HydratedDocument<UserWaterData>;

@Schema()
export class WaterHistory {
    _id: Types.ObjectId;
    @Prop({ type: String, required: true })
    time: string;

    @Prop({ type: Number, required: true })
    amount: number;
}

export const WaterHistorySchema = SchemaFactory.createForClass(WaterHistory);

@Schema({ timestamps: true })
export class UserWaterData {
    @Prop({ type: Types.ObjectId, ref: User.name, required: true })
    userId: Types.ObjectId | UserDocument;

    @Prop({ type: String, required: true })
    date: string;

    @Prop({ type: Number, required: true })
    target: number;

    @Prop({ type: Number, required: true, default: 0 })
    consumed: number;

    @Prop({ type: String, default: 'ml' })
    unit: string;

    @Prop({ type: [WaterHistorySchema], default: [] })
    history: WaterHistory[];
}

export const UserWaterDataSchema = SchemaFactory.createForClass(UserWaterData);
UserWaterDataSchema.index({ userId: 1, date: 1 }, { unique: true });
