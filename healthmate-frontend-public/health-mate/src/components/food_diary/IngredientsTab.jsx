"use client"
import { Box, Typography, Button, Avatar } from "@mui/material"
import { Add as AddIcon } from "@mui/icons-material"
import RestaurantIcon from "@mui/icons-material/Restaurant"
import { useDiary } from "../context/DiaryContext"

function IngredientsTab({ searchQuery, mealType, onClose }) {
  const { ingredients, addDishToMeal, selectedDate } = useDiary()

  // Filter ingredients based on search query
  const filteredIngredients = ingredients.filter((ingredient) =>
    ingredient.name.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleAddIngredient = (ingredient) => {
    // Add ingredient as a dish to the meal
    addDishToMeal(selectedDate, mealType, {
      id: `ingredient-${ingredient.id}-${Date.now()}`,
      name: ingredient.name,
      calories: ingredient.calories,
      protein: ingredient.protein,
      fat: ingredient.fat,
      carbs: ingredient.carbs,
      fiber: ingredient.fiber,
      mealType: mealType,
    })
    onClose()
  }

  return (
    <Box>
      {filteredIngredients.map((ingredient) => (
        <Box
          key={ingredient.id}
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
            <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
              <Typography variant="caption" sx={{ color: "#666" }}>
                P: {ingredient.protein}g
              </Typography>
              <Typography variant="caption" sx={{ color: "#666" }}>
                F: {ingredient.fat}g
              </Typography>
              <Typography variant="caption" sx={{ color: "#666" }}>
                C: {ingredient.carbs}g
              </Typography>
              <Typography variant="caption" sx={{ color: "#666" }}>
                Fiber: {ingredient.fiber}g
              </Typography>
            </Box>
          </Box>

          {/* Calories and Add Button */}
          <Box sx={{ textAlign: "right" }}>
            <Typography variant="h6" sx={{ color: "#4CAF50", fontWeight: 600, mb: 1 }}>
              {ingredient.calories} kcal
            </Typography>
            <Button
              variant="contained"
              size="small"
              startIcon={<AddIcon />}
              onClick={() => handleAddIngredient(ingredient)}
              sx={{
                bgcolor: "#4CAF50",
                color: "white",
                textTransform: "none",
                "&:hover": { bgcolor: "#45a049" },
              }}
            >
              Thêm
            </Button>
          </Box>
        </Box>
      ))}

      {filteredIngredients.length === 0 && (
        <Box sx={{ textAlign: "center", py: 4 }}>
          <Typography variant="body1" sx={{ color: "#999" }}>
            Không tìm thấy nguyên liệu nào
          </Typography>
        </Box>
      )}
    </Box>
  )
}

export default IngredientsTab
