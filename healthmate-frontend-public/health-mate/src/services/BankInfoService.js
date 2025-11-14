import baseAxios from "../api/axios";

export const listBankInfo = async (token) => {
  try {
    const res = await baseAxios.get("/bankinfo", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return res.data;
  } catch (e) {
    console.error("API listBankInfo error:", e.response?.data || e.message);
    throw e.response || e;
  }
};

export const createBankInfo = async (bankInfoData, token) => {
  try {
    const res = await baseAxios.post("/bankinfo", bankInfoData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return res.data;
  } catch (e) {
    console.error("API createBankInfo error:", e);
    throw e.response || e;
  }
};

export const updateBankInfo = async (bankInfoId, bankInfoData, token) => {
  try {
    const res = await baseAxios.patch(`/bankinfo/${bankInfoId}`, bankInfoData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return res.data;
  } catch (e) {
    console.error("API updateBankInfo error:", e);
    throw e.response || e;
  }
};

export const deleteBankInfo = async (bankInfoId, token) => {
  try {
    const res = await baseAxios.delete(`/bankinfo/${bankInfoId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return res.data;
  } catch (e) {
    console.error("API deleteBankInfo error:", e);
    throw e.response || e;
  }
};
