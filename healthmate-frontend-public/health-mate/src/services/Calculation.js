import baseAxios from "../api/axios";
export const createCalculation = async (payload, token) => {
    try {
        console.log(payload);
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

export const getAllCalculations = async (token) => {
    try {
      const { data } = await baseAxios.get("/calculation/user/list", {
          headers: { 
            Authorization: `Bearer ${token}` 
          },
        });
    return data;
  } catch (e) {
    console.error("API getAllCalculations error:", e);
    throw e;
  }
};