import { useEffect, useState } from "react";
import "../../style/themeStyle.css";
import { getAllPayments, getPaymentById } from "../../services/PaymentService";
import {
  ReceiptLong as ReceiptLongIcon,
  Search as SearchIcon,
  FilterAltOffOutlined as FilterAltOffOutlinedIcon,
  Payment as PaymentIcon,
  AccountBalance as AccountBalanceIcon,
  CalendarMonth as CalendarMonthIcon,
  InfoOutlined as InfoOutlinedIcon,
} from "@mui/icons-material";
import {
  Box,
  Typography,
  TextField,
  Button,
  CircularProgress,
  InputAdornment,
  Pagination,
  MenuItem,
  Dialog,
  DialogContent,
  DialogActions,
  IconButton,
  Tooltip,
  FormControl,
  Select,
} from "@mui/material";
import CustomAlert from "../common/Alert";

const PaymentManagement = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalPayments, setTotalPayments] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchField, setSearchField] = useState("transactionContent");
  const [searching, setSearching] = useState(false);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [alertInfo, setAlertInfo] = useState(null);

  // Fetch payments with filters
  const fetchPayments = async (
    pageNum = 1,
    search = "",
    newLimit = limit,
    field = "transactionContent",
    dateFromParam = dateFrom,
    dateToParam = dateTo
  ) => {
    setLoading(true);
    try {
      const filters = {};
      if (search) filters[field] = search;
      if (dateFromParam) filters.dateFrom = dateFromParam;
      if (dateToParam) filters.dateTo = dateToParam;

      const res = await getAllPayments(pageNum, newLimit, filters);
      const list = Array.isArray(res?.items) ? res.items : [];
      setPayments(list);
      setTotalPayments(res?.total || list.length);
      setTotalPages(res?.totalPages || 1);
    } catch (err) {
      console.error(err);
      setError("Không thể tải danh sách giao dịch!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments(page);
  }, [page]);

  const handleOpenDetail = async (payment) => {
    try {
      const data = await getPaymentById(payment._id);
      setSelectedPayment(data);
      setDetailOpen(true);
    } catch (err) {
      console.error(err);
      setAlertInfo({
        message: "Không thể tải chi tiết giao dịch!",
        variant: "error",
      });
    }
  };

  const handleCloseDetail = () => {
    setDetailOpen(false);
    setSelectedPayment(null);
  };

  const today = new Date().toISOString().split("T")[0];

  if (loading)
    return (
      <Box display="flex" justifyContent="center" alignItems="center" py={10}>
        <CircularProgress color="success" />
      </Box>
    );

  if (error)
    return (
      <Box p={4}>
        <Typography color="error" fontWeight={600}>
          {error}
        </Typography>
      </Box>
    );

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
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="flex-start"
        mb={4}
      >
        <Box>
          <Typography variant="h4" fontWeight={700} color="#2E7D32" mb={2}>
            Quản lý giao dịch
          </Typography>

          <Box display="flex" alignItems="center" gap={2} flexWrap="wrap">
            <FormControl size="small" sx={{ minWidth: 200 }}>
              <Select
                value={searchField}
                onChange={(e) => {
                  setSearchField(e.target.value);
                  setSearchTerm("");
                }}
                sx={{
                  backgroundColor: "#fff",
                  borderRadius: "8px",
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#A5D6A7",
                  },
                  "&:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#43A047",
                  },
                }}
              >
                <MenuItem value="transactionContent">
                  Nội dung giao dịch
                </MenuItem>
                <MenuItem value="gateway">Ngân hàng</MenuItem>
                <MenuItem value="accountNumber">Số tài khoản</MenuItem>
              </Select>
            </FormControl>

            <TextField
              placeholder={`Tìm theo ${
                searchField === "transactionContent"
                  ? "nội dung giao dịch"
                  : searchField === "gateway"
                  ? "ngân hàng"
                  : "số tài khoản"
              }`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              size="small"
              sx={{
                width: 250,
                backgroundColor: "#fff",
                borderRadius: "8px",
                "& .MuiOutlinedInput-root": { borderRadius: "8px" },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              label="Từ ngày"
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              size="small"
              sx={{ backgroundColor: "#fff", borderRadius: "8px" }}
              InputLabelProps={{ shrink: true }}
              inputProps={{ max: today }}
            />
            <TextField
              label="Đến ngày"
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              size="small"
              sx={{ backgroundColor: "#fff", borderRadius: "8px" }}
              InputLabelProps={{ shrink: true }}
              inputProps={{ max: today }}
            />

            <Button
              variant="contained"
              sx={{
                backgroundColor: "#43A047",
                color: "#fff",
                px: 4,
                borderRadius: "8px",
                "&:hover": { backgroundColor: "#2E7D32" },
              }}
              onClick={() => {
                setSearching(true);
                fetchPayments(1, searchTerm, limit, searchField).finally(() =>
                  setSearching(false)
                );
              }}
            >
              {searching ? "Đang tìm..." : "Tìm kiếm"}
            </Button>

            <Button
              variant="outlined"
              startIcon={<FilterAltOffOutlinedIcon />}
              onClick={() => {
                setSearchTerm("");
                setDateFrom("");
                setDateTo("");
                fetchPayments(1, "", limit, searchField, "", ""); 
              }}
            >
              Xóa bộ lọc
            </Button>
          </Box>
        </Box>
      </Box>

      <Box display="flex" flexDirection="column" gap={2}>
        {payments.map((p) => (
          <Box
            key={p._id}
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            p={3}
            sx={{
              borderRadius: 3,
              background: "#F1F8E9",
              border: "1px solid #C8E6C9",
              boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
              transition: "all 0.3s ease",
              "&:hover": {
                transform: "translateY(-3px)",
                boxShadow: "0 6px 16px rgba(0,0,0,0.1)",
                background: "#E8F5E9",
              },
            }}
          >
            <Box display="flex" alignItems="center" gap={4}>
              <ReceiptLongIcon
                sx={{
                  fontSize: 60,
                  color: "#388E3C",
                  backgroundColor: "#fff",
                  borderRadius: "50%",
                  p: 1.5,
                  boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
                }}
              />
              <Box>
                <Typography fontWeight={700} fontSize="1.1rem" color="#1B5E20">
                  {p.gateway} — {p.amountIn.toLocaleString()} VND
                </Typography>
                <Typography variant="body2" color="#424242">
                  <PaymentIcon
                    sx={{ fontSize: 16, mr: 0.5, color: "#616161" }}
                  />
                  Nội dung: {p.transactionContent || "--"}
                </Typography>
                <Typography variant="body2" color="#424242">
                  <AccountBalanceIcon
                    sx={{ fontSize: 16, mr: 0.5, color: "#616161" }}
                  />
                  Số tài khoản: {p.accountNumber}
                </Typography>
                <Typography variant="body2" color="#424242">
                  <CalendarMonthIcon
                    sx={{ fontSize: 16, mr: 0.5, color: "#616161" }}
                  />
                  Ngày giao dịch:{" "}
                  {new Date(p.transactionDate).toLocaleString("vi-VN")}
                </Typography>
              </Box>
            </Box>

            <Tooltip title="Xem chi tiết" arrow>
              <IconButton
                sx={{
                  color: "#1E88E5",
                  backgroundColor: "#E3F2FD",
                  "&:hover": { backgroundColor: "#BBDEFB" },
                }}
                onClick={() => handleOpenDetail(p)}
              >
                <InfoOutlinedIcon />
              </IconButton>
            </Tooltip>
          </Box>
        ))}
      </Box>

      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mt={3}
        flexWrap="wrap"
      >
        <Typography color="text.secondary" sx={{ fontSize: 14 }}>
          Hiển thị {(page - 1) * limit + 1} -{" "}
          {Math.min(page * limit, totalPayments)} trong tổng số {totalPayments}{" "}
          giao dịch
        </Typography>
        <Box display="flex" alignItems="center" gap={1}>
          <Typography color="#2E7D32" fontWeight={500} fontSize={14}>
            Hiển thị:
          </Typography>
          <FormControl size="small">
            <Select
              value={limit}
              onChange={(e) => {
                const newLimit = e.target.value;
                setLimit(newLimit);
                fetchPayments(1, searchTerm, newLimit, searchField);
              }}
              sx={{
                height: 35,
                color: "#2E7D32",
                borderRadius: "8px",
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#A5D6A7",
                },
                "&:hover .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#2E7D32",
                },
              }}
            >
              {[5, 10, 20, 50].map((num) => (
                <MenuItem key={num} value={num}>
                  {num}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
        <Pagination
          count={totalPages}
          page={page}
          onChange={(event, value) => setPage(value)}
          color="success"
          sx={{
            "& .MuiPaginationItem-root": { color: "#2E7D32" },
            "& .Mui-selected": {
              backgroundColor: "#43A047 !important",
              color: "#fff !important",
            },
          }}
        />
      </Box>

      <Dialog
        open={detailOpen}
        onClose={handleCloseDetail}
        maxWidth="sm"
        fullWidth
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            px: 3,
            py: 2,
            background: "linear-gradient(90deg, #43A047, #66BB6A)",
            color: "#fff",
          }}
        >
          <ReceiptLongIcon />
          <Typography variant="h6" fontWeight={700}>
            Chi tiết giao dịch
          </Typography>
        </Box>
        <DialogContent dividers sx={{ p: 3 }}>
          {selectedPayment ? (
            <Box display="flex" flexDirection="column" gap={1.5}>
              <Typography>
                <b>Ngân hàng:</b> {selectedPayment.gateway}
              </Typography>
              <Typography>
                <b>Tài khoản:</b> {selectedPayment.accountNumber}
              </Typography>
              <Typography>
                <b>Số tiền nạp:</b> {selectedPayment.amountIn.toLocaleString()}{" "}
                VND
              </Typography>
              <Typography>
                <b>Nội dung:</b> {selectedPayment.transactionContent}
              </Typography>
              <Typography>
                <b>Mã giao dịch:</b> {selectedPayment.referenceNumber || "--"}
              </Typography>
              <Typography>
                <b>Ngày giao dịch:</b>{" "}
                {new Date(selectedPayment.transactionDate).toLocaleString(
                  "vi-VN"
                )}
              </Typography>
              <Typography>
                <b>Mô tả:</b> {selectedPayment.description || "--"}
              </Typography>
            </Box>
          ) : (
            <Typography>Đang tải thông tin...</Typography>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={handleCloseDetail} sx={{ color: "#9e9e9e" }}>
            Đóng
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PaymentManagement;
