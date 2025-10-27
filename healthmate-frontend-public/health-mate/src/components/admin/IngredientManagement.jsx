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
  MenuItem as SelectMenuItem
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  MoreVert,
  Search,
  FilterList
} from '@mui/icons-material';
import {createIngredient, listCustomAndPublicIngredients, updateIngredient, deleteIngredient, getIngredientTypes} from "../../services/Ingredient.js";

const IngredientManagement = () => {
  const [ingredients, setIngredients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingIngredient, setEditingIngredient] = useState(null);
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [selectedIngredient, setSelectedIngredient] = useState(null);
  const [ingredientTypes, setIngredientTypes] = useState([]);
  const [newTypeDialogOpen, setNewTypeDialogOpen] = useState(false);
  const [newTypeName, setNewTypeName] = useState('');
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    caloPer100g: '',
    proteinPer100g: '',
    carbsPer100g: '',
    fatPer100g: '',
    fiberPer100g: '',
    sugarPer100g: '',
    type: '',
    isPublic: false
  });

  useEffect(() => {
    fetchIngredients();
    fetchIngredientTypes();
  }, [currentPage, itemsPerPage, searchQuery]);

  // Use ingredients directly since pagination is handled server-side
  const getCurrentPageIngredients = () => {
    return ingredients;
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleSearchSubmit = () => {
    setSearchQuery(searchTerm);
    setCurrentPage(1); // Reset to first page when searching
  };

  const handleSearchKeyPress = (event) => {
    if (event.key === 'Enter') {
      handleSearchSubmit();
    }
  };

  const handlePageChange = (event, page) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (event) => {
    setItemsPerPage(event.target.value);
    setCurrentPage(1); // Reset to first page when changing items per page
  };

  const fetchIngredients = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: itemsPerPage
      };
      
      if (searchQuery && searchQuery.trim()) {
        params.search = searchQuery.trim();
      }
      
      const response = await listCustomAndPublicIngredients(params);
      setIngredients(response.items || []);
      setTotalPages(response.totalPages || 1);
    } catch (error) {
      setError('Lỗi khi tải danh sách nguyên liệu: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchIngredientTypes = async () => {
    try {
      // Lấy danh sách loại nguyên liệu có sẵn để hiển thị trong dropdown
      // Không cần tạo bảng riêng cho ingredient types
      const types = await getIngredientTypes();
      setIngredientTypes(types || []);
    } catch (error) {
      console.error('Lỗi khi tải danh sách loại nguyên liệu:', error);
    }
  };

  const handleAddNewType = () => {
    if (newTypeName.trim()) {
      const newType = newTypeName.trim();
      
      // Chỉ lưu vào local state, không lưu vào database
      if (!ingredientTypes.includes(newType)) {
        setIngredientTypes([...ingredientTypes, newType].sort());
      }
      
      // Tự động chọn loại mới vừa tạo trong form
      setFormData({ ...formData, type: newType });
      
      // Reset và đóng dialog
      setNewTypeName('');
      setNewTypeDialogOpen(false);
    }
  };


  const handleOpenDialog = (ingredient = null) => {
    if (ingredient) {
      setEditingIngredient(ingredient);
      setFormData({
        name: ingredient.name || '',
        caloPer100g: ingredient.caloPer100g || '',
        proteinPer100g: ingredient.proteinPer100g || '',
        carbsPer100g: ingredient.carbsPer100g || '',
        fatPer100g: ingredient.fatPer100g || '',
        fiberPer100g: ingredient.fiberPer100g || '',
        sugarPer100g: ingredient.sugarPer100g || '',
        type: ingredient.type || '',
        isPublic: !ingredient.belongsTo || false
      });
    } else {
      setEditingIngredient(null);
      setFormData({
        name: '',
        caloPer100g: '',
        proteinPer100g: '',
        carbsPer100g: '',
        fatPer100g: '',
        fiberPer100g: '',
        sugarPer100g: '',
        type: '',
        isPublic: false
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingIngredient(null);
      setFormData({
        name: '',
        caloPer100g: '',
        proteinPer100g: '',
        carbsPer100g: '',
        fatPer100g: '',
        fiberPer100g: '',
        sugarPer100g: '',
        type: '',
        isPublic: false
      });
  };

  const handleSave = async () => {
    try {
      setError('');
      setSuccess('');

      // Convert string values to numbers for nutrition fields
      // Loại nguyên liệu (bao gồm loại mới từ local state) sẽ được lưu vào database cùng với nguyên liệu
      const dataToSend = {
        ...formData,
        caloPer100g: parseFloat(formData.caloPer100g) || 0,
        proteinPer100g: parseFloat(formData.proteinPer100g) || 0,
        carbsPer100g: parseFloat(formData.carbsPer100g) || 0,
        fatPer100g: parseFloat(formData.fatPer100g) || 0,
        fiberPer100g: parseFloat(formData.fiberPer100g) || 0,
        sugarPer100g: parseFloat(formData.sugarPer100g) || 0,
      };

      if (editingIngredient) {
        // Update existing ingredient
        await updateIngredient(editingIngredient._id, dataToSend);
        setSuccess('Cập nhật nguyên liệu thành công!');
      } else {
        // Create new ingredient
        await createIngredient(dataToSend);
        setSuccess('Tạo nguyên liệu mới thành công!');
      }

      handleCloseDialog();
      fetchIngredients();
    } catch (error) {
      setError('Lỗi khi lưu nguyên liệu: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleDelete = async (ingredientId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa nguyên liệu này?')) {
      try {
        await deleteIngredient(ingredientId);
        setSuccess('Xóa nguyên liệu thành công!');
        fetchIngredients();
      } catch (error) {
        setError('Lỗi khi xóa nguyên liệu: ' + (error.response?.data?.message || error.message));
      }
    }
  };

  const handleMenuClick = (event, ingredient) => {
    setMenuAnchor(event.currentTarget);
    setSelectedIngredient(ingredient);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
    setSelectedIngredient(null);
  };

  const formatNutrition = (value) => {
    return value ? `${value}g` : '--';
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#2E7D32' }}>
          Quản lý nguyên liệu
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpenDialog()}
          sx={{
            backgroundColor: '#4CAF50',
            '&:hover': { backgroundColor: '#2E7D32' }
          }}
        >
          Thêm nguyên liệu
        </Button>
      </Box>

      {/* Search and Filter */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <TextField
          label="Tìm kiếm nguyên liệu"
          value={searchTerm}
          onChange={handleSearchChange}
          onKeyPress={handleSearchKeyPress}
          sx={{ minWidth: 300 }}
          InputProps={{
            startAdornment: <Search sx={{ mr: 1, color: '#666' }} />
          }}
        />
        <Button
          variant="contained"
          onClick={handleSearchSubmit}
          sx={{ backgroundColor: '#4CAF50', '&:hover': { backgroundColor: '#2E7D32' } }}
        >
          Tìm kiếm
        </Button>
        <Button
          variant="outlined"
          startIcon={<FilterList />}
          onClick={() => {
            setSearchTerm('');
            setSearchQuery('');
            setCurrentPage(1);
          }}
        >
          Xóa bộ lọc
        </Button>
      </Box>

      {/* Alerts */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      {/* Ingredients Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#E8F5E9' }}>
              <TableCell><strong>Tên nguyên liệu</strong></TableCell>
              <TableCell><strong>Loại</strong></TableCell>
              <TableCell><strong>Calories</strong></TableCell>
              <TableCell><strong>Đạm</strong></TableCell>
              <TableCell><strong>Tinh bột</strong></TableCell>
              <TableCell><strong>Chất béo</strong></TableCell>
              <TableCell><strong>Xơ</strong></TableCell>
              <TableCell><strong>Đường</strong></TableCell>
              <TableCell><strong>Hành động</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {getCurrentPageIngredients().map((ingredient) => (
              <TableRow key={ingredient._id} hover>
                <TableCell>
                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                    {ingredient.name}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip 
                    label={ingredient.type || 'Chưa phân loại'} 
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                </TableCell>
                <TableCell>{formatNutrition(ingredient.caloPer100g)}</TableCell>
                <TableCell>{formatNutrition(ingredient.proteinPer100g)}</TableCell>
                <TableCell>{formatNutrition(ingredient.carbsPer100g)}</TableCell>
                <TableCell>{formatNutrition(ingredient.fatPer100g)}</TableCell>
                <TableCell>{formatNutrition(ingredient.fiberPer100g)}</TableCell>
                <TableCell>{formatNutrition(ingredient.sugarPer100g)}</TableCell>
                <TableCell>
                  <IconButton
                    onClick={(e) => handleMenuClick(e, ingredient)}
                    size="small"
                  >
                    <MoreVert />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {ingredients.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="h6" sx={{ color: '#666' }}>
            {searchQuery ? 'Không tìm thấy nguyên liệu nào' : 'Chưa có nguyên liệu nào'}
          </Typography>
        </Box>
      )}

      {/* Pagination Controls */}
      {ingredients.length > 0 && (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 3, flexWrap: 'wrap', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="body2" sx={{ color: '#666' }}>
              Hiển thị {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, ingredients.length)} trong tổng số {ingredients.length} nguyên liệu
            </Typography>
            <FormControl size="small" sx={{ minWidth: 80 }}>
              <InputLabel>Hiển thị</InputLabel>
              <Select
                value={itemsPerPage}
                onChange={handleItemsPerPageChange}
                label="Hiển thị"
              >
                <SelectMenuItem value={5}>5</SelectMenuItem>
                <SelectMenuItem value={10}>10</SelectMenuItem>
                <SelectMenuItem value={20}>20</SelectMenuItem>
                <SelectMenuItem value={50}>50</SelectMenuItem>
              </Select>
            </FormControl>
          </Box>
          
          <Pagination
            count={totalPages}
            page={currentPage}
            onChange={handlePageChange}
            color="primary"
            showFirstButton
            showLastButton
            size="large"
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
          handleOpenDialog(selectedIngredient);
          handleMenuClose();
        }}>
          <Edit sx={{ mr: 1 }} />
          Chỉnh sửa
        </MenuItem>
        <MenuItem 
          onClick={() => {
            handleDelete(selectedIngredient?._id);
            handleMenuClose();
          }}
          sx={{ color: 'error.main' }}
        >
          <Delete sx={{ mr: 1 }} />
          Xóa
        </MenuItem>
      </Menu>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingIngredient ? 'Chỉnh sửa nguyên liệu' : 'Thêm nguyên liệu mới'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mt: 2 }}>
            <TextField
              label="Tên nguyên liệu"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              fullWidth
              required
            />
            <FormControl fullWidth required>
              <InputLabel>Loại</InputLabel>
              <Select
                value={formData.type}
                onChange={(e) => {
                  if (e.target.value === '__add_new__') {
                    setNewTypeDialogOpen(true);
                  } else {
                    setFormData({ ...formData, type: e.target.value });
                  }
                }}
                label="Loại"
              >
                {ingredientTypes.map((type) => (
                  <SelectMenuItem key={type} value={type}>
                    {type}
                  </SelectMenuItem>
                ))}
                <SelectMenuItem 
                  value="__add_new__"
                  sx={{ fontStyle: 'italic', color: 'primary.main' }}
                >
                  + Thêm loại mới
                </SelectMenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Calories (kcal)"
              type="number"
              value={formData.caloPer100g}
              onChange={(e) => setFormData({ ...formData, caloPer100g: e.target.value })}
              fullWidth
              required
            />
            <TextField
              label="Protein (g)"
              type="number"
              value={formData.proteinPer100g}
              onChange={(e) => setFormData({ ...formData, proteinPer100g: e.target.value })}
              fullWidth
            />
            <TextField
              label="Carbs (g)"
              type="number"
              value={formData.carbsPer100g}
              onChange={(e) => setFormData({ ...formData, carbsPer100g: e.target.value })}
              fullWidth
            />
            <TextField
              label="Fat (g)"
              type="number"
              value={formData.fatPer100g}
              onChange={(e) => setFormData({ ...formData, fatPer100g: e.target.value })}
              fullWidth
            />
            <TextField
              label="Fiber (g)"
              type="number"
              value={formData.fiberPer100g}
              onChange={(e) => setFormData({ ...formData, fiberPer100g: e.target.value })}
              fullWidth
            />
            <TextField
              label="Sugar (g)"
              type="number"
              value={formData.sugarPer100g}
              onChange={(e) => setFormData({ ...formData, sugarPer100g: e.target.value })}
              fullWidth
            />
            <FormControl fullWidth>
              <InputLabel>Loại công khai</InputLabel>
              <Select
                value={formData.isPublic}
                onChange={(e) => setFormData({ ...formData, isPublic: e.target.value })}
                label="Loại công khai"
              >
                <SelectMenuItem value={false}>Nguyên liệu cá nhân</SelectMenuItem>
                <SelectMenuItem value={true}>Nguyên liệu công khai</SelectMenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Hủy</Button>
          <Button 
            onClick={handleSave} 
            variant="contained"
            sx={{ backgroundColor: '#4CAF50', '&:hover': { backgroundColor: '#2E7D32' } }}
          >
            {editingIngredient ? 'Cập nhật' : 'Tạo mới'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add New Type Dialog */}
      <Dialog open={newTypeDialogOpen} onClose={() => setNewTypeDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Thêm loại nguyên liệu mới</DialogTitle>
        <DialogContent>
          <TextField
            label="Tên loại nguyên liệu"
            value={newTypeName}
            onChange={(e) => setNewTypeName(e.target.value)}
            fullWidth
            sx={{ mt: 2 }}
            placeholder="Nhập tên loại nguyên liệu mới..."
            helperText="Loại mới sẽ hiển thị trong dropdown và được chọn tự động"
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleAddNewType();
              }
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNewTypeDialogOpen(false)}>Hủy</Button>
          <Button 
            onClick={handleAddNewType} 
            variant="contained"
            disabled={!newTypeName.trim()}
            sx={{ backgroundColor: '#4CAF50', '&:hover': { backgroundColor: '#2E7D32' } }}
          >
            Thêm
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default IngredientManagement;

