import React, { useState, useRef, useEffect } from "react";
import {
  Box,
  Container,
  Typography,
  TextField,
  RadioGroup,
  FormControlLabel,
  Radio,
  Paper,
  Button,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import "../../styles/themeCalculate.css";
//import { createCalculation } from "../../services/Calculation";
import {
  createCalculation,
  getLatestCalculation,
} from "../../services/CalculateService";
import {
  getCurrentUser,
  updateCurrentUser,
} from "../../services/UserService.js";
import CustomAlert from "../common/Alert";

const activityLevels = [
  { value: "Sedentary", label: "Vận động ít", desc: "Vận động cơ bản" },
  { value: "Light", label: "Vận động nhẹ", desc: "Tập 1–3 buổi/tuần" },
  { value: "Moderate", label: "Vận động vừa", desc: "Tập 4–5 buổi/tuần" },
  { value: "Active", label: "Vận động nhiều", desc: "Tập 6–7 buổi/tuần" },
  {
    value: "VeryActive",
    label: "Vận động cực nhiều",
    desc: "Cấp độ vận động viên",
  },
];

export default function Calculate() {
  const [form, setForm] = useState({
    gender: "Nam",
    age: "22",
    height: "",
    weight: "",
    activity: "Sedentary",
  });
  const [result, setResult] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [errors, setErrors] = useState({ height: "", weight: "" });
  const [alert, setAlert] = useState({
    show: false,
    message: "",
    severity: "info", // success | error | warning | info
  });

  const resultRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userRes = await getCurrentUser();
        const userData = userRes?.data;

        if (userData) {
          const age = userData?.dob
            ? new Date().getFullYear() - new Date(userData.dob).getFullYear()
            : "";

          setForm((prev) => ({
            ...prev,
            gender: userData?.gender || prev.gender,
            age: age.toString(),
          }));
        }
      } catch (error) {
        console.warn("Lỗi khi lấy user:", error);
      }

      try {
        const physicalRes = await getLatestCalculation();
        const physicalData = physicalRes?.data;

        if (physicalData) {
          setForm((prev) => ({
            ...prev,
            height: physicalData?.height || prev.height,
            weight: physicalData?.weight || prev.weight,
            activity: physicalData?.activityLevel || prev.activity,
          }));
        }
      } catch (error) {
        console.warn("Lỗi khi lấy physical info:", error);
      }
    };

    fetchData();
  }, []);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  //const handleGender = (gender) => setForm({ ...form, gender });

  const validateForm = () => {
    const newErr = { height: "", weight: "" };

    if (!form.height || isNaN(form.height) || Number(form.height) <= 0)
      newErr.height = "Vui lòng nhập chiều cao hợp lệ.";

    if (!form.weight || isNaN(form.weight) || Number(form.weight) <= 0)
      newErr.weight = "Vui lòng nhập cân nặng hợp lệ.";

    setErrors(newErr);
    return !newErr.height && !newErr.weight;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      setAlert({
        show: true,
        message: "Vui lòng nhập đầy đủ và hợp lệ.",
        severity: "warning",
      });
      return;
    }

    const token = localStorage.getItem("accessToken");
    if (!token) {
      setAlert({
        show: true,
        message: "Bạn cần đăng nhập để tính toán.",
        severity: "error",
      });
      return;
    }

    try {
      const res = await createCalculation({
        height: Number(form.height),
        weight: Number(form.weight),
        activityLevel: form.activity,
      });
      setResult(res.data);
      setAlert({
        show: true,
        message: "Tính toán thành công!",
        severity: "success",
      });
      setTimeout(() => setAlert({ ...alert, show: false }), 3000);
    } catch (err) {
      console.error(err);
      setAlert({
        show: true,
        message: "Tính toán thất bại. Vui lòng thử lại!",
        severity: "error",
      });
    }
  };

  const handleModalClose = (ans) => {
    setOpenModal(false);
    if (ans === "yes") navigate("/set-goal");
    else navigate("/customer-homepage");
  };

  return (
    <Container maxWidth="lg" className="tdee-wrapper">
      {/* Alert */}
      {alert.show && (
        <Box
          sx={{
            position: "fixed",
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

      <Typography variant="h4" align="center" className="title">
        CÔNG CỤ TÍNH BMI, TDEE VÀ BMR ONLINE
      </Typography>
      <Typography align="center" className="subtitle">
        Tính lượng calo cần thiết cho cơ thể bạn mỗi ngày
        <br />
        Hãy nhập thông tin để HealthMate tính cho bạn nhé!
      </Typography>

      <Box className="main-form-box">
        <Grid container spacing={12}>
          {/* Cột trái */}
          <Grid item xs={12} md={6}>
            <Typography className="label">Giới tính</Typography>
            <Box className="gender-buttons">
              <button
                disabled
                className={form.gender === "Male" ? "active" : ""}
                //onClick={() => handleGender("Nam")}
              >
                NAM
              </button>
              <button
                disabled
                className={form.gender === "Female" ? "active" : ""}
                //onClick={() => handleGender("Nữ")}
              >
                NỮ
              </button>
            </Box>

            <Typography className="label">Tuổi</Typography>
            <TextField
              fullWidth
              disabled
              name="age"
              value={form.age}
              //onChange={handleChange}
              placeholder="Nhập độ tuổi..."
              className="input-box"
            />

            <Typography className="label">Chiều cao (cm)</Typography>
            <TextField
              fullWidth
              name="height"
              value={form.height}
              onChange={handleChange}
              placeholder="Nhập chiều cao..."
              className="input-box"
              error={Boolean(errors.height)}
              helperText={errors.height}
            />

            <Typography className="label">Cân nặng (kg)</Typography>
            <TextField
              fullWidth
              name="weight"
              value={form.weight}
              onChange={handleChange}
              placeholder="Nhập cân nặng..."
              className="input-box"
              error={Boolean(errors.weight)}
              helperText={errors.weight}
            />

            <Box textAlign="center" mt={3}>
              <Button
                variant="contained"
                color="success"
                onClick={handleSubmit}
              >
                TÍNH TOÁN
              </Button>
            </Box>
          </Grid>

          {/* Cột phải */}
          <Grid item xs={12} md={6}>
            <Paper className="activity-box">
              <Typography align="center" className="activity-title">
                CƯỜNG ĐỘ HOẠT ĐỘNG
              </Typography>
              <Grid container className="activity-header">
                <Grid item xs={6}>
                  <strong>Cường độ</strong>
                </Grid>
                <Grid item xs={6}>
                  <strong>Mô tả</strong>
                </Grid>
              </Grid>
              <RadioGroup
                name="activity"
                value={form.activity}
                onChange={handleChange}
                className="activity-group"
              >
                {activityLevels.map((a) => (
                  <Grid container key={a.value} className="activity-row">
                    <Grid item xs={6}>
                      <FormControlLabel
                        value={a.value}
                        control={<Radio />}
                        label={a.label}
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <Typography>{a.desc}</Typography>
                    </Grid>
                  </Grid>
                ))}
              </RadioGroup>
            </Paper>
          </Grid>
        </Grid>

        {/* Kết quả */}
        {result && (
          <Box className="result-box" mt={6} ref={resultRef}>
            <Typography
              align="center"
              fontWeight="bold"
              fontSize={24}
              color="#4CAF50"
              mb={2}
            >
              CHỈ SỐ CALO CỦA BẠN
            </Typography>
            <Typography align="center" fontWeight="bold" mb={4}>
              Dựa trên thông tin bạn đã cung cấp
              <br />
              HealthMate đã tính ra các chỉ số calo của bạn như sau:
            </Typography>

            <Grid container spacing={4} justifyContent="center">
              <Grid item xs={12} md={3}>
                <Typography align="center" fontWeight="bold" color="#2e7d32">
                  BMR của bạn là:
                </Typography>
                <Typography
                  align="center"
                  fontSize={50}
                  color="red"
                  fontWeight="bold"
                >
                  {result.bmr}
                </Typography>
                <Typography align="center" color="gray">
                  Calo / ngày
                </Typography>
              </Grid>

              <Grid item xs={12} md={3}>
                <Typography align="center" fontWeight="bold" color="#2e7d32">
                  TDEE của bạn là:
                </Typography>
                <Typography
                  align="center"
                  fontSize={50}
                  color="red"
                  fontWeight="bold"
                >
                  {result.tdee}
                </Typography>
                <Typography align="center" color="gray">
                  Calo / ngày
                </Typography>
              </Grid>

              <Grid item xs={12} md={3}>
                <Typography align="center" fontWeight="bold" color="#2e7d32">
                  BMI của bạn là:
                </Typography>
                <Typography
                  align="center"
                  fontSize={50}
                  color="red"
                  fontWeight="bold"
                >
                  {result.bmi}
                </Typography>
                <Typography align="center" color="gray">
                  Chỉ số khối cơ thể
                </Typography>
              </Grid>

              <Grid item xs={12} md={3}>
                <Typography align="center" fontWeight="bold" color="#2e7d32">
                  Lượng nước cần uống:
                </Typography>
                <Typography
                  align="center"
                  fontSize={50}
                  color="red"
                  fontWeight="bold"
                >
                  {result.waterNeeded} L
                </Typography>
                <Typography align="center" color="gray">
                  Lít / ngày
                </Typography>
              </Grid>
            </Grid>
            <Box textAlign="center" mt={4}>
              <Button
                variant="contained"
                color="success"
                onClick={() => setOpenModal(true)}
              >
                Tạo kế hoạch ăn uống
              </Button>
            </Box>
          </Box>
        )}
      </Box>

      <Dialog open={openModal} onClose={() => handleModalClose("no")}>
        <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <WarningAmberIcon color="warning" />
          Xác nhận
        </DialogTitle>
        <DialogContent>
          Bạn có muốn tạo kế hoạch ăn uống dựa trên dữ liệu vừa tính?
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => handleModalClose("no")}
            variant="outlined"
            color="inherit"
          >
            Không
          </Button>
          <Button
            onClick={() => handleModalClose("yes")}
            variant="contained"
            color="success"
          >
            Có, tạo ngay
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
