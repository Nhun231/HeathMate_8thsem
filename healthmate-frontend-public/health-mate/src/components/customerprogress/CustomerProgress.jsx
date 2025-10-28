// src/pages/DashboardPage.jsx
import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import "../../style/themeStyle.css";

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

// Icons (giữ nguyên như bạn dùng trước)
import PersonIcon from "@mui/icons-material/Person";
import StraightenIcon from "@mui/icons-material/Straighten";
import ShowChartIcon from "@mui/icons-material/ShowChart";
import LocalFireDepartmentIcon from "@mui/icons-material/LocalFireDepartment";
import TrackChangesIcon from "@mui/icons-material/TrackChanges";
import SpeedIcon from "@mui/icons-material/Speed";
import FitnessCenterIcon from "@mui/icons-material/FitnessCenter";
import SportsScoreIcon from "@mui/icons-material/SportsScore";
import RestaurantMenuRoundedIcon from "@mui/icons-material/RestaurantMenuRounded";

// --- Services ---
// Giữ nguyên các import service như project của bạn.
// Nếu file/service name khác, chỉnh đường dẫn tương ứng.
import { getUserById } from "../../services/UserService";
import { getAllCalculationsByUserId } from "../../services/Calculation";
import { getLatestCalculationByUserId } from "../../services/CalculateService";
import { getDietPlanByUserId } from "../../services/DietPlan";
import { getMealSummaryByUserId } from "../../services/Meal";
import { getWaterDataByUserId } from "../../services/WaterService";

const COLORS = ["#4CAF50", "#E0E0E0"];

