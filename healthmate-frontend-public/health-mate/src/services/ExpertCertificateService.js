import baseAxios from "../api/axios";

// Tạo chứng chỉ expert
export const createExpertCertificate = async (data) => {
    try {
        const res = await baseAxios.post("/expert-certificate", data);
        // Lưu certificateId vào localStorage
        localStorage.setItem("certificateId", res.data._id);
        return res.data;
    } catch (err) {
        console.error("Lỗi khi tạo expert certificate:", err);
        throw err;
    }
};

// Cập nhật chứng chỉ expert
export const updateExpertCertificate = async (certificateId, data) => {
    try {
        const res = await baseAxios.put(`/expert-certificate/${certificateId}`, data);
        return res.data;
    } catch (err) {
        console.error("Lỗi khi cập nhật expert certificate:", err);
        throw err;
    }
};

// Lấy certificate của user theo certificateId
export const getUserExpertCertificate = async () => {
    try {
        const certificateId = localStorage.getItem("certificateId");
        if (!certificateId) return null;
        const res = await baseAxios.get(`/expert-certificate/${certificateId}`);
        return res.data;
    } catch (err) {
        console.error("Lỗi khi lấy expert certificate:", err);
        return null;
    }
};
