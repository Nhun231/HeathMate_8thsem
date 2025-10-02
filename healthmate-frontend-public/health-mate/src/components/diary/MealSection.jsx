"use client"
import { Box, Typography, Button, IconButton } from "@mui/material"
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from "@mui/icons-material"
import RestaurantIcon from "@mui/icons-material/Restaurant"
import { useDiary } from "../../context/DiaryContext.jsx"

function MealSection({ mealType, onAddMeal }) {
  const { selectedDate, getDayEntries, removeDishFromMeal } = useDiary()
  const entries = getDayEntries(selectedDate)
  const dishes = entries[mealType] || []

  const totalCalories = dishes.reduce((sum, dish) => sum + dish.calories, 0)

  return (
    <Box
      sx={{
        bgcolor: "white",
        borderRadius: 2,
        p: 3,
        mb: 2,
        boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
      }}
    >
      {/* Meal Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: dishes.length > 0 ? 2 : 0,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Box
            sx={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              bgcolor: "#4CAF50",
            }}
          />
          <Typography variant="h6" sx={{ fontWeight: 500, color: "#333" }}>
            {mealType}
          </Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Typography variant="body1" sx={{ color: "#4CAF50", fontWeight: 500 }}>
            {totalCalories} cal
          </Typography>
          <Button
            variant="contained"
            size="small"
            startIcon={<AddIcon />}
            onClick={onAddMeal}
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

      {/* Dishes List */}
      {dishes.length > 0 ? (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {dishes.map((dish) => (
            <Box
              key={dish.entryId}
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                pb: 2,
                borderBottom: "1px solid #f0f0f0",
                "&:last-child": { borderBottom: "none", pb: 0 },
              }}
            >
              <Box sx={{ flex: 1 }}>
                <Typography variant="body1" sx={{ fontWeight: 500, color: "#4CAF50", mb: 0.5 }}>
                  {dish.name}
                </Typography>
                <Box
                  sx={{
                    display: "flex",
                    gap: 2,
                    flexWrap: "wrap",
                  }}
                >
                  <Typography variant="body2" sx={{ color: "#4CAF50" }}>
                    {dish.calories} cal
                  </Typography>
                  <Typography variant="body2" sx={{ color: "#999" }}>
                    Protein: {dish.protein}g
                  </Typography>
                  <Typography variant="body2" sx={{ color: "#999" }}>
                    Fat: {dish.fat}g
                  </Typography>
                  <Typography variant="body2" sx={{ color: "#999" }}>
                    Carbs: {dish.carbs}g
                  </Typography>
                  <Typography variant="body2" sx={{ color: "#999" }}>
                    Fiber: {dish.fiber}g
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ display: "flex", gap: 0.5 }}>
                <IconButton size="small" sx={{ color: "#4CAF50" }}>
                  <EditIcon fontSize="small" />
                </IconButton>
                <IconButton
                  size="small"
                  sx={{ color: "#f44336" }}
                  onClick={() => removeDishFromMeal(mealType, dish.entryId)}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Box>
            </Box>
          ))}
        </Box>
      ) : (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            py: 4,
          }}
        >
          <RestaurantIcon sx={{ fontSize: 48, color: "#C8E6C9", mb: 1 }} />
          <Typography variant="body2" sx={{ color: "#999", mb: 2 }}>
            Chưa có món ăn nào
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={onAddMeal}
            sx={{
              bgcolor: "#4CAF50",
              color: "white",
              textTransform: "none",
              "&:hover": { bgcolor: "#45a049" },
            }}
          >
            Thêm món ăn đầu tiên
          </Button>
        </Box>
      )}
    </Box>
  )
}

export default MealSection
