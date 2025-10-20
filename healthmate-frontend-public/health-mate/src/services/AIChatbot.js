import baseAxios from "../api/axios";
export const aiChatBot = async (payload, token) => {
    try {
        console.log(payload);
        return await baseAxios.post("/ai/chat", payload, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
    } catch (e) {
        console.error("API createCalculation error:", e);
        throw e;
    }
};