import React, { useState, useEffect } from "react";
import {
    Box,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Paper,
    Button,
    CircularProgress,
    Chip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    CardMedia,
    Stack,
    Pagination,
    TextField,
    MenuItem,
    IconButton,
    Tooltip,
} from "@mui/material";
import {
    Edit,
    Delete,
    Visibility,
    Add,
    Image as ImageIcon,
} from "@mui/icons-material";
import {
    listPosts,
    getPostById,
    deletePost,
} from "../../services/PostService";
import { getPresignedViewUrl } from "../../services/MediaService";
import CustomAlert from "../common/Alert";
import { useNavigate } from "react-router-dom";

const PostManagement = () => {
    const navigate = useNavigate();
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedPost, setSelectedPost] = useState(null);
    const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [postToDelete, setPostToDelete] = useState(null);
    const [imageUrls, setImageUrls] = useState({});
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [alert, setAlert] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState("All");
    const [limit] = useState(10);

    // Lấy danh sách bài viết
    const fetchPosts = async () => {
        try {
            setLoading(true);
            const params = {
                page,
                limit,
                ...(searchTerm && { search: searchTerm }),
                ...(filterStatus !== "All" && { status: filterStatus }),
            };
            const res = await listPosts(params);
            const data = res?.data || [];
            setPosts(data);
            setTotalPages(res?.totalPages || 1);
            setTotalItems(res?.total || 0);

            // Lấy presigned URL cho tất cả ảnh thumbnail
            const urls = {};
            await Promise.all(
                data.map(async (post) => {
                    if (post.featuredImageUrl) {
                        try {
                            // Extract key from URL or use the URL directly if it's already a key
                            let key = post.featuredImageUrl;
                            // If it's a full URL, extract the key (last part after last slash)
                            if (post.featuredImageUrl.includes("/")) {
                                const parts = post.featuredImageUrl.split("/");
                                key = parts[parts.length - 1];
                                // Remove query parameters if any
                                if (key.includes("?")) {
                                    key = key.split("?")[0];
                                }
                            }
                            const presignedUrl = await getPresignedViewUrl(key);
                            urls[post._id] = presignedUrl;
                        } catch (err) {
                            console.warn("Không lấy được ảnh cho:", post._id, err);
                        }
                    }
                })
            );
            setImageUrls(urls);
        } catch (err) {
            console.error("Lỗi khi lấy danh sách bài viết:", err);
            showAlert("Có lỗi xảy ra khi tải danh sách bài viết", "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPosts();
    }, [page, searchTerm, filterStatus]);

    const showAlert = (message, variant = "info") => {
        setAlert({ message, variant });
        setTimeout(() => setAlert(null), 2500);
    };

    // Xem chi tiết bài viết
    const handleViewDetails = async (postId) => {
        try {
            const post = await getPostById(postId);
            setSelectedPost(post);
            setOpenDetailsDialog(true);
        } catch (err) {
            console.error("Lỗi khi lấy chi tiết bài viết:", err);
            showAlert("Có lỗi xảy ra khi tải chi tiết bài viết", "error");
        }
    };

    // Xóa bài viết
    const handleDelete = async () => {
        if (!postToDelete) return;
        try {
            await deletePost(postToDelete._id);
            showAlert("Xóa bài viết thành công", "success");
            setOpenDeleteDialog(false);
            setPostToDelete(null);
            fetchPosts();
        } catch (err) {
            console.error("Lỗi khi xóa bài viết:", err);
            showAlert("Có lỗi xảy ra khi xóa bài viết", "error");
        }
    };

    // Mở dialog xóa
    const handleOpenDeleteDialog = (post) => {
        setPostToDelete(post);
        setOpenDeleteDialog(true);
    };

    // Đóng dialog xóa
    const handleCloseDeleteDialog = () => {
        setPostToDelete(null);
        setOpenDeleteDialog(false);
    };

    // Chuyển đến trang chỉnh sửa
    const handleEdit = (postId) => {
        navigate(`/admin/posts/edit/${postId}`);
    };

    // Chuyển đến trang thêm mới
    const handleAddNew = () => {
        navigate(`/admin/posts/add`);
    };

    const renderStatusChip = (status) => {
        switch (status) {
            case "PUBLISHED":
                return <Chip label="Đã xuất bản" color="success" variant="filled" />;
            case "DISCARDED":
                return <Chip label="Đã hủy" color="error" variant="filled" />;
            default:
                return <Chip label={status} color="default" variant="filled" />;
        }
    };

    const handleChangePage = (event, value) => {
        setPage(value);
    };

    // Lọc và tìm kiếm
    const handleSearch = () => {
        setPage(1);
        fetchPosts();
    };

    if (loading && posts.length === 0)
        return (
            <Box sx={{ textAlign: "center", mt: 5 }}>
                <CircularProgress color="primary" />
            </Box>
        );

    return (
        <Box sx={{ p: 4, position: "relative", minHeight: "100vh" }}>
            {alert && (
                <CustomAlert
                    message={alert.message}
                    variant={alert.variant}
                    autoCloseDelay={2000}
                />
            )}

            {/* Header: tiêu đề + tìm kiếm & lọc */}
            <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                mb={3}
                flexWrap="wrap"
                gap={2}
            >
                {/* Bên trái: tiêu đề */}
                <Box>
                    <Typography variant="h4" fontWeight="bold" color="primary" gutterBottom>
                        QUẢN LÝ BÀI VIẾT
                    </Typography>
                    <Typography variant="subtitle1" color="text.secondary">
                        Danh sách tất cả bài viết trong hệ thống
                    </Typography>
                </Box>

                {/* Bên phải: nút thêm mới + tìm kiếm + lọc */}
                <Box display="flex" alignItems="center" gap={2} flexWrap="wrap">
                    <Button
                        variant="contained"
                        color="primary"
                        startIcon={<Add />}
                        onClick={handleAddNew}
                        sx={{ textTransform: "none" }}
                    >
                        Thêm bài viết mới
                    </Button>
                    <TextField
                        label="Tìm kiếm theo tiêu đề"
                        variant="outlined"
                        size="small"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyPress={(e) => {
                            if (e.key === "Enter") {
                                handleSearch();
                            }
                        }}
                        sx={{ minWidth: 250 }}
                    />
                    <TextField
                        select
                        label="Lọc theo trạng thái"
                        size="small"
                        value={filterStatus}
                        onChange={(e) => {
                            setFilterStatus(e.target.value);
                            setPage(1);
                        }}
                        sx={{ minWidth: 180 }}
                    >
                        <MenuItem value="All">Tất cả</MenuItem>
                        <MenuItem value="PUBLISHED">Đã xuất bản</MenuItem>
                        <MenuItem value="DISCARDED">Đã hủy</MenuItem>
                    </TextField>
                </Box>
            </Box>

            <Paper
                sx={{
                    overflowX: "auto",
                    borderRadius: 3,
                    boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                    p: 2,
                    background: "#ffffff",
                }}
            >
                <Table>
                    <TableHead sx={{ backgroundColor: "#E3F2FD" }}>
                        <TableRow>
                            <TableCell align="center"><b>STT</b></TableCell>
                            <TableCell align="center"><b>Tiêu đề</b></TableCell>
                            <TableCell align="center"><b>Ảnh đại diện</b></TableCell>
                            <TableCell align="center"><b>Tác giả</b></TableCell>
                            <TableCell align="center"><b>Danh mục</b></TableCell>
                            <TableCell align="center"><b>Trạng thái</b></TableCell>
                            <TableCell align="center"><b>Ngày tạo</b></TableCell>
                            <TableCell align="center"><b>Thao tác</b></TableCell>
                        </TableRow>
                    </TableHead>

                    <TableBody>
                        {posts.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                                    <Typography variant="body1" color="text.secondary">
                                        Không có bài viết nào
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        ) : (
                            posts.map((post, index) => (
                                <TableRow
                                    key={post._id}
                                    hover
                                    sx={{
                                        transition: "background 0.3s ease",
                                        "&:hover": { backgroundColor: "#f0f7ff" },
                                    }}
                                >
                                    <TableCell align="center">
                                        {(page - 1) * limit + index + 1}
                                    </TableCell>

                                    <TableCell align="left">
                                        <Typography fontWeight="bold" sx={{ maxWidth: 300 }}>
                                            {post.title}
                                        </Typography>
                                        <Typography
                                            variant="body2"
                                            color="text.secondary"
                                            sx={{
                                                maxWidth: 300,
                                                overflow: "hidden",
                                                textOverflow: "ellipsis",
                                                whiteSpace: "nowrap",
                                            }}
                                        >
                                            {post.excerpt || "Không có mô tả"}
                                        </Typography>
                                    </TableCell>

                                    <TableCell align="center">
                                        {imageUrls[post._id] ? (
                                            <CardMedia
                                                component="img"
                                                image={imageUrls[post._id]}
                                                alt="thumbnail"
                                                sx={{
                                                    width: 80,
                                                    height: 80,
                                                    borderRadius: 2,
                                                    objectFit: "cover",
                                                    mx: "auto",
                                                    boxShadow: 2,
                                                }}
                                            />
                                        ) : post.featuredImageUrl ? (
                                            <Box
                                                sx={{
                                                    width: 80,
                                                    height: 80,
                                                    borderRadius: 2,
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                    backgroundColor: "#f5f5f5",
                                                    mx: "auto",
                                                }}
                                            >
                                                <ImageIcon color="disabled" />
                                            </Box>
                                        ) : (
                                            <Typography variant="caption" color="text.secondary">
                                                Không có ảnh
                                            </Typography>
                                        )}
                                    </TableCell>

                                    <TableCell align="center">
                                        <Typography>
                                            {post.author?.fullname || post.author?.email || "N/A"}
                                        </Typography>
                                    </TableCell>

                                    <TableCell align="center">
                                        {post.category && post.category.length > 0 ? (
                                            <Stack direction="row" spacing={0.5} justifyContent="center" flexWrap="wrap">
                                                {post.category.slice(0, 2).map((cat, idx) => (
                                                    <Chip
                                                        key={idx}
                                                        label={cat.name || cat}
                                                        size="small"
                                                        variant="outlined"
                                                    />
                                                ))}
                                                {post.category.length > 2 && (
                                                    <Chip
                                                        label={`+${post.category.length - 2}`}
                                                        size="small"
                                                        variant="outlined"
                                                    />
                                                )}
                                            </Stack>
                                        ) : (
                                            <Typography variant="caption" color="text.secondary">
                                                Không có
                                            </Typography>
                                        )}
                                    </TableCell>

                                    <TableCell align="center">
                                        {renderStatusChip(post.status)}
                                    </TableCell>

                                    <TableCell align="center">
                                        <Typography variant="body2">
                                            {new Date(post.createdAt).toLocaleDateString("vi-VN")}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            {new Date(post.createdAt).toLocaleTimeString("vi-VN", {
                                                hour: "2-digit",
                                                minute: "2-digit",
                                            })}
                                        </Typography>
                                    </TableCell>

                                    <TableCell align="center">
                                        <Stack direction="row" spacing={1} justifyContent="center">
                                            <Tooltip title="Xem chi tiết">
                                                <IconButton
                                                    color="primary"
                                                    onClick={() => handleViewDetails(post._id)}
                                                    size="small"
                                                >
                                                    <Visibility />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Chỉnh sửa">
                                                <IconButton
                                                    color="warning"
                                                    onClick={() => handleEdit(post._id)}
                                                    size="small"
                                                >
                                                    <Edit />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Xóa">
                                                <IconButton
                                                    color="error"
                                                    onClick={() => handleOpenDeleteDialog(post)}
                                                    size="small"
                                                >
                                                    <Delete />
                                                </IconButton>
                                            </Tooltip>
                                        </Stack>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </Paper>

            <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
                <Pagination
                    count={totalPages}
                    page={page}
                    onChange={handleChangePage}
                    color="primary"
                />
            </Box>

            {/* Dialog chi tiết */}
            <Dialog
                open={openDetailsDialog}
                onClose={() => setOpenDetailsDialog(false)}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle sx={{ fontWeight: "bold", fontSize: "1.25rem" }}>
                    Chi tiết bài viết
                </DialogTitle>
                <DialogContent dividers>
                    {selectedPost && (
                        <Box>
                            <Typography sx={{ mb: 1 }}>
                                <b>Tiêu đề:</b> {selectedPost.title}
                            </Typography>
                            <Typography sx={{ mb: 1 }}>
                                <b>Tác giả:</b> {selectedPost.author?.fullname || selectedPost.author?.email || "N/A"}
                            </Typography>
                            <Typography sx={{ mb: 1 }}>
                                <b>Trạng thái:</b> {renderStatusChip(selectedPost.status)}
                            </Typography>
                            <Typography sx={{ mb: 1 }}>
                                <b>Danh mục:</b>{" "}
                                {selectedPost.category && selectedPost.category.length > 0
                                    ? selectedPost.category.map((cat) => cat.name || cat).join(", ")
                                    : "Không có"}
                            </Typography>
                            <Typography sx={{ mb: 1 }}>
                                <b>Mô tả ngắn:</b> {selectedPost.excerpt || "Không có"}
                            </Typography>
                            <Typography sx={{ mb: 2 }}>
                                <b>Ngày tạo:</b>{" "}
                                {new Date(selectedPost.createdAt).toLocaleString("vi-VN")}
                            </Typography>
                            {selectedPost.featuredImageUrl && (
                                <Box textAlign="center" sx={{ mb: 2 }}>
                                    {imageUrls[selectedPost._id] ? (
                                        <CardMedia
                                            component="img"
                                            image={imageUrls[selectedPost._id]}
                                            alt="thumbnail"
                                            sx={{
                                                width: "100%",
                                                maxWidth: 500,
                                                borderRadius: 3,
                                                mx: "auto",
                                                boxShadow: 4,
                                            }}
                                        />
                                    ) : (
                                        <Typography variant="body2" color="text.secondary">
                                            Đang tải ảnh...
                                        </Typography>
                                    )}
                                </Box>
                            )}
                            <Typography sx={{ mb: 1 }}>
                                <b>Nội dung:</b>
                            </Typography>
                            <Box
                                sx={{
                                    border: "1px solid #e0e0e0",
                                    borderRadius: 2,
                                    p: 2,
                                    maxHeight: 400,
                                    overflow: "auto",
                                }}
                                dangerouslySetInnerHTML={{ __html: selectedPost.content }}
                            />
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={() => setOpenDetailsDialog(false)}
                        variant="contained"
                        sx={{ textTransform: "none" }}
                    >
                        Đóng
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Dialog xác nhận xóa */}
            <Dialog open={openDeleteDialog} onClose={handleCloseDeleteDialog}>
                <DialogTitle>Xác nhận xóa</DialogTitle>
                <DialogContent>
                    <Typography>
                        Bạn có chắc chắn muốn xóa bài viết "{postToDelete?.title}"? Hành động này không thể hoàn tác.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDeleteDialog} sx={{ textTransform: "none" }}>
                        Hủy
                    </Button>
                    <Button
                        onClick={handleDelete}
                        variant="contained"
                        color="error"
                        sx={{ textTransform: "none" }}
                    >
                        Xóa
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default PostManagement;

