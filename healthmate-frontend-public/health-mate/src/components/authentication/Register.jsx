import { useEffect, useState } from "react"
import { Card, CardContent, TextField, Button, Typography, InputAdornment, IconButton, Box } from "@mui/material"
import { Person, Email, Lock, CheckCircle, CalendarToday, Visibility, VisibilityOff } from "@mui/icons-material"
import {checkPasswordsMatch, emailValidator, validatePasswordStrength} from "../../utils/registerValidation.js"
import dayjs from "dayjs";
import {AdapterDayjs} from "@mui/x-date-pickers/AdapterDayjs";
import {DatePicker, LocalizationProvider} from "@mui/x-date-pickers";
import {register, sendOTP} from "../../services/RegisterService.js";

const RegisterForm = () => {
    const [formData, setFormData] = useState({
        fullname: "",
        email: "",
        password: "",
        confirmPassword: "",
        dob: "",
        gender: "",
        phoneNumber: "",
        code:""
    })

    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [otpSent, setOtpSent] = useState(false)
    const [secondsLeft, setSecondsLeft] = useState(0)
    const normalizeDob = (val) => {
        // if user types dd/mm/yyyy → convert to yyyy-mm-dd
        const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(val);
        if (m) {
            const [_, dd, mm, yyyy] = m;
            return `${yyyy}-${mm}-${dd}`;
        }
        return val;
    };
    const checkEmpty = (formData) => {
        return Object.values(formData).some((value) => !value || value.trim() === "")
    }
    const handleChange = (e) => {
        if (e.target.name === "dob") {
            e.target.value=normalizeDob(e.target.value);
        }
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        })
    }

    const handleSubmit = async(e) => {
        e.preventDefault()
        if (checkEmpty(formData)) {
            alert("Vui lòng điền đầy đủ tất cả các trường!");
            return;
        }
            const res = await register(formData);
            console.log("Dang ky", res)
    }

    const handleSendOtp = async() => {
        if(!formData.email){
            alert("Hãy điền email")
            return null;
        }
        if (!otpSent) {
            setFormData({
            ...formData,
            code:""
        })
            setOtpSent(true)
            setSecondsLeft(300)
        }

        const response = await sendOTP(formData);
        console.log("Gui OTP", response)
    }

    const handleResendOtp = async () => {
        if(!formData.email){
            alert("Hãy điền email")
            return null;
        }
        setFormData({
            ...formData,
            code:""
        })
        setSecondsLeft(300)

        const response = await sendOTP(formData);
        console.log("Gui OTP", response)
    }

    useEffect(() => {
        if (!otpSent || secondsLeft <= 0) return
        const id = setInterval(() => {
            setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0))
        }, 1000)
        return () => clearInterval(id)
    }, [otpSent, secondsLeft])

    // derive validations
    const passwordStrength = validatePasswordStrength(formData.password)
    const passwordsMatch = checkPasswordsMatch(formData.password, formData.confirmPassword)
    const emailValid = emailValidator(formData.email)
    return (
        <Card
            sx={{
                maxWidth: 480,
                width: "100%",
                boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
                borderRadius: 2,
            }}
        >
            <CardContent sx={{ p: 3 }}>
                {/* Header Section */}
                <Box textAlign="center" mb={4}>
                    <Typography
                        variant="h5"
                        component="h1"
                        sx={{
                            fontWeight: 600,
                            color: "#1f2937",
                            mb: 0.5,
                        }}
                    >
                        Tạo tài khoản mới
                    </Typography>
                    <Typography
                        variant="body1"
                        sx={{
                            color: "#6b7280",
                            mb: 2,
                        }}
                    >
                        Bắt đầu ngay hôm nay để cải thiện chế độ ăn uống của bạn
                    </Typography>
                </Box>

                {/* Form */}
                <form onSubmit={handleSubmit}>
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                        
                        {/* Full Name */}
                        <Box>
                            <Box sx={{ display: "flex", alignItems: "center", mb: 0.5 }}>
                                <Person sx={{ mr: 1, color: "#6b7280", fontSize: 20 }} />
                                <Typography variant="body2" sx={{ fontWeight: 500, color: "#374151" }}>
                                   Tên của bạn
                                </Typography>
                            </Box>
                            <TextField
                                fullWidth
                                name="fullname"
                                placeholder="Nhập họ tên hoặc nickname"
                                value={formData.fullname}
                                onChange={handleChange}
                                variant="outlined"
                                size="small"
                                sx={{
                                    "& .MuiOutlinedInput-root": {
                                        backgroundColor: "#f9fafb",
                                        "& fieldset": {
                                            borderColor: "#e5e7eb",
                                        },
                                        "&:hover fieldset": {
                                            borderColor: "#d1d5db",
                                        },
                                        "&.Mui-focused fieldset": {
                                            borderColor: "#22c55e",
                                        },
                                    },
                                }}
                            />
                        </Box>

                        {/* Email Address */}
                        <Box>
                            <Box sx={{ display: "flex", alignItems: "center", mb: 0.5 }}>
                                <Email sx={{ mr: 1, color: "#6b7280", fontSize: 20 }} />
                                <Typography variant="body2" sx={{ fontWeight: 500, color: "#374151" }}>
                                    Email
                                </Typography>
                            </Box>
                            <TextField
                                fullWidth
                                name="email"
                                type="email"
                                placeholder="Địa chỉ email"
                                value={formData.email}
                                onChange={handleChange}
                                error={Boolean(formData.email) && !emailValid.isValid}
                                helperText={Boolean(formData.email) && !emailValid.isValid ? emailValid.message: "" }
                                variant="outlined"
                                size="small"
                                sx={{
                                    "& .MuiOutlinedInput-root": {
                                        backgroundColor: "#f9fafb",
                                        "& fieldset": {
                                            borderColor: "#e5e7eb",
                                        },
                                        "&:hover fieldset": {
                                            borderColor: "#d1d5db",
                                        },
                                        "&.Mui-focused fieldset": {
                                            borderColor: "#22c55e",
                                        },
                                    },
                                }}
                            />
                        </Box>

                        {/* Password */}
                        <Box>
                            <Box sx={{ display: "flex", alignItems: "center", mb: 0.5 }}>
                                <Lock sx={{ mr: 1, color: "#6b7280", fontSize: 20 }} />
                                <Typography variant="body2" sx={{ fontWeight: 500, color: "#374151" }}>
                                    Mật khẩu
                                </Typography>
                            </Box>
                            <TextField
                                fullWidth
                                name="password"
                                type={showPassword ? "text" : "password"}
                                placeholder="Nhập mật khẩu mạnh "
                                value={formData.password}
                                onChange={handleChange}
                                variant="outlined"
                                size="small"
                                error={Boolean(formData.password) && !passwordStrength.isValid}
                                helperText={Boolean(formData.password) && !passwordStrength.isValid ? passwordStrength.message : ""}
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" sx={{ color: "#6b7280" }}>
                                                {showPassword ? <VisibilityOff /> : <Visibility />}
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                }}
                                sx={{
                                    "& .MuiOutlinedInput-root": {
                                        backgroundColor: "#f9fafb",
                                        "& fieldset": {
                                            borderColor: "#e5e7eb",
                                        },
                                        "&:hover fieldset": {
                                            borderColor: "#d1d5db",
                                        },
                                        "&.Mui-focused fieldset": {
                                            borderColor: "#22c55e",
                                        },
                                    },
                                }}
                            />
                        </Box>

                        {/* Confirm Password */}
                        <Box>
                            <Box sx={{ display: "flex", alignItems: "center", mb: 0.5 }}>
                                <CheckCircle sx={{ mr: 1, color: "#6b7280", fontSize: 20 }} />
                                <Typography variant="body2" sx={{ fontWeight: 500, color: "#374151" }}>
                                    Xác nhận mật khẩu
                                </Typography>
                            </Box>
                            <TextField
                                fullWidth
                                name="confirmPassword"
                                type={showConfirmPassword ? "text" : "password"}
                                placeholder="Nhập lại mật khẩu"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                variant="outlined"
                                size="small"
                                error={!passwordsMatch.isValid}
                                helperText={!passwordsMatch.isValid ? passwordsMatch.message : ""}
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton
                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                edge="end"
                                                sx={{ color: "#6b7280" }}
                                            >
                                                {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                }}
                                sx={{
                                    "& .MuiOutlinedInput-root": {
                                        backgroundColor: "#f9fafb",
                                        "& fieldset": {
                                            borderColor: "#e5e7eb",
                                        },
                                        "&:hover fieldset": {
                                            borderColor: "#d1d5db",
                                        },
                                        "&.Mui-focused fieldset": {
                                            borderColor: "#22c55e",
                                        },
                                    },
                                }}
                            />
                        </Box>

                        {/* Date of Birth */}
                        <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="vi">
                            <DatePicker
                                label="Ngày sinh"
                                format="DD/MM/YYYY"
                                value={formData.dob ? dayjs(formData.dob) : null}
                                onChange={(newValue) => {
                                    setFormData(prev => ({
                                        ...prev,
                                        dob: newValue ? newValue.format("YYYY-MM-DD") : ""
                                    }));
                                }}
                                slotProps={{
                                    textField: {
                                        size: "small",
                                        fullWidth: true,
                                        sx: {
                                            // base/hover border
                                            "& .MuiOutlinedInput-root": {
                                                backgroundColor: "#f9fafb",
                                                "& .MuiOutlinedInput-notchedOutline": { borderColor: "#e5e7eb" },
                                                "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#d1d5db" },
                                            },

                                            "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
                                                borderColor: "#22c55e !important",
                                            },

                                            "& .MuiInputLabel-root.Mui-focused": {
                                                color: "#22c55e !important",
                                            },

                                            // (optional) calendar icon color on focus/hover
                                            "& .MuiSvgIcon-root": { color: "#22c55e" },
                                        },
                                    },
                                }}
                            />
                        </LocalizationProvider>

                        {/* OTP */}
                        {otpSent && (
                            <Box>
                                <Box sx={{ display: "flex", alignItems: "center", mb: 0.5 }}>
                                    <CheckCircle sx={{ mr: 1, color: "#6b7280", fontSize: 20 }} />
                                    <Typography variant="body2" sx={{ fontWeight: 500, color: "#374151" }}>
                                        Mã OTP
                                    </Typography>
                                </Box>
                                <TextField
                                    fullWidth
                                    name="code"
                                    placeholder="Nhập mã OTP"
                                    value={formData.code}
                                    onChange={handleChange}
                                    variant="outlined"
                                    size="small"
                                    sx={{
                                        "& .MuiOutlinedInput-root": {
                                            backgroundColor: "#f9fafb",
                                            "& fieldset": {
                                                borderColor: "#e5e7eb",
                                            },
                                            "&:hover fieldset": {
                                                borderColor: "#d1d5db",
                                            },
                                            "&.Mui-focused fieldset": {
                                                borderColor: "#22c55e",
                                            },
                                        },
                                    }}
                                    helperText={secondsLeft > 0 ? `OTP hết hạn sau ${String(Math.floor(secondsLeft / 60)).padStart(2, "0")}:${String(secondsLeft % 60).padStart(2, "0")}` : "OTP đã hết hạn"}
                                    error={otpSent && secondsLeft === 0}
                                />
                                <Box sx={{ mt: 0.5 }}>
                                    <Typography
                                        variant="caption"
                                        onClick={secondsLeft === 0 ? handleResendOtp : undefined}
                                        sx={{
                                            color: secondsLeft === 0 ? "#16a34a" : "#9ca3af",
                                            cursor: secondsLeft === 0 ? "pointer" : "not-allowed",
                                            textDecoration: secondsLeft === 0 ? "underline" : "none",
                                            userSelect: "none",
                                        }}
                                    >
                                        {secondsLeft === 0 ? "Gửi lại mã OTP" : "Bạn có thể gửi lại khi hết thời gian"}
                                    </Typography>
                                </Box>
                            </Box>
                        )}

                        {/* Submit Button */}
                        <Button
                            type={otpSent ? "submit" : "button"}
                            fullWidth
                            variant="contained"
                            sx={{
                                mt: 1.5,
                                py: 1,
                                backgroundColor: "#22c55e",
                                "&:hover": {
                                    backgroundColor: "#16a34a",
                                },
                                textTransform: "none",
                                fontSize: "0.95rem",
                                fontWeight: 500,
                            }}
                            onClick={otpSent ? undefined : handleSendOtp}
                        >
                            {otpSent ? "Tạo tài khoản" : "Gửi mã OTP"}
                        </Button>
                    </Box>
                </form>
            </CardContent>
        </Card>
    )
}

export default RegisterForm
