import React, { useState } from "react";
import {
    Box,
    Button,
    Typography,
    Card,
    CardMedia,
    CircularProgress,
    Paper,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import {
    getPresignedUploadUrl,
    uploadFileToS3,
    getPresignedViewUrl,
} from "../../services/MediaService";

const PresignedUpload = () => {
    const [file, setFile] = useState(null);
    const [viewUrl, setViewUrl] = useState("");
    const [loading, setLoading] = useState(false);

    const handleFileChange = (e) => setFile(e.target.files[0]);

    const handleUpload = async () => {
        if (!file) return alert("Vui lòng chọn file!");

        setLoading(true);
        try {
            // 1️⃣ Lấy URL upload tạm thời
            const { presignedUrl, key } = await getPresignedUploadUrl(file);

            // 2️⃣ Upload trực tiếp lên S3
            await uploadFileToS3(presignedUrl, file);

            // 3️⃣ Lấy URL xem ảnh
            const viewUrl = await getPresignedViewUrl(key);
            setViewUrl(viewUrl);

            alert("Tải chứng chỉ thành công!");
        } catch (err) {
            alert("Lỗi khi tải chứng chỉ!");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box
            sx={{
                width: "100%",
                maxWidth: 700,
                mx: "auto",
                p: 4,
                borderRadius: 4,
                boxShadow: 4,
                bgcolor: "#fefefe",
                backgroundSize: "cover",
                backgroundPosition: "center",
                mt: 3,
                mb: 3,
            }}
        >
            <Typography
                variant="h4"
                fontWeight="bold"
                color="success.main"
                textAlign="center"
                gutterBottom
            >
                Trở thành chuyên gia của chúng tôi
            </Typography>

            <Typography
                variant="body1"
                textAlign="center"
                color="text.secondary"
                sx={{ mb: 3 }}
            >
                Hãy tải lên chứng chỉ để hoàn tất xác minh và trở thành chuyên gia uy tín.
            </Typography>

            <Paper
                elevation={0}
                sx={{
                    border: "2px dashed #81c784",
                    borderRadius: 3,
                    p: 4,
                    textAlign: "center",
                    bgcolor: "#f1f8e9",
                    "&:hover": {
                        borderColor: "#66bb6a",
                        bgcolor: "#e8f5e9",
                    },
                    transition: "0.3s",
                }}
            >
                <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    style={{ display: "none" }}
                    id="file-upload"
                />

                <label htmlFor="file-upload">
                    <Button
                        variant="contained"
                        component="span"
                        startIcon={<CloudUploadIcon />}
                        sx={{
                            bgcolor: "success.main",
                            "&:hover": { bgcolor: "success.dark" },
                            textTransform: "none",
                        }}
                    >
                        {file ? "Đã chọn: " + file.name : "Chọn file chứng chỉ"}
                    </Button>
                </label>

                {file && (
                    <Typography mt={2} color="text.secondary">
                        Kích thước: {(file.size / 1024).toFixed(1)} KB
                    </Typography>
                )}
            </Paper>

            <Box mt={3} textAlign="center">
                <Button
                    variant="contained"
                    color="success"
                    size="large"
                    disabled={!file || loading}
                    onClick={handleUpload}
                    startIcon={
                        loading ? <CircularProgress size={22} color="inherit" /> : null
                    }
                    sx={{
                        textTransform: "none",
                        fontWeight: "bold",
                        px: 4,
                        py: 1.5,
                    }}
                >
                    {loading ? "Đang tải lên..." : "Xác nhận và tải chứng chỉ"}
                </Button>
            </Box>

            {viewUrl && (
                <Box mt={5} textAlign="center">
                    <Typography
                        variant="h6"
                        fontWeight="bold"
                        color="success.main"
                        mb={2}
                    >
                        <CheckCircleIcon sx={{ mr: 1, color: "success.main" }} />
                        Chứng chỉ đã xác minh
                    </Typography>

                    <Card
                        sx={{
                            borderRadius: 3,
                            boxShadow: 3,
                            overflow: "hidden",
                            border: "1px solid #c8e6c9",
                        }}
                    >
                        <CardMedia
                            component="img"
                            src={viewUrl}
                            alt="uploaded-certificate"
                            sx={{
                                width: "100%",
                                height: 350,
                                objectFit: "contain",
                                bgcolor: "#f5f5f5",
                            }}
                        />
                    </Card>

                    <Typography variant="body2" color="text.secondary" mt={2}>
                        Ảnh này sẽ được hiển thị trong hồ sơ chuyên gia của bạn.
                    </Typography>
                </Box>
            )}
        </Box>
    );
};

export default PresignedUpload;
