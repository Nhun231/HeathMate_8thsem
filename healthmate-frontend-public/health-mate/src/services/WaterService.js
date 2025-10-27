import baseAxios from "../api/axios.js";

// Lấy dữ liệu nước theo ngày (mặc định là hôm nay)
export const getWaterData = async (date) => {
    try {
        const params = date ? { date } : {};
        const response = await baseAxios.get("/water", { params });
        return response;
    } catch (e) {
        alert("Lỗi khi lấy dữ liệu nước");
        console.error(e);
        return e;
    }
};


// Thêm một lần uống nước mới
export const addWaterIntake = async (amount) => {
    try {
        const response = await baseAxios.post("/water", { amount });
        return response;
    } catch (e) {
        alert("Lỗi khi thêm lượng nước uống");
        console.error(e);
        return e;
    }
};

// Cập nhật một record lịch sử nước (dùng recordId)
export const updateWaterHistory = async (recordId, date, amount) => {
    try {
        const response = await baseAxios.put("/water", {
            recordId,
            date,
            amount
        });
        return response;
    } catch (e) {
        alert("Lỗi khi cập nhật record nước uống");
        console.error(e);
        return e;
    }
};

// Xóa một record lịch sử nước (dùng recordId)
export const deleteWaterHistory = async (recordId, date) => {
    try {
        const response = await baseAxios.delete("/water", {
            data: { recordId, date } // DELETE với body
        });
        return response;
    } catch (e) {
        alert("Lỗi khi xóa record nước uống");
        console.error(e);
        return e;
    }
};

export const getWaterDataByUserId = async (userId, params = {}) => {
  try {
    const response = await baseAxios.get(`/water/${userId}`, { params });
    return response;
  } catch (e) {
    alert("Lỗi khi lấy dữ liệu nước theo userId");
    console.error(e);
    return e;
  }
};

