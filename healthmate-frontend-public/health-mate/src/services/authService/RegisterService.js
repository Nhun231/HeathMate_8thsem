import baseAxios from "../../api/axios.js";


export const register = async (formData) => {
    console.log(formData)
    try{
        return await baseAxios.post('/auth/register', formData);
    }catch (e) {
        console.error("Loi khi dang ky:", e)
        throw e;
    }
}
export const sendOTP = async (sendOTPRequest) => {
    console.log("Send OTP to: ",sendOTPRequest)
    try{
        return  await baseAxios.post('/auth/send-otp', sendOTPRequest);
    }catch (e) {
        console.log("Lỗi khi gửi OTP: ",e)
        throw e;
    }
}