// src/components/homepage/HomePage.jsx
import React from "react";
import {
    Box,
    Typography,
    Button,
    Grid,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import heroBanner from "../../assets/healthyfood.jpg";
import pyramidFood from "../../assets/pyramidFood.jpg";
import NewsFeedSection from "../post/PostsHomepage";

const HomePage = () => {
    const navigate = useNavigate();

    return (
        <Box>
            {/* Banner Section */}
            <Box
                sx={{
                    width: "100%",
                    height: { xs: "auto", md: "420px" },
                    backgroundImage: `url(${heroBanner})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    textAlign: "center",
                    px: 2,
                    py: 6,
                    position: "relative",
                }}
            >
                <Box
                    sx={{
                        backgroundColor: "rgba(0, 0, 0, 0.45)",
                        color: "white",
                        p: 4,
                        borderRadius: 2,
                        maxWidth: "1300px",
                    }}
                >
                    <Typography
                        variant="h4"
                        fontWeight={600}
                        sx={{ fontSize: { xs: "1.8rem", md: "2.4rem" } }}
                        mb={2}
                    >
                        Giải pháp quản lý sức khỏe & dinh dưỡng toàn diện
                    </Typography>
                    <Typography
                        variant="body1"
                        fontWeight={300}
                        sx={{ fontSize: { xs: "1.1rem", md: "1.3rem" } }}
                        mb={3}
                    >
                        Quản lý sức khỏe bắt đầu từ những con số – Dễ dùng, khoa học, gần gũi
                    </Typography>
                    <Button
                        variant="contained"
                        color="success"
                        size="large"
                        onClick={() => navigate("/register")}
                        sx={{ fontWeight: 600 }}
                    >
                        Bắt đầu ngay
                    </Button>
                </Box>
            </Box>

            {/* --- Đặc điểm --- */}
            <Box
                sx={{
                    px: { xs: 2, md: 6, lg: 10 },
                    maxWidth: "1600px",
                    mx: "auto",
                    mt: 8,
                    mb: 2,
                }}
            >
                <Grid container spacing={6} alignItems="center">
                    {/* Bên trái */}
                    <Grid item xs={12} md={5}>
                        <Box
                            component="img"
                            src={pyramidFood}
                            alt="Food Pyramid"
                            sx={{
                                width: "150%",
                                maxWidth: 460,
                                borderRadius: 2,
                                display: "block",
                                mx: "auto",
                            }}
                        />
                    </Grid>

                    {/* Bên phải */}
                    <Grid item xs={12} md={7}>
                        <Typography
                            variant="h5"
                            fontWeight={700}
                            sx={{
                                fontSize: { xs: "1.9rem", md: "2.5rem" },
                                color: "#17891ff9",
                                mb: 4,
                            }}
                        >
                            VỀ HEALTHMATE
                        </Typography>

                        <Grid container spacing={2}>
                            {/* Bên trái danh sách */}
                            <Grid item xs={6}>
                                {[
                                    "Dinh dưỡng cho mọi độ tuổi",
                                    "Lời khuyên từ chuyên gia dinh dưỡng",
                                    "Dịch vụ theo dõi cân nặng",
                                ].map((txt, i) => (
                                    <Typography
                                        key={i}
                                        sx={{ fontSize: "0.9rem", color: "#000", mb: 1, mt: 2 }}
                                        textAlign="left"
                                    >
                                        ✓ {txt}
                                    </Typography>
                                ))}
                            </Grid>

                            {/* Bên phải danh sách */}
                            <Grid item xs={6}>
                                {[
                                    "Cân bằng thể chất & tinh thần",
                                    "Lời khuyên protein & chế độ tập luyện",
                                    "Thói quen ăn uống lành mạnh",
                                ].map((txt, i) => (
                                    <Typography
                                        key={i}
                                        sx={{ fontSize: "0.9rem", color: "#000", mb: 1, mt: 2 }}
                                        textAlign="left"
                                    >
                                        ✓ {txt}
                                    </Typography>
                                ))}
                            </Grid>
                        </Grid>
                    </Grid>
                </Grid>
            </Box>

            {/* --- NEWSFEED SECTION --- */}
            <NewsFeedSection />

            {/* --- Tính năng --- */}
            <Box
                sx={{
                    px: { xs: 2, md: 8 },
                    py: 8,
                    backgroundColor: "#e4fae0ff",
                    mt: 8,
                    mb: 12,
                }}
            >
                <Grid container spacing={4} justifyContent="center" wrap="nowrap" alignItems="stretch">
                    {[
                        {
                            iconBg: "#f9ef96ff",
                            icon: "https://img.icons8.com/scribby/50/water.png",
                            title: "Nhắc nhở uống nước",
                            desc: "Theo dõi lượng nước hằng ngày và gửi thông báo khi cần.",
                        },
                        {
                            iconBg: "#f6b0b8ff",
                            icon: "https://img.icons8.com/clouds/100/menu.png",
                            title: "Quản lý thực đơn",
                            desc: "Ghi lại bữa ăn, tính toán calo và dinh dưỡng mỗi ngày để kiểm soát.",
                        },
                        {
                            iconBg: "#b6e6b8ff",
                            icon: "https://img.icons8.com/bubbles/100/meal.png",
                            title: "Dịch vụ ăn uống & sức khỏe",
                            desc: "Cung cấp chế độ ăn phù hợp cho mục tiêu cá nhân hóa.",
                        },
                    ].map((item, idx) => (
                        <Grid item xs={4} key={idx} sx={{ flex: 1, maxWidth: "33.33%", display: "flex" }}>
                            <Box
                                sx={{
                                    p: 4,
                                    border: "1px solid #e0e0e0",
                                    borderRadius: "24px",
                                    textAlign: "left",
                                    backgroundColor: "#fff",
                                    height: "100%",
                                    flex: 1,
                                }}
                            >
                                <Box
                                    sx={{
                                        width: 64,
                                        height: 64,
                                        borderRadius: "16px",
                                        backgroundColor: item.iconBg,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        mb: 3,
                                    }}
                                >
                                    <img
                                        src={item.icon}
                                        alt={item.title}
                                        width="50"
                                        height="50"
                                        style={{ objectFit: "contain" }}
                                    />
                                </Box>

                                <Typography variant="h6" sx={{ fontWeight: 700, color: "#1b1b1b", mb: 1 }}>
                                    {item.title}
                                </Typography>

                                <Typography sx={{ color: "text.secondary", fontSize: "0.95rem" }}>
                                    {item.desc}
                                </Typography>
                            </Box>
                        </Grid>
                    ))}
                </Grid>
            </Box>

            {/* --- Đăng ký trở thành chuyên gia --- */}
            <Box
                sx={{
                    px: { xs: 3, md: 10 },
                    py: { xs: 8, md: 12 },
                    background: "linear-gradient(145deg, #e3f8e6 0%, #f7fff9 100%)",
                    textAlign: "center",
                    borderTop: "1px solid #d6efd8",
                }}
            >
                <Box
                    sx={{
                        maxWidth: "850px",
                        mx: "auto",
                        p: { xs: 4, md: 6 },
                        backgroundColor: "#ffffff",
                        borderRadius: "28px",
                        boxShadow: "0 10px 30px rgba(0, 128, 0, 0.08)",
                        position: "relative",
                        overflow: "hidden",
                        "&::before": {
                            content: '""',
                            position: "absolute",
                            top: "-80px",
                            right: "-80px",
                            width: "180px",
                            height: "180px",
                            background: "rgba(23,137,31,0.1)",
                            borderRadius: "50%",
                            filter: "blur(60px)",
                        },
                    }}
                >
                    <Typography
                        variant="h4"
                        fontWeight={700}
                        sx={{
                            color: "#0a7a28",
                            mb: 3,
                            fontSize: { xs: "1.9rem", md: "2.4rem" },
                            letterSpacing: 0.5,
                        }}
                    >
                        Trở Thành Chuyên Gia HealthMate 🌿
                    </Typography>

                    <Typography
                        variant="body1"
                        sx={{
                            mb: 5,
                            color: "#333",
                            fontSize: { xs: "1rem", md: "1.1rem" },
                            lineHeight: 1.8,
                            maxWidth: "720px",
                            mx: "auto",
                        }}
                    >
                        Bạn là chuyên gia dinh dưỡng, huấn luyện viên hay người đam mê sức khỏe?
                        Hãy cùng HealthMate lan tỏa lối sống lành mạnh đến cộng đồng,
                        chia sẻ kiến thức và hỗ trợ hàng ngàn người dùng xây dựng chế độ ăn uống khoa học hơn.
                    </Typography>

                    <Button
                        variant="contained"
                        color="success"
                        size="large"
                        sx={{
                            fontWeight: 600,
                            borderRadius: "14px",
                            px: 6,
                            py: 1.8,
                            fontSize: "1.1rem",
                            boxShadow: "0 6px 18px rgba(16,122,44,0.25)",
                            textTransform: "none",
                            transition: "all 0.3s ease",
                            "&:hover": {
                                backgroundColor: "#0c6e27",
                                boxShadow: "0 8px 22px rgba(16,122,44,0.35)",
                                transform: "translateY(-3px)",
                            },
                        }}
                        onClick={() => navigate("/register-expert")}
                    >
                        Đăng ký trở thành chuyên gia
                    </Button>
                </Box>
            </Box>
        </Box>
    );
};

export default HomePage;
