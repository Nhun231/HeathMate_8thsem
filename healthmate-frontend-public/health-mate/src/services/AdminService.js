import baseAxios from "../api/axios.js";

/**
 * Lấy danh sách người dùng (có phân trang, tìm kiếm)
 * @param {number} page - số trang hiện tại
 * @param {number} limit - số lượng bản ghi mỗi trang
 * @param {string} search - từ khóa tìm kiếm (nếu có)
 */
export const getAllUsers = async (page = 1, limit = 10, filters = {}) => {
    try {
        const response = await baseAxios.get(`users`, {
            params: { page, limit, ...filters }, // thêm filters (vd: fullname, email, search,...)
            headers: { "Cache-Control": "no-cache" },
        });
        return response.data;
    } catch (e) {
        console.error("Lỗi khi lấy danh sách người dùng:", e);
        throw e;
    }
};

// Lấy thông tin chi tiết của người dùng
export const getUserById = async (id) => {
    try {
        const response = await baseAxios.get(`/users/${id}`);
        return response.data;
    } catch (e) {
        alert("Lỗi khi lấy thông tin chi tiết người dùng");
        console.error(e);
        return e;
    }
};

// Cập nhật người dùng theo ID 
export const updateUser = async (id, data) => {
    try {
        const response = await baseAxios.put(`/users/${id}`, data);
        return response.data;
    } catch (e) {
        alert("Lỗi khi cập nhật thông tin người dùng");
        console.error(e);
        return e;
    }
};

// Xoá người dùng theo ID
export const deleteUser = async (id) => {
    try {
        const response = await baseAxios.delete(`/users/${id}`);
        return response.data;
    } catch (e) {
        alert("Lỗi khi xóa người dùng");
        console.error(e);
        return e;
    }
};


/**
 * Tạo người dùng mới
 * @param {Object} data
 * data = {
 *   fullname: string,
 *   email: string,
 *   password: string,
 *   gender?: string,
 *   dob?: string,
 *   role: "Admin" | "User"
 * }
 */
export const createUser = async (data) => {
    try {
        const response = await baseAxios.post("/users", data);
        return response.data; // trả về user vừa tạo
    } catch (e) {
        console.error("Lỗi khi tạo người dùng:", e);
        alert("Tạo người dùng thất bại!");
        throw e;
    }
};

// Lấy tổng số người dùng
export const getUserStats = async () => {
    try {
        const response = await baseAxios.get(`users`, {
            params: { page: 1, limit: 1 },
            headers: { "Cache-Control": "no-cache" },
        });

        // Kiểm tra các kiểu dữ liệu trả về khác nhau
        if (response.data?.total) {
            return response.data.total; // backend trả về total riêng
        } else if (response.data?.data) {
            return response.data.data.length; // fallback nếu không có total
        } else {
            return 0;
        }
    } catch (error) {
        console.error("Lỗi khi lấy tổng số người dùng:", error);
        return 0;
    }
};