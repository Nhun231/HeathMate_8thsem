import axios from '../api/axios';

// Get all dishes with pagination and filtering
export const listDishes = async (params = {}) => {
  const res = await axios.get('/dishes', { params });
  return res.data;
};

// Get a specific dish by ID
export const getDish = async (dishId) => {
  const res = await axios.get(`/dishes/${dishId}`);
  return res.data;
};

// Create a new custom dish
export const createDish = async (dishData) => {
  const res = await axios.post('/dishes', dishData);
  return res.data;
};

// Update an existing dish
export const updateDish = async (dishId, dishData) => {
  const res = await axios.patch(`/dishes/${dishId}`, dishData);
  return res.data;
};

// Delete a dish
export const deleteDish = async (dishId) => {
  await axios.delete(`/dishes/${dishId}`);
};

// Search dishes
export const searchDishes = async (query, params = {}) => {
  const res = await axios.get('/dishes', { 
    params: { 
      ...params,
      search: query 
    } 
  });
  return res.data;
};


