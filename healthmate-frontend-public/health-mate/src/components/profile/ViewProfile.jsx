import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "../../style/themeStyle.css";

import PersonIcon from "@mui/icons-material/Person";
import StraightenIcon from "@mui/icons-material/Straighten";
import ShowChartIcon from "@mui/icons-material/ShowChart";
import LocalFireDepartmentIcon from "@mui/icons-material/LocalFireDepartment";
import TrackChangesIcon from "@mui/icons-material/TrackChanges";
import SpeedIcon from "@mui/icons-material/Speed";
import FitnessCenterIcon from "@mui/icons-material/FitnessCenter";
import SportsScoreIcon from "@mui/icons-material/SportsScore";

import { getCurrentUser } from "../../services/UserService.js";
import { getLatestCalculation } from "../../services/CalculateService.js";

const ProfilePage = () => {
  const [userData, setUserData] = useState(null);
  const [physicalData, setPhysicalData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const calculateAge = (dob) =>
    new Date().getFullYear() -
    new Date(dob).getFullYear() -
    (new Date() < new Date(new Date(dob).setFullYear(new Date().getFullYear()))
      ? 1
      : 0);

  useEffect(() => {
    (async () => {
      try {
        const userRes = await getCurrentUser();
        setUserData(userRes.data);

        const physicalRes = await getLatestCalculation();
        setPhysicalData(physicalRes.data);
      } catch (err) {
        setError(
          err.response?.data?.message || "Có lỗi khi lấy dữ liệu từ server"
        );
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // BMI helper gộp tất cả
  const getBMIInfo = (bmi) => {
    if (!bmi)
      return {
        category: "Chưa có dữ liệu",
        badgeClass: "my-badge",
        colorClass: "text-green",
      };
    if (bmi < 18.5)
      return {
        category: "Thiếu cân",
        badgeClass: "my-badge badge-blue",
        colorClass: "text-blue-600",
      };
    if (bmi < 25)
      return {
        category: "Bình thường",
        badgeClass: "my-badge badge-green",
        colorClass: "text-green",
      };
    return {
      category: "Thừa cân",
      badgeClass: "my-badge badge-yellow",
      colorClass: "text-red-600",
    };
  };

  const getVietnameseActivityLevel = (level) =>
    ({
      Sedentary: "Ít vận động",
      Light: "Vận động nhẹ",
      Moderate: "Vận động vừa",
      Active: "Vận động nhiều",
      VeryActive: "Vận động cực nhiều",
    }[level] || "--");

  const InfoItem = ({ label, value, unit }) => (
    <div className="p-3 rounded-lg bg-gray-50 mb-4">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="font-medium">
        {value ?? "--"} {unit || ""}
      </p>
    </div>
  );

  if (loading || !userData)
    return <div className="container p-4">Loading...</div>;
  if (error) return <div className="container p-4">Error: {error}</div>;

  const bmiInfo = getBMIInfo(physicalData?.bmi);

  return (
    <div className="container p-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold">Hồ sơ cá nhân</h1>
          <p className="text-gray-600 mt-1">
            Quản lý thông tin cá nhân và các chỉ số sức khỏe
          </p>
        </div>
        <Link to="/edit-profile" className="my-btn my-btn-primary">
          Chỉnh sửa hồ sơ
        </Link>
      </div>

      {/* Profile Overview */}
      <div className="my-card border-left-green mb-6">
        <div className="card-content flex flex-col flex-md-row items-center gap-6">
          <div className="avatar">
            {userData.fullname
              ?.split(" ")
              .map((n) => n[0])
              .join("") || "--"}
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-1">
              {userData.fullname || "--"}
            </h2>
            <p className="text-gray-600 mb-2">{userData.email || "--"}</p>
            <div className="flex gap-2">
              <span className="my-badge badge-green text-green-700">
                {userData?.gender === "Male"
                  ? "Nam"
                  : userData?.gender === "Female"
                  ? "Nữ"
                  : "--"}
              </span>
              <span className="my-badge badge-green text-green-700">
                {userData.dob ? calculateAge(userData.dob) : "--"} Tuổi
              </span>
              <span className="my-badge badge-green text-green-700">
                {physicalData?.activityLevel
                  ? getVietnameseActivityLevel(physicalData.activityLevel)
                  : "--"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Personal & Physical Info */}
      <div className="grid grid-cols-1 grid-cols-2 gap-6 mb-6">
        <div className="my-card">
          <div className="my-card-header">
            <div className="my-card-title">
              <PersonIcon style={{ marginRight: 6 }} />
              Thông tin cá nhân
            </div>
          </div>
          <div className="card-content">
            <InfoItem label="Họ và tên" value={userData.fullname} />
            <InfoItem label="Email" value={userData.email} />
            <InfoItem
              label="Giới tính"
              value={
                userData.gender === "Male"
                  ? "Nam"
                  : userData.gender === "Female"
                  ? "Nữ"
                  : "--"
              }
            />
            <InfoItem
              label="Ngày sinh"
              value={
                userData.dob
                  ? new Date(userData.dob).toLocaleDateString("vi-VN")
                  : "--/--/----"
              }
            />
          </div>
        </div>

        <div className="my-card">
          <div className="my-card-header">
            <div className="my-card-title">
              <StraightenIcon style={{ marginRight: 6 }} />
              Chỉ số cơ thể
            </div>
          </div>
          <div className="card-content">
            <InfoItem
              label="Chiều cao"
              value={physicalData?.height}
              unit="cm"
            />
            <InfoItem label="Cân nặng" value={physicalData?.weight} unit="kg" />
            <InfoItem
              label="Lượng nước cần uống"
              value={physicalData?.waterNeeded}
              unit="lít/ngày"
            />
            <InfoItem
              label="Cường độ vận động"
              value={
                physicalData?.activityLevel
                  ? getVietnameseActivityLevel(physicalData.activityLevel)
                  : "--"
              }
            />
          </div>
        </div>
      </div>

      {/* Health Metrics */}
      <div className="my-card mb-6">
        <div className="my-card-header">
          <div className="my-card-title">
            <ShowChartIcon style={{ marginRight: 6 }} />
            Chỉ số sức khỏe
          </div>
        </div>
        <div className="card-content grid grid-cols-1 grid-cols-3 gap-6">
          {[
            {
              icon: LocalFireDepartmentIcon,
              label: "Tỷ lệ trao đổi chất cơ bản (BMR)",
              value: physicalData?.bmr,
              unit: "cal/day",
              desc: "Lượng calo tiêu thụ khi nghỉ ngơi",
            },
            {
              icon: TrackChangesIcon,
              label: "Tổng năng lượng tiêu hao mỗi ngày (TDEE)",
              value: physicalData?.tdee,
              unit: "cal/day",
              desc: "Tổng lượng calo cần thiết mỗi ngày",
            },
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <div key={idx} className="metric-card">
                <Icon style={{ fontSize: 32, color: "green" }} />
                <h3 className="font-semibold text-green mb-1">{item.label}</h3>
                <p className="text-2xl font-bold text-green">
                  {item.value ? Math.round(item.value) : "--"} {item.unit}
                </p>
                <p className="text-sm text-gray-600 mt-1">{item.desc}</p>
              </div>
            );
          })}
          {/* BMI */}
          <div className="metric-card">
            <SportsScoreIcon style={{ fontSize: 32, color: "green" }} />
            <h3 className="font-semibold text-green mb-1">Chỉ số BMI</h3>
            <p className={`text-2xl font-bold ${bmiInfo.colorClass}`}>
              {physicalData?.bmi ?? "--"}
            </p>
            <span className={bmiInfo.badgeClass}>
              Đánh giá: {bmiInfo.category}
            </span>
            <p className="text-sm text-gray-600 mt-1">
              Chỉ số khối cơ thể đánh giá tình trạng cân nặng
            </p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="my-card">
        <div className="my-card-header">
          <div className="my-card-title">Thao tác nhanh</div>
        </div>
        <div className="card-content grid grid-cols-1 grid-cols-3 gap-4">
          {[
            {
              to: "/water-infor",
              icon: FitnessCenterIcon,
              label: "Xem thông tin uống nước",
            },
            {
              to: "/edit-profile",
              icon: SpeedIcon,
              label: "Thay đổi cường độ vận động",
            },
            {
              to: "/edit-profile",
              icon: TrackChangesIcon,
              label: "Thiết lập mục tiêu mới",
            },
          ].map((action, idx) => {
            const Icon = action.icon;
            return (
              <Link
                key={idx}
                to={action.to}
                className="btn btn-outline p-4 text-center"
              >
                <Icon
                  style={{ fontSize: 32, marginBottom: 8, color: "green" }}
                />
                <br />
                <span>{action.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
