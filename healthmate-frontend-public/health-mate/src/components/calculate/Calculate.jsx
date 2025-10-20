import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  IconButton,
  CircularProgress,
  Pagination,
} from "@mui/material";
import {
  EditOutlined,
  DeleteOutline,
  Visibility,
  VisibilityOff,
} from "@mui/icons-material";
import CustomAlert from "../common/Alert"; // giống file Calculate
import {
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
} from "../../services/AdminService";

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [openAdd, setOpenAdd] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openDelete, setOpenDelete] = useState(null);
  const [newUser, setNewUser] = useState({
    fullname: "",
    email: "",
    password: "",
    role: "User",
    gender: "Male",
    dob: "",
    phoneNumber: "",
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [alert, setAlert] = useState({
    show: false,
    message: "",
    severity: "info",
  });

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;

  // ===== VALIDATIONS =====
  const isValidEmail = (email) => /\S+@\S+\.\S+/.test(email);
  const isValidPhone = (num) => /^\d{9,12}$/.test(num);
  const isValidDate = (dob) => {
    if (!dob) return true;
    const date = new Date(dob);
    return date <= new Date();
  };

  const showAlert = (message, severity = "info") => {
    setAlert({ show: true, message, severity });
    setTimeout(() => setAlert({ show: false, message: "", severity: "info" }), 3000);
  };

  const fetchUsers = async (pageNum = 1) => {
    setLoading(true);
    try {
      const res = await getAllUsers(pageNum, limit);
      const usersData = Array.isArray(res?.data)
        ? res.data.map((u) => ({
          ...u,
          role: u.roleId?.name || u.role || "User",
        }))
        : [];
      setUsers(usersData);
      setTotalPages(res?.totalPages || 1);
    } catch (err) {
      console.error(err);
      showAlert("Không thể tải danh sách người dùng!", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(page);
  }, [page]);

  // ===== ADD USER =====
  const handleAddUser = async () => {
    const { fullname, email, password, gender, dob, role, phoneNumber } = newUser;
    if (!fullname || !email || !password || !role || !phoneNumber) {
      showAlert("Vui lòng điền đầy đủ thông tin bắt buộc!", "warning");
      return;
    }
    if (!isValidEmail(email)) {
      showAlert("Email không hợp lệ!", "warning");
      return;
    }
    if (password.length < 6) {
      showAlert("Mật khẩu phải có ít nhất 6 ký tự!", "warning");
      return;
    }
    if (!isValidPhone(phoneNumber)) {
      showAlert("Số điện thoại không hợp lệ (9–12 chữ số)!", "warning");
      return;
    }
    if (!isValidDate(dob)) {
      showAlert("Ngày sinh không hợp lệ hoặc là ngày tương lai!", "warning");
      return;
    }

    setSaving(true);
    try {
      await createUser({ fullname, email, password, gender, dob, role, phoneNumber });
      showAlert("Thêm người dùng thành công!", "success");
      setOpenAdd(false);
      setNewUser({
        fullname: "",
        email: "",
        password: "",
        role: "User",
        gender: "Male",
        dob: "",
        phoneNumber: "",
      });
      fetchUsers(page);
    } catch (err) {
      console.error(err);
      showAlert("Thêm người dùng thất bại!", "error");
    } finally {
      setSaving(false);
    }
  };


  // ===== EDIT USER =====
  const handleUpdateUser = async () => {
    if (!selectedUser) return;
    const { fullname, email, gender, dob, role, phoneNumber, password } = selectedUser;
    if (!fullname || !email || !role || !phoneNumber) {
      showAlert("Vui lòng điền đầy đủ thông tin!", "warning");
      return;
    }
    if (!isValidEmail(email)) {
      showAlert("Email không hợp lệ!", "warning");
      return;
    }
    if (password && password.length < 6) {
      showAlert("Mật khẩu phải có ít nhất 6 ký tự!", "warning");
      return;
    }
    if (!isValidPhone(phoneNumber)) {
      showAlert("Số điện thoại không hợp lệ!", "warning");
      return;
    }
    if (!isValidDate(dob)) {
      showAlert("Ngày sinh không hợp lệ!", "warning");
      return;
    }

    setSaving(true);
    try {
      await updateUser(selectedUser._id, { fullname, email, gender, dob, role, phoneNumber, password });
      showAlert("Cập nhật thông tin thành công!", "success");
      setOpenEdit(false);
      fetchUsers(page);
    } catch (err) {
      console.error(err);
      showAlert("Cập nhật thất bại!", "error");
    } finally {
      setSaving(false);
    }
  };

  // ===== DELETE USER =====
  const handleDeleteUser = async (id) => {
    try {
      await deleteUser(id);
      showAlert("Đã xóa người dùng!", "success");
      setOpenDelete(null);
      fetchUsers(page);
    } catch (err) {
      console.error(err);
      showAlert("Xóa thất bại!", "error");
    }
  };

  // ===== RENDER =====
  return (
    <Box p={4}>
      {/* Alert */}
      {alert.show && (
        <Box sx={{ position: "fixed", top: 16, left: "50%", transform: "translateX(-50%)", zIndex: 2000 }}>
          <CustomAlert message={alert.message} variant={alert.severity} onClose={() => setAlert({ ...alert, show: false })} />
        </Box>
      )}

      <Typography variant="h4" align="center" fontWeight="bold" color="#2e7d32" mb={3}>
        QUẢN LÝ NGƯỜI DÙNG
      </Typography>

      <Box display="flex" justifyContent="space-between" mb={3}>
        <TextField
          variant="outlined"
          size="small"
          placeholder="Tìm kiếm người dùng..."
          sx={{ width: "40%" }}
          color="success"
        />
        <Button
          variant="contained"
          onClick={() => {
            setNewUser({
              fullname: "",
              email: "",
              password: "",
              role: "User",
              gender: "Male",
              dob: "",
              phoneNumber: "",
            });
            setOpenAdd(true);
          }}
          sx={{ backgroundColor: "#2e7d32", color: "white", "&:hover": { backgroundColor: "#256428" } }}
        >
          + Thêm người dùng
        </Button>

      </Box>

      {loading ? (
        <Box textAlign="center" mt={6}>
          <CircularProgress color="success" />
        </Box>
      ) : (
        <Grid container spacing={3}>
          {users.map((user) => (
            <Grid item xs={12} md={6} lg={4} key={user._id}>
              <Card sx={{ borderLeft: "5px solid #2e7d32", boxShadow: 3 }}>
                <CardContent>
                  <Typography fontWeight="bold">{user.fullname}</Typography>
                  <Typography color="gray">{user.email}</Typography>
                  <Typography>Giới tính: {user.gender}</Typography>
                  <Typography>Vai trò: {user.role}</Typography>
                  <Typography>SĐT: {user.phoneNumber}</Typography>
                  <Typography>Ngày sinh: {user.dob ? new Date(user.dob).toLocaleDateString() : "—"}</Typography>
                  <Box mt={2} display="flex" justifyContent="flex-end" gap={1}>
                    <IconButton color="success" onClick={() => { setSelectedUser(user); setOpenEdit(true); }}>
                      <EditOutlined />
                    </IconButton>
                    <IconButton color="error" onClick={() => setOpenDelete(user)}>
                      <DeleteOutline />
                    </IconButton>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Pagination */}
      <Box display="flex" justifyContent="center" mt={4}>
        <Pagination
          count={totalPages}
          page={page}
          onChange={(_, val) => setPage(val)}
          color="success"
          size="large"
        />
      </Box>

      {/* Dialog thêm user */}
      <Dialog open={openAdd} onClose={() => setOpenAdd(false)} fullWidth>
        <DialogTitle>Thêm người dùng mới</DialogTitle>
        <DialogContent>
          <TextField label="Họ và tên" fullWidth margin="dense" value={newUser.fullname} onChange={(e) => setNewUser({ ...newUser, fullname: e.target.value })} />
          <TextField label="Email" fullWidth margin="dense" value={newUser.email} onChange={(e) => setNewUser({ ...newUser, email: e.target.value })} />
          <TextField
            label="Mật khẩu"
            fullWidth
            type={showPassword ? "text" : "password"}
            margin="dense"
            value={newUser.password}
            onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
            InputProps={{
              endAdornment: (
                <IconButton onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              ),
            }}
          />
          <TextField
            label="Số điện thoại"
            fullWidth
            margin="dense"
            value={newUser.phoneNumber}
            onChange={(e) => setNewUser({ ...newUser, phoneNumber: e.target.value })}
          />
          <TextField
            label="Ngày sinh"
            type="date"
            fullWidth
            margin="dense"
            InputLabelProps={{ shrink: true }}
            value={newUser.dob}
            onChange={(e) => setNewUser({ ...newUser, dob: e.target.value })}
          />
          <TextField
            select
            label="Giới tính"
            fullWidth
            margin="dense"
            value={newUser.gender}
            onChange={(e) => setNewUser({ ...newUser, gender: e.target.value })}
          >
            <MenuItem value="Male">Nam</MenuItem>
            <MenuItem value="Female">Nữ</MenuItem>
          </TextField>
          <TextField
            select
            label="Vai trò"
            fullWidth
            margin="dense"
            value={newUser.role}
            onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
          >
            <MenuItem value="User">User</MenuItem>
            <MenuItem value="Admin">Admin</MenuItem>
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAdd(false)}>Hủy</Button>
          <Button variant="contained" color="success" onClick={handleAddUser} disabled={saving}>
            {saving ? "Đang lưu..." : "Lưu"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog sửa user */}
      <Dialog open={openEdit} onClose={() => setOpenEdit(false)} fullWidth>
        <DialogTitle>Cập nhật người dùng</DialogTitle>
        <DialogContent>
          {selectedUser && (
            <>
              <TextField label="Họ và tên" fullWidth margin="dense" value={selectedUser.fullname} onChange={(e) => setSelectedUser({ ...selectedUser, fullname: e.target.value })} />
              <TextField label="Email" fullWidth margin="dense" value={selectedUser.email} onChange={(e) => setSelectedUser({ ...selectedUser, email: e.target.value })} />
              <TextField label="Mật khẩu (để trống nếu không đổi)" fullWidth type="password" margin="dense" value={selectedUser.password || ""} onChange={(e) => setSelectedUser({ ...selectedUser, password: e.target.value })} />
              <TextField label="Số điện thoại" fullWidth margin="dense" value={selectedUser.phoneNumber} onChange={(e) => setSelectedUser({ ...selectedUser, phoneNumber: e.target.value })} />
              <TextField
                label="Ngày sinh"
                type="date"
                fullWidth
                margin="dense"
                InputLabelProps={{ shrink: true }}
                value={selectedUser.dob?.split("T")[0] || ""}
                onChange={(e) => setSelectedUser({ ...selectedUser, dob: e.target.value })}
              />
              <TextField select label="Giới tính" fullWidth margin="dense" value={selectedUser.gender} onChange={(e) => setSelectedUser({ ...selectedUser, gender: e.target.value })}>
                <MenuItem value="Male">Nam</MenuItem>
                <MenuItem value="Female">Nữ</MenuItem>
              </TextField>
              <TextField select label="Vai trò" fullWidth margin="dense" value={selectedUser.role} onChange={(e) => setSelectedUser({ ...selectedUser, role: e.target.value })}>
                <MenuItem value="User">User</MenuItem>
                <MenuItem value="Admin">Admin</MenuItem>
              </TextField>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEdit(false)}>Hủy</Button>
          <Button variant="contained" color="success" onClick={handleUpdateUser} disabled={saving}>
            {saving ? "Đang lưu..." : "Cập nhật"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog xóa */}
      <Dialog open={!!openDelete} onClose={() => setOpenDelete(null)}>
        <DialogTitle>Xác nhận xóa</DialogTitle>
        <DialogContent>Bạn có chắc chắn muốn xóa người dùng này?</DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDelete(null)}>Hủy</Button>
          <Button color="error" variant="contained" onClick={() => handleDeleteUser(openDelete._id)}>
            Xóa
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
