import baseAxios from "../api/axios.js";

export const getLatestCalculation = async () => {
    try {
        const response = await baseAxios.get('/calculation/user/latest');
        return response;
    } catch (e) {
        alert("Lỗi khi lấy dữ liệu calculation mới nhất");
        console.error(e);
        return e;
    }
};

export const createCalculation = async (data) => {
    try {
        const response = await baseAxios.post("/calculation", data);
        return response;
    } catch (e) {
        alert("Lỗi khi tạo calculation mới");
        console.error(e);
        return e;
    }
};