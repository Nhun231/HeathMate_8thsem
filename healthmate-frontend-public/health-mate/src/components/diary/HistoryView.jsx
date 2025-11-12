import { useState, useEffect } from "react";
import RestaurantIcon from "@mui/icons-material/Restaurant";
import { Box, Typography, Card, CircularProgress } from "@mui/material";
import { DateCalendar, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import viLocale from "date-fns/locale/vi";
import { useDiary } from "../../context/DiaryContext";
import MealSection from "./MealSection";
import format from "date-fns/format";
import { subDays } from "date-fns";
function HistoryView() {
  const {
    selectedDate,
    setSelectedDate,
    getTotalNutrition,
    getDayEntries,
    reloadDate,
  } = useDiary();

  const [currentDate, setCurrentDate] = useState(new Date(selectedDate));
  const [mealsGrouped, setMealsGrouped] = useState({
    breakfast: [],
    lunch: [],
    dinner: [],
    snack: [],
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);

      // Lấy meals từ context
      const meals = getDayEntries(selectedDate);

      // Khởi tạo grouped meals
      const grouped = { breakfast: [], lunch: [], dinner: [], snack: [] };

      meals.forEach((meal) => {
        if (grouped[meal.mealType]) {
          grouped[meal.mealType].push({
            id: meal._id,
            name: meal.dishId?.name || meal.name,
            calories: meal.calories || 0,
            protein: meal.protein || 0,
            fat: meal.fat || 0,
            carbs: meal.carbs || 0,
            fiber: meal.fiber || 0,
            quantity: meal.quantity || 0,
          });
        }
      });

      console.log("Meals grouped for MealSection:", grouped);
      setMealsGrouped(grouped);
      setLoading(false);
    };

    load();
  }, [selectedDate, getDayEntries]);

  const totals = getTotalNutrition(selectedDate);
  const formattedDate = format(currentDate, "dd/MM/yyyy");

  return (
    <Box>
      {/* Combined Calendar + Nutrition Box */}
      <Card
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" }, 
          p: 2,
          mb: 3,
          borderRadius: 2,
          border: "1px solid #e0e0e0",
          gap: 2,
          alignItems: "stretch",
        }}
      >
        {/* Left: Calendar */}
        <Box
          sx={{
            flex: { xs: "unset", sm: 1 },
            pr: { xs: 0, sm: 2 },
            mb: { xs: 2, sm: 0 },
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            border: "1px solid #e0e0e0",
            borderRadius: 2,
            p: 2,
            backgroundColor: "rgb(241, 248, 244)",
          }}
        >
          <Typography sx={{ mb: 1, fontWeight: 500, textAlign: "center" }}>
            Chọn ngày để xem nhật ký dinh dưỡng
          </Typography>
          <LocalizationProvider
            dateAdapter={AdapterDateFns}
            adapterLocale={viLocale}
          >
            <DateCalendar
              value={currentDate}
              maxDate={subDays(new Date(), 1)}
              onChange={(newDate) => {
                setCurrentDate(newDate);
                const isoDate = newDate.toLocaleDateString("en-CA");
                setSelectedDate(isoDate);
                reloadDate(isoDate);
              }}
              sx={{
                "& .MuiPickersDay-root": { borderRadius: "50%" },
                "& .MuiPickersCalendarHeader-root": {
                  borderBottom: "1px solid #e0e0e0",
                },
                border: "none",
                borderRadius: "8px",
                p: 1,
              }}
            />
          </LocalizationProvider>
        </Box>

        {/* Right: Total Nutrition */}
        <Box
          sx={{
            flex: { xs: "unset", sm: 2 },
            pl: { xs: 0, sm: 2 },
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-start",
            alignItems: "center",
            textAlign: "center",
            border: "1px solid #e0e0e0",
            borderRadius: 2,
            p: 2,
          }}
        >
          <Typography sx={{ fontWeight: 500, mb: 4 }}>
            Chỉ số dinh dưỡng ngày {formattedDate}
          </Typography>

          {totals ? (
            <>
              <Typography
                variant="h4"
                sx={{ color: "#4CAF50", fontWeight: 600, mb: 2 }}
              >
                {Math.round(totals.calories)} calo
              </Typography>

              <Box
                sx={{
                  display: "flex",
                  flexWrap: "wrap",
                  justifyContent: "space-around",
                  mt: 2,
                  width: "100%",
                  gap: 3,
                }}
              >
                {[
                  {
                    label: "Tinh bột",
                    value: totals.carbs,
                    color: "#FF9800",
                    desc: "Cung cấp năng lượng chính cho cơ thể và hoạt động hàng ngày",
                  },
                  {
                    label: "Chất đạm",
                    value: totals.protein,
                    color: "#2196F3",
                    desc: "Giúp xây dựng và sửa chữa cơ, mô, và các enzym quan trọng",
                  },
                  {
                    label: "Chất béo",
                    value: totals.fat,
                    color: "#E91E63",
                    desc: "Nguồn năng lượng, giúp hấp thu vitamin và duy trì chức năng tế bào",
                  },
                  {
                    label: "Chất xơ",
                    value: totals.fiber,
                    color: "#9C27B0",
                    desc: "Hỗ trợ tiêu hóa, kiểm soát đường huyết và giảm cholesterol",
                  },
                ].map((item) => (
                  <Box
                    key={item.label}
                    sx={{
                      textAlign: "center",
                      flex: "1 1 45%",
                      minWidth: 100,
                    }}
                  >
                    <Typography sx={{ fontWeight: 500, color: item.color }}>
                      {item.label}
                    </Typography>
                    <Typography sx={{ fontWeight: 600, color: item.color }}>
                      {Number(item.value || 0).toFixed(1)}g
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: "0.7rem",
                        color: "#999",
                        mt: 0.5,
                        whiteSpace: "normal",
                        wordBreak: "break-word",
                      }}
                    >
                      {item.desc}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </>
          ) : (
            <Typography sx={{ color: "#999" }}>
              Chưa có dữ liệu dinh dưỡng
            </Typography>
          )}
        </Box>
      </Card>

      {/* Meal Sections */}
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {["breakfast", "lunch", "dinner", "snack"].every(
            (key) => mealsGrouped[key].length === 0
          ) ? (
            <Box
              sx={{
                bgcolor: "white",
                borderRadius: 2,
                p: 3,
                mb: 2,
                boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                textAlign: "center",
              }}
            >
              <RestaurantIcon sx={{ fontSize: 48, color: "#C8E6C9", mb: 1 }} />
              <Typography sx={{ color: "#999", mb: 1, fontWeight: 500 }}>
                Không có bữa ăn nào trong ngày này
              </Typography>
            </Box>
          ) : (
            <>
              {console.log("mealsGrouped:", mealsGrouped)}
              <MealSection
                mealType="Bữa sáng"
                meals={mealsGrouped.breakfast}
                readOnly
              />
              <MealSection
                mealType="Bữa trưa"
                meals={mealsGrouped.lunch}
                readOnly
              />
              <MealSection
                mealType="Bữa tối"
                meals={mealsGrouped.dinner}
                readOnly
              />
              <MealSection
                mealType="Ăn vặt"
                meals={mealsGrouped.snack}
                readOnly
              />
            </>
          )}
        </>
      )}
    </Box>
  );
}

export default HistoryView;
