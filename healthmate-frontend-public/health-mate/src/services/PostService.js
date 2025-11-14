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
export const getPostById = async (postId, useAuthored = false) => {
    try {
        // Use authenticated endpoint for admin/expert to view posts regardless of status
        const endpoint = useAuthored ? `/post/${postId}/authored` : `/post/${postId}`;
        const res = await baseAxios.get(endpoint);
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

// Lấy danh sách categories từ các bài viết hiện có
export const getPostCategories = async () => {
    try {
        // Fetch posts to extract unique categories
        const res = await baseAxios.get("/post", { params: { limit: 1000 } });
        const posts = res.data?.data || [];
        
        // Extract unique categories
        const categoryMap = new Map();
        posts.forEach((post) => {
            if (post.category && Array.isArray(post.category)) {
                post.category.forEach((cat) => {
                    if (cat && typeof cat === 'object' && cat._id) {
                        if (!categoryMap.has(cat._id)) {
                            categoryMap.set(cat._id, {
                                _id: cat._id,
                                name: cat.name || 'Chưa phân loại',
                                description: cat.description || ''
                            });
                        }
                    }
                });
            }
        });
        
        return Array.from(categoryMap.values());
    } catch (err) {
        console.error("Lỗi khi lấy danh sách categories:", err);
        // Return empty array on error
        return [];
    }
};