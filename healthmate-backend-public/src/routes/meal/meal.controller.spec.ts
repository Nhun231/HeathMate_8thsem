import { Test, TestingModule } from '@nestjs/testing';
import { MealController } from './meal.controller';
import { MealService } from './meal.service';
import { MealDocument, MealType } from './schema/meal.schema';
import { Types } from 'mongoose';
import {
  SAMPLE_USER_IDS,
  SAMPLE_MEALS,
  createMockAddDishDto,
  createMockAddIngredientDto,
  createMockGetMealsDto,
  createMockUpdateMealDto,
  createMockMealSummary,
  TEST_DATES,
} from './mock-data';

describe('MealController', () => {
  let controller: MealController;
  let service: MealService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MealController],
      providers: [
        {
          provide: MealService,
          useValue: {
            addDishToMeal: jest.fn(),
            addIngredientToMeal: jest.fn(),
            getMeals: jest.fn(),
            getMealSummary: jest.fn(),
            updateMeal: jest.fn(),
            deleteMeal: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<MealController>(MealController);
    service = module.get<MealService>(MealService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('addDishToMeal', () => {
    it('should add dish to breakfast meal', async () => {
      const addDishDto = createMockAddDishDto();
      const mockMeal = SAMPLE_MEALS.BREAKFAST_DISH;

      jest.spyOn(service, 'addDishToMeal').mockResolvedValue(mockMeal as MealDocument);

      const result = await controller.addDishToMeal(
        addDishDto,
        SAMPLE_USER_IDS[0],
        TEST_DATES.TODAY,
        MealType.BREAKFAST
      );

      expect(service.addDishToMeal).toHaveBeenCalledWith(
        SAMPLE_USER_IDS[0].toString(),
        new Date(TEST_DATES.TODAY),
        MealType.BREAKFAST,
        addDishDto
      );
      expect(result).toEqual(mockMeal);
    });

    it('should add dish to lunch meal', async () => {
      const addDishDto = createMockAddDishDto({
        dishId: '507f1f77bcf86cd799439022',
        quantity: 100,
      });
      const mockMeal = SAMPLE_MEALS.DINNER_DISH;

      jest.spyOn(service, 'addDishToMeal').mockResolvedValue(mockMeal as MealDocument);

      const result = await controller.addDishToMeal(
        addDishDto,
        SAMPLE_USER_IDS[0],
        TEST_DATES.TODAY,
        MealType.LUNCH
      );

      expect(service.addDishToMeal).toHaveBeenCalledWith(
        SAMPLE_USER_IDS[0].toString(),
        new Date(TEST_DATES.TODAY),
        MealType.LUNCH,
        addDishDto
      );
      expect(result).toEqual(mockMeal);
    });

    it('should add dish to dinner meal', async () => {
      const addDishDto = createMockAddDishDto({
        dishId: '507f1f77bcf86cd799439021',
        quantity: 200,
      });
      const mockMeal = SAMPLE_MEALS.DINNER_DISH;

      jest.spyOn(service, 'addDishToMeal').mockResolvedValue(mockMeal as MealDocument);

      const result = await controller.addDishToMeal(
        addDishDto,
        SAMPLE_USER_IDS[0],
        TEST_DATES.TODAY,
        MealType.DINNER
      );

      expect(service.addDishToMeal).toHaveBeenCalledWith(
        SAMPLE_USER_IDS[0].toString(),
        new Date(TEST_DATES.TODAY),
        MealType.DINNER,
        addDishDto
      );
      expect(result).toEqual(mockMeal);
    });

    it('should add dish to snack meal', async () => {
      const addDishDto = createMockAddDishDto({
        dishId: '507f1f77bcf86cd799439022',
        quantity: 50,
      });
      const mockMeal = SAMPLE_MEALS.SNACK_INGREDIENT;

      jest.spyOn(service, 'addDishToMeal').mockResolvedValue(mockMeal as MealDocument);

      const result = await controller.addDishToMeal(
        addDishDto,
        SAMPLE_USER_IDS[0],
        TEST_DATES.TODAY,
        MealType.SNACK
      );

      expect(service.addDishToMeal).toHaveBeenCalledWith(
        SAMPLE_USER_IDS[0].toString(),
        new Date(TEST_DATES.TODAY),
        MealType.SNACK,
        addDishDto
      );
      expect(result).toEqual(mockMeal);
    });
  });

  describe('addIngredientToMeal', () => {
    it('should add ingredient to breakfast meal', async () => {
      const addIngredientDto = createMockAddIngredientDto();
      const mockMeal = SAMPLE_MEALS.LUNCH_INGREDIENT;

      jest.spyOn(service, 'addIngredientToMeal').mockResolvedValue(mockMeal as MealDocument);

      const result = await controller.addIngredientToMeal(
        addIngredientDto,
        SAMPLE_USER_IDS[0],
        TEST_DATES.TODAY,
        MealType.BREAKFAST
      );

      expect(service.addIngredientToMeal).toHaveBeenCalledWith(
        SAMPLE_USER_IDS[0].toString(),
        new Date(TEST_DATES.TODAY),
        MealType.BREAKFAST,
        addIngredientDto
      );
      expect(result).toEqual(mockMeal);
    });

    it('should add ingredient to lunch meal', async () => {
      const addIngredientDto = createMockAddIngredientDto({
        ingredientId: '507f1f77bcf86cd799439032',
        quantity: 100,
      });
      const mockMeal = SAMPLE_MEALS.SNACK_INGREDIENT;

      jest.spyOn(service, 'addIngredientToMeal').mockResolvedValue(mockMeal as MealDocument);

      const result = await controller.addIngredientToMeal(
        addIngredientDto,
        SAMPLE_USER_IDS[0],
        TEST_DATES.TODAY,
        MealType.LUNCH
      );

      expect(service.addIngredientToMeal).toHaveBeenCalledWith(
        SAMPLE_USER_IDS[0].toString(),
        new Date(TEST_DATES.TODAY),
        MealType.LUNCH,
        addIngredientDto
      );
      expect(result).toEqual(mockMeal);
    });

    it('should add ingredient to dinner meal', async () => {
      const addIngredientDto = createMockAddIngredientDto({
        ingredientId: '507f1f77bcf86cd799439031',
        quantity: 150,
      });
      const mockMeal = SAMPLE_MEALS.LUNCH_INGREDIENT;

      jest.spyOn(service, 'addIngredientToMeal').mockResolvedValue(mockMeal as MealDocument);

      const result = await controller.addIngredientToMeal(
        addIngredientDto,
        SAMPLE_USER_IDS[0],
        TEST_DATES.TODAY,
        MealType.DINNER
      );

      expect(service.addIngredientToMeal).toHaveBeenCalledWith(
        SAMPLE_USER_IDS[0].toString(),
        new Date(TEST_DATES.TODAY),
        MealType.DINNER,
        addIngredientDto
      );
      expect(result).toEqual(mockMeal);
    });

    it('should add ingredient to snack meal', async () => {
      const addIngredientDto = createMockAddIngredientDto({
        ingredientId: '507f1f77bcf86cd799439032',
        quantity: 75,
      });
      const mockMeal = SAMPLE_MEALS.SNACK_INGREDIENT;

      jest.spyOn(service, 'addIngredientToMeal').mockResolvedValue(mockMeal as MealDocument);

      const result = await controller.addIngredientToMeal(
        addIngredientDto,
        SAMPLE_USER_IDS[0],
        TEST_DATES.TODAY,
        MealType.SNACK
      );

      expect(service.addIngredientToMeal).toHaveBeenCalledWith(
        SAMPLE_USER_IDS[0].toString(),
        new Date(TEST_DATES.TODAY),
        MealType.SNACK,
        addIngredientDto
      );
      expect(result).toEqual(mockMeal);
    });
  });

  describe('getMeals', () => {
    it('should get meals for specific date and meal type', async () => {
      const getMealsDto = createMockGetMealsDto();
      const mockMeals = [SAMPLE_MEALS.BREAKFAST_DISH];

      jest.spyOn(service, 'getMeals').mockResolvedValue(mockMeals as MealDocument[]);

      const result = await controller.getMeals(
        getMealsDto,
        SAMPLE_USER_IDS[0]
      );

      expect(service.getMeals).toHaveBeenCalledWith(
        SAMPLE_USER_IDS[0].toString(),
        getMealsDto
      );
      expect(result).toEqual(mockMeals);
    });

    it('should get meals for specific date without meal type', async () => {
      const getMealsDto = createMockGetMealsDto({
        mealType: undefined,
      });
      const mockMeals = [SAMPLE_MEALS.BREAKFAST_DISH, SAMPLE_MEALS.LUNCH_INGREDIENT];

      jest.spyOn(service, 'getMeals').mockResolvedValue(mockMeals as MealDocument[]);

      const result = await controller.getMeals(
        getMealsDto,
        SAMPLE_USER_IDS[0]
      );

      expect(service.getMeals).toHaveBeenCalledWith(
        SAMPLE_USER_IDS[0].toString(),
        getMealsDto
      );
      expect(result).toEqual(mockMeals);
    });

    it('should get meals for different date', async () => {
      const getMealsDto = createMockGetMealsDto({
        date: TEST_DATES.YESTERDAY,
        mealType: MealType.DINNER,
      });
      const mockMeals = [SAMPLE_MEALS.DINNER_DISH];

      jest.spyOn(service, 'getMeals').mockResolvedValue(mockMeals as MealDocument[]);

      const result = await controller.getMeals(
        getMealsDto,
        SAMPLE_USER_IDS[0]
      );

      expect(service.getMeals).toHaveBeenCalledWith(
        SAMPLE_USER_IDS[0].toString(),
        getMealsDto
      );
      expect(result).toEqual(mockMeals);
    });
  });

  describe('getMealSummary', () => {
    it('should get meal summary for specific date', async () => {
      const mockSummary = createMockMealSummary([
        SAMPLE_MEALS.BREAKFAST_DISH,
        SAMPLE_MEALS.LUNCH_INGREDIENT,
        SAMPLE_MEALS.DINNER_DISH,
        SAMPLE_MEALS.SNACK_INGREDIENT,
      ]);

      jest.spyOn(service, 'getMealSummary').mockResolvedValue(mockSummary);

      const result = await controller.getMealSummary(
        TEST_DATES.TODAY,
        SAMPLE_USER_IDS[0]
      );

      expect(service.getMealSummary).toHaveBeenCalledWith(
        SAMPLE_USER_IDS[0].toString(),
        TEST_DATES.TODAY
      );
      expect(result).toEqual(mockSummary);
    });

    it('should get meal summary for different date', async () => {
      const mockSummary = createMockMealSummary([SAMPLE_MEALS.BREAKFAST_DISH]);

      jest.spyOn(service, 'getMealSummary').mockResolvedValue(mockSummary);

      const result = await controller.getMealSummary(
        TEST_DATES.YESTERDAY,
        SAMPLE_USER_IDS[0]
      );

      expect(service.getMealSummary).toHaveBeenCalledWith(
        SAMPLE_USER_IDS[0].toString(),
        TEST_DATES.YESTERDAY
      );
      expect(result).toEqual(mockSummary);
    });
  });

  describe('updateMeal', () => {
    it('should update meal quantity', async () => {
      const updateMealDto = createMockUpdateMealDto({
        quantity: 250,
      });
      const updatedMeal = { ...SAMPLE_MEALS.BREAKFAST_DISH, quantity: 250 };

      jest.spyOn(service, 'updateMeal').mockResolvedValue(updatedMeal as MealDocument);

      const result = await controller.updateMeal(
        { mealId: '507f1f77bcf86cd799439041' },
        updateMealDto,
        SAMPLE_USER_IDS[0]
      );

      expect(service.updateMeal).toHaveBeenCalledWith(
        SAMPLE_USER_IDS[0].toString(),
        '507f1f77bcf86cd799439041',
        updateMealDto
      );
      expect(result).toEqual(updatedMeal);
    });

    it('should update meal with different quantity', async () => {
      const updateMealDto = createMockUpdateMealDto({
        quantity: 300,
      });
      const updatedMeal = { ...SAMPLE_MEALS.LUNCH_INGREDIENT, quantity: 300 };

      jest.spyOn(service, 'updateMeal').mockResolvedValue(updatedMeal as MealDocument);

      const result = await controller.updateMeal(
        { mealId: '507f1f77bcf86cd799439042' },
        updateMealDto,
        SAMPLE_USER_IDS[0]
      );

      expect(service.updateMeal).toHaveBeenCalledWith(
        SAMPLE_USER_IDS[0].toString(),
        '507f1f77bcf86cd799439042',
        updateMealDto
      );
      expect(result).toEqual(updatedMeal);
    });
  });

  describe('deleteMeal', () => {
    it('should delete meal', async () => {
      jest.spyOn(service, 'deleteMeal').mockResolvedValue(undefined);

      const result = await controller.deleteMeal(
        { mealId: '507f1f77bcf86cd799439041' },
        SAMPLE_USER_IDS[0]
      );

      expect(service.deleteMeal).toHaveBeenCalledWith(
        SAMPLE_USER_IDS[0].toString(),
        '507f1f77bcf86cd799439041'
      );
      expect(result).toBeUndefined();
    });

    it('should delete different meal', async () => {
      jest.spyOn(service, 'deleteMeal').mockResolvedValue(undefined);

      const result = await controller.deleteMeal(
        { mealId: '507f1f77bcf86cd799439042' },
        SAMPLE_USER_IDS[0]
      );

      expect(service.deleteMeal).toHaveBeenCalledWith(
        SAMPLE_USER_IDS[0].toString(),
        '507f1f77bcf86cd799439042'
      );
      expect(result).toBeUndefined();
    });
  });
});
