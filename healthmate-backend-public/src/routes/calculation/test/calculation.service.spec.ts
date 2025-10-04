import { Test, TestingModule } from '@nestjs/testing';
import { CalculationService } from './../calculation.service';
import { CalculationRepo } from './../calculation.repo';
import { NutrientsCalculatorService } from 'src/shared/services/nutrients-calculator.service';
import { Types } from 'mongoose';
import { CalculationCreateType } from './../schema/request/calculation.request.schema';
import { SharedUserRepository } from 'src/shared/repositories/shared-user.repo';

// MOCK
const mockCalculationRepo = {
  create: jest.fn(),
  findTodayRecord: jest.fn(),
  findbyId: jest.fn(),
  findByUserId: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

const mockNutrientCalculatorService = {
  calculateNutrients: jest.fn(),
};

const mockSharedUserRepository = {
  getUserAge: jest.fn(),
  findUnique: jest.fn(),
};

describe('CalculationService', () => {
  let service: CalculationService;
  let userId: Types.ObjectId;

  const sampleCalculationData: CalculationCreateType = {
    age: 25,
    gender: 'Male' as any,
    height: 170,
    weight: 70,
    activityLevel: 'Light' as any,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CalculationService,
        { provide: CalculationRepo, useValue: mockCalculationRepo },
        {
          provide: NutrientsCalculatorService,
          useValue: mockNutrientCalculatorService,
        },
        { provide: SharedUserRepository, useValue: mockSharedUserRepository },
      ],
    }).compile();

    service = module.get<CalculationService>(CalculationService);
    userId = new Types.ObjectId();

    jest.clearAllMocks();
  });

  // TEST

  describe('createCalculation', () => {
    it('should create a new calculation when no record exists today', async () => {
      // Arrange
      mockCalculationRepo.findTodayRecord.mockResolvedValue(null);
      mockNutrientCalculatorService.calculateNutrients.mockReturnValue({
        bmr: 1600,
        tdee: 2000,
        bmi: 24,
        waterNeeded: 2000,
        protein: 100,
        fat: 70,
        carbs: 250,
        fiber: 30,
      });
      mockCalculationRepo.create.mockResolvedValue({
        _id: '1',
        ...sampleCalculationData,
      });

      // Act
      const result = await service.createCalculation({
        data: sampleCalculationData,
        userId,
      });

      // Assert
      expect(mockCalculationRepo.findTodayRecord).toHaveBeenCalledWith(userId);
      expect(mockCalculationRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          userId,
          weight: 70,
          height: 170,
        }),
      );
      expect(result).toHaveProperty('_id');
    });

    it('should update today record if it exists', async () => {
      const existing = { _id: new Types.ObjectId(), ...sampleCalculationData };

      mockCalculationRepo.findTodayRecord.mockResolvedValue(existing);
      mockNutrientCalculatorService.calculateNutrients.mockReturnValue({
        bmr: 1600,
        tdee: 2000,
        bmi: 24,
        waterNeeded: 2000,
        protein: 100,
        fat: 70,
        carbs: 250,
        fiber: 30,
      });
      mockCalculationRepo.update.mockResolvedValue({ ...existing, weight: 71 });

      const result = await service.createCalculation({
        data: sampleCalculationData,
        userId,
      });

      expect(mockCalculationRepo.update).toHaveBeenCalledWith(
        existing._id,
        expect.objectContaining({ weight: 70 }),
      );
      expect(result).toHaveProperty('weight', 71);
    });
  });

  describe('calculate', () => {
    it('should return a calculation object using nutrientCalculatorService', () => {
      mockNutrientCalculatorService.calculateNutrients.mockReturnValue({
        bmr: 1600,
        tdee: 2000,
        bmi: 24,
        waterNeeded: 2000,
        protein: 100,
        fat: 70,
        carbs: 250,
        fiber: 30,
      });

      const result = service.calculate({ data: sampleCalculationData, userId });

      expect(
        mockNutrientCalculatorService.calculateNutrients,
      ).toHaveBeenCalledWith({
        age: 25,
        gender: 'Male',
        height: 170,
        weight: 70,
        activityLevel: 'Light',
      });

      expect(result).toHaveProperty('bmr', 1600);
      expect(result).toHaveProperty('userId', userId);
    });
  });

  describe('findById', () => {
    it('should call repo.findbyId with ObjectId', async () => {
      const id = new Types.ObjectId().toString();
      mockCalculationRepo.findbyId.mockResolvedValue({ _id: id });

      const result = await service.findById(id);

      expect(mockCalculationRepo.findbyId).toHaveBeenCalled();
      expect(result).toHaveProperty('_id', id);
    });
  });

  describe('findByUserId', () => {
    it('should call repo.findByUserId', async () => {
      mockCalculationRepo.findByUserId.mockResolvedValue([{ _id: '1' }]);

      const result = await service.findByUserId(userId);

      expect(mockCalculationRepo.findByUserId).toHaveBeenCalledWith(userId);
      expect(result).toEqual([{ _id: '1' }]);
    });
  });

  describe('update', () => {
    it('should call repo.update with ObjectId', async () => {
      const id = new Types.ObjectId().toString();
      const updateData = { weight: 75 };
      mockCalculationRepo.update.mockResolvedValue({ _id: id, ...updateData });

      const result = await service.update(id, updateData);

      expect(mockCalculationRepo.update).toHaveBeenCalled();
      expect(result).toHaveProperty('weight', 75);
    });
  });

  describe('delete', () => {
    it('should call repo.delete with ObjectId', async () => {
      const id = new Types.ObjectId().toString();
      mockCalculationRepo.delete.mockResolvedValue({ deletedCount: 1 });

      const result = await service.delete(id);

      expect(mockCalculationRepo.delete).toHaveBeenCalled();
      expect(result).toEqual({ deletedCount: 1 });
    });
  });
});
