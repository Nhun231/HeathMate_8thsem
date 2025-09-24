import baseAxios from "../../api/axios.js";


export const register = async (formData) => {
    console.log(formData)
    try{
        return await baseAxios.post('/auth/register', formData);
    }catch (e) {
        alert("Lỗi khi đăng ký: ",e.message)
        console.error(e)
        return e;
    }
}
export const sendOTP = async (sendOTPRequest) => {
    console.log("Send OTP to: ",sendOTPRequest)
    try{
        return  await baseAxios.post('/auth/send-otp', sendOTPRequest);
    }catch (e) {
        alert("Lỗi khi gửi OTP: ",e.message)
        console.log(e)
        return e;
    }
}