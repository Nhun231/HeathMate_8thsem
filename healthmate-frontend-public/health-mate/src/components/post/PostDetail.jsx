import React, { useEffect, useState } from "react";
import {
    Typography,
    CircularProgress,
    Chip,
    Stack,
    Box,
    Divider,
    Container,
    Paper,
    List,
    ListItemButton,
    ListItemText,
    Avatar,
} from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import { getPostById, listNewsfeed } from "../../services/PostService";
import { getPresignedViewUrl } from "../../services/MediaService";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

const DetailPost = () => {
    const { postId } = useParams();
    const navigate = useNavigate();

    const [post, setPost] = useState(null);
    const [relatedPosts, setRelatedPosts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [imageUrl, setImageUrl] = useState(null);
    const [relatedImageUrls, setRelatedImageUrls] = useState({});

    const authorNameMap = {
        "Expert": "Chuyên gia dinh dưỡng",
        "Super Admin": "Quản trị viên",
    };

    useEffect(() => {
        if (postId) {
            const fetchPost = async () => {
                try {
                    setLoading(true);
                    const data = await getPostById(postId);
                    setPost(data);

                    if (data.featuredImageUrl) {
                        let key = data.featuredImageUrl;
                        if (key.includes("/")) key = key.split("/").pop().split("?")[0];
                        const url = await getPresignedViewUrl(key);
                        setImageUrl(url);
                    } else {
                        setImageUrl("https://img.icons8.com/clouds/100/news.png");
                    }

                    if (data.category?.length > 0) {
                        const categoryIds = data.category.map((c) => c._id);
                        const res = await listNewsfeed({
                            status: "PUBLISHED",
                            limit: 5,
                        });
                        const related = res.data.filter(
                            (p) =>
                                p._id !== data._id &&
                                p.category?.some((c) => categoryIds.includes(c._id))
                        );
                        setRelatedPosts(related);

                        const urls = {};
                        await Promise.all(
                            related.map(async (p) => {
                                if (p.featuredImageUrl) {
                                    let key = p.featuredImageUrl;
                                    if (key.includes("/")) key = key.split("/").pop().split("?")[0];
                                    try {
                                        const url = await getPresignedViewUrl(key);
                                        urls[p._id] = url;
                                    } catch {
                                        urls[p._id] = "https://img.icons8.com/clouds/100/news.png";
                                    }
                                } else {
                                    urls[p._id] = "https://img.icons8.com/clouds/100/news.png";
                                }
                            })
                        );
                        setRelatedImageUrls(urls);
                    }
                } catch (err) {
                    console.error("Lỗi khi lấy chi tiết bài viết:", err);
                } finally {
                    setLoading(false);
                }
            };
            fetchPost();
        }
    }, [postId]);

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" py={10}>
                <CircularProgress color="success" />
            </Box>
        );
    }

    if (!post) {
        return (
            <Container sx={{ py: 10, textAlign: "center" }}>
                <Typography variant="h6">Không tìm thấy bài viết.</Typography>
                <Box mt={3}>
                    <Typography
                        onClick={() => navigate(-1)}
                        sx={{ cursor: "pointer", color: "#0a7a28", fontWeight: 600 }}
                    >
                        ← Quay lại
                    </Typography>
                </Box>
            </Container>
        );
    }

    return (
        <Container sx={{ py: { xs: 4, md: 8 } }}>
            {/* Back button */}
            <Typography
                onClick={() => navigate(-1)}
                sx={{
                    cursor: "pointer",
                    mb: 3,
                    display: "inline-flex",
                    alignItems: "center",
                    color: "#0a7a28",
                    fontWeight: 600,
                    transition: "color 0.3s",
                    "&:hover": { color: "#096e25" },
                }}
            >
                <ArrowBackIcon sx={{ mr: 1 }} /> Quay lại
            </Typography>

            {/* Layout: main content + related posts */}
            <Box
                sx={{
                    display: "flex",
                    gap: 4,
                    alignItems: "flex-start",
                    flexWrap: "wrap",
                }}
            >
                {/* Main content */}
                <Box sx={{ flex: 1, minWidth: 300 }}>
                    <Paper elevation={2} sx={{ p: 4, borderRadius: 3 }}>
                        {/* Title */}
                        <Typography
                            variant="h3"
                            sx={{ fontWeight: 700, color: "#0a7a28", mb: 2, lineHeight: 1.3 }}
                        >
                            {post.title}
                        </Typography>

                        {/* Author */}
                        {post.author && (
                            <Typography
                                variant="subtitle1"
                                sx={{ color: "text.secondary", mb: 1 }}
                            >
                                Tác giả: {post.author?.fullname || "Ẩn danh"}
                            </Typography>
                        )}

                        {/* Categories
                        {post.category?.length > 0 && (
                            <Stack
                                direction="row"
                                spacing={1}
                                flexWrap="wrap"
                                mb={1}
                            >
                                {post.category.map((c) => (
                                    <Chip
                                        key={c._id}
                                        label={c.name}
                                        size="small"
                                        sx={{
                                            backgroundColor: "#e7f8ec",
                                            color: "#0a7a28",
                                            fontWeight: 500,
                                            boxShadow: "0px 2px 6px rgba(0,0,0,0.1)",
                                            fontSize: "0.8rem",
                                        }}
                                    />
                                ))}
                            </Stack>
                        )} */}

                        {/* Date */}
                        <Box display="flex" justifyContent="space-between">
                        <Typography
                            variant="subtitle2"
                            sx={{ color: "text.secondary", fontStyle: "italic", mb: 2 }}
                        >
                            Ngày tạo: {new Date(post.createdAt).toLocaleDateString("vi-VN")}
                        </Typography>
                        <Typography
                            variant="subtitle2"
                            sx={{ color: "text.secondary", fontStyle: "italic", mb: 2 }}
                        >
                            Ngày cập nhật: {new Date(post.updatedAt).toLocaleDateString("vi-VN")}
                        </Typography>
                        </Box>
                        {/* Header image */}
                        {imageUrl && (
                            <Box
                                sx={{
                                    width: "100%",
                                    height: { xs: 280, sm: 400 },
                                    overflow: "hidden",
                                    borderRadius: "16px",
                                    mb: 3,
                                    boxShadow: "0px 8px 24px rgba(0,0,0,0.15)",
                                    "& img": { transition: "transform 0.4s ease" },
                                    "&:hover img": { transform: "scale(1.03)" },
                                }}
                            >
                                <img
                                    src={imageUrl}
                                    alt={post.title}
                                    style={{
                                        width: "100%",
                                        height: "100%",
                                        objectFit: "cover",
                                        display: "block",
                                    }}
                                    onError={(e) =>
                                        (e.target.src = "https://img.icons8.com/clouds/100/news.png")
                                    }
                                />
                            </Box>
                        )}

                        {/* Content */}
                        <Box sx={{ textAlign: "justify" }}>
                            <div
                                dangerouslySetInnerHTML={{ __html: post.content }}
                                style={{ lineHeight: 1.8, fontSize: "1.05rem", color: "#333" }}
                            />
                        </Box>
                    </Paper>
                </Box>

                {/* Related posts */}
                {relatedPosts.length > 0 && (
                    <Box
                        sx={{
                            width: 320,
                            flexShrink: 0,
                            position: "sticky",
                            top: 80,
                        }}
                    >
                        <Paper elevation={2} sx={{ p: 3, borderRadius: 3 }}>
                            <Typography
                                variant="h6"
                                sx={{ mb: 2, fontWeight: 700, color: "#0a7a28" }}
                            >
                                Bài viết liên quan
                            </Typography>
                            <List>
                                {relatedPosts.map((p) => (
                                    <ListItemButton
                                        key={p._id}
                                        onClick={() => navigate(`/detail-post/${p._id}`)}
                                        sx={{ mb: 1, borderRadius: 1 }}
                                    >
                                        <Avatar
                                            src={relatedImageUrls[p._id] || "https://img.icons8.com/clouds/100/news.png"}
                                            variant="rounded"
                                            sx={{ width: 56, height: 56, mr: 1.5 }}
                                        />
                                        <ListItemText
                                            primary={p.title}
                                            primaryTypographyProps={{ fontSize: "0.95rem", noWrap: true }}
                                        />
                                    </ListItemButton>
                                ))}
                            </List>
                        </Paper>
                    </Box>
                )}
            </Box>
        </Container>
    );
};

export default DetailPost;
