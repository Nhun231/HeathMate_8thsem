import React, { useState } from "react";
import { Box, Card, CardContent, Typography, Button, CircularProgress } from "@mui/material";
import { CloudUpload } from "@mui/icons-material";
import CustomAlert from "../../components/common/Alert.jsx";
import { getPresignedUploadUrl, uploadFileToS3 } from "../../services/MediaService.js";
import { createExpertCertificate, updateExpertCertificate } from "../../services/ExpertCertificateService.js";

const UploadCertificate = ({ email }) => {
    const [file, setFile] = useState(null);
    const [viewUrl, setViewUrl] = useState("");
    const [certificateId, setCertificateId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [alert, setAlert] = useState({ show: false, message: "", severity: "" });

    const handleFileUpload = async (file) => {
        setLoading(true);
        try {
            // 1️⃣ Lấy presigned URL từ server
            const { presignedUrl, key } = await getPresignedUploadUrl(file);
            // 2️⃣ Upload lên S3
            await uploadFileToS3(presignedUrl, file);
            // 3️⃣ Tạo chứng chỉ trên server
            const cert = await createExpertCertificate({ certificateURLKey: key, email });
            setCertificateId(cert._id);
            setViewUrl(cert.url);
            setAlert({ show: true, message: "Tải chứng chỉ thành công!", severity: "success" });
        } catch (err) {
            console.error(err);
            setAlert({ show: true, message: "Lỗi khi tải chứng chỉ. Vui lòng thử lại.", severity: "error" });
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateCertificate = async () => {
        if (!certificateId || !viewUrl) return;
        setLoading(true);
        try {
            await updateExpertCertificate(certificateId, { certificateURLKey: viewUrl, email });
            setAlert({ show: true, message: "Cập nhật chứng chỉ thành công!", severity: "success" });
        } catch (err) {
            console.error(err);
            setAlert({ show: true, message: "Lỗi cập nhật chứng chỉ!", severity: "error" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ minHeight: "100vh", width: "100vw", display: "flex", justifyContent: "center", alignItems: "center", p: 2 }}>
            {alert.show && (
                <CustomAlert message={alert.message} variant={alert.severity} onClose={() => setAlert({ ...alert, show: false })} />
            )}
            <Card sx={{ maxWidth: 520, width: "100%", borderRadius: 3, backgroundColor: "rgba(255,255,255,0.95)", boxShadow: "0 8px 20px rgba(0,0,0,0.15)", backdropFilter: "blur(10px)" }}>
                <CardContent sx={{ p: 4 }}>
                    <Typography variant="h5" textAlign="center" fontWeight={600} gutterBottom>🌿 Upload Chứng Chỉ Chuyên Gia</Typography>

                    <Button
                        variant="outlined"
                        component="label"
                        color="success"
                        startIcon={<CloudUpload />}
                        sx={{ textTransform: "none", py: 1.2, width: "100%" }}
                    >
                        {file ? file.name : "Chọn chứng chỉ để tải lên"}
                        <input
                            type="file"
                            hidden
                            onChange={(e) => {
                                const f = e.target.files[0];
                                setFile(f);
                                handleFileUpload(f);
                            }}
                        />
                    </Button>

                    {loading && <CircularProgress size={24} sx={{ mt: 2 }} />}

                    {viewUrl && (
                        <Typography variant="body2" color="success.main" sx={{ mt: 2 }}>
                            Chứng chỉ đã được tải lên thành công!
                        </Typography>
                    )}

                    {certificateId && (
                        <Button
                            variant="contained"
                            color="success"
                            sx={{ mt: 2, width: "100%", textTransform: "none", py: 1.2 }}
                            onClick={handleUpdateCertificate}
                            disabled={loading}
                        >
                            Cập nhật chứng chỉ
                        </Button>
                    )}
                </CardContent>
            </Card>
        </Box>
    );
};

export default UploadCertificate;
