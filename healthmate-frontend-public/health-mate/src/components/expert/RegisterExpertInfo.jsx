import React, { useState, useEffect } from "react";
import {
    Box, Card, CardContent, TextField, Typography, Button,
    InputAdornment, IconButton, RadioGroup, FormControlLabel, Radio, CircularProgress
} from "@mui/material";
import { Person, Email, Lock, CheckCircle, Visibility, VisibilityOff } from "@mui/icons-material";
import { PhoneIcon } from "lucide-react";
import dayjs from "dayjs";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { sendOTP, register } from "../../services/authService/RegisterService.js";
import CustomAlert from "../../components/common/Alert.jsx";
import { emailValidator, checkPasswordsMatch, validatePasswordStrength, isValidPhoneNumber } from "../../utils/registerValidation.js";

const RegisterExpertInfo = ({ onRegistered }) => {
    const [formData, setFormData] = useState({
        fullname: "", email: "", password: "", confirmPassword: "",
        dob: "", gender: "", phoneNumber: "", code: ""
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [otpSent, setOtpSent] = useState(false);
    const [secondsLeft, setSecondsLeft] = useState(0);
    const [loading, setLoading] = useState(false);
    const [alert, setAlert] = useState({ show: false, message: "", severity: "" });

    const handleChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

    const handleSendOtp = async () => {
        if (!formData.email) return setAlert({ show: true, message: "Vui lòng nhập email!", severity: "warning" });
        const valid = emailValidator(formData.email);
        if (!valid.isValid) return setAlert({ show: true, message: valid.message, severity: "warning" });
        try {
            await sendOTP({ email: formData.email, type: "REGISTER" });
            setOtpSent(true);
            setSecondsLeft(300);
            setAlert({ show: true, message: "✅ OTP đã gửi!", severity: "success" });
        } catch {
            setAlert({ show: true, message: "❌ Không thể gửi OTP", severity: "error" });
        }
    };

    useEffect(() => {
        if (!otpSent || secondsLeft <= 0) return;
        const id = setInterval(() => setSecondsLeft(prev => (prev > 0 ? prev - 1 : 0)), 1000);
        return () => clearInterval(id);
    }, [otpSent, secondsLeft]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const pwdValid = validatePasswordStrength(formData.password);
        const pwdMatch = checkPasswordsMatch(formData.password, formData.confirmPassword);
        if (!pwdValid.isValid || !pwdMatch.isValid) return setAlert({ show: true, message: "❌ Mật khẩu không hợp lệ hoặc không khớp", severity: "warning" });
        if (!isValidPhoneNumber(formData.phoneNumber)) return setAlert({ show: true, message: "❌ Số điện thoại không hợp lệ", severity: "warning" });
        if (!formData.code) return setAlert({ show: true, message: "Vui lòng nhập OTP", severity: "warning" });

        setLoading(true);
        try {
            const res = await register({ ...formData, isExpert: true });
            const token = res.data.token; // backend trả token
            localStorage.setItem("token", token); // lưu token
            setAlert({ show: true, message: "🎉 Đăng ký thành công! Hãy tải chứng chỉ.", severity: "success" });
            onRegistered(res.data._id, formData.email, token); // gửi lên parent
        } catch {
            setAlert({ show: true, message: "❌ Đăng ký thất bại", severity: "error" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ minHeight: "100vh", width: "100vw", display: "flex", justifyContent: "center", alignItems: "center", p: 2 }}>
            {alert.show && <CustomAlert message={alert.message} variant={alert.severity} onClose={() => setAlert({ ...alert, show: false })} />}
            <Card sx={{ maxWidth: 520, width: "100%", borderRadius: 3, backgroundColor: "rgba(255,255,255,0.95)", boxShadow: "0 8px 20px rgba(0,0,0,0.15)", backdropFilter: "blur(10px)" }}>
                <CardContent sx={{ p: 4 }}>
                    <Typography variant="h5" textAlign="center" fontWeight={600} gutterBottom>🌿 Đăng ký Chuyên Gia</Typography>
                    <form onSubmit={handleSubmit}>
                        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                            <TextField name="fullname" placeholder="Họ và tên" value={formData.fullname} onChange={handleChange} InputProps={{ startAdornment: <InputAdornment position="start"><Person /></InputAdornment> }} fullWidth size="small" />
                            <TextField name="email" type="email" placeholder="Email" value={formData.email} onChange={handleChange} InputProps={{ startAdornment: <InputAdornment position="start"><Email /></InputAdornment> }} fullWidth size="small" />
                            <TextField name="password" type={showPassword ? "text" : "password"} placeholder="Mật khẩu" value={formData.password} onChange={handleChange} InputProps={{ startAdornment: <InputAdornment position="start"><Lock /></InputAdornment>, endAdornment: <InputAdornment position="end"><IconButton onClick={() => setShowPassword(!showPassword)}>{showPassword ? <VisibilityOff /> : <Visibility />}</IconButton></InputAdornment> }} fullWidth size="small" />
                            <TextField name="confirmPassword" type={showConfirmPassword ? "text" : "password"} placeholder="Xác nhận mật khẩu" value={formData.confirmPassword} onChange={handleChange} InputProps={{ startAdornment: <InputAdornment position="start"><CheckCircle /></InputAdornment>, endAdornment: <InputAdornment position="end"><IconButton onClick={() => setShowConfirmPassword(!showConfirmPassword)}>{showConfirmPassword ? <VisibilityOff /> : <Visibility />}</IconButton></InputAdornment> }} fullWidth size="small" />
                            <RadioGroup row name="gender" value={formData.gender} onChange={handleChange}>
                                <FormControlLabel value="Male" control={<Radio />} label="Nam" />
                                <FormControlLabel value="Female" control={<Radio />} label="Nữ" />
                            </RadioGroup>
                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                <DatePicker label="Ngày sinh" format="DD/MM/YYYY" value={formData.dob ? dayjs(formData.dob) : null} onChange={(val) => setFormData({ ...formData, dob: val ? val.format("YYYY-MM-DD") : "" })} slotProps={{ textField: { size: "small", fullWidth: true } }} />
                            </LocalizationProvider>
                            <TextField name="phoneNumber" placeholder="Số điện thoại" value={formData.phoneNumber} onChange={handleChange} InputProps={{ startAdornment: <InputAdornment position="start"><PhoneIcon size={18} color="#6b7280" /></InputAdornment> }} fullWidth size="small" />
                            {otpSent && <TextField name="code" placeholder="Nhập OTP" value={formData.code} onChange={handleChange} helperText={secondsLeft > 0 ? `OTP hết hạn sau ${Math.floor(secondsLeft / 60)}:${(secondsLeft % 60).toString().padStart(2, "0")}` : "OTP đã hết hạn"} error={secondsLeft === 0} fullWidth size="small" />}
                            {!otpSent ? <Button onClick={handleSendOtp} fullWidth variant="contained" color="success">Gửi OTP</Button> : <Button type="submit" fullWidth variant="contained" color="success" disabled={loading}>{loading ? <CircularProgress size={24} /> : "Hoàn tất đăng ký"}</Button>}
                        </Box>
                    </form>
                </CardContent>
            </Card>
        </Box>
    );
};

export default RegisterExpertInfo;
