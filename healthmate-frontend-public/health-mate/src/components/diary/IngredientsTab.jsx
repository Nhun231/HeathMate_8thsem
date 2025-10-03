"use client"
import { useState, useEffect } from "react"
import { Box, Typography, Button, Avatar, CircularProgress, Alert, Pagination, TextField, FormControl, InputLabel, Select, MenuItem, Chip } from "@mui/material"
import { Add as AddIcon, FilterList as FilterIcon } from "@mui/icons-material"
import RestaurantIcon from "@mui/icons-material/Restaurant"
import IngredientService from "../../services/Ingredient"
import MealService from "../../services/Meal"

function IngredientsTab({ searchQuery, mealType, onClose, onAddIngredient }) {
  const [ingredients, setIngredients] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [selectedTypes, setSelectedTypes] = useState([])
  const [quantities, setQuantities] = useState({}) // Individual quantities for each ingredient

  // 14 ingredient types from the images
  const ingredientTypes = [
    "Dầu, mỡ, bơ",
    "Đồ hộp", 
    "Đồ ngọt",
    "Gia vị, nước chấm",
    "Hạt, quả giàu đạm, béo",
    "Khoai củ và sản phẩm chế biến",
    "Nước giải khát, bia, rượu",
    "Ngũ cốc và sản phẩm chế biến",
    "Quả chín",
    "Rau, quả củ dùng làm rau",
    "Sữa và SP chế biến",
    "Thịt và sản phẩm chế biến",
    "Thủy sản và sản phẩm chế biến",
    "Trứng và sản phẩm chế biến"
  ]

  // Fetch ingredients from backend
  useEffect(() => {
    const fetchIngredients = async () => {
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
        
        if (selectedTypes.length > 0) {
          params.type = selectedTypes[0] // Backend supports single type filter for now
        }
        
        const response = await IngredientService.list(params)
        setIngredients(response.items || [])
        setTotalPages(response.totalPages || 1)
        
        // Initialize quantities for new ingredients
        const newQuantities = { ...quantities }
        response.items?.forEach(ingredient => {
          if (!newQuantities[ingredient._id]) {
            newQuantities[ingredient._id] = 100 // Default 100g
          }
        })
        setQuantities(newQuantities)
        
      } catch (err) {
        console.error('Error fetching ingredients:', err)
        setError('Không thể tải danh sách nguyên liệu')
      } finally {
        setLoading(false)
      }
    }

    fetchIngredients()
  }, [searchQuery, page, selectedTypes])

  // Use ingredients directly since search is handled server-side
  const filteredIngredients = ingredients

  const handleAddIngredient = async (ingredient) => {
    try {
      setLoading(true)
      
      // Map meal type to backend enum
      const mealTypeMap = {
        'Bữa sáng': 'breakfast',
        'Bữa trưa': 'lunch', 
        'Bữa tối': 'dinner',
        'Ăn vặt': 'snack'
      }
      
      const ingredientQuantity = quantities[ingredient._id] || 100
      
      // Add ingredient to meal via backend API (use current date)
      const currentDate = new Date() // Use current date object
      const mealData = await MealService.addIngredientToMeal(
        ingredient._id,
        ingredientQuantity,
        currentDate, // Pass Date object, MealService will convert to ISO
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
      setError('Không thể thêm nguyên liệu vào bữa ăn')
    } finally {
      setLoading(false)
    }
  }

  const handlePageChange = (event, newPage) => {
    setPage(newPage)
  }

  const handleTypeChange = (event) => {
    setSelectedTypes(event.target.value)
    setPage(1) // Reset to first page when filter changes
  }

  const handleQuantityChange = (ingredientId, newQuantity) => {
    setQuantities(prev => ({
      ...prev,
      [ingredientId]: Math.max(1, newQuantity)
    }))
  }

  const removeTypeFilter = (typeToRemove) => {
    setSelectedTypes(prev => prev.filter(type => type !== typeToRemove))
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
    <Box>
      {/* Filter Controls */}
      <Box sx={{ mb: 2, p: 2, bgcolor: "#f5f5f5", borderRadius: 2 }}>
        <Typography variant="subtitle2" sx={{ mb: 1, color: "#4CAF50", fontWeight: 600 }}>
          <FilterIcon sx={{ mr: 1, fontSize: 16 }} />
          Lọc theo nhóm thực phẩm:
        </Typography>
        <FormControl size="small" sx={{ minWidth: 200, mb: 1 }}>
          <InputLabel>Chọn nhóm thực phẩm</InputLabel>
          <Select
            multiple
            value={selectedTypes}
            onChange={handleTypeChange}
            label="Chọn nhóm thực phẩm"
            renderValue={(selected) => (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {selected.map((value) => (
                  <Chip
                    key={value}
                    label={value}
                    size="small"
                    onDelete={() => removeTypeFilter(value)}
                    sx={{ fontSize: '0.75rem' }}
                  />
                ))}
              </Box>
            )}
          >
            {ingredientTypes.map((type) => (
              <MenuItem key={type} value={type}>
                {type}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {filteredIngredients.map((ingredient) => (
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
            <Typography variant="caption" sx={{ color: "#999", mb: 1, display: "block" }}>
              Nhóm thực phẩm: {ingredient.type}
            </Typography>
            
            {/* Individual Quantity Input */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 1 }}>
              <Typography variant="caption" sx={{ color: "#4CAF50", fontWeight: 600 }}>
                Số lượng:
              </Typography>
              <TextField
                type="number"
                value={quantities[ingredient._id] || 100}
                onChange={(e) => handleQuantityChange(ingredient._id, Number(e.target.value))}
                size="small"
                sx={{ width: 80 }}
                inputProps={{ min: 1, max: 10000 }}
              />
              <Typography variant="caption" sx={{ color: "#666" }}>
                gram = {((ingredient.caloPer100g || 0) * (quantities[ingredient._id] || 100) / 100).toFixed(0)} kcal
              </Typography>
            </Box>
          </Box>

          {/* Calories and Add Button */}
          <Box sx={{ textAlign: "right" }}>
            <Typography variant="h6" sx={{ color: "#4CAF50", fontWeight: 600, mb: 1 }}>
              {ingredient.caloPer100g?.toFixed(0) || 0} kcal/100g
            </Typography>
            <Button
              variant="contained"
              size="small"
              startIcon={<AddIcon />}
              onClick={() => handleAddIngredient(ingredient)}
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

      {filteredIngredients.length === 0 && !loading && (
        <Box sx={{ textAlign: "center", py: 4 }}>
          <Typography variant="body1" sx={{ color: "#999" }}>
            {searchQuery ? "Không tìm thấy nguyên liệu nào phù hợp" : "Không có nguyên liệu nào"}
          </Typography>
        </Box>
      )}
    </Box>
  )
}

export default IngredientsTab
