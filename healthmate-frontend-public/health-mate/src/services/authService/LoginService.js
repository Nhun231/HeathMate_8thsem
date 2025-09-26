import baseAxios from "../../api/axios.js";

export const login = async (formData) => {
    console.log(formData)
    try{
        return await baseAxios.post('/auth/login', formData);
    }catch (e) {
        console.error(e)
        throw e;
    }
}