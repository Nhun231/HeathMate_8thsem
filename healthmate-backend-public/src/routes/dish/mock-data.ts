import { Types } from 'mongoose';
import { DishDocument } from './schema/dish.schema';
import { IngredientDocument } from '../ingredient/schema/ingredient.schema';

// Sample User IDs
export const SAMPLE_USER_IDS = [
  new Types.ObjectId('507f1f77bcf86cd799439011'),
  new Types.ObjectId('507f1f77bcf86cd799439012'),
  new Types.ObjectId('507f1f77bcf86cd799439013'),
];

export const ADMIN_USER_ID = new Types.ObjectId('507f1f77bcf86cd799439099');

// Sample Ingredients for dishes
export const SAMPLE_INGREDIENTS = {
  CHICKEN: {
    _id: new Types.ObjectId('507f1f77bcf86cd799439021'),
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
    _id: new Types.ObjectId('507f1f77bcf86cd799439022'),
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
  
  VEGETABLES: {
    _id: new Types.ObjectId('507f1f77bcf86cd799439023'),
    name: 'Mixed Vegetables',
    type: 'vegetable',
    caloPer100g: 25,
    carbsPer100g: 5,
    proteinPer100g: 1.5,
    fatPer100g: 0.2,
    fiberPer100g: 2,
    sugarPer100g: 3,
    belongsTo: null,
  } as IngredientDocument,
};

// Sample Dishes
export const SAMPLE_DISHES = {
  CHICKEN_RICE: {
    _id: new Types.ObjectId('507f1f77bcf86cd799439031'),
    name: 'Chicken Rice Bowl',
    description: 'Healthy chicken rice bowl with vegetables',
    type: 'main',
    ingredients: [
      {
        ingredient: SAMPLE_INGREDIENTS.CHICKEN._id,
        amount: 150,
        deprecated: false,
      },
      {
        ingredient: SAMPLE_INGREDIENTS.RICE._id,
        amount: 200,
        deprecated: false,
      },
      {
        ingredient: SAMPLE_INGREDIENTS.VEGETABLES._id,
        amount: 100,
        deprecated: false,
      },
    ],
    totalCalories: 485,
    totalCarbs: 61,
    totalProtein: 50.5,
    totalFat: 5.8,
    totalFiber: 2.4,
    totalSugar: 3.1,
    belongsTo: null,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  } as DishDocument,
  
  CUSTOM_DISH: {
    _id: new Types.ObjectId('507f1f77bcf86cd799439032'),
    name: 'My Custom Salad',
    description: 'Personal salad recipe',
    type: 'appetizer',
    ingredients: [
      {
        ingredient: SAMPLE_INGREDIENTS.VEGETABLES._id,
        amount: 200,
        deprecated: false,
      },
    ],
    totalCalories: 50,
    totalCarbs: 10,
    totalProtein: 3,
    totalFat: 0.4,
    totalFiber: 4,
    totalSugar: 6,
    belongsTo: SAMPLE_USER_IDS[0],
    createdAt: new Date('2024-01-02'),
    updatedAt: new Date('2024-01-02'),
  } as DishDocument,
  
  ADMIN_DISH: {
    _id: new Types.ObjectId('507f1f77bcf86cd799439033'),
    name: 'Admin Special',
    description: 'Admin created public dish',
    type: 'main',
    ingredients: [
      {
        ingredient: SAMPLE_INGREDIENTS.CHICKEN._id,
        amount: 200,
        deprecated: false,
      },
    ],
    totalCalories: 330,
    totalCarbs: 0,
    totalProtein: 62,
    totalFat: 7.2,
    totalFiber: 0,
    totalSugar: 0,
    belongsTo: null,
    createdAt: new Date('2024-01-03'),
    updatedAt: new Date('2024-01-03'),
  } as DishDocument,
};

// Mock Paginated Result
export const createMockPaginatedResult = (items: any[], total = 1, page = 1, limit = 10) => ({
  items,
  total,
  page,
  limit,
  totalPages: Math.ceil(total / limit),
});

// Mock Dish Creation Data
export const createMockDishData = (overrides: any = {}) => ({
  name: 'Test Dish',
  description: 'Test description',
  type: 'main',
  ingredients: [
    {
      ingredient: SAMPLE_INGREDIENTS.CHICKEN._id,
      amount: 100,
    },
  ],
  ...overrides,
});

// Mock Dish Update Data
export const createMockDishUpdateData = (overrides: any = {}) => ({
  name: 'Updated Dish',
  description: 'Updated description',
  ...overrides,
});

// Dish Types
export const DISH_TYPES = ['appetizer', 'main', 'dessert', 'beverage', 'snack'];

// Nutritional Ranges for testing
export const NUTRITIONAL_RANGES = {
  calories: { min: 0, max: 1000 },
  carbs: { min: 0, max: 100 },
  protein: { min: 0, max: 100 },
  fat: { min: 0, max: 50 },
  fiber: { min: 0, max: 20 },
  sugar: { min: 0, max: 50 },
};

// Test Constants
export const TEST_DISHES = {
  PUBLIC_DISH: SAMPLE_DISHES.CHICKEN_RICE,
  CUSTOM_DISH: SAMPLE_DISHES.CUSTOM_DISH,
  ADMIN_DISH: SAMPLE_DISHES.ADMIN_DISH,
};
