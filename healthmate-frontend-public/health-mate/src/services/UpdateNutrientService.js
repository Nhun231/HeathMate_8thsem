import baseAxios from "../api/axios.js";

export const getLatestNutrition = async () => {
    try {
        const response = await baseAxios.get('/calculation/user/latest');
        return response;
    } catch (e) {
        alert("Lỗi khi lấy dữ liệu calculation mới nhất");
        console.error(e);
        return e;
    }
};

export const updateNutrition = async (data) => {
    try {
        const response = await baseAxios.patch("/calculation/update/nutrient", data);
        return response.data;
    } catch (e) {
        console.error("Lỗi khi cập nhật nutrient:", e);
        alert("Lỗi khi cập nhật nutrient");
        throw e;
    }
};