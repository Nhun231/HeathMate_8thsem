import React, { useState, useEffect } from "react";
import {
    Box,
    Typography,
    TextField,
    Button,
    Paper,
    CircularProgress,
    CardMedia,
    Stack,
    Chip,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    IconButton,
} from "@mui/material";
import { CloudUpload, Delete as DeleteIcon } from "@mui/icons-material";
import {
    getPresignedUploadUrl,
    uploadFileToS3,
    getPresignedViewUrl,
} from "../../services/MediaService";
import { createPost, updatePost, getPostById } from "../../services/PostService";
import CustomAlert from "../common/Alert";
import { useNavigate, useParams } from "react-router-dom";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";

const PostForm = () => {
    const navigate = useNavigate();
    const { postId } = useParams();
    const isEditMode = !!postId;

    const [loading, setLoading] = useState(false);
    const [loadingPost, setLoadingPost] = useState(isEditMode);
    const [alert, setAlert] = useState(null);
    const [thumbnailFile, setThumbnailFile] = useState(null);
    const [thumbnailPreview, setThumbnailPreview] = useState("");
    const [thumbnailKey, setThumbnailKey] = useState("");

    const [formData, setFormData] = useState({
        title: "",
        content: "",
        category: [],
        status: "PUBLISHED",
        featuredImageUrl: "",
    });

    const [categoryInput, setCategoryInput] = useState("");

    // Load post data if in edit mode
    useEffect(() => {
        if (isEditMode) {
            loadPostData();
        }
    }, [postId]);

    const loadPostData = async () => {
        try {
            setLoadingPost(true);
            const post = await getPostById(postId);
            
            // Load thumbnail if exists
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
                    setThumbnailPreview(presignedUrl);
                    setThumbnailKey(key);
                } catch (err) {
                    console.warn("Không lấy được ảnh:", err);
                }
            }

            // Extract category IDs
            const categoryIds = post.category
                ? post.category.map((cat) => (typeof cat === "object" ? cat._id : cat))
                : [];

            setFormData({
                title: post.title || "",
                content: post.content || "",
                category: categoryIds,
                status: post.status || "PUBLISHED",
                featuredImageUrl: post.featuredImageUrl || "",
            });
        } catch (err) {
            console.error("Lỗi khi tải dữ liệu bài viết:", err);
            showAlert("Có lỗi xảy ra khi tải dữ liệu bài viết", "error");
        } finally {
            setLoadingPost(false);
        }
    };

    const showAlert = (message, variant = "info") => {
        setAlert({ message, variant });
        setTimeout(() => setAlert(null), 2500);
    };

    // Handle thumbnail file selection
    const handleThumbnailChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            // Validate file type
            if (!file.type.startsWith("image/")) {
                showAlert("Vui lòng chọn file ảnh", "error");
                return;
            }

            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                showAlert("Kích thước file không được vượt quá 5MB", "error");
                return;
            }

            setThumbnailFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setThumbnailPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    // Remove thumbnail
    const handleRemoveThumbnail = () => {
        setThumbnailFile(null);
        setThumbnailPreview("");
        setThumbnailKey("");
        setFormData({ ...formData, featuredImageUrl: "" });
    };

    // Add category
    const handleAddCategory = () => {
        if (categoryInput.trim() && !formData.category.includes(categoryInput.trim())) {
            setFormData({
                ...formData,
                category: [...formData.category, categoryInput.trim()],
            });
            setCategoryInput("");
        }
    };

    // Remove category
    const handleRemoveCategory = (categoryToRemove) => {
        setFormData({
            ...formData,
            category: formData.category.filter((cat) => cat !== categoryToRemove),
        });
    };

    // Upload thumbnail to S3
    const uploadThumbnail = async () => {
        if (!thumbnailFile) {
            return thumbnailKey || "";
        }

        try {
            const { presignedUrl, key } = await getPresignedUploadUrl(thumbnailFile);
            await uploadFileToS3(presignedUrl, thumbnailFile);
            return key;
        } catch (err) {
            console.error("Lỗi khi upload ảnh:", err);
            throw err;
        }
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.title.trim()) {
            showAlert("Vui lòng nhập tiêu đề", "error");
            return;
        }

        if (!formData.content.trim()) {
            showAlert("Vui lòng nhập nội dung", "error");
            return;
        }

        if (formData.category.length === 0) {
            showAlert("Vui lòng thêm ít nhất một danh mục", "error");
            return;
        }

        try {
            setLoading(true);

            // Upload thumbnail if new file is selected
            let imageKey = thumbnailKey;
            if (thumbnailFile) {
                imageKey = await uploadThumbnail();
            }

            const submitData = {
                title: formData.title,
                content: formData.content,
                category: formData.category,
                ...(imageKey && { featuredImageUrl: imageKey }),
            };

            if (isEditMode) {
                // Update existing post
                submitData.status = formData.status;
                await updatePost(postId, submitData);
                showAlert("Cập nhật bài viết thành công", "success");
            } else {
                // Create new post
                await createPost(submitData);
                showAlert("Tạo bài viết thành công", "success");
            }

            // Navigate back to list after 1 second
            setTimeout(() => {
                navigate("/admin/posts");
            }, 1000);
        } catch (err) {
            console.error("Lỗi khi lưu bài viết:", err);
            showAlert(
                isEditMode
                    ? "Có lỗi xảy ra khi cập nhật bài viết"
                    : "Có lỗi xảy ra khi tạo bài viết",
                "error"
            );
        } finally {
            setLoading(false);
        }
    };

    if (loadingPost) {
        return (
            <Box sx={{ textAlign: "center", mt: 5 }}>
                <CircularProgress color="primary" />
            </Box>
        );
    }

    return (
        <Box sx={{ p: 4, minHeight: "100vh" }}>
            {alert && (
                <CustomAlert
                    message={alert.message}
                    variant={alert.variant}
                    autoCloseDelay={2000}
                />
            )}

            <Paper sx={{ p: 4, borderRadius: 3, boxShadow: 3 }}>
                <Typography variant="h4" fontWeight="bold" color="primary" gutterBottom>
                    {isEditMode ? "CHỈNH SỬA BÀI VIẾT" : "THÊM BÀI VIẾT MỚI"}
                </Typography>

                <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
                    <Stack spacing={3}>
                        {/* Tiêu đề */}
                        <TextField
                            fullWidth
                            label="Tiêu đề *"
                            value={formData.title}
                            onChange={(e) =>
                                setFormData({ ...formData, title: e.target.value })
                            }
                            required
                            variant="outlined"
                        />

                        {/* Nội dung */}
                        <Box>
                            <Typography variant="subtitle2" gutterBottom sx={{ mb: 1 }}>
                                Nội dung *
                            </Typography>
                            <Box
                                sx={{
                                    border: "1px solid rgba(0, 0, 0, 0.23)",
                                    borderRadius: "4px",
                                    "& .ck-editor": {
                                        minHeight: "400px",
                                    },
                                    "& .ck-content": {
                                        minHeight: "400px",
                                    },
                                }}
                            >
                                <CKEditor
                                    key={isEditMode ? `edit-${postId}` : "create"}
                                    editor={ClassicEditor}
                                    data={formData.content}
                                    onChange={(event, editor) => {
                                        const data = editor.getData();
                                        setFormData({ ...formData, content: data });
                                    }}
                                    config={{
                                        toolbar: [
                                            "heading",
                                            "|",
                                            "bold",
                                            "italic",
                                            "link",
                                            "bulletedList",
                                            "numberedList",
                                            "|",
                                            "blockQuote",
                                            "insertTable",
                                            "|",
                                            "undo",
                                            "redo",
                                        ],
                                        heading: {
                                            options: [
                                                {
                                                    model: "paragraph",
                                                    title: "Paragraph",
                                                    class: "ck-heading_paragraph",
                                                },
                                                {
                                                    model: "heading1",
                                                    view: "h1",
                                                    title: "Heading 1",
                                                    class: "ck-heading_heading1",
                                                },
                                                {
                                                    model: "heading2",
                                                    view: "h2",
                                                    title: "Heading 2",
                                                    class: "ck-heading_heading2",
                                                },
                                                {
                                                    model: "heading3",
                                                    view: "h3",
                                                    title: "Heading 3",
                                                    class: "ck-heading_heading3",
                                                },
                                            ],
                                        },
                                    }}
                                />
                            </Box>
                            <Typography variant="caption" display="block" sx={{ mt: 1, color: "text.secondary" }}>
                                Sử dụng thanh công cụ để định dạng nội dung bài viết
                            </Typography>
                        </Box>

                        {/* Danh mục */}
                        <Box>
                            <Typography variant="subtitle2" gutterBottom>
                                Danh mục * (Nhập ID danh mục)
                            </Typography>
                            <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
                                <TextField
                                    size="small"
                                    placeholder="Nhập ID danh mục"
                                    value={categoryInput}
                                    onChange={(e) => setCategoryInput(e.target.value)}
                                    onKeyPress={(e) => {
                                        if (e.key === "Enter") {
                                            e.preventDefault();
                                            handleAddCategory();
                                        }
                                    }}
                                    sx={{ flexGrow: 1 }}
                                />
                                <Button
                                    variant="outlined"
                                    onClick={handleAddCategory}
                                    disabled={!categoryInput.trim()}
                                >
                                    Thêm
                                </Button>
                            </Stack>
                            {formData.category.length > 0 && (
                                <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
                                    {formData.category.map((cat, index) => (
                                        <Chip
                                            key={index}
                                            label={cat}
                                            onDelete={() => handleRemoveCategory(cat)}
                                            color="primary"
                                            variant="outlined"
                                        />
                                    ))}
                                </Stack>
                            )}
                        </Box>

                        {/* Trạng thái (chỉ hiển thị khi edit) */}
                        {isEditMode && (
                            <FormControl fullWidth>
                                <InputLabel>Trạng thái</InputLabel>
                                <Select
                                    value={formData.status}
                                    label="Trạng thái"
                                    onChange={(e) =>
                                        setFormData({ ...formData, status: e.target.value })
                                    }
                                >
                                    <MenuItem value="PUBLISHED">Đã xuất bản</MenuItem>
                                    <MenuItem value="DISCARDED">Đã hủy</MenuItem>
                                </Select>
                            </FormControl>
                        )}

                        {/* Ảnh đại diện */}
                        <Box>
                            <Typography variant="subtitle2" gutterBottom>
                                Ảnh đại diện
                            </Typography>
                            {thumbnailPreview ? (
                                <Box sx={{ position: "relative", display: "inline-block" }}>
                                    <CardMedia
                                        component="img"
                                        image={thumbnailPreview}
                                        alt="thumbnail"
                                        sx={{
                                            width: 300,
                                            height: 200,
                                            borderRadius: 2,
                                            objectFit: "cover",
                                            boxShadow: 2,
                                        }}
                                    />
                                    <IconButton
                                        onClick={handleRemoveThumbnail}
                                        sx={{
                                            position: "absolute",
                                            top: 8,
                                            right: 8,
                                            backgroundColor: "rgba(255, 255, 255, 0.8)",
                                            "&:hover": { backgroundColor: "rgba(255, 255, 255, 0.9)" },
                                        }}
                                    >
                                        <DeleteIcon color="error" />
                                    </IconButton>
                                </Box>
                            ) : (
                                <Button
                                    variant="outlined"
                                    component="label"
                                    startIcon={<CloudUpload />}
                                    sx={{ textTransform: "none" }}
                                >
                                    Chọn ảnh đại diện
                                    <input
                                        type="file"
                                        hidden
                                        accept="image/*"
                                        onChange={handleThumbnailChange}
                                    />
                                </Button>
                            )}
                            <Typography variant="caption" display="block" sx={{ mt: 1, color: "text.secondary" }}>
                                Kích thước tối đa: 5MB. Định dạng: JPG, PNG, WEBP
                            </Typography>
                        </Box>

                        {/* Buttons */}
                        <Stack direction="row" spacing={2} justifyContent="flex-end">
                            <Button
                                variant="outlined"
                                onClick={() => navigate("/admin/posts")}
                                disabled={loading}
                                sx={{ textTransform: "none" }}
                            >
                                Hủy
                            </Button>
                            <Button
                                type="submit"
                                variant="contained"
                                disabled={loading}
                                sx={{ textTransform: "none" }}
                            >
                                {loading ? (
                                    <CircularProgress size={24} color="inherit" />
                                ) : isEditMode ? (
                                    "Cập nhật"
                                ) : (
                                    "Tạo mới"
                                )}
                            </Button>
                        </Stack>
                    </Stack>
                </Box>
            </Paper>
        </Box>
    );
};

export default PostForm;

