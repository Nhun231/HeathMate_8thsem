"use client"
import { useState, useEffect } from "react"
import { 
  Box, 
  Typography, 
  Button, 
  Avatar, 
  CircularProgress, 
  Alert, 
  Pagination,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from "@mui/material"
import { 
  Add as AddIcon, 
  Edit as EditIcon, 
  Delete as DeleteIcon,
  Restaurant as RestaurantIcon
} from "@mui/icons-material"
import IngredientService from "../../services/Ingredient"
import CustomIngredientModal from "./CustomIngredientModal"

function CustomIngredientsTab({ searchQuery, onAddIngredient, mealType, selectedDate, onClose }) {
  const [ingredients, setIngredients] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedIngredient, setSelectedIngredient] = useState(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [ingredientToDelete, setIngredientToDelete] = useState(null)
  const [alert, setAlert] = useState({ show: false, message: "", severity: "info" })

  // Fetch custom ingredients (belongsTo current user)
  useEffect(() => {
    const fetchCustomIngredients = async () => {
      setLoading(true)
      setError(null)
      try {
        const params = {
          page,
          limit: 20
        }
        
        if (searchQuery) {
          params.search = searchQuery
        }
        
        const response = await IngredientService.getMyIngredients(params)
        
        setIngredients(response.items || [])
        setTotalPages(response.totalPages || 1)
        
      } catch (err) {
        console.error('Error fetching custom ingredients:', err)
        const errorMessage = err.response?.data?.message || err.message || 'Không thể tải danh sách nguyên liệu tùy chỉnh'
        setError(errorMessage)
      } finally {
        setLoading(false)
      }
    }

    fetchCustomIngredients()
  }, [searchQuery, page])

  const handleCreateNew = () => {
    setSelectedIngredient(null)
    setModalOpen(true)
  }

  const handleEdit = (ingredient) => {
    setSelectedIngredient(ingredient)
    setModalOpen(true)
  }

  const handleDelete = (ingredient) => {
    setIngredientToDelete(ingredient)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!ingredientToDelete) return
    
    setLoading(true)
    try {
      await IngredientService.delete(ingredientToDelete._id)
      
      // Remove from local state
      setIngredients(prev => prev.filter(ing => ing._id !== ingredientToDelete._id))
      
      setAlert({
        show: true,
        message: "Xóa nguyên liệu thành công!",
        severity: "success"
      })
      
      setTimeout(() => setAlert({ ...alert, show: false }), 3000)
      
    } catch (err) {
      console.error('Error deleting ingredient:', err)
      setAlert({
        show: true,
        message: "Có lỗi xảy ra khi xóa nguyên liệu",
        severity: "error"
      })
    } finally {
      setLoading(false)
      setDeleteDialogOpen(false)
      setIngredientToDelete(null)
    }
  }

  const handleModalSave = (savedIngredient) => {
    if (selectedIngredient) {
      // Update existing ingredient
      setIngredients(prev => 
        prev.map(ing => ing._id === savedIngredient._id ? savedIngredient : ing)
      )
    } else {
      // Add new ingredient
      setIngredients(prev => [savedIngredient, ...prev])
    }
    
    setAlert({
      show: true,
      message: selectedIngredient ? "Cập nhật thành công!" : "Tạo mới thành công!",
      severity: "success"
    })
    
    setTimeout(() => setAlert({ ...alert, show: false }), 3000)
  }

  const handleAddToMeal = async (ingredient) => {
    // Use the same logic as the main IngredientsTab
    try {
      setLoading(true)
      
      // Map meal type to backend enum
      const mealTypeMap = {
        'Bữa sáng': 'breakfast',
        'Bữa trưa': 'lunch', 
        'Bữa tối': 'dinner',
        'Ăn vặt': 'snack'
      }
      
      const MealService = await import('../../services/Meal')
      
      // Add ingredient to meal via backend API with default 100g
      const mealData = await MealService.default.addIngredientToMeal(
        ingredient._id,
        100, // Default quantity
        selectedDate.toISOString().split('T')[0],
        mealTypeMap[mealType] || 'snack'
      )
      
      // Call parent callback with the created meal data
      if (onAddIngredient) {
        onAddIngredient({
          id: mealData._id,
          name: ingredient.name,
          calories: mealData.calories,
          protein: mealData.protein,
          fat: mealData.fat,
          carbs: mealData.carbs,
          fiber: mealData.fiber,
          sugar: mealData.sugar,
          quantity: mealData.quantity,
          isIngredient: true,
          mealType: mealData.mealType,
        })
      }
      
      onClose()
    } catch (err) {
      console.error('Error adding ingredient to meal:', err)
      setAlert({
        show: true,
        message: 'Không thể thêm nguyên liệu vào bữa ăn',
        severity: 'error'
      })
    } finally {
      setLoading(false)
    }
  }

  const handlePageChange = (event, newPage) => {
    setPage(newPage)
  }

  if (loading && ingredients.length === 0) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
        <CircularProgress sx={{ color: "#4CAF50" }} />
      </Box>
    )
  }

  if (error) {
    return (
      <Box sx={{ py: 2 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    )
  }

  return (
    <Box>
      {alert.show && (
        <Alert 
          severity={alert.severity} 
          sx={{ mb: 2 }}
          onClose={() => setAlert({ ...alert, show: false })}
        >
          {alert.message}
        </Alert>
      )}

      {/* Header with Add Button */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h6" sx={{ color: "#4CAF50", fontWeight: 600 }}>
          Nguyên liệu tùy chỉnh của bạn
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreateNew}
          sx={{
            bgcolor: "#4CAF50",
            "&:hover": { bgcolor: "#45a049" }
          }}
        >
          Tạo mới
        </Button>
      </Box>

      {/* Ingredients List */}
      {ingredients.map((ingredient) => (
        <Box
          key={ingredient._id}
          sx={{
            bgcolor: "white",
            borderRadius: 2,
            p: 2,
            mb: 2,
            display: "flex",
            alignItems: "center",
            gap: 2,
            border: "1px solid #f0f0f0",
            boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
          }}
        >
          {/* Icon */}
          <Avatar
            sx={{
              bgcolor: "#E8F5E9",
              width: 48,
              height: 48,
            }}
          >
            <RestaurantIcon sx={{ color: "#4CAF50" }} />
          </Avatar>

          {/* Content */}
          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, color: "#4CAF50", mb: 0.5 }}>
              {ingredient.name}
            </Typography>
            <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", mb: 1 }}>
              <Typography variant="caption" sx={{ color: "#666" }}>
                Đạm: {ingredient.proteinPer100g?.toFixed(1) || 0}g
              </Typography>
              <Typography variant="caption" sx={{ color: "#666" }}>
                Béo: {ingredient.fatPer100g?.toFixed(1) || 0}g
              </Typography>
              <Typography variant="caption" sx={{ color: "#666" }}>
                Tinh bột: {ingredient.carbsPer100g?.toFixed(1) || 0}g
              </Typography>
              <Typography variant="caption" sx={{ color: "#666" }}>
                Chất xơ: {ingredient.fiberPer100g?.toFixed(1) || 0}g
              </Typography>
              <Typography variant="caption" sx={{ color: "#666" }}>
                Đường: {ingredient.sugarPer100g?.toFixed(1) || 0}g
              </Typography>
            </Box>
            <Typography variant="caption" sx={{ color: "#999" }}>
              Nhóm thực phẩm: {ingredient.type}
            </Typography>
          </Box>

          {/* Calories and Actions */}
          <Box sx={{ textAlign: "right", display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 1 }}>
            <Typography variant="h6" sx={{ color: "#4CAF50", fontWeight: 600 }}>
              {ingredient.caloPer100g?.toFixed(0) || 0} kcal/100g
            </Typography>
            
            <Box sx={{ display: "flex", gap: 1 }}>
              <Button
                variant="contained"
                size="small"
                startIcon={<AddIcon />}
                onClick={() => handleAddToMeal(ingredient)}
                disabled={loading}
                sx={{
                  bgcolor: "#4CAF50",
                  color: "white",
                  textTransform: "none",
                  "&:hover": { bgcolor: "#45a049" },
                  "&:disabled": { bgcolor: "#ccc" },
                }}
              >
                Thêm
              </Button>
              
              <IconButton
                size="small"
                onClick={() => handleEdit(ingredient)}
                sx={{ color: "#2196F3" }}
              >
                <EditIcon fontSize="small" />
              </IconButton>
              
              <IconButton
                size="small"
                onClick={() => handleDelete(ingredient)}
                sx={{ color: "#f44336" }}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Box>
          </Box>
        </Box>
      ))}

      {/* Pagination */}
      {totalPages > 1 && (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 3, mb: 2 }}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={handlePageChange}
            color="primary"
            sx={{
              "& .MuiPaginationItem-root": {
                color: "#4CAF50",
              },
              "& .Mui-selected": {
                bgcolor: "#4CAF50",
                color: "white",
                "&:hover": {
                  bgcolor: "#45a049",
                },
              },
            }}
          />
        </Box>
      )}

      {/* Empty State */}
      {ingredients.length === 0 && !loading && (
        <Box sx={{ textAlign: "center", py: 4 }}>
          <Typography variant="body1" sx={{ color: "#999", mb: 2 }}>
            {searchQuery ? "Không tìm thấy nguyên liệu nào phù hợp" : "Bạn chưa có nguyên liệu tùy chỉnh nào"}
          </Typography>
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={handleCreateNew}
            sx={{
              borderColor: "#4CAF50",
              color: "#4CAF50",
              "&:hover": { borderColor: "#45a049", bgcolor: "rgba(76, 175, 80, 0.04)" }
            }}
          >
            Tạo nguyên liệu đầu tiên
          </Button>
        </Box>
      )}

      {/* Custom Ingredient Modal */}
      <CustomIngredientModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        ingredient={selectedIngredient}
        onSave={handleModalSave}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Xác nhận xóa</DialogTitle>
        <DialogContent>
          <Typography>
            Bạn có chắc chắn muốn xóa nguyên liệu "{ingredientToDelete?.name}"?
            <br />
            <strong>Hành động này không thể hoàn tác.</strong>
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>
            Hủy
          </Button>
          <Button 
            onClick={confirmDelete}
            color="error"
            variant="contained"
            disabled={loading}
          >
            {loading ? "Đang xóa..." : "Xóa"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default CustomIngredientsTab
