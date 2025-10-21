import React, { useState, useEffect } from "react";
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
  Checkbox,
  Alert,
  CircularProgress,
  TextField,
  IconButton,
  InputLabel,
  Select,
  MenuItem,
  FormControl,
  Pagination,
} from "@mui/material";
import { Edit, Save, Search, FilterList } from "@mui/icons-material";
import { permissionApi } from "../../services/Permission";

const PermissionManagement = () => {
  const [permissions, setPermissions] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [editedPermissions, setEditedPermissions] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [modules, setModules] = useState([]);
  const [selectedModule, setSelectedModule] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(100);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchData();
    fetchModules();
  }, [currentPage, itemsPerPage, searchQuery, selectedModule]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: itemsPerPage,
        name: searchQuery,
        module: selectedModule,
      };

      const [permissionsResponse, rolesResponse] = await Promise.all([
        permissionApi.listPermissions(params),
        permissionApi.listRoles(),
      ]);

      setPermissions(permissionsResponse.data);
      setRoles(rolesResponse.data);
      setTotalPages(permissionsResponse.totalPages || 1);
    } catch (error) {
      setError("Lỗi khi tải dữ liệu: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchModules = async () => {
    try {
      const modulesResponse = await permissionApi.listModules();
      setModules(modulesResponse);
    } catch (error) {
      setError("Lỗi khi tải danh sách module: " + error.message);
    }
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleSearchSubmit = () => {
    setSearchQuery(searchTerm);
    setCurrentPage(1);
  };

  const handleSearchKeyPress = (event) => {
    if (event.key === "Enter") {
      handleSearchSubmit();
    }
  };

  const handleClearSearch = () => {
    setSearchTerm("");
    setSearchQuery("");
    setCurrentPage(1);
  };

  const handleModuleChange = (event) => {
    setSelectedModule(event.target.value);
    setCurrentPage(1);
  };

  const handlePageChange = (event, page) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (event) => {
    setItemsPerPage(event.target.value);
    setCurrentPage(1);
  };

  const handlePermissionChange = (permissionId, roleId, checked) => {
    setEditedPermissions((prev) => {
      const permissionEntry = prev[permissionId] || {};
      return {
        ...prev,
        [permissionId]: {
          ...permissionEntry,
          [roleId]: checked,
        },
      };
    });
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      setError("");
      setSuccess("");

      const updates = permissions.map((permission) => {
        const selectedRoleIds = roles
          .filter((role) => {
            const edited = editedPermissions[permission._id]?.[role._id];
            const original = permission.role.some((r) => r._id === role._id);
            return edited !== undefined ? edited : original;
          })
          .map((role) => role._id);

        return {
          permissionId: permission._id,
          roleIds: selectedRoleIds,
        };
      });

      // chỉ gửi những permission có thay đổi
      const filteredUpdates = updates.filter((update) => {
        const originalIds = permissions
          .find((p) => p._id === update.permissionId)
          .role.map((r) => r._id)
          .sort()
          .join(",");
        const newIds = update.roleIds.sort().join(",");
        return originalIds !== newIds;
      });

      if (filteredUpdates.length === 0) {
        setSuccess("Không có thay đổi nào để lưu.");
        setLoading(false);
        return;
      }

      await permissionApi.bulkUpdatePermission(filteredUpdates);

      setEditedPermissions({});
      setSuccess("Cập nhật quyền thành công!");
      fetchData();
    } catch (error) {
      setError("Lỗi khi cập nhật quyền: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const [editName, setEditName] = useState(null);
  const [editDescription, setEditDescription] = useState(null);

  const handleEditName = (permissionId) => {
    setEditName(permissionId);
  };

  const handleCancelEdit = () => {
    setEditName(null);
    setEditDescription(null);
  };

  const handleNameChange = (e) => {
    setEditDescription(e.target.value);
  };

  const handleSaveName = async (permissionId) => {
    try {
      await permissionApi.updatePermission(permissionId, {
        name: editDescription,
      });
      setEditName(null);
      setEditDescription(null);
      fetchData();
    } catch (error) {
      setError("Lỗi khi cập nhật tên quyền: " + error.message);
    }
  };

  const getRoleColumnWidth = () => {
    const baseWidth = 100;
    return `${baseWidth}px`;
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  const groupedPermissions = [];
  if (permissions && permissions.length > 0) {
    const moduleMap = new Map();
    permissions.forEach((p) => {
      const moduleKey = p.module || "undefined";
      if (!moduleMap.has(moduleKey)) {
        moduleMap.set(moduleKey, []);
      }
      moduleMap.get(moduleKey).push(p);
    });

    for (const [moduleName, perms] of moduleMap.entries()) {
      groupedPermissions.push({ module: moduleName, isModuleHeader: true });
      groupedPermissions.push(...perms);
    }
  }

  return (
    <Box>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h5" sx={{ fontWeight: "bold", color: "#2E7D32" }}>
          Quản lý Quyền Truy Cập
        </Typography>
      </Box>

      {/* Search and Filter */}
      <Box sx={{ display: "flex", gap: 2, mb: 3, alignItems: "center" }}>
        <TextField
          label="Tìm kiếm quyền"
          value={searchTerm}
          onChange={handleSearchChange}
          onKeyPress={handleSearchKeyPress}
          sx={{ minWidth: 300 }}
          InputProps={{
            startAdornment: <Search sx={{ mr: 1, color: "#666" }} />,
          }}
        />
        <Button
          variant="contained"
          onClick={handleSearchSubmit}
          sx={{
            backgroundColor: "#4CAF50",
            "&:hover": { backgroundColor: "#2E7D32" },
          }}
        >
          Tìm kiếm
        </Button>
        <Button
          variant="outlined"
          startIcon={<FilterList />}
          onClick={handleClearSearch}
        >
          Xóa bộ lọc
        </Button>
        <FormControl sx={{ m: 1, minWidth: 120 }}>
          <InputLabel id="module-select-label">Module</InputLabel>
          <Select
            labelId="module-select-label"
            id="module-select"
            value={selectedModule}
            label="Module"
            onChange={handleModuleChange}
          >
            <MenuItem value="">
              <em>Tất cả</em>
            </MenuItem>
            {modules.map((module) => (
              <MenuItem key={module} value={module}>
                {module}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Box sx={{ flexGrow: 1 }} /> {/* Pushes the save button to the end */}
        <Button
          variant="contained"
          onClick={handleSave}
          sx={{
            backgroundColor: "#4CAF50",
            "&:hover": { backgroundColor: "#2E7D32" },
          }}
        >
          <Save /> Lưu Thay Đổi
        </Button>
      </Box>

      {/* Alerts */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      {/* Permissions Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: "#E8F5E9" }}>
              <TableCell>
                <strong>Tên</strong>
              </TableCell>
              <TableCell>
                <strong>Đường dẫn</strong>
              </TableCell>
              <TableCell>
                <strong>Phương thức</strong>
              </TableCell>
              {roles.map((role) => (
                <TableCell
                  key={role._id}
                  align="center"
                  sx={{ width: getRoleColumnWidth() }}
                >
                  <strong>{role.name}</strong>
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {groupedPermissions.map((item, index) => {
              if (item.isModuleHeader) {
                return (
                  <TableRow
                    key={`module-${item.module}-${index}`}
                    sx={{ backgroundColor: "#F5F5F5" }}
                  >
                    <TableCell colSpan={4 + roles.length}>
                      <Typography
                        variant="subtitle1"
                        sx={{ fontWeight: "bold" }}
                      >
                        Module: {item.module}
                      </Typography>
                    </TableCell>
                  </TableRow>
                );
              }

              const permission = item;

              return (
                <TableRow key={permission._id} hover>
                  <TableCell>
                    {editName === permission._id ? (
                      <Box display="flex" alignItems="center">
                        <TextField
                          size="small"
                          defaultValue={permission.name}
                          onChange={handleNameChange}
                        />
                        <IconButton
                          onClick={() => handleSaveName(permission._id)}
                        >
                          <Save />
                        </IconButton>
                        <IconButton onClick={handleCancelEdit}>Hủy</IconButton>
                      </Box>
                    ) : (
                      <Box display="flex" alignItems="center">
                        <Typography>{permission.name}</Typography>
                        <IconButton
                          onClick={() => handleEditName(permission._id)}
                        >
                          <Edit />
                        </IconButton>
                      </Box>
                    )}
                  </TableCell>
                  <TableCell>{permission.path}</TableCell>
                  <TableCell>{permission.method}</TableCell>
                  {roles.map((role) => {
                    const hasPermission = permission.role.some(
                      (r) => r._id === role._id
                    );
                    return (
                      <TableCell key={role._id} align="center">
                        <Checkbox
                          checked={
                            editedPermissions[permission._id]?.[role._id] !==
                            undefined
                              ? editedPermissions[permission._id][role._id]
                              : hasPermission
                          }
                          onChange={(e) =>
                            handlePermissionChange(
                              permission._id,
                              role._id,
                              e.target.checked
                            )
                          }
                        />
                      </TableCell>
                    );
                  })}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination Controls */}
      {permissions.length > 0 && (
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mt: 3,
            flexWrap: "wrap",
            gap: 2,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Typography variant="body2" sx={{ color: "#666" }}>
              Hiển thị {(currentPage - 1) * itemsPerPage + 1} -{" "}
              {Math.min(currentPage * itemsPerPage, permissions.length)} trong
              tổng số {permissions.length} quyền
            </Typography>
            <FormControl size="small" sx={{ minWidth: 80 }}>
              <InputLabel>Hiển thị</InputLabel>
              <Select
                value={itemsPerPage}
                onChange={handleItemsPerPageChange}
                label="Hiển thị"
              >
                <MenuItem value={100}>100</MenuItem>
                <MenuItem value={200}>200</MenuItem>
                <MenuItem value={500}>500</MenuItem>
                <MenuItem value={1000}>1000</MenuItem>
              </Select>
            </FormControl>
          </Box>

          <Pagination
            count={totalPages}
            page={currentPage}
            onChange={handlePageChange}
            color="primary"
            showFirstButton
            showLastButton
            size="large"
          />
        </Box>
      )}
    </Box>
  );
};

export default PermissionManagement;
