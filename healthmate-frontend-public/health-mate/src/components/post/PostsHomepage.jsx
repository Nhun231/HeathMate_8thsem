import React, { useEffect, useState } from "react";
import {
    Box,
    Typography,
    Chip,
    CircularProgress,
    Button,
    Stack,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { listNewsfeed } from "../../services/PostService";
import { getPresignedViewUrl } from "../../services/MediaService";

const NewsFeedSection = () => {
    const navigate = useNavigate();
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [imageUrls, setImageUrls] = useState({});

    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const CARD_HEIGHT = 420;
    const IMAGE_HEIGHT = 180;
    const DESCRIPTION_LENGTH = 250;

    const authorNameMap = {
        "Expert": "Chuyên gia dinh dưỡng",
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
                limit: 6, 
                page,
                sort: '-updatedAt', // Sort by latest first (descending order)
            });
            const data = res.data || [];
            setPosts(data);
            setTotalPages(res.totalPages || 1);

            const urls = {};
            await Promise.all(
                data.map(async (post) => {
                    if (post.featuredImageUrl) {
                        try {
                            let key = post.featuredImageUrl;
                            if (key.includes("/")) key = key.split("/").pop().split("?")[0];
                            const presignedUrl = await getPresignedViewUrl(key);
                            urls[post._id] = presignedUrl;
                        } catch (err) {
                            console.warn("Could not fetch image for post:", post._id, err);
                        }
                    }
                })
            );
            setImageUrls(urls);
        } catch (err) {
            console.error("Error loading posts:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPosts(currentPage);
    }, [currentPage]);

    if (loading)
        return (
            <Box display="flex" justifyContent="center" py={10}>
                <CircularProgress color="success" />
            </Box>
        );

    return (
        <Box sx={{ px: { xs: 3, md: 8 }, py: { xs: 8, md: 10 }, backgroundColor: "#f8fdf9" }}>
            <Typography
                variant="h3"
                fontWeight={750}
                textAlign="center"
                sx={{ color: "#0a7a28", mb: 1, letterSpacing: "0.5px" }}
            >
                Tin tức & Bài viết mới nhất
            </Typography>
            <Typography
                textAlign="center"
                color="text.secondary"
                sx={{ mb: 6, fontSize: "1.05rem" }}
            >
                Cập nhật kiến thức sức khỏe và dinh dưỡng mới nhất cùng HealthMate
            </Typography>

            {/* GRID */}
            <Box
                sx={{
                    maxWidth: "1200px",
                    margin: "0 auto",
                    display: "grid",
                    gridTemplateColumns: "repeat(3, 1fr)",
                    gap: 4,
                }}
            >
                {posts.map((post) => (
                    <Box
                        key={post._id}
                        onClick={() => navigate(`/detail-post/${post._id}`)} // Chuyển sang trang chi tiết
                        sx={{
                            border: "1px solid #e0e0e0",
                            borderRadius: "20px",
                            backgroundColor: "#fff",
                            display: "flex",
                            flexDirection: "column",
                            height: CARD_HEIGHT,
                            overflow: "hidden",
                            cursor: "pointer",
                            transition: "all 0.3s ease",
                            boxShadow: "0px 4px 12px rgba(0,0,0,0.05)",
                            "&:hover": {
                                transform: "translateY(-5px)",
                                boxShadow: "0px 8px 20px rgba(0,0,0,0.12)",
                            },
                        }}
                    >
                        <Box sx={{ position: "relative", height: IMAGE_HEIGHT, overflow: "hidden" }}>
                            <img
                                src={imageUrls[post._id] || "https://img.icons8.com/clouds/100/news.png"}
                                alt={post.title}
                                style={{
                                    objectFit: "cover",
                                    width: "100%",
                                    height: "100%",
                                    display: "block",
                                }}
                            />
                        </Box>

                        <Box sx={{ flex: 1, display: "flex", flexDirection: "column", p: 2.5 }}>
                            <Typography
                                variant="h6"
                                fontWeight={700}
                                sx={{
                                    fontSize: "1rem",
                                    lineHeight: 1.4,
                                    display: "-webkit-box",
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: "vertical",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    mb: 1,
                                }}
                            >
                                {post.title}
                            </Typography>

                            <Typography
                                sx={{
                                    color: "text.secondary",
                                    fontSize: "0.95rem",
                                    lineHeight: 1.4,
                                    display: "-webkit-box",
                                    WebkitLineClamp: 3,
                                    WebkitBoxOrient: "vertical",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    mb: 1.5,
                                }}
                            >
                                {shortenText(post.excerpt || post.content)}
                            </Typography>

                            <Stack direction="row" flexWrap="wrap" gap={1} mb={1}>
                                {post.category?.map((c) => (
                                    <Chip
                                        key={c._id}
                                        label={c.name}
                                        size="small"
                                        sx={{
                                            backgroundColor: "#e7f8ec",
                                            color: "#0a7a28",
                                            fontWeight: 500,
                                            fontSize: "0.75rem",
                                        }}
                                    />
                                ))}
                            </Stack>

                            <Typography
                                variant="subtitle2"
                                sx={{ color: "#0a7a28", fontWeight: 500, mb: 0.5 }}
                            >
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

            <Box textAlign="center" mt={6}>
                <Button
                    variant="contained"
                    color="success"
                    onClick={() => navigate("/list-post")}
                >
                    Xem thêm →
                </Button>
            </Box>
        </Box>
    );
};

export default NewsFeedSection;
