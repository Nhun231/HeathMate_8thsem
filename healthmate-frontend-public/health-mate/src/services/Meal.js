import axios from '../api/axios';

const MealService = {
  // Add dish to meal
  addDishToMeal: async (dishId, quantity, date, mealType) => {
    const res = await axios.post('/meals/dish', {
      dishId,
      quantity
    }, {
      params: { date, mealType }
    });
    return res.data;
  },

  // Add ingredient to meal
  addIngredientToMeal: async (ingredientId, quantity, date, mealType) => {
    const res = await axios.post('/meals/ingredient', {
      ingredientId,
      quantity
    }, {
      params: { date, mealType }
    });
    return res.data;
  },

  // Get meals for a specific date
  getMeals: async (date, mealType = null) => {
    const params = { date };
    if (mealType) {
      params.mealType = mealType;
    }
    const res = await axios.get('/meals', { params });
    return res.data;
  },

  // Get meal summary for a date
  getMealSummary: async (date) => {
    const res = await axios.get('/meals/summary', { 
      params: { date } 
    });
    return res.data;
  },

  // Update meal quantity
  updateMeal: async (mealId, quantity) => {
    const res = await axios.patch(`/meals/${mealId}`, { quantity });
    return res.data;
  },

  // Delete meal
  deleteMeal: async (mealId) => {
    await axios.delete(`/meals/${mealId}`);
  },
};

export default MealService;
