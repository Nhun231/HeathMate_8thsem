import baseAxios from "../api/axios.js";


export const register = async (formData) => {
    console.log(formData)
    try{
        const response =  await baseAxios.post('/auth/register', formData);
        return response;
    }catch (e) {
        alert("Lỗi khi đăng ký: ",e)
        console.eror(e)
        return e;
    }
}
export const sendOTP = async (formData) => {
    console.log(formData)
    try{
        return  await baseAxios.post('/auth/send-otp',
            {
            email: formData.email,
            type: 'REGISTER'
        });
    }catch (e) {
        alert("Lỗi khi gửi OTP: ",e)
        console.log(e)
        return e;
    }
}