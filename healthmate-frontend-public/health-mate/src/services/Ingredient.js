import axios from '../api/axios';

const IngredientService = {
  list: async (params = {}) => {
    const res = await axios.get('/ingredients', { params });
    return res.data;
  },
  search: async (query, params = {}) => {
    const res = await axios.get('/ingredients', {
      params: { 
        ...params,
        search: query 
      } 
    });
    return res.data;
  },
  
  // Create custom ingredient
  create: async (ingredientData) => {
    const res = await axios.post('/ingredients', ingredientData);
    return res.data;
  },
  
  // Update custom ingredient
  update: async (ingredientId, ingredientData) => {
    const res = await axios.patch(`/ingredients/${ingredientId}`, ingredientData);
    return res.data;
  },
  
  // Delete custom ingredient
  delete: async (ingredientId) => {
    await axios.delete(`/ingredients/${ingredientId}`);
  },
  
  // Get ingredient by ID
  getById: async (ingredientId) => {
    const res = await axios.get(`/ingredients/${ingredientId}`);
    return res.data;
  },
  
  // Get user's custom ingredients
  getMyIngredients: async (params = {}) => {
    const res = await axios.get('/ingredients/my-ingredients', { params });
    return res.data;
  },
};

export default IngredientService;


