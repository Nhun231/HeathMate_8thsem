import baseAxios from "../api/axios";
import axios from "axios";

const axiosRaw = axios.create();

// Lấy presigned URL để upload 1 file ảnh 
export const getPresignedUploadUrl = async (file) => {
    try {
        const response = await baseAxios.post("/media/images/upload/presigned-url", {
            filename: file.name,
            filesize: file.size,
        });
        return response.data;
    } catch (error) {
        console.error("Lỗi khi lấy presigned URL:", error);
        throw error;
    }
};

// Upload file trực tiếp lên S3 qua presigned URL
export const uploadFileToS3 = async (presignedUrl, file) => {
    try {
        await axiosRaw.put(presignedUrl, file, {
            headers: {
                "Content-Type": file.type,
            },
        });
    } catch (error) {
        console.error("Lỗi khi upload lên S3:", error);
        throw error;
    }
};

// Lấy presigned URL để xem (GET) ảnh đã upload
export const getPresignedViewUrl = async (key) => {
    try {
        const response = await baseAxios.post("/media/images/presigned-get-url", {
            key,
        });
        return response.data.presignedUrl;
    } catch (error) {
        console.error("Lỗi khi lấy URL xem ảnh:", error);
        throw error;
    }
};
