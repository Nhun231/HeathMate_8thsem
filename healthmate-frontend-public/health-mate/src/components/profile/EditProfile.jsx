import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../style/themeStyle.css";
import {
  getCurrentUser,
  updateCurrentUser,
} from "../../services/UserService.js";
import {
  getLatestCalculation,
  createCalculation,
} from "../../services/CalculateService.js";
import CustomAlert from "../../components/common/Alert.jsx";
import {
  validateField,
  validateAll,
} from "../../utils/editProfileValidation.js";

const EditProfilePage = () => {
  const [data, setData] = useState({
    fullname: "",
    gender: "",
    dob: "",
    email: "",
    height: "",
    weight: "",
    activityLevel: "",
    phoneNumber: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState({
    show: false,
    message: "",
    severity: "info",
  });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userRes = await getCurrentUser();
        const physicalRes = await getLatestCalculation();
        const user = userRes.data;
        const physical = physicalRes.data || {};

        setData({
          fullname: user.fullname || "",
          gender: user.gender || "",
          dob: user.dob || "",
          email: user.email || "",
          height: physical.height || "",
          weight: physical.weight || "",
          activityLevel: physical.activityLevel || "",
          phoneNumber: user.phoneNumber || "",
        });
      } catch (err) {
        setAlert({
          show: true,
          message: err.response?.data?.message || "Có lỗi khi lấy dữ liệu",
          severity: "error",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Live validate
    setErrors((prev) => ({ ...prev, [name]: validateField(name, value) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const allErrors = validateAll(data);
    setErrors(allErrors);
    if (Object.keys(allErrors).length > 0) return;

    setSaving(true);
    try {
      await updateCurrentUser({
        fullname: data.fullname,
        gender: data.gender,
        dob: data.dob,
      });
      await createCalculation({
        height: Number(data.height),
        weight: Number(data.weight),
        activityLevel: data.activityLevel,
      });

      setAlert({
        show: true,
        message: "Cập nhật thành công!",
        severity: "success",
      });

      setTimeout(() => navigate("/my-profile"), 1500);
    } catch (err) {
      console.error(err);
      setAlert({
        show: true,
        message: err.message || "Lỗi không xác định",
        severity: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="container p-4">Loading...</div>;

  const fields = [
    { label: "Họ và tên", name: "fullname", type: "text", maxLength: 64 },
    { label: "Email", name: "email", type: "email", disabled: true },
    {
      label: "Giới tính",
      name: "gender",
      type: "select",
      options: [
        { value: "Male", label: "Nam" },
        { value: "Female", label: "Nữ" },
      ],
    },
    {
      label: "Số điện thoại",
      name: "phoneNumber",
      type: "text",
      disabled: true,
    },
    { label: "Ngày sinh", name: "dob", type: "date" },
    { label: "Chiều cao (cm)", name: "height", type: "text" },
    { label: "Cân nặng (kg)", name: "weight", type: "text" },
    {
      label: "Cường độ vận động",
      name: "activityLevel",
      type: "select",
      options: ["Sedentary", "Light", "Moderate", "Active", "VeryActive"],
    },
  ];

  return (
    <div className="container p-4">
      {alert.show && (
        <CustomAlert
          message={alert.message}
          variant={alert.severity}
          onClose={() => setAlert({ ...alert, show: false })}
        />
      )}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-main-green">Chỉnh sửa hồ sơ</h1>
        <p className="text-gray-600 mt-1">
          Cập nhật thông tin cá nhân và chỉ số sức khỏe của bạn
        </p>
      </div>

      <div className="my-card">
        <div className="card-content">
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-4">
              {fields.map((f) => (
                <div className="form-group" key={f.name}>
                  <label className="form-label" htmlFor={f.name}>
                    {f.label}
                  </label>
                  {f.type === "select" ? (
                    <select
                      id={f.name}
                      name={f.name}
                      className={`form-select${errors[f.name] ? " error" : ""}`}
                      value={data[f.name]}
                      onChange={handleChange}
                      disabled={f.disabled}
                    >
                      <option value="">
                        {f.name === "gender"
                          ? "Chọn giới tính"
                          : f.name === "activityLevel"
                          ? "Chọn cường độ vận động"
                          : `Chọn ${f.label.toLowerCase()}`}
                      </option>

                      {f.options?.map((opt) =>
                        typeof opt === "string" ? (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ) : (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        )
                      )}
                    </select>
                  ) : (
                    <input
                      type={f.type}
                      id={f.name}
                      name={f.name}
                      className={`form-control${
                        errors[f.name] ? " error" : ""
                      }`}
                      value={
                        f.name === "phoneNumber"
                          ? data.phoneNumber
                            ? `*******${data.phoneNumber.slice(-3)}`
                            : ""
                          : f.type === "date" && data[f.name]
                          ? new Date(data[f.name]).toISOString().split("T")[0]
                          : data[f.name]
                      }
                      onChange={handleChange}
                      disabled={f.disabled}
                      maxLength={f.maxLength}
                    />
                  )}
                  {errors[f.name] && (
                    <p className="error-text">{errors[f.name]}</p>
                  )}
                </div>
              ))}
            </div>

            <div className="flex-buttons">
              <button
                type="submit"
                className="my-btn my-btn-primary"
                disabled={saving}
              >
                {saving ? "Đang lưu..." : "Lưu thay đổi"}
              </button>
              <button
                type="button"
                className="my-btn my-btn-outline"
                onClick={() => navigate("/my-profile")}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditProfilePage;
