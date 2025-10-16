"use client"

import { useState, useEffect } from "react"
import { Box, Typography, Button, Avatar, CircularProgress, Alert, Chip } from "@mui/material"
import { Add as AddIcon } from "@mui/icons-material"
import RestaurantIcon from "@mui/icons-material/Restaurant"
import { listDishes } from "../../services/Dish"
import { addDishToMeal } from "../../services/Meal"

function AvailableDishes({ searchQuery, mealType, onClose, onAddDish }) {
  const [dishes, setDishes] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Fetch dishes from API
  useEffect(() => {
    const fetchDishes = async () => {
      setLoading(true)
      setError(null)
      try {
        const params = {
          limit: 1000, // Get all dishes
          page: 1
        }
        
        if (searchQuery) {
          params.search = searchQuery
        }
        
        // Remove meal type filtering - dishes can be added to any meal
        
        const response = await listDishes(params)
        setDishes(response.items || [])
        
      } catch (err) {
        console.error('Error fetching dishes:', err)
        
        // Extract error message safely
        let errorMessage = 'Không thể tải danh sách món ăn'
        
        if (err.response?.data?.message) {
          if (typeof err.response.data.message === 'object') {
            errorMessage = err.response.data.message.message || err.response.data.message.code || errorMessage
          } else {
            errorMessage = err.response.data.message
          }
        } else if (err.message) {
          errorMessage = err.message
        }
        
        setError(errorMessage)
      } finally {
        setLoading(false)
      }
    }

    fetchDishes()
  }, [searchQuery])

  const handleAddDish = async (dish) => {
    try {
      setLoading(true)
      
      // Map meal type to backend enum
      const mealTypeMap = {
        'Bữa sáng': 'breakfast',
        'Bữa trưa': 'lunch', 
        'Bữa tối': 'dinner',
        'Ăn vặt': 'snack'
      }
      
      const currentDate = new Date()
      const mealData = await addDishToMeal(
        dish._id,
        1, // Default serving size
        currentDate,
        mealTypeMap[mealType] || 'snack'
      )
      
      // Call parent callback with the created meal data
      if (onAddDish) {
        onAddDish({
          id: mealData._id,
          name: dish.name,
          calories: mealData.calories,
          protein: mealData.protein,
          fat: mealData.fat,
          carbs: mealData.carbs,
          fiber: mealData.fiber,
          sugar: mealData.sugar,
          quantity: mealData.quantity,
          isIngredient: false,
          mealType: mealData.mealType,
        })
      }
      
      onClose()
    } catch (err) {
      console.error('Error adding dish to meal:', err)
      setError('Không thể thêm món ăn vào bữa ăn')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
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
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      {dishes.map((dish) => (
        <Box
          key={dish._id}
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            p: 2,
            bgcolor: "white",
            borderRadius: 2,
            border: "1px solid #f0f0f0",
            "&:hover": {
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            },
          }}
        >
          <Avatar
            sx={{
              bgcolor: "#E8F5E9",
              width: 56,
              height: 56,
            }}
          >
            <RestaurantIcon sx={{ color: "#4CAF50" }} />
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
              <Typography variant="body1" sx={{ fontWeight: 600, color: "#4CAF50" }}>
                {dish.name}
              </Typography>
              {/* Custom dish flag */}
              {dish.belongsTo && (
                <Chip
                  label="Tùy chỉnh"
                  size="small"
                  sx={{
                    bgcolor: "#FFF3E0",
                    color: "#F57C00",
                    fontSize: "0.7rem",
                    height: 20,
                    "& .MuiChip-label": {
                      px: 1
                    }
                  }}
                />
              )}
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
              <Typography variant="h6" sx={{ color: "#4CAF50", fontWeight: 600 }}>
                {Math.round(dish.totalCalories || 0)} kcal
              </Typography>
            </Box>
            <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
              <Typography variant="caption" sx={{ color: "#999" }}>
                Protein: {(dish.totalProtein || 0).toFixed(1)}g
              </Typography>
              <Typography variant="caption" sx={{ color: "#999" }}>
                Fat: {(dish.totalFat || 0).toFixed(1)}g
              </Typography>
              <Typography variant="caption" sx={{ color: "#999" }}>
                Carbs: {(dish.totalCarbs || 0).toFixed(1)}g
              </Typography>
              <Typography variant="caption" sx={{ color: "#999" }}>
                Fiber: {(dish.totalFiber || 0).toFixed(1)}g
              </Typography>
            </Box>
            {dish.description && (
              <Typography variant="caption" sx={{ color: "#666", mt: 0.5, display: "block" }}>
                {dish.description}
              </Typography>
            )}
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleAddDish(dish)}
            disabled={loading}
            sx={{
              bgcolor: "#4CAF50",
              color: "white",
              textTransform: "none",
              whiteSpace: "nowrap",
              "&:hover": { bgcolor: "#45a049" },
              "&:disabled": { bgcolor: "#ccc" },
            }}
          >
            Thêm vào bữa ăn
          </Button>
        </Box>
      ))}
      {dishes.length === 0 && !loading && (
        <Box sx={{ textAlign: "center", py: 4 }}>
          <Typography variant="body2" sx={{ color: "#999" }}>
            {searchQuery ? "Không tìm thấy món ăn nào phù hợp" : "Không có món ăn nào"}
          </Typography>
        </Box>
      )}
    </Box>
  )
}

export default AvailableDishes
