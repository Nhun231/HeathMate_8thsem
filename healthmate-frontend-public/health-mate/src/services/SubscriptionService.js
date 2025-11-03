import baseAxios from "../api/axios";

// Lấy danh sách các gói 
export const listPremiumPackage = async (params = {}) => {
    try {
        const res = await baseAxios.get("/subscription", { params });
        return res.data;
    } catch (err) {
        console.error("Lỗi khi lấy danh sách các gói:", err);
        throw err;
    }
};

// Tạo mới một gói dịch vụ
export const createSubscription = async (data) => {
    try {
        const res = await baseAxios.post("/subscription", data);
        return res.data;
    } catch (err) {
        console.error("Lỗi khi tạo gói dịch vụ:", err);
        throw err;
    }
};

// Cập nhật thông tin gói dịch vụ
export const updateSubscription = async (id, data) => {
    try {
        const res = await baseAxios.put(`/subscription/${id}`, data);
        return res.data;
    } catch (err) {
        console.error(`Lỗi khi cập nhật gói dịch vụ ID=${id}:`, err);
        throw err;
    }
};