import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { MealService } from './meal.service';
import { MealRepo } from './meal.repo';
import { MealDocument, MealType } from './schema/meal.schema';
import { DishDocument } from '../dish/schema/dish.schema';
import { IngredientDocument } from '../ingredient/schema/ingredient.schema';
import { MealNotFoundError, MealForbiddenError } from './meal.error';
import {
  SAMPLE_USER_IDS,
  SAMPLE_MEALS,
  SAMPLE_DISHES,
  SAMPLE_INGREDIENTS,
  createMockAddDishDto,
  createMockAddIngredientDto,
  createMockGetMealsDto,
  createMockUpdateMealDto,
  createMockMealSummary,
  TEST_DATES,
} from './mock-data';

describe('MealService', () => {
  let service: MealService;
  let mealRepo: MealRepo;
  let dishModel: any;
  let ingredientModel: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MealService,
        {
          provide: MealRepo,
          useValue: {
            create: jest.fn(),
            findById: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            findByUserIdAndDate: jest.fn(),
            findByUserIdAndDateRange: jest.fn(),
          },
        },
        {
          provide: getModelToken('Dish'),
          useValue: {
            findById: jest.fn(),
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

    service = module.get<MealService>(MealService);
    mealRepo = module.get<MealRepo>(MealRepo);
    dishModel = module.get(getModelToken('Dish'));
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
    it('should throw MealNotFoundError for invalid ObjectId', () => {
      (Types.ObjectId.isValid as jest.Mock).mockReturnValueOnce(false);
      
      expect(() => {
        (service as any).validateObjectId('invalid-id');
      }).toThrow(MealNotFoundError);
    });

    it('should not throw for valid ObjectId', () => {
      (Types.ObjectId.isValid as jest.Mock).mockReturnValueOnce(true);
      
      expect(() => {
        (service as any).validateObjectId('507f1f77bcf86cd799439011');
      }).not.toThrow();
    });
  });

  describe('addDishToMeal', () => {
    it('should add dish to meal successfully', async () => {
      const addDishDto = createMockAddDishDto();
      const mockMeal = SAMPLE_MEALS.BREAKFAST_DISH;

      dishModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(SAMPLE_DISHES.CHICKEN_RICE),
      });
      jest.spyOn(mealRepo, 'create').mockResolvedValue(mockMeal as MealDocument);

      const result = await service.addDishToMeal(
        SAMPLE_USER_IDS[0].toString(),
        new Date(TEST_DATES.TODAY),
        MealType.BREAKFAST,
        addDishDto
      );

      expect(dishModel.findById).toHaveBeenCalledWith(addDishDto.dishId);
      expect(mealRepo.create).toHaveBeenCalledWith({
        userId: expect.any(Object),
        date: expect.any(Date),
        mealType: MealType.BREAKFAST,
        dishId: expect.any(Object),
        quantity: addDishDto.quantity,
        isIngredient: false,
        calories: expect.any(Number),
        protein: expect.any(Number),
        fat: expect.any(Number),
        carbs: expect.any(Number),
        fiber: expect.any(Number),
        sugar: expect.any(Number),
      });
      expect(result).toEqual(mockMeal);
    });

    it('should calculate nutrition values correctly for dish', async () => {
      const addDishDto = createMockAddDishDto({ quantity: 200 });
      const mockMeal = SAMPLE_MEALS.BREAKFAST_DISH;

      dishModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(SAMPLE_DISHES.CHICKEN_RICE),
      });
      jest.spyOn(mealRepo, 'create').mockResolvedValue(mockMeal as MealDocument);

      await service.addDishToMeal(
        SAMPLE_USER_IDS[0].toString(),
        new Date(TEST_DATES.TODAY),
        MealType.BREAKFAST,
        addDishDto
      );

      expect(mealRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          calories: 970, // 485 * 2
          protein: 101, // 50.5 * 2
          fat: 11.6, // 5.8 * 2
          carbs: 122, // 61 * 2
          fiber: 4.8, // 2.4 * 2
          sugar: 6.2, // 3.1 * 2
        })
      );
    });

    it('should throw MealNotFoundError when dish not found', async () => {
      const addDishDto = createMockAddDishDto();

      dishModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(
        service.addDishToMeal(
          SAMPLE_USER_IDS[0].toString(),
          new Date(TEST_DATES.TODAY),
          MealType.BREAKFAST,
          addDishDto
        )
      ).rejects.toThrow(MealNotFoundError);
    });

    it('should handle errors and throw generic error', async () => {
      const addDishDto = createMockAddDishDto();

      dishModel.findById.mockReturnValue({
        exec: jest.fn().mockRejectedValue(new Error('Database error')),
      });

      await expect(
        service.addDishToMeal(
          SAMPLE_USER_IDS[0].toString(),
          new Date(TEST_DATES.TODAY),
          MealType.BREAKFAST,
          addDishDto
        )
      ).rejects.toThrow('Failed to add dish to meal');
    });
  });

  describe('addIngredientToMeal', () => {
    it('should add ingredient to meal successfully', async () => {
      const addIngredientDto = createMockAddIngredientDto();
      const mockMeal = SAMPLE_MEALS.LUNCH_INGREDIENT;

      ingredientModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(SAMPLE_INGREDIENTS.CHICKEN),
      });
      jest.spyOn(mealRepo, 'create').mockResolvedValue(mockMeal as MealDocument);

      const result = await service.addIngredientToMeal(
        SAMPLE_USER_IDS[0].toString(),
        new Date(TEST_DATES.TODAY),
        MealType.LUNCH,
        addIngredientDto
      );

      expect(ingredientModel.findById).toHaveBeenCalledWith(addIngredientDto.ingredientId);
      expect(mealRepo.create).toHaveBeenCalledWith({
        userId: expect.any(Object),
        date: expect.any(Date),
        mealType: MealType.LUNCH,
        ingredientId: expect.any(Object),
        quantity: addIngredientDto.quantity,
        isIngredient: true,
        calories: expect.any(Number),
        protein: expect.any(Number),
        fat: expect.any(Number),
        carbs: expect.any(Number),
        fiber: expect.any(Number),
        sugar: expect.any(Number),
      });
      expect(result).toEqual(mockMeal);
    });

    it('should calculate nutrition values correctly for ingredient', async () => {
      const addIngredientDto = createMockAddIngredientDto({ quantity: 150 });
      const mockMeal = SAMPLE_MEALS.LUNCH_INGREDIENT;

      ingredientModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(SAMPLE_INGREDIENTS.CHICKEN),
      });
      jest.spyOn(mealRepo, 'create').mockResolvedValue(mockMeal as MealDocument);

      await service.addIngredientToMeal(
        SAMPLE_USER_IDS[0].toString(),
        new Date(TEST_DATES.TODAY),
        MealType.LUNCH,
        addIngredientDto
      );

      expect(mealRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          calories: 247.5, // 165 * 1.5
          protein: 46.5, // 31 * 1.5
          fat: 5.4, // 3.6 * 1.5
          carbs: 0, // 0 * 1.5
          fiber: 0, // 0 * 1.5
          sugar: 0, // 0 * 1.5
        })
      );
    });

    it('should throw MealNotFoundError when ingredient not found', async () => {
      const addIngredientDto = createMockAddIngredientDto();

      ingredientModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(
        service.addIngredientToMeal(
          SAMPLE_USER_IDS[0].toString(),
          new Date(TEST_DATES.TODAY),
          MealType.LUNCH,
          addIngredientDto
        )
      ).rejects.toThrow(MealNotFoundError);
    });

    it('should handle errors and throw generic error', async () => {
      const addIngredientDto = createMockAddIngredientDto();

      ingredientModel.findById.mockReturnValue({
        exec: jest.fn().mockRejectedValue(new Error('Database error')),
      });

      await expect(
        service.addIngredientToMeal(
          SAMPLE_USER_IDS[0].toString(),
          new Date(TEST_DATES.TODAY),
          MealType.LUNCH,
          addIngredientDto
        )
      ).rejects.toThrow('Failed to add ingredient to meal');
    });
  });

  describe('getMeals', () => {
    it('should get meals for specific date and meal type', async () => {
      const getMealsDto = createMockGetMealsDto();
      const mockMeals = [SAMPLE_MEALS.BREAKFAST_DISH];

      jest.spyOn(mealRepo, 'findByUserIdAndDate').mockResolvedValue(mockMeals as MealDocument[]);

      const result = await service.getMeals(
        SAMPLE_USER_IDS[0].toString(),
        getMealsDto
      );

      expect(mealRepo.findByUserIdAndDate).toHaveBeenCalledWith(
        expect.any(Object),
        expect.any(Date),
        expect.any(Date),
        getMealsDto.mealType
      );
      expect(result).toEqual(mockMeals);
    });

    it('should get meals for specific date without meal type', async () => {
      const getMealsDto = createMockGetMealsDto({ mealType: undefined });
      const mockMeals = [SAMPLE_MEALS.BREAKFAST_DISH, SAMPLE_MEALS.LUNCH_INGREDIENT];

      jest.spyOn(mealRepo, 'findByUserIdAndDate').mockResolvedValue(mockMeals as MealDocument[]);

      const result = await service.getMeals(
        SAMPLE_USER_IDS[0].toString(),
        getMealsDto
      );

      expect(mealRepo.findByUserIdAndDate).toHaveBeenCalledWith(
        expect.any(Object),
        expect.any(Date),
        expect.any(Date),
        undefined
      );
      expect(result).toEqual(mockMeals);
    });

    it('should handle errors and throw generic error', async () => {
      const getMealsDto = createMockGetMealsDto();

      jest.spyOn(mealRepo, 'findByUserIdAndDate').mockRejectedValue(new Error('Database error'));

      await expect(
        service.getMeals(SAMPLE_USER_IDS[0].toString(), getMealsDto)
      ).rejects.toThrow('Failed to fetch meals');
    });
  });

  describe('updateMeal', () => {
    it('should update meal quantity for ingredient meal', async () => {
      const updateMealDto = createMockUpdateMealDto({ quantity: 300 });
      const mockMeal = { ...SAMPLE_MEALS.LUNCH_INGREDIENT, ingredientId: SAMPLE_INGREDIENTS.CHICKEN._id };
      const updatedMeal = { ...mockMeal, quantity: 300 };

      jest.spyOn(mealRepo, 'findById').mockResolvedValue(mockMeal as MealDocument);
      ingredientModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(SAMPLE_INGREDIENTS.CHICKEN),
      });
      jest.spyOn(mealRepo, 'update').mockResolvedValue(updatedMeal as MealDocument);

      const result = await service.updateMeal(
        SAMPLE_USER_IDS[0].toString(),
        '507f1f77bcf86cd799439042',
        updateMealDto
      );

      expect(mealRepo.findById).toHaveBeenCalledWith(expect.any(Object));
      expect(ingredientModel.findById).toHaveBeenCalledWith(SAMPLE_INGREDIENTS.CHICKEN._id);
      expect(mealRepo.update).toHaveBeenCalledWith(expect.any(Object), expect.objectContaining({
        quantity: 300,
        calories: expect.any(Number),
        protein: expect.any(Number),
        fat: expect.any(Number),
        carbs: expect.any(Number),
        fiber: expect.any(Number),
        sugar: expect.any(Number),
      }));
      expect(result).toEqual(updatedMeal);
    });

    it('should update meal quantity for dish meal', async () => {
      const updateMealDto = createMockUpdateMealDto({ quantity: 250 });
      const mockMeal = { ...SAMPLE_MEALS.BREAKFAST_DISH, dishId: SAMPLE_DISHES.CHICKEN_RICE._id };
      const updatedMeal = { ...mockMeal, quantity: 250 };

      jest.spyOn(mealRepo, 'findById').mockResolvedValue(mockMeal as MealDocument);
      dishModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(SAMPLE_DISHES.CHICKEN_RICE),
      });
      jest.spyOn(mealRepo, 'update').mockResolvedValue(updatedMeal as MealDocument);

      const result = await service.updateMeal(
        SAMPLE_USER_IDS[0].toString(),
        '507f1f77bcf86cd799439041',
        updateMealDto
      );

      expect(mealRepo.findById).toHaveBeenCalledWith(expect.any(Object));
      expect(dishModel.findById).toHaveBeenCalledWith(SAMPLE_DISHES.CHICKEN_RICE._id);
      expect(mealRepo.update).toHaveBeenCalledWith(expect.any(Object), expect.objectContaining({
        quantity: 250,
        calories: expect.any(Number),
        protein: expect.any(Number),
        fat: expect.any(Number),
        carbs: expect.any(Number),
        fiber: expect.any(Number),
        sugar: expect.any(Number),
      }));
      expect(result).toEqual(updatedMeal);
    });

    it('should throw MealNotFoundError when meal not found', async () => {
      const updateMealDto = createMockUpdateMealDto();

      jest.spyOn(mealRepo, 'findById').mockResolvedValue(null);

      await expect(
        service.updateMeal(
          SAMPLE_USER_IDS[0].toString(),
          '507f1f77bcf86cd799439011',
          updateMealDto
        )
      ).rejects.toThrow(MealNotFoundError);
    });

    it('should throw MealForbiddenError when user does not own meal', async () => {
      const updateMealDto = createMockUpdateMealDto();
      const otherUserMeal = { ...SAMPLE_MEALS.OTHER_USER_MEAL };

      jest.spyOn(mealRepo, 'findById').mockResolvedValue(otherUserMeal as MealDocument);

      await expect(
        service.updateMeal(
          SAMPLE_USER_IDS[0].toString(),
          '507f1f77bcf86cd799439045',
          updateMealDto
        )
      ).rejects.toThrow(MealForbiddenError);
    });

    it('should handle errors and throw generic error', async () => {
      const updateMealDto = createMockUpdateMealDto();

      jest.spyOn(mealRepo, 'findById').mockRejectedValue(new Error('Database error'));

      await expect(
        service.updateMeal(
          SAMPLE_USER_IDS[0].toString(),
          '507f1f77bcf86cd799439041',
          updateMealDto
        )
      ).rejects.toThrow('Failed to update meal');
    });
  });

  describe('deleteMeal', () => {
    it('should delete meal successfully', async () => {
      const mockMeal = SAMPLE_MEALS.BREAKFAST_DISH;

      jest.spyOn(mealRepo, 'findById').mockResolvedValue(mockMeal as MealDocument);
      jest.spyOn(mealRepo, 'delete').mockResolvedValue(undefined);

      const result = await service.deleteMeal(
        SAMPLE_USER_IDS[0].toString(),
        '507f1f77bcf86cd799439041'
      );

      expect(mealRepo.findById).toHaveBeenCalledWith(expect.any(Object));
      expect(mealRepo.delete).toHaveBeenCalledWith(expect.any(Object));
      expect(result).toBeUndefined();
    });

    it('should throw MealNotFoundError when meal not found', async () => {
      jest.spyOn(mealRepo, 'findById').mockResolvedValue(null);

      await expect(
        service.deleteMeal(
          SAMPLE_USER_IDS[0].toString(),
          '507f1f77bcf86cd799439011'
        )
      ).rejects.toThrow(MealNotFoundError);
    });

    it('should throw MealForbiddenError when user does not own meal', async () => {
      const otherUserMeal = { ...SAMPLE_MEALS.OTHER_USER_MEAL };

      jest.spyOn(mealRepo, 'findById').mockResolvedValue(otherUserMeal as MealDocument);

      await expect(
        service.deleteMeal(
          SAMPLE_USER_IDS[0].toString(),
          '507f1f77bcf86cd799439045'
        )
      ).rejects.toThrow(MealForbiddenError);
    });

    it('should handle errors and throw generic error', async () => {
      jest.spyOn(mealRepo, 'findById').mockRejectedValue(new Error('Database error'));

      await expect(
        service.deleteMeal(
          SAMPLE_USER_IDS[0].toString(),
          '507f1f77bcf86cd799439041'
        )
      ).rejects.toThrow('Failed to delete meal');
    });
  });

  describe('getMealSummary', () => {
    it('should get meal summary for specific date', async () => {
      const mockMeals = [
        SAMPLE_MEALS.BREAKFAST_DISH,
        SAMPLE_MEALS.LUNCH_INGREDIENT,
        SAMPLE_MEALS.DINNER_DISH,
        SAMPLE_MEALS.SNACK_INGREDIENT,
      ];
      const expectedSummary = createMockMealSummary(mockMeals);

      jest.spyOn(mealRepo, 'findByUserIdAndDateRange').mockResolvedValue(mockMeals as MealDocument[]);

      const result = await service.getMealSummary(
        SAMPLE_USER_IDS[0].toString(),
        TEST_DATES.TODAY
      );

      expect(mealRepo.findByUserIdAndDateRange).toHaveBeenCalledWith(
        expect.any(Object),
        expect.any(Date),
        expect.any(Date)
      );
      expect(result).toEqual(expectedSummary);
    });

    it('should get meal summary with empty meals', async () => {
      const expectedSummary = createMockMealSummary([]);

      jest.spyOn(mealRepo, 'findByUserIdAndDateRange').mockResolvedValue([]);

      const result = await service.getMealSummary(
        SAMPLE_USER_IDS[0].toString(),
        TEST_DATES.YESTERDAY
      );

      expect(mealRepo.findByUserIdAndDateRange).toHaveBeenCalledWith(
        expect.any(Object),
        expect.any(Date),
        expect.any(Date)
      );
      expect(result).toEqual(expectedSummary);
    });

    it('should handle errors and throw generic error', async () => {
      jest.spyOn(mealRepo, 'findByUserIdAndDateRange').mockRejectedValue(new Error('Database error'));

      await expect(
        service.getMealSummary(
          SAMPLE_USER_IDS[0].toString(),
          TEST_DATES.TODAY
        )
      ).rejects.toThrow('Failed to get meal summary');
    });
  });
});
