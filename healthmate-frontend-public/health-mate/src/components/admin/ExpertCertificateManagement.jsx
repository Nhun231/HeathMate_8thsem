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
    TextField,
    MenuItem,
    Grid,
} from "@mui/material";
import {
    listExpertCertificates,
    updateExpertCertificateStatus,
} from "../../services/ExpertCertificateService";
import { updateUser } from "../../services/AdminService";
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
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState("All");

    const rowsPerPage = 10;

    // Lấy tất cả chứng chỉ
    const fetchCertificates = async () => {
        try {
            setLoading(true);
            const res = await listExpertCertificates({ 
                page: 1, 
                limit: 1000,
                sort: '-updatedAt' // Sort by latest first (descending order)
            });
            const data = res?.data || [];
            setCertificates(data);

            // Lấy presigned URL cho tất cả ảnh chứng chỉ
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

    // Phê duyệt chứng chỉ
    const handleApprove = async (id) => {
        try {
            await updateExpertCertificateStatus(id, { status: "Approved" });
            const cert = certificates.find((c) => c._id === id);
            const userId = cert?.user?._id;
            if (userId) await updateUser(userId, { status: "Active" });

            // Cập nhật tại chỗ để ẩn nút
            setCertificates((prev) =>
                prev.map((c) =>
                    c._id === id ? { ...c, status: "Approved" } : c
                )
            );

            showAlert("Phê duyệt chứng chỉ và kích hoạt người dùng thành công", "success");
        } catch (err) {
            console.error("Lỗi khi phê duyệt:", err);
            showAlert("Có lỗi xảy ra khi phê duyệt", "error");
        }
    };

    // Từ chối chứng chỉ
    const handleReject = async (id) => {
        try {
            await updateExpertCertificateStatus(id, { status: "Rejected" });
            const cert = certificates.find((c) => c._id === id);
            const userId = cert?.user?._id;
            if (userId) await updateUser(userId, { status: "Inactive" });

            setCertificates((prev) =>
                prev.map((c) =>
                    c._id === id ? { ...c, status: "Rejected" } : c
                )
            );

            showAlert("Từ chối chứng chỉ và vô hiệu hóa người dùng thành công", "warning");
        } catch (err) {
            console.error("Lỗi khi từ chối:", err);
            showAlert("Có lỗi xảy ra khi từ chối", "error");
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

    // Lọc và tìm kiếm
    const filteredCertificates = certificates.filter((cert) => {
        const matchName = cert.user?.fullname
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase());
        const matchStatus =
            filterStatus === "All" || cert.status === filterStatus;
        return matchName && matchStatus;
    });

    const paginatedData = filteredCertificates.slice(
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
                        QUẢN LÝ CHỨNG CHỈ CHUYÊN GIA
                    </Typography>
                    <Typography variant="subtitle1" color="text.secondary">
                        Danh sách chứng chỉ đang chờ phê duyệt hoặc đã xử lý
                    </Typography>
                </Box>

                {/* Bên phải: tìm kiếm + lọc */}
                <Box display="flex" alignItems="center" gap={2} flexWrap="wrap">
                    <TextField
                        label="Tìm kiếm theo tên"
                        variant="outlined"
                        size="small"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        sx={{ minWidth: 250 }}
                    />
                    <TextField
                        select
                        label="Lọc theo trạng thái"
                        size="small"
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        sx={{ minWidth: 180 }}
                    >
                        <MenuItem value="All">Tất cả</MenuItem>
                        <MenuItem value="Approved">Đã duyệt</MenuItem>
                        <MenuItem value="Rejected">Từ chối</MenuItem>
                        <MenuItem value="Pending">Chờ duyệt</MenuItem>
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

                                <TableCell align="center">
                                    <Typography fontWeight="bold">{cert.user?.fullname}</Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        {new Date(cert.createdAt).toLocaleString("vi-VN")}
                                    </Typography>
                                </TableCell>

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
                                        {/* Ẩn nút nếu đã xử lý */}
                                        {cert.status === "Pending" && (
                                            <>
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
                                            </>
                                        )}

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
                    count={Math.ceil(filteredCertificates.length / rowsPerPage)}
                    page={page}
                    onChange={handleChangePage}
                    color="primary"
                />
            </Box>

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
                                <b>Thời gian nộp:</b> {new Date(selectedCert.createdAt).toLocaleString("vi-VN")}
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
