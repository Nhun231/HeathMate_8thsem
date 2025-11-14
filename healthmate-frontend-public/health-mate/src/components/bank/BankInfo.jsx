import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  FormHelperText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import {
  listBankInfo,
  createBankInfo,
  updateBankInfo,
  deleteBankInfo,
} from "../../services/BankInfoService.js";
import CustomAlert from "../../components/common/Alert.jsx";

const BANKS = [
  { name: "Vietcombank" },
  { name: "BIDV" },
  { name: "Agribank" },
  { name: "LPBank" },
  { name: "Techcombank" },
  { name: "Sacombank" },
  { name: "ACB" },
  { name: "MB Bank" },
  { name: "VPBank" },
  { name: "TPBank" },
  { name: "VietinBank" },
  { name: "OceanBank" },
  { name: "Eximbank" },
  { name: "SeABank" },
  { name: "SHB" },
  { name: "NCB" },
  { name: "SCB" },
];

const BankInfo = () => {
  const [bankInfo, setBankInfo] = useState(null);
  const [formData, setFormData] = useState({
    bankName: "",
    accountNumber: "",
    accountHolderName: "",
    branch: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState({
    show: false,
    message: "",
    severity: "info",
  });
  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        const res = await listBankInfo(token);
        setBankInfo(res || null);
        if (res) {
          setFormData({
            bankName: res.bankName || "",
            accountNumber: res.accountNumber || "",
            accountHolderName: res.accountHolderName || "",
            branch: res.branch || "",
          });
        }
      } catch (err) {
        setAlert({
          show: true,
          message: err.message || "Không thể tải dữ liệu tài khoản",
          severity: "error",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: validateField(name, value) }));
  };

  const validateField = (name, value) => {
    if (!value && name !== "branch") return "Trường này là bắt buộc";

    if (name === "bankName" && value && value.length < 3)
      return "Tên ngân hàng phải từ 3 ký tự trở lên";

    if (
      name === "accountNumber" &&
      value &&
      (value.length < 8 || value.length > 15)
    )
      return "Số tài khoản phải từ 8 đến 15 ký tự";

    if (name === "accountHolderName" && value) {
      if (value.length < 5 || value.length > 64)
        return "Tên chủ tài khoản phải từ 5 đến 64 ký tự";
      if (!/^[a-zA-Z\s]+$/.test(value))
        return "Tên chủ tài khoản chỉ được chứa chữ và khoảng trắng";
    }

    return "";
  };

  const validateAll = (data) => {
    const newErrors = {};
    Object.keys(data).forEach((key) => {
      const error = validateField(key, data[key]);
      if (error) newErrors[key] = error;
    });
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const allErrors = validateAll(formData);
    setErrors(allErrors);
    if (Object.keys(allErrors).length > 0) return;

    try {
      const token = localStorage.getItem("accessToken");
      if (!bankInfo) {
        await createBankInfo(formData, token);
        setAlert({
          show: true,
          message: "Thêm thông tin ngân hàng thành công!",
          severity: "success",
        });
      } else {
        await updateBankInfo(bankInfo._id, formData, token);
        setAlert({
          show: true,
          message: "Cập nhật thông tin ngân hàng thành công!",
          severity: "success",
        });
      }
      const res = await listBankInfo(token);
      setBankInfo(res || null);
    } catch (err) {
      setAlert({
        show: true,
        message: err.message || "Có lỗi khi lưu tài khoản",
        severity: "error",
      });
    }
  };

  const handleDelete = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      await deleteBankInfo(bankInfo._id, token);
      setAlert({
        show: true,
        message: "Xóa tài khoản ngân hàng thành công!",
        severity: "success",
      });
      setBankInfo(null);
      setFormData({
        bankName: "",
        accountNumber: "",
        accountHolderName: "",
        branch: "",
      });
    } catch (err) {
      setAlert({
        show: true,
        message: err.message || "Có lỗi khi xóa tài khoản",
        severity: "error",
      });
    } finally {
      setConfirmOpen(false);
    }
  };

  if (loading) return <Typography>Đang tải...</Typography>;

  return (
    <Box sx={{ maxWidth: 600, mx: "auto", mt: 5, mb: 5 }}>
      {alert.show && (
        <CustomAlert
          message={alert.message}
          variant={alert.severity}
          onClose={() => setAlert({ ...alert, show: false })}
        />
      )}

      <Box
        sx={{ p: 3, borderRadius: 3, boxShadow: 3, backgroundColor: "#fff" }}
      >
        <Typography
          variant="h5"
          fontWeight="bold"
          color="#2E7D32"
          mb={3}
          textAlign="center"
        >
          {!bankInfo ? "Thêm tài khoản mới" : "Cập nhật tài khoản"}
        </Typography>

        <form onSubmit={handleSubmit} style={{ display: "grid", gap: 16 }}>
          <FormControl fullWidth variant="outlined" error={!!errors.bankName}>
            <InputLabel id="bank-label">Ngân hàng *</InputLabel>
            <Select
              labelId="bank-label"
              value={formData.bankName || ""}
              name="bankName"
              onChange={handleChange}
              label="Ngân hàng *"
            >
              <MenuItem value="" disabled>
                Chọn ngân hàng
              </MenuItem>
              {BANKS.map((bank) => (
                <MenuItem key={bank.name} value={bank.name}>
                  {bank.name}
                </MenuItem>
              ))}
            </Select>
            {errors.bankName && (
              <FormHelperText>{errors.bankName}</FormHelperText>
            )}
          </FormControl>

          <TextField
            label="Số tài khoản *"
            name="accountNumber"
            value={formData.accountNumber}
            onChange={handleChange}
            error={!!errors.accountNumber}
            helperText={errors.accountNumber}
            fullWidth
          />

          <TextField
            label="Tên chủ tài khoản *"
            name="accountHolderName"
            value={formData.accountHolderName}
            onChange={handleChange}
            error={!!errors.accountHolderName}
            helperText={errors.accountHolderName}
            fullWidth
          />

          <TextField
            label="Chi nhánh (tùy chọn)"
            name="branch"
            value={formData.branch}
            onChange={handleChange}
            fullWidth
          />

          <Box
            display="flex"
            justifyContent={bankInfo ? "space-between" : "center"}
            gap={2}
          >
            <Button
              type="submit"
              variant="contained"
              sx={{
                backgroundColor: "#4CAF50",
                "&:hover": { backgroundColor: "#2E7D32" },
                minWidth: 180,
              }}
            >
              {!bankInfo ? "Thêm tài khoản" : "Cập nhật tài khoản"}
            </Button>

            {bankInfo && (
              <Button
                variant="outlined"
                color="error"
                onClick={() => setConfirmOpen(true)}
                sx={{ minWidth: 180 }}
              >
                Xóa thông tin
              </Button>
            )}
          </Box>
        </form>
      </Box>

      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>Xác nhận xóa</DialogTitle>
        <DialogContent>
          <Typography>
            Bạn có chắc muốn xóa thông tin ngân hàng không?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)}>Hủy</Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            Xóa
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BankInfo;
