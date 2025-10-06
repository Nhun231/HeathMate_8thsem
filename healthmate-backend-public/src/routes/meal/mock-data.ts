import { Types } from 'mongoose';
import { MealDocument, MealType } from './schema/meal.schema';
import { DishDocument } from '../dish/schema/dish.schema';
import { IngredientDocument } from '../ingredient/schema/ingredient.schema';

// Sample User IDs
export const SAMPLE_USER_IDS = [
  new Types.ObjectId('507f1f77bcf86cd799439011'),
  new Types.ObjectId('507f1f77bcf86cd799439012'),
  new Types.ObjectId('507f1f77bcf86cd799439013'),
];

// Sample Dishes for meals
export const SAMPLE_DISHES = {
  CHICKEN_RICE: {
    _id: new Types.ObjectId('507f1f77bcf86cd799439021'),
    name: 'Chicken Rice Bowl',
    description: 'Healthy chicken rice bowl',
    type: 'main',
    totalCalories: 485,
    totalCarbs: 61,
    totalProtein: 50.5,
    totalFat: 5.8,
    totalFiber: 2.4,
    totalSugar: 3.1,
    belongsTo: null,
  } as DishDocument,
  
  SALAD: {
    _id: new Types.ObjectId('507f1f77bcf86cd799439022'),
    name: 'Green Salad',
    description: 'Fresh green salad',
    type: 'appetizer',
    totalCalories: 50,
    totalCarbs: 10,
    totalProtein: 3,
    totalFat: 0.4,
    totalFiber: 4,
    totalSugar: 6,
    belongsTo: null,
  } as DishDocument,
};

// Sample Ingredients for meals
export const SAMPLE_INGREDIENTS = {
  CHICKEN: {
    _id: new Types.ObjectId('507f1f77bcf86cd799439031'),
    name: 'Chicken Breast',
    type: 'meat',
    caloPer100g: 165,
    carbsPer100g: 0,
    proteinPer100g: 31,
    fatPer100g: 3.6,
    fiberPer100g: 0,
    sugarPer100g: 0,
    belongsTo: null,
  } as IngredientDocument,
  
  RICE: {
    _id: new Types.ObjectId('507f1f77bcf86cd799439032'),
    name: 'White Rice',
    type: 'grain',
    caloPer100g: 130,
    carbsPer100g: 28,
    proteinPer100g: 2.7,
    fatPer100g: 0.3,
    fiberPer100g: 0.4,
    sugarPer100g: 0.1,
    belongsTo: null,
  } as IngredientDocument,
};

// Sample Meals
export const SAMPLE_MEALS = {
  BREAKFAST_DISH: {
    _id: new Types.ObjectId('507f1f77bcf86cd799439041'),
    userId: SAMPLE_USER_IDS[0],
    date: new Date('2024-01-01T08:00:00Z'),
    mealType: MealType.BREAKFAST,
    dishId: SAMPLE_DISHES.CHICKEN_RICE._id,
    quantity: 150,
    calories: 727.5, // 485 * 1.5
    protein: 75.75, // 50.5 * 1.5
    fat: 8.7, // 5.8 * 1.5
    carbs: 91.5, // 61 * 1.5
    fiber: 3.6, // 2.4 * 1.5
    sugar: 4.65, // 3.1 * 1.5
    isIngredient: false,
    createdAt: new Date('2024-01-01T08:00:00Z'),
    updatedAt: new Date('2024-01-01T08:00:00Z'),
  } as MealDocument,
  
  LUNCH_INGREDIENT: {
    _id: new Types.ObjectId('507f1f77bcf86cd799439042'),
    userId: SAMPLE_USER_IDS[0],
    date: new Date('2024-01-01T12:00:00Z'),
    mealType: MealType.LUNCH,
    ingredientId: SAMPLE_INGREDIENTS.CHICKEN._id,
    quantity: 200,
    calories: 330, // 165 * 2
    protein: 62, // 31 * 2
    fat: 7.2, // 3.6 * 2
    carbs: 0, // 0 * 2
    fiber: 0, // 0 * 2
    sugar: 0, // 0 * 2
    isIngredient: true,
    createdAt: new Date('2024-01-01T12:00:00Z'),
    updatedAt: new Date('2024-01-01T12:00:00Z'),
  } as MealDocument,
  
  DINNER_DISH: {
    _id: new Types.ObjectId('507f1f77bcf86cd799439043'),
    userId: SAMPLE_USER_IDS[0],
    date: new Date('2024-01-01T18:00:00Z'),
    mealType: MealType.DINNER,
    dishId: SAMPLE_DISHES.SALAD._id,
    quantity: 100,
    calories: 50,
    protein: 3,
    fat: 0.4,
    carbs: 10,
    fiber: 4,
    sugar: 6,
    isIngredient: false,
    createdAt: new Date('2024-01-01T18:00:00Z'),
    updatedAt: new Date('2024-01-01T18:00:00Z'),
  } as MealDocument,
  
  SNACK_INGREDIENT: {
    _id: new Types.ObjectId('507f1f77bcf86cd799439044'),
    userId: SAMPLE_USER_IDS[0],
    date: new Date('2024-01-01T15:00:00Z'),
    mealType: MealType.SNACK,
    ingredientId: SAMPLE_INGREDIENTS.RICE._id,
    quantity: 50,
    calories: 65, // 130 * 0.5
    protein: 1.35, // 2.7 * 0.5
    fat: 0.15, // 0.3 * 0.5
    carbs: 14, // 28 * 0.5
    fiber: 0.2, // 0.4 * 0.5
    sugar: 0.05, // 0.1 * 0.5
    isIngredient: true,
    createdAt: new Date('2024-01-01T15:00:00Z'),
    updatedAt: new Date('2024-01-01T15:00:00Z'),
  } as MealDocument,
  
  OTHER_USER_MEAL: {
    _id: new Types.ObjectId('507f1f77bcf86cd799439045'),
    userId: SAMPLE_USER_IDS[1],
    date: new Date('2024-01-01T12:00:00Z'),
    mealType: MealType.LUNCH,
    dishId: SAMPLE_DISHES.CHICKEN_RICE._id,
    quantity: 100,
    calories: 485,
    protein: 50.5,
    fat: 5.8,
    carbs: 61,
    fiber: 2.4,
    sugar: 3.1,
    isIngredient: false,
    createdAt: new Date('2024-01-01T12:00:00Z'),
    updatedAt: new Date('2024-01-01T12:00:00Z'),
  } as MealDocument,
};

