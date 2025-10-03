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

export const getCurrentDietPlan = async (token) => {
  try {
    const res = await baseAxios.get("/diet-plan/current", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return res.data;
  } catch (e) {
    console.error("API getCurrentDietPlan error:", e);
    throw e.response || e;
  }

};
