import axios from '../api/axios';

const DishService = {
  list: async (params = {}) => {
    const res = await axios.get('/dishes', { params });
    return res.data;
  },
  get: async (dishId) => {
    const res = await axios.get(`/dishes/${dishId}`);
    return res.data;
  },
  create: async (payload) => {
    const res = await axios.post('/dishes', payload);
    return res.data;
  },
  update: async (dishId, payload) => {
    const res = await axios.patch(`/dishes/${dishId}`, payload);
    return res.data;
  },
  remove: async (dishId) => {
    await axios.delete(`/dishes/${dishId}`);
  },
};

export default DishService;


