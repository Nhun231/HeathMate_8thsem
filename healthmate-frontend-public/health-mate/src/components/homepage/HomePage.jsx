// src/components/homepage/HomePage.jsx
import React from "react";
import {
    Box,
    Typography,
    Button,
    Grid,
    Card,
    CardMedia,
    CardContent,
    Chip,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import heroBanner from "../../assets/healthyfood.jpg";
import pyramidFood from "../../assets/pyramidFood.jpg";

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

            {/* Đặc điểm */}
            <Box
                sx={{
                    px: { xs: 2, md: 6, lg: 10 },
                    maxWidth: "1600px",
                    mx: "auto",
                    mt: 8,
                    mb: 2,
                }}
            >
                <Grid
                    container
                    spacing={6}
                    alignItems="center"
                >
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
                            {/*Bên trái danh sách*/}
                            <Grid item xs={6}>
                                {[
                                    "Dinh dưỡng cho mọi độ tuổi",
                                    "Lời khuyên từ chuyên gia dinh dưỡng",
                                    "Dịch vụ theo dõi cân nặng",
                                ].map((txt, i) => (
                                    <Typography
                                        key={i}
                                        sx={{ fontSize: "0.90rem", color: "#000", mb: 1, mt: 2 }}
                                        textAlign={"left"}
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
                                        sx={{ fontSize: "0.90rem", color: "#000", mb: 1, mt: 2 }}
                                        textAlign={"left"}
                                    >
                                        ✓ {txt}
                                    </Typography>
                                ))}
                            </Grid>
                        </Grid>
                    </Grid>
                </Grid>
            </Box>


            {/* Tính năng */}
            <Box sx={{
                px: { xs: 2, md: 8 }, py: 8, backgroundColor: "#e4fae0ff", mt: 8,
                mb: 12,
            }}>
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
                            desc: "Cung cấp chế độ ăn phù hợp cho mục tiêu cá nhân hóa",
                        },
                    ].map((item, idx) => (
                        <Grid
                            item
                            xs={4}
                            key={idx}
                            sx={{
                                flex: 1,
                                maxWidth: "33.33%",
                                display: "flex",
                            }}
                        >
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

                                <Typography
                                    variant="h6"
                                    sx={{ fontWeight: 700, color: "#1b1b1b", mb: 1 }}
                                >
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


            {/* Hoạt động */}
            <Box sx={{ px: { xs: 2, md: 8 }, py: 8, backgroundColor: "#e4fae0ff", mb: 5 }}>
                <Typography
                    variant="h4"
                    fontWeight={700}
                    textAlign="center"
                    sx={{ color: "#097d0ff9", letterSpacing: 2, mb: 1 }}
                >
                    CÁCH CHÚNG TÔI HOẠT ĐỘNG
                </Typography>
                <Typography
                    variant="h4"
                    textAlign="center"
                    sx={{ fontWeight: 300, color: "#369c36ff", mb: 6 }}
                >
                    Dễ dàng thao tác
                </Typography>

                <Grid
                    container
                    spacing={4}
                    justifyContent="center"
                    wrap="nowrap"
                    alignItems="stretch"
                    sx={{ overflowX: "auto" }}
                >
                    {[
                        {
                            icon: "https://img.icons8.com/scribby/64/todo-list.png",
                            bg: "#d2f4d4ff",
                            title: "Chọn tính năng",
                            desc: "Lựa chọn tính năng phù hợp mục tiêu cá nhân.",
                        },
                        {
                            icon: "https://img.icons8.com/scribby/64/planner.png",
                            bg: "#eff5b7ff",
                            title: "Đặt lịch",
                            desc: "Thiết lập lịch ăn và kế hoạch theo dõi rõ ràng.",
                        },
                        {
                            icon: "https://img.icons8.com/scribby/64/stopwatch.png",
                            bg: "#f2e1dcff",
                            title: "Duy trì thói quen",
                            desc: "Giữ lịch trình và chế độ ăn uống ổn định hằng ngày.",
                        },
                        {
                            icon: "https://img.icons8.com/scribby/64/combo-chart.png",
                            bg: "#c4f2f5ff",
                            title: "Tận hưởng kết quả",
                            desc: "Cảm nhận sự thay đổi tích cực về sức khỏe.",
                        },
                    ].map((item, idx) => (
                        <Grid
                            item
                            key={idx}
                            xs={3}
                            sx={{
                                flex: 1,
                                maxWidth: "25%",
                                display: "flex",
                            }}
                        >
                            <Box
                                sx={{
                                    p: 4,
                                    border: "1px solid #e0e0e0",
                                    borderRadius: "24px",
                                    textAlign: "center",
                                    backgroundColor: "#fff",
                                    height: "100%",
                                    flex: 1,
                                }}
                            >
                                {/* Icon */}
                                <Box
                                    sx={{
                                        width: 72,
                                        height: 72,
                                        borderRadius: "20px",
                                        backgroundColor: item.bg,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        mx: "auto",
                                        mb: 3,
                                    }}
                                >
                                    <img
                                        src={item.icon}
                                        alt={item.title}
                                        width="48"
                                        height="48"
                                        style={{ objectFit: "contain" }}
                                    />
                                </Box>

                                <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
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

        </Box >
    );
};

export default HomePage;
