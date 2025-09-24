import { useEffect, useState } from "react"
import { Card, CardContent, TextField, Button, Typography, InputAdornment, IconButton, Box } from "@mui/material"
import { Email, Lock, Visibility, VisibilityOff } from "@mui/icons-material"
import GoogleIcon from '@mui/icons-material/Google';
import {login} from "../../services/authService/LoginService.js";
const LoginForm = () => {
    const [formData, setFormData] = useState({
        email: "",
        password: "",
    })

    const [showPassword, setShowPassword] = useState(false)
    const checkEmpty = (formData) => {
        return Object.values(formData).some((value) => !value || value.trim() === "")
    }
    const handleChange = (e) => {
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
        try{
            const res = await login(formData);
            alert("Đăng nhập thành công, chào mừng tới với HealthMate")
            console.log("Đăng nhập", res)
            localStorage.setItem("accessToken", res.data.accessToken)
        }catch(e){
            alert("Lỗi khi đăng nhập: ",e.message)
            console.log(e)
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
                        Đăng nhập
                    </Typography>
                    <Typography
                        variant="body1"
                        sx={{
                            color: "#6b7280",
                            mb: 2,
                        }}
                    >
                        HealthMate đồng hành cùng bạn trên hành trình cải thiện vóc dáng
                    </Typography>
                </Box>
                <Typography variant="body2" sx={{ color: "#6b7280" }}>
                    Chưa có tài khoản?{" "}
                    <Typography
                        component="a"
                        href="/register"
                        sx={{
                            color: "#22c55e",
                            fontWeight: 500,
                            textDecoration: "underline",
                            "&:hover": { color: "#16a34a" },
                        }}
                    >
                        Đăng ký ngay
                    </Typography>
                </Typography>
                {/* Form */}
                <form onSubmit={handleSubmit}>
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>

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

                        {/* Submit Button */}
                        <Button
                            type= "submit"
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
                            Đăng nhập
                        </Button>
                        <Box sx={{ display: "flex", alignItems: "center"}}>
                            <Typography variant="body2" sx={{ fontWeight: 500, color: "#374151" }}>
                                Hoặc
                            </Typography>
                        </Box>
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            sx={{

                                py: 1,
                                backgroundColor: "#22c55e",
                                "&:hover": {
                                    backgroundColor: "#16a34a",
                                },
                                textTransform: "none",
                                fontSize: "0.95rem",
                                fontWeight: 500,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: 1, // space between icon and text
                            }}
                        >
                            <GoogleIcon sx={{ color: "#6b7280" }} /> {/* Tailwind grey-500 */}
                            Tiếp tục với Google
                        </Button>
                    </Box>
                </form>
            </CardContent>
        </Card>
        </Box>
    )
}

export default LoginForm
