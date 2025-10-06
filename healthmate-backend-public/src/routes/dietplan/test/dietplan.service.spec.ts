import { Test, TestingModule } from '@nestjs/testing';
import { Types } from 'mongoose';
import { UnauthorizedException } from '@nestjs/common';

import { DietPlanService } from '../dietplan.service';
import { DietPlanRepo } from '../dietplan.repo';
import { CalculationRepo } from '../../calculation/calculation.repo';
import {
  NotFoundUserCalculationException,
  NotFoundDietPlanException,
  InvalidTargetWeightChangeException,
  TargetWeightTooHighException,
  TargetWeightTooLowException,
  TargetWeightExcess,
} from '../dietplan.error';

describe('DietPlanService', () => {
  let service: DietPlanService;

  const mockDietPlanRepo = {
    findCurrentByUserId: jest.fn(),
    update: jest.fn(),
    create: jest.fn(),
    findByDate: jest.fn(),
  };

  const mockCalculationRepo = {
    findByUserId: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DietPlanService,
        { provide: DietPlanRepo, useValue: mockDietPlanRepo },
        { provide: CalculationRepo, useValue: mockCalculationRepo },
      ],
    }).compile();

    service = module.get<DietPlanService>(DietPlanService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('generateDietPlan', () => {
    it('should throw UnauthorizedException when userId is missing', async () => {
      await expect(service.generateDietPlan({} as any, '')).rejects.toThrow(UnauthorizedException);
    });

    it('should throw NotFoundUserCalculationException when no calculations', async () => {
      const userId = new Types.ObjectId().toHexString();
      mockCalculationRepo.findByUserId.mockResolvedValue([]);

      await expect(service.generateDietPlan({ goal: 'MaintainWeight' } as any, userId)).rejects.toThrow(
        NotFoundUserCalculationException,
      );
      expect(mockCalculationRepo.findByUserId).toHaveBeenCalled();
    });

    it('should create a new diet plan when no existing plan', async () => {
      const userId = new Types.ObjectId().toHexString();
      const calcId = new Types.ObjectId();
      const latestCalc = { _id: calcId, tdee: 2100, weight: 70 };
      mockCalculationRepo.findByUserId.mockResolvedValue([latestCalc]);
      mockDietPlanRepo.findCurrentByUserId.mockResolvedValue(null);
      mockDietPlanRepo.create.mockResolvedValue({ id: 'created' });

      const body = { goal: 'MaintainWeight' } as any;

      const result = await service.generateDietPlan(body, userId);

      expect(result).toEqual({ id: 'created' });
      expect(mockDietPlanRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: expect.any(Object),
          goal: 'MaintainWeight',
          dailyCalories: 2100,
          durationDays: 0,
          referenceTDEE: 2100,
        }),
      );
    });

    it('should update existing plan when one exists', async () => {
      const userId = new Types.ObjectId().toHexString();
      const calcId = new Types.ObjectId();
      const latestCalc = { _id: calcId, tdee: 2000, weight: 80 };
      const existingPlan = { _id: new Types.ObjectId() };

      mockCalculationRepo.findByUserId.mockResolvedValue([latestCalc]);
      mockDietPlanRepo.findCurrentByUserId.mockResolvedValue(existingPlan);
      mockDietPlanRepo.update.mockResolvedValue({ id: 'updated' });

      const body = { goal: 'MaintainWeight' } as any;

      const result = await service.generateDietPlan(body, userId);

      expect(result).toEqual({ id: 'updated' });
      expect(mockDietPlanRepo.update).toHaveBeenCalledWith(existingPlan._id, expect.objectContaining({
        goal: 'MaintainWeight',
        dailyCalories: 2000,
        durationDays: 0,
        referenceTDEE: 2000,
      }));
    });

    it('should throw InvalidTargetWeightChangeException when targetWeightChange is missing or <= 0', async () => {
      const userId = new Types.ObjectId().toHexString();
      const calcId = new Types.ObjectId();
      const latestCalc = { _id: calcId, tdee: 2000, weight: 60 };

      mockCalculationRepo.findByUserId.mockResolvedValue([latestCalc]);
      mockDietPlanRepo.findCurrentByUserId.mockResolvedValue(null);

      const bodyZero = { goal: 'LoseWeight', targetWeightChange: 0 } as any;
      await expect(service.generateDietPlan(bodyZero, userId)).rejects.toThrow(InvalidTargetWeightChangeException);

      const bodyMissing = { goal: 'LoseWeight' } as any;
      await expect(service.generateDietPlan(bodyMissing, userId)).rejects.toThrow(InvalidTargetWeightChangeException);
    });

    it('should throw TargetWeightTooHighException when lose target >= currentWeight', async () => {
      const userId = new Types.ObjectId().toHexString();
      const calcId = new Types.ObjectId();
      // current weight 60, targetWeightChange 100 (invalid because >= current for lose)
      const latestCalc = { _id: calcId, tdee: 2000, weight: 60 };

      mockCalculationRepo.findByUserId.mockResolvedValue([latestCalc]);
      mockDietPlanRepo.findCurrentByUserId.mockResolvedValue(null);

      const body = { goal: 'LoseWeight', targetWeightChange: 100 } as any;

      await expect(service.generateDietPlan(body, userId)).rejects.toThrow(TargetWeightTooHighException);
    });

    it('should throw TargetWeightTooLowException when gain target <= currentWeight', async () => {
      const userId = new Types.ObjectId().toHexString();
      const calcId = new Types.ObjectId();
      // current weight 70, targetWeightChange 65 (invalid because <= current for gain)
      const latestCalc = { _id: calcId, tdee: 2000, weight: 70 };

      mockCalculationRepo.findByUserId.mockResolvedValue([latestCalc]);
      mockDietPlanRepo.findCurrentByUserId.mockResolvedValue(null);

      const body = { goal: 'GainWeight', targetWeightChange: 65 } as any;

      await expect(service.generateDietPlan(body, userId)).rejects.toThrow(TargetWeightTooLowException);
    });

    it('should throw TargetWeightExcess when requested change is >30% of current weight', async () => {
      const userId = new Types.ObjectId().toHexString();
      const calcId = new Types.ObjectId();
      // current weight 50, requesting 30 -> change 20 which is 40% >30%
      const latestCalc = { _id: calcId, tdee: 2000, weight: 50 };

      mockCalculationRepo.findByUserId.mockResolvedValue([latestCalc]);
      mockDietPlanRepo.findCurrentByUserId.mockResolvedValue(null);

      const body = { goal: 'LoseWeight', targetWeightChange: 30 } as any;
      await expect(service.generateDietPlan(body, userId)).rejects.toThrow(TargetWeightExcess);
    });

    it('should use the latest calculation based on timestamp', async () => {
      const userId = new Types.ObjectId().toHexString();
      
      // Create mock calculations with controlled timestamps
      const olderDate = new Date('2023-01-01T00:00:00Z');
      const newerDate = new Date('2024-01-01T00:00:00Z');

      const calc1 = { 
        _id: {
          getTimestamp: () => olderDate
        }, 
        tdee: 2000, 
        weight: 70
      };
      const calc2 = { 
        _id: {
          getTimestamp: () => newerDate
        }, 
        tdee: 2100, 
        weight: 71
      };

      // Test with calculations in different orders
      mockCalculationRepo.findByUserId.mockResolvedValue([calc1, calc2]);
      mockDietPlanRepo.findCurrentByUserId.mockResolvedValue(null);
      mockDietPlanRepo.create.mockResolvedValue({ id: 'created' });

      await service.generateDietPlan({ goal: 'MaintainWeight' } as any, userId);

      // Should use calc2 as it's the latest
      expect(mockDietPlanRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          dailyCalories: 2100,
          referenceTDEE: 2100
        })
      );

      // Test with reversed order
      mockCalculationRepo.findByUserId.mockResolvedValue([calc2, calc1]);
      await service.generateDietPlan({ goal: 'MaintainWeight' } as any, userId);

      // Should still use calc2's values regardless of array order
      expect(mockDietPlanRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          dailyCalories: 2100,
          referenceTDEE: 2100
        })
      );
    });
  });

  describe('updateDietPlan', () => {
    it('should throw UnauthorizedException when userId missing', async () => {
      await expect(service.updateDietPlan({} as any, '')).rejects.toThrow(UnauthorizedException);
    });

    it('should throw NotFoundDietPlanException when no existing plan', async () => {
      const userId = new Types.ObjectId().toHexString();
      mockDietPlanRepo.findCurrentByUserId.mockResolvedValue(null);

      await expect(service.updateDietPlan({ goal: 'MaintainWeight' } as any, userId)).rejects.toThrow(
        NotFoundDietPlanException,
      );
    });

    it('should throw NotFoundUserCalculationException when no calculations', async () => {
      const userId = new Types.ObjectId().toHexString();
      const existingPlan = { _id: new Types.ObjectId(), goal: 'LoseWeight' };
      mockDietPlanRepo.findCurrentByUserId.mockResolvedValue(existingPlan);
      mockCalculationRepo.findByUserId.mockResolvedValue([]);

      await expect(service.updateDietPlan({ goal: 'LoseWeight' } as any, userId)).rejects.toThrow(
        NotFoundUserCalculationException,
      );
    });

    it('should update plan correctly when valid data provided', async () => {
      const userId = new Types.ObjectId().toHexString();
      const calcId = new Types.ObjectId();
      const latestCalc = { _id: calcId, tdee: 1800, weight: 70 };
      const existingPlan = { _id: new Types.ObjectId(), goal: 'MaintainWeight' };

      mockDietPlanRepo.findCurrentByUserId.mockResolvedValue(existingPlan);
      mockCalculationRepo.findByUserId.mockResolvedValue([latestCalc]);
      mockDietPlanRepo.update.mockResolvedValue({ id: 'updated-2' });

      const body = { goal: 'LoseWeight', targetWeightChange: 65 } as any; // targetWeightChange is target weight (kg)

      const result = await service.updateDietPlan(body, userId);

      expect(result).toEqual({ id: 'updated-2' });
      expect(mockDietPlanRepo.update).toHaveBeenCalledWith(existingPlan._id, expect.objectContaining({
        goal: 'LoseWeight',
        referenceTDEE: 1800,
      }));
    });
  });

  describe('getCurrentDietPlan', () => {
    it('should throw UnauthorizedException when no userId', async () => {
      await expect(service.getCurrentDietPlan('')).rejects.toThrow(UnauthorizedException);
    });

    it('should throw NotFoundDietPlanException when repo returns null', async () => {
      const userId = new Types.ObjectId().toHexString();
      mockDietPlanRepo.findCurrentByUserId.mockResolvedValue(null);

      await expect(service.getCurrentDietPlan(userId)).rejects.toThrow(NotFoundDietPlanException);
    });

    it('should return plan when found', async () => {
      const userId = new Types.ObjectId().toHexString();
      const plan = { id: 'plan-current' };
      mockDietPlanRepo.findCurrentByUserId.mockResolvedValue(plan);

      const result = await service.getCurrentDietPlan(userId);
      expect(result).toEqual(plan);
    });
  });

  describe('getDietPlanByDate', () => {
    it('should throw UnauthorizedException when no userId', async () => {
      await expect(service.getDietPlanByDate('', '2025-10-03')).rejects.toThrow(UnauthorizedException);
    });

    it('should throw NotFoundDietPlanException when no plan found for date', async () => {
      const userId = new Types.ObjectId().toHexString();
      mockDietPlanRepo.findByDate.mockResolvedValue(null);

      await expect(service.getDietPlanByDate(userId, '2025-10-03')).rejects.toThrow(NotFoundDietPlanException);
    });

    it('should return plan for given date', async () => {
      const userId = new Types.ObjectId().toHexString();
      const plan = { id: 'plan-by-date' };
      mockDietPlanRepo.findByDate.mockResolvedValue(plan);

      const result = await service.getDietPlanByDate(userId, '2025-10-03');
      expect(result).toEqual(plan);
      expect(mockDietPlanRepo.findByDate).toHaveBeenCalled();
    });
  });
});

