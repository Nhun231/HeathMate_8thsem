import React, { useState, useEffect } from "react";
import {
    Box, Card, CardContent, TextField, Typography, Button,
    InputAdornment, IconButton, RadioGroup, FormControlLabel, Radio, CircularProgress, Tooltip, Divider, Link
} from "@mui/material";
import { Person, Email, Lock, CheckCircle, Visibility, VisibilityOff } from "@mui/icons-material";
import { PhoneIcon } from "lucide-react";
import dayjs from "dayjs";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { sendOTP, register } from "../../services/authService/RegisterService.js";
import CustomAlert from "../../components/common/Alert.jsx";
import { emailValidator, checkPasswordsMatch, validatePasswordStrength, isValidPhoneNumber } from "../../utils/registerValidation.js";
import { useNavigate } from "react-router-dom";

const RegisterExpertInfo = ({ onRegistered }) => {
    const navigate = useNavigate();
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
            setAlert({ show: true, message: "OTP đã gửi!", severity: "success" });
        } catch {
            setAlert({ show: true, message: "Không thể gửi OTP", severity: "error" });
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
        if (!pwdValid.isValid || !pwdMatch.isValid) return setAlert({ show: true, message: "Mật khẩu không hợp lệ hoặc không khớp", severity: "warning" });
        if (!isValidPhoneNumber(formData.phoneNumber)) return setAlert({ show: true, message: "Số điện thoại không hợp lệ", severity: "warning" });
        if (!formData.code) return setAlert({ show: true, message: "Vui lòng nhập OTP", severity: "warning" });

        setLoading(true);
        try {
            const res = await register({ ...formData, isExpert: true });
            setAlert({ show: true, message: "Đăng ký thành công! Hãy tải chứng chỉ.", severity: "success" });
            onRegistered(res.data._id, formData.email);
        } catch {
            setAlert({ show: true, message: "Đăng ký thất bại", severity: "error" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box
            sx={{
                minHeight: "100vh",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                p: 2,
                position: "relative",
                backgroundImage: "url('https://img.herohealth.com/blog/veggies.webp')",
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
                "&::before": {
                    content: '""',
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    backgroundColor: "rgba(255,255,255,0.7)",
                    zIndex: 0,
                }
            }}
        >
            {alert.show && <CustomAlert message={alert.message} variant={alert.severity} onClose={() => setAlert({ ...alert, show: false })} />}
            <Card sx={{
                maxWidth: 600,
                width: "100%",
                borderRadius: 3,
                backgroundColor: "rgba(255,255,255,0.95)",
                boxShadow: "0 15px 30px rgba(0,0,0,0.15)",
                p: 3,
                position: "relative",
                zIndex: 1
            }}>
                <CardContent>
                    <Typography variant="h4" textAlign="center" fontWeight={700} gutterBottom>
                        Bắt Đầu Hành Trình Chuyên Gia
                    </Typography>
                    <Box sx={{ mb: 3, p: 2, borderRadius: 2, backgroundColor: "#f0f9ff", border: "1px solid #a0e0ff" }}>
                        <Typography variant="h6" fontWeight={600} mb={1}>Hướng dẫn đăng ký:</Typography>
                        <Typography variant="body2" mb={0.5}>1️⃣ Nhập thông tin cơ bản: Họ tên, email, mật khẩu, giới tính, ngày sinh, số điện thoại.</Typography>
                        <Typography variant="body2" mb={0.5}>2️⃣ Nhận mã OTP gửi về email và nhập vào ô xác nhận.</Typography>
                        <Typography variant="body2">3️⃣ Hoàn tất đăng ký, hệ thống sẽ hướng dẫn tải chứng chỉ chuyên gia.</Typography>
                    </Box>
                    <Divider sx={{ mb: 3 }} />
                    <form onSubmit={handleSubmit}>
                        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                            <Box>
                                <Typography variant="subtitle2" color="textSecondary" mb={0.5}>Họ và tên</Typography>
                                <Tooltip title="Nhập họ tên đầy đủ của bạn" placement="right">
                                    <TextField
                                        name="fullname"
                                        placeholder="Họ và tên"
                                        value={formData.fullname}
                                        onChange={handleChange}
                                        InputProps={{ startAdornment: <InputAdornment position="start"><Person /></InputAdornment> }}
                                        fullWidth
                                        size="small"
                                    />
                                </Tooltip>
                            </Box>

                            <Box>
                                <Typography variant="subtitle2" color="textSecondary" mb={0.5}>Email</Typography>
                                <Tooltip title="Nhập email hợp lệ để nhận OTP" placement="right">
                                    <TextField
                                        name="email"
                                        type="email"
                                        placeholder="Email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        InputProps={{ startAdornment: <InputAdornment position="start"><Email /></InputAdornment> }}
                                        fullWidth
                                        size="small"
                                    />
                                </Tooltip>
                            </Box>

                            <Box>
                                <Typography variant="subtitle2" color="textSecondary" mb={0.5}>Mật khẩu</Typography>
                                <Tooltip title="Mật khẩu cần ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường và số" placement="right">
                                    <TextField
                                        name="password"
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Mật khẩu"
                                        value={formData.password}
                                        onChange={handleChange}
                                        InputProps={{
                                            startAdornment: <InputAdornment position="start"><Lock /></InputAdornment>,
                                            endAdornment: <InputAdornment position="end">
                                                <IconButton onClick={() => setShowPassword(!showPassword)}>
                                                    {showPassword ? <VisibilityOff /> : <Visibility />}
                                                </IconButton>
                                            </InputAdornment>
                                        }}
                                        fullWidth
                                        size="small"
                                    />
                                </Tooltip>
                            </Box>

                            <Box>
                                <Typography variant="subtitle2" color="textSecondary" mb={0.5}>Xác nhận mật khẩu</Typography>
                                <TextField
                                    name="confirmPassword"
                                    type={showConfirmPassword ? "text" : "password"}
                                    placeholder="Xác nhận mật khẩu"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    InputProps={{
                                        startAdornment: <InputAdornment position="start"><CheckCircle /></InputAdornment>,
                                        endAdornment: <InputAdornment position="end">
                                            <IconButton onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                                                {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                                            </IconButton>
                                        </InputAdornment>
                                    }}
                                    fullWidth
                                    size="small"
                                />
                            </Box>

                            <Box>
                                <Typography variant="subtitle2" color="textSecondary" mb={0.5}>Giới tính</Typography>
                                <RadioGroup row name="gender" value={formData.gender} onChange={handleChange} sx={{ gap: 2 }}>
                                    <FormControlLabel value="Male" control={<Radio />} label="Nam" />
                                    <FormControlLabel value="Female" control={<Radio />} label="Nữ" />
                                </RadioGroup>
                            </Box>

                            <Box>
                                <Typography variant="subtitle2" color="textSecondary" mb={0.5}>Ngày sinh</Typography>
                                <LocalizationProvider dateAdapter={AdapterDayjs}>
                                    <DatePicker
                                        label="Ngày sinh"
                                        format="DD/MM/YYYY"
                                        value={formData.dob ? dayjs(formData.dob) : null}
                                        onChange={(val) => setFormData({ ...formData, dob: val ? val.format("YYYY-MM-DD") : "" })}
                                        slotProps={{ textField: { size: "small", fullWidth: true } }}
                                    />
                                </LocalizationProvider>
                            </Box>

                            <Box>
                                <Typography variant="subtitle2" color="textSecondary" mb={0.5}>Số điện thoại</Typography>
                                <Tooltip title="Nhập số điện thoại hợp lệ để nhận OTP" placement="right">
                                    <TextField
                                        name="phoneNumber"
                                        placeholder="Số điện thoại"
                                        value={formData.phoneNumber}
                                        onChange={handleChange}
                                        InputProps={{ startAdornment: <InputAdornment position="start"><PhoneIcon size={18} color="#6b7280" /></InputAdornment> }}
                                        fullWidth
                                        size="small"
                                    />
                                </Tooltip>
                            </Box>

                            {otpSent && <TextField name="code" placeholder="Nhập OTP" value={formData.code} onChange={handleChange} helperText={secondsLeft > 0 ? `OTP hết hạn sau ${Math.floor(secondsLeft / 60)}:${(secondsLeft % 60).toString().padStart(2, "0")}` : "OTP đã hết hạn"} error={secondsLeft === 0} fullWidth size="small" />}

                            {!otpSent ?
                                <Button onClick={handleSendOtp} fullWidth variant="contained" color="success" sx={{ mt: 1, py: 1.2, fontWeight: 600, borderRadius: 2 }}>Gửi OTP</Button>
                                :
                                <Button type="submit" fullWidth variant="contained" color="success" disabled={loading} sx={{ mt: 1, py: 1.2, fontWeight: 600, borderRadius: 2 }}>
                                    {loading ? <CircularProgress size={24} /> : "Hoàn tất đăng ký"}
                                </Button>
                            }
                        </Box>
                    </form>
                    <Typography textAlign="center" mt={3} variant="body2">
                        Đã có tài khoản?{" "}
                        <Link component="button" variant="body2" onClick={() => navigate("/login")}>
                            Đăng nhập ngay
                        </Link>
                    </Typography>
                </CardContent>
            </Card>
        </Box>
    );
};

export default RegisterExpertInfo;
