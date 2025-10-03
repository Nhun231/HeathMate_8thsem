"use client";

import { useEffect, useState } from "react";
import {
  Box,
  Container,
  Typography,
  Button,
  ButtonGroup,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Card,
  CardContent,
  CardActionArea,
} from "@mui/material";
import { useDiary } from "../../context/DiaryContext.jsx";
import MealSection from "./MealSection";
import AddMealModal from "./AddMealModal";
import HistoryView from "./HistoryView";
import { useNavigate } from "react-router-dom";
import baseAxios from "../../api/axios.js";
import CustomAlert from "../common/Alert.jsx";
import MealService from "../../services/Meal";
import {
  WbSunny as BreakfastIcon,
  LunchDining as LunchIcon,
  DinnerDining as DinnerIcon,
  LocalCafe as SnackIcon,
} from "@mui/icons-material";

function FoodDiary() {
  const navigate = useNavigate();
  const { selectedDate, getTotalCalories } = useDiary();
  const [view, setView] = useState("today"); // 'today' or 'history'
  const [addMealModalOpen, setAddMealModalOpen] = useState(false);
  const [selectedMealType, setSelectedMealType] = useState(null);
  const [mealTypeDialogOpen, setMealTypeDialogOpen] = useState(false);
  const totalCalories = getTotalCalories(selectedDate);
  const [calculationData, setCalculationData] = useState(null);
  const [shouldRedirect, setShouldRedirect] = useState(false);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState({
    show: false,
    message: "",
    severity: "info", // 'success', 'error', 'warning', 'info'
  });

  // Meal data state
  const [mealsData, setMealsData] = useState({
    breakfast: [],
    lunch: [],
    dinner: [],
    snack: [],
  });
  const [mealsLoading, setMealsLoading] = useState(false);
  const [totalCaloriesToday, setTotalCaloriesToday] = useState(0);
  // Meal types with icons and colors
  const mealTypes = [
    {
      name: "Bữa sáng",
      icon: <BreakfastIcon sx={{ fontSize: 40 }} />,
      color: "#FF9800",
      description: "Bắt đầu ngày mới với năng lượng",
    },
    {
      name: "Bữa trưa",
      icon: <LunchIcon sx={{ fontSize: 40 }} />,
      color: "#4CAF50",
      description: "Bữa ăn chính giữa ngày",
    },
    {
      name: "Bữa tối",
      icon: <DinnerIcon sx={{ fontSize: 40 }} />,
      color: "#2196F3",
      description: "Kết thúc ngày với bữa tối",
    },
    {
      name: "Ăn vặt",
      icon: <SnackIcon sx={{ fontSize: 40 }} />,
      color: "#9C27B0",
      description: "Thưởng thức món ăn nhẹ",
    },
  ];

  const handleOpenAddMeal = (mealType) => {
    setSelectedMealType(mealType);
    setAddMealModalOpen(true);
    setMealTypeDialogOpen(false);
  };

  const handleCloseAddMeal = () => {
    setAddMealModalOpen(false);
    setSelectedMealType(null);
  };

  const handleOpenMealTypeDialog = () => {
    setMealTypeDialogOpen(true);
  };

  const handleCloseMealTypeDialog = () => {
    setMealTypeDialogOpen(false);
  };

  // Load meals for today
  const loadTodaysMeals = async () => {
    try {
      setMealsLoading(true);
      const today = new Date();
      console.log("ngày:", today);
      const response = await MealService.getMeals(today);

      console.log("Meal API Response:", response); // Debug log

      // Group meals by meal type
      const groupedMeals = {
        breakfast: [],
        lunch: [],
        dinner: [],
        snack: [],
      };

      let totalCalories = 0;

      if (response) {
        console.log("Processing meals:", response); // Debug log
        response.forEach((meal) => {
          console.log("Processing meal:", meal); // Debug log
          const mealType = meal.mealType;
          if (groupedMeals[mealType]) {
            const mealData = {
              id: meal._id,
              name: meal.isIngredient
                ? meal.ingredientId?.name
                : meal.dishId?.name,
              calories: meal.calories || 0,
              protein: meal.protein || 0,
              fat: meal.fat || 0,
              carbs: meal.carbs || 0,
              fiber: meal.fiber || 0,
              sugar: meal.sugar || 0,
              quantity: meal.quantity || 0,
              isIngredient: meal.isIngredient,
              mealType: meal.mealType,
            };
            console.log("Processed meal data:", mealData); // Debug log
            groupedMeals[mealType].push(mealData);
            totalCalories += meal.calories || 0;
          }
        });
      }

      console.log("Final grouped meals:", groupedMeals); // Debug log
      setMealsData(groupedMeals);
      setTotalCaloriesToday(totalCalories);
    } catch (error) {
      console.error("Error loading meals:", error);
    } finally {
      setMealsLoading(false);
    }
  };

  // Handle when a meal is added
  const handleMealAdded = () => {
    // Reload meals after adding
    loadTodaysMeals();
  };
  useEffect(() => {
    const checkCalculateData = async () => {
      try {
        const res = await baseAxios.get("/calculation/latest");
        if (res.data && res.data.tdee) {
          setCalculationData(res.data);
        } else {
          setAlert({
            show: true,
            message: "Vui lòng nhập thông tin cá nhân trước",
            severity: "warning",
          });
          setShouldRedirect(true);
        }
      } catch (err) {
        setAlert({
          show: true,
          message: "Vui lòng nhập thông tin cá nhân trước",
          severity: "warning",
        });
        setShouldRedirect(true);
      } finally {
        setLoading(false);
      }
    };

    checkCalculateData();
  }, []);
  useEffect(() => {
    if (shouldRedirect) {
      // Add a small delay so user can see the alert message
      const timer = setTimeout(() => {
        navigate("/calculate");
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [shouldRedirect, navigate]);

  // Load meals when component mounts
  useEffect(() => {
    if (view === "today") {
      loadTodaysMeals();
    }
  }, [view]);

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }
  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default", pb: 4 }}>
      {alert.show && (
        <Box
          sx={{
            position: "absolute",
            top: 16,
            left: "50%",
            transform: "translateX(-50%)",
            width: "90%",
            maxWidth: 500,
            zIndex: 9999,
          }}
        >
          <CustomAlert
            message={alert.message}
            variant={alert.severity}
            onClose={() => setAlert({ ...alert, show: false })}
          />
        </Box>
      )}
      <Container maxWidth="md">
        {/* Header */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            py: 3,
          }}
        >
          <Typography variant="h5" sx={{ fontWeight: 600, color: "#000" }}>
            Food Diary
          </Typography>
          <ButtonGroup variant="contained" disableElevation>
            <Button
              onClick={() => setView("today")}
              sx={{
                bgcolor: view === "today" ? "#000" : "transparent",
                color: view === "today" ? "#fff" : "#666",
                border: "none",
                "&:hover": {
                  bgcolor: view === "today" ? "#000" : "#f5f5f5",
                  border: "none",
                },
              }}
            >
              Hôm nay
            </Button>
            <Button
              onClick={() => setView("history")}
              sx={{
                bgcolor: view === "history" ? "#000" : "transparent",
                color: view === "history" ? "#fff" : "#666",
                border: "none",
                "&:hover": {
                  bgcolor: view === "history" ? "#000" : "#f5f5f5",
                  border: "none",
                },
              }}
            >
              Lịch sử
            </Button>
          </ButtonGroup>
        </Box>

        {view === "today" ? (
          <>
            {/* Total Calories Card */}
            <Box
              sx={{
                bgcolor: "white",
                borderRadius: 2,
                p: 4,
                mb: 3,
                textAlign: "center",
                boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
              }}
            >
              <Typography
                variant="h6"
                sx={{ color: "#4CAF50", fontWeight: 500, mb: 1 }}
              >
                Nhật ký ăn uống hôm nay
              </Typography>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "baseline",
                  justifyContent: "center",
                  gap: 1,
                }}
              >
                <Typography
                  variant="h3"
                  sx={{ color: "#4CAF50", fontWeight: 600 }}
                >
                  {mealsLoading ? "..." : totalCaloriesToday}
                </Typography>
                <Typography variant="body1" sx={{ color: "#999" }}>
                  calories
                </Typography>
              </Box>
              <Box
                sx={{
                  width: 60,
                  height: 3,
                  bgcolor: "#4CAF50",
                  mx: "auto",
                  mt: 2,
                  borderRadius: 2,
                }}
              />
            </Box>

            {/* Meal Sections */}
            <MealSection
              mealType="Bữa sáng"
              meals={mealsData.breakfast}
              loading={mealsLoading}
              onAddMeal={() => handleOpenAddMeal("Bữa sáng")}
              onMealAdded={handleMealAdded}
            />
            <MealSection
              mealType="Bữa trưa"
              meals={mealsData.lunch}
              loading={mealsLoading}
              onAddMeal={() => handleOpenAddMeal("Bữa trưa")}
              onMealAdded={handleMealAdded}
            />
            <MealSection
              mealType="Bữa tối"
              meals={mealsData.dinner}
              loading={mealsLoading}
              onAddMeal={() => handleOpenAddMeal("Bữa tối")}
              onMealAdded={handleMealAdded}
            />
            <MealSection
              mealType="Ăn vặt"
              meals={mealsData.snack}
              loading={mealsLoading}
              onAddMeal={() => handleOpenAddMeal("Ăn vặt")}
              onMealAdded={handleMealAdded}
            />

            {/* Bottom Action Buttons */}
            <Box
              sx={{
                display: "flex",
                gap: 2,
                mt: 3,
              }}
            >
              <Button
                variant="contained"
                fullWidth
                sx={{
                  bgcolor: "#4CAF50",
                  color: "white",
                  py: 1.5,
                  "&:hover": { bgcolor: "#45a049" },
                }}
                onClick={handleOpenMealTypeDialog}
              >
                + Thêm món ăn mới
              </Button>
              {/* <Button
                variant="outlined"
                fullWidth
                sx={{
                  borderColor: "#4CAF50",
                  color: "#4CAF50",
                  py: 1.5,
                  "&:hover": { borderColor: "#45a049", bgcolor: "rgba(76, 175, 80, 0.04)" },
                }}
              >
                ✨ Gợi ý AI
              </Button> */}
              <Button
                variant="outlined"
                fullWidth
                sx={{
                  borderColor: "#4CAF50",
                  color: "#4CAF50",
                  py: 1.5,
                  "&:hover": {
                    borderColor: "#45a049",
                    bgcolor: "rgba(76, 175, 80, 0.04)",
                  },
                }}
                onClick={() => setView("history")}
              >
                🕐 Xem lịch sử
              </Button>
            </Box>
          </>
        ) : (
          <HistoryView onBack={() => setView("today")} />
        )}
      </Container>

      {/* Meal Type Selection Dialog */}
      <Dialog
        open={mealTypeDialogOpen}
        onClose={handleCloseMealTypeDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            width: "90vw",
            maxWidth: "500px",
          },
        }}
      >
        <DialogTitle
          sx={{
            textAlign: "center",
            bgcolor: "#f5f5f5",
            borderBottom: "1px solid #e0e0e0",
          }}
        >
          <Typography variant="h6" sx={{ color: "#4CAF50", fontWeight: 600 }}>
            Chọn bữa ăn
          </Typography>
          <Typography variant="body2" sx={{ color: "#666", mt: 1 }}>
            Bạn muốn thêm món ăn cho bữa nào?
          </Typography>
        </DialogTitle>

        <DialogContent sx={{ p: 3 }}>
          <Grid container spacing={2}>
            {mealTypes.map((meal) => (
              <Grid item xs={6} key={meal.name}>
                <Card
                  sx={{
                    height: 140, // Fixed height for all cards
                    border: "1px solid #e0e0e0",
                    "&:hover": {
                      borderColor: meal.color,
                      boxShadow: `0 4px 12px ${meal.color}20`,
                    },
                  }}
                >
                  <CardActionArea
                    onClick={() => handleOpenAddMeal(meal.name)}
                    sx={{
                      p: 2,
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      textAlign: "center",
                      justifyContent: "center", // Center content vertically
                    }}
                  >
                    <Box sx={{ color: meal.color, mb: 1 }}>{meal.icon}</Box>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                      {meal.name}
                    </Typography>
                    <Typography variant="caption" sx={{ color: "#666" }}>
                      {meal.description}
                    </Typography>
                  </CardActionArea>
                </Card>
              </Grid>
            ))}
          </Grid>
        </DialogContent>

        <DialogActions sx={{ p: 3, bgcolor: "#f5f5f5" }}>
          <Button onClick={handleCloseMealTypeDialog} sx={{ color: "#666" }}>
            Hủy
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Meal Modal */}
      <AddMealModal
        open={addMealModalOpen}
        onClose={handleCloseAddMeal}
        mealType={selectedMealType}
        onMealAdded={handleMealAdded}
      />
    </Box>
  );
}

export default FoodDiary;
