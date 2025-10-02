"use client"

import { useEffect, useState } from "react"
import {Box, Container, Typography, Button, ButtonGroup, CircularProgress} from "@mui/material"
import { useDiary } from "../../context/DiaryContext.jsx"
import MealSection from "./MealSection"
import AddMealModal from "./AddMealModal"
import HistoryView from "./HistoryView"
import {useNavigate} from "react-router-dom";
import baseAxios from "../../api/axios.js";
import CustomAlert from "../common/Alert.jsx";

function FoodDiary() {
    const navigate = useNavigate()
  const { selectedDate, getTotalCalories } = useDiary()
  const [view, setView] = useState("today") // 'today' or 'history'
  const [addMealModalOpen, setAddMealModalOpen] = useState(false)
  const [selectedMealType, setSelectedMealType] = useState(null)
  const totalCalories = getTotalCalories(selectedDate)
    const [calculationData, setCalculationData] = useState(null);
    const [shouldRedirect, setShouldRedirect] = useState(false);
    const [loading, setLoading] = useState(true);
    const [alert, setAlert] = useState({
        show: false,
        message: '',
        severity: 'info', // 'success', 'error', 'warning', 'info'
    });
  const handleOpenAddMeal = (mealType) => {
    setSelectedMealType(mealType)
    setAddMealModalOpen(true)
  }

  const handleCloseAddMeal = () => {
    setAddMealModalOpen(false)
    setSelectedMealType(null)
  }
    useEffect(() => {
        const checkCalculateData = async () => {
            try {
                const res = await baseAxios.get('/calculation/latest');
                if (res.data && res.data.tdee) {
                    setCalculationData(res.data);
                } else {
                    setAlert({
                        show: true,
                        message: 'Vui lòng nhập thông tin cá nhân trước',
                        severity: 'warning',
                    });
                    setShouldRedirect(true);
                }
            } catch (err) {
                setAlert({
                    show: true,
                    message: 'Vui lòng nhập thông tin cá nhân trước',
                    severity: 'warning',
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
                navigate('/calculate');
            }, 3000); 
            
            return () => clearTimeout(timer);
        }
    }, [shouldRedirect, navigate]);

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
                <CircularProgress />
            </Box>
        );
    }
  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default", pb: 4 }}>
        {alert.show && (
            <Box
                sx={{
                    position: 'absolute',
                    top: 16,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '90%',
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
              <Typography variant="h6" sx={{ color: "#4CAF50", fontWeight: 500, mb: 1 }}>
                Nhật ký ăn uống hôm nay
              </Typography>
              <Box sx={{ display: "flex", alignItems: "baseline", justifyContent: "center", gap: 1 }}>
                <Typography variant="h3" sx={{ color: "#4CAF50", fontWeight: 600 }}>
                  {totalCalories}
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
            <MealSection mealType="Bữa sáng" onAddMeal={() => handleOpenAddMeal("Bữa sáng")} />
            <MealSection mealType="Bữa trưa" onAddMeal={() => handleOpenAddMeal("Bữa trưa")} />
            <MealSection mealType="Bữa tối" onAddMeal={() => handleOpenAddMeal("Bữa tối")} />
            <MealSection mealType="Ăn vặt" onAddMeal={() => handleOpenAddMeal("Ăn vặt")} />

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
                onClick={() => handleOpenAddMeal("Bữa sáng")}
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
                  "&:hover": { borderColor: "#45a049", bgcolor: "rgba(76, 175, 80, 0.04)" },
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

      {/* Add Meal Modal */}
      <AddMealModal open={addMealModalOpen} onClose={handleCloseAddMeal} mealType={selectedMealType} />
    </Box>
  )
}

export default FoodDiary
