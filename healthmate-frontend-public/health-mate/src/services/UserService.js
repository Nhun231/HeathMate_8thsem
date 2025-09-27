import baseAxios from "../api/axios.js";

export const getCurrentUser = async () => {
    try {
        const response = await baseAxios.get('/users/me');
        return response;
    } catch (e) {
        alert("Lỗi khi lấy thông tin người dùng");
        console.error(e);
        return e;
    }
};
