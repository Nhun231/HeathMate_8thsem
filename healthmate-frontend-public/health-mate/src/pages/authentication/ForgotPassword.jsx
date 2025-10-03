import { useEffect, useState } from "react"
import {Card, CardContent, TextField, Button, Typography, InputAdornment, IconButton, Box, Alert} from "@mui/material"
import {CheckCircle, Email, Lock, Visibility, VisibilityOff} from "@mui/icons-material"
import GoogleIcon from '@mui/icons-material/Google';
import CustomAlert from "../../components/common/Alert.jsx";
import {sendOTP} from "../../services/authService/RegisterService.js";
import {checkPasswordsMatch, validatePasswordStrength} from "../../utils/registerValidation.js";
import {forgotPassword} from "../../services/authService/ForgotPasswordService.js";
import { extractBackendErrorCode, translateErrorCode } from "../../utils/errorTranslations.js";
import {useNavigate} from "react-router-dom";
const ForgotPassword = () => {
    const navigate = useNavigate();
    const [alert, setAlert] = useState({
        show: false,
        message: '',
        severity: 'info', // 'success', 'error', 'warning', 'info'
    });
    const [formData, setFormData] = useState({
        email: "",
        code: "",
        newPassword: "",
        confirmNewPassword:""
    });
    const [otpSent, setOtpSent] = useState(false)
    const [secondsLeft, setSecondsLeft] = useState(0)
    const [showNewPassword, setShowNewPassword] = useState(false)
    const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false)
    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        })
    }
    const passwordStrength = validatePasswordStrength(formData.newPassword)
    const passwordsMatch = checkPasswordsMatch(formData.newPassword, formData.confirmNewPassword)
    const handleSendOtp = async () => {
        try {
            if(!formData.email){
                setAlert({
                    show: true,
                    message: "Hãy điền email",
                    severity: "warning",
                });
                
                setTimeout(() => {
                    setAlert({ ...alert, show: false });
                }, 3000);
                return null;
            }
            const response = await sendOTP({ email: formData.email, type: 'FORGOT_PASSWORD' });
            console.log("OTP sent", response);

            setOtpSent(true);
            setSecondsLeft(300);
        } catch (error) {
            const code = extractBackendErrorCode(error) || error?.message;
            const vi = translateErrorCode(code) || "Không thể gửi OTP. Vui lòng thử lại.";
            setAlert({ show: true, message: vi, severity: "error" });
            
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

        const response = await sendOTP({ email: formData.email, type: 'FORGOT_PASSWORD' });
        console.log("Gui OTP", response)
    }
    const handleSubmit = async(e) => {
        e.preventDefault()
        console.log("quen mat khau",formData)
        try{
            const res = await forgotPassword(formData);

            setAlert({
                show: true,
                message: "Đổi mật khẩu thành công, vui lòng đăng nhập bằng mật khẩu mới để tiếp tục",
                severity: "success",
            });
            setTimeout(() => {
                setAlert({ ...alert, show: false });
                navigate("/login")
            }, 3000);
        }catch(error){
            const code = extractBackendErrorCode(error) || error?.message;
            const vi = translateErrorCode(code) || "Đổi mật khẩu thất bại. Vui lòng kiểm tra mã OTP và thử lại.";
            setAlert({ show: true, message: vi, severity: "error" });
            setTimeout(() => {
                setAlert({ ...alert, show: false });
            }, 3000);
        }

    }
    return  (
        <Box
            sx={{
                height: "100vh",
                width: "100vw",
                backgroundImage: "url('https://img.herohealth.com/blog/veggies.webp')",
                backgroundSize: "cover",
                backgroundPosition: "center",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                overflow: "hidden",
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
                            Thiết lập mật khẩu mới
                        </Typography>
                    </Box>
                    {/* Form */}
                    <form onSubmit={handleSubmit}>
                        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
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
                            {/* OTP */}
                            {otpSent && (
                                <Box>

                                    {/* Password */}
                                    <Box>
                                        <Box sx={{ display: "flex", alignItems: "center", mb: 0.5 }}>
                                            <Lock sx={{ mr: 1, color: "#6b7280", fontSize: 20 }} />
                                            <Typography variant="body2" sx={{ fontWeight: 500, color: "#374151" }}>
                                                Mật khẩu mới
                                            </Typography>
                                        </Box>
                                        <TextField
                                            fullWidth
                                            name="newPassword"
                                            type={showNewPassword ? "text" : "password"}
                                            placeholder="Nhập mật khẩu mạnh "
                                            value={formData.newPassword}
                                            onChange={handleChange}
                                            variant="outlined"
                                            size="small"
                                            error={Boolean(formData.newPassword) && !passwordStrength.isValid}
                                            helperText={Boolean(formData.newPassword) && !passwordStrength.isValid ? passwordStrength.message : ""}
                                            InputProps={{
                                                endAdornment: (
                                                    <InputAdornment position="end">
                                                        <IconButton onClick={() => setShowNewPassword(!showNewPassword)} edge="end" sx={{ color: "#6b7280" }}>
                                                            {showNewPassword ? <VisibilityOff /> : <Visibility />}
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
                                                Xác nhận mật khẩu mới
                                            </Typography>
                                        </Box>
                                        <TextField
                                            fullWidth
                                            name="confirmNewPassword"
                                            type={showConfirmNewPassword ? "text" : "password"}
                                            placeholder="Nhập lại mật khẩu"
                                            value={formData.confirmNewPassword}
                                            onChange={handleChange}
                                            variant="outlined"
                                            size="small"
                                            error={!passwordsMatch.isValid}
                                            helperText={!passwordsMatch.isValid ? passwordsMatch.message : ""}
                                            InputProps={{
                                                endAdornment: (
                                                    <InputAdornment position="end">
                                                        <IconButton
                                                            onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)}
                                                            edge="end"
                                                            sx={{ color: "#6b7280" }}
                                                        >
                                                            {showConfirmNewPassword ? <VisibilityOff /> : <Visibility />}
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
                                    Đổi mật khẩu
                                </Button>
                            )}

                        </Box>
                    </form>
                </CardContent>
            </Card>
        </Box>
    )
}

export default ForgotPassword
