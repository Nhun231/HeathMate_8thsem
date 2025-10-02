"use client"

import { Box, Typography, Button, Avatar } from "@mui/material"
import { Add as AddIcon } from "@mui/icons-material"
import RestaurantIcon from "@mui/icons-material/Restaurant"
import { useDiary } from "../context/DiaryContext"

function AvailableDishes({ searchQuery, mealType, onClose }) {
  const { publicDishes, addDishToMeal } = useDiary()

  const filteredDishes = publicDishes.filter((dish) => dish.name.toLowerCase().includes(searchQuery.toLowerCase()))

  const handleAddDish = (dish) => {
    addDishToMeal(mealType, dish)
    onClose()
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      {filteredDishes.map((dish) => (
        <Box
          key={dish.id}
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
            <Typography variant="body1" sx={{ fontWeight: 600, color: "#4CAF50", mb: 0.5 }}>
              {dish.name}
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
              <Typography
                variant="body2"
                sx={{
                  bgcolor: "#E8F5E9",
                  color: "#4CAF50",
                  px: 1,
                  py: 0.25,
                  borderRadius: 1,
                  fontSize: 12,
                }}
              >
                {dish.mealType}
              </Typography>
              <Typography variant="h6" sx={{ color: "#4CAF50", fontWeight: 600 }}>
                {dish.calories} kcal
              </Typography>
            </Box>
            <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
              <Typography variant="caption" sx={{ color: "#999" }}>
                Protein: {dish.protein}g
              </Typography>
              <Typography variant="caption" sx={{ color: "#999" }}>
                Fat: {dish.fat}g
              </Typography>
              <Typography variant="caption" sx={{ color: "#999" }}>
                Carbs: {dish.carbs}g
              </Typography>
              <Typography variant="caption" sx={{ color: "#999" }}>
                Fiber: {dish.fiber}g
              </Typography>
            </Box>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleAddDish(dish)}
            sx={{
              bgcolor: "#4CAF50",
              color: "white",
              textTransform: "none",
              whiteSpace: "nowrap",
              "&:hover": { bgcolor: "#45a049" },
            }}
          >
            Thêm vào bữa ăn
          </Button>
        </Box>
      ))}
      {filteredDishes.length === 0 && (
        <Box sx={{ textAlign: "center", py: 4 }}>
          <Typography variant="body2" sx={{ color: "#999" }}>
            Không tìm thấy món ăn nào
          </Typography>
        </Box>
      )}
    </Box>
  )
}

export default AvailableDishes
