"use client"
import { useState, useEffect } from "react"
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress
} from "@mui/material"
import { Close as CloseIcon, Save as SaveIcon } from "@mui/icons-material"
import IngredientService from "../../services/Ingredient"

function CustomIngredientModal({ open, onClose, ingredient = null, onSave }) {
  const [formData, setFormData] = useState({
    name: "",
    type: "",
    caloPer100g: "",
    proteinPer100g: "",
    fatPer100g: "",
    carbsPer100g: "",
    fiberPer100g: "",
    sugarPer100g: ""
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [alert, setAlert] = useState({ show: false, message: "", severity: "info" })

  // Ingredient types
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

  // Initialize form data when ingredient prop changes
  useEffect(() => {
    if (ingredient) {
      setFormData({
        name: ingredient.name || "",
        type: ingredient.type || "",
        caloPer100g: ingredient.caloPer100g?.toString() || "",
        proteinPer100g: ingredient.proteinPer100g?.toString() || "",
        fatPer100g: ingredient.fatPer100g?.toString() || "",
        carbsPer100g: ingredient.carbsPer100g?.toString() || "",
        fiberPer100g: ingredient.fiberPer100g?.toString() || "",
        sugarPer100g: ingredient.sugarPer100g?.toString() || ""
      })
    } else {
      setFormData({
        name: "",
        type: "",
        caloPer100g: "",
        proteinPer100g: "",
        fatPer100g: "",
        carbsPer100g: "",
        fiberPer100g: "",
        sugarPer100g: ""
      })
    }
    setErrors({})
    setAlert({ show: false, message: "", severity: "info" })
  }, [ingredient, open])

  const handleChange = (field) => (event) => {
    const value = event.target.value
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ""
      }))
    }
  }

  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.name.trim()) {
      newErrors.name = "Tên nguyên liệu là bắt buộc"
    }
    
    if (!formData.type) {
      newErrors.type = "Nhóm thực phẩm là bắt buộc"
    }
    
    // Validate numeric fields
    const numericFields = ['caloPer100g', 'proteinPer100g', 'fatPer100g', 'carbsPer100g', 'fiberPer100g', 'sugarPer100g']
    const fieldLabels = {
      caloPer100g: "Calo",
      proteinPer100g: "Đạm",
      fatPer100g: "Béo",
      carbsPer100g: "Tinh bột",
      fiberPer100g: "Chất xơ",
      sugarPer100g: "Đường"
    }
    
    numericFields.forEach(field => {
      const value = formData[field]
      if (!value || value.trim() === "") {
        newErrors[field] = `${fieldLabels[field]} là bắt buộc`
      } else if (isNaN(value) || parseFloat(value) < 0) {
        newErrors[field] = `${fieldLabels[field]} phải là số không âm`
      }
    })
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = async () => {
    if (!validateForm()) {
      setAlert({
        show: true,
        message: "Vui lòng kiểm tra và điền đầy đủ thông tin",
        severity: "error"
      })
      return
    }

    setLoading(true)
    try {
      // Convert string values to numbers
      const ingredientData = {
        name: formData.name.trim(),
        type: formData.type,
        caloPer100g: parseFloat(formData.caloPer100g),
        proteinPer100g: parseFloat(formData.proteinPer100g),
        fatPer100g: parseFloat(formData.fatPer100g),
        carbsPer100g: parseFloat(formData.carbsPer100g),
        fiberPer100g: parseFloat(formData.fiberPer100g),
        sugarPer100g: parseFloat(formData.sugarPer100g)
      }

      let result
      if (ingredient) {
        // Update existing ingredient
        result = await IngredientService.update(ingredient._id, ingredientData)
        setAlert({
          show: true,
          message: "Cập nhật nguyên liệu thành công!",
          severity: "success"
        })
      } else {
        // Create new ingredient
        result = await IngredientService.create(ingredientData)
        setAlert({
          show: true,
          message: "Tạo nguyên liệu mới thành công!",
          severity: "success"
        })
      }

      // Call onSave callback with the result
      if (onSave) {
        onSave(result)
      }

      // Close modal after a short delay
      setTimeout(() => {
        onClose()
      }, 1500)

    } catch (error) {
      console.error('Error saving ingredient:', error)
      setAlert({
        show: true,
        message: error.response?.data?.message || "Có lỗi xảy ra khi lưu nguyên liệu",
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

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2 }
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
          {ingredient ? "Chỉnh sửa nguyên liệu" : "Thêm nguyên liệu mới"}
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

        {/* Basic Information Section */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, color: "#4CAF50", mb: 3 }}>
            Thông tin cơ bản
          </Typography>
          
          {/* Name Field */}
          <Box sx={{ mb: 3 }}>
            <TextField
              fullWidth
              label="Tên nguyên liệu *"
              value={formData.name}
              onChange={handleChange('name')}
              error={!!errors.name}
              helperText={errors.name}
              disabled={loading}
            />
          </Box>

          {/* Food Group Field */}
          <Box>
            <FormControl fullWidth error={!!errors.type}>
              <InputLabel>Nhóm thực phẩm *</InputLabel>
              <Select
                value={formData.type}
                onChange={handleChange('type')}
                label="Nhóm thực phẩm *"
                disabled={loading}
                sx={{ minHeight: 56 }}
              >
                {ingredientTypes.map((type) => (
                  <MenuItem key={type} value={type}>
                    {type}
                  </MenuItem>
                ))}
              </Select>
              {errors.type && (
                <Typography variant="caption" color="error" sx={{ ml: 2, mt: 0.5 }}>
                  {errors.type}
                </Typography>
              )}
            </FormControl>
          </Box>
        </Box>

        {/* Nutritional Information Section */}
        <Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, color: "#4CAF50", mb: 3 }}>
            Thông tin dinh dưỡng (trên 100g)
          </Typography>
          <Grid container spacing={3}>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Calo (kcal) *"
              type="number"
              value={formData.caloPer100g}
              onChange={handleChange('caloPer100g')}
              error={!!errors.caloPer100g}
              helperText={errors.caloPer100g}
              disabled={loading}
              inputProps={{ min: 0, step: 0.1 }}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Đạm (g) *"
              type="number"
              value={formData.proteinPer100g}
              onChange={handleChange('proteinPer100g')}
              error={!!errors.proteinPer100g}
              helperText={errors.proteinPer100g}
              disabled={loading}
              inputProps={{ min: 0, step: 0.1 }}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Béo (g) *"
              type="number"
              value={formData.fatPer100g}
              onChange={handleChange('fatPer100g')}
              error={!!errors.fatPer100g}
              helperText={errors.fatPer100g}
              disabled={loading}
              inputProps={{ min: 0, step: 0.1 }}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Tinh bột (g) *"
              type="number"
              value={formData.carbsPer100g}
              onChange={handleChange('carbsPer100g')}
              error={!!errors.carbsPer100g}
              helperText={errors.carbsPer100g}
              disabled={loading}
              inputProps={{ min: 0, step: 0.1 }}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Chất xơ (g) *"
              type="number"
              value={formData.fiberPer100g}
              onChange={handleChange('fiberPer100g')}
              error={!!errors.fiberPer100g}
              helperText={errors.fiberPer100g}
              disabled={loading}
              inputProps={{ min: 0, step: 0.1 }}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Đường (g) *"
              type="number"
              value={formData.sugarPer100g}
              onChange={handleChange('sugarPer100g')}
              error={!!errors.sugarPer100g}
              helperText={errors.sugarPer100g}
              disabled={loading}
              inputProps={{ min: 0, step: 0.1 }}
            />
          </Grid>
          </Grid>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3, bgcolor: "#f5f5f5" }}>
        <Button
          onClick={handleClose}
          disabled={loading}
          sx={{ color: "#666" }}
        >
          Hủy
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          disabled={loading}
          startIcon={loading ? <CircularProgress size={16} /> : <SaveIcon />}
          sx={{
            bgcolor: "#4CAF50",
            "&:hover": { bgcolor: "#45a049" },
            "&:disabled": { bgcolor: "#ccc" }
          }}
        >
          {loading ? "Đang lưu..." : (ingredient ? "Cập nhật" : "Tạo mới")}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default CustomIngredientModal
