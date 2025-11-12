import { useEffect, useState } from "react";
import "../../style/themeStyle.css";
import {
  getAllUsers,
  createUser,
  updateUser,
} from "../../services/AdminService";
import {
  Person as PersonIcon,
  EditOutlined as EditOutlinedIcon,
  Email as EmailIcon,
  Cake as CakeIcon,
  Wc as WcIcon,
  Visibility,
  VisibilityOff,
  Lock,
  LockOpen,
  Search as SearchIcon,
  Add as AddIcon,
  FilterAltOffOutlined as FilterAltOffOutlinedIcon,
} from "@mui/icons-material";
import {
  Box,
  Typography,
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  IconButton,
  Tooltip,
  CircularProgress,
  InputAdornment,
  Chip,
  Pagination,
  FormControl,
  Select,
} from "@mui/material";
import CustomAlert from "../common/Alert";
import { useContext } from "react";
import { AuthContext } from "../../context/AuthProvider";

const UserManagement = () => {
  // --- State chính ---
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- Pagination ---
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(5);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);

  // --- Search ---
  const [searchTerm, setSearchTerm] = useState("");
  const [searching, setSearching] = useState(false);

  // --- Edit user ---
  const [editOpen, setEditOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [saving, setSaving] = useState(false);
  const [showPasswordEdit, setShowPasswordEdit] = useState(false);

  // --- Add user ---
  const [addOpen, setAddOpen] = useState(false);
  const [newUser, setNewUser] = useState({
    fullname: "",
    email: "",
    gender: "",
    dob: "",
    role: "",
    password: "",
    phoneNumber: "",
  });
  const [adding, setAdding] = useState(false);
  const [showPasswordAdd, setShowPasswordAdd] = useState(false);

  // --- Alert ---
  const [alertInfo, setAlertInfo] = useState(null);

  // --- Validate ---
  const calculateAge = (dob) => {
    if (!dob) return "--";
    const birth = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return age;
  };

  const isValidDate = (dateStr) => {
    if (!dateStr) return true;
    const date = new Date(dateStr);
    const today = new Date();
    return !(isNaN(date.getTime()) || date > today);
  };

  const isValidPhone = (phone) => /^\d{9,12}$/.test(phone);

  // --- Fetch Users ---
  const fetchUsers = async (pageNum = 1, search = "", newLimit = limit) => {
    setLoading(true);
    try {
      const res = await getAllUsers(pageNum, newLimit, search ? { fullname: search } : {});
      const usersData = Array.isArray(res?.data)
        ? res.data.map((u) => ({
          ...u,
          role: u.roleId?.name || u.role || "Customer",
        }))
        : [];
      setUsers(usersData);
      setTotalUsers(res?.total || usersData.length);
      setTotalPages(res?.totalPages || 1);
    } catch (err) {
      console.error(err);
      setError("Không thể tải danh sách người dùng!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(page);
  }, [page]);

  const { user } = useContext(AuthContext);
  const currentUserId = user?._id;
  // --- Toggle Status ---
  const handleToggleStatus = async (targetUser) => {
    try {
      console.log("Kiểm tra ID:", { currentUserId, targetId: targetUser._id });

      // Chặn admin tự khóa chính mình
      if (currentUserId && currentUserId === targetUser._id) {
        setAlertInfo({
          message: "Bạn không thể vô hiệu hóa tài khoản của chính mình!",
          variant: "warning",
        });
        return;
      }

      const newStatus = targetUser.status === "Active" ? "Inactive" : "Active";

      if (
        !window.confirm(
          `Bạn có chắc muốn chuyển người dùng này sang trạng thái "${newStatus === "Active" ? "Hoạt động" : "Ngừng hoạt động"
          }"?`
        )
      )
        return;

      const res = await updateUser(targetUser._id, { status: newStatus });

      if (res?.statusCode === 422) {
        setAlertInfo({
          message: "Cập nhật trạng thái thất bại!",
          variant: "error",
        });
        return;
      }

      setUsers((prev) =>
        prev.map((u) =>
          u._id === targetUser._id ? { ...u, status: newStatus } : u
        )
      );

      setAlertInfo({
        message: "Cập nhật trạng thái thành công!",
        variant: "success",
      });
    } catch (err) {
      console.error("Lỗi khi cập nhật trạng thái:", err);
      setAlertInfo({
        message: "Cập nhật trạng thái thất bại!",
        variant: "error",
      });
    }
  };

  // --- Edit User ---
  const handleOpenEdit = (user) => {
    setSelectedUser({ ...user, password: "" });
    setEditOpen(true);
  };
  const handleCloseEdit = () => {
    setEditOpen(false);
    setSelectedUser(null);
    setShowPasswordEdit(false);
  };

  const handleSaveEdit = async () => {
    if (!selectedUser) return;
    const { fullname, email, role, password, phoneNumber, dob } = selectedUser;

    if (!fullname || !email || !role || !phoneNumber) {
      setAlertInfo({
        message: "Vui lòng điền đầy đủ thông tin bắt buộc!",
        variant: "warning",
      });
      return;
    }
    if (password && password.length < 6) {
      setAlertInfo({
        message: "Mật khẩu phải có ít nhất 6 ký tự!",
        variant: "warning",
      });
      return;
    }
    if (!isValidPhone(phoneNumber)) {
      setAlertInfo({
        message: "Số điện thoại không hợp lệ!",
        variant: "error",
      });
      return;
    }
    if (!isValidDate(dob)) {
      setAlertInfo({
        message: "Ngày sinh không hợp lệ!",
        variant: "error",
      });
      return;
    }

    setSaving(true);
    try {
      const payload = {
        fullname,
        email,
        role,
        gender: selectedUser.gender || undefined,
        dob: dob ? new Date(dob).toISOString().split("T")[0] : undefined,
        phoneNumber,
      };
      if (password) payload.password = password;

      await updateUser(selectedUser._id, payload);
      setUsers((prev) =>
        prev.map((u) => (u._id === selectedUser._id ? { ...u, ...payload } : u))
      );
      setAlertInfo({
        message: "Cập nhật thông tin người dùng thành công!",
        variant: "success",
      });
      handleCloseEdit();
    } catch (err) {
      console.error(err);
      setAlertInfo({
        message: "Cập nhật thất bại. Vui lòng thử lại!",
        variant: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  // --- Add User ---
  const handleOpenAdd = () => setAddOpen(true);
  const handleCloseAdd = () => {
    setAddOpen(false);
    setNewUser({
      fullname: "",
      email: "",
      gender: "",
      dob: "",
      role: "",
      password: "",
      phoneNumber: "",
    });
    setShowPasswordAdd(false);
  };

  const handleSaveAdd = async () => {
    const { fullname, email, role, password, gender, dob, phoneNumber } = newUser;
    if (!fullname || !email || !role || !password || !phoneNumber) {
      setAlertInfo({
        message: "Vui lòng điền đầy đủ thông tin bắt buộc!",
        variant: "warning",
      });
      return;
    }
    if (password.length < 6) {
      setAlertInfo({
        message: "Mật khẩu phải có ít nhất 6 ký tự!",
        variant: "warning",
      });
      return;
    }
    if (!isValidPhone(phoneNumber)) {
      setAlertInfo({
        message: "Số điện thoại không hợp lệ!",
        variant: "error",
      });
      return;
    }
    if (!isValidDate(dob)) {
      setAlertInfo({
        message: "Ngày sinh không hợp lệ!",
        variant: "error",
      });
      return;
    }

    setAdding(true);
    try {
      const payload = {
        fullname,
        email,
        password,
        role,
        phoneNumber,
        status: "Active",
        ...(gender && { gender }),
        ...(dob && { dob: new Date(dob).toISOString().split("T")[0] }),
      };
      await createUser(payload);
      setAlertInfo({
        message: "Thêm người dùng thành công!",
        variant: "success",
      });
      handleCloseAdd();
      fetchUsers(page);
    } catch (err) {
      console.error(err);
      setAlertInfo({
        message: "Thêm người dùng thất bại!",
        variant: "error",
      });
    } finally {
      setAdding(false);
    }
  };

  // --- Hiển thị loading / lỗi ---
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
          Lỗi: {error}
        </Typography>
      </Box>
    );

  return (
    <Box sx={{ p: 4 }}>
      {/* Hiển thị thông báo */}
      {alertInfo && (
        <CustomAlert
          message={alertInfo.message}
          variant={alertInfo.variant}
          onClose={() => setAlertInfo(null)}
          sticky
          autoCloseDelay={2500}
        />
      )}
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={4}>
        {/* Left section: Title + Search */}
        <Box>
          <Typography
            variant="h4"
            fontWeight={700}
            color="#2E7D32"
            mb={2}
          >
            Quản lý người dùng
          </Typography>

          {/* Search bar + buttons */}
          <Box display="flex" alignItems="center" gap={2}>
            <TextField
              placeholder="Tìm kiếm người dùng"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              size="small"
              sx={{
                width: 300,
                backgroundColor: "#fff",
                borderRadius: "8px",
                "& .MuiOutlinedInput-root": {
                  borderRadius: "8px",
                },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="action" />
                  </InputAdornment>
                ),
              }}
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
                fetchUsers(1, searchTerm).finally(() => setSearching(false));
              }}
            >
              {searching ? "Đang tìm..." : "Tìm kiếm"}
            </Button>

            <Button
              variant="outlined"
              sx={{
                color: "#43A047",
                borderColor: "#A5D6A7",
                px: 4,
                borderRadius: "8px",
                "&:hover": {
                  borderColor: "#43A047",
                  backgroundColor: "#E8F5E9",
                },
              }}
              onClick={() => {
                setSearchTerm("");
                fetchUsers(1, "");
              }}
              startIcon={<FilterAltOffOutlinedIcon />}
            >
              Xóa bộ lọc
            </Button>
          </Box>
        </Box>

        {/* Right section: Add user button */}
        <Button
          variant="contained"
          sx={{
            backgroundColor: "#43A047",
            color: "#fff",
            borderRadius: "8px",
            px: 4,
            py: 1.5,
            boxShadow: "0 3px 5px rgba(0,0,0,0.2)",
            "&:hover": { backgroundColor: "#2E7D32" },
          }}
          startIcon={<AddIcon />}
          onClick={handleOpenAdd}
        >
          Thêm người dùng
        </Button>
      </Box>


      {/* User list */}
      <Box display="flex" flexDirection="column" gap={2}>
        {users.map((user) => (
          <Box
            key={user._id}
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
            {/* Left section - User info */}
            <Box display="flex" justifyContent="flex-start" alignItems="center" gap={6} >
              <PersonIcon
                sx={{
                  fontSize: 70,
                  color: "#388E3C",
                  backgroundColor: "#fff",
                  borderRadius: "50%",
                  p: 1.5,
                  boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
                }}
              />
              <Box>
                <Typography fontWeight={700} fontSize="1.2rem" color="#1B5E20">
                  {user.fullname}
                </Typography>
                <Typography variant="body1" color="#424242" sx={{ mt: 0.3 }}>
                  <EmailIcon sx={{ fontSize: 18, mr: 0.5, color: "#616161" }} />
                  {user.email}
                </Typography>
                <Typography variant="body1" color="#424242" sx={{ mt: 0.3 }}>
                  <WcIcon sx={{ fontSize: 18, mr: 0.5, color: "#616161" }} />
                  {user.gender === "Male"
                    ? "Nam"
                    : user.gender === "Female"
                      ? "Nữ"
                      : "--"}
                </Typography>
                <Typography variant="body1" color="#424242" sx={{ mt: 0.3 }}>
                  <CakeIcon sx={{ fontSize: 18, mr: 0.5, color: "#616161" }} />
                  {user.dob ? `${calculateAge(user.dob)} tuổi` : "--"}
                </Typography>
                <Box mt={1.5} display="flex" gap={1.2} flexWrap="wrap">
                  <Chip
                    label={user.status === "Active" ? "Hoạt động" : "Ngừng hoạt động"}
                    color={user.status === "Active" ? "success" : "error"}
                    size="medium"
                    sx={{ fontWeight: 600 }}
                  />
                  <Chip
                    label={
                      user.role === "Admin"
                        ? "Quản trị viên"
                        : user.role === "NutritionExpert"
                          ? "Chuyên gia dinh dưỡng"
                          : "Khách hàng"
                    }
                    color={
                      user.role === "Admin"
                        ? "success"
                        : user.role === "NutritionExpert"
                          ? "warning"
                          : "primary"
                    }
                    size="medium"
                    sx={{ fontWeight: 600 }}
                  />
                </Box>
              </Box>
            </Box>

            {/* Right section - Actions */}
            <Box display="flex" gap={1.5}>
              <Tooltip title="Chỉnh sửa" arrow>
                <IconButton
                  sx={{
                    color: "#1E88E5",
                    backgroundColor: "#E3F2FD",
                    "&:hover": { backgroundColor: "#BBDEFB" },
                  }}
                  onClick={() => handleOpenEdit(user)}
                >
                  <EditOutlinedIcon />
                </IconButton>
              </Tooltip>

              <Tooltip
                title={user.status === "Active" ? "Vô hiệu hóa" : "Kích hoạt lại"}
                arrow
              >
                <IconButton
                  sx={{
                    color: user.status === "Active" ? "#E53935" : "#43A047",
                    backgroundColor: "#fff",
                    border: "1px solid #C8E6C9",
                    "&:hover": {
                      backgroundColor:
                        user.status === "Active" ? "#FFEBEE" : "#E8F5E9",
                    },
                  }}
                  onClick={() => handleToggleStatus(user)}
                >
                  {user.status === "Active" ? <Lock /> : <LockOpen />}
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
        ))}
      </Box>


      {/* Pagination Section */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mt={3}
        flexWrap="wrap"
      >
        {/* Hiển thị thông tin tổng */}
        <Typography color="text.secondary" sx={{ fontSize: 14 }}>
          Hiển thị {(page - 1) * limit + 1} -{" "}
          {Math.min(page * limit, totalUsers)} trong tổng số {totalUsers} người dùng
        </Typography>

        {/* Select số lượng hiển thị */}
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
                fetchUsers(1, searchTerm, newLimit);
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

        {/* Pagination control */}
        <Pagination
          count={totalPages}
          page={page}
          onChange={(event, value) => setPage(value)}
          color="success"
          sx={{
            "& .MuiPaginationItem-root": {
              color: "#2E7D32",
            },
            "& .Mui-selected": {
              backgroundColor: "#43A047 !important",
              color: "#fff !important",
            },
          }}
        />
      </Box>

      {/* Dialog Add */}
      <Dialog open={addOpen} onClose={handleCloseAdd} maxWidth="sm" fullWidth>
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
          <PersonIcon />
          <Typography variant="h6" fontWeight={700}>
            Thêm người dùng mới
          </Typography>
        </Box>
        <DialogContent dividers sx={{ p: 3 }}>
          <Box display="flex" flexDirection="column" gap={2}>
            <TextField
              label="Họ và tên"
              value={newUser.fullname}
              onChange={(e) => setNewUser({ ...newUser, fullname: e.target.value })}
              fullWidth
            />
            <TextField
              label="Email"
              value={newUser.email}
              onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
              fullWidth
            />
            <TextField
              label="Mật khẩu"
              type={showPasswordAdd ? "text" : "password"}
              value={newUser.password}
              onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
              fullWidth
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPasswordAdd(!showPasswordAdd)} edge="end">
                      {showPasswordAdd ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              label="Số điện thoại"
              value={newUser.phoneNumber}
              onChange={(e) => setNewUser({ ...newUser, phoneNumber: e.target.value })}
              fullWidth
            />
            <TextField
              label="Giới tính"
              select
              value={newUser.gender}
              onChange={(e) => setNewUser({ ...newUser, gender: e.target.value })}
              fullWidth
            >
              <MenuItem value="Male">Nam</MenuItem>
              <MenuItem value="Female">Nữ</MenuItem>
            </TextField>
            <TextField
              label="Ngày sinh"
              type="date"
              value={newUser.dob}
              onChange={(e) => setNewUser({ ...newUser, dob: e.target.value })}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="Vai trò"
              select
              value={newUser.role}
              onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
              fullWidth
            >
              <MenuItem value="Admin">Quản trị viên</MenuItem>
              <MenuItem value="Customer">Người dùng</MenuItem>
              <MenuItem value="NutritionExpert">Chuyên gia dinh dưỡng</MenuItem>
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={handleCloseAdd} sx={{ color: "#9e9e9e" }}>
            Hủy
          </Button>
          <Button
            onClick={handleSaveAdd}
            variant="contained"
            disabled={adding}
            sx={{ backgroundColor: "#43A047" }}
          >
            {adding ? "Đang thêm..." : "Thêm người dùng"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog Edit */}
      <Dialog open={editOpen} onClose={handleCloseEdit} maxWidth="sm" fullWidth>
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
          <PersonIcon />
          <Typography variant="h6" fontWeight={700}>
            Chỉnh sửa người dùng
          </Typography>
        </Box>
        <DialogContent dividers sx={{ p: 3 }}>
          {selectedUser && (
            <Box display="flex" flexDirection="column" gap={2}>
              <TextField
                label="Họ và tên"
                value={selectedUser.fullname}
                onChange={(e) =>
                  setSelectedUser({ ...selectedUser, fullname: e.target.value })
                }
                fullWidth
              />
              <TextField
                label="Email"
                value={selectedUser.email}
                onChange={(e) =>
                  setSelectedUser({ ...selectedUser, email: e.target.value })
                }
                fullWidth
              />
              <TextField
                label="Mật khẩu"
                type={showPasswordEdit ? "text" : "password"}
                value={selectedUser.password || ""}
                onChange={(e) =>
                  setSelectedUser({ ...selectedUser, password: e.target.value })
                }
                fullWidth
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPasswordEdit(!showPasswordEdit)}
                        edge="end"
                      >
                        {showPasswordEdit ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              <TextField
                label="Số điện thoại"
                value={selectedUser.phoneNumber || ""}
                onChange={(e) =>
                  setSelectedUser({ ...selectedUser, phoneNumber: e.target.value })
                }
                fullWidth
              />
              <TextField
                label="Giới tính"
                select
                value={selectedUser.gender || ""}
                onChange={(e) =>
                  setSelectedUser({ ...selectedUser, gender: e.target.value })
                }
                fullWidth
              >
                <MenuItem value="Male">Nam</MenuItem>
                <MenuItem value="Female">Nữ</MenuItem>
              </TextField>
              <TextField
                label="Ngày sinh"
                type="date"
                value={
                  selectedUser.dob
                    ? new Date(selectedUser.dob).toISOString().split("T")[0]
                    : ""
                }
                onChange={(e) =>
                  setSelectedUser({ ...selectedUser, dob: e.target.value })
                }
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                label="Vai trò"
                select
                value={selectedUser.role || ""}
                onChange={(e) =>
                  setSelectedUser({ ...selectedUser, role: e.target.value })
                }
                fullWidth
              >
                <MenuItem value="Admin">Quản trị viên</MenuItem>
                <MenuItem value="Customer">Người dùng</MenuItem>
                <MenuItem value="NutritionExpert">Chuyên gia dinh dưỡng</MenuItem>
              </TextField>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={handleCloseEdit} sx={{ color: "#9e9e9e" }}>
            Hủy
          </Button>
          <Button
            onClick={handleSaveEdit}
            variant="contained"
            disabled={saving}
            sx={{ backgroundColor: "#43A047" }}
          >
            {saving ? "Đang lưu..." : "Lưu thay đổi"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UserManagement;
