import axios from '../api/axios';

const DishService = {
  // Get all dishes with pagination and filtering
  list: async (params = {}) => {
    const res = await axios.get('/dishes', { params });
    return res.data;
  },
  
  // Get a specific dish by ID
  get: async (dishId) => {
    const res = await axios.get(`/dishes/${dishId}`);
    return res.data;
  },
  
  // Create a new custom dish
  create: async (dishData) => {
    const res = await axios.post('/dishes', dishData);
    return res.data;
  },
  
  // Update an existing dish
  update: async (dishId, dishData) => {
    const res = await axios.patch(`/dishes/${dishId}`, dishData);
    return res.data;
  },
  
  // Delete a dish
  remove: async (dishId) => {
    await axios.delete(`/dishes/${dishId}`);
  },
  
  // Search dishes
  search: async (query, params = {}) => {
    const res = await axios.get('/dishes', { 
      params: { 
        ...params,
        search: query 
      } 
    });
    return res.data;
  },
};

export default DishService;


