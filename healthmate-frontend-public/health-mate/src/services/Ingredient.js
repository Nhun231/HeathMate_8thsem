import axios from '../api/axios';

const IngredientService = {
  list: async (params = {}) => {
    const res = await axios.get('/ingredients', { params });
    return res.data;
  },
};

export default IngredientService;


