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
} from "@mui/material";
import {
    listExpertCertificates,
    updateExpertCertificateStatus,
} from "../../services/ExpertCertificateService"; // <-- chỉnh lại path cho đúng

const ExpertCertificateList = () => {
    const [certificates, setCertificates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCert, setSelectedCert] = useState(null);
    const [openDialog, setOpenDialog] = useState(false);

    const fetchCertificates = async () => {
        try {
            setLoading(true);
            const res = await listExpertCertificates();
            setCertificates(res);
        } catch (err) {
            console.error("Lỗi khi lấy danh sách chứng chỉ:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCertificates();
    }, []);

    const handleApprove = async (id) => {
        try {
            await updateExpertCertificateStatus(id, { status: "Approved" });
            await fetchCertificates(); // reload danh sách sau khi cập nhật
        } catch (err) {
            console.error("Lỗi khi duyệt chứng chỉ:", err);
        }
    };

    const handleReject = async (id) => {
        try {
            await updateExpertCertificateStatus(id, { status: "Rejected" });
            await fetchCertificates();
        } catch (err) {
            console.error("Lỗi khi từ chối chứng chỉ:", err);
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
                return <Chip label="Đã duyệt" color="success" />;
            case "Rejected":
                return <Chip label="Từ chối" color="error" />;
            default:
                return <Chip label="Đang chờ duyệt" color="warning" />;
        }
    };

    if (loading)
        return (
            <Box sx={{ textAlign: "center", mt: 5 }}>
                <CircularProgress />
            </Box>
        );

    return (
        <Box sx={{ p: 4 }}>
            <Typography variant="h5" fontWeight="bold" color="primary" gutterBottom>
                Danh sách chứng chỉ chuyên gia
            </Typography>

            <Paper sx={{ overflowX: "auto", borderRadius: 3, boxShadow: 3 }}>
                <Table>
                    <TableHead sx={{ backgroundColor: "#f5f5f5" }}>
                        <TableRow>
                            <TableCell align="center">
                                <b>STT</b>
                            </TableCell>
                            <TableCell align="center">
                                <b>Người nộp</b>
                            </TableCell>
                            <TableCell align="center">
                                <b>Ảnh chứng chỉ</b>
                            </TableCell>
                            <TableCell align="center">
                                <b>Trạng thái</b>
                            </TableCell>
                            <TableCell align="center">
                                <b>Thao tác</b>
                            </TableCell>
                        </TableRow>
                    </TableHead>

                    <TableBody>
                        {certificates.map((cert, index) => (
                            <TableRow key={cert._id} hover>
                                <TableCell align="center">{index + 1}</TableCell>
                                <TableCell align="center">{cert.user?.fullname}</TableCell>
                                <TableCell align="center">
                                    <CardMedia
                                        component="img"
                                        image={`${import.meta.env.VITE_MEDIA_URL}/${cert.certificateURLKey}`}
                                        alt="certificate"
                                        sx={{
                                            width: 100,
                                            height: 100,
                                            borderRadius: 2,
                                            objectFit: "cover",
                                            mx: "auto",
                                        }}
                                    />
                                </TableCell>
                                <TableCell align="center">
                                    {renderStatusChip(cert.status)}
                                </TableCell>
                                <TableCell align="center">
                                    <Stack
                                        direction="row"
                                        spacing={1}
                                        justifyContent="center"
                                        alignItems="center"
                                    >
                                        <Button
                                            variant="outlined"
                                            color="success"
                                            size="small"
                                            onClick={() => handleApprove(cert._id)}
                                        >
                                            Duyệt
                                        </Button>
                                        <Button
                                            variant="outlined"
                                            color="error"
                                            size="small"
                                            onClick={() => handleReject(cert._id)}
                                        >
                                            Từ chối
                                        </Button>
                                        <Button
                                            variant="contained"
                                            color="primary"
                                            size="small"
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

            {/* Dialog xem chi tiết */}
            <Dialog open={openDialog} onClose={handleClose} maxWidth="sm" fullWidth>
                <DialogTitle>Chi tiết chứng chỉ</DialogTitle>
                <DialogContent dividers>
                    {selectedCert && (
                        <Box>
                            <Typography>
                                <b>Người nộp:</b> {selectedCert.user?.fullname}
                            </Typography>
                            <Typography>
                                <b>Email:</b> {selectedCert.user?.email}
                            </Typography>
                            <Typography>
                                <b>Trạng thái:</b>{" "}
                                {renderStatusChip(selectedCert.status || "Pending")}
                            </Typography>
                            <Box mt={2} textAlign="center">
                                <CardMedia
                                    component="img"
                                    image={`${import.meta.env.VITE_MEDIA_URL}/${selectedCert.certificateURLKey}`}
                                    alt="certificate"
                                    sx={{
                                        width: 250,
                                        borderRadius: 3,
                                        mx: "auto",
                                        boxShadow: 3,
                                    }}
                                />
                            </Box>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>Đóng</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default ExpertCertificateList;
