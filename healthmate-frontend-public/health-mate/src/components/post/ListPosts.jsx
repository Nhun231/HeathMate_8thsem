import React, { useEffect, useState, useMemo } from "react";
import {
    Box,
    Typography,
    Chip,
    CircularProgress,
    Stack,
    IconButton,
} from "@mui/material";
import { listNewsfeed } from "../../services/PostService";
import { getPresignedViewUrl } from "../../services/MediaService";
import { useNavigate } from "react-router-dom";
import { ArrowBackIos, ArrowForwardIos } from "@mui/icons-material";

const ListPost = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [imageUrls, setImageUrls] = useState({});
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [carouselIndex, setCarouselIndex] = useState(0);
    const navigate = useNavigate();

    const POSTS_PER_PAGE = 6;
    const DESCRIPTION_LENGTH = 250;

    const authorNameMap = {
        Expert: "Chuyên gia",
        "Super Admin": "Quản trị viên",
    };

    const shortenText = (htmlText) => {
        const tmp = document.createElement("div");
        tmp.innerHTML = htmlText;
        const text = tmp.textContent || tmp.innerText || "";
        return text.length > DESCRIPTION_LENGTH
            ? text.substring(0, DESCRIPTION_LENGTH) + "..."
            : text;
    };

    const fetchPosts = async (page = 1) => {
        try {
            setLoading(true);
            const res = await listNewsfeed({
                status: "PUBLISHED",
                limit: POSTS_PER_PAGE,
                page,
                sort: '-updatedAt', // Sort by latest first (descending order)
            });
            const data = res.data || [];
            setPosts(data);
            setTotalPages(res.totalPages || res.pagination?.totalPages || 1);

            const urls = {};
            await Promise.all(
                data.map(async (post) => {
                    if (post.featuredImageUrl) {
                        try {
                            const key = post.featuredImageUrl.split("/").pop().split("?")[0];
                            const presignedUrl = await getPresignedViewUrl(key);
                            urls[post._id] = presignedUrl;
                        } catch (err) {
                            console.warn("Image fetch error:", err);
                        }
                    }
                })
            );
            setImageUrls(urls);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPosts(currentPage);
    }, [currentPage]);

    const carouselPosts = useMemo(() => posts.slice(0, 3), [posts]);
    const allPosts = posts;

    // Tự động slide carousel 5s/lần
    useEffect(() => {
        const interval = setInterval(() => {
            setCarouselIndex((prev) =>
                prev === carouselPosts.length - 1 ? 0 : prev + 1
            );
        }, 5000);
        return () => clearInterval(interval);
    }, [carouselPosts.length]);

    const handlePrevCarousel = () => {
        setCarouselIndex((prev) =>
            prev === 0 ? carouselPosts.length - 1 : prev - 1
        );
    };

    const handleNextCarousel = () => {
        setCarouselIndex((prev) =>
            prev === carouselPosts.length - 1 ? 0 : prev + 1
        );
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" py={10}>
                <CircularProgress color="success" />
            </Box>
        );
    }

    if (!posts.length) {
        return <Typography textAlign="center">Chưa có bài viết nào.</Typography>;
    }

    return (
        <Box sx={{ px: { xs: 2, md: 6 }, py: { xs: 6, md: 8 }, backgroundColor: "#f4f4f4" }}>
            {/* Tiêu đề page */}
            <Typography
                variant="h3"
                fontWeight={800}
                sx={{
                    color: "#0a7a28",
                    mb: 4,
                    position: "relative",
                    display: "inline-block",
                    "&::after": {
                        content: '""',
                        position: "absolute",
                        bottom: -6,
                        left: 0,
                        width: "60px",
                        height: "6px",
                        background: "linear-gradient(to right, #0a7a28, #58d68d)",
                        borderRadius: "4px",
                    },
                }}
            >
                Tin tức mới nhất
            </Typography>

            {/* Carousel */}
            <Box
                sx={{
                    position: "relative",
                    borderRadius: "12px",
                    mb: 6,
                    overflow: "hidden",
                    height: { xs: 300, md: 450 },
                    backgroundColor: "#000",
                }}
            >
                {carouselPosts.map((post, idx) => {
                    const isActive = idx === carouselIndex;
                    return (
                        <Box
                            key={post._id}
                            onClick={() => navigate(`/detail-post/${post._id}`)}
                            sx={{
                                position: "absolute",
                                top: 0,
                                left: 0,
                                width: "100%",
                                height: "100%",
                                transition: "opacity 0.8s ease, transform 0.8s ease",
                                opacity: isActive ? 1 : 0,
                                transform: `scale(${isActive ? 1 : 0.95})`,
                                cursor: "pointer",
                                zIndex: isActive ? 2 : 1,
                            }}
                        >
                            <img
                                src={imageUrls[post._id] || "https://img.icons8.com/clouds/100/news.png"}
                                alt={post.title}
                                style={{
                                    width: "100%",
                                    height: "100%",
                                    objectFit: "cover",
                                    imageRendering: "auto",
                                }}
                                loading="lazy"
                            />
                            <Box
                                sx={{
                                    position: "absolute",
                                    bottom: 0,
                                    left: 0,
                                    width: "100%",
                                    background: "linear-gradient(to top, rgba(0,0,0,0.75), transparent)",
                                    color: "#fff",
                                    p: { xs: 2, md: 3 },
                                }}
                            >
                                <Typography
                                    variant="h4"
                                    fontWeight={900}
                                    sx={{
                                        textShadow: "2px 2px 12px rgba(0,0,0,0.7)",
                                        mb: 1,
                                    }}
                                >
                                    {post.title}
                                </Typography>
                                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                                    Tác giả: {post.author?.fullname || "Ẩn danh"}
                                </Typography>
                            </Box>
                        </Box>
                    );
                })}

                {/* Controls */}
                <IconButton
                    onClick={handlePrevCarousel}
                    sx={{
                        position: "absolute",
                        left: 12,
                        top: "50%",
                        transform: "translateY(-50%)",
                        color: "#fff",
                        zIndex: 3,
                        backgroundColor: "rgba(0,0,0,0.3)",
                        "&:hover": { backgroundColor: "rgba(0,0,0,0.5)" },
                    }}
                >
                    <ArrowBackIos fontSize="small" />
                </IconButton>
                <IconButton
                    onClick={handleNextCarousel}
                    sx={{
                        position: "absolute",
                        right: 12,
                        top: "50%",
                        transform: "translateY(-50%)",
                        color: "#fff",
                        zIndex: 3,
                        backgroundColor: "rgba(0,0,0,0.3)",
                        "&:hover": { backgroundColor: "rgba(0,0,0,0.5)" },
                    }}
                >
                    <ArrowForwardIos fontSize="small" />
                </IconButton>

                {/* Dots */}
                <Stack
                    direction="row"
                    spacing={1}
                    sx={{
                        position: "absolute",
                        bottom: 10,
                        left: "50%",
                        transform: "translateX(-50%)",
                        zIndex: 3,
                    }}
                >
                    {carouselPosts.map((_, idx) => (
                        <Box
                            key={idx}
                            onClick={() => setCarouselIndex(idx)}
                            sx={{
                                width: 12,
                                height: 12,
                                borderRadius: "50%",
                                backgroundColor: idx === carouselIndex ? "#fff" : "rgba(255,255,255,0.6)",
                                border: "1px solid rgba(255,255,255,0.7)",
                                cursor: "pointer",
                                transition: "background-color 0.3s ease",
                            }}
                        />
                    ))}
                </Stack>
            </Box>

            {/* Grid bài viết */}
            <Box
                sx={{
                    display: "grid",
                    gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "1fr 1fr 1fr" },
                    gap: 4,
                }}
            >
                {allPosts.map((post) => (
                    <Box
                        key={post._id}
                        onClick={() => navigate(`/detail-post/${post._id}`)}
                        sx={{
                            backgroundColor: "#fff",
                            borderRadius: "10px",
                            overflow: "hidden",
                            cursor: "pointer",
                            transition: "transform 0.3s ease, box-shadow 0.3s ease",
                            boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
                            "&:hover": {
                                transform: "scale(1.03)",
                                boxShadow: "0 6px 20px rgba(0,0,0,0.15)",
                            },
                        }}
                    >
                        <Box sx={{ aspectRatio: "16/9", overflow: "hidden" }}>
                            <img
                                src={imageUrls[post._id] || "https://img.icons8.com/clouds/100/news.png"}
                                alt={post.title}
                                style={{
                                    width: "100%",
                                    height: "100%",
                                    objectFit: "cover",
                                    imageRendering: "auto",
                                }}
                                loading="lazy"
                            />
                        </Box>
                        <Box sx={{ p: 2.5 }}>
                            <Typography
                                variant="subtitle1"
                                fontWeight={700}
                                sx={{
                                    mb: 1,
                                    color: "#0a7a28",
                                    display: "-webkit-box",
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: "vertical",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                }}
                            >
                                {post.title}
                            </Typography>
                            <Typography sx={{ color: "#555", fontSize: "0.9rem", mb: 1.5 }}>
                                {shortenText(post.excerpt || post.content)}
                            </Typography>
                            <Stack direction="row" spacing={1} mb={1} flexWrap="wrap">
                                {post.category?.map((c) => (
                                    <Chip
                                        key={c._id}
                                        label={c.name}
                                        size="small"
                                        sx={{ backgroundColor: "#e0f2e9", color: "#0a7a28", fontWeight: 500 }}
                                    />
                                ))}
                            </Stack>
                            <Typography variant="subtitle2" sx={{ color: "#0a7a28", mb: 0.5 }}>
                                Tác giả: {post.author?.fullname || "Ẩn danh"}
                            </Typography>
                            <Box display="flex" justifyContent="space-between">
                            <Typography variant="caption" sx={{ color: "#666", fontStyle: "italic" }}>
                                Ngày tạo: {new Date(post.createdAt).toLocaleDateString("vi-VN")}
                            </Typography>
                            <Typography variant="caption" sx={{ color: "#666", fontStyle: "italic" }}>
                                Ngày cập nhật: {new Date(post.updatedAt).toLocaleDateString("vi-VN")}
                            </Typography>
                            </Box>
                        </Box>
                    </Box>
                ))}
            </Box>

            {/* Pagination */}
            <Stack direction="row" spacing={2} justifyContent="center" mt={6} alignItems="center">
                <Chip
                    label="Trang trước"
                    clickable
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    color={currentPage === 1 ? "default" : "success"}
                    disabled={currentPage === 1}
                />
                <Typography variant="body2">
                    Trang {currentPage} / {totalPages}
                </Typography>
                <Chip
                    label="Trang sau"
                    clickable
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                    color={currentPage === totalPages ? "default" : "success"}
                    disabled={currentPage === totalPages}
                />
            </Stack>
        </Box>
    );
};

export default ListPost;
