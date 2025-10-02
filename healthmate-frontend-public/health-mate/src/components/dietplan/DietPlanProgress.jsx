import React, { useEffect, useState } from "react";
import { Container, Typography, Paper, Grid, Box } from "@mui/material";
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
import { getCurrentDietPlan } from "../../services/DietPlan";
import { getAllCalculations } from "../../services/Calculation";

const COLORS = ["#4CAF50", "#E0E0E0"];

const DietPlanProgress = () => {
  const [loading, setLoading] = useState(true);
  const [dietPlan, setDietPlan] = useState(null);
  const [calculations, setCalculations] = useState([]);
  const [targetWeight, setTargetWeight] = useState(0);
  const [currentWeight, setCurrentWeight] = useState(0);
  const [error, setError] = useState("");

  const goalMap = {
    GainWeight: "Tăng cân",
    LoseWeight: "Giảm cân",
    MaintainWeight: "Giữ cân",
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        const plan = await getCurrentDietPlan(token);
        const calcs = await getAllCalculations(token);

        if (!plan || !calcs || calcs.length === 0) {
          setError("Chưa có kế hoạch dinh dưỡng hoặc dữ liệu tính toán.");
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
      } catch (err) {
        console.error(err);
        setError("Không thể tải dữ liệu kế hoạch dinh dưỡng.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <Typography>Đang tải...</Typography>;
  if (error) return <Typography>{error}</Typography>;
  if (!dietPlan)
    return <Typography>Chưa có kế hoạch dinh dưỡng nào.</Typography>;

  // Pie chart - tiến trình ngày
  const today = new Date();
  const startDate = new Date(dietPlan.startDate);
  const endDate = dietPlan.endDate ? new Date(dietPlan.endDate) : today;
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

  // Chuẩn bị dữ liệu cân nặng
  const weightData = calculations.map((c) => {
    const d = new Date(c.createdAt);
    return {
      date: d.getTime(),
      weight: c.weight,
      target: targetWeight,
    };
  });

  // Chia tick đều theo toàn bộ duration
  const ticks = [];
  if (dietPlan.startDate && dietPlan.endDate) {
    const start = new Date(dietPlan.startDate).getTime();
    const end = new Date(dietPlan.endDate).getTime();
    const numTicks = 8;
    const step = Math.ceil((end - start) / numTicks);

    for (let i = 0; i <= numTicks; i++) {
      ticks.push(start + i * step);
    }
  }

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
              <Typography variant="body1" fontSize="1.1rem" mb={1}>
                <strong>Mục tiêu: {goalMap[dietPlan.goal]}</strong>
              </Typography>
              <Typography variant="body1" fontSize="1.1rem">
                <strong>Calo mỗi ngày: {dietPlan.dailyCalories} calo</strong>
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
              <Typography variant="h6" mb={2}>
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
                    offset: -30
                  }}
                />

                <YAxis
                  domain={["auto", "auto"]}
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

              <Typography mt={2} textAlign="center" fontWeight="500">
                Hiện tại: {currentWeight} kg
              </Typography>
            </Box>
          </Grid>

          {/* Placeholder */}
          <Grid item xs={12} md={6} sx={{ display: "flex" }}>
            <Box
              sx={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
              }}
            >
              <Typography variant="h6" mb={2}>
                Trung bình calories
              </Typography>
              <Box
              >
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default DietPlanProgress;
