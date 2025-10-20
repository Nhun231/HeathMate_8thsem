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
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    CardMedia,
    Chip,
    Divider,
    Grid,
    ButtonGroup,
    Tooltip,
    Pagination,
} from "@mui/material";
import {
    listExpertCertificates,
    getUserExpertCertificate,
    updateExpertCertificateStatus,
} from "../../services/ExpertCertificateService";
import { getPresignedViewUrl } from "../../services/MediaService";

const ExpertCertificateManagement = () => {
    const [certificates, setCertificates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState(null);
    const [open, setOpen] = useState(false);
    const [imageUrls, setImageUrls] = useState({});

    // Pagination states
    const [page, setPage] = useState(1);
    const rowsPerPage = 5;

    useEffect(() => {
        fetchCertificates();
    }, []);

    const fetchCertificates = async () => {
        try {
            setLoading(true);
            const res = await listExpertCertificates();
            const data = res?.data || [];

            const urls = {};
            await Promise.all(
                data.map(async (cert) => {
                    if (cert.certificateURLKey) {
                        try {
                            const presignedUrl = await getPresignedViewUrl(cert.certificateURLKey);
                            urls[cert._id] = presignedUrl;
                        } catch (err) {
                            console.error("Không tạo được presigned URL cho", cert._id, err);
                        }
                    }
                })
            );

            setImageUrls(urls);
            setCertificates(data);
        } catch (err) {
            console.error("Lỗi khi lấy danh sách chứng chỉ:", err);
            setCertificates([]);
        } finally {
            setLoading(false);
        }
    };

    const handleView = async (id) => {
        try {
            const detail = await getUserExpertCertificate(id);
            const cert = detail?.data || detail;
            if (cert?.certificateURLKey) {
                const presignedUrl = await getPresignedViewUrl(cert.certificateURLKey);
                cert.viewUrl = presignedUrl;
            }
            setSelected(cert);
            setOpen(true);
        } catch (err) {
            console.error("Lỗi khi lấy chi tiết chứng chỉ:", err);
        }
    };

    const handleAction = async (id, status) => {
        try {
            // Gửi đúng giá trị server mong đợi
            await updateExpertCertificateStatus(id, { status });
            await fetchCertificates();
            alert(`Chứng chỉ đã được ${status === "Approved" ? "duyệt" : "từ chối"}.`);
            setOpen(false);
        } catch (err) {
            console.error("Lỗi khi cập nhật trạng thái chứng chỉ:", err);
        }
    };

    const renderStatusChip = (status) => {
        switch (status) {
            case "Approved":
                return <Chip label="Đã duyệt" color="success" variant="filled" />;
            case "Rejected":
                return <Chip label="Từ chối" color="error" variant="filled" />;
            default:
                return <Chip label="Đang chờ duyệt" color="warning" variant="filled" />;
        }
    };

    const paginatedCertificates = certificates.slice(
        (page - 1) * rowsPerPage,
        page * rowsPerPage
    );

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    return (
        <Box sx={{ p: 4, backgroundColor: "#fafafa", minHeight: "100vh" }}>
            <Paper
                elevation={3}
                sx={{
                    p: 3,
                    borderRadius: 4,
                    maxWidth: 1200,
                    mx: "auto",
                    background: "#fff",
                }}
            >
                <Typography
                    variant="h4"
                    fontWeight="bold"
                    color="primary"
                    textAlign="center"
                    mb={1}
                >
                    Quản lý chứng chỉ chuyên gia
                </Typography>
                <Typography
                    variant="body1"
                    color="text.secondary"
                    textAlign="center"
                    mb={4}
                >
                    Xem hoặc duyệt chứng chỉ được gửi bởi các chuyên gia.
                </Typography>

                {loading ? (
                    <Box sx={{ textAlign: "center", mt: 5 }}>
                        <CircularProgress size={45} color="primary" />
                        <Typography mt={2} fontWeight={500}>
                            Đang tải dữ liệu...
                        </Typography>
                    </Box>
                ) : (
                    <>
                        <Paper
                            sx={{
                                borderRadius: 3,
                                overflow: "hidden",
                                boxShadow: 2,
                                border: "1px solid #e0e0e0",
                            }}
                        >
                            <Table>
                                <TableHead sx={{ bgcolor: "#f0f2f5" }}>
                                    <TableRow>
                                        <TableCell align="center"><strong>STT</strong></TableCell>
                                        <TableCell><strong>Người nộp</strong></TableCell>
                                        <TableCell align="center"><strong>Ảnh chứng chỉ</strong></TableCell>
                                        <TableCell align="center"><strong>Trạng thái</strong></TableCell>
                                        <TableCell align="center"><strong>Thao tác</strong></TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {paginatedCertificates.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                                                <Typography color="text.secondary">
                                                    Không có chứng chỉ nào được gửi.
                                                </Typography>
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        paginatedCertificates.map((c, index) => (
                                            <TableRow key={c._id} hover sx={{ "&:hover": { backgroundColor: "#fafafa" }, transition: "0.2s" }}>
                                                <TableCell align="center">{(page - 1) * rowsPerPage + index + 1}</TableCell>
                                                <TableCell>{c.user?.fullname || "Ẩn danh"}</TableCell>
                                                <TableCell align="center">
                                                    {imageUrls[c._id] ? (
                                                        <img
                                                            src={imageUrls[c._id]}
                                                            alt="certificate"
                                                            style={{
                                                                width: 80,
                                                                height: 80,
                                                                objectFit: "cover",
                                                                borderRadius: 10,
                                                                border: "1px solid #ccc",
                                                            }}
                                                        />
                                                    ) : (
                                                        <Typography color="text.secondary">Không có ảnh</Typography>
                                                    )}
                                                </TableCell>
                                                <TableCell align="center">{renderStatusChip(c.status)}</TableCell>
                                                <TableCell align="center">
                                                    <ButtonGroup variant="outlined" size="small">
                                                        <Tooltip title="Xem chi tiết">
                                                            <Button color="primary" onClick={() => handleView(c._id)}>Xem chi tiết</Button>
                                                        </Tooltip>
                                                    </ButtonGroup>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </Paper>

                        <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
                            <Pagination
                                count={Math.ceil(certificates.length / rowsPerPage)}
                                page={page}
                                onChange={handleChangePage}
                                color="primary"
                                shape="rounded"
                                size="medium"
                                showFirstButton
                                showLastButton
                            />
                        </Box>
                    </>
                )}
            </Paper>

            <Dialog
                open={open}
                onClose={() => setOpen(false)}
                maxWidth="md"
                fullWidth
                PaperProps={{ sx: { borderRadius: 3, overflow: "hidden" } }}
            >
                <DialogTitle sx={{ fontWeight: "bold", fontSize: 20, color: "primary.main", textAlign: "center", bgcolor: "#f8f9fb" }}>
                    Chi tiết chứng chỉ chuyên gia
                </DialogTitle>
                <DialogContent dividers sx={{ px: 4, py: 3 }}>
                    {selected ? (
                        <Box>
                            <Grid container spacing={3}>
                                <Grid item xs={12} md={6}>
                                    <Typography variant="body1" mb={1.5}><strong>👤 Họ tên:</strong> {selected.user?.fullname || "Không có"}</Typography>
                                    <Typography variant="body1" mb={1.5}><strong>📧 Email:</strong> {selected.user?.email || "Không có"}</Typography>
                                    <Typography variant="body1" mb={1.5}><strong>📅 Ngày nộp:</strong> {new Date(selected.createdAt).toLocaleDateString("vi-VN")}</Typography>
                                    <Typography variant="body1" mb={1.5}><strong>📌 Trạng thái:</strong> {renderStatusChip(selected.status)}</Typography>
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    {selected.viewUrl ? (
                                        <CardMedia component="img" image={selected.viewUrl} alt="Certificate" sx={{ borderRadius: 3, height: 280, objectFit: "contain", border: "1px solid #ddd" }} />
                                    ) : (
                                        <Typography color="text.secondary">Không có hình ảnh</Typography>
                                    )}
                                </Grid>
                            </Grid>

                            <Divider sx={{ my: 3 }} />
                            <Typography variant="body2" color="text.secondary" textAlign="center" fontStyle="italic">
                                Hãy xem xét kỹ thông tin trước khi phê duyệt hoặc từ chối.
                            </Typography>
                        </Box>
                    ) : (
                        <Box sx={{ textAlign: "center", py: 5 }}>
                            <CircularProgress />
                        </Box>
                    )}
                </DialogContent>
                <DialogActions sx={{ justifyContent: "center", py: 2, bgcolor: "#f8f9fb" }}>
                    <Button variant="contained" color="error" onClick={() => handleAction(selected._id, "Rejected")} sx={{ borderRadius: 2, px: 5, fontWeight: "bold" }}>
                        Từ chối
                    </Button>
                    <Button variant="contained" color="success" onClick={() => handleAction(selected._id, "Approved")} sx={{ borderRadius: 2, px: 5, fontWeight: "bold" }}>
                        Duyệt
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default ExpertCertificateManagement;