// Mock Meal Summary
export const createMockMealSummary = (meals: MealDocument[]) => {
  const summary = {
    totalCalories: 0,
    totalProtein: 0,
    totalFat: 0,
    totalCarbs: 0,
    totalFiber: 0,
    totalSugar: 0,
    mealsByType: {
      [MealType.BREAKFAST]: [] as MealDocument[],
      [MealType.LUNCH]: [] as MealDocument[],
      [MealType.DINNER]: [] as MealDocument[],
      [MealType.SNACK]: [] as MealDocument[],
    },
  };

  meals.forEach((meal) => {
    summary.totalCalories += meal.calories;
    summary.totalProtein += meal.protein;
    summary.totalFat += meal.fat;
    summary.totalCarbs += meal.carbs;
    summary.totalFiber += meal.fiber;
    summary.totalSugar += meal.sugar;
    summary.mealsByType[meal.mealType].push(meal);
  });

  // Round to 1 decimal place
  summary.totalCalories = Math.round(summary.totalCalories * 10) / 10;
  summary.totalProtein = Math.round(summary.totalProtein * 10) / 10;
  summary.totalFat = Math.round(summary.totalFat * 10) / 10;
  summary.totalCarbs = Math.round(summary.totalCarbs * 10) / 10;
  summary.totalFiber = Math.round(summary.totalFiber * 10) / 10;
  summary.totalSugar = Math.round(summary.totalSugar * 10) / 10;

  return summary;
};

// Mock Add Dish DTO
export const createMockAddDishDto = (overrides: any = {}) => ({
  dishId: SAMPLE_DISHES.CHICKEN_RICE._id.toString(),
  quantity: 150,
  ...overrides,
});

// Mock Add Ingredient DTO
export const createMockAddIngredientDto = (overrides: any = {}) => ({
  ingredientId: SAMPLE_INGREDIENTS.CHICKEN._id.toString(),
  quantity: 200,
  ...overrides,
});

// Mock Get Meals DTO
export const createMockGetMealsDto = (overrides: any = {}) => ({
  date: '2024-01-01',
  mealType: MealType.BREAKFAST,
  ...overrides,
});

// Mock Update Meal DTO
export const createMockUpdateMealDto = (overrides: any = {}) => ({
  quantity: 200,
  ...overrides,
});

// Meal Types
export const MEAL_TYPES = Object.values(MealType);

// Test Constants
export const TEST_MEALS = {
  BREAKFAST_DISH: SAMPLE_MEALS.BREAKFAST_DISH,
  LUNCH_INGREDIENT: SAMPLE_MEALS.LUNCH_INGREDIENT,
  DINNER_DISH: SAMPLE_MEALS.DINNER_DISH,
  SNACK_INGREDIENT: SAMPLE_MEALS.SNACK_INGREDIENT,
  OTHER_USER_MEAL: SAMPLE_MEALS.OTHER_USER_MEAL,
};

// Sample dates for testing
export const TEST_DATES = {
  TODAY: '2024-01-01',
  YESTERDAY: '2023-12-31',
  TOMORROW: '2024-01-02',
};
