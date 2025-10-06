/**
 * Realistic Mock Data for Ingredient Tests
 * 
 * This file contains sample data that mimics real MongoDB Atlas data
 * without requiring actual database access.
 */

import { Types } from 'mongoose';
import { IngredientDocument } from './schema/ingredient.schema';

// Sample ingredient categories/types
export const INGREDIENT_TYPES = [
  'meat', 'vegetable', 'fruit', 'grain', 'dairy', 'spice', 'herb', 'nut', 'seafood'
] as const;

// Sample nutritional ranges (per 100g)
export const NUTRITIONAL_RANGES = {
  meat: { calo: [150, 300], protein: [15, 30], fat: [5, 25], carbs: [0, 5] },
  vegetable: { calo: [20, 80], protein: [1, 5], fat: [0, 2], carbs: [3, 15] },
  fruit: { calo: [40, 100], protein: [0.5, 2], fat: [0, 1], carbs: [8, 25] },
  grain: { calo: [300, 400], protein: [8, 15], fat: [1, 5], carbs: [60, 80] },
  dairy: { calo: [50, 150], protein: [3, 10], fat: [1, 8], carbs: [3, 12] },
  spice: { calo: [200, 400], protein: [5, 15], fat: [5, 20], carbs: [30, 60] },
  herb: { calo: [20, 50], protein: [2, 8], fat: [0, 2], carbs: [5, 15] },
  nut: { calo: [500, 700], protein: [15, 25], fat: [40, 70], carbs: [5, 20] },
  seafood: { calo: [100, 250], protein: [18, 30], fat: [1, 15], carbs: [0, 3] }
};

// Generate random nutritional values within realistic ranges
function generateNutrition(type: string) {
  const range = NUTRITIONAL_RANGES[type as keyof typeof NUTRITIONAL_RANGES] || NUTRITIONAL_RANGES.vegetable;
  
  return {
    caloPer100g: Math.round((Math.random() * (range.calo[1] - range.calo[0]) + range.calo[0]) * 10) / 10,
    proteinPer100g: Math.round((Math.random() * (range.protein[1] - range.protein[0]) + range.protein[0]) * 10) / 10,
    fatPer100g: Math.round((Math.random() * (range.fat[1] - range.fat[0]) + range.fat[0]) * 10) / 10,
    carbsPer100g: Math.round((Math.random() * (range.carbs[1] - range.carbs[0]) + range.carbs[0]) * 10) / 10,
    fiberPer100g: Math.round((Math.random() * 8 + 1) * 10) / 10, // 1-9g fiber
    sugarPer100g: Math.round((Math.random() * 15 + 0) * 10) / 10, // 0-15g sugar
  };
}

// Sample ingredient names by category
export const SAMPLE_INGREDIENTS = {
  meat: ['Chicken Breast', 'Beef Sirloin', 'Pork Tenderloin', 'Lamb Chop', 'Turkey Breast'],
  vegetable: ['Broccoli', 'Carrot', 'Spinach', 'Bell Pepper', 'Tomato', 'Cucumber'],
  fruit: ['Apple', 'Banana', 'Orange', 'Strawberry', 'Blueberry', 'Grape'],
  grain: ['Brown Rice', 'Quinoa', 'Oats', 'Whole Wheat Bread', 'Barley'],
  dairy: ['Milk', 'Greek Yogurt', 'Cheddar Cheese', 'Cottage Cheese', 'Butter'],
  spice: ['Black Pepper', 'Cumin', 'Paprika', 'Turmeric', 'Cinnamon'],
  herb: ['Basil', 'Oregano', 'Thyme', 'Parsley', 'Cilantro'],
  nut: ['Almond', 'Walnut', 'Cashew', 'Pecan', 'Pistachio'],
  seafood: ['Salmon', 'Tuna', 'Shrimp', 'Cod', 'Crab']
};

// Create realistic mock ingredients
export function createMockIngredient(overrides: Partial<IngredientDocument> = {}): Partial<IngredientDocument> {
  const type = overrides.type || INGREDIENT_TYPES[Math.floor(Math.random() * INGREDIENT_TYPES.length)];
  const names = SAMPLE_INGREDIENTS[type as keyof typeof SAMPLE_INGREDIENTS] || SAMPLE_INGREDIENTS.vegetable;
  const name = overrides.name || names[Math.floor(Math.random() * names.length)];
  const nutrition = generateNutrition(type);
  
  return {
    _id: new Types.ObjectId(),
    name,
    type,
    ...nutrition,
    belongsTo: overrides.belongsTo || undefined,
    createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000), // Random date within last 30 days
    updatedAt: new Date(),
    ...overrides,
  };
}

// Create multiple mock ingredients
export function createMockIngredients(count: number, type?: string): Partial<IngredientDocument>[] {
  return Array.from({ length: count }, () => createMockIngredient(type ? { type } : {}));
}

// Sample paginated results
export function createMockPaginatedResult(
  items: Partial<IngredientDocument>[], 
  page: number = 1, 
  limit: number = 10
) {
  return {
    items,
    total: items.length,
    page,
    limit,
    totalPages: Math.ceil(items.length / limit),
  };
}

// Sample user IDs for testing (24-character hex strings)
export const SAMPLE_USER_IDS = [
  new Types.ObjectId('507f1f77bcf86cd799439011'),
  new Types.ObjectId('507f1f77bcf86cd799439012'),
  new Types.ObjectId('507f1f77bcf86cd799439013'),
];

// Sample admin user
export const ADMIN_USER_ID = new Types.ObjectId('507f1f77bcf86cd799439000');

// Pre-generated sample data for consistent testing
export const SAMPLE_PUBLIC_INGREDIENTS = createMockIngredients(5).map(ingredient => ({
  ...ingredient,
  belongsTo: null, // Public ingredients
}));

export const SAMPLE_CUSTOM_INGREDIENTS = createMockIngredients(3).map(ingredient => ({
  ...ingredient,
  belongsTo: SAMPLE_USER_IDS[0], // Custom ingredients belong to a user
}));

export const SAMPLE_MIXED_INGREDIENTS = [
  ...SAMPLE_PUBLIC_INGREDIENTS,
  ...SAMPLE_CUSTOM_INGREDIENTS,
];

// Fixed test data for consistent testing
export const TEST_INGREDIENTS = {
  CHICKEN_BREAST: createMockIngredient({
    _id: new Types.ObjectId('507f1f77bcf86cd799439011'),
    name: 'Chicken Breast',
    type: 'meat',
    caloPer100g: 165,
    proteinPer100g: 31,
    fatPer100g: 3.6,
    carbsPer100g: 0,
    fiberPer100g: 0,
    sugarPer100g: 0,
    belongsTo: null,
  }),
  
  BROCOLI: createMockIngredient({
    _id: new Types.ObjectId('507f1f77bcf86cd799439012'),
    name: 'Broccoli',
    type: 'vegetable',
    caloPer100g: 34,
    proteinPer100g: 2.8,
    fatPer100g: 0.4,
    carbsPer100g: 6.6,
    fiberPer100g: 2.6,
    sugarPer100g: 1.5,
    belongsTo: null,
  }),
  
  CUSTOM_INGREDIENT: createMockIngredient({
    _id: new Types.ObjectId('507f1f77bcf86cd799439013'),
    name: 'My Custom Ingredient',
    type: 'vegetable',
    caloPer100g: 50,
    proteinPer100g: 3,
    fatPer100g: 1,
    carbsPer100g: 8,
    fiberPer100g: 2,
    sugarPer100g: 2,
    belongsTo: SAMPLE_USER_IDS[0],
  })
};
