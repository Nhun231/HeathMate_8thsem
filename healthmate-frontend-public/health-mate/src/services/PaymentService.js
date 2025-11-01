import baseAxios from "../api/axios.js";

export const getAllPayments = async (page = 1, limit = 10, filters = {}) => {
  try {
    const response = await baseAxios.get(`/payment`, {
      params: { page, limit, ...filters },
      headers: { "Cache-Control": "no-cache" },
    });
    return response.data;
  } catch (e) {
    console.error("Lỗi khi lấy danh sách giao dịch thanh toán:", e);
    throw e;
  }
};

export const getPaymentById = async (id) => {
  try {
    const response = await baseAxios.get(`/payment/${id}`);
    return response.data;
  } catch (e) {
    console.error("Lỗi khi lấy chi tiết giao dịch:", e);
    alert("Không thể lấy thông tin chi tiết giao dịch!");
    throw e;
  }
};