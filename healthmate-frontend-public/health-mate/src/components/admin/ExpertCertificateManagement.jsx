import React, { useEffect, useState } from "react";
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
    Divider,
} from "@mui/material";
import {
    listExpertCertificates,
    updateExpertCertificateStatus,
} from "../../services/ExpertCertificateService";
import { getPresignedViewUrl } from "../../services/MediaService";
import CustomAlert from "../common/Alert";

const ExpertCertificateList = () => {
    const [certificates, setCertificates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCert, setSelectedCert] = useState(null);
    const [openDialog, setOpenDialog] = useState(false);
    const [imageUrls, setImageUrls] = useState({});
    const [page, setPage] = useState(1);
    const [alert, setAlert] = useState(null);

    const rowsPerPage = 5;

    const fetchCertificates = async () => {
        try {
            setLoading(true);
            const res = await listExpertCertificates();
            const data = Array.isArray(res)
                ? res
                : Array.isArray(res?.data)
                    ? res.data
                    : Array.isArray(res?.certificates)
                        ? res.certificates
                        : [];
            setCertificates(data);

            const urls = {};
            await Promise.all(
                data.map(async (cert) => {
                    try {
                        const presignedUrl = await getPresignedViewUrl(cert.certificateURLKey);
                        urls[cert._id] = presignedUrl;
                    } catch (err) {
                        console.warn("Không lấy được ảnh cho:", cert._id);
                    }
                })
            );
            setImageUrls(urls);
        } catch (err) {
            console.error("Lỗi khi lấy danh sách chứng chỉ:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCertificates();
    }, []);

    const showAlert = (message, variant = "info") => {
        setAlert({ message, variant });
        setTimeout(() => setAlert(null), 2500);
    };

    const handleApprove = async (id) => {
        try {
            await updateExpertCertificateStatus(id, { status: "Approved" });
            await fetchCertificates();
            showAlert("Phê duyệt chứng chỉ thành công", "success");
        } catch (err) {
            console.error("Lỗi khi duyệt chứng chỉ:", err);
            showAlert("Có lỗi khi phê duyệt chứng chỉ", "error");
        }
    };

    const handleReject = async (id) => {
        try {
            await updateExpertCertificateStatus(id, { status: "Rejected" });
            await fetchCertificates();
            showAlert("Đã từ chối chứng chỉ", "warning");
        } catch (err) {
            console.error("Lỗi khi từ chối chứng chỉ:", err);
            showAlert("Có lỗi khi từ chối chứng chỉ", "error");
        }
    };

    const handleView = (cert) => {
        setSelectedCert(cert);
        setOpenDialog(true);
    };

    const handleClose = () => {
        setSelectedCert(null);
        setOpenDialog(false);
    };

    const renderStatusChip = (status) => {
        switch (status) {
            case "Approved":
                return <Chip label="Đã duyệt" color="success" variant="filled" />;
            case "Rejected":
                return <Chip label="Từ chối" color="error" variant="filled" />;
            default:
                return <Chip label="Chờ duyệt" color="warning" variant="filled" />;
        }
    };

    const handleChangePage = (event, value) => {
        setPage(value);
    };

    const paginatedData = certificates.slice(
        (page - 1) * rowsPerPage,
        page * rowsPerPage
    );

    if (loading)
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

            <Typography variant="h4" fontWeight="bold" color="primary" textAlign="center" gutterBottom>
                QUẢN LÝ CHỨNG CHỈ CHUYÊN GIA
            </Typography>
            <Typography variant="subtitle1" color="text.secondary" textAlign="center" mb={3}>
                Danh sách chứng chỉ đang chờ phê duyệt hoặc đã xử lý
            </Typography>

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
                            <TableCell align="center"><b>Người nộp</b></TableCell>
                            <TableCell align="center"><b>Ảnh chứng chỉ</b></TableCell>
                            <TableCell align="center"><b>Trạng thái</b></TableCell>
                            <TableCell align="center"><b>Thao tác</b></TableCell>
                        </TableRow>
                    </TableHead>

                    <TableBody>
                        {paginatedData.map((cert, index) => (
                            <TableRow
                                key={cert._id}
                                hover
                                sx={{
                                    transition: "background 0.3s ease",
                                    "&:hover": { backgroundColor: "#f0f7ff" },
                                }}
                            >
                                <TableCell align="center">
                                    {(page - 1) * rowsPerPage + index + 1}
                                </TableCell>
                                <TableCell align="center">{cert.user?.fullname}</TableCell>
                                <TableCell align="center">
                                    {imageUrls[cert._id] ? (
                                        <CardMedia
                                            component="img"
                                            image={imageUrls[cert._id]}
                                            alt="certificate"
                                            sx={{
                                                width: 100,
                                                height: 100,
                                                borderRadius: 2,
                                                objectFit: "cover",
                                                mx: "auto",
                                                boxShadow: 2,
                                            }}
                                        />
                                    ) : (
                                        <Typography variant="caption" color="text.secondary">
                                            Đang tải ảnh...
                                        </Typography>
                                    )}
                                </TableCell>
                                <TableCell align="center">
                                    {renderStatusChip(cert.status)}
                                </TableCell>
                                <TableCell align="center">
                                    <Stack direction="row" spacing={1.2} justifyContent="center">
                                        <Button
                                            variant="contained"
                                            size="small"
                                            sx={{
                                                backgroundColor: "#43A047",
                                                color: "#fff",
                                                textTransform: "none",
                                                borderRadius: 2,
                                                fontWeight: 600,
                                                px: 2.5,
                                                "&:hover": { backgroundColor: "#388E3C" },
                                            }}
                                            onClick={() => handleApprove(cert._id)}
                                        >
                                            Duyệt
                                        </Button>

                                        <Button
                                            variant="contained"
                                            size="small"
                                            sx={{
                                                backgroundColor: "#E53935",
                                                color: "#fff",
                                                textTransform: "none",
                                                borderRadius: 2,
                                                fontWeight: 600,
                                                px: 2.5,
                                                "&:hover": { backgroundColor: "#C62828" },
                                            }}
                                            onClick={() => handleReject(cert._id)}
                                        >
                                            Từ chối
                                        </Button>

                                        <Button
                                            variant="contained"
                                            size="small"
                                            sx={{
                                                backgroundColor: "#1E88E5",
                                                color: "#fff",
                                                textTransform: "none",
                                                borderRadius: 2,
                                                fontWeight: 600,
                                                px: 2.5,
                                                "&:hover": { backgroundColor: "#1565C0" },
                                            }}
                                            onClick={() => handleView(cert)}
                                        >
                                            Xem chi tiết
                                        </Button>
                                    </Stack>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Paper>

            <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
                <Pagination
                    count={Math.ceil(certificates.length / rowsPerPage)}
                    page={page}
                    onChange={handleChangePage}
                    color="primary"
                />
            </Box>

            {/* Dialog chi tiết */}
            {/* Dialog chi tiết */}
            <Dialog open={openDialog} onClose={handleClose} maxWidth="md" fullWidth>
                <DialogTitle sx={{ fontWeight: "bold", fontSize: "1.25rem" }}>
                    Thông tin chi tiết chứng chỉ
                </DialogTitle>
                <DialogContent dividers>
                    {selectedCert && (
                        <Box>
                            <Typography><b>Người nộp:</b> {selectedCert.user?.fullname}</Typography>
                            <Typography><b>Email:</b> {selectedCert.user?.email}</Typography>
                            <Typography sx={{ mb: 1 }}>
                                <b>Trạng thái:</b> {renderStatusChip(selectedCert.status)}
                            </Typography>
                            <Typography sx={{ mb: 2 }}>
                                <b>Thời gian nộp:</b>{" "}
                                {new Date(selectedCert.createdAt).toLocaleString("vi-VN")}
                            </Typography>

                            <Divider sx={{ my: 2 }} />

                            <Box textAlign="center">
                                {imageUrls[selectedCert._id] && (
                                    <CardMedia
                                        component="img"
                                        image={imageUrls[selectedCert._id]}
                                        alt="certificate"
                                        sx={{
                                            width: "100%",
                                            maxWidth: 600,
                                            borderRadius: 3,
                                            mx: "auto",
                                            boxShadow: 4,
                                        }}
                                    />
                                )}
                            </Box>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} variant="contained" sx={{ textTransform: "none" }}>
                        Đóng
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default ExpertCertificateList;
