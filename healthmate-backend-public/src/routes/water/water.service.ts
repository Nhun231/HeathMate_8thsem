import { Injectable } from '@nestjs/common';
import { WaterRepository } from './water.repo';
import { CalculationRepo } from '../calculation/calculation.repo';
import {
    AddWaterType,
    UpdateWaterHistoryType,
    DeleteWaterHistoryType,
    GetWaterByDateType,
} from './schema/request/water.request.schema';
import { Types } from 'mongoose';
import {
    WaterHistoryUpdateNotAllowedException,
    WaterHistoryDeleteNotAllowedException,
} from './water.error';

@Injectable()
export class WaterService {
    constructor(
        private readonly waterRepo: WaterRepository,
        private readonly calculateRepo: CalculationRepo,
    ) { }

    private getTodayStringVN(): string {
        const now = new Date();
        // Tạo ngày theo giờ VN
        const vnDate = new Date(
            now.getTime() + 7 * 60 * 60 * 1000 // cộng 7 tiếng
        );
        const yyyy = vnDate.getUTCFullYear();
        const mm = String(vnDate.getUTCMonth() + 1).padStart(2, '0');
        const dd = String(vnDate.getUTCDate()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd}`;
    }

    private getCurrentTimeVN(): string {
        const now = new Date();
        const vnDate = new Date(now.getTime() + 7 * 60 * 60 * 1000);
        const hh = String(vnDate.getUTCHours()).padStart(2, '0');
        const mm = String(vnDate.getUTCMinutes()).padStart(2, '0');
        return `${hh}:${mm}`;
    }

    async getWaterData(userId: Types.ObjectId, data?: GetWaterByDateType) {
        const date = data?.date || this.getTodayStringVN();

        let waterData = await this.waterRepo.findByUserAndDate(userId, date);

        if (!waterData) {
            const latestCalc = await this.calculateRepo.findLatestByUserId(userId);
            const targetWater = latestCalc ? Math.round(latestCalc.waterNeeded * 1000) : 2500;

            waterData = await this.waterRepo.create({
                userId,
                date,
                target: targetWater,
                consumed: 0,
                unit: 'ml',
                history: [],
            });
        }

        return waterData;
    }

    async addWaterIntake(userId: Types.ObjectId, data: AddWaterType) {
        if (data.amount <= 0) throw new Error('Invalid water amount');

        const date = this.getTodayStringVN();
        const time = this.getCurrentTimeVN();

        return await this.waterRepo.addRecord(userId, date, { time, amount: data.amount });
    }

    async updateWaterAmount(userId: Types.ObjectId, data: UpdateWaterHistoryType) {
        const recordDate = new Date(data.date);
        const today = new Date();
        const diffDays = Math.floor(
            (today.getTime() - recordDate.getTime()) / (1000 * 60 * 60 * 24),
        );
        if (diffDays > 6) throw WaterHistoryUpdateNotAllowedException;
        if (data.amount <= 0) throw new Error('Invalid water amount');

        const waterData = await this.waterRepo.findByUserAndDate(userId, data.date);
        if (!waterData) return null;

        // Tìm history item theo _id (recordId)
        const historyItem = waterData.history.find(h => h._id?.toString() === data.recordId);
        if (!historyItem) return null;

        return await this.waterRepo.updateHistoryAmount(
            userId,
            data.date,
            data.recordId,
            data.amount
        );
    }

    async deleteWaterRecord(userId: Types.ObjectId, data: DeleteWaterHistoryType) {
        const recordDate = new Date(data.date);
        const today = new Date();
        const diffDays = Math.floor(
            (today.getTime() - recordDate.getTime()) / (1000 * 60 * 60 * 24),
        );
        if (diffDays > 6) throw WaterHistoryDeleteNotAllowedException;

        const waterData = await this.waterRepo.findByUserAndDate(userId, data.date);
        if (!waterData) return null;

        // Xóa theo recordId
        const historyItem = waterData.history.find(h => h._id?.toString() === data.recordId);
        if (!historyItem) return null;

        return await this.waterRepo.deleteHistory(
            userId,
            data.date,
            data.recordId
        );
    }

}
