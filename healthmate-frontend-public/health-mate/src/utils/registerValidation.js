export const checkPasswordsMatch = (password, confirmPassword) => {
    const isBothProvided = Boolean(password) && Boolean(confirmPassword);

    if (!isBothProvided) {
        return { isValid: true, message: "" };
    }

    const isValid = password === confirmPassword;
    return {
        isValid,
        message: isValid ? "" : "Mật khẩu không trùng khớp",
    };
};

export const validatePasswordStrength = (password) => {
    if (!password) {
        return { isValid: false, message: "Vui lòng nhập mật khẩu" };
    }

    const hasMinLength = password.length >= 6;
    const hasUppercase = /[A-Z]/.test(password);
    const hasSpecial = /[^A-Za-z0-9]/.test(password);

    const isValid = hasMinLength && hasUppercase && hasSpecial;

    if (isValid) return { isValid: true, message: "" };

    const unmet = [];
    if (!hasMinLength) unmet.push("ít nhất 6 ký tự");
    if (!hasUppercase) unmet.push("ít nhất 1 chữ hoa");
    if (!hasSpecial) unmet.push("ít nhất 1 ký tự đặc biệt");

    return {
        isValid: false,
        message: `Mật khẩu cần ${unmet.join(", ")}`,
    };
};
export const emailValidator = (email) => {
    if (!email) {
        return { isValid: false, message: "Vui lòng nhập email" };
    }
    const regex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
    if(regex.test(email)) {
        return {isValid: true, message: ""}
    }
    return {
        isValid: false,
        message: "Sai format email",
    }
}



