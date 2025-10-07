import axios from '../api/axios';

const IngredientService = {
  list: async (params = {}) => {
    try {
      // Get all ingredients first (no pagination on backend, no search on backend)
      const [publicIngredients, customIngredients] = await Promise.all([
        // Get all public ingredients
        axios.get('/ingredients', { 
          params: { 
            ...params,
            publicOnly: true,
            limit: 1000, // Get all public ingredients
            page: 1,
            search: undefined // Remove search from backend call
          } 
        }),
        // Get all user's custom ingredients
        axios.get('/ingredients/my-ingredients', { 
          params: {
            ...params,
            limit: 1000, // Get all custom ingredients
            page: 1,
            search: undefined // Remove search from backend call
          }
        })
      ]);

      // Combine the results
      const combinedItems = [
        ...(publicIngredients.data.items || []),
        ...(customIngredients.data.items || [])
      ];

      // Remove duplicates based on _id
      const uniqueItems = combinedItems.filter((item, index, self) => 
        index === self.findIndex(t => t._id === item._id)
      );

      // Apply client-side search if search query exists
      let filteredItems = uniqueItems;
      if (params.search) {
        const searchTerm = params.search.toLowerCase().trim();
        filteredItems = uniqueItems.filter(item => 
          item.name.toLowerCase().includes(searchTerm) ||
          item.type.toLowerCase().includes(searchTerm)
        );
      }

      // Apply client-side pagination
      const limit = params.limit || 20;
      const page = params.page || 1;
      const totalItems = filteredItems.length;
      const totalPages = Math.ceil(totalItems / limit);

      // Apply pagination
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedItems = filteredItems.slice(startIndex, endIndex);

      // Calculate counts for summary
      const totalPublicCount = publicIngredients.data.items?.length || 0;
      const totalCustomCount = customIngredients.data.items?.length || 0;
      const filteredPublicCount = filteredItems.filter(item => !item.belongsTo).length;
      const filteredCustomCount = filteredItems.filter(item => item.belongsTo).length;

      console.log(`Combined ingredients: ${uniqueItems.length} total (${totalPublicCount} public + ${totalCustomCount} custom), filtered: ${filteredItems.length} (${filteredPublicCount} public + ${filteredCustomCount} custom), showing page ${page}/${totalPages}`);

      return {
        items: paginatedItems,
        total: totalItems,
        page: page,
        limit: limit,
        totalPages: totalPages,
        // Add summary counts
        summary: {
          total: filteredItems.length,
          public: filteredPublicCount,
          custom: filteredCustomCount,
          totalPublic: totalPublicCount,
          totalCustom: totalCustomCount
        }
      };
    } catch (error) {
      console.error('Error fetching combined ingredients:', error);
      throw error;
    }
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


