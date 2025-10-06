import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, UnauthorizedException } from '@nestjs/common';

import { DietPlanController } from '../dietplan.controller';
import { DietPlanService } from '../dietplan.service';
import {
  CreateDietPlanBodyDTO,
  UpdateDietPlanBodyDTO,
  GetDietPlanByDateQueryDTO,
} from '../dietplan.dto';
import {
  NotFoundDietPlanException,
  InvalidTargetWeightChangeException,
  NotFoundUserCalculationException,
} from '../dietplan.error';

describe('DietPlanController', () => {
  let controller: DietPlanController;
  let service: DietPlanService;

  const mockDietPlanService = {
    generateDietPlan: jest.fn(),
    updateDietPlan: jest.fn(),
    getCurrentDietPlan: jest.fn(),
    getDietPlanByDate: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DietPlanController],
      providers: [
        {
          provide: DietPlanService,
          useValue: mockDietPlanService,
        },
      ],
    }).compile();

    controller = module.get<DietPlanController>(DietPlanController);
    service = module.get<DietPlanService>(DietPlanService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('generateDietPlan', () => {
    it('should call service.generateDietPlan and return created plan for MaintainWeight', async () => {
      const userId = 'user-1';
      const body = ({ goal: 'MaintainWeight' } as unknown) as CreateDietPlanBodyDTO;
      const expected = { id: 'plan-1', goal: 'MaintainWeight' };

      mockDietPlanService.generateDietPlan.mockResolvedValue(expected);

      const result = await controller.generateDietPlan(body, userId);

      expect(result).toEqual(expected);
      expect(mockDietPlanService.generateDietPlan).toHaveBeenCalledWith(body, userId);
    });

    it('should call service.generateDietPlan and return created plan for LoseWeight', async () => {
      const userId = 'user-lose';
      const body = ({ goal: 'LoseWeight', targetWeightChange: 50 } as unknown) as CreateDietPlanBodyDTO;
      const expected = { id: 'plan-lose', goal: 'LoseWeight', targetWeightChange: 50 };

      mockDietPlanService.generateDietPlan.mockResolvedValue(expected);

      const result = await controller.generateDietPlan(body, userId);

      expect(result).toEqual(expected);
      expect(mockDietPlanService.generateDietPlan).toHaveBeenCalledWith(body, userId);
    });

    it('should call service.generateDietPlan and return created plan for GainWeight', async () => {
      const userId = 'user-gain';
      const body = ({ goal: 'GainWeight', targetWeightChange: 70 } as unknown) as CreateDietPlanBodyDTO;
      const expected = { id: 'plan-gain', goal: 'GainWeight', targetWeightChange: 70 };

      mockDietPlanService.generateDietPlan.mockResolvedValue(expected);

      const result = await controller.generateDietPlan(body, userId);

      expect(result).toEqual(expected);
      expect(mockDietPlanService.generateDietPlan).toHaveBeenCalledWith(body, userId);
    });

    it('should propagate unauthorized error when service rejects with UnauthorizedException', async () => {
      const userId = '';
      const body = ({ goal: 'MaintainWeight' } as unknown) as CreateDietPlanBodyDTO;

      mockDietPlanService.generateDietPlan.mockRejectedValue(new UnauthorizedException('Invalid token'));

      await expect(controller.generateDietPlan(body, userId)).rejects.toThrow(UnauthorizedException);
      expect(mockDietPlanService.generateDietPlan).toHaveBeenCalledWith(body, userId);
    });

    it('should propagate not found user calculation error from service', async () => {
      const userId = 'user-x';
      const body = ({ goal: 'LoseWeight', targetWeightChange: 50 } as unknown) as CreateDietPlanBodyDTO;

      mockDietPlanService.generateDietPlan.mockRejectedValue(new NotFoundUserCalculationException());

      await expect(controller.generateDietPlan(body, userId)).rejects.toThrow(NotFoundException);
      expect(mockDietPlanService.generateDietPlan).toHaveBeenCalledWith(body, userId);
    });
  });

  describe('updateDietPlan', () => {
    it('should update plan with both goal and targetWeightChange', async () => {
      const userId = 'user-2';
      const body = ({ goal: 'LoseWeight', targetWeightChange: 60 } as unknown) as UpdateDietPlanBodyDTO;
      const expected = { id: 'plan-2', goal: 'LoseWeight', targetWeightChange: 60 };

      mockDietPlanService.updateDietPlan.mockResolvedValue(expected);

      const result = await controller.updateDietPlan(body, userId);

      expect(result).toEqual(expected);
      expect(mockDietPlanService.updateDietPlan).toHaveBeenCalledWith(body, userId);
    });

    it('should update plan with only goal', async () => {
      const userId = 'user-3';
      const body = ({ goal: 'GainWeight' } as unknown) as UpdateDietPlanBodyDTO;
      const expected = { id: 'plan-3', goal: 'GainWeight' };

      mockDietPlanService.updateDietPlan.mockResolvedValue(expected);

      const result = await controller.updateDietPlan(body, userId);

      expect(result).toEqual(expected);
      expect(mockDietPlanService.updateDietPlan).toHaveBeenCalledWith(body, userId);
    });

    it('should update plan with only targetWeightChange', async () => {
      const userId = 'user-4';
      const body = ({ targetWeightChange: 65 } as unknown) as UpdateDietPlanBodyDTO;
      const expected = { id: 'plan-4', targetWeightChange: 65 };

      mockDietPlanService.updateDietPlan.mockResolvedValue(expected);

      const result = await controller.updateDietPlan(body, userId);

      expect(result).toEqual(expected);
      expect(mockDietPlanService.updateDietPlan).toHaveBeenCalledWith(body, userId);
    });

    it('should propagate not found diet plan error from service', async () => {
      const userId = 'user-notfound';
      const body = ({ goal: 'LoseWeight', targetWeightChange: 55 } as unknown) as UpdateDietPlanBodyDTO;

      mockDietPlanService.updateDietPlan.mockRejectedValue(new NotFoundDietPlanException());

      await expect(controller.updateDietPlan(body, userId)).rejects.toThrow(NotFoundException);
      expect(mockDietPlanService.updateDietPlan).toHaveBeenCalledWith(body, userId);
    });

    it('should propagate invalid target weight change error from service', async () => {
      const userId = 'user-invalid';
      const body = ({ goal: 'LoseWeight', targetWeightChange: 1000 } as unknown) as UpdateDietPlanBodyDTO;

      mockDietPlanService.updateDietPlan.mockRejectedValue(new InvalidTargetWeightChangeException());

      await expect(controller.updateDietPlan(body, userId)).rejects.toThrow();
      expect(mockDietPlanService.updateDietPlan).toHaveBeenCalledWith(body, userId);
    });
  });

  describe('getCurrentDietPlan', () => {
    it('should return current diet plan for user', async () => {
      const userId = 'user-3';
      const expected = { id: 'plan-3' };

      mockDietPlanService.getCurrentDietPlan.mockResolvedValue(expected);

      const result = await controller.getCurrentDietPlan(userId);

      expect(result).toEqual(expected);
      expect(mockDietPlanService.getCurrentDietPlan).toHaveBeenCalledWith(userId);
    });

    it('should propagate not found error from service', async () => {
      const userId = 'user-4';
      mockDietPlanService.getCurrentDietPlan.mockRejectedValue(new NotFoundDietPlanException());

      await expect(controller.getCurrentDietPlan(userId)).rejects.toThrow(NotFoundException);
      expect(mockDietPlanService.getCurrentDietPlan).toHaveBeenCalledWith(userId);
    });
  });

  describe('getDietPlanByDate', () => {
    it('should call service.getDietPlanByDate with userId and date from query', async () => {
      const userId = 'user-5';
      const query = ({ date: '2025-10-03' } as unknown) as GetDietPlanByDateQueryDTO;
      const expected = { id: 'plan-4', date: query.date };

      mockDietPlanService.getDietPlanByDate.mockResolvedValue(expected);

      const result = await controller.getDietPlanByDate(userId, query);

      expect(result).toEqual(expected);
      expect(mockDietPlanService.getDietPlanByDate).toHaveBeenCalledWith(userId, query.date);
    });

    it('should propagate unauthorized error from service', async () => {
      const userId = '';
      const query = ({ date: '2025-10-03' } as unknown) as GetDietPlanByDateQueryDTO;

      mockDietPlanService.getDietPlanByDate.mockRejectedValue(new UnauthorizedException('Invalid token'));

      await expect(controller.getDietPlanByDate(userId, query)).rejects.toThrow(UnauthorizedException);
      expect(mockDietPlanService.getDietPlanByDate).toHaveBeenCalledWith(userId, query.date);
    });
  });
});
