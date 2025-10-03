import { useEffect, useState } from "react"
import { Card, CardContent, TextField, Button, Typography, InputAdornment, IconButton, Box } from "@mui/material"
import { Person, Email, Lock, CheckCircle, CalendarToday, Visibility, VisibilityOff } from "@mui/icons-material"
import {
    checkPasswordsMatch,
    emailValidator,
    isValidPhoneNumber,
    validatePasswordStrength
} from "../../utils/registerValidation.js"
import dayjs from "dayjs";
import {AdapterDayjs} from "@mui/x-date-pickers/AdapterDayjs";
import {DatePicker, LocalizationProvider} from "@mui/x-date-pickers";
import {register, sendOTP} from "../../services/authService/RegisterService.js";
import {useNavigate} from "react-router-dom";
import {PhoneIcon} from "lucide-react";
import { RadioGroup, Radio, FormControlLabel } from "@mui/material"
import CustomAlert from "../../components/common/Alert.jsx";
import { extractBackendErrorCode, translateErrorCode } from "../../utils/errorTranslations.js";
const RegisterForm = () => {
    const [alert, setAlert] = useState({
        show: false,
        message: '',
        severity: 'info', // 'success', 'error', 'warning', 'info'
    });
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
    const navigate = useNavigate();
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

    // derive validations
    const passwordStrength = validatePasswordStrength(formData.password)
    const passwordsMatch = checkPasswordsMatch(formData.password, formData.confirmPassword)
    const emailValid = emailValidator(formData.email)
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
        console.log(formData)
        if (checkEmpty(formData)) {
            setAlert({
                show: true,
                message: "Vui lòng điền đầy đủ tất cả các trường!",
                severity: "warning",
            });
            
            // Auto close warning alert after 3 seconds
            setTimeout(() => {
                setAlert({ ...alert, show: false });
            }, 3000);
            return;
        }
        if (!isValidPhoneNumber(formData.phoneNumber)) {
            setAlert({
                show: true,
                message: "Số điện thoại phải gồm đúng 10 chữ số!",
                severity: "warning",
            });
            
            // Auto close warning alert after 3 seconds
            setTimeout(() => {
                setAlert({ ...alert, show: false });
            }, 3000);
            return;
        }
        try{
            const res = await register(formData);
            console.log("Dang ky", res)
            setAlert({
                show: true,
                message: "Đăng ký tài khoản thành công!",
                severity: "success",
            });
            setTimeout(()=>{
                console.log("đợi thông báo")
                navigate("/login")
            }, 3000)

        }catch(error){
            const code = extractBackendErrorCode(error) || error?.message;
            const vi = translateErrorCode(code) || "Đăng ký thất bại. Vui lòng kiểm tra thông tin và thử lại.";
            setAlert({ show: true, message: vi, severity: "error" });
            
            // Auto close error alert after 3 seconds
            setTimeout(() => {
                setAlert({ ...alert, show: false });
            }, 3000);
        }

    }

    const handleSendOtp = async (e) => {
        e.preventDefault();
        if (!formData.email || formData.email.trim() === "") {
            setAlert({
                show: true,
                message: "Vui lòng điền email để nhận mã OTP.",
                severity: "warning",
            });
            
            // Auto close warning alert after 3 seconds
            setTimeout(() => {
                setAlert({ ...alert, show: false });
            }, 3000);
            return;
        }

        const emailValid = emailValidator(formData.email);
        if (!emailValid.isValid) {
            setAlert({
                show: true,
                message: emailValid.message,
                severity: "warning",
            });
            
            // Auto close warning alert after 3 seconds
            setTimeout(() => {
                setAlert({ ...alert, show: false });
            }, 3000);
            return;
        }
        try {
            const response = await sendOTP({ email: formData.email, type: 'REGISTER' });
            console.log("OTP sent", response);

            setOtpSent(true);
            setSecondsLeft(300);
            setFormData((prev) => ({
                ...prev,
                code: "",
            }));
        } catch (error) {
            const code = extractBackendErrorCode(error) || error?.message;
            const vi = translateErrorCode(code) || "Không thể gửi OTP. Vui lòng thử lại.";
            setAlert({ show: true, message: vi, severity: "error" });
            
            // Auto close error alert after 3 seconds
            setTimeout(() => {
                setAlert({ ...alert, show: false });
            }, 3000);
        }
    }

    const handleResendOtp = async () => {
        if(!formData.email){
            setAlert({
                show: true,
                message: "Hãy điền email",
                severity: "warning",
            });
            
            // Auto close warning alert after 3 seconds
            setTimeout(() => {
                setAlert({ ...alert, show: false });
            }, 3000);
            return null;
        }
        setFormData({
            ...formData,
            code:""
        })
        setSecondsLeft(300)

        const response = await sendOTP({ email: formData.email, type: 'REGISTER' });
        console.log("Gui OTP", response)
    }

    useEffect(() => {
        if (!otpSent || secondsLeft <= 0) return
        const id = setInterval(() => {
            setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0))
        }, 1000)
        return () => clearInterval(id)
    }, [otpSent, secondsLeft])

    return (
        <Box
            sx={{
                minHeight: "100vh",
                width: "100vw",
                overflowX: "hidden",
                backgroundImage: "url('https://img.herohealth.com/blog/veggies.webp')",
                backgroundSize: "cover",
                backgroundPosition: "center",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                p: 2,
            }}
        >
            {alert.show && (
                <Box
                    sx={{
                        position: 'absolute',
                        top: 16,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: '90%',
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
        <Card
            sx={{
                maxWidth: 480,
                width: "100%",
                boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
                borderRadius: 2,
                backgroundColor: "rgba(255, 255, 255, 0.9)",
                backdropFilter: "blur(8px)",
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
                <Typography variant="body2" sx={{ color: "#6b7280" }}>
                    Đã có tài khoản?{" "}
                    <Typography
                        component="a"
                        href="/login"
                        sx={{
                            color: "#22c55e",
                            fontWeight: 500,
                            textDecoration: "underline",
                            "&:hover": { color: "#16a34a" },
                        }}
                    >
                        Đăng nhập ngay
                    </Typography>
                </Typography>
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
                        {/* Gender */}

                            <Box sx={{ display: "flex", alignItems: "center", mb: 0.5  }}>
                                <Person sx={{ mr: 1, color: "#6b7280", fontSize: 20 }} />
                                <Typography variant="body2" sx={{ fontWeight: 500, color: "#374151", mr:5 }}>
                                    Giới tính
                                </Typography>

                            <RadioGroup
                                row
                                name="gender"
                                value={formData.gender}
                                onChange={handleChange}
                            >
                                <FormControlLabel

                                    value="Female"
                                    control={<Radio sx={{ color: "#22c55e", '&.Mui-checked': { color: "#22c55e" } }} />}
                                    label="Nữ"
                                />
                                <FormControlLabel
                                    value="Male"
                                    control={<Radio sx={{ color: "#22c55e", '&.Mui-checked': { color: "#22c55e" } }} />}
                                    label="Nam"
                                />
                            </RadioGroup>
                        </Box>


                        {/* Phone Number */}
                        <Box>
                            <Box sx={{ display: "flex", alignItems: "center", mb: 0.5 }}>
                                <PhoneIcon sx={{ mr: 1, color: "#6b7280", fontSize: 10 }} />
                                <Typography variant="body2" sx={{ fontWeight: 500, color: "#374151" }}>
                                    Số điện thoại
                                </Typography>
                            </Box>
                            <TextField
                                fullWidth
                                name="phoneNumber"
                                placeholder="Nhập số điện thoại (10 chữ số)"
                                value={formData.phoneNumber}
                                onChange={handleChange}
                                variant="outlined"
                                size="small"
                                error={formData.phoneNumber !== "" && !isValidPhoneNumber(formData.phoneNumber)}
                                helperText={
                                    formData.phoneNumber !== "" && !isValidPhoneNumber(formData.phoneNumber)
                                        ? "Số điện thoại phải gồm đúng 10 chữ số"
                                        : ""
                                }
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
                        {!otpSent ? (
                            <Button
                                type="button"
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
                                onClick={handleSendOtp}
                            >
                                Gửi mã OTP
                            </Button>
                        ) : (
                            <Button
                                type="submit"
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
                            >
                                Tạo tài khoản
                            </Button>
                        )}
                    </Box>
                </form>
            </CardContent>
        </Card>
        </Box>
    )
}

export default RegisterForm
