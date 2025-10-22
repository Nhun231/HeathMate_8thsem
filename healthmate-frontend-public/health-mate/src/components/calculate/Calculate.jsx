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
  { value: "VeryActive", label: "Vận động cực nhiều", desc: "Cấp độ vận động viên" },
];

export default function Calculate() {
  const [form, setForm] = useState({
    gender: "",
    dob: "",
    age: "",
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
    severity: "info",
  });

  const resultRef = useRef(null);
  const navigate = useNavigate();

  // Hàm tính tuổi
  const calculateAge = (dob) => {
    if (!dob) return "";
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age >= 0 ? age : "";
  };

  // Lấy dữ liệu user + calculation
  useEffect(() => {
    const fetchData = async () => {
      try {
        const userRes = await getCurrentUser();
        const userData = userRes?.data;

        if (userData) {
          const age = calculateAge(userData?.dob);
          setForm((prev) => ({
            ...prev,
            gender: userData?.gender || prev.gender,
            dob: userData?.dob || "",
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "dob") {
      setForm({ ...form, dob: value, age: calculateAge(value) });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const validateForm = () => {
    const newErr = { height: "", weight: "" };

    if (!form.height || isNaN(form.height) || Number(form.height) <= 0)
      newErr.height = "Vui lòng nhập chiều cao hợp lệ.";

    if (!form.weight || isNaN(form.weight) || Number(form.weight) <= 0)
      newErr.weight = "Vui lòng nhập cân nặng hợp lệ.";

    setErrors(newErr);

    if (!form.gender) {
      setAlert({
        show: true,
        message: "Vui lòng chọn giới tính.",
        severity: "warning",
      });
      return false;
    }

    if (!form.dob || !form.age) {
      setAlert({
        show: true,
        message: "Vui lòng nhập ngày sinh hợp lệ.",
        severity: "warning",
      });
      return false;
    }

    return !newErr.height && !newErr.weight;
  };

  // Gửi dữ liệu tính toán
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

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
      await updateCurrentUser({
        gender: form.gender,
        dob: form.dob,
      });

      const res = await createCalculation({
        age: Number(form.age),
        gender: form.gender,
        height: Number(form.height),
        weight: Number(form.weight),
        activityLevel: form.activity,
      });

      setResult(res.data);
      setAlert({
        show: true,
        message: "Tính toán thành công và đã cập nhật thông tin cá nhân!",
        severity: "success",
      });
      setTimeout(() => setAlert({ ...alert, show: false }), 3000);
    } catch (err) {
      console.error("Lỗi khi gửi dữ liệu:", err);
      setAlert({
        show: true,
        message: "Có lỗi xảy ra. Vui lòng thử lại!",
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
            <RadioGroup
              name="gender"
              value={form.gender}
              onChange={handleChange}
              row
            >
              <FormControlLabel value="Male" control={<Radio />} label="Nam" />
              <FormControlLabel value="Female" control={<Radio />} label="Nữ" />
            </RadioGroup>

            <Typography className="label">Ngày sinh</Typography>
            <TextField
              fullWidth
              type="date"
              name="dob"
              value={form.dob}
              onChange={handleChange}
              className="input-box"
            />

            <Typography className="label">Tuổi</Typography>
            <TextField
              fullWidth
              disabled
              value={form.age}
              placeholder="Tuổi sẽ hiển thị ở đây"
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
              <Button variant="contained" color="success" onClick={handleSubmit}>
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

            {/* === PHẦN GIẢI THÍCH === */}
            <Box
              mt={6}
              p={3}
              sx={{
                backgroundColor: "#f9f9f9",
                borderRadius: "12px",
                border: "1px solid #e0e0e0",
                maxWidth: 900,
                margin: "2 auto",
              }}
            >
              <Typography
                variant="h6"
                align="center"
                color="#2e7d32"
                fontWeight="bold"
                mb={2}
              >
                Giải thích các chỉ số
              </Typography>

              <Typography variant="body1" paragraph>
                <strong>BMR (Basal Metabolic Rate):</strong> Lượng calo tối thiểu
                cơ thể cần để duy trì các chức năng sống cơ bản như hít thở, tuần
                hoàn và trao đổi chất khi nghỉ ngơi.
              </Typography>

              <Typography variant="body1" paragraph>
                <strong>TDEE (Total Daily Energy Expenditure):</strong> Tổng năng
                lượng bạn tiêu hao trong một ngày (bao gồm cả vận động và hoạt
                động thường nhật). Đây là cơ sở để xác định nên ăn bao nhiêu
                calo mỗi ngày.
              </Typography>

              <Typography variant="body1" paragraph>
                <strong>BMI (Body Mass Index):</strong> Chỉ số khối cơ thể, giúp
                xác định bạn đang gầy, bình thường hay thừa cân:
                <br />
                - Dưới 18.5: Gầy <br />
                - 18.5 – 24.9: Bình thường <br />
                - 25 – 29.9: Thừa cân <br />
                - ≥ 30: Béo phì
              </Typography>

              <Typography variant="body1" paragraph>
                <strong>Lượng nước cần uống:</strong> Là lượng nước khuyến nghị
                mỗi ngày để duy trì cân bằng cơ thể và hỗ trợ trao đổi chất, tính
                dựa theo cân nặng và mức độ vận động.
              </Typography>
            </Box>

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

      {/* Dialog xác nhận */}
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
