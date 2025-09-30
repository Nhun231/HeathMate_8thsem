import baseAxios from "../api/axios";
export const createDietPlan = async (payload, token) => {
    try {
        return await baseAxios.post("/diet-plan", payload, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
    } catch (e) {
        throw e.response || e;
    }
};



