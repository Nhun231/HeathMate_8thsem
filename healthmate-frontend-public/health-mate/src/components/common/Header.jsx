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

  // Use AuthContext directly with fallback - won't throw error if not within provider
  const authContext = useContext(AuthContext);
  const user = authContext?.user || null;
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
          .then((data) => {
            if (data) setHasDietPlan(true);
          })
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

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

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
      <Toolbar sx={{ maxWidth: "1600px", mx: "auto", width: "100%" }}>
        {/* Logo */}

        <Typography
          variant="h5"
          component="div"
          sx={{
            flexGrow: 1,
            cursor: "pointer",
            fontWeight: "bold",
            color: "#ffffff",
            transition: "transform 0.2s",
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
              style={{ color: "inherit", textDecoration: "none" }}
            >
              HealthMate
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

        {/* Nút đăng nhập/đăng ký */}
        <Box sx={{ display: "flex", gap: 2 }}>
          {isLoggedIn ? (
            <>
              {/* Admin Role */}
              {userRole === "Admin" && (
                <>
                  <Button
                    color="inherit"
                    onClick={() => navigate("/admin/dashboard")}
                    sx={{
                      fontWeight: "bold",
                      color: "white",
                      "&:hover": {
                        bgcolor: "rgba(255, 255, 255, 0.1)",
                      },
                    }}
                  >
                    Dashboard
                  </Button>
                  <Button
                    color="inherit"
                    onClick={() => navigate("/my-profile")}
                    sx={{
                      fontWeight: "bold",
                      color: "white",
                      "&:hover": {
                        bgcolor: "rgba(255, 255, 255, 0.1)",
                      },
                    }}
                  >
                    Hồ sơ
                  </Button>
                  <Button
                    color="inherit"
                    onClick={handleLogout}
                    sx={{
                      fontWeight: "bold",
                      color: "white",
                      "&:hover": {
                        bgcolor: "rgba(255, 255, 255, 0.1)",
                      },
                    }}
                  >
                    Đăng xuất
                  </Button>
                </>
              )}

              {/* Expert Role */}
              {userRole === "NutritionExpert" && (
                <>
                  <Button
                    color="inherit"
                    onClick={() => navigate("/expert-chat")}
                    sx={{
                      fontWeight: "bold",
                      color: "white",
                      "&:hover": {
                        bgcolor: "rgba(255, 255, 255, 0.1)",
                      },
                    }}
                  >
                    Tư vấn cho khách hàng
                  </Button>
                  <Button
                    color="inherit"
                    onClick={() => navigate("/my-profile")}
                    sx={{
                      fontWeight: "bold",
                      color: "white",
                      "&:hover": {
                        bgcolor: "rgba(255, 255, 255, 0.1)",
                      },
                    }}
                  >
                    Hồ sơ
                  </Button>
                  <Button
                    color="inherit"
                    onClick={handleLogout}
                    sx={{
                      fontWeight: "bold",
                      color: "white",
                      "&:hover": {
                        bgcolor: "rgba(255, 255, 255, 0.1)",
                      },
                    }}
                  >
                    Đăng xuất
                  </Button>
                </>
              )}

              {/* Customer Role */}
              {userRole === "Customer" && (
                <>
                  <Button
                    color="inherit"
                    onClick={() => navigate("/calculate")}
                    sx={{
                      fontWeight: "bold",
                      color: "white",
                      "&:hover": {
                        bgcolor: "rgba(255, 255, 255, 0.1)",
                      },
                    }}
                  >
                    Công cụ tính toán
                  </Button>
                  <Button
                    color="inherit"
                    onClick={() => navigate("/diary")}
                    sx={{
                      fontWeight: "bold",
                      color: "white",
                      "&:hover": {
                        bgcolor: "rgba(255, 255, 255, 0.1)",
                      },
                    }}
                  >
                    Thực đơn hôm nay
                  </Button>
                  <Button
                    color="inherit"
                    onClick={() => navigate("/customer-chat")}
                    sx={{
                      fontWeight: "bold",
                      color: "white",
                      "&:hover": {
                        bgcolor: "rgba(255, 255, 255, 0.1)",
                      },
                    }}
                  >
                    Tư vấn cùng chuyên gia
                  </Button>
                  <Button
                    color="inherit"
                    onClick={handleClick}
                    endIcon={<ArrowDropDown />}
                    sx={{
                      fontWeight: "bold",
                      color: "white",
                      "&:hover": {
                        bgcolor: "rgba(255, 255, 255, 0.1)",
                      },
                    }}
                  >
                    Kế hoạch ăn uống
                  </Button>
                  <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleClose}
                    PaperProps={{
                      sx: {
                        mt: 1,
                        borderRadius: 2,
                        boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
                        "& .MuiMenuItem-root": {
                          "&:hover": {
                            bgcolor: "#f5f5f5",
                          },
                        },
                      },
                    }}
                  >
                    <MenuItem
                      onClick={() => {
                        navigate("/set-goal");
                        handleClose();
                      }}
                    >
                      {hasDietPlan
                        ? "Chỉnh sửa kế hoạch ăn uống"
                        : "Lập kế hoạch ăn uống"}
                    </MenuItem>
                    <MenuItem
                      onClick={() => {
                        navigate("/dietplan/progress");
                        handleClose();
                      }}
                    >
                      Theo dõi kế hoạch ăn uống
                    </MenuItem>
                  </Menu>
                  <Button
                    color="inherit"
                    onClick={() => navigate("/my-profile")}
                    sx={{
                      fontWeight: "bold",
                      color: "white",
                      "&:hover": {
                        bgcolor: "rgba(255, 255, 255, 0.1)",
                      },
                    }}
                  >
                    Hồ sơ
                  </Button>
                  <Button
                    color="inherit"
                    onClick={() => navigate("/view-subscriptions")}
                    sx={{
                      fontWeight: "bold",
                      color: "rgba(255, 255, 255, 1)",
                      backgroundColor: "rgba(255, 174, 0, 1)",
                      "&:hover": {
                        bgcolor: "rgba(252, 255, 85, 1)",
                      },
                    }}
                  >
                    Nâng cấp tài khoản
                  </Button>
                  <Button
                    color="inherit"
                    onClick={handleLogout}
                    sx={{
                      fontWeight: "bold",
                      color: "white",
                      "&:hover": {
                        bgcolor: "rgba(255, 255, 255, 0.1)",
                      },
                    }}
                  >
                    Đăng xuất
                  </Button>
                </>
              )}
            </>
          ) : (
            <>
              <Button
                color="inherit"
                onClick={() => navigate("/login")}
                sx={{
                  fontWeight: "bold",
                  color: "white",
                  "&:hover": {
                    bgcolor: "rgba(255, 255, 255, 0.1)",
                  },
                }}
              >
                Đăng nhập
              </Button>
              <Button
                variant="contained"
                onClick={() => navigate("/register")}
                sx={{
                  fontWeight: "bold",
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
