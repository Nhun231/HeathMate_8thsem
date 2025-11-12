import baseAxios from "../api/axios";

export const listSubscriptions = async (params = {}) => {
  try {
    const res = await baseAxios.get("/subscription", { params });
    return res.data;
  } catch (err) {
    console.error("Lỗi khi lấy danh sách các gói:", err);
    throw err;
  }
};

export const createOrder = async (subscriptionId) => {
  try {
    const res = await baseAxios.post("/order", { subscriptionId });
    return res.data;
  } catch (err) {
    console.error("Lỗi khi tạo order:", err);
    throw err;
  }
};

export const generateQRCode = async ({ amount, orderId }) => {
  try {
    const res = await baseAxios.post("/payment/generate-qr-code", {
      amount,
      orderId,
    });
    return res.data;
  } catch (err) {
    console.error("Lỗi khi tạo mã QR:", err);
    throw err;
  }
};

export const getOrder = async (orderId) => {
  try {
    const res = await baseAxios.get(`/order/${orderId}`);
    return res.data;
  } catch (err) {
    console.error("Lỗi khi lấy dữ liệu đơn hàng:", err);
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