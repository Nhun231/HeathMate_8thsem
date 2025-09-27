import React from "react";
import { Box, Typography, Link, Stack } from "@mui/material";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import LocationOnIcon from "@mui/icons-material/LocationOn";

const Footer = () => {
    return (
        <Box
            component="footer"
            sx={{
                background: "linear-gradient(90deg, #4CAF50, #66BB6A)",
                color: "white",
                py: 6,
                width: "100%",
                boxShadow: "0 -4px 12px rgba(0,0,0,0.2)",
            }}
        >
            <Box maxWidth="1600px" mx="auto" px={{ xs: 2, md: 4 }}>

                <Stack
                    direction={{ xs: "column", md: "row" }}
                    spacing={{ xs: 4, md: 8 }}
                    justifyContent="space-between"
                    alignItems={{ xs: "flex-start", md: "flex-start" }}
                    flexWrap="wrap"
                >

                    <Box sx={{ flex: 1, minWidth: 250 }}>
                        <Typography variant="h6" fontWeight="bold" sx={{ mb: 1 }}>
                            HealthMate
                        </Typography>
                        <Typography variant="body2" sx={{ lineHeight: 1.6 }}>
                            Nền tảng hỗ trợ tính toán dinh dưỡng, theo dõi sức khỏe và gợi ý thực đơn khoa học cho bạn.
                        </Typography>
                    </Box>


                    <Box sx={{ flex: 1, minWidth: 180 }}>
                        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                            Liên kết nhanh
                        </Typography>
                        <Stack spacing={1}>
                            <Link
                                href="/calculate"
                                color="inherit"
                                underline="hover"
                                sx={{ "&:hover": { color: "#102e11ff" } }}
                            >
                                Công cụ tính toán
                            </Link>
                            <Link
                                href="#"
                                color="inherit"
                                underline="hover"
                                sx={{ "&:hover": { color: "#102e11ff" } }}
                            >
                                Lập kế hoạch ăn uống
                            </Link>
                            <Link
                                href="/login"
                                color="inherit"
                                underline="hover"
                                sx={{ "&:hover": { color: "#102e11ff" } }}
                            >
                                Đăng nhập
                            </Link>
                            <Link
                                href="/register"
                                color="inherit"
                                underline="hover"
                                sx={{ "&:hover": { color: "#102e11ff" } }}
                            >
                                Đăng ký
                            </Link>
                        </Stack>
                    </Box>


                    <Box sx={{ flex: 1, minWidth: 220 }}>
                        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                            Liên hệ
                        </Typography>
                        <Stack spacing={1} direction="column">
                            <Box display="flex" alignItems="center" gap={1}>
                                <EmailIcon fontSize="small" />
                                <Typography variant="body2">healthmate.wdp@gmail.com</Typography>
                            </Box>
                            <Box display="flex" alignItems="center" gap={1}>
                                <PhoneIcon fontSize="small" />
                                <Typography variant="body2">0987654321</Typography>
                            </Box>
                            <Box display="flex" alignItems="center" gap={1}>
                                <LocationOnIcon fontSize="small" />
                                <Typography variant="body2">Trường Đại học FPT Hà Nội</Typography>
                            </Box>
                        </Stack>
                    </Box>
                </Stack>


                <Box textAlign="center" mt={6}>
                    <Typography variant="body2" sx={{ opacity: 0.8 }}>
                        © {new Date().getFullYear()} HealthMate. All rights reserved.
                    </Typography>
                </Box>
            </Box>
        </Box>
    );
};

export default Footer;
