import baseAxios from "../api/axios.js";

export const getLatestCalculation = async () => {
    try {
        const response = await baseAxios.get('/calculation/user/lastest');
        return response;
    } catch (e) {
        alert("Lỗi khi lấy dữ liệu calculation mới nhất");
        console.error(e);
        return e;
    }
};
