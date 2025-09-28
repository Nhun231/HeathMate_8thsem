import React, { useState, useRef } from "react";
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
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import baseAxios from "../../api/axios";

const activityLevels = [
    { value: "Sedentary", label: "Vận động ít", desc: "Vận động cơ bản" },
    { value: "Light", label: "Vận động nhẹ", desc: "Tập 1–3 buổi/tuần" },
    { value: "Moderate", label: "Vận động vừa", desc: "Tập 4–5 buổi/tuần" },
    { value: "Active", label: "Vận động nhiều", desc: "Tập 6–7 buổi/tuần" },
    { value: "VeryActive", label: "Vận động cực nhiều", desc: "Cấp độ vận động viên" },
];

// TOKEN hợp lệ của user đăng nhập
const FIXED_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OGNhZDUyYmYyNjVkYjc4ZGM5OTc3YzUiLCJkZXZpY2VJZCI6IjY4ZDZkMTdlZmVmN2M2MTQzZTJkODgxMyIsInJvbGVJZCI6IjY4Y2FkNGY2ZWM4YzRjOGNkMzY5NGNlZCIsInJvbGVOYW1lIjoiQ3VzdG9tZXIiLCJ1dWlkIjoiNTE3MWEyMzAtM2NiNC00MWY5LTlmNDAtNzkzZDE2YWYzN2QwIiwiaWF0IjoxNzU4OTA4Nzk4LCJleHAiOjE3NTg5MTA1OTh9.nHjxu0uQnDOYEwv4TkDtjlqfHAa5ez1oRc7058kuHiY";

export default function Calculate() {
    const [form, setForm] = useState({ height: "", weight: "", activity: "Sedentary" });
    const [result, setResult] = useState(null);
    const [openModal, setOpenModal] = useState(false);
    const resultRef = useRef(null);

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async () => {
        if (!form.height || !form.weight) {
            setOpenModal(true);
            return;
        }
        try {
            // 1️⃣ POST -> tạo / cập nhật calculation
            const postRes = await baseAxios.post(
                "/calculation",
                {
                    height: Number(form.height),
                    weight: Number(form.weight),
                    activityLevel: form.activity,
                },
                { headers: { Authorization: `Bearer ${FIXED_TOKEN}` } }
            );

            const id = postRes.data?._id || postRes.data?.id;
            if (!id) {
                alert("Không lấy được ID từ server");
                return;
            }

            // 2️⃣ GET -> lấy document đầy đủ
            const getRes = await baseAxios.get(`/calculation/details/${id}`, {
                headers: { Authorization: `Bearer ${FIXED_TOKEN}` },
            });

            setResult(getRes.data);
            setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.message || "Có lỗi khi gọi API");
        }
    };

    return (
        <Container maxWidth="lg" className="tdee-wrapper">
            <Typography variant="h4" textAlign="center" mb={4} fontWeight="bold" color="primary">
                Tính TDEE – BMR – BMI
            </Typography>

            <Paper className="tdee-form" sx={{ p: 3 }}>
                <Box display="flex" flexDirection="column" gap={2}>
                    <TextField
                        label="Chiều cao (cm)"
                        name="height"
                        value={form.height}
                        onChange={handleChange}
                        type="number"
                    />
                    <TextField
                        label="Cân nặng (kg)"
                        name="weight"
                        value={form.weight}
                        onChange={handleChange}
                        type="number"
                    />

                    <Typography fontWeight="bold" mt={1}>
                        Mức độ hoạt động:
                    </Typography>
                    <RadioGroup
                        row
                        name="activity"
                        value={form.activity}
                        onChange={handleChange}
                    >
                        {activityLevels.map((a) => (
                            <FormControlLabel
                                key={a.value}
                                value={a.value}
                                control={<Radio />}
                                label={a.label}
                            />
                        ))}
                    </RadioGroup>

                    <Button
                        variant="contained"
                        color="primary"
                        sx={{ mt: 2, width: "fit-content" }}
                        onClick={handleSubmit}
                    >
                        Tính ngay
                    </Button>
                </Box>
            </Paper>

            {result && (
                <Box className="result-box" mt={6} ref={resultRef}>
                    <Typography align="center" fontWeight="bold" fontSize={24} color="#4CAF50" mb={2}>
                        Kết quả của bạn
                    </Typography>
                    <Grid container spacing={4} justifyContent="center">
                        <Grid item xs={12} md={3}>
                            <Typography align="center" color="#2e7d32">BMR</Typography>
                            <Typography align="center" fontSize={40} color="red" fontWeight="bold">
                                {result.bmr}
                            </Typography>
                            <Typography align="center" color="gray">Calo/ngày</Typography>
                        </Grid>
                        <Grid item xs={12} md={3}>
                            <Typography align="center" color="#2e7d32">TDEE</Typography>
                            <Typography align="center" fontSize={40} color="red" fontWeight="bold">
                                {result.tdee}
                            </Typography>
                            <Typography align="center" color="gray">Calo/ngày</Typography>
                        </Grid>
                        <Grid item xs={12} md={3}>
                            <Typography align="center" color="#2e7d32">BMI</Typography>
                            <Typography align="center" fontSize={40} color="red" fontWeight="bold">
                                {result.bmi}
                            </Typography>
                        </Grid>
                        <Grid item xs={12} md={3}>
                            <Typography align="center" color="#2e7d32">Nước cần</Typography>
                            <Typography align="center" fontSize={40} color="red" fontWeight="bold">
                                {result.waterNeeded} L
                            </Typography>
                        </Grid>
                    </Grid>
                </Box>
            )}

            {/* Thông báo thiếu dữ liệu */}
            <Dialog open={openModal} onClose={() => setOpenModal(false)}>
                <DialogTitle>
                    <WarningAmberIcon color="warning" /> Thiếu dữ liệu
                </DialogTitle>
                <DialogContent>Vui lòng nhập đủ chiều cao và cân nặng.</DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenModal(false)}>Đóng</Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
}
