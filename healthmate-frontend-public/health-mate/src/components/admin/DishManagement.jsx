import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip,
  Alert,
  CircularProgress,
  Menu,
  MenuItem,
  Pagination,
  FormControl,
  InputLabel,
  Select,
  MenuItem as SelectMenuItem,
  Grid,
  Card,
  CardContent,
  Divider,
  Autocomplete
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  MoreVert,
  Search,
  FilterList,
  Restaurant,
  Visibility
} from '@mui/icons-material';
import { 
  listDishes, 
  createDish, 
  updateDish, 
  deleteDish, 
  getDish 
} from "../../services/Dish.js";
import { listCustomAndPublicIngredients } from "../../services/Ingredient.js";

const DishManagement = () => {
  const [dishes, setDishes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingDish, setEditingDish] = useState(null);
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [selectedDish, setSelectedDish] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [limit] = useState(10);
  const [typeFilter, setTypeFilter] = useState('');
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [viewingDish, setViewingDish] = useState(null);
  
  // Form data
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: '',
    servings: 1,
    ingredients: []
  });
  
  // Available ingredients for autocomplete
  const [availableIngredients, setAvailableIngredients] = useState([]);
  const [ingredientsLoading, setIngredientsLoading] = useState(false);

  // Load dishes
  const loadDishes = async () => {
    try {
      setLoading(true);
      const params = {
        page,
        limit,
        ...(searchQuery && { search: searchQuery }),
        ...(typeFilter && { type: typeFilter }),
        publicOnly: true // Only show public dishes
      };
      
      const response = await listDishes(params);
      setDishes(response.items || []);
      setTotalPages(response.totalPages || 1);
      setTotalItems(response.total || 0);
    } catch (err) {
      console.error('Error loading dishes:', err);
      setError('Không thể tải danh sách món ăn');
    } finally {
      setLoading(false);
    }
  };

  // Load available ingredients
  const loadIngredients = async () => {
    try {
      setIngredientsLoading(true);
      const response = await listCustomAndPublicIngredients({ limit: 1000 });
      setAvailableIngredients(response.items || []);
    } catch (err) {
      console.error('Error loading ingredients:', err);
    } finally {
      setIngredientsLoading(false);
    }
  };

  useEffect(() => {
    loadDishes();
  }, [page, searchQuery, typeFilter]);

  useEffect(() => {
    loadIngredients();
  }, []);

  // Search handler
  const handleSearch = () => {
    setSearchQuery(searchTerm);
    setPage(1);
  };

  // Clear search
  const handleClearSearch = () => {
    setSearchTerm('');
    setSearchQuery('');
    setPage(1);
  };

  // Open create dialog
  const handleCreate = () => {
    setEditingDish(null);
    setFormData({
      name: '',
      description: '',
      type: '',
      servings: 1,
      ingredients: []
    });
    setDialogOpen(true);
  };

  // Open edit dialog
  const handleEdit = async (dish) => {
    try {
      const dishDetails = await getDish(dish._id);
      setEditingDish(dishDetails);
      setFormData({
        name: dishDetails.name,
        description: dishDetails.description,
        type: dishDetails.type,
        servings: dishDetails.servings,
        ingredients: dishDetails.ingredients || []
      });
      setDialogOpen(true);
    } catch (err) {
      console.error('Error loading dish details:', err);
      setError('Không thể tải thông tin món ăn');
    }
  };

  // Open view dialog
  const handleView = async (dish) => {
    try {
      const dishDetails = await getDish(dish._id);
      setViewingDish(dishDetails);
      setViewDialogOpen(true);
    } catch (err) {
      console.error('Error loading dish details:', err);
      setError('Không thể tải thông tin món ăn');
    }
  };

  // Handle form input change
  const handleInputChange = (field) => (event) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  // Add ingredient
  const addIngredient = (ingredient) => {
    if (!ingredient || !ingredient._id) return;
    
    if (!formData.ingredients.find(ing => ing.ingredient && ing.ingredient._id === ingredient._id)) {
      setFormData(prev => ({
        ...prev,
        ingredients: [...prev.ingredients, {
          ingredient: ingredient._id,
          amount: 100,
          unit: 'g'
        }]
      }));
    }
  };

  // Remove ingredient
  const removeIngredient = (ingredientId) => {
    setFormData(prev => ({
      ...prev,
      ingredients: prev.ingredients.filter(ing => ing.ingredient !== ingredientId)
    }));
  };

  // Update ingredient amount
  const updateIngredientAmount = (ingredientId, newAmount) => {
    setFormData(prev => ({
      ...prev,
      ingredients: prev.ingredients.map(ing => 
        ing.ingredient === ingredientId 
          ? { ...ing, amount: Number(newAmount) }
          : ing
      )
    }));
  };

  // Calculate total ingredient weight
  const calculateTotalWeight = () => {
    return formData.ingredients.reduce((total, ing) => {
      return total + (ing.amount || 0);
    }, 0);
  };

  // Calculate nutrition
  const calculateNutrition = () => {
    return formData.ingredients.reduce((totals, ing) => {
      const ingredient = availableIngredients.find(ingItem => ingItem._id === ing.ingredient);
      if (!ingredient) return totals;
      
      const factor = ing.amount / 100;
      return {
        calories: totals.calories + ((ingredient.caloPer100g || 0) * factor),
        protein: totals.protein + ((ingredient.proteinPer100g || 0) * factor),
        fat: totals.fat + ((ingredient.fatPer100g || 0) * factor),
        carbs: totals.carbs + ((ingredient.carbsPer100g || 0) * factor),
        fiber: totals.fiber + ((ingredient.fiberPer100g || 0) * factor),
        sugar: totals.sugar + ((ingredient.sugarPer100g || 0) * factor),
      };
    }, { calories: 0, protein: 0, fat: 0, carbs: 0, fiber: 0, sugar: 0 });
  };

  // Save dish
  const handleSave = async () => {
    try {
      if (!formData.name || !formData.description || !formData.type || formData.ingredients.length === 0) {
        setError('Vui lòng điền đầy đủ thông tin');
        return;
      }

      const dishData = {
        name: formData.name,
        description: formData.description,
        type: formData.type,
        servings: formData.servings,
        ingredients: formData.ingredients.map(ing => ({
          ingredient: ing.ingredient,
          amount: ing.amount,
          unit: ing.unit || 'g'
        }))
      };

      if (editingDish) {
        await updateDish(editingDish._id, dishData);
        setSuccess('Cập nhật món ăn thành công!');
      } else {
        await createDish(dishData);
        setSuccess('Tạo món ăn thành công!');
      }

      setDialogOpen(false);
      loadDishes();
    } catch (err) {
      console.error('Error saving dish:', err);
      setError('Không thể lưu món ăn');
    }
  };

  // Delete dish
  const handleDelete = async (dish) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa món ăn "${dish.name}"?`)) {
      return;
    }

    try {
      await deleteDish(dish._id);
      setSuccess('Xóa món ăn thành công!');
      loadDishes();
    } catch (err) {
      console.error('Error deleting dish:', err);
      setError('Không thể xóa món ăn');
    }
  };

  // Menu handlers
  const handleMenuOpen = (event, dish) => {
    setMenuAnchor(event.currentTarget);
    setSelectedDish(dish);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
    setSelectedDish(null);
  };

  const nutrition = calculateNutrition();
  const totalWeight = calculateTotalWeight();

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#4CAF50' }}>
          Quản lý món ăn
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleCreate}
          sx={{
            bgcolor: '#4CAF50',
            '&:hover': { bgcolor: '#45a049' }
          }}
        >
          Thêm món ăn mới
        </Button>
      </Box>

      {/* Alerts */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      {/* Search and Filter */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, alignItems: 'center' }}>
        <TextField
          placeholder="Tìm kiếm món ăn..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          InputProps={{
            startAdornment: <Search sx={{ mr: 1, color: '#999' }} />
          }}
          sx={{ flexGrow: 1 }}
        />
        <FormControl sx={{ minWidth: 150 }}>
          <InputLabel>Loại món ăn</InputLabel>
          <Select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            label="Loại món ăn"
          >
            <SelectMenuItem value="">Tất cả</SelectMenuItem>
            <SelectMenuItem value="Bữa sáng">Bữa sáng</SelectMenuItem>
            <SelectMenuItem value="Bữa trưa">Bữa trưa</SelectMenuItem>
            <SelectMenuItem value="Bữa tối">Bữa tối</SelectMenuItem>
            <SelectMenuItem value="Ăn vặt">Ăn vặt</SelectMenuItem>
          </Select>
        </FormControl>
        <Button variant="outlined" onClick={handleSearch}>
          Tìm kiếm
        </Button>
        {(searchQuery || typeFilter) && (
          <Button variant="text" onClick={handleClearSearch}>
            Xóa bộ lọc
          </Button>
        )}
      </Box>

      {/* Stats */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <Card sx={{ flex: 1 }}>
          <CardContent>
            <Typography variant="h6" sx={{ color: '#4CAF50', fontWeight: 'bold' }}>
              {totalItems}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Tổng số món ăn
            </Typography>
          </CardContent>
        </Card>
        <Card sx={{ flex: 1 }}>
          <CardContent>
            <Typography variant="h6" sx={{ color: '#2196F3', fontWeight: 'bold' }}>
              {dishes.length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Món ăn công khai
            </Typography>
          </CardContent>
        </Card>
      </Box>

      {/* Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Tên món ăn</TableCell>
              <TableCell>Loại</TableCell>
              <TableCell>Số phần</TableCell>
              <TableCell>Calories</TableCell>
              <TableCell>Số nguyên liệu</TableCell>
              <TableCell align="center">Thao tác</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : dishes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <Typography variant="body2" color="text.secondary">
                    Không có món ăn nào
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              dishes.map((dish) => (
                <TableRow key={dish._id}>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Restaurant sx={{ color: '#4CAF50' }} />
                      <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                        {dish.name}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>{dish.type}</TableCell>
                  <TableCell>{dish.servings}</TableCell>
                  <TableCell>{Math.round(dish.totalCalories || 0)}</TableCell>
                  <TableCell>{dish.ingredients?.length || 0}</TableCell>
                  <TableCell align="center">
                    <IconButton
                      size="small"
                      onClick={() => handleView(dish)}
                      sx={{ color: '#2196F3' }}
                    >
                      <Visibility />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleEdit(dish)}
                      sx={{ color: '#4CAF50' }}
                    >
                      <Edit />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={(e) => handleMenuOpen(e, dish)}
                      sx={{ color: '#666' }}
                    >
                      <MoreVert />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      {totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={(e, newPage) => setPage(newPage)}
            color="primary"
          />
        </Box>
      )}

      {/* Action Menu */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => {
          handleDelete(selectedDish);
          handleMenuClose();
        }}>
          <Delete sx={{ mr: 1 }} />
          Xóa
        </MenuItem>
      </Menu>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingDish ? 'Chỉnh sửa món ăn' : 'Tạo món ăn mới'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            {/* Basic Info */}
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ mb: 2, color: '#4CAF50' }}>
                Thông tin cơ bản
              </Typography>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Tên món ăn"
                value={formData.name}
                onChange={handleInputChange('name')}
                required
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel>Loại món ăn</InputLabel>
                <Select
                  value={formData.type}
                  onChange={handleInputChange('type')}
                  label="Loại món ăn"
                >
                  <SelectMenuItem value="Bữa sáng">Bữa sáng</SelectMenuItem>
                  <SelectMenuItem value="Bữa trưa">Bữa trưa</SelectMenuItem>
                  <SelectMenuItem value="Bữa tối">Bữa tối</SelectMenuItem>
                  <SelectMenuItem value="Ăn vặt">Ăn vặt</SelectMenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Mô tả"
                value={formData.description}
                onChange={handleInputChange('description')}
                multiline
                rows={2}
                required
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Số phần ăn"
                type="number"
                value={formData.servings}
                onChange={handleInputChange('servings')}
                inputProps={{ min: 1 }}
                required
              />
            </Grid>

            {/* Ingredients */}
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" sx={{ mb: 2, color: '#4CAF50' }}>
                Nguyên liệu ({formData.ingredients.length})
              </Typography>
            </Grid>

            <Grid item xs={12}>
              <Autocomplete
                options={availableIngredients}
                getOptionLabel={(option) => option.name}
                loading={ingredientsLoading}
                onChange={(event, value) => {
                  if (value) addIngredient(value);
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Thêm nguyên liệu"
                    placeholder="Tìm và chọn nguyên liệu"
                  />
                )}
              />
            </Grid>

            {/* Selected Ingredients */}
            {formData.ingredients.length > 0 && (
              <Grid item xs={12}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  Nguyên liệu đã chọn:
                </Typography>
                {formData.ingredients.map((ing, index) => {
                  const ingredient = availableIngredients.find(ingItem => ingItem._id === ing.ingredient);
                  return (
                    <Card key={index} sx={{ mb: 1 }}>
                      <CardContent sx={{ py: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                              {ingredient?.name || 'Unknown'}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {Math.round((ingredient?.caloPer100g || 0) * ing.amount / 100)} kcal
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <TextField
                              type="number"
                              value={ing.amount}
                              onChange={(e) => updateIngredientAmount(ing.ingredient, Number(e.target.value))}
                              size="small"
                              sx={{ width: 80 }}
                              inputProps={{ min: 1 }}
                            />
                            <Typography variant="caption">g</Typography>
                            <IconButton
                              size="small"
                              onClick={() => removeIngredient(ing.ingredient)}
                              sx={{ color: '#f44336' }}
                            >
                              <Delete />
                            </IconButton>
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  );
                })}
              </Grid>
            )}

            {/* Nutrition Summary */}
            {formData.ingredients.length > 0 && (
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" sx={{ mb: 2, color: '#4CAF50' }}>
                  Thông tin dinh dưỡng
                </Typography>
                <Card sx={{ bgcolor: '#E8F5E9' }}>
                  <CardContent>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Typography variant="h4" sx={{ color: '#4CAF50', fontWeight: 'bold' }}>
                          {Math.round(nutrition.calories)}
                        </Typography>
                        <Typography variant="caption">Calories</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                          <Typography variant="body2">
                            Đạm: {nutrition.protein.toFixed(1)}g
                          </Typography>
                          <Typography variant="body2">
                            Béo: {nutrition.fat.toFixed(1)}g
                          </Typography>
                          <Typography variant="body2">
                            Tinh bột: {nutrition.carbs.toFixed(1)}g
                          </Typography>
                          <Typography variant="body2">
                            Chất xơ: {nutrition.fiber.toFixed(1)}g
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={12}>
                        <Typography variant="body2" sx={{ color: '#666' }}>
                          Tổng trọng lượng: {totalWeight}g
                        </Typography>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>
            Hủy
          </Button>
          <Button
            onClick={handleSave}
            variant="contained"
            sx={{
              bgcolor: '#4CAF50',
              '&:hover': { bgcolor: '#45a049' }
            }}
          >
            {editingDish ? 'Cập nhật' : 'Tạo món ăn'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={viewDialogOpen} onClose={() => setViewDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          Chi tiết món ăn: {viewingDish?.name}
        </DialogTitle>
        <DialogContent>
          {viewingDish && (
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="h6" sx={{ mb: 2, color: '#4CAF50' }}>
                  Thông tin cơ bản
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="body2" color="text.secondary">Tên món ăn:</Typography>
                    <Typography variant="body1">{viewingDish.name}</Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="body2" color="text.secondary">Loại:</Typography>
                    <Typography variant="body1">{viewingDish.type}</Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="body2" color="text.secondary">Số phần:</Typography>
                    <Typography variant="body1">{viewingDish.servings}</Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary">Mô tả:</Typography>
                    <Typography variant="body1">{viewingDish.description}</Typography>
                  </Grid>
                </Grid>
              </Grid>

              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" sx={{ mb: 2, color: '#4CAF50' }}>
                  Thông tin dinh dưỡng
                </Typography>
                <Card sx={{ bgcolor: '#E8F5E9' }}>
                  <CardContent>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Typography variant="h4" sx={{ color: '#4CAF50', fontWeight: 'bold' }}>
                          {Math.round(viewingDish.totalCalories || 0)}
                        </Typography>
                        <Typography variant="caption">Calories</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                          <Typography variant="body2">
                            Đạm: {(viewingDish.totalProtein || 0).toFixed(1)}g
                          </Typography>
                          <Typography variant="body2">
                            Béo: {(viewingDish.totalFat || 0).toFixed(1)}g
                          </Typography>
                          <Typography variant="body2">
                            Tinh bột: {(viewingDish.totalCarbs || 0).toFixed(1)}g
                          </Typography>
                          <Typography variant="body2">
                            Chất xơ: {(viewingDish.totalFiber || 0).toFixed(1)}g
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={12}>
                        <Typography variant="body2" sx={{ color: '#666' }}>
                          Tổng trọng lượng: {viewingDish.totalIngredientWeight || 0}g
                        </Typography>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" sx={{ mb: 2, color: '#4CAF50' }}>
                  Nguyên liệu ({viewingDish.ingredients?.length || 0})
                </Typography>
                {viewingDish.ingredients?.map((ing, index) => (
                  <Card key={index} sx={{ mb: 1 }}>
                    <CardContent sx={{ py: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                            {ing.ingredient?.name || 'Unknown'}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {Math.round((ing.ingredient?.caloPer100g || 0) * ing.amount / 100)} kcal
                          </Typography>
                        </Box>
                        <Typography variant="body2">
                          {ing.amount}g
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                ))}
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialogOpen(false)}>
            Đóng
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DishManagement;
