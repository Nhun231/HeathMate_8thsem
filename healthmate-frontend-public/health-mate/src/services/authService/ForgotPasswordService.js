import baseAxios from "../../api/axios.js";

export const forgotPassword =async (formData) => {
    try{
        return await baseAxios.post('/auth/forgot-password', formData)
    }catch (e) {
        throw e;
    }
}