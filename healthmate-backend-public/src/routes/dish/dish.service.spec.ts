import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { DishService } from './dish.service';
import { DishRepo } from './dish.repo';
import { DishDocument } from './schema/dish.schema';
import { IngredientDocument } from '../ingredient/schema/ingredient.schema';
import { DishNotFoundError, DishForbiddenError } from './dish.error';
import { Rolename } from '../../shared/constants/role.constant';
import {
  SAMPLE_USER_IDS,
  ADMIN_USER_ID,
  SAMPLE_DISHES,
  SAMPLE_INGREDIENTS,
  createMockPaginatedResult,
  createMockDishData,
  createMockDishUpdateData,
} from './mock-data';

describe('DishService', () => {
  let service: DishService;
  let dishRepo: DishRepo;
  let ingredientModel: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DishService,
        {
          provide: DishRepo,
          useValue: {
            findAllPaginated: jest.fn(),
            findById: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
          },
        },
        {
          provide: getModelToken('Ingredient'),
          useValue: {
            findById: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<DishService>(DishService);
    dishRepo = module.get<DishRepo>(DishRepo);
    ingredientModel = module.get(getModelToken('Ingredient'));

    // Mock Types.ObjectId.isValid to return true by default
    (Types.ObjectId.isValid as jest.Mock).mockReturnValue(true);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateObjectId', () => {
    it('should throw DishNotFoundError for invalid ObjectId', () => {
      (Types.ObjectId.isValid as jest.Mock).mockReturnValueOnce(false);
      
      expect(() => {
        (service as any).validateObjectId('invalid-id');
      }).toThrow(DishNotFoundError);
    });

    it('should not throw for valid ObjectId', () => {
      (Types.ObjectId.isValid as jest.Mock).mockReturnValueOnce(true);
      
      expect(() => {
        (service as any).validateObjectId('507f1f77bcf86cd799439011');
      }).not.toThrow();
    });
  });

  describe('calculateNutritionalValues', () => {
    it('should calculate nutritional values for populated ingredients', async () => {
      const ingredients = [
        {
          ingredient: SAMPLE_INGREDIENTS.CHICKEN,
          amount: 100,
          deprecated: false,
        },
        {
          ingredient: SAMPLE_INGREDIENTS.RICE,
          amount: 200,
          deprecated: false,
        },
      ];

      const result = await (service as any).calculateNutritionalValues(ingredients);

      expect(result).toEqual({
        totalCalories: 425, // 165 + 260
        totalCarbs: 56, // 0 + 56
        totalProtein: 36.4, // 31 + 5.4
        totalFat: 4.2, // 3.6 + 0.6
        totalFiber: 0.8, // 0 + 0.8
        totalSugar: 0.2, // 0 + 0.2
      });
    });

    it('should skip deprecated ingredients', async () => {
      const ingredients = [
        {
          ingredient: SAMPLE_INGREDIENTS.CHICKEN,
          amount: 100,
          deprecated: true,
        },
        {
          ingredient: SAMPLE_INGREDIENTS.RICE,
          amount: 200,
          deprecated: false,
        },
      ];

      const result = await (service as any).calculateNutritionalValues(ingredients);

      expect(result).toEqual({
        totalCalories: 260, // Only rice
        totalCarbs: 56,
        totalProtein: 5.4,
        totalFat: 0.6,
        totalFiber: 0.8,
        totalSugar: 0.2,
      });
    });

    it('should fetch ingredient data when not populated', async () => {
      const ingredients = [
        {
          ingredient: SAMPLE_INGREDIENTS.CHICKEN._id,
          amount: 100,
          deprecated: false,
        },
      ];

      ingredientModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(SAMPLE_INGREDIENTS.CHICKEN),
      });

      const result = await (service as any).calculateNutritionalValues(ingredients);

      expect(ingredientModel.findById).toHaveBeenCalledWith(SAMPLE_INGREDIENTS.CHICKEN._id);
      expect(result).toEqual({
        totalCalories: 165,
        totalCarbs: 0,
        totalProtein: 31,
        totalFat: 3.6,
        totalFiber: 0,
        totalSugar: 0,
      });
    });

    it('should skip ingredients that cannot be found', async () => {
      const ingredients = [
        {
          ingredient: new Types.ObjectId(),
          amount: 100,
          deprecated: false,
        },
      ];

      ingredientModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      const result = await (service as any).calculateNutritionalValues(ingredients);

      expect(result).toEqual({
        totalCalories: 0,
        totalCarbs: 0,
        totalProtein: 0,
        totalFat: 0,
        totalFiber: 0,
        totalSugar: 0,
      });
    });
  });

  describe('findAllPaginate', () => {
    it('should return paginated dishes for admin', async () => {
      const mockResult = createMockPaginatedResult([SAMPLE_DISHES.CHICKEN_RICE]);
      jest.spyOn(dishRepo, 'findAllPaginated').mockResolvedValue(mockResult as any);

      const result = await service.findAllPaginate(
        { page: 1, limit: 10 },
        ADMIN_USER_ID,
        Rolename.Admin
      );

      expect(dishRepo.findAllPaginated).toHaveBeenCalledWith(1, 10, {
        $or: [{ belongsTo: null }, { belongsTo: { $exists: false } }],
      });
      expect(result).toEqual(mockResult);
    });

    it('should return paginated dishes for customer', async () => {
      const mockResult = createMockPaginatedResult([SAMPLE_DISHES.CUSTOM_DISH]);
      jest.spyOn(dishRepo, 'findAllPaginated').mockResolvedValue(mockResult as any);

      const result = await service.findAllPaginate(
        { page: 1, limit: 10 },
        SAMPLE_USER_IDS[0],
        Rolename.Customer
      );

      expect(dishRepo.findAllPaginated).toHaveBeenCalledWith(1, 10, {
        $or: [
          { belongsTo: null },
          { belongsTo: { $exists: false } },
          { belongsTo: SAMPLE_USER_IDS[0] },
        ],
      });
      expect(result).toEqual(mockResult);
    });

    it('should apply type filter', async () => {
      const mockResult = createMockPaginatedResult([SAMPLE_DISHES.CHICKEN_RICE]);
      jest.spyOn(dishRepo, 'findAllPaginated').mockResolvedValue(mockResult as any);

      const result = await service.findAllPaginate(
        { page: 1, limit: 10, type: 'main' },
        ADMIN_USER_ID,
        Rolename.Admin
      );

      expect(dishRepo.findAllPaginated).toHaveBeenCalledWith(1, 10, {
        type: 'main',
        $or: [{ belongsTo: null }, { belongsTo: { $exists: false } }],
      });
      expect(result).toEqual(mockResult);
    });

    it('should throw DishNotFoundError when no dishes found', async () => {
      const mockResult = createMockPaginatedResult([], 0);
      jest.spyOn(dishRepo, 'findAllPaginated').mockResolvedValue(mockResult as any);

      await expect(
        service.findAllPaginate({ page: 1, limit: 10 }, ADMIN_USER_ID, Rolename.Admin),
      ).rejects.toThrow(DishNotFoundError);
    });

    it('should handle unexpected errors and throw generic error', async () => {
      jest.spyOn(dishRepo, 'findAllPaginated').mockRejectedValue(new Error('Database error'));

      await expect(
        service.findAllPaginate({ page: 1, limit: 10 }, ADMIN_USER_ID, Rolename.Admin),
      ).rejects.toThrow('Failed to fetch dishes');
    });

    it('should re-throw DishNotFoundError when caught', async () => {
      jest.spyOn(dishRepo, 'findAllPaginated').mockRejectedValue(new DishNotFoundError('Test error'));

      await expect(
        service.findAllPaginate({ page: 1, limit: 10 }, ADMIN_USER_ID, Rolename.Admin),
      ).rejects.toThrow(DishNotFoundError);
    });
  });

  describe('create', () => {
    it('should create public dish for admin', async () => {
      const mockDishData = createMockDishData();
      const mockDish = { ...SAMPLE_DISHES.ADMIN_DISH, ...mockDishData };

      jest.spyOn(service as any, 'calculateNutritionalValues').mockResolvedValue({
        totalCalories: 165,
        totalCarbs: 0,
        totalProtein: 31,
        totalFat: 3.6,
        totalFiber: 0,
        totalSugar: 0,
      });
      jest.spyOn(dishRepo, 'create').mockResolvedValue(mockDish as DishDocument);

      const result = await service.create(mockDishData, ADMIN_USER_ID, Rolename.Admin);

      expect(dishRepo.create).toHaveBeenCalledWith({
        ...mockDishData,
        belongsTo: undefined,
        totalCalories: 165,
        totalCarbs: 0,
        totalProtein: 31,
        totalFat: 3.6,
        totalFiber: 0,
        totalSugar: 0,
      });
      expect(result).toEqual(mockDish);
    });

    it('should create private dish for customer', async () => {
      const mockDishData = createMockDishData();
      const mockDish = { ...SAMPLE_DISHES.CUSTOM_DISH, ...mockDishData };

      jest.spyOn(service as any, 'calculateNutritionalValues').mockResolvedValue({
        totalCalories: 165,
        totalCarbs: 0,
        totalProtein: 31,
        totalFat: 3.6,
        totalFiber: 0,
        totalSugar: 0,
      });
      jest.spyOn(dishRepo, 'create').mockResolvedValue(mockDish as DishDocument);

      const result = await service.create(mockDishData, SAMPLE_USER_IDS[0], Rolename.Customer);

      expect(dishRepo.create).toHaveBeenCalledWith({
        ...mockDishData,
        belongsTo: SAMPLE_USER_IDS[0],
        totalCalories: 165,
        totalCarbs: 0,
        totalProtein: 31,
        totalFat: 3.6,
        totalFiber: 0,
        totalSugar: 0,
      });
      expect(result).toEqual(mockDish);
    });

    it('should handle errors and throw generic error', async () => {
      const mockDishData = createMockDishData();
      jest.spyOn(service as any, 'calculateNutritionalValues').mockRejectedValue(new Error('Calculation error'));

      await expect(
        service.create(mockDishData, SAMPLE_USER_IDS[0], Rolename.Customer),
      ).rejects.toThrow('Failed to create dish');
    });
  });

  describe('update', () => {
    it('should update dish for admin', async () => {
      const validId = '507f1f77bcf86cd799439033';
      const updateData = createMockDishUpdateData();
      const updatedDish = { ...SAMPLE_DISHES.ADMIN_DISH, ...updateData };

      jest.spyOn(dishRepo, 'findById').mockResolvedValue(SAMPLE_DISHES.ADMIN_DISH as DishDocument);
      jest.spyOn(dishRepo, 'update').mockResolvedValue(updatedDish as DishDocument);

      const result = await service.update(validId, updateData, ADMIN_USER_ID, Rolename.Admin);

      expect(dishRepo.findById).toHaveBeenCalledWith(expect.any(Object));
      expect(dishRepo.update).toHaveBeenCalledWith(expect.any(Object), updateData);
      expect(result).toEqual(updatedDish);
    });

    it('should update dish for customer with ingredients recalculation', async () => {
      const validId = '507f1f77bcf86cd799439032';
      const updateData = createMockDishUpdateData({
        ingredients: [
          {
            ingredient: SAMPLE_INGREDIENTS.CHICKEN._id,
            amount: 200,
          },
        ],
      });
      const updatedDish = { ...SAMPLE_DISHES.CUSTOM_DISH, ...updateData };

      jest.spyOn(dishRepo, 'findById').mockResolvedValue(SAMPLE_DISHES.CUSTOM_DISH as DishDocument);
      jest.spyOn(service as any, 'calculateNutritionalValues').mockResolvedValue({
        totalCalories: 330,
        totalCarbs: 0,
        totalProtein: 62,
        totalFat: 7.2,
        totalFiber: 0,
        totalSugar: 0,
      });
      jest.spyOn(dishRepo, 'update').mockResolvedValue(updatedDish as DishDocument);

      const result = await service.update(validId, updateData, SAMPLE_USER_IDS[0], Rolename.Customer);

      expect(service.calculateNutritionalValues).toHaveBeenCalledWith(updateData.ingredients);
      expect(dishRepo.update).toHaveBeenCalledWith(expect.any(Object), {
        ...updateData,
        totalCalories: 330,
        totalCarbs: 0,
        totalProtein: 62,
        totalFat: 7.2,
        totalFiber: 0,
        totalSugar: 0,
      });
      expect(result).toEqual(updatedDish);
    });

    it('should throw DishNotFoundError when dish not found', async () => {
      const validId = '507f1f77bcf86cd799439011';
      jest.spyOn(dishRepo, 'findById').mockResolvedValue(null);

      await expect(
        service.update(validId, createMockDishUpdateData(), SAMPLE_USER_IDS[0], Rolename.Customer),
      ).rejects.toThrow(DishNotFoundError);
    });

    it('should throw DishForbiddenError when customer tries to update public dish', async () => {
      const validId = '507f1f77bcf86cd799439031';
      jest.spyOn(dishRepo, 'findById').mockResolvedValue(SAMPLE_DISHES.CHICKEN_RICE as DishDocument);

      await expect(
        service.update(validId, createMockDishUpdateData(), SAMPLE_USER_IDS[0], Rolename.Customer),
      ).rejects.toThrow(DishForbiddenError);
    });

    it('should throw DishForbiddenError when customer tries to update others dish', async () => {
      const validId = '507f1f77bcf86cd799439032';
      const otherUserDish = { ...SAMPLE_DISHES.CUSTOM_DISH, belongsTo: SAMPLE_USER_IDS[1] };
      jest.spyOn(dishRepo, 'findById').mockResolvedValue(otherUserDish as DishDocument);

      await expect(
        service.update(validId, createMockDishUpdateData(), SAMPLE_USER_IDS[0], Rolename.Customer),
      ).rejects.toThrow(DishForbiddenError);
    });

    it('should throw DishForbiddenError when admin tries to update customer dish', async () => {
      const validId = '507f1f77bcf86cd799439032';
      jest.spyOn(dishRepo, 'findById').mockResolvedValue(SAMPLE_DISHES.CUSTOM_DISH as DishDocument);

      await expect(
        service.update(validId, createMockDishUpdateData(), ADMIN_USER_ID, Rolename.Admin),
      ).rejects.toThrow(DishForbiddenError);
    });

    it('should handle errors and throw generic error', async () => {
      const validId = '507f1f77bcf86cd799439033';
      jest.spyOn(dishRepo, 'findById').mockRejectedValue(new Error('Database error'));

      await expect(
        service.update(validId, createMockDishUpdateData(), ADMIN_USER_ID, Rolename.Admin),
      ).rejects.toThrow('Failed to update dish');
    });
  });

  describe('delete', () => {
    it('should delete dish for admin', async () => {
      const validId = '507f1f77bcf86cd799439033';
      jest.spyOn(dishRepo, 'findById').mockResolvedValue(SAMPLE_DISHES.ADMIN_DISH as DishDocument);
      jest.spyOn(dishRepo, 'delete').mockResolvedValue(undefined);

      const result = await service.delete(validId, ADMIN_USER_ID, Rolename.Admin);

      expect(dishRepo.findById).toHaveBeenCalledWith(expect.any(Object));
      expect(dishRepo.delete).toHaveBeenCalledWith(expect.any(Object));
      expect(result).toBeUndefined();
    });

    it('should delete dish for customer', async () => {
      const validId = '507f1f77bcf86cd799439032';
      jest.spyOn(dishRepo, 'findById').mockResolvedValue(SAMPLE_DISHES.CUSTOM_DISH as DishDocument);
      jest.spyOn(dishRepo, 'delete').mockResolvedValue(undefined);

      const result = await service.delete(validId, SAMPLE_USER_IDS[0], Rolename.Customer);

      expect(dishRepo.findById).toHaveBeenCalledWith(expect.any(Object));
      expect(dishRepo.delete).toHaveBeenCalledWith(expect.any(Object));
      expect(result).toBeUndefined();
    });

    it('should throw DishNotFoundError when dish not found', async () => {
      const validId = '507f1f77bcf86cd799439011';
      jest.spyOn(dishRepo, 'findById').mockResolvedValue(null);

      await expect(
        service.delete(validId, SAMPLE_USER_IDS[0], Rolename.Customer),
      ).rejects.toThrow(DishNotFoundError);
    });

    it('should throw DishForbiddenError when customer tries to delete public dish', async () => {
      const validId = '507f1f77bcf86cd799439031';
      jest.spyOn(dishRepo, 'findById').mockResolvedValue(SAMPLE_DISHES.CHICKEN_RICE as DishDocument);

      await expect(
        service.delete(validId, SAMPLE_USER_IDS[0], Rolename.Customer),
      ).rejects.toThrow(DishForbiddenError);
    });

    it('should throw DishForbiddenError when customer tries to delete others dish', async () => {
      const validId = '507f1f77bcf86cd799439032';
      const otherUserDish = { ...SAMPLE_DISHES.CUSTOM_DISH, belongsTo: SAMPLE_USER_IDS[1] };
      jest.spyOn(dishRepo, 'findById').mockResolvedValue(otherUserDish as DishDocument);

      await expect(
        service.delete(validId, SAMPLE_USER_IDS[0], Rolename.Customer),
      ).rejects.toThrow(DishForbiddenError);
    });

    it('should throw DishForbiddenError when admin tries to delete customer dish', async () => {
      const validId = '507f1f77bcf86cd799439032';
      jest.spyOn(dishRepo, 'findById').mockResolvedValue(SAMPLE_DISHES.CUSTOM_DISH as DishDocument);

      await expect(
        service.delete(validId, ADMIN_USER_ID, Rolename.Admin),
      ).rejects.toThrow(DishForbiddenError);
    });

    it('should handle errors and throw generic error', async () => {
      const validId = '507f1f77bcf86cd799439033';
      jest.spyOn(dishRepo, 'findById').mockRejectedValue(new Error('Database error'));

      await expect(
        service.delete(validId, ADMIN_USER_ID, Rolename.Admin),
      ).rejects.toThrow('Failed to delete dish');
    });
  });

  describe('findById', () => {
    it('should return dish for admin', async () => {
      const validId = '507f1f77bcf86cd799439033';
      jest.spyOn(dishRepo, 'findById').mockResolvedValue(SAMPLE_DISHES.ADMIN_DISH as DishDocument);

      const result = await service.findById(validId, ADMIN_USER_ID, Rolename.Admin);

      expect(dishRepo.findById).toHaveBeenCalledWith(expect.any(Object));
      expect(result).toEqual(SAMPLE_DISHES.ADMIN_DISH);
    });

    it('should return dish for customer', async () => {
      const validId = '507f1f77bcf86cd799439032';
      jest.spyOn(dishRepo, 'findById').mockResolvedValue(SAMPLE_DISHES.CUSTOM_DISH as DishDocument);

      const result = await service.findById(validId, SAMPLE_USER_IDS[0], Rolename.Customer);

      expect(dishRepo.findById).toHaveBeenCalledWith(expect.any(Object));
      expect(result).toEqual(SAMPLE_DISHES.CUSTOM_DISH);
    });

    it('should throw DishNotFoundError when dish not found', async () => {
      const validId = '507f1f77bcf86cd799439011';
      jest.spyOn(dishRepo, 'findById').mockResolvedValue(null);

      await expect(
        service.findById(validId, SAMPLE_USER_IDS[0], Rolename.Customer),
      ).rejects.toThrow(DishNotFoundError);
    });

    it('should throw DishForbiddenError when customer tries to access others dish', async () => {
      const validId = '507f1f77bcf86cd799439032';
      const otherUserDish = { ...SAMPLE_DISHES.CUSTOM_DISH, belongsTo: SAMPLE_USER_IDS[1] };
      jest.spyOn(dishRepo, 'findById').mockResolvedValue(otherUserDish as DishDocument);

      await expect(
        service.findById(validId, SAMPLE_USER_IDS[0], Rolename.Customer),
      ).rejects.toThrow(DishForbiddenError);
    });

    it('should throw DishForbiddenError when admin tries to access customer dish', async () => {
      const validId = '507f1f77bcf86cd799439032';
      jest.spyOn(dishRepo, 'findById').mockResolvedValue(SAMPLE_DISHES.CUSTOM_DISH as DishDocument);

      await expect(
        service.findById(validId, ADMIN_USER_ID, Rolename.Admin),
      ).rejects.toThrow(DishForbiddenError);
    });

    it('should handle errors and throw generic error', async () => {
      const validId = '507f1f77bcf86cd799439033';
      jest.spyOn(dishRepo, 'findById').mockRejectedValue(new Error('Database error'));

      await expect(
        service.findById(validId, ADMIN_USER_ID, Rolename.Admin),
      ).rejects.toThrow('Failed to fetch dish');
    });
  });
});
