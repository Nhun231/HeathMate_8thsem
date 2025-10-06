import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { IngredientService } from './ingredient.service';
import { IngredientRepo } from './ingredient.repo';
import { IngredientDocument } from './schema/ingredient.schema';
import { IngredientNotFoundError, IngredientForbiddenError } from './ingredient.error';
import { Rolename } from '../../shared/constants/role.constant';
import { Types } from 'mongoose';
import { 
  createMockIngredient, 
  createMockPaginatedResult, 
  SAMPLE_PUBLIC_INGREDIENTS, 
  SAMPLE_CUSTOM_INGREDIENTS,
  ADMIN_USER_ID,
  SAMPLE_USER_IDS,
  TEST_INGREDIENTS
} from './mock-data';

describe('IngredientService', () => {
  let service: IngredientService;
  let ingredientRepo: IngredientRepo;
  let dishModel: any;

  // Use consistent test data
  const mockIngredient = TEST_INGREDIENTS.CHICKEN_BREAST;
  const mockCustomIngredient = TEST_INGREDIENTS.CUSTOM_INGREDIENT;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        IngredientService,
        {
          provide: IngredientRepo,
          useValue: {
            create: jest.fn(),
            insertMany: jest.fn(),
            findById: jest.fn(),
            findAll: jest.fn(),
            findAllPaginated: jest.fn(),
            findByUserIdPaginated: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            deleteMany: jest.fn(),
            countDocuments: jest.fn(),
          },
        },
        {
          provide: getModelToken('Dish'),
          useValue: {
            find: jest.fn(),
            findById: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<IngredientService>(IngredientService);
    ingredientRepo = module.get<IngredientRepo>(IngredientRepo);
    dishModel = module.get(getModelToken('Dish'));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateObjectId', () => {
    it('should throw IngredientNotFoundError for invalid ObjectId', () => {
      // Mock Types.ObjectId.isValid to return false for invalid ID
      (Types.ObjectId.isValid as jest.Mock).mockReturnValueOnce(false);
      
      expect(() => {
        (service as any).validateObjectId('invalid-id');
      }).toThrow(IngredientNotFoundError);
    });

    it('should not throw for valid ObjectId', () => {
      // Mock Types.ObjectId.isValid to return true for valid ID
      (Types.ObjectId.isValid as jest.Mock).mockReturnValueOnce(true);
      
      expect(() => {
        (service as any).validateObjectId('507f1f77bcf86cd799439011');
      }).not.toThrow();
    });
  });

  describe('findAllPaginate', () => {
    it('should return paginated ingredients for admin', async () => {
      const mockResult = {
        items: [mockIngredient],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      };

      jest.spyOn(ingredientRepo, 'findAllPaginated').mockResolvedValue(mockResult as any);

      const result = await service.findAllPaginate(
        { page: 1, limit: 10, type: 'meat', search: 'chicken' },
        ADMIN_USER_ID,
        Rolename.Admin,
      );

      expect(ingredientRepo.findAllPaginated).toHaveBeenCalledWith(
        1,
        10,
        expect.objectContaining({
          type: 'meat',
          $or: [{ belongsTo: null }, { belongsTo: { $exists: false } }],
        }),
        'chicken',
      );
      expect(result).toEqual(mockResult);
    });

    it('should return paginated ingredients for customer', async () => {
      const mockResult = {
        items: [mockIngredient, mockCustomIngredient],
        total: 2,
        page: 1,
        limit: 10,
        totalPages: 1,
      };

      jest.spyOn(ingredientRepo, 'findAllPaginated').mockResolvedValue(mockResult as any);

      const result = await service.findAllPaginate(
        { page: 1, limit: 10, type: 'meat', search: 'chicken' },
        SAMPLE_USER_IDS[0],
        Rolename.Customer,
      );

      expect(ingredientRepo.findAllPaginated).toHaveBeenCalledWith(
        1,
        10,
        expect.objectContaining({
          type: 'meat',
          $or: [
            { belongsTo: null },
            { belongsTo: { $exists: false } },
            { belongsTo: SAMPLE_USER_IDS[0] },
          ],
        }),
        'chicken',
      );
      expect(result).toEqual(mockResult);
    });

    it('should throw IngredientNotFoundError when no ingredients found', async () => {
      jest.spyOn(ingredientRepo, 'findAllPaginated').mockResolvedValue({
        items: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
      });

      await expect(
        service.findAllPaginate({ page: 1, limit: 10 }, ADMIN_USER_ID, Rolename.Admin),
      ).rejects.toThrow(IngredientNotFoundError);
    });

    it('should handle unexpected errors and throw generic error', async () => {
      jest.spyOn(ingredientRepo, 'findAllPaginated').mockRejectedValue(new Error('Database error'));

      await expect(
        service.findAllPaginate({ page: 1, limit: 10 }, ADMIN_USER_ID, Rolename.Admin),
      ).rejects.toThrow('Failed to fetch ingredients');
    });

    it('should re-throw IngredientNotFoundError when caught', async () => {
      jest.spyOn(ingredientRepo, 'findAllPaginated').mockRejectedValue(new IngredientNotFoundError('No ingredients found'));

      await expect(
        service.findAllPaginate({ page: 1, limit: 10 }, ADMIN_USER_ID, Rolename.Admin),
      ).rejects.toThrow(IngredientNotFoundError);
    });
  });

  describe('findUserCustomIngredients', () => {
    it('should return user custom ingredients', async () => {
      const mockResult = {
        items: [mockCustomIngredient],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      };

      jest.spyOn(ingredientRepo, 'findByUserIdPaginated').mockResolvedValue(mockResult as any);

      const result = await service.findUserCustomIngredients(
        { page: 1, limit: 10, search: 'custom' },
        SAMPLE_USER_IDS[0]
      );

      expect(ingredientRepo.findByUserIdPaginated).toHaveBeenCalledWith(
        SAMPLE_USER_IDS[0],
        1,
        10,
        {},
        'custom',
      );
      expect(result).toEqual(mockResult);
    });

    it('should return empty result when no custom ingredients found', async () => {
      jest.spyOn(ingredientRepo, 'findByUserIdPaginated').mockResolvedValue({
        items: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
      });

      const result = await service.findUserCustomIngredients(
        { page: 1, limit: 10 },
        SAMPLE_USER_IDS[0]
      );

      expect(result).toEqual({
        items: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
      });
    });

    it('should handle errors and throw generic error', async () => {
      jest.spyOn(ingredientRepo, 'findByUserIdPaginated').mockRejectedValue(new Error('Database error'));

      await expect(
        service.findUserCustomIngredients({ page: 1, limit: 10 }, SAMPLE_USER_IDS[0]),
      ).rejects.toThrow('Failed to fetch custom ingredients');
    });
  });

  describe('create', () => {
    it('should create public ingredient for admin with isPublic flag', async () => {
      const mockCreateData = {
        name: 'New Ingredient',
        type: 'vegetable',
        caloPer100g: 50,
        carbsPer100g: 5,
        proteinPer100g: 10,
        fatPer100g: 2,
        fiberPer100g: 3,
        sugarPer100g: 2,
        isPublic: true,
      };

      jest.spyOn(ingredientRepo, 'create').mockResolvedValue(mockIngredient as IngredientDocument);

      const result = await service.create(mockCreateData, ADMIN_USER_ID, Rolename.Admin);

      expect(ingredientRepo.create).toHaveBeenCalledWith({
        name: 'New Ingredient',
        type: 'vegetable',
        caloPer100g: 50,
        carbsPer100g: 5,
        proteinPer100g: 10,
        fatPer100g: 2,
        fiberPer100g: 3,
        sugarPer100g: 2,
        belongsTo: null,
      });
      expect(result).toEqual(mockIngredient);
    });

    it('should create custom ingredient for customer', async () => {
      const mockCreateData = {
        name: 'New Ingredient',
        type: 'vegetable',
        caloPer100g: 50,
        carbsPer100g: 5,
        proteinPer100g: 10,
        fatPer100g: 2,
        fiberPer100g: 3,
        sugarPer100g: 2,
      };

      jest.spyOn(ingredientRepo, 'create').mockResolvedValue(mockCustomIngredient as IngredientDocument);

      const result = await service.create(mockCreateData, SAMPLE_USER_IDS[0], Rolename.Customer);

      expect(ingredientRepo.create).toHaveBeenCalledWith({
        ...mockCreateData,
        belongsTo: expect.any(Object), // ObjectId comparison
      });
      expect(result).toEqual(mockCustomIngredient);
    });

    it('should throw error when userId is null', async () => {
      const mockCreateData = {
        name: 'New Ingredient',
        type: 'vegetable',
        caloPer100g: 50,
        carbsPer100g: 5,
        proteinPer100g: 10,
        fatPer100g: 2,
        fiberPer100g: 3,
        sugarPer100g: 2,
      };

      await expect(
        service.create(mockCreateData, null, Rolename.Customer),
      ).rejects.toThrow('Failed to create ingredient');
    });

    it('should handle errors and throw generic error', async () => {
      const mockCreateData = {
        name: 'New Ingredient',
        type: 'vegetable',
        caloPer100g: 50,
        carbsPer100g: 5,
        proteinPer100g: 10,
        fatPer100g: 2,
        fiberPer100g: 3,
        sugarPer100g: 2,
      };

      jest.spyOn(ingredientRepo, 'create').mockRejectedValue(new Error('Database error'));

      await expect(
        service.create(mockCreateData, SAMPLE_USER_IDS[0], Rolename.Customer),
      ).rejects.toThrow('Database error');
    });
  });

  describe('update', () => {
    it('should update ingredient for admin', async () => {
      const mockUpdateData = { name: 'Updated Ingredient' };
      const validId = new Types.ObjectId().toString();
      
      jest.spyOn(ingredientRepo, 'findById').mockResolvedValue(mockIngredient as IngredientDocument);
      jest.spyOn(ingredientRepo, 'update').mockResolvedValue({ ...mockIngredient, ...mockUpdateData } as IngredientDocument);

      const result = await service.update(validId, mockUpdateData, ADMIN_USER_ID, Rolename.Admin);

      expect(ingredientRepo.findById).toHaveBeenCalledWith(expect.any(Object));
      expect(ingredientRepo.update).toHaveBeenCalledWith(expect.any(Object), mockUpdateData);
      expect(result).toEqual({ ...mockIngredient, ...mockUpdateData });
    });

    it('should throw IngredientNotFoundError when ingredient not found', async () => {
      const validId = new Types.ObjectId().toString();
      jest.spyOn(ingredientRepo, 'findById').mockResolvedValue(null);

      await expect(
        service.update(validId, { name: 'Updated' }, SAMPLE_USER_IDS[0], Rolename.Customer),
      ).rejects.toThrow(IngredientNotFoundError);
    });

    it('should throw IngredientForbiddenError when customer tries to update public ingredient', async () => {
      const validId = new Types.ObjectId().toString();
      jest.spyOn(ingredientRepo, 'findById').mockResolvedValue(mockIngredient as IngredientDocument);

      await expect(
        service.update(validId, { name: 'Updated' }, SAMPLE_USER_IDS[0], Rolename.Customer),
      ).rejects.toThrow(IngredientForbiddenError);
    });

    it('should throw IngredientForbiddenError when customer tries to update others ingredient', async () => {
      const validId = new Types.ObjectId().toString();
      const otherUserIngredient = { ...mockCustomIngredient, belongsTo: SAMPLE_USER_IDS[1] };
      jest.spyOn(ingredientRepo, 'findById').mockResolvedValue(otherUserIngredient as IngredientDocument);

      await expect(
        service.update(validId, { name: 'Updated' }, SAMPLE_USER_IDS[0], Rolename.Customer),
      ).rejects.toThrow(IngredientForbiddenError);
    });

    it('should throw IngredientForbiddenError when admin tries to update customer ingredient', async () => {
      const validId = new Types.ObjectId().toString();
      const customerIngredient = { ...mockCustomIngredient, belongsTo: SAMPLE_USER_IDS[0] };
      jest.spyOn(ingredientRepo, 'findById').mockResolvedValue(customerIngredient as IngredientDocument);

      await expect(
        service.update(validId, { name: 'Updated' }, ADMIN_USER_ID, Rolename.Admin),
      ).rejects.toThrow(IngredientForbiddenError);
    });

    it('should handle errors and throw generic error', async () => {
      const validId = new Types.ObjectId().toString();
      jest.spyOn(ingredientRepo, 'findById').mockRejectedValue(new Error('Database error'));

      await expect(
        service.update(validId, { name: 'Updated' }, ADMIN_USER_ID, Rolename.Admin),
      ).rejects.toThrow('Failed to update ingredient');
    });
  });

  describe('delete', () => {
    it('should delete ingredient for admin', async () => {
      const validId = new Types.ObjectId().toString();
      jest.spyOn(ingredientRepo, 'findById').mockResolvedValue(mockIngredient as IngredientDocument);
      jest.spyOn(ingredientRepo, 'delete').mockResolvedValue({ deletedCount: 1, acknowledged: true });
      jest.spyOn(dishModel, 'find').mockReturnValue({
        exec: jest.fn().mockResolvedValue([]),
      });

      const result = await service.delete(validId, ADMIN_USER_ID, Rolename.Admin);

      expect(ingredientRepo.findById).toHaveBeenCalledWith(expect.any(Object));
      expect(ingredientRepo.delete).toHaveBeenCalledWith(expect.any(Object));
      expect(result).toBeUndefined(); // delete method returns void
    });

    it('should delete custom ingredient for owner', async () => {
      const validId = new Types.ObjectId().toString();
      const customIngredient = { ...mockCustomIngredient, belongsTo: SAMPLE_USER_IDS[0] };
      jest.spyOn(ingredientRepo, 'findById').mockResolvedValue(customIngredient as IngredientDocument);
      jest.spyOn(ingredientRepo, 'delete').mockResolvedValue({ deletedCount: 1, acknowledged: true });
      jest.spyOn(dishModel, 'find').mockReturnValue({
        exec: jest.fn().mockResolvedValue([]),
      });

      const result = await service.delete(validId, SAMPLE_USER_IDS[0], Rolename.Customer);

      expect(ingredientRepo.findById).toHaveBeenCalledWith(expect.any(Object));
      expect(ingredientRepo.delete).toHaveBeenCalledWith(expect.any(Object));
      expect(result).toBeUndefined();
    });

    it('should throw IngredientForbiddenError when customer tries to delete public ingredient', async () => {
      const validId = new Types.ObjectId().toString();
      jest.spyOn(ingredientRepo, 'findById').mockResolvedValue(mockIngredient as IngredientDocument);

      await expect(
        service.delete(validId, SAMPLE_USER_IDS[0], Rolename.Customer),
      ).rejects.toThrow(IngredientForbiddenError);
    });

    it('should throw IngredientForbiddenError when customer tries to delete others ingredient', async () => {
      const validId = new Types.ObjectId().toString();
      const otherUserIngredient = { ...mockCustomIngredient, belongsTo: SAMPLE_USER_IDS[1] };
      jest.spyOn(ingredientRepo, 'findById').mockResolvedValue(otherUserIngredient as IngredientDocument);

      await expect(
        service.delete(validId, SAMPLE_USER_IDS[0], Rolename.Customer),
      ).rejects.toThrow(IngredientForbiddenError);
    });

    it('should throw IngredientForbiddenError when admin tries to delete customer ingredient', async () => {
      const validId = new Types.ObjectId().toString();
      jest.spyOn(ingredientRepo, 'findById').mockResolvedValue(mockCustomIngredient as IngredientDocument);

      await expect(
        service.delete(validId, ADMIN_USER_ID, Rolename.Admin),
      ).rejects.toThrow(IngredientForbiddenError);
    });

    it('should throw IngredientNotFoundError when ingredient not found', async () => {
      const validId = new Types.ObjectId().toString();
      jest.spyOn(ingredientRepo, 'findById').mockResolvedValue(null);

      await expect(
        service.delete(validId, SAMPLE_USER_IDS[0], Rolename.Customer),
      ).rejects.toThrow(IngredientNotFoundError);
    });

    it('should handle dishes with ingredient and update them', async () => {
      const validId = new Types.ObjectId().toString();
      const mockDish = {
        ingredients: [{ ingredient: validId, quantity: 100, deprecated: false }],
        totalCalories: 200,
        totalProtein: 20,
        totalCarbs: 10,
        totalFat: 5,
        totalFiber: 2,
        totalSugar: 1,
        save: jest.fn().mockResolvedValue({}),
      };
      
      jest.spyOn(ingredientRepo, 'findById').mockResolvedValue(mockIngredient as IngredientDocument);
      jest.spyOn(ingredientRepo, 'findAll').mockResolvedValue([mockIngredient as IngredientDocument]);
      jest.spyOn(ingredientRepo, 'delete').mockResolvedValue({ deletedCount: 1, acknowledged: true });
      jest.spyOn(dishModel, 'find').mockReturnValue({
        exec: jest.fn().mockResolvedValue([mockDish]),
      });

      const result = await service.delete(validId, ADMIN_USER_ID, Rolename.Admin);

      expect(mockDish.save).toHaveBeenCalled();
      expect(mockDish.ingredients[0].deprecated).toBe(true);
      expect(result).toBeUndefined();
    });

    it('should handle dishes with multiple ingredients and recalculate totals', async () => {
      const validId = '507f1f77bcf86cd799439011';
      const otherIngredientId = '507f1f77bcf86cd799439012';
      const mockOtherIngredient = {
        _id: otherIngredientId,
        caloPer100g: 100,
        carbsPer100g: 20,
        proteinPer100g: 10,
        fatPer100g: 5,
        fiberPer100g: 3,
        sugarPer100g: 2,
      };
      
      const mockDish = {
        ingredients: [
          { ingredient: validId, amount: 100, deprecated: false },
          { ingredient: otherIngredientId, amount: 50, deprecated: false }
        ],
        totalCalories: 200,
        totalProtein: 20,
        totalCarbs: 10,
        totalFat: 5,
        totalFiber: 2,
        totalSugar: 1,
        save: jest.fn().mockResolvedValue({}),
      };
      
      jest.spyOn(ingredientRepo, 'findById').mockResolvedValue(mockIngredient as IngredientDocument);
      jest.spyOn(ingredientRepo, 'findAll').mockResolvedValue([
        mockIngredient as IngredientDocument,
        mockOtherIngredient as any
      ]);
      jest.spyOn(ingredientRepo, 'delete').mockResolvedValue({ deletedCount: 1, acknowledged: true });
      jest.spyOn(dishModel, 'find').mockReturnValue({
        exec: jest.fn().mockResolvedValue([mockDish]),
      });

      const result = await service.delete(validId, ADMIN_USER_ID, Rolename.Admin);

      expect(mockDish.save).toHaveBeenCalled();
      expect(mockDish.ingredients[0].deprecated).toBe(true);
      expect(mockDish.ingredients[1].deprecated).toBe(false);
      expect(result).toBeUndefined();
    });

    it('should handle dishes with already deprecated ingredients', async () => {
      const validId = new Types.ObjectId().toString();
      const mockDish = {
        ingredients: [{ ingredient: validId, quantity: 100, deprecated: true }],
        totalCalories: 200,
        totalProtein: 20,
        save: jest.fn().mockResolvedValue({}),
      };
      
      jest.spyOn(ingredientRepo, 'findById').mockResolvedValue(mockIngredient as IngredientDocument);
      jest.spyOn(ingredientRepo, 'delete').mockResolvedValue({ deletedCount: 1, acknowledged: true });
      jest.spyOn(dishModel, 'find').mockReturnValue({
        exec: jest.fn().mockResolvedValue([mockDish]),
      });

      const result = await service.delete(validId, ADMIN_USER_ID, Rolename.Admin);

      expect(mockDish.save).not.toHaveBeenCalled();
      expect(result).toBeUndefined();
    });

    it('should handle errors and throw generic error', async () => {
      const validId = new Types.ObjectId().toString();
      jest.spyOn(ingredientRepo, 'findById').mockRejectedValue(new Error('Database error'));

      await expect(
        service.delete(validId, ADMIN_USER_ID, Rolename.Admin),
      ).rejects.toThrow('Failed to delete ingredient');
    });
  });

  describe('importFromExcel', () => {
    it('should import ingredients from Excel file', async () => {
      const mockIngredients = [mockIngredient, mockCustomIngredient];

      jest.spyOn(ingredientRepo, 'deleteMany').mockResolvedValue({ deletedCount: 0, acknowledged: true });
      jest.spyOn(ingredientRepo, 'insertMany').mockResolvedValue(mockIngredients as IngredientDocument[]);

      const result = await service.importFromExcel();

      expect(ingredientRepo.deleteMany).toHaveBeenCalledWith({});
      expect(ingredientRepo.insertMany).toHaveBeenCalled();
      expect(result).toEqual(mockIngredients);
    });

    it('should handle errors during import', async () => {
      jest.spyOn(ingredientRepo, 'deleteMany').mockRejectedValue(new Error('Import error'));

      await expect(
        service.importFromExcel(),
      ).rejects.toThrow('Import error');
    });
  });
});