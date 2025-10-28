import React, { useState } from "react";
import {
    Box,
    Card,
    CardContent,
    Typography,
    Button,
    CircularProgress,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
} from "@mui/material";
import { CloudUpload } from "@mui/icons-material";
import CustomAlert from "../../components/common/Alert.jsx";
import { getPresignedUploadUrl, uploadFileToS3 } from "../../services/MediaService.js";
import { createExpertCertificate, updateExpertCertificate } from "../../services/ExpertCertificateService.js";

const UploadCertificate = ({ userId, email }) => {
    const [file, setFile] = useState(null);
    const [viewUrl, setViewUrl] = useState("");
    const [certificateId, setCertificateId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [alert, setAlert] = useState({ show: false, message: "", severity: "" });
    const [openDialog, setOpenDialog] = useState(false);

    const handleFileUpload = async (file) => {
        setLoading(true);
        try {
            const { presignedUrl, key } = await getPresignedUploadUrl(file);
            await uploadFileToS3(presignedUrl, file);

            const cert = await createExpertCertificate({ userId, certificateURLKey: key, email });
            setCertificateId(cert._id);
            setViewUrl(cert.url);

            setAlert({ show: true, message: "Tải chứng chỉ thành công!", severity: "success" });
            setOpenDialog(true); // mở dialog chờ nhận kết quả
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
        <Box
            sx={{
                minHeight: "100vh",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                background: "linear-gradient(135deg, #E3F2FD 0%, #FFFFFF 100%)",
                p: 2,
            }}
        >
            {alert.show && (
                <CustomAlert
                    message={alert.message}
                    variant={alert.severity}
                    onClose={() => setAlert({ ...alert, show: false })}
                />
            )}

            <Card sx={{ maxWidth: 480, width: "100%", borderRadius: 4, p: 4, boxShadow: 3 }}>
                <CardContent sx={{ textAlign: "center" }}>
                    <Typography variant="h5" fontWeight={700} gutterBottom>
                        Gửi Chứng Chỉ Chuyên Gia
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                        Vui lòng chọn file chứng chỉ của bạn. Sau khi tải lên, hệ thống sẽ thông báo kết quả phê duyệt.
                    </Typography>

                    <Button
                        variant="outlined"
                        component="label"
                        color="primary"
                        startIcon={<CloudUpload />}
                        sx={{ textTransform: "none", py: 1.5, width: "100%", mb: 2 }}
                        disabled={loading}
                    >
                        {file ? file.name : "Chọn chứng chỉ để tải lên"}
                        <input
                            type="file"
                            hidden
                            onChange={(e) => {
                                const f = e.target.files[0];
                                if (f) {
                                    setFile(f);
                                    handleFileUpload(f);
                                }
                            }}
                        />
                    </Button>

                    {loading && <CircularProgress sx={{ mt: 2 }} />}

                </CardContent>
            </Card>

            {/* Dialog chờ kết quả */}
            <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="xs" fullWidth>
                <DialogTitle>Chờ nhận kết quả</DialogTitle>
                <DialogContent>
                    <Typography variant="body1">
                        Chứng chỉ của bạn đã được tải lên thành công. Vui lòng chờ hệ thống phê duyệt và thông báo kết quả qua email.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDialog(false)} variant="contained" color="primary" sx={{ textTransform: "none" }}>
                        Đóng
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default UploadCertificate;
