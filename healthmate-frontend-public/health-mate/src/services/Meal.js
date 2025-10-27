import axios from '../api/axios';

// Add dish to meal
export const addDishToMeal = async (dishId, quantity, date, mealType) => {
  // Convert date to proper ISO format for backend
  const isoDate = new Date(date).toISOString();
  
  const res = await axios.post('/meals/dish', {
    dishId,
    quantity
  }, {
    params: { 
      date: isoDate, 
      mealType 
    }
  });
  return res.data;
};

// Add ingredient to meal
export const addIngredientToMeal = async (ingredientId, quantity, date, mealType) => {
  // Convert date to proper ISO format for backend
  const isoDate = new Date(date).toISOString();
  
  const res = await axios.post('/meals/ingredient', {
    ingredientId,
    quantity
  }, {
    params: { 
      date: isoDate, 
      mealType 
    }
  });
  return res.data;
};

// Get meals for a specific date
export const getMeals = async (date, mealType = null) => {
  // Convert date to proper ISO format for backend
  const isoDate = new Date(date).toISOString();
  
  const params = { date: isoDate };
  if (mealType) {
    params.mealType = mealType;
  }
  const res = await axios.get('/meals', { params });
  return res.data;
};

// Get meal summary for a date
export const getMealSummary = async (date) => {
  // Convert date to proper ISO format for backend
  const isoDate = new Date(date).toISOString();
  
  const res = await axios.get('/meals/summary', { 
    params: { date: isoDate } 
  });
  return res.data;
};
// Get meal summary by user ID and date
export const getMealSummaryByUserId = async (userId, date) => {
  const isoDate = new Date(date).toISOString();

  const res = await axios.get(`/meals/summary/${userId}`, {
    params: { date: isoDate },
  });
  return res.data;
};

// Update meal quantity
export const updateMeal = async (mealId, quantity) => {
  const res = await axios.patch(`/meals/${mealId}`, { quantity });
  return res.data;
};

// Update meal with new dish
export const updateMealWithDish = async (mealId, quantity, dishId) => {
  const res = await axios.patch(`/meals/${mealId}`, { quantity, dishId });
  return res.data;
};

// Delete meal
export const deleteMeal = async (mealId) => {
  await axios.delete(`/meals/${mealId}`);
};
