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
import { createPost, updatePost, getPostById, getPostCategories } from "../../services/PostService";
import CustomAlert from "../common/Alert";
import { useNavigate, useParams } from "react-router-dom";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";

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

    const [categories, setCategories] = useState([]);
    const [loadingCategories, setLoadingCategories] = useState(true);
    const [newCategoryDialogOpen, setNewCategoryDialogOpen] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState("");

    // Load categories and post data
    useEffect(() => {
        fetchCategories();
        if (isEditMode) {
            loadPostData();
        }
    }, [postId]);

    const fetchCategories = async () => {
        try {
            setLoadingCategories(true);
            const categoryList = await getPostCategories();
            setCategories(categoryList);
        } catch (err) {
            console.error("Lỗi khi tải danh sách danh mục:", err);
        } finally {
            setLoadingCategories(false);
        }
    };

    const loadPostData = async () => {
        try {
            setLoadingPost(true);
            // Use authenticated endpoint to view posts regardless of status (for admin editing)
            const post = await getPostById(postId, true);
            
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

    // Handle category selection change
    const handleCategoryChange = (event) => {
        const value = event.target.value;
        // If "add new" option is selected, open dialog
        // Check if the value is an array and contains "__add_new__"
        if (Array.isArray(value) && value.includes("__add_new__")) {
            // Remove "__add_new__" from the array and open dialog
            const filteredValue = value.filter((v) => v !== "__add_new__");
            setFormData({
                ...formData,
                category: filteredValue,
            });
            setNewCategoryDialogOpen(true);
        } else if (value === "__add_new__") {
            setNewCategoryDialogOpen(true);
        } else {
            setFormData({
                ...formData,
                category: Array.isArray(value) ? value : [value],
            });
        }
    };

    // Add new category
    const handleAddNewCategory = () => {
        if (newCategoryName.trim()) {
            const newCategory = {
                _id: `temp_${Date.now()}`, // Temporary ID for new categories
                name: newCategoryName.trim(),
                description: "",
            };

            // Add to categories list
            if (!categories.find((cat) => cat.name === newCategory.name)) {
                setCategories([...categories, newCategory].sort((a, b) => 
                    a.name.localeCompare(b.name)
                ));
            }

            // Add to selected categories
            if (!formData.category.includes(newCategory._id)) {
                setFormData({
                    ...formData,
                    category: [...formData.category, newCategory._id],
                });
            }

            // Reset and close dialog
            setNewCategoryName("");
            setNewCategoryDialogOpen(false);
        }
    };

    // Remove category chip
    const handleRemoveCategory = (categoryIdToRemove) => {
        setFormData({
            ...formData,
            category: formData.category.filter((catId) => catId !== categoryIdToRemove),
        });
    };

    // Get category name by ID
    const getCategoryName = (categoryId) => {
        const category = categories.find((cat) => cat._id === categoryId);
        return category ? category.name : categoryId;
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

        // Filter out temporary category IDs (new categories that haven't been created yet)
        const validCategoryIds = formData.category.filter(
            (catId) => !catId.toString().startsWith("temp_")
        );
        const tempCategoryIds = formData.category.filter((catId) =>
            catId.toString().startsWith("temp_")
        );

        if (validCategoryIds.length === 0 && tempCategoryIds.length > 0) {
            showAlert(
                "Vui lòng chọn ít nhất một danh mục đã tồn tại. Danh mục mới cần được tạo trước khi sử dụng.",
                "error"
            );
            return;
        }

        if (validCategoryIds.length === 0) {
            showAlert("Vui lòng thêm ít nhất một danh mục", "error");
            return;
        }

        // Show warning if some temporary categories were filtered out
        if (tempCategoryIds.length > 0) {
            const tempCategoryNames = tempCategoryIds
                .map((id) => getCategoryName(id))
                .join(", ");
            showAlert(
                `Cảnh báo: Các danh mục mới (${tempCategoryNames}) chưa được lưu. Chỉ các danh mục đã tồn tại sẽ được gán cho bài viết.`,
                "warning"
            );
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
                category: validCategoryIds, // Only send valid category IDs
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
                                Danh mục *
                            </Typography>
                            <FormControl fullWidth>
                                <InputLabel>Chọn danh mục</InputLabel>
                                <Select
                                    multiple
                                    value={formData.category}
                                    onChange={handleCategoryChange}
                                    label="Chọn danh mục"
                                    renderValue={(selected) => (
                                        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                                            {selected.map((value) => (
                                                <Chip
                                                    key={value}
                                                    label={getCategoryName(value)}
                                                    size="small"
                                                />
                                            ))}
                                        </Box>
                                    )}
                                    disabled={loadingCategories}
                                >
                                    {categories.map((category) => (
                                        <MenuItem key={category._id} value={category._id}>
                                            {category.name}
                                        </MenuItem>
                                    ))}
                                    <MenuItem
                                        value="__add_new__"
                                        sx={{ fontStyle: "italic", color: "primary.main" }}
                                    >
                                        + Thêm danh mục mới
                                    </MenuItem>
                                </Select>
                            </FormControl>
                            {formData.category.length > 0 && (
                                <Stack direction="row" spacing={1} flexWrap="wrap" gap={1} sx={{ mt: 2 }}>
                                    {formData.category.map((catId) => (
                                        <Chip
                                            key={catId}
                                            label={getCategoryName(catId)}
                                            onDelete={() => handleRemoveCategory(catId)}
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

            {/* Add New Category Dialog */}
            <Dialog
                open={newCategoryDialogOpen}
                onClose={() => setNewCategoryDialogOpen(false)}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>Thêm danh mục mới</DialogTitle>
                <DialogContent>
                    <TextField
                        label="Tên danh mục"
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                        fullWidth
                        sx={{ mt: 2 }}
                        placeholder="Nhập tên danh mục mới..."
                        helperText="Danh mục mới sẽ được thêm vào danh sách và được chọn tự động"
                        onKeyPress={(e) => {
                            if (e.key === "Enter") {
                                e.preventDefault();
                                handleAddNewCategory();
                            }
                        }}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setNewCategoryDialogOpen(false)}>Hủy</Button>
                    <Button
                        onClick={handleAddNewCategory}
                        variant="contained"
                        disabled={!newCategoryName.trim()}
                        sx={{ textTransform: "none" }}
                    >
                        Thêm
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default PostForm;

