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
    NotFoundUserWaterDataException,
    NotFoundWaterHistoryRecordException,
    InvalidWaterAmountException,
    WaterHistoryUpdateNotAllowedException,
    WaterHistoryDeleteNotAllowedException,
    ExceedDailyWaterLimitException,
} from './water.error';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

@Injectable()
export class WaterService {
    private readonly MAX_SINGLE_ML = 1000; // tối đa mỗi lần thêm

    constructor(
        private readonly waterRepo: WaterRepository,
        private readonly calculateRepo: CalculationRepo,
    ) { }

    /** Lấy ngày hiện tại theo múi giờ Việt Nam (YYYY-MM-DD) */
    private getTodayStringVN(): string {
        return dayjs().tz('Asia/Ho_Chi_Minh').format('YYYY-MM-DD');
    }

    /** Lấy giờ hiện tại theo múi giờ Việt Nam (HH:mm) */
    private getCurrentTimeVN(): string {
        return dayjs().tz('Asia/Ho_Chi_Minh').format('HH:mm');
    }

    /** Tính khoảng cách ngày (theo múi giờ VN) */
    private getDiffDaysVN(date: string): number {
        const now = dayjs().tz('Asia/Ho_Chi_Minh').startOf('day');
        const record = dayjs.tz(date, 'Asia/Ho_Chi_Minh').startOf('day');
        return now.diff(record, 'day');
    }

    /** Lấy dữ liệu nước trong ngày (tự tạo nếu chưa có) */
    async getWaterData(userId: Types.ObjectId, data?: GetWaterByDateType) {
        const date = data?.date || this.getTodayStringVN();
        let waterData = await this.waterRepo.findByUserAndDate(userId, date);

        const latestCalc = await this.calculateRepo.findLatestByUserId(userId);
        const targetWater = latestCalc ? Math.round(latestCalc.waterNeeded * 1000) : 2500; // ml

        // Nếu chưa có thì tạo mới
        if (!waterData) {
            waterData = await this.waterRepo.create({
                userId,
                date,
                target: targetWater,
                consumed: 0,
                unit: 'ml',
                history: [],
            });
        }
        // Nếu đã có nhưng target thay đổi -> cập nhật lại
        else if (waterData.target !== targetWater) {
            waterData = await this.waterRepo.update(userId, date, { target: targetWater });
        }

        return waterData;
    }

    /** Thêm lượng nước uống mới */
    async addWaterIntake(userId: Types.ObjectId, data: AddWaterType) {
        if (data.amount < 10 || data.amount > this.MAX_SINGLE_ML)
            throw InvalidWaterAmountException;

        const date = this.getTodayStringVN();
        const time = this.getCurrentTimeVN();

        // Lấy hoặc tạo waterData
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

        // Kiểm tra tổng sau khi thêm
        const maxAllowed = (waterData.target ?? 2500) + 1000;
        const newTotal = (waterData.consumed ?? 0) + data.amount;

        if (newTotal > maxAllowed) throw ExceedDailyWaterLimitException;

        return await this.waterRepo.addRecord(userId, date, { time, amount: data.amount });
    }

    /** Cập nhật lượng nước của bản ghi cụ thể */
    async updateWaterAmount(userId: Types.ObjectId, data: UpdateWaterHistoryType) {
        const diffDays = this.getDiffDaysVN(data.date);
        if (diffDays > 7) throw WaterHistoryUpdateNotAllowedException;
        if (data.amount < 10 || data.amount > this.MAX_SINGLE_ML)
            throw InvalidWaterAmountException;

        const waterData = await this.waterRepo.findByUserAndDate(userId, data.date);
        if (!waterData) throw NotFoundUserWaterDataException;

        const historyItem = waterData.history.find(h => h._id?.toString() === data.recordId);
        if (!historyItem) throw NotFoundWaterHistoryRecordException;

        // Tính tổng mới sau update
        const maxAllowed = (waterData.target ?? 2500) + 1000;
        const totalAfterUpdate =
            (waterData.consumed ?? 0) - historyItem.amount + data.amount;
        if (totalAfterUpdate > maxAllowed) throw InvalidWaterAmountException;

        return await this.waterRepo.updateHistoryAmount(
            userId,
            data.date,
            data.recordId,
            data.amount,
        );
    }

    /** Xóa bản ghi uống nước cụ thể */
    async deleteWaterRecord(userId: Types.ObjectId, data: DeleteWaterHistoryType) {
        const diffDays = this.getDiffDaysVN(data.date);
        if (diffDays > 7) throw WaterHistoryDeleteNotAllowedException;

        const waterData = await this.waterRepo.findByUserAndDate(userId, data.date);
        if (!waterData) throw NotFoundUserWaterDataException;

        const historyItem = waterData.history.find(h => h._id?.toString() === data.recordId);
        if (!historyItem) throw NotFoundWaterHistoryRecordException;

        return await this.waterRepo.deleteHistory(userId, data.date, data.recordId);
    }
}
