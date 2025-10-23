import React, { useState, useEffect } from "react";
import {
    Box,
    Card,
    CardContent,
    TextField,
    Typography,
    Button,
    InputAdornment,
    IconButton,
    FormControlLabel,
    RadioGroup,
    Radio,
    CircularProgress,
} from "@mui/material";
import {
    Person,
    Email,
    Lock,
    CheckCircle,
    Visibility,
    VisibilityOff,
    CloudUpload,
} from "@mui/icons-material";
import { PhoneIcon } from "lucide-react";
import dayjs from "dayjs";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { useNavigate } from "react-router-dom";
import CustomAlert from "../../components/common/Alert.jsx";
import { register, sendOTP } from "../../services/authService/RegisterService.js";
import {
    getPresignedUploadUrl,
    uploadFileToS3,
} from "../../services/MediaService.js";
import {
    createExpertCertificate,
    updateExpertCertificate,
} from "../../services/ExpertCertificateService.js";
import {
    emailValidator,
    checkPasswordsMatch,
    validatePasswordStrength,
    isValidPhoneNumber,
} from "../../utils/registerValidation.js";

const RegisterExpert = () => {
    const navigate = useNavigate();
    const [alert, setAlert] = useState({ show: false, message: "", severity: "" });
    const [formData, setFormData] = useState({
        fullname: "",
        email: "",
        password: "",
        confirmPassword: "",
        dob: "",
        gender: "",
        phoneNumber: "",
        code: "",
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [otpSent, setOtpSent] = useState(false);
    const [secondsLeft, setSecondsLeft] = useState(0);
    const [file, setFile] = useState(null);
    const [viewUrl, setViewUrl] = useState("");
    const [certificateId, setCertificateId] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    // Upload chứng chỉ
    const handleFileUpload = async (file) => {
        try {
            const { presignedUrl, key } = await getPresignedUploadUrl(file);
            await uploadFileToS3(presignedUrl, file);
            const cert = await createExpertCertificate({
                certificateURLKey: key,
                email: formData.email,
            });
            setCertificateId(cert.data.id);
            setViewUrl(cert.data.url);
            setAlert({
                show: true,
                message: "📄 Tải chứng chỉ thành công!",
                severity: "success",
            });
        } catch (err) {
            setAlert({
                show: true,
                message: "❌ Lỗi khi tải chứng chỉ. Vui lòng thử lại.",
                severity: "error",
            });
        }
    };

    // Gửi OTP
    const handleSendOtp = async () => {
        if (!formData.email) {
            return setAlert({
                show: true,
                message: "Vui lòng nhập email để nhận mã OTP!",
                severity: "warning",
            });
        }

        const emailValid = emailValidator(formData.email);
        if (!emailValid.isValid) {
            return setAlert({
                show: true,
                message: emailValid.message,
                severity: "warning",
            });
        }

        try {
            await sendOTP({ email: formData.email, type: "REGISTER" });
            setOtpSent(true);
            setSecondsLeft(300);
            setAlert({
                show: true,
                message: "✅ Mã OTP đã được gửi đến email!",
                severity: "success",
            });
        } catch {
            setAlert({
                show: true,
                message: "❌ Không thể gửi OTP. Vui lòng thử lại.",
                severity: "error",
            });
        }
    };

    // Resend OTP
    const handleResendOtp = async () => {
        await sendOTP({ email: formData.email, type: "REGISTER" });
        setSecondsLeft(300);
    };

    // Đăng ký
    const handleSubmit = async (e) => {
        e.preventDefault();
        const passwordStrength = validatePasswordStrength(formData.password);
        const passwordsMatch = checkPasswordsMatch(
            formData.password,
            formData.confirmPassword
        );

        if (!passwordStrength.isValid || !passwordsMatch.isValid) {
            return setAlert({
                show: true,
                message: "❌ Mật khẩu không hợp lệ hoặc không trùng khớp!",
                severity: "warning",
            });
        }
        if (!isValidPhoneNumber(formData.phoneNumber)) {
            return setAlert({
                show: true,
                message: "❌ Số điện thoại không hợp lệ!",
                severity: "warning",
            });
        }
        if (!formData.code) {
            return setAlert({
                show: true,
                message: "Vui lòng nhập mã OTP!",
                severity: "warning",
            });
        }

        setLoading(true);
        try {
            // Dữ liệu gửi lên backend — KHÔNG bao gồm role hoặc otp
            const registerData = {
                email: formData.email,
                password: formData.password,
                confirmPassword: formData.confirmPassword,
                fullname: formData.fullname,
                gender: formData.gender, // "Male" hoặc "Female"
                dob: formData.dob,
                phoneNumber: formData.phoneNumber,
                code: formData.code,
                isExpert: true, // nếu backend hỗ trợ đăng ký chuyên gia
            };

            await register(registerData);

            if (certificateId && viewUrl) {
                await updateExpertCertificate(certificateId, {
                    certificateURLKey: viewUrl,
                    email: formData.email,
                });
            }

            setAlert({
                show: true,
                message: "🎉 Đăng ký chuyên gia thành công!",
                severity: "success",
            });
            setTimeout(() => navigate("/login"), 2500);
        } catch (err) {
            console.error("Register error:", err);
            setAlert({
                show: true,
                message: "❌ Đăng ký thất bại. Kiểm tra lại thông tin.",
                severity: "error",
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!otpSent || secondsLeft <= 0) return;
        const id = setInterval(() => {
            setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
        }, 1000);
        return () => clearInterval(id);
    }, [otpSent, secondsLeft]);

    return (
        <Box
            sx={{
                minHeight: "100vh",
                width: "100vw",
                backgroundImage:
                    "url('https://img.herohealth.com/blog/veggies.webp')",
                backgroundSize: "cover",
                backgroundPosition: "center",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                p: 2,
            }}
        >
            {alert.show && (
                <CustomAlert
                    message={alert.message}
                    variant={alert.severity}
                    onClose={() => setAlert({ ...alert, show: false })}
                    sticky
                    autoCloseDelay={2000}
                />
            )}

            <Card
                sx={{
                    maxWidth: 520,
                    width: "100%",
                    borderRadius: 3,
                    backgroundColor: "rgba(255,255,255,0.95)",
                    boxShadow: "0 8px 20px rgba(0,0,0,0.15)",
                    backdropFilter: "blur(10px)",
                }}
            >
                <CardContent sx={{ p: 4 }}>
                    <Typography
                        variant="h5"
                        textAlign="center"
                        fontWeight={600}
                        color="primary"
                        gutterBottom
                    >
                        🌿 Đăng ký Chuyên Gia
                    </Typography>

                    <form onSubmit={handleSubmit}>
                        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                            {/* Họ và tên */}
                            <TextField
                                name="fullname"
                                placeholder="Họ và tên"
                                fullWidth
                                size="small"
                                value={formData.fullname}
                                onChange={handleChange}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <Person sx={{ color: "#6b7280" }} />
                                        </InputAdornment>
                                    ),
                                }}
                            />

                            {/* Email */}
                            <TextField
                                name="email"
                                type="email"
                                placeholder="Địa chỉ email"
                                fullWidth
                                size="small"
                                value={formData.email}
                                onChange={handleChange}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <Email sx={{ color: "#6b7280" }} />
                                        </InputAdornment>
                                    ),
                                }}
                            />

                            {/* Password */}
                            <TextField
                                name="password"
                                type={showPassword ? "text" : "password"}
                                placeholder="Mật khẩu"
                                fullWidth
                                size="small"
                                value={formData.password}
                                onChange={handleChange}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <Lock sx={{ color: "#6b7280" }} />
                                        </InputAdornment>
                                    ),
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton
                                                onClick={() => setShowPassword(!showPassword)}
                                            >
                                                {showPassword ? <VisibilityOff /> : <Visibility />}
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                }}
                            />

                            {/* Confirm Password */}
                            <TextField
                                name="confirmPassword"
                                type={showConfirmPassword ? "text" : "password"}
                                placeholder="Xác nhận mật khẩu"
                                fullWidth
                                size="small"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <CheckCircle sx={{ color: "#6b7280" }} />
                                        </InputAdornment>
                                    ),
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton
                                                onClick={() =>
                                                    setShowConfirmPassword(!showConfirmPassword)
                                                }
                                            >
                                                {showConfirmPassword ? (
                                                    <VisibilityOff />
                                                ) : (
                                                    <Visibility />
                                                )}
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                }}
                            />

                            {/* Gender */}
                            <RadioGroup
                                row
                                name="gender"
                                value={formData.gender}
                                onChange={handleChange}
                            >
                                <FormControlLabel
                                    value="Male"
                                    control={<Radio color="success" />}
                                    label="Nam"
                                />
                                <FormControlLabel
                                    value="Female"
                                    control={<Radio color="success" />}
                                    label="Nữ"
                                />
                            </RadioGroup>

                            {/* DOB */}
                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                <DatePicker
                                    label="Ngày sinh"
                                    format="DD/MM/YYYY"
                                    value={formData.dob ? dayjs(formData.dob) : null}
                                    onChange={(val) =>
                                        setFormData({
                                            ...formData,
                                            dob: val ? val.format("YYYY-MM-DD") : "",
                                        })
                                    }
                                    slotProps={{ textField: { size: "small", fullWidth: true } }}
                                />
                            </LocalizationProvider>

                            {/* Phone */}
                            <TextField
                                name="phoneNumber"
                                placeholder="Số điện thoại"
                                fullWidth
                                size="small"
                                value={formData.phoneNumber}
                                onChange={handleChange}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <PhoneIcon size={18} color="#6b7280" />
                                        </InputAdornment>
                                    ),
                                }}
                            />

                            {/* Upload Certificate */}
                            <Button
                                variant="outlined"
                                component="label"
                                color="success"
                                startIcon={<CloudUpload />}
                            >
                                {file ? file.name : "Tải chứng chỉ chuyên môn"}
                                <input
                                    type="file"
                                    hidden
                                    onChange={(e) => {
                                        const f = e.target.files[0];
                                        setFile(f);
                                        handleFileUpload(f);
                                    }}
                                />
                            </Button>
                            {viewUrl && (
                                <Typography
                                    variant="body2"
                                    color="success.main"
                                    sx={{ ml: 1 }}
                                >
                                    ✅ Đã tải lên chứng chỉ thành công!
                                </Typography>
                            )}

                            {/* OTP */}
                            {otpSent && (
                                <TextField
                                    name="code"
                                    placeholder="Nhập mã OTP"
                                    fullWidth
                                    size="small"
                                    value={formData.code}
                                    onChange={handleChange}
                                    helperText={
                                        secondsLeft > 0
                                            ? `OTP hết hạn sau ${Math.floor(secondsLeft / 60)}:${(
                                                secondsLeft % 60
                                            )
                                                .toString()
                                                .padStart(2, "0")}`
                                            : "OTP đã hết hạn"
                                    }
                                    error={secondsLeft === 0}
                                />
                            )}

                            {/* Button */}
                            {!otpSent ? (
                                <Button
                                    onClick={handleSendOtp}
                                    fullWidth
                                    variant="contained"
                                    color="success"
                                    sx={{ textTransform: "none", py: 1.2 }}
                                >
                                    Gửi mã OTP
                                </Button>
                            ) : (
                                <Button
                                    type="submit"
                                    fullWidth
                                    variant="contained"
                                    color="success"
                                    sx={{ textTransform: "none", py: 1.2 }}
                                    disabled={loading}
                                >
                                    {loading ? <CircularProgress size={24} /> : "Đăng ký chuyên gia"}
                                </Button>
                            )}
                        </Box>
                    </form>
                </CardContent>
            </Card>
        </Box>
    );
};

export default RegisterExpert;
