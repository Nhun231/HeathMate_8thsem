import { Injectable } from '@nestjs/common';
import { Model, Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { UserWaterData, UserWaterDataDocument, WaterHistory } from './schema/water.schema';

@Injectable()
export class WaterRepository {
    constructor(
        @InjectModel(UserWaterData.name)
        private waterModel: Model<UserWaterDataDocument>,
    ) { }

    async findByUserAndDate(userId: Types.ObjectId, date: string) {
        return this.waterModel.findOne({ userId, date });
    }

    async create(waterData: Partial<UserWaterData>) {
        return this.waterModel.create(waterData);
    }

    async update(userId: Types.ObjectId, date: string, data: Partial<UserWaterData>) {
        return this.waterModel.findOneAndUpdate({ userId, date }, data, { new: true });
    }

    // Add new intake, tự generate _id cho history item
    async addRecord(userId: Types.ObjectId, date: string, historyItem: { time: string; amount: number }) {
        const newItem: WaterHistory = { _id: new Types.ObjectId(), ...historyItem };
        return this.waterModel.findOneAndUpdate(
            { userId, date },
            { $push: { history: { $each: [newItem], $position: 0 } }, $inc: { consumed: newItem.amount } },
            { new: true }
        );
    }

    // Update amount theo recordId
    async updateHistoryAmount(userId: Types.ObjectId, date: string, recordId: string, newAmount: number) {
        const waterData = await this.waterModel.findOne({ userId, date });
        if (!waterData) return null;

        const historyItem = waterData.history.find(h => h._id.toString() === recordId);
        if (!historyItem) return null;

        const oldAmount = historyItem.amount;
        historyItem.amount = newAmount;
        waterData.consumed = waterData.consumed - oldAmount + newAmount;

        return waterData.save();
    }

    // Delete history item theo recordId
    async deleteHistory(userId: Types.ObjectId, date: string, recordId: string) {
        const waterData = await this.waterModel.findOne({ userId, date });
        if (!waterData) return null;

        const index = waterData.history.findIndex(h => h._id.toString() === recordId);
        if (index === -1) return null;

        const amountToRemove = waterData.history[index].amount;
        waterData.history.splice(index, 1);
        waterData.consumed -= amountToRemove;

        return waterData.save();
    }

    async findAllByUser(userId: Types.ObjectId, filter?: { startDate?: Date; endDate?: Date }) {
        const query: any = { userId };
        if (filter?.startDate && filter?.endDate) {
            query.createdAt = { $gte: filter.startDate, $lte: filter.endDate };
        }
        return this.waterModel.find(query).sort({ createdAt: 1 });
    }
}
