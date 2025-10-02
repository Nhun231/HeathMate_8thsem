"use client"

import { useState } from "react"
import { Box, Typography, TextField, Select, MenuItem, FormControl, Button } from "@mui/material"
import { Add as AddIcon } from "@mui/icons-material"
import RestaurantIcon from "@mui/icons-material/Restaurant"
import { useDiary } from "../context/DiaryContext"

function CreateNewDish({ mealType, onClose }) {
  const { addDishToMeal } = useDiary()
  const [dishName, setDishName] = useState("")
  const [dishType, setDishType] = useState(mealType || "")
  const [selectedIngredients, setSelectedIngredients] = useState([])

  const totalCalories = selectedIngredients.reduce((sum, ing) => sum + ing.calories, 0)
  const totalProtein = selectedIngredients.reduce((sum, ing) => sum + ing.protein, 0)
  const totalFat = selectedIngredients.reduce((sum, ing) => sum + ing.fat, 0)
  const totalCarbs = selectedIngredients.reduce((sum, ing) => sum + ing.carbs, 0)
  const totalFiber = selectedIngredients.reduce((sum, ing) => sum + ing.fiber, 0)

  const handleCreateDish = () => {
    if (dishName && selectedIngredients.length > 0) {
      const newDish = {
        id: Date.now(),
        name: dishName,
        calories: Math.round(totalCalories),
        protein: Math.round(totalProtein * 10) / 10,
        fat: Math.round(totalFat * 10) / 10,
        carbs: Math.round(totalCarbs * 10) / 10,
        fiber: Math.round(totalFiber * 10) / 10,
        mealType: dishType,
      }
      addDishToMeal(dishType, newDish)
      onClose()
    }
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

      {/* Dish Name */}
      <Box>
        <Typography variant="body2" sx={{ color: "#4CAF50", fontWeight: 500, mb: 1 }}>
          Tên món ăn
        </Typography>
        <TextField
          fullWidth
          placeholder="Nhập tên món ăn"
          value={dishName}
          onChange={(e) => setDishName(e.target.value)}
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

      {/* Dish Type */}
      <Box>
        <Typography variant="body2" sx={{ color: "#4CAF50", fontWeight: 500, mb: 1 }}>
          Loại món
        </Typography>
        <FormControl fullWidth>
          <Select
            value={dishType}
            onChange={(e) => setDishType(e.target.value)}
            displayEmpty
            sx={{
              borderRadius: 2,
              "& .MuiOutlinedInput-notchedOutline": {
                borderColor: "#e0e0e0",
              },
              "&:hover .MuiOutlinedInput-notchedOutline": {
                borderColor: "#4CAF50",
              },
              "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                borderColor: "#4CAF50",
              },
            }}
          >
            <MenuItem value="" disabled>
              Chọn loại món
            </MenuItem>
            <MenuItem value="Bữa sáng">Bữa sáng</MenuItem>
            <MenuItem value="Bữa trưa">Bữa trưa</MenuItem>
            <MenuItem value="Bữa tối">Bữa tối</MenuItem>
            <MenuItem value="Ăn vặt">Ăn vặt</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Selected Ingredients */}
      <Box>
        <Typography variant="body2" sx={{ color: "#4CAF50", fontWeight: 500, mb: 2 }}>
          Nguyên liệu đã chọn
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
              Chuyển sang tab "Nguyên liệu" để chọn
            </Typography>
          </Box>
        ) : (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            {selectedIngredients.map((ing) => (
              <Box
                key={ing.id}
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  p: 1.5,
                  bgcolor: "#F1F8F4",
                  borderRadius: 1,
                }}
              >
                <Typography variant="body2" sx={{ color: "#4CAF50" }}>
                  {ing.name}
                </Typography>
                <Typography variant="body2" sx={{ color: "#999" }}>
                  {ing.calories} kcal
                </Typography>
              </Box>
            ))}
          </Box>
        )}
      </Box>

      {/* Total Calories */}
      <Box
        sx={{
          bgcolor: "#E8F5E9",
          borderRadius: 2,
          p: 3,
          textAlign: "center",
        }}
      >
        <Typography variant="h3" sx={{ color: "#4CAF50", fontWeight: 600, mb: 0.5 }}>
          {Math.round(totalCalories)}
        </Typography>
        <Typography variant="body2" sx={{ color: "#4CAF50" }}>
          Tổng calories
        </Typography>
      </Box>

      {/* Create Button */}
      <Button
        variant="contained"
        fullWidth
        disabled={!dishName || selectedIngredients.length === 0}
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
        Tạo món ăn
      </Button>
    </Box>
  )
}

export default CreateNewDish
