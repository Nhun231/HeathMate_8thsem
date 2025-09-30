import baseAxios from "../api/axios";
export const createCalculation = async (payload, token) => {
    try {
        return await baseAxios.post("/calculation", payload, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
    } catch (e) {
        console.error("API createCalculation error:", e);
        throw e;
    }
};
