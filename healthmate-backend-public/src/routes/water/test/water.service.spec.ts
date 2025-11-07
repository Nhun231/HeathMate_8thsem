import { Test, TestingModule } from '@nestjs/testing';
import { WaterService } from '../water.service';
import { WaterRepository } from '../water.repo';
import { AddWaterSchema } from '../schema//request/water.request.schema';
import { CalculationRepo } from '../../calculation/calculation.repo';
import { ZodError } from 'zod';

import {
    NotFoundUserWaterDataException,
    NotFoundWaterHistoryRecordException,
    InvalidWaterAmountException,
    WaterHistoryUpdateNotAllowedException,
    WaterHistoryDeleteNotAllowedException,
    ExceedDailyWaterLimitException,
} from '../water.error';
import { Types } from 'mongoose';
import dayjs from 'dayjs';

// ===== MOCKS =====
const mockWaterRepo = {
    findByUserAndDate: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    addRecord: jest.fn(),
    updateHistoryAmount: jest.fn(),
    deleteHistory: jest.fn(),
};

const mockCalcRepo = {
    findLatestByUserId: jest.fn(),
};

describe('WaterService', () => {
    let service: WaterService;
    let userId: Types.ObjectId;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                WaterService,
                { provide: WaterRepository, useValue: mockWaterRepo },
                { provide: CalculationRepo, useValue: mockCalcRepo },
            ],
        }).compile();

        service = module.get(WaterService);
        userId = new Types.ObjectId();

        jest.clearAllMocks();
    });

    // -----------------------------
    // getWaterData()
    // -----------------------------
    describe('getWaterData', () => {
        it('TC01: Should create new waterData if not found', async () => {
            mockWaterRepo.findByUserAndDate.mockResolvedValue(null);
            mockCalcRepo.findLatestByUserId.mockResolvedValue({ waterNeeded: 2.5 });
            mockWaterRepo.create.mockResolvedValue({ userId, target: 2500 });

            const result = await service.getWaterData(userId);

            expect(mockWaterRepo.create).toHaveBeenCalled();
            expect(result).not.toBeNull();
            if (result) {
                expect(result.target).toBe(2500);
            }

        });

        it('Should update waterData if target changed', async () => {
            mockWaterRepo.findByUserAndDate.mockResolvedValue({ target: 2000 });
            mockCalcRepo.findLatestByUserId.mockResolvedValue({ waterNeeded: 3 });
            mockWaterRepo.update.mockResolvedValue({ target: 3000 });

            const result = await service.getWaterData(userId);
            expect(mockWaterRepo.update).toHaveBeenCalled();
            expect(result).not.toBeNull();
            if (result) {
                expect(result.target).toBe(3000);
            }
        });

        it('Should return existing waterData if target same', async () => {
            const existing = { target: 2500 };
            mockWaterRepo.findByUserAndDate.mockResolvedValue(existing);
            mockCalcRepo.findLatestByUserId.mockResolvedValue({ waterNeeded: 2.5 });

            const result = await service.getWaterData(userId);
            expect(result).toEqual(existing);
        });
    });

    // -----------------------------
    // addWaterIntake()
    // -----------------------------
    describe('addWaterIntake', () => {
        it('TC01: 9ml - Should throw InvalidWaterAmountException if <10ml', async () => {
            await expect(
                service.addWaterIntake(userId, { amount: 9 }),
            ).rejects.toThrow(InvalidWaterAmountException);
        });

        it('TC02: 1001ml - Should throw InvalidWaterAmountException if >1000ml', async () => {
            await expect(
                service.addWaterIntake(userId, { amount: 1001 }),
            ).rejects.toThrow(InvalidWaterAmountException);
        });

        it('TC03: 100ml - Should add record normally', async () => {
            mockWaterRepo.findByUserAndDate.mockResolvedValue({
                target: 2500,
                consumed: 1500,
            });
            mockWaterRepo.addRecord.mockResolvedValue({ consumed: 1600 });

            const result = await service.addWaterIntake(userId, { amount: 100 });
            expect(mockWaterRepo.addRecord).toHaveBeenCalled();
            expect(result).not.toBeNull();
            if (result) {
                expect(result.consumed).toBe(1600);
            }
        });

        it('TC04: null - Should throw error if amount is null', async () => {
            await expect(
                service.addWaterIntake(userId, { amount: null as any }),
            ).rejects.toThrow(InvalidWaterAmountException);
        });

        it('TC05: "a" - Should throw error if amount is not a number', async () => {
            try {
                AddWaterSchema.parse({ amount: 'a' });
            } catch (error) {
                expect(error).toBeInstanceOf(ZodError);
                const zerr = error as ZodError;
                expect(zerr.issues[0].message).toContain('Invalid input: expected number, received string');
                expect(zerr.issues[0].code).toBe('invalid_type');
            }
        });

        it('TC06: 1000ml - Should add record normally', async () => {
            mockWaterRepo.findByUserAndDate.mockResolvedValue({
                target: 2500,
                consumed: 1500,
            });
            mockWaterRepo.addRecord.mockResolvedValue({ consumed: 2500 });

            const result = await service.addWaterIntake(userId, { amount: 1000 });
            expect(mockWaterRepo.addRecord).toHaveBeenCalled();
            expect(result).not.toBeNull();
            if (result) {
                expect(result.consumed).toBe(2500);
            }
        });

        it('TC07: 10ml - Should add record normally', async () => {
            mockWaterRepo.findByUserAndDate.mockResolvedValue({
                target: 2500,
                consumed: 1500,
            });
            mockWaterRepo.addRecord.mockResolvedValue({ consumed: 1510 });

            const result = await service.addWaterIntake(userId, { amount: 10 });
            expect(mockWaterRepo.addRecord).toHaveBeenCalled();
            expect(result).not.toBeNull();
            if (result) {
                expect(result.consumed).toBe(1510);
            }
        });
        it('TC08: 100ml - Should create new waterData if not found', async () => {
            mockWaterRepo.findByUserAndDate.mockResolvedValue(null);
            mockCalcRepo.findLatestByUserId.mockResolvedValue({ waterNeeded: 2.5 });
            mockWaterRepo.create.mockResolvedValue({
                userId,
                target: 2500,
                consumed: 0,
            });
            mockWaterRepo.addRecord.mockResolvedValue({
                userId,
                target: 2500,
                consumed: 200,
                date: '2025-10-27',
                unit: 'ml',
                history: [{ time: '08:00', amount: 200 }],
            });


            const result = await service.addWaterIntake(userId, { amount: 100 });

            expect(mockWaterRepo.create).toHaveBeenCalled();
            expect(result).not.toBeNull();
            if (result) {
                expect(result.target).toBe(2500);
            }
        });

        it('Should throw ExceedDailyWaterLimitException if exceed target+1L', async () => {
            mockWaterRepo.findByUserAndDate.mockResolvedValue({
                target: 2500,
                consumed: 3500,
            });

            await expect(
                service.addWaterIntake(userId, { amount: 100 }),
            ).rejects.toThrow(ExceedDailyWaterLimitException);
        });


    });

    // -----------------------------
    // updateWaterAmount()
    // -----------------------------
    describe('updateWaterAmount', () => {
        const date = dayjs().format('YYYY-MM-DD');
        const recordId = new Types.ObjectId().toString();

        // -----------------------------
        // Amount validation (10–1000ml)
        // -----------------------------
        it('TC01: Should throw InvalidWaterAmountException if amount < 10 (9ml)', async () => {
            jest.spyOn<any, any>(service, 'getDiffDaysVN').mockReturnValue(7);
            await expect(
                service.updateWaterAmount(userId, { date, recordId, amount: 9 }),
            ).rejects.toThrow(InvalidWaterAmountException);
        });

        it('TC02: Should throw InvalidWaterAmountException if amount > 1000 (1001ml)', async () => {
            jest.spyOn<any, any>(service, 'getDiffDaysVN').mockReturnValue(7);
            await expect(
                service.updateWaterAmount(userId, { date, recordId, amount: 1001 }),
            ).rejects.toThrow(InvalidWaterAmountException);
        });

        it('TC03: Should update successfully if amount is valid (100ml)', async () => {
            jest.spyOn<any, any>(service, 'getDiffDaysVN').mockReturnValue(7);
            mockWaterRepo.findByUserAndDate.mockResolvedValue({
                target: 2500,
                consumed: 1500,
                history: [{ _id: recordId, amount: 50 }],
            });
            mockWaterRepo.updateHistoryAmount.mockResolvedValue({ consumed: 1600 });

            const result = await service.updateWaterAmount(userId, {
                date,
                recordId,
                amount: 100,
            });

            expect(mockWaterRepo.updateHistoryAmount).toHaveBeenCalled();
            expect(result).not.toBeNull();
            if (result) expect(result.consumed).toBe(1600);
        });

        it('TC04: Should throw InvalidWaterAmountException if amount = null', async () => {
            jest.spyOn<any, any>(service, 'getDiffDaysVN').mockReturnValue(7);
            await expect(
                service.updateWaterAmount(userId, { date, recordId, amount: null as any }),
            ).rejects.toThrow(InvalidWaterAmountException);
        });

        // it('TC05: Should throw InvalidWaterAmountException if amount = "a"', async () => {
        //     jest.spyOn<any, any>(service, 'getDiffDaysVN').mockReturnValue(7);
        //     await expect(
        //         service.updateWaterAmount(userId, { date, recordId, amount: "a" as any}),
        //     ).rejects.toThrow(InvalidWaterAmountException);
        // });

        it('TC06: Should update successfully if amount = 1000 (max valid)', async () => {
            jest.spyOn<any, any>(service, 'getDiffDaysVN').mockReturnValue(7);
            mockWaterRepo.findByUserAndDate.mockResolvedValue({
                target: 3000,
                consumed: 2000,
                history: [{ _id: recordId, amount: 100 }],
            });
            mockWaterRepo.updateHistoryAmount.mockResolvedValue({ consumed: 2900 });

            const result = await service.updateWaterAmount(userId, {
                date,
                recordId,
                amount: 1000,
            });

            expect(result).not.toBeNull();
            if (result) expect(result.consumed).toBe(2900);
        });

        it('TC07: Should update successfully if amount = 10 (min valid)', async () => {
            jest.spyOn<any, any>(service, 'getDiffDaysVN').mockReturnValue(7);
            mockWaterRepo.findByUserAndDate.mockResolvedValue({
                target: 2500,
                consumed: 1490,
                history: [{ _id: recordId, amount: 50 }],
            });
            mockWaterRepo.updateHistoryAmount.mockResolvedValue({ consumed: 1450 });

            const result = await service.updateWaterAmount(userId, {
                date,
                recordId,
                amount: 10,
            });

            expect(result).not.toBeNull();
            if (result) expect(result.consumed).toBe(1450);
        });

        // -----------------------------
        // Day difference (<=7 days rule)
        // -----------------------------
        it('Should update successfully if diffDays = 7 (allowed)', async () => {
            jest.spyOn<any, any>(service, 'getDiffDaysVN').mockReturnValue(7);
            mockWaterRepo.findByUserAndDate.mockResolvedValue({
                target: 2000,
                consumed: 1000,
                history: [{ _id: recordId, amount: 100 }],
            });
            mockWaterRepo.updateHistoryAmount.mockResolvedValue({ consumed: 1100 });

            const result = await service.updateWaterAmount(userId, {
                date,
                recordId,
                amount: 200,
            });

            expect(result).not.toBeNull();
            if (result) expect(result.consumed).toBe(1100);
        });

        it('TC08: Should throw WaterHistoryUpdateNotAllowedException if diffDays > 7', async () => {
            jest.spyOn<any, any>(service, 'getDiffDaysVN').mockReturnValue(8);
            mockWaterRepo.findByUserAndDate.mockResolvedValue({
                target: 2000,
                consumed: 500,
                history: [
                    {
                        _id: recordId,
                        time: '08:00',
                        amount: 200,
                        date: dayjs().subtract(8, 'day').toDate(),
                    },
                ],
            });

            await expect(
                service.updateWaterAmount(userId, { date, recordId, amount: 100 }),
            ).rejects.toThrow(WaterHistoryUpdateNotAllowedException);
        });

        it('TC09: Should throw WaterHistoryUpdateNotAllowedException if diffDays > 7 and amount is not valid', async () => {
            jest.spyOn<any, any>(service, 'getDiffDaysVN').mockReturnValue(8);
            mockWaterRepo.findByUserAndDate.mockResolvedValue({
                target: 2000,
                consumed: 500,
                history: [
                    {
                        _id: recordId,
                        time: '08:00',
                        amount: 200,
                        date: dayjs().subtract(8, 'day').toDate(),
                    },
                ],
            });

            await expect(
                service.updateWaterAmount(userId, { date, recordId, amount: 9 }),
            ).rejects.toThrow(WaterHistoryUpdateNotAllowedException);
        });

        it('TC010: Should update successfully if diffDays = 6 (allowed)', async () => {
            jest.spyOn<any, any>(service, 'getDiffDaysVN').mockReturnValue(6);
            mockWaterRepo.findByUserAndDate.mockResolvedValue({
                target: 2000,
                consumed: 1500,
                history: [{ _id: recordId, amount: 100 }],
            });
            mockWaterRepo.updateHistoryAmount.mockResolvedValue({ consumed: 1600 });

            const result = await service.updateWaterAmount(userId, {
                date,
                recordId,
                amount: 200,
            });

            expect(result).not.toBeNull();
            if (result) expect(result.consumed).toBe(1600);
        });

        // -----------------------------
        // Other existing test cases
        // -----------------------------
        it('Should throw NotFoundUserWaterDataException if no user water data found', async () => {
            jest.spyOn<any, any>(service, 'getDiffDaysVN').mockReturnValue(0);
            mockWaterRepo.findByUserAndDate.mockResolvedValue(null);

            await expect(
                service.updateWaterAmount(userId, { date, recordId, amount: 100 }),
            ).rejects.toThrow(NotFoundUserWaterDataException);
        });

        it('Should throw NotFoundWaterHistoryRecordException if record not found', async () => {
            jest.spyOn<any, any>(service, 'getDiffDaysVN').mockReturnValue(0);
            mockWaterRepo.findByUserAndDate.mockResolvedValue({
                target: 2500,
                consumed: 1000,
                history: [],
            });

            await expect(
                service.updateWaterAmount(userId, { date, recordId, amount: 100 }),
            ).rejects.toThrow(NotFoundWaterHistoryRecordException);
        });

        it('Should throw InvalidWaterAmountException if total > target + 1000ml', async () => {
            jest.spyOn<any, any>(service, 'getDiffDaysVN').mockReturnValue(0);
            mockWaterRepo.findByUserAndDate.mockResolvedValue({
                target: 2000,
                consumed: 2900,
                history: [{ _id: recordId, amount: 50 }],
            });

            await expect(
                service.updateWaterAmount(userId, { date, recordId, amount: 300 }),
            ).rejects.toThrow(InvalidWaterAmountException);
        });
    });


    // -----------------------------
    // deleteWaterRecord()
    // -----------------------------
    describe('deleteWaterRecord', () => {
        const date = dayjs().format('YYYY-MM-DD');
        const recordId = new Types.ObjectId().toString();

        it('Should throw WaterHistoryDeleteNotAllowedException if >7 days', async () => {
            jest.spyOn<any, any>(service, 'getDiffDaysVN').mockReturnValue(8);
            mockWaterRepo.findByUserAndDate.mockResolvedValue({
                _id: new Types.ObjectId(),
                userId,
                date,
                target: 2000,
                consumed: 500,
                history: [
                    {
                        _id: recordId,
                        time: '08:00',
                        amount: 200,
                        date: dayjs().subtract(8, 'day').toDate(),
                    },
                ],
            });

            await expect(
                service.deleteWaterRecord(userId, { date, recordId }),
            ).rejects.toThrow(WaterHistoryDeleteNotAllowedException);
        });

        it('Should throw NotFoundUserWaterDataException if no data', async () => {
            jest.spyOn<any, any>(service, 'getDiffDaysVN').mockReturnValue(0);
            mockWaterRepo.findByUserAndDate.mockResolvedValue(null);
            await expect(
                service.deleteWaterRecord(userId, { date, recordId }),
            ).rejects.toThrow(NotFoundUserWaterDataException);
        });

        it('Should throw NotFoundWaterHistoryRecordException if not found', async () => {
            jest.spyOn<any, any>(service, 'getDiffDaysVN').mockReturnValue(0);
            mockWaterRepo.findByUserAndDate.mockResolvedValue({
                history: [],
            });
            await expect(
                service.deleteWaterRecord(userId, { date, recordId }),
            ).rejects.toThrow(NotFoundWaterHistoryRecordException);
        });

        it('Should delete record successfully', async () => {
            jest.spyOn<any, any>(service, 'getDiffDaysVN').mockReturnValue(0);
            mockWaterRepo.findByUserAndDate.mockResolvedValue({
                history: [{ _id: recordId }],
            });
            mockWaterRepo.deleteHistory.mockResolvedValue({ deleted: true });

            const result = await service.deleteWaterRecord(userId, { date, recordId });
            expect(mockWaterRepo.deleteHistory).toHaveBeenCalled();
            expect(result).toEqual({ deleted: true });
        });
    });
});
