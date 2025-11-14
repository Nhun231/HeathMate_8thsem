import React, { useEffect, useState, useContext } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Menu,
  MenuItem,
} from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import { ArrowDropDown } from "@mui/icons-material";
import baseAxios from "../../api/axios.js";
import { getCurrentDietPlan } from "../../services/DietPlan.js";
import { AuthContext } from "../../context/AuthProvider";

const Header = () => {
  const navigate = useNavigate();
  const authContext = useContext(AuthContext);
  const user = authContext?.user || null;
  const subscripted = !!user?.subscripted;
  const userRole = user?.roleId?.name || null;

  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    const token = localStorage.getItem("accessToken");
    return !!token;
  });
  const [anchorEl, setAnchorEl] = useState(null);
  const [hasDietPlan, setHasDietPlan] = useState(false);

  useEffect(() => {
    const handleStorageChange = () => {
      const token = localStorage.getItem("accessToken");
      setIsLoggedIn(!!token);
      if (token) {
        getCurrentDietPlan(token)
          .then((data) => data && setHasDietPlan(true))
          .catch((err) => {
            if (err?.status === 404 || err?.statusCode === 404) {
              setHasDietPlan(false);
            } else {
              console.error(err);
            }
          });
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const handleClick = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const handleLogout = async () => {
    try {
      await baseAxios.post("/auth/logout", {
        refreshToken: localStorage.getItem("refreshToken"),
      });
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      setIsLoggedIn(false);
      navigate("/guest-homepage");
    } catch (err) {
      console.log("logout error:", err);
      alert("Đăng xuất thất bại");
    }
  };

  return (
    <AppBar
      position="sticky"
      sx={{
        background: "linear-gradient(90deg, #4CAF50, #66BB6A)",
        boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
      }}
    >
      <Toolbar
        sx={{
          maxWidth: "1600px",
          mx: "auto",
          width: "100%",
          height: "12vh",
          minHeight: "80px",
        }}
      >
        {/* Logo */}
        <Typography
          variant="h5"
          component="div"
          sx={{
            flexGrow: 1,
            cursor: "pointer",
            fontWeight: "bold",
            color: "#ffffff",
            fontSize: { xs: "1.6rem", sm: "1.8rem", md: "2rem" },
            transition: "transform 0.2s",
            position: "relative",
            display: "inline-block",
            "&:hover": { transform: "scale(1.05)", opacity: 0.9 },
          }}
        >
          {isLoggedIn ? (
            <Link
              to={
                userRole === "Admin"
                  ? "/admin/dashboard"
                  : userRole === "NutritionExpert"
                    ? "/expert-chat"
                    : "/customer-homepage"
              }
              style={{ color: "inherit", textDecoration: "none", position: "relative" }}
            >
              HealthMate
              {subscripted && (
                <Box
                  sx={{
                    position: "absolute",
                    top: "-8px",
                    right: "-60px",
                    background:
                      "linear-gradient(135deg, #b388ff, #7c4dff, #64b5f6, #e1bee7)",
                    color: "white",
                    fontSize: "0.65rem",
                    fontWeight: 700,
                    padding: "2px 6px",
                    borderRadius: "8px",
                    boxShadow: "0 0 8px rgba(255,255,255,0.6)",
                    letterSpacing: "0.5px",
                    textShadow: "0 0 4px rgba(255,255,255,0.8)",
                    animation: "shimmer 3s infinite",
                    backgroundSize: "300% 300%",
                    "@keyframes shimmer": {
                      "0%": { backgroundPosition: "0% 50%" },
                      "50%": { backgroundPosition: "100% 50%" },
                      "100%": { backgroundPosition: "0% 50%" },
                    },
                  }}
                >
                  ★ PREMIUM
                </Box>
              )}
            </Link>
          ) : (
            <Link
              to="/guest-homepage"
              style={{ color: "inherit", textDecoration: "none" }}
            >
              HealthMate
            </Link>
          )}
        </Typography>

        {/* Nút menu */}
        <Box
          sx={{
            display: "flex",
            gap: 2,
            "& button": {
              fontSize: { xs: "0.9rem", sm: "1rem", md: "1.05rem" },
              padding: { xs: "6px 10px", sm: "8px 12px", md: "9px 15px" },
              fontWeight: "bold",
              color: "white",
              "&:hover": {
                bgcolor: "rgba(255,255,255,0.1)",
              },
            },
          }}
        >
          {/* Tin tức luôn hiển thị */}
          <Button onClick={() => navigate("/list-post")}>Tin tức</Button>

          {isLoggedIn ? (
            <>
              {userRole === "Admin" && (
                <>
                  <Button onClick={() => navigate("/admin/dashboard")}>Dashboard</Button>
                  <Button onClick={() => navigate("/my-profile")}>Hồ sơ</Button>
                  <Button onClick={handleLogout}>Đăng xuất</Button>
                </>
              )}
              {userRole === "NutritionExpert" && (
                <>
                    <Button onClick={() => navigate("/admin/posts")}>Tin tức của bạn</Button>
                  <Button onClick={() => navigate("/expert-chat")}>Tư vấn</Button>
                  <Button onClick={() => navigate("/my-profile")}>Hồ sơ</Button>
                  <Button onClick={() => navigate("/bankinfo")}>Ngân hàng</Button>
                  <Button onClick={handleLogout}>Đăng xuất</Button>
                </>
              )}
              {userRole === "Customer" && (
                <>
                  <Button onClick={() => navigate("/calculate")}>Công cụ tính toán</Button>
                  <Button onClick={() => navigate("/diary")}>Thực đơn</Button>
                  {subscripted && (
                    <Button onClick={() => navigate("/customer-chat")}>Tư vấn</Button>
                  )}
                  <Button onClick={handleClick} endIcon={<ArrowDropDown />}>
                    Kế hoạch
                  </Button>
                  <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleClose}
                    PaperProps={{
                      sx: { mt: 1, borderRadius: 2, boxShadow: "0 4px 12px rgba(0,0,0,0.2)" },
                    }}
                  >
                    <MenuItem
                      onClick={() => {
                        navigate("/set-goal");
                        handleClose();
                      }}
                    >
                      {hasDietPlan ? "Chỉnh sửa kế hoạch" : "Lập kế hoạch"}
                    </MenuItem>
                    <MenuItem
                      onClick={() => {
                        navigate("/dietplan/progress");
                        handleClose();
                      }}
                    >
                      Theo dõi kế hoạch
                    </MenuItem>
                  </Menu>
                  <Button onClick={() => navigate("/my-profile")}>Hồ sơ</Button>
                  <Button
                    onClick={() => navigate("/view-subscriptions")}
                    sx={{
                      color: "white",
                      backgroundColor: "rgba(255,174,0,1)",
                      "&:hover": { bgcolor: "rgba(252,255,85,1)" },
                    }}
                  >
                    Nâng cấp
                  </Button>
                  <Button onClick={handleLogout}>Đăng xuất</Button>
                </>
              )}
            </>
          ) : (
            <>
              <Button onClick={() => navigate("/login")}>Đăng nhập</Button>
              <Button
                variant="contained"
                onClick={() => navigate("/register")}
                sx={{
                  background: "linear-gradient(45deg, #FF8A65, #FF7043)",
                  color: "#fff",
                  "&:hover": {
                    background: "linear-gradient(45deg, #FF7043, #FF8A65)",
                  },
                  boxShadow: "0 3px 8px rgba(0,0,0,0.2)",
                }}
              >
                Đăng ký
              </Button>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
