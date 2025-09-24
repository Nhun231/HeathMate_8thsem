import baseAxios from "../../api/axios.js";

export const login = async (formData) => {
    console.log(formData)
    try{
        return await baseAxios.post('/auth/login', formData);
    }catch (e) {
        alert("Lỗi khi đăng nhập: ",e.message)
        console.error(e)
        return e;
    }
}