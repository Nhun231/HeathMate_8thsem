import React, { useEffect, useState } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Typography,
    Button,
    CircularProgress,
    Chip,
    Stack,
    Box,
    Divider,
} from "@mui/material";
import { getPostById } from "../../services/PostService";
import { getPresignedViewUrl } from "../../services/MediaService";

const PostDetailPopup = ({ open, onClose, postId }) => {
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(false);
    const [imageUrl, setImageUrl] = useState(null);

    useEffect(() => {
        if (open && postId) {
            const fetchPost = async () => {
                try {
                    setLoading(true);
                    const data = await getPostById(postId);
                    setPost(data);

                    // Lấy ảnh presigned URL
                    if (data.featuredImageUrl) {
                        let key = data.featuredImageUrl;
                        if (key.includes("/")) key = key.split("/").pop().split("?")[0];
                        const url = await getPresignedViewUrl(key);
                        setImageUrl(url);
                    } else {
                        setImageUrl("https://img.icons8.com/clouds/100/news.png");
                    }
                } catch (err) {
                    console.error("Lỗi khi lấy chi tiết bài viết:", err);
                } finally {
                    setLoading(false);
                }
            };
            fetchPost();
        }
    }, [open, postId]);

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            {loading ? (
                <DialogContent sx={{ textAlign: "center", py: 5 }}>
                    <CircularProgress color="success" />
                </DialogContent>
            ) : post ? (
                <>
                    {/* IMAGE */}
                    {imageUrl && (
                        <Box
                            sx={{
                                width: "100%",
                                height: { xs: 280, sm: 400 },
                                overflow: "hidden",
                                borderTopLeftRadius: "8px",
                                borderTopRightRadius: "8px",
                                boxShadow: "0px 6px 18px rgba(0,0,0,0.2)",
                                transition: "transform 0.4s ease",
                                "&:hover img": {
                                    transform: "scale(1.05)",
                                },
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
                                    transition: "transform 0.4s ease",
                                }}
                                onError={(e) =>
                                    (e.target.src = "https://img.icons8.com/clouds/100/news.png")
                                }
                            />
                        </Box>
                    )}

                    {/* TITLE */}
                    <DialogTitle
                        sx={{
                            fontWeight: 800,
                            color: "#0a7a28",
                            pt: 3,
                            fontSize: "1.6rem",
                            textAlign: "center",
                            lineHeight: 1.4,
                            letterSpacing: "0.5px",
                        }}
                    >
                        {post.title}
                    </DialogTitle>

                    <DialogContent dividers sx={{ px: 4, py: 3 }}>
                        {/* Date */}
                        <Typography
                            variant="subtitle2"
                            sx={{
                                mb: 2,
                                color: "text.secondary",
                                textAlign: "center",
                                fontStyle: "italic",
                            }}
                        >
                            {new Date(post.createdAt).toLocaleDateString("vi-VN")}
                        </Typography>

                        {/* Categories */}
                        <Stack
                            direction="row"
                            gap={1}
                            mb={2}
                            flexWrap="wrap"
                            justifyContent="center"
                        >
                            {post.category?.map((c) => (
                                <Chip
                                    key={c._id}
                                    label={c.name}
                                    size="small"
                                    sx={{
                                        backgroundColor: "#e7f8ec",
                                        color: "#0a7a28",
                                        fontWeight: 500,
                                        boxShadow: "0px 2px 6px rgba(0,0,0,0.1)",
                                    }}
                                />
                            ))}
                        </Stack>

                        <Divider sx={{ my: 2 }} />

                        {/* Nội dung HTML */}
                        <Box sx={{ mt: 2, textAlign: "justify" }}>
                            <div
                                dangerouslySetInnerHTML={{ __html: post.content }}
                                style={{
                                    lineHeight: 1.8,
                                    fontSize: "1.05rem",
                                    color: "#333",
                                }}
                            />
                        </Box>
                    </DialogContent>

                    <DialogActions sx={{ justifyContent: "center", py: 2 }}>
                        <Button
                            onClick={onClose}
                            color="success"
                            variant="contained"
                            sx={{
                                px: 5,
                                py: 1.2,
                                borderRadius: "10px",
                                fontWeight: 700,
                                backgroundColor: "#0a7a28",
                                "&:hover": { backgroundColor: "#096e25" },
                                boxShadow: "0px 4px 10px rgba(0,0,0,0.2)",
                                transition: "all 0.3s ease",
                            }}
                        >
                            Đóng
                        </Button>
                    </DialogActions>
                </>
            ) : (
                <DialogContent>
                    <Typography>Không tìm thấy bài viết.</Typography>
                </DialogContent>
            )}
        </Dialog>
    );
};

export default PostDetailPopup;
