import React from "react";
import { Box, Typography, Button, Grid, Paper } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { Apple, Calculate, Favorite, Restaurant } from "@mui/icons-material";
import banner from "../../assets/healthydish.jpg";

const HomePage = () => {
    const navigate = useNavigate();

    return (
        <>
            {/*Banner Section*/}
            <Box
                sx={{
                    width: "100%",
                    background: "linear-gradient(135deg, #f7fff7 0%, #e6f4ea 100%)",
                    py: { xs: 6, md: 10 },
                    px: { xs: 2, md: 8 },

                }}
            >
                <Grid
                    container
                    alignItems="center"
                    justifyContent="space-between"
                    spacing={4}
                    sx={{ maxWidth: "1400px", mx: "auto" }}
                >
                    {/* Text */}
                    <Grid item xs={12} md={6}>
                        <Typography
                            variant="subtitle2"
                            sx={{ color: "#61ae65ff", fontWeight: 700, letterSpacing: 1, mb: 2 }}
                        >
                            HEALTHMATE
                        </Typography>

                        <Typography
                            variant="h3"
                            sx={{
                                fontWeight: 700,
                                color: "#222",
                                mb: 3,
                                lineHeight: 1.2,
                                letterSpacing: 0.5,
                            }}
                        >
                            Ăn uống lành mạnh <br /> Sống khỏe mỗi ngày!
                        </Typography>

                        <Typography
                            variant="body1"
                            sx={{ color: "#555", mb: 4, maxWidth: 460 }}
                        >
                            Chăm sóc sức khỏe toàn diện với kế hoạch dinh dưỡng khoa học và
                            thực đơn cân bằng mỗi ngày. Cùng HealthMate khởi đầu lối sống khỏe
                            mạnh ngay hôm nay!
                        </Typography>

                        <Box display="flex" gap={2} flexWrap="wrap">
                            <Button
                                variant="contained"
                                sx={{
                                    backgroundColor: "#4CAF50",
                                    px: 4,
                                    py: 1.5,
                                    borderRadius: 3,
                                    fontWeight: 600,
                                    boxShadow: "0 6px 20px rgba(76,175,80,0.3)",
                                    "&:hover": {
                                        backgroundColor: "#43a047",
                                        transform: "translateY(-2px)",
                                    },
                                }}
                                onClick={() => window.scrollTo({ top: 700, behavior: "smooth" })}
                            >
                                Khám phá ngay
                            </Button>
                        </Box>
                    </Grid>

                    {/* Ảnh */}
                    <Grid item xs={12} md={6}>
                        <Box
                            sx={{
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                            }}
                        >
                            <Box
                                component="img"
                                src={banner}
                                alt="Món ăn lành mạnh"
                                sx={{
                                    width: { xs: 400, md: 510 },
                                    height: { xs: 400, md: 510 },
                                    borderRadius: "50%",
                                    objectFit: "cover",
                                    boxShadow: "0 12px 30px rgba(0,0,0,0.15)",
                                    transition: "transform 0.4s",
                                    "&:hover": { transform: "scale(1.03)" },
                                }}
                            />
                        </Box>
                    </Grid>
                </Grid>
            </Box>

            {/*Features Section*/}
            <Box
                sx={{
                    px: { xs: 2, md: 6, lg: 10 },
                    maxWidth: "1200px",
                    mx: "auto",
                    my: { xs: 8, md: 12 },
                }}
            >
                <Grid
                    container
                    spacing={4}
                    justifyContent="center"
                    columns={12}
                >
                    {[
                        {
                            iconUrl: "https://img.icons8.com/color/64/calculator--v1.png",
                            title: "Công cụ tính toán",
                            desc: "Tính chỉ số BMI, BMR, và TDEE một cách chính xác",
                            path: "/calculate",
                        },
                        {
                            iconUrl: "https://img.icons8.com/officel/80/water.png",
                            title: "Theo dõi lịch uống nước",
                            desc: "Kiểm tra và theo dõi lượng nước uống dễ dàng",
                            path: "/",
                        },
                        {
                            iconUrl: "https://img.icons8.com/fluency/48/scale.png",
                            title: "Lập kế hoạch cho cân nặng",
                            desc: "Gợi ý chế độ thông minh, phù hợp cho cơ thể",
                            path: "/set-goal",
                        },
                        {
                            iconUrl: "https://img.icons8.com/fluency/48/healthy-food.png",
                            title: "Lên thực đơn khoa học",
                            desc: "Tùy chỉnh chế độ ăn phù hợp với mục tiêu của bạn",
                            path: "/",
                        },
                    ].map((item, index) => (
                        <Grid
                            key={index}
                            item
                            xs={6}
                            sx={{ display: "flex", justifyContent: "center" }}
                        >
                            <Paper
                                elevation={4}
                                sx={{
                                    p: 5,
                                    textAlign: "center",
                                    borderRadius: 6,
                                    width: "100%",
                                    maxWidth: 360,
                                    transition: "all 0.4s ease",
                                    cursor: "pointer",
                                    "&:hover": {
                                        transform: "translateY(-8px)",
                                        boxShadow: "0 12px 25px rgba(0,0,0,0.2)",
                                    },
                                }}
                                onClick={() => navigate(item.path)}
                            >
                                <Box
                                    sx={{
                                        width: 70,
                                        height: 70,
                                        mb: 3,
                                        mx: "auto",
                                        display: "flex",
                                        justifyContent: "center",
                                        alignItems: "center",
                                        borderRadius: "50%",
                                        backgroundColor: "#E8F5E9",
                                        overflow: "hidden",
                                    }}
                                >
                                    <Box
                                        component="img"
                                        src={item.iconUrl}
                                        alt={item.title}
                                        sx={{ width: 40, height: 40 }}
                                    />
                                </Box>

                                <Typography variant="h6" fontWeight="bold" gutterBottom>
                                    {item.title}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {item.desc}
                                </Typography>
                            </Paper>
                        </Grid>
                    ))}
                </Grid>
            </Box>


        </>
    );
};

export default HomePage;
