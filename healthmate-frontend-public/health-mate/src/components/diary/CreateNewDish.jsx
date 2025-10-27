

import { Box, Typography, TextField, Select, MenuItem, FormControl, Button, Autocomplete, Chip, CircularProgress, Alert } from "@mui/material"
import { Add as AddIcon, Delete as DeleteIcon } from "@mui/icons-material"
import RestaurantIcon from "@mui/icons-material/Restaurant"
import { createDish } from "../../services/Dish"
import { addDishToMeal } from "../../services/Meal"

function CreateNewDish({ mealType, onClose, onAddDish, state, updateState, resetState }) {
  // Use state from props instead of local state
  const {
    dishName,
    description,
    servings,
    selectedIngredients,
    availableIngredients,
    loading,
    error,
    ingredientsLoading
  } = state

  // Calculate total ingredient weight
  const calculateTotalWeight = () => {
    return selectedIngredients.reduce((total, ing) => {
      return total + (ing.amount || 0)
    }, 0)
  }

  // Calculate nutritional values
  const calculateNutrition = () => {
    return selectedIngredients.reduce((totals, ing) => {
      const factor = ing.amount / 100
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

  const handleCreateDish = async () => {
    if (!dishName || !description || selectedIngredients.length === 0) {
      updateState({ error: 'Vui lòng điền đầy đủ thông tin' })
      return
    }

    try {
      updateState({ loading: true, error: null })

      // Create dish via backend API
      const dishData = {
        name: dishName,
        description: description,
        type: mealType,
        servings: servings,
        ingredients: selectedIngredients.map(ing => ({
          ingredient: ing.ingredient._id,
          amount: ing.amount,
          unit: 'g'
        }))
      }

      const createdDish = await createDish(dishData)

      // Map meal type to backend enum
      const mealTypeMap = {
        'Bữa sáng': 'breakfast',
        'Bữa trưa': 'lunch', 
        'Bữa tối': 'dinner',
        'Ăn vặt': 'snack'
      }

      // Add the created dish to the meal
      const currentDate = new Date() // Use current date object
      const defaultQuantity = createdDish.totalIngredientWeight || 100 // Use actual total ingredient weight as default
      const mealData = await addDishToMeal(
        createdDish._id,
        defaultQuantity,
        currentDate, // Pass Date object, MealService will convert to ISO
        mealTypeMap[mealType] || 'snack'
      )

      // Call parent callback
      if (onAddDish) {
        onAddDish({
          id: mealData._id,
          name: createdDish.name,
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
      console.error('Error creating dish:', err)
      updateState({ error: 'Không thể tạo món ăn' })
    } finally {
      updateState({ loading: false })
    }
  }

  const addIngredient = (ingredient) => {
    if (!selectedIngredients.find(ing => ing.ingredient._id === ingredient._id)) {
      updateState({
        selectedIngredients: [...selectedIngredients, {
          ingredient,
          amount: 100, // Default amount
          unit: 'g'
        }]
      })
    }
  }

  const removeIngredient = (ingredientId) => {
    updateState({
      selectedIngredients: selectedIngredients.filter(ing => ing.ingredient._id !== ingredientId)
    })
  }

  const updateIngredientAmount = (ingredientId, newAmount) => {
    updateState({
      selectedIngredients: selectedIngredients.map(ing => 
        ing.ingredient._id === ingredientId 
          ? { ...ing, amount: newAmount }
          : ing
      )
    })
  }

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
        <CircularProgress sx={{ color: "#4CAF50" }} />
      </Box>
    )
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
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
          Tạo món ăn mới
        </Typography>
      </Box>

      {error && (
        <Alert severity="error">{error}</Alert>
      )}

      {/* Dish Name */}
      <Box>
        <Typography variant="body2" sx={{ color: "#4CAF50", fontWeight: 500, mb: 1 }}>
          Tên món ăn *
        </Typography>
        <TextField
          fullWidth
          placeholder="Nhập tên món ăn"
          value={dishName}
          onChange={(e) => updateState({ dishName: e.target.value })}
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

      {/* Description */}
      <Box>
        <Typography variant="body2" sx={{ color: "#4CAF50", fontWeight: 500, mb: 1 }}>
          Mô tả *
        </Typography>
        <TextField
          fullWidth
          multiline
          rows={2}
          placeholder="Mô tả món ăn"
          value={description}
          onChange={(e) => updateState({ description: e.target.value })}
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

      {/* Servings */}
      <Box>
        <Typography variant="body2" sx={{ color: "#4CAF50", fontWeight: 500, mb: 1 }}>
          Số phần ăn
        </Typography>
        <TextField
          type="number"
          value={servings}
          onChange={(e) => updateState({ servings: Math.max(1, Number(e.target.value)) })}
          sx={{ width: 120 }}
          inputProps={{ min: 1, max: 20 }}
        />
      </Box>

      {/* Ingredient Selection */}
      <Box>
        <Typography variant="body2" sx={{ color: "#4CAF50", fontWeight: 500, mb: 1 }}>
          Thêm nguyên liệu * ({availableIngredients.length} có sẵn)
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
                // Check if the ingredient name contains the search term
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
          <Typography variant="h6" sx={{ color: "#4CAF50", fontWeight: 600, mb: 1, textAlign: "center" }}>
            Thông tin dinh dưỡng (tổng)
          </Typography>
          <Typography variant="body2" sx={{ color: "#666", mb: 2, textAlign: "center" }}>
            Tổng trọng lượng nguyên liệu: {calculateTotalWeight()}g
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

      {/* Create Button */}
      <Button
        variant="contained"
        fullWidth
        disabled={!dishName || !description || selectedIngredients.length === 0 || loading}
        onClick={handleCreateDish}
        sx={{
          bgcolor: "#4CAF50",
          color: "white",
          py: 1.5,
          textTransform: "none",
          fontSize: 16,
          "&:hover": { bgcolor: "#45a049" },
          "&:disabled": {
            bgcolor: "#e0e0e0",
            color: "#999",
          },
        }}
      >
        {loading ? "Đang tạo..." : "Tạo món ăn và thêm vào bữa ăn"}
      </Button>
    </Box>
  )
}

export default CreateNewDish
