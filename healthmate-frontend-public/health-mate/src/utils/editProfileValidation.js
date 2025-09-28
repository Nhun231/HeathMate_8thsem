// utils/editProfileValidation.js
export const calculateAge = (dob) => {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate()))
        age--;
    return age;
};

export const validateField = (name, value) => {
    let err = "";

    switch (name) {
        case "fullname":
            if (!value.trim()) err = "Họ và tên không được để trống";
            else if (!/^[a-zA-ZÀ-ỹ\s]+$/.test(value))
                err = "Họ và tên chỉ được chứa chữ cái và khoảng trắng";
            else if (value.length > 100) err = "Họ và tên tối đa 100 ký tự";
            break;

        case "gender":
            if (!["Male", "Female"].includes(value)) err = "Chọn giới tính hợp lệ";
            break;

        case "dob":
            if (!value) err = "Chọn ngày sinh";
            else {
                const age = calculateAge(value);
                if (age < 12) err = "Người dùng phải ít nhất 12 tuổi";
                else if (age > 110) err = "Tuổi tối đa là 110";
            }
            break;

        case "height":
            if (value === "" || isNaN(value)) err = "Chiều cao phải là số";
            else if (value < 100 || value > 250)
                err = "Chiều cao phải từ 100 đến 250 cm";
            break;

        case "weight":
            if (value === "" || isNaN(value)) err = "Cân nặng phải là số";
            else if (value < 10 || value > 300)
                err = "Cân nặng phải từ 10 đến 300 kg";
            break;

        case "activityLevel":
            if (
                !["Sedentary", "Light", "Moderate", "Active", "VeryActive"].includes(
                    value
                )
            )
                err = "Chọn cường độ vận động hợp lệ";
            break;
    }

    return err;
};

export const validateAll = (data) => {
    const errors = {};
    Object.entries(data).forEach(([key, value]) => {
        const err = validateField(key, value);
        if (err) errors[key] = err;
    });
    return errors;
};
