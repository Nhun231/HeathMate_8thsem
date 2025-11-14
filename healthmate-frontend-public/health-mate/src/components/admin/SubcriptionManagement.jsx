import React, { useEffect, useState } from "react";
import {
    Box,
    Typography,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Stack,
    Chip,
    IconButton,
} from "@mui/material";
import { Add, Edit } from "@mui/icons-material";
import {
    listSubscriptions,
    createSubscription,
    updateSubscription,
} from "../../services/SubscriptionService";
import CustomAlert from "../common/Alert";

export default function ManageSubscription() {
    const [subscriptions, setSubscriptions] = useState([]);
    const [open, setOpen] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [selectedSub, setSelectedSub] = useState(null);
    const [form, setForm] = useState({
        name: "",
        type: "",
        duration: "",
        price: "",
    });

    const [alertInfo, setAlertInfo] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const data = await listSubscriptions();
            setSubscriptions(data.data || data);
        } catch (err) {
            console.error("Lỗi khi tải danh sách gói:", err);
            setAlertInfo({
                message: "Không thể tải danh sách gói!",
                variant: "error",
            });
        }
    };

    const handleOpen = (sub = null) => {
        if (sub) {
            setEditMode(true);
            setSelectedSub(sub);
            setForm({
                name: sub.name || "",
                type: sub.type || "",
                duration: sub.duration || sub.durationDays || "",
                price: sub.price || "",
            });
        } else {
            setEditMode(false);
            setForm({
                name: "",
                type: "",
                duration: "",
                price: "",
            });
        }
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        setSelectedSub(null);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm({
            ...form,
            [name]:
                name === "duration" || name === "price"
                    ? Number(value)
                    : value,
        });
    };

    const handleSubmit = async () => {
        try {
            if (editMode && selectedSub) {
                await updateSubscription(selectedSub._id, form);
                setAlertInfo({
                    message: "Cập nhật gói thành công!",
                    variant: "success",
                });
            } else {
                await createSubscription(form);
                setAlertInfo({
                    message: "Thêm gói mới thành công!",
                    variant: "success",
                });
            }
            await fetchData();
            handleClose();
        } catch (err) {
            console.error("Lỗi khi lưu gói:", err);
            setAlertInfo({
                message: "Lưu gói thất bại!",
                variant: "error",
            });
        }
    };

    const renderTypeLabel = (type) => {
        switch (type) {
            case "ADVANCED":
                return "Gói có sẵn";
            case "INDEPTH":
                return "Gói chuyên sâu";
            default:
                return "Không xác định";
        }
    };

    return (
        <Box sx={{ p: 4 }}>
            {alertInfo && (
                <CustomAlert
                    message={alertInfo.message}
                    variant={alertInfo.variant}
                    onClose={() => setAlertInfo(null)}
                    sticky
                    autoCloseDelay={2500}
                />
            )}

            <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
            >
                <Typography variant="h5" fontWeight="bold">
                    Quản lý các gói khuyến mãi
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={() => handleOpen()}
                >
                    Thêm gói mới
                </Button>
            </Stack>

            <TableContainer component={Paper} sx={{ mt: 3 }}>
                <Table>
                    <TableHead>
                        <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                            <TableCell>Tên gói</TableCell>
                            <TableCell>Loại</TableCell>
                            <TableCell>Thời hạn (ngày)</TableCell>
                            <TableCell>Giá (VNĐ)</TableCell>
                            <TableCell>Hành động</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {subscriptions.map((sub) => (
                            <TableRow key={sub._id}>
                                <TableCell>{sub.name}</TableCell>
                                <TableCell>
                                    <Chip
                                        label={renderTypeLabel(sub.type.name)}
                                        color={
                                            sub.type.name === "ADVANCED"
                                                ? "success"
                                                : "primary"
                                        }
                                    />
                                </TableCell>
                                {/*Hiển thị duration đúng cho cả dữ liệu cũ và mới */}
                                <TableCell>{sub.duration || sub.durationDays}</TableCell>
                                <TableCell>
                                    {sub.price?.toLocaleString()} đ
                                </TableCell>
                                <TableCell>
                                    <IconButton
                                        color="primary"
                                        onClick={() => handleOpen(sub)}
                                    >
                                        <Edit />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                        {subscriptions.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={6} align="center">
                                    Chưa có gói khuyến mãi nào.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Dialog Form */}
            <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
                <DialogTitle>
                    {editMode
                        ? "Cập nhật gói khuyến mãi"
                        : "Thêm gói khuyến mãi mới"}
                </DialogTitle>
                <DialogContent>
                    <Stack spacing={2} sx={{ mt: 1 }}>
                        <TextField
                            label="Tên gói"
                            name="name"
                            value={form.name}
                            onChange={handleChange}
                            fullWidth
                        />
                        <TextField
                            select
                            label="Loại"
                            name="type"
                            value={form.type}
                            onChange={handleChange}
                            fullWidth
                            SelectProps={{ native: true }}
                        >
                            <option value="">-- Chọn loại gói --</option>
                            <option value="ADVANCED">Gói có sẵn</option>
                            <option value="INDEPTH">Gói chuyên sâu</option>
                        </TextField>
                        <TextField
                            label="Thời hạn (ngày)"
                            name="duration"
                            value={form.duration}
                            onChange={handleChange}
                            fullWidth
                            type="number"
                        />
                        <TextField
                            label="Giá (VNĐ)"
                            name="price"
                            value={form.price}
                            onChange={handleChange}
                            fullWidth
                            type="number"
                        />
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>Hủy</Button>
                    <Button variant="contained" onClick={handleSubmit}>
                        {editMode ? "Cập nhật" : "Thêm mới"}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
