import React, { useEffect, useState } from "react";
import { Container, Typography, Paper, Grid, Box, Button } from "@mui/material";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { useNavigate } from "react-router-dom";
import { getCurrentDietPlan } from "../../services/DietPlan";
import { getAllCalculations } from "../../services/Calculation";
import { getMealSummary } from "../../services/Meal.js";
import { getWaterData } from "../../services/WaterService.js";
const COLORS = ["#4CAF50", "#E0E0E0"];

const DietPlanProgress = () => {
  const [loading, setLoading] = useState(true);
  const [dietPlan, setDietPlan] = useState(null);
  const [calculations, setCalculations] = useState([]);
  const [targetWeight, setTargetWeight] = useState(0);
  const [currentWeight, setCurrentWeight] = useState(0);
  const [error, setError] = useState("");
  const [avgCalories, setAvgCalories] = useState(0);
  const navigate = useNavigate();
  const [avgWater, setAvgWater] = useState({ consumed: 0, target: 0 });

  const goalMap = {
    GainWeight: "Tăng cân",
    LoseWeight: "Giảm cân",
    MaintainWeight: "Giữ cân",
  };
  const progressPercentage = avgWater.target
    ? Math.min(Math.round((avgWater.consumed / avgWater.target) * 100), 100)
    : 0;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        const plan = await getCurrentDietPlan(token);
        const calcs = await getAllCalculations(token);
        if (!plan) {
          setError("");
          setDietPlan(null);
          return;
        }
        if (!calcs || calcs.length === 0) {
          setError("");
          setCalculations([]);
          return;
        }

        setDietPlan(plan);

        const sortedCalcs = calcs.sort(
          (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
        );
        setCalculations(sortedCalcs);

        const latestCalc = sortedCalcs[sortedCalcs.length - 1];
        setCurrentWeight(latestCalc.weight);

        setTargetWeight(plan.targetWeightChange ?? 0);
        const startDate = new Date(plan.startDate);
        const today = new Date();

        let totalCaloriesSum = 0;
        let daysWithData = 0;

        for (
          let d = new Date(startDate);
          d <= today;
          d.setDate(d.getDate() + 1)
        ) {
          try {
            const summary = await getMealSummary(new Date(d));
            if (summary?.totalCalories && summary.totalCalories > 0) {
              totalCaloriesSum += summary.totalCalories;
              daysWithData++;
            }
          } catch (e) {
            console.warn(`Không có dữ liệu ngày ${d.toDateString()}`);
          }
        }

        const avg = daysWithData > 0 ? totalCaloriesSum / daysWithData : 0;
        setAvgCalories(avg);
        // Calculate average water consumption
        let totalConsumed = 0;
        let daysWithWaterData = 0;

        const start = new Date(plan.startDate);
        const end = new Date(); // today

        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
          try {
            const dateString = d.toISOString().split("T")[0];
            const response = await getWaterData(dateString);
            const waterData = response?.data;

            if (waterData && waterData.consumed > 0) {
              totalConsumed += waterData.consumed;
              daysWithWaterData++;
            }
          } catch (e) {
            console.warn(`Không có dữ liệu nước cho ngày ${d.toDateString()}`);
          }
        }
        const avgConsumed =
          daysWithWaterData > 0 ? totalConsumed / daysWithWaterData : 0;
        const avgTarget = latestCalc.waterNeeded * 1000; // convert to ml
        setAvgWater({ consumed: avgConsumed, target: avgTarget });
      } catch (err) {
        console.error(err);
        setError("Không thể tải dữ liệu kế hoạch dinh dưỡng.");
        setAvgCalories(0);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <Typography>Đang tải...</Typography>;

  if (!dietPlan) {
    return (
      <Box textAlign="center" mt={5}>
        <Typography color="error">
          Chưa có kế hoạch dinh dưỡng. Bạn cần lập kế hoạch.
        </Typography>
        <Button
          variant="contained"
          sx={{ mt: 2 }}
          onClick={() => navigate("/set-goal")}
        >
          Lập kế hoạch ngay
        </Button>
      </Box>
    );
  }

  if (calculations.length === 0) {
    return (
      <Box textAlign="center" mt={5}>
        <Typography color="error">
          Chưa có dữ liệu tính toán. Bạn cần nhập dữ liệu cân nặng.
        </Typography>
        <Button
          variant="contained"
          sx={{ mt: 2 }}
          onClick={() => navigate("/calculate")}
        >
          Nhập dữ liệu ngay
        </Button>
      </Box>
    );
  }

  // Pie chart 
  const today = new Date();
  const startDate = new Date(dietPlan.startDate);
  const endDate = dietPlan.endDate ? new Date(dietPlan.endDate) : today;
  const startTime = startDate.getTime();
  const endTime = endDate.getTime();
  const totalDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
  const elapsedDays = Math.max(
    0,
    Math.min(totalDays, Math.ceil((today - startDate) / (1000 * 60 * 60 * 24)))
  );
  const dayPercent = (elapsedDays / totalDays) * 100;

  const dayData = [
    { name: "Đã qua", value: dayPercent },
    { name: "Còn lại", value: 100 - dayPercent },
  ];

  // Sort calculations within plan duration
  const filteredCalcs = calculations.filter((c) => {
    const time = new Date(c.createdAt).getTime();
    return time >= startTime && time <= endTime;
  });

  // Select latest calc per day
  const dailyLatestMap = new Map();

  filteredCalcs.forEach((c) => {
    const dateKey = new Date(c.createdAt).toISOString().split("T")[0]; 
    const existing = dailyLatestMap.get(dateKey);
    if (!existing || new Date(c.createdAt) > new Date(existing.createdAt)) {
      dailyLatestMap.set(dateKey, c);
    }
  });

  const uniqueDailyCalcs = Array.from(dailyLatestMap.values()).sort(
    (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
  );

  const sameDayCalc = calculations.find((c) => {
    const calcDate = new Date(c.createdAt);
    return (
      calcDate.getFullYear() === startDate.getFullYear() &&
      calcDate.getMonth() === startDate.getMonth() &&
      calcDate.getDate() === startDate.getDate()
    );
  });

  const latestBeforeStart = !sameDayCalc
    ? [...calculations]
        .reverse()
        .find((c) => new Date(c.createdAt).getTime() < startTime)
    : null;

    const startWeight =
    sameDayCalc?.weight ??
    latestBeforeStart?.weight ??
    uniqueDailyCalcs[0]?.weight ??
    null;

  // Data for line chart
  const weightData = [
    { date: startTime, weight: startWeight, target: targetWeight },
    ...uniqueDailyCalcs.map((c) => ({
      date: new Date(c.createdAt).getTime(),
      weight: c.weight,
      target: targetWeight,
    })),
    { date: endTime, weight: null, target: targetWeight },
  ];

  const numTicks = 4;
  const step = (endTime - startTime) / numTicks;
  const ticks = Array.from(
    { length: numTicks + 1 },
    (_, i) => startTime + i * step
  );

  const weights = [
    ...filteredCalcs.map((c) => c.weight),
    startWeight ?? targetWeight, 
  ];

  const minWeight = Math.min(...weights);
  const maxWeight = Math.max(...weights);

  // Calculate y-axis bounds
  let yMin = Math.floor(Math.min(minWeight, targetWeight) - 2);
  let yMax = Math.ceil(Math.max(maxWeight, targetWeight) + 2);

  // Suitable step
  const diff = yMax - yMin;
  const stepY = diff > 8 ? 2 : 1;
  yMax = yMin + Math.ceil(diff / stepY) * stepY;

  // Generate y-axis ticks
  const yTicks = Array.from(
    { length: Math.floor((yMax - yMin) / stepY) + 1 },
    (_, i) => yMin + i * stepY
  );

  return (
    <Container sx={{ mt: 5 }}>
      <Typography
        variant="h4"
        mb={3}
        fontWeight="bold"
        color="#2e7d32"
        textAlign="center"
      >
        Tiến trình kế hoạch dinh dưỡng
      </Typography>

      {/* Pie chart + Info */}
      <Paper
        sx={{
          p: 4,
          mb: 4,
          borderRadius: 3,
          bgcolor: "#f5f5f5",
          mx: "auto",
          maxWidth: 1100,
        }}
      >
        <Grid container spacing={4} alignItems="center" justifyContent="center">
          {/* Pie Chart */}
          <Grid
            item
            xs={12}
            md={6}
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <PieChart width={220} height={220}>
              <Pie
                data={dayData}
                dataKey="value"
                nameKey="name"
                innerRadius={70}
                outerRadius={90}
                startAngle={90}
                endAngle={-270}
              >
                {dayData.map((entry, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
            </PieChart>
            <Typography mt={2} fontWeight="500" textAlign="center">
              Bạn đã thực hiện được {elapsedDays} / {totalDays} ngày theo kế
              hoạch
            </Typography>
          </Grid>

          {/* Info */}
          <Grid
            item
            xs={12}
            md={6}
            sx={{ display: "flex", justifyContent: "center" }}
          >
            <Box>
              <Typography variant="h5" fontWeight="bold" gutterBottom>
                Thông tin kế hoạch
              </Typography>
              <Typography variant="body1" fontSize="1.1rem">
                <strong>Mục tiêu: {goalMap[dietPlan.goal]}</strong>
              </Typography>
              <Typography variant="body1" fontSize="1.1rem">
                <strong>Calo mỗi ngày: {dietPlan.dailyCalories} calo</strong>
              </Typography>
              <Typography variant="body1" fontSize="1.1rem">
                <strong>
                  Cân nặng mong muốn: {dietPlan.targetWeightChange} kg
                </strong>
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Line chart + Placeholder */}
      <Paper
        sx={{
          p: 4,
          borderRadius: 3,
          bgcolor: "#f5f5f5",
          mx: "auto",
          maxWidth: 1100,
        }}
      >
        <Grid container spacing={3} alignItems="stretch">
          {/* Line chart */}
          <Grid item xs={12} md={6} sx={{ display: "flex" }}>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h6" mb={2} textAlign="center">
                Tiến trình cân nặng
              </Typography>
              <LineChart
                width={500}
                height={250}
                data={weightData}
                style={{ margin: "0 auto" }}
                margin={{ top: 40, right: 40, left: 40, bottom: 40 }} // thêm margin để label không đè
              >
                <CartesianGrid strokeDasharray="3 3" />

                <XAxis
                  dataKey="date"
                  type="number"
                  domain={[
                    new Date(dietPlan.startDate).getTime(),
                    new Date(dietPlan.endDate).getTime(),
                  ]}
                  ticks={ticks}
                  tickMargin={25}
                  tickFormatter={(timestamp) =>
                    new Date(timestamp).toLocaleDateString("vi-VN", {
                      day: "2-digit",
                      month: "2-digit",
                    })
                  }
                  label={{
                    value: "(ngày)",
                    position: "right",
                    offset: -30,
                  }}
                />

                <YAxis
                  domain={[yMin, yMax]}
                  interval={0}
                  ticks={yTicks}
                  tickFormatter={(value) => Math.round(value)}
                  label={{
                    value: "(kg)",
                    position: "top",
                    offset: 15,
                  }}
                />

                <Tooltip
                  labelFormatter={(timestamp) =>
                    new Date(timestamp).toLocaleDateString("vi-VN")
                  }
                  formatter={(value, name) => {
                    if (name === "weight") return [`${value} kg`, "Cân nặng"];
                    if (name === "target") return [`${value} kg`, "Mục tiêu"];
                    return [value, name];
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="weight"
                  stroke="#FF5722"
                  strokeWidth={3}
                  dot={{ r: 5 }}
                />
                <Line
                  type="monotone"
                  dataKey="target"
                  stroke="#4CAF50"
                  strokeDasharray="5 5"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>

              <Typography
                textAlign="center"
                variant="h5"
                fontWeight="bold"
                mt={1}
              >
                Hiện tại: {currentWeight} kg
              </Typography>
            </Box>
          </Grid>

          <Grid
            item
            xs={12}
            md={6}
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "flex-start",
            }}
          >
            <Box textAlign="center" sx={{ mt: "auto", mb: "auto", ml: 14 }}>
              <Typography variant="h6" mb={2}>
                Calories trung bình
              </Typography>
              {(() => {
                const diff = avgCalories - dietPlan.dailyCalories;
                let color = "#4CAF50";
                let message = "Tuyệt vời ! Tiếp tục duy trì bạn nhé";
                let messageColor = "#4CAF50";

                if (diff < -150) {
                  color = "#FFC107";
                  message =
                    "Ít hơn mức khuyến khị - thử tăng khẩu phần ăn mỗi ngày bạn nhé !";
                  messageColor = "#FFC107";
                } else if (diff > 100) {
                  color = "#f44336";
                  message =
                    "Vượt mức khuyến nghị - thử giảm khẩu phần ăn mỗi ngày bạn nhé !";
                  messageColor = "#f44336";
                }

                const data = [
                  {
                    name: "Trung bình",
                    value: Math.min(avgCalories, dietPlan.dailyCalories),
                  },
                  {
                    name: "Thiếu",
                    value: Math.max(dietPlan.dailyCalories - avgCalories, 0),
                  },
                ];

                return (
                  <>
                    <PieChart
                      width={250}
                      height={250}
                      style={{ display: "inline-block" }}
                    >
                      <Pie
                        data={data}
                        dataKey="value"
                        innerRadius={80}
                        outerRadius={100}
                        startAngle={90}
                        endAngle={-270}
                        stroke="none"
                      >
                        <Cell fill={color} />
                        <Cell fill="#E0E0E0" />
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#fff",
                          border: "1px solid #ddd",
                          borderRadius: "8px",
                          fontSize: "0.9rem",
                        }}
                        formatter={() => [
                          `${avgCalories.toFixed(0)} / ${
                            dietPlan.dailyCalories
                          } kcal`,
                        ]}
                      />
                    </PieChart>
                    <Typography variant="h5" fontWeight="bold">
                      Trung bình {avgCalories.toFixed(0)} kcal/ngày
                    </Typography>
                    <Typography
                      sx={{
                        mt: 1,
                        color: messageColor,
                        fontWeight: 500,
                        whiteSpace: "normal",
                        wordBreak: "break-word",
                        maxWidth: 300,
                        mx: "auto",
                      }}
                    >
                      {message}
                    </Typography>
                  </>
                );
              })()}
            </Box>
          </Grid>
        </Grid>
        <Box textAlign="center" sx={{ mt: 5 }}>
          <Typography variant="h6" mb={2}>
            Lượng nước trung bình
          </Typography>

          <Box sx={{ position: "relative", display: "inline-block" }}>
            {/* Cốc nước */}
            <Box
              sx={{
                position: "relative",
                width: 120,
                height: 150,
                border: "3px solid #00aaff",
                borderRadius: "8px 8px 12px 12px",
                overflow: "hidden",
                boxShadow: "0 4px 10px rgba(0, 170, 255, 0.3)",
                mx: "auto",
              }}
            >
              {/* Liquid Fill */}
              <Box
                sx={{
                  position: "absolute",
                  bottom: 0,
                  width: "100%",
                  height: `${progressPercentage}%`,
                  background:
                    "linear-gradient(180deg, #00aaff 0%, #0088cc 50%, #005fa3 100%)",
                  transition: "height 0.3s ease-out",
                }}
              />
              {/* Inner Shine */}
              <Box
                sx={{
                  position: "absolute",
                  top: 0,
                  left: "10%",
                  width: "15%",
                  height: "100%",
                  background:
                    "linear-gradient(90deg, rgba(255,255,255,0.1) 0%, transparent 100%)",
                }}
              />
              {/* Handle */}
              <Box
                sx={{
                  position: "absolute",
                  right: -20,
                  top: 20,
                  width: 20,
                  height: 50,
                  border: "2px solid #00aaff",
                  borderLeft: "none",
                  borderRadius: "0 12px 12px 0",
                }}
              />
            </Box>

            <Typography variant="h5" fontWeight="bold" mt={2}>
              {avgWater.consumed.toFixed(0)} / {avgWater.target.toFixed(0)} ml
              (TB mỗi ngày)
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default DietPlanProgress;
