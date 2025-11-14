import baseAxios from "../api/axios";

// Lấy danh sách bài viết
export const listPosts = async (params = {}) => {
    try {
        const res = await baseAxios.get("/post", { params });
        return res.data;
    } catch (err) {
        console.error("Lỗi khi lấy danh sách bài viết:", err);
        throw err;
    }
};

// Lấy chi tiết bài viết
export const getPostById = async (postId) => {
    try {
        const res = await baseAxios.get(`/post/${postId}`);
        return res.data;
    } catch (err) {
        console.error("Lỗi khi lấy chi tiết bài viết:", err);
        throw err;
    }
};

// Tạo bài viết mới
export const createPost = async (data) => {
    try {
        const res = await baseAxios.post("/post", data);
        return res.data;
    } catch (err) {
        console.error("Lỗi khi tạo bài viết:", err);
        throw err;
    }
};

// Cập nhật bài viết
export const updatePost = async (postId, data) => {
    try {
        const res = await baseAxios.put(`/post/${postId}`, data);
        return res.data;
    } catch (err) {
        console.error("Lỗi khi cập nhật bài viết:", err);
        throw err;
    }
};

// Xóa bài viết
export const deletePost = async (postId) => {
    try {
        const res = await baseAxios.delete(`/post/${postId}`);
        return res.data;
    } catch (err) {
        console.error("Lỗi khi xóa bài viết:", err);
        throw err;
    }
};

// Lấy danh sách bài viết cho newsfeed (hiển thị công khai)
export const listNewsfeed = async (params = {}) => {
    try {
        const res = await baseAxios.get("/post/newsfeed", { params });
        return res.data;
    } catch (err) {
        console.error("Lỗi khi lấy danh sách bài viết newsfeed:", err);
        throw err;
    }
};