const CustomerProgress = () => {
  const navigate = useNavigate();
  const { userId } = useParams();

  const [userData, setUserData] = useState(null);
  const [physicalData, setPhysicalData] = useState(null);
  const [dietPlan, setDietPlan] = useState(null);
  const [calculations, setCalculations] = useState([]);
  const [targetWeight, setTargetWeight] = useState(0);
  const [currentWeight, setCurrentWeight] = useState(0);
  const [avgCalories, setAvgCalories] = useState(0);
  const [avgWater, setAvgWater] = useState({ consumed: 0, target: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const calculateAge = (dob) =>
    new Date().getFullYear() -
    new Date(dob).getFullYear() -
    (new Date() < new Date(new Date(dob).setFullYear(new Date().getFullYear()))
      ? 1
      : 0);

  const getBMIInfo = (bmi) => {
    if (!bmi)
      return {
        category: "Chưa có dữ liệu",
        badgeClass: "my-badge",
        colorClass: "text-green",
      };
    if (bmi < 18.5)
      return {
        category: "Thiếu cân",
        badgeClass: "my-badge badge-blue",
        colorClass: "text-blue-600",
      };
    if (bmi < 25)
      return {
        category: "Bình thường",
        badgeClass: "my-badge badge-green",
        colorClass: "text-green",
      };
    return {
      category: "Thừa cân",
      badgeClass: "my-badge badge-yellow",
      colorClass: "text-red-600",
    };
  };

  const getVietnameseActivityLevel = (level) =>
    ({
      Sedentary: "Ít vận động",
      Light: "Vận động nhẹ",
      Moderate: "Vận động vừa",
      Active: "Vận động nhiều",
      VeryActive: "Vận động cực nhiều",
    }[level] || "--");

  // fetch all data (profile + physical + diet progress)
  useEffect(() => {
    let mounted = true;

    const fetchAll = async () => {
      try {
        //  User info
        const userRes = await getUserById(userId);
        if (!mounted) return;
        setUserData(userRes.data);
        // Latest calculation
        const latestCalcRes = await getLatestCalculationByUserId(userId);
        if (!mounted) return;
        setPhysicalData(latestCalcRes.data || {});
        // Current diet plan
        const plan = await getDietPlanByUserId(userId);
        if (!mounted) return;
        setDietPlan(plan || null);

        // All calculations
        const calcs = await getAllCalculationsByUserId(userId);
        if (!mounted) return;

        const sortedCalcs = (calcs || []).sort(
          (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
        );
        setCalculations(sortedCalcs);

        const latestCalc = sortedCalcs[sortedCalcs.length - 1];
        setCurrentWeight(latestCalc?.weight ?? 0);
        setTargetWeight(plan?.targetWeightChange ?? 0);

        // --- calculate average calories ---
        const startDate = plan ? new Date(plan.startDate) : new Date();
        startDate.setHours(0, 0, 0, 0);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const dateList = [];
        for (
          let d = new Date(startDate);
          d <= today;
          d.setDate(d.getDate() + 1)
        )
          dateList.push(new Date(d));
        console.log(dateList);
        let totalCaloriesSum = 0;
        let daysWithData = 0;

        await Promise.all(
          dateList.map(async (d) => {
            try {
              const summary = await getMealSummaryByUserId(userId, d);
              if (summary?.totalCalories > 0) {
                totalCaloriesSum += summary.totalCalories;
                daysWithData++;
              }
            } catch {}
          })
        );
        setAvgCalories(daysWithData > 0 ? totalCaloriesSum / daysWithData : 0);

        let totalConsumed = 0;
        let daysWithWaterData = 0;

        for (
          let d = new Date(startDate.getTime());
          d <= today;
          d.setDate(d.getDate() + 1)
        ) {
          try {
            const dateStr = d.toLocaleDateString("en-CA"); 
            const response = await getWaterDataByUserId(userId, {
              date: dateStr,
            });

            const waterData = response?.data;
            console.log(dateStr, waterData);

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
        const avgTarget = latestCalc?.waterNeeded
          ? latestCalc.waterNeeded * 1000
          : (latestCalc?.waterNeeded ?? 0) * 1000;
        setAvgWater({ consumed: avgConsumed, target: avgTarget });
      } catch (err) {
        console.error(err);
        if (mounted) setError("Không thể tải dữ liệu dashboard.");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchAll();
    return () => {
      mounted = false;
    };
  }, [userId]);

  // If loading show loading
  if (loading) return <Typography sx={{ p: 3 }}>Đang tải...</Typography>;

  // Profile: if not logged in (no userData) show message
  if (!userData)
    return (
      <Box textAlign="center" mt={5}>
        <Typography color="error">Bạn chưa đăng nhập.</Typography>
      </Box>
    );

  const bmiInfo = getBMIInfo(physicalData?.bmi);

  // Diet progress derived values
  const today = new Date();
  const startDate = dietPlan ? new Date(dietPlan.startDate) : null;
  const endDate = dietPlan
    ? dietPlan.endDate
      ? new Date(dietPlan.endDate)
      : today
    : today;
  const totalDays = dietPlan
    ? Math.max(1, Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)))
    : 0;
  const elapsedDays = dietPlan
    ? Math.max(
        0,
        Math.min(
          totalDays,
          Math.ceil((today - startDate) / (1000 * 60 * 60 * 24))
        )
      )
    : 0;
  const dayPercent = dietPlan ? (elapsedDays / totalDays) * 100 : 0;
  const dayData = [
    { name: "Đã qua", value: dayPercent },
    { name: "Còn lại", value: Math.max(0, 100 - dayPercent) },
  ];

  // Build uniqueDailyCalcs like original (latest per day)
  const startTime = startDate ? startDate.getTime() : 0;
  const endTime = endDate ? endDate.getTime() : today.getTime();
  const filteredCalcs = calculations.filter((c) => {
    const time = new Date(c.createdAt).getTime();
    return time >= startTime && time <= endTime;
  });

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

  // find startWeight same logic as original
  const sameDayCalc = calculations.find((c) => {
    if (!startDate) return false;
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

  // Weight data for chart 
  const weightData = [
    ...(startWeight != null
      ? [{ date: startTime, weight: startWeight, target: targetWeight }]
      : []),
    ...uniqueDailyCalcs.map((c) => ({
      date: new Date(c.createdAt).getTime(),
      weight: c.weight,
      target: targetWeight,
    })),
    { date: endTime, weight: null, target: targetWeight },
  ];

  // y-axis bounds calculation 
  const weights = [
    ...filteredCalcs.map((c) => c.weight),
    startWeight ?? targetWeight,
  ].filter((w) => typeof w === "number" && !Number.isNaN(w));
  const minWeight = weights.length ? Math.min(...weights) : 0;
  const maxWeight = weights.length ? Math.max(...weights) : 0;
  let yMin = Math.floor(Math.min(minWeight, targetWeight) - 2);
  let yMax = Math.ceil(Math.max(maxWeight, targetWeight) + 2);
  const diff = yMax - yMin;
  const stepY = diff > 8 ? 2 : 1;
  yMax = yMin + Math.ceil(diff / stepY) * stepY;
  const yTicks = Array.from(
    { length: Math.floor((yMax - yMin) / stepY) + 1 },
    (_, i) => yMin + i * stepY
  );

  // ticks for X axis
  const numTicks = 4;
  const step = startTime && endTime ? (endTime - startTime) / numTicks : 0;
  const ticks =
    startTime && endTime
      ? Array.from({ length: numTicks + 1 }, (_, i) =>
          Math.round(startTime + i * step)
        )
      : [];

  // Water progress percentage
  const progressPercentage = avgWater.target
    ? Math.min(Math.round((avgWater.consumed / avgWater.target) * 100), 100)
    : 0;

  return (
    <Container sx={{ mt: 5 }}>
      <Typography
        variant="h4"
        mb={3}
        fontWeight="bold"
        color="#2e7d32"
        textAlign="center"
      >
        Hồ sơ khách hàng
      </Typography>

      <Paper sx={{ p: 3, mb: 4, borderRadius: 3 }} className="my-card">
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
              <div
                className="avatar"
                style={{
                  width: 72,
                  height: 72,
                  borderRadius: "50%",
                  background: "#e0f2f1",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 24,
                }}
              >
                {userData.fullname
                  ?.split(" ")
                  .map((n) => n[0])
                  .join("") || "--"}
              </div>
              <div>
                <h2 style={{ margin: 0 }}>{userData.fullname || "--"}</h2>
                <p style={{ margin: 0, color: "#666" }}>
                  {userData.email || "--"}
                </p>
                <div
                  style={{
                    marginTop: 8,
                    display: "flex",
                    gap: 8,
                    flexWrap: "wrap",
                  }}
                >
                  <span className="my-badge badge-green text-green-700">
                    {userData?.gender === "Male"
                      ? "Nam"
                      : userData?.gender === "Female"
                      ? "Nữ"
                      : "--"}
                  </span>
                  <span className="my-badge badge-green text-green-700">
                    {userData.dob ? calculateAge(userData.dob) : "--"} Tuổi
                  </span>
                  <span className="my-badge badge-green text-green-700">
                    {physicalData?.activityLevel
                      ? getVietnameseActivityLevel(physicalData.activityLevel)
                      : "--"}
                  </span>
                </div>
              </div>
            </div>
          </Grid>

          <Grid
            item
            xs={12}
            md={4}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
            }}
          ></Grid>
        </Grid>
      </Paper>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 24,
          marginBottom: 24,
        }}
      >
        <Paper className="my-card" sx={{ p: 2 }}>
          <div className="my-card-header">
            <div className="my-card-title">
              <PersonIcon style={{ marginRight: 6 }} /> Thông tin cá nhân
            </div>
          </div>
          <div className="card-content" style={{ marginTop: 12 }}>
            <div style={{ marginBottom: 12 }}>
              <div style={{ color: "#777", fontSize: 13 }}>Họ và tên</div>
              <div style={{ fontWeight: 500 }}>{userData.fullname}</div>
            </div>
            <div style={{ marginBottom: 12 }}>
              <div style={{ color: "#777", fontSize: 13 }}>Email</div>
              <div style={{ fontWeight: 500 }}>{userData.email}</div>
            </div>
            <div style={{ marginBottom: 12 }}>
              <div style={{ color: "#777", fontSize: 13 }}>Giới tính</div>
              <div style={{ fontWeight: 500 }}>
                {userData.gender === "Male"
                  ? "Nam"
                  : userData.gender === "Female"
                  ? "Nữ"
                  : "--"}
              </div>
            </div>
            <div style={{ marginBottom: 12 }}>
              <div style={{ color: "#777", fontSize: 13 }}>Ngày sinh</div>
              <div style={{ fontWeight: 500 }}>
                {userData.dob
                  ? new Date(userData.dob).toLocaleDateString("vi-VN")
                  : "--/--/----"}
              </div>
            </div>
            <div style={{ marginBottom: 12 }}>
              <div style={{ color: "#777", fontSize: 13 }}>Số điện thoại</div>
              <div style={{ fontWeight: 500 }}>
                {userData?.phoneNumber
                  ? `*******${userData.phoneNumber.slice(-3)}`
                  : ""}
              </div>
            </div>
          </div>
        </Paper>

        <Paper className="my-card" sx={{ p: 2 }}>
          <div className="my-card-header">
            <div className="my-card-title">
              <StraightenIcon style={{ marginRight: 6 }} /> Chỉ số cơ thể
            </div>
          </div>
          <div className="card-content" style={{ marginTop: 12 }}>
            <div style={{ marginBottom: 12 }}>
              <div style={{ color: "#777", fontSize: 13 }}>Chiều cao</div>
              <div style={{ fontWeight: 500 }}>
                {physicalData?.height ?? "--"} cm
              </div>
            </div>
            <div style={{ marginBottom: 12 }}>
              <div style={{ color: "#777", fontSize: 13 }}>Cân nặng</div>
              <div style={{ fontWeight: 500 }}>
                {physicalData?.weight ?? "--"} kg
              </div>
            </div>
            <div style={{ marginBottom: 12 }}>
              <div style={{ color: "#777", fontSize: 13 }}>
                Lượng nước cần uống
              </div>
              <div style={{ fontWeight: 500 }}>
                {physicalData?.waterNeeded ?? "--"} lít/ngày
              </div>
            </div>
            <div style={{ marginBottom: 12 }}>
              <div style={{ color: "#777", fontSize: 13 }}>
                Cường độ vận động
              </div>
              <div style={{ fontWeight: 500 }}>
                {physicalData?.activityLevel
                  ? getVietnameseActivityLevel(physicalData.activityLevel)
                  : "--"}
              </div>
            </div>
            <div style={{ marginBottom: 12 }}>
              <div style={{ color: "#777", fontSize: 13 }}>
                Thành phần dinh dưỡng
              </div>
              <div style={{ fontWeight: 500 }}>
                {physicalData ? (
                  <>
                    <span>
                      <strong>Carbs:</strong> {physicalData.carbs}g
                    </span>{" "}
                    &nbsp;|&nbsp;
                    <span>
                      <strong>Protein:</strong> {physicalData.protein}g
                    </span>{" "}
                    &nbsp;|&nbsp;
                    <span>
                      <strong>Fat:</strong> {physicalData.fat}g
                    </span>{" "}
                    &nbsp;|&nbsp;
                    <span>
                      <strong>Fiber:</strong> {physicalData.fiber}g
                    </span>
                  </>
                ) : (
                  "--"
                )}
              </div>
            </div>
          </div>
        </Paper>
      </div>

      <Paper className="my-card" sx={{ p: 2, mb: 4 }}>
        <div className="my-card-header">
          <div className="my-card-title">
            <ShowChartIcon style={{ marginRight: 6 }} /> Chỉ số sức khỏe
          </div>
        </div>
        <div
          className="card-content"
          style={{
            marginTop: 12,
            display: "grid",
            gridTemplateColumns: "repeat(3,1fr)",
            gap: 16,
          }}
        >
          <div className="metric-card">
            <LocalFireDepartmentIcon style={{ fontSize: 32, color: "green" }} />
            <h3 style={{ margin: "8px 0" }}>
              Tỷ lệ trao đổi chất cơ bản (BMR)
            </h3>
            <p style={{ fontSize: 20, fontWeight: 700, color: "green" }}>
              {physicalData?.bmr ? Math.round(physicalData.bmr) : "--"} cal/day
            </p>
            <p style={{ color: "#777", marginTop: 6 }}>
              Lượng calo tiêu thụ khi nghỉ ngơi
            </p>
          </div>

          <div className="metric-card">
            <TrackChangesIcon style={{ fontSize: 32, color: "green" }} />
            <h3 style={{ margin: "8px 0" }}>
              Tổng năng lượng tiêu hao mỗi ngày (TDEE)
            </h3>
            <p style={{ fontSize: 20, fontWeight: 700, color: "green" }}>
              {physicalData?.tdee ? Math.round(physicalData.tdee) : "--"}{" "}
              cal/day
            </p>
            <p style={{ color: "#777", marginTop: 6 }}>
              Tổng lượng calo cần thiết mỗi ngày
            </p>
          </div>

          <div className="metric-card">
            <SportsScoreIcon style={{ fontSize: 32, color: "green" }} />
            <h3 style={{ margin: "8px 0" }}>Chỉ số BMI</h3>
            <p
              className={`text-2xl font-bold ${bmiInfo.colorClass}`}
              style={{ fontSize: 22, fontWeight: 700 }}
            >
              {physicalData?.bmi ?? "--"}
            </p>
            <span className={bmiInfo.badgeClass}>
              Đánh giá: {bmiInfo.category}
            </span>
            <p style={{ color: "#777", marginTop: 6 }}>
              Chỉ số khối cơ thể đánh giá tình trạng cân nặng
            </p>
          </div>
        </div>
      </Paper>

      <Paper sx={{ p: 3, borderRadius: 3 }} className="my-card">
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
                margin={{ top: 40, right: 40, left: 40, bottom: 40 }}
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

          {/* Calories Pie */}
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
                if (diff < -150) color = "#FFC107";
                else if (diff > 100) color = "#f44336";

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
                  </>
                );
              })()}
            </Box>
          </Grid>
        </Grid>

        {/* Water */}
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
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default CustomerProgress;
