"use client"

import { useState, useEffect, useCallback } from "react"
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  Grid,
  Alert,
  CircularProgress,
  IconButton,
  Divider,
  Autocomplete,
  Chip
} from "@mui/material"
import { Close as CloseIcon, Save as SaveIcon, Delete as DeleteIcon, Add as AddIcon, Restaurant as RestaurantIcon } from "@mui/icons-material"
import MealService from "../../services/Meal"
import DishService from "../../services/Dish"
import IngredientService from "../../services/Ingredient"

function UpdateMealModal({ open, onClose, meal, onMealUpdated, onMealDeleted }) {
  const [formData, setFormData] = useState({
    quantity: 100
  })
  const [loading, setLoading] = useState(false)
  const [alert, setAlert] = useState({ show: false, message: "", severity: "info" })
  
  // Dish and ingredient management
  const [dish, setDish] = useState(null)
  const [selectedIngredients, setSelectedIngredients] = useState([])
  const [availableIngredients, setAvailableIngredients] = useState([])
  const [ingredientsLoading, setIngredientsLoading] = useState(false)
  const [dishLoading, setDishLoading] = useState(false)

  // Load dish details
  const loadDishDetails = useCallback(async (dishId) => {
    try {
      setDishLoading(true)
      const dishData = await DishService.get(dishId)
      setDish(dishData)
      
      // Convert dish ingredients to selectedIngredients format
      if (dishData.ingredients) {
        const ingredients = dishData.ingredients.map(ing => ({
          ingredient: ing.ingredient,
          amount: ing.amount,
          unit: ing.unit || 'g'
        }))
        setSelectedIngredients(ingredients)
      }
    } catch (error) {
      console.error('Error loading dish details:', error)
      setAlert({
        show: true,
        message: "Không thể tải thông tin món ăn",
        severity: "error"
      })
    } finally {
      setDishLoading(false)
    }
  }, [])

  // Load available ingredients
  const loadIngredients = useCallback(async () => {
    try {
      setIngredientsLoading(true)
      const response = await IngredientService.list({ limit: 1000 })
      setAvailableIngredients(response.items || [])
    } catch (error) {
      console.error('Error loading ingredients:', error)
    } finally {
      setIngredientsLoading(false)
    }
  }, [])

  // Initialize form data when meal prop changes
  useEffect(() => {
    try {
      if (meal && open) {
        setFormData({
          quantity: meal.quantity || 100
        })
        setAlert({ show: false, message: "", severity: "info" })
        
        // Load dish details if it's a dish (not ingredient)
        if (!meal.isIngredient && meal.dishId) {
          loadDishDetails(meal.dishId)
        }
        
        // Load ingredients for autocomplete
        loadIngredients()
      }
    } catch (error) {
      console.error('Error in UpdateMealModal useEffect:', error)
      setAlert({
        show: true,
        message: "Có lỗi xảy ra khi tải dữ liệu",
        severity: "error"
      })
    }
  }, [meal, open, loadDishDetails, loadIngredients])

  const handleChange = (field) => (event) => {
    const value = event.target.value
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  // Calculate nutritional values
  const calculateNutrition = () => {
    if (!selectedIngredients || selectedIngredients.length === 0) {
      return { calories: 0, protein: 0, fat: 0, carbs: 0, fiber: 0, sugar: 0 }
    }
    
    return selectedIngredients.reduce((totals, ing) => {
      if (!ing || !ing.ingredient || !ing.amount) return totals
      
      const factor = Number(ing.amount) / 100
      return {
        calories: totals.calories + ((ing.ingredient.caloPer100g || 0) * factor),
        protein: totals.protein + ((ing.ingredient.proteinPer100g || 0) * factor),
        fat: totals.fat + ((ing.ingredient.fatPer100g || 0) * factor),
        carbs: totals.carbs + ((ing.ingredient.carbsPer100g || 0) * factor),
        fiber: totals.fiber + ((ing.ingredient.fiberPer100g || 0) * factor),
        sugar: totals.sugar + ((ing.ingredient.sugarPer100g || 0) * factor),
      }
    }, { calories: 0, protein: 0, fat: 0, carbs: 0, fiber: 0, sugar: 0 })
  }

  const nutrition = calculateNutrition()

  // Ingredient management functions
  const addIngredient = (ingredient) => {
    if (!ingredient || !ingredient._id) return
    
    if (!selectedIngredients.find(ing => ing.ingredient && ing.ingredient._id === ingredient._id)) {
      setSelectedIngredients(prev => [...prev, {
        ingredient,
        amount: 100, // Default amount
        unit: 'g'
      }])
    }
  }

  const removeIngredient = (ingredientId) => {
    if (!ingredientId) return
    
    setSelectedIngredients(prev => 
      prev.filter(ing => ing.ingredient && ing.ingredient._id !== ingredientId)
    )
  }

  const updateIngredientAmount = (ingredientId, newAmount) => {
    if (!ingredientId || !newAmount || newAmount <= 0) return
    
    setSelectedIngredients(prev => 
      prev.map(ing => 
        ing.ingredient && ing.ingredient._id === ingredientId 
          ? { ...ing, amount: Number(newAmount) }
          : ing
      )
    )
  }

  const validateForm = () => {
    if (!formData.quantity || formData.quantity <= 0) {
      setAlert({
        show: true,
        message: "Số lượng phải lớn hơn 0",
        severity: "error"
      })
      return false
    }
    return true
  }

  const handleUpdate = async () => {
    if (!validateForm()) return

    setLoading(true)
    try {
      // If it's a dish (not ingredient), update the dish first
      if (!meal.isIngredient && dish) {
        const updatedDishData = {
          name: dish.name,
          description: dish.description,
          type: dish.type,
          servings: dish.servings,
          ingredients: selectedIngredients.map(ing => ({
            ingredient: ing.ingredient._id,
            amount: ing.amount,
            unit: ing.unit || 'g'
          }))
        }
        
        await DishService.update(dish._id, updatedDishData)
      }
      
      // Update the meal quantity
      await MealService.updateMeal(meal.id, Number(formData.quantity))
      
      setAlert({
        show: true,
        message: "Cập nhật thành công!",
        severity: "success"
      })
      
      // Call parent callback
      if (onMealUpdated) {
        onMealUpdated()
      }

      // Close modal after a short delay
      setTimeout(() => {
        onClose()
      }, 1500)

    } catch (error) {
      console.error('Error updating meal:', error)
      
      // Extract error message safely
      let errorMessage = "Có lỗi xảy ra khi cập nhật món ăn"
      
      if (error.response?.data?.message) {
        if (typeof error.response.data.message === 'object') {
          errorMessage = error.response.data.message.message || error.response.data.message.code || errorMessage
        } else {
          errorMessage = error.response.data.message
        }
      } else if (error.message) {
        errorMessage = error.message
      }
      
      setAlert({
        show: true,
        message: errorMessage,
        severity: "error"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa "${meal.name}"?`)) {
      return
    }

    setLoading(true)
    try {
      await MealService.deleteMeal(meal.id)
      
      setAlert({
        show: true,
        message: "Xóa thành công!",
        severity: "success"
      })
      
      // Call parent callback
      if (onMealDeleted) {
        onMealDeleted()
      }

      // Close modal after a short delay
      setTimeout(() => {
        onClose()
      }, 1500)

    } catch (error) {
      console.error('Error deleting meal:', error)
      
      // Extract error message safely
      let errorMessage = "Có lỗi xảy ra khi xóa món ăn"
      
      if (error.response?.data?.message) {
        if (typeof error.response.data.message === 'object') {
          errorMessage = error.response.data.message.message || error.response.data.message.code || errorMessage
        } else {
          errorMessage = error.response.data.message
        }
      } else if (error.message) {
        errorMessage = error.message
      }
      
      setAlert({
        show: true,
        message: errorMessage,
        severity: "error"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    if (!loading) {
      onClose()
    }
  }

  if (!meal || !open) return null

  try {
    return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: { 
          borderRadius: 2,
          height: "auto",
          width: "90vw",
          maxWidth: "500px",
        }
      }}
    >
      <DialogTitle sx={{ 
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "center",
        bgcolor: "#f5f5f5",
        borderBottom: "1px solid #e0e0e0"
      }}>
        <Typography variant="h6" sx={{ color: "#4CAF50", fontWeight: 600 }}>
          Chỉnh sửa món ăn
        </Typography>
        <Button
          onClick={handleClose}
          disabled={loading}
          sx={{ minWidth: "auto", p: 0.5 }}
        >
          <CloseIcon />
        </Button>
      </DialogTitle>

      <DialogContent sx={{ pt: 3 }}>
        {alert.show && (
          <Alert 
            severity={alert.severity} 
            sx={{ mb: 2 }}
            onClose={() => setAlert({ ...alert, show: false })}
          >
            {alert.message}
          </Alert>
        )}

        {/* Loading state */}
        {dishLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress sx={{ color: "#4CAF50" }} />
          </Box>
        ) : (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            {/* Dish Information */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                pb: 2,
                borderBottom: "2px solid #4CAF50",
              }}
            >
              <AddIcon sx={{ color: "#4CAF50" }} />
              <Typography variant="h6" sx={{ color: "#4CAF50", fontWeight: 600 }}>
                Chỉnh sửa món ăn: {meal.name}
              </Typography>
            </Box>

            {/* Quantity Input */}
            <Box>
              <Typography variant="body2" sx={{ color: "#4CAF50", fontWeight: 500, mb: 1 }}>
                Số lượng món ăn (gram) *
              </Typography>
              <TextField
                fullWidth
                type="number"
                value={formData.quantity}
                onChange={handleChange('quantity')}
                disabled={loading}
                inputProps={{ min: 1, max: 10000, step: 1 }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                    "& fieldset": {
                      borderColor: "#e0e0e0",
                    },
                    "&:hover fieldset": {
                      borderColor: "#4CAF50",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#4CAF50",
                    },
                  },
                }}
              />
            </Box>

            {/* Ingredient Selection - Only show for dishes */}
            {!meal.isIngredient && meal.dishId && (
              <>
                <Box>
                  <Typography variant="body2" sx={{ color: "#4CAF50", fontWeight: 500, mb: 1 }}>
                    Thêm nguyên liệu ({availableIngredients.length} có sẵn)
                  </Typography>
                  {ingredientsLoading ? (
                    <Box sx={{ display: "flex", justifyContent: "center", py: 2 }}>
                      <CircularProgress sx={{ color: "#4CAF50" }} />
                    </Box>
                  ) : (
                    <Autocomplete
                      options={availableIngredients}
                      getOptionLabel={(option) => option.name}
                      filterOptions={(options, { inputValue }) => {
                        if (!inputValue) return options
                        
                        // Custom filtering for Vietnamese text
                        const searchTerm = inputValue.toLowerCase().trim()
                        return options.filter((option) => {
                          const ingredientName = option.name.toLowerCase()
                          return ingredientName.includes(searchTerm)
                        })
                      }}
                      onChange={(event, value) => {
                        if (value) {
                          addIngredient(value)
                        }
                      }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          placeholder={`Tìm và chọn nguyên liệu (${availableIngredients.length} có sẵn)`}
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              borderRadius: 2,
                              "& fieldset": {
                                borderColor: "#e0e0e0",
                              },
                              "&:hover fieldset": {
                                borderColor: "#4CAF50",
                              },
                              "&.Mui-focused fieldset": {
                                borderColor: "#4CAF50",
                              },
                            },
                          }}
                        />
                      )}
                    />
                  )}
                </Box>

                {/* Selected Ingredients */}
                <Box>
                  <Typography variant="body2" sx={{ color: "#4CAF50", fontWeight: 500, mb: 2 }}>
                    Nguyên liệu đã chọn ({selectedIngredients.length})
                  </Typography>
                  {selectedIngredients.length === 0 ? (
                    <Box
                      sx={{
                        bgcolor: "#F1F8F4",
                        borderRadius: 2,
                        p: 4,
                        textAlign: "center",
                      }}
                    >
                      <RestaurantIcon sx={{ fontSize: 48, color: "#C8E6C9", mb: 1 }} />
                      <Typography variant="body2" sx={{ color: "#999", mb: 0.5 }}>
                        Chưa chọn nguyên liệu nào
                      </Typography>
                      <Typography variant="caption" sx={{ color: "#bbb" }}>
                        Sử dụng ô tìm kiếm ở trên để thêm nguyên liệu
                      </Typography>
                    </Box>
                  ) : (
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                      {selectedIngredients.map((ing) => (
                        <Box
                          key={ing.ingredient._id}
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            p: 2,
                            bgcolor: "#F1F8F4",
                            borderRadius: 2,
                            border: "1px solid #E8F5E9",
                          }}
                        >
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="body2" sx={{ color: "#4CAF50", fontWeight: 600, mb: 0.5 }}>
                              {ing.ingredient.name}
                            </Typography>
                            <Typography variant="caption" sx={{ color: "#666" }}>
                              {((ing.ingredient.caloPer100g || 0) * ing.amount / 100).toFixed(0)} kcal
                            </Typography>
                          </Box>
                          
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <TextField
                              type="number"
                              value={ing.amount}
                              onChange={(e) => updateIngredientAmount(ing.ingredient._id, Number(e.target.value))}
                              size="small"
                              sx={{ width: 80 }}
                              inputProps={{ min: 1, max: 10000 }}
                            />
                            <Typography variant="caption" sx={{ color: "#666", minWidth: 20 }}>
                              g
                            </Typography>
                            <Button
                              size="small"
                              onClick={() => removeIngredient(ing.ingredient._id)}
                              sx={{ minWidth: 'auto', p: 0.5, color: '#f44336' }}
                            >
                              <DeleteIcon fontSize="small" />
                            </Button>
                          </Box>
                        </Box>
                      ))}
                    </Box>
                  )}
                </Box>

                {/* Nutrition Summary */}
                {selectedIngredients.length > 0 && (
                  <Box
                    sx={{
                      bgcolor: "#E8F5E9",
                      borderRadius: 2,
                      p: 3,
                    }}
                  >
                    <Typography variant="h6" sx={{ color: "#4CAF50", fontWeight: 600, mb: 2, textAlign: "center" }}>
                      Thông tin dinh dưỡng (tổng)
                    </Typography>
                    <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
                      <Box sx={{ textAlign: "center" }}>
                        <Typography variant="h4" sx={{ color: "#4CAF50", fontWeight: 600 }}>
                          {Math.round(nutrition.calories)}
                        </Typography>
                        <Typography variant="caption" sx={{ color: "#4CAF50" }}>
                          Calories
                        </Typography>
                      </Box>
                      <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
                        <Typography variant="caption" sx={{ color: "#666" }}>
                          Đạm: {nutrition.protein.toFixed(1)}g
                        </Typography>
                        <Typography variant="caption" sx={{ color: "#666" }}>
                          Béo: {nutrition.fat.toFixed(1)}g
                        </Typography>
                        <Typography variant="caption" sx={{ color: "#666" }}>
                          Tinh bột: {nutrition.carbs.toFixed(1)}g
                        </Typography>
                        <Typography variant="caption" sx={{ color: "#666" }}>
                          Chất xơ: {nutrition.fiber.toFixed(1)}g
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                )}
              </>
            )}

            {/* For ingredients, show simple quantity update */}
            {meal.isIngredient && (
              <Box sx={{ 
                bgcolor: "#E8F5E9", 
                borderRadius: 2, 
                p: 2, 
                mb: 2 
              }}>
                <Typography variant="subtitle2" sx={{ color: "#4CAF50", fontWeight: 600, mb: 1 }}>
                  Thông tin nguyên liệu:
                </Typography>
                <Typography variant="body2" sx={{ color: "#666" }}>
                  Calories: {Math.round((meal.calories || 0) * (formData.quantity / (meal.quantity || 100)))} kcal
                </Typography>
                <Typography variant="body2" sx={{ color: "#666" }}>
                  Protein: {((meal.protein || 0) * (formData.quantity / (meal.quantity || 100))).toFixed(1)}g
                </Typography>
              </Box>
            )}
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 3, bgcolor: "#f5f5f5", gap: 1 }}>
        <Button
          onClick={handleDelete}
          disabled={loading}
          startIcon={loading ? <CircularProgress size={16} /> : <DeleteIcon />}
          sx={{
            color: "#f44336",
            borderColor: "#f44336",
            "&:hover": {
              borderColor: "#d32f2f",
              bgcolor: "rgba(244, 67, 54, 0.04)"
            }
          }}
          variant="outlined"
        >
          {loading ? "Đang xóa..." : "Xóa"}
        </Button>
        
        <Box sx={{ flex: 1 }} />
        
        <Button
          onClick={handleClose}
          disabled={loading}
          sx={{ color: "#666" }}
        >
          Hủy
        </Button>
        <Button
          onClick={handleUpdate}
          variant="contained"
          disabled={loading}
          startIcon={loading ? <CircularProgress size={16} /> : <SaveIcon />}
          sx={{
            bgcolor: "#4CAF50",
            "&:hover": { bgcolor: "#45a049" },
            "&:disabled": { bgcolor: "#ccc" }
          }}
        >
          {loading ? "Đang cập nhật..." : "Cập nhật"}
        </Button>
      </DialogActions>
    </Dialog>
    )
  } catch (error) {
    console.error('Error rendering UpdateMealModal:', error)
    return (
      <Dialog open={open} onClose={onClose}>
        <DialogContent>
          <Alert severity="error">
            Có lỗi xảy ra khi tải modal. Vui lòng thử lại.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Đóng</Button>
        </DialogActions>
      </Dialog>
    )
  }
}

export default UpdateMealModal
