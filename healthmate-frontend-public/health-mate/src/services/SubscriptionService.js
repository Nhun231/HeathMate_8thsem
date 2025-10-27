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