import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";
import mongoose from "mongoose";

export type BankInfoDocument = HydratedDocument<BankInfo>;

@Schema({ timestamps: true })
export class BankInfo {
    @Prop({ required: true })
    bankName: string;

    @Prop({ required: true })
    accountNumber: string;

    @Prop({ required: true })
    accountHolderName: string;

    @Prop()
    branch?: string;

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
    userId: mongoose.Types.ObjectId;
}

export const BankInfoSchema = SchemaFactory.createForClass(BankInfo);
