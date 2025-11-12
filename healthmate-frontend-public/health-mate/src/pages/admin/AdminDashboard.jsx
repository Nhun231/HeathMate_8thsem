import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Paper,
  Tabs,
  Tab,
  CircularProgress,
  Divider
} from '@mui/material';
import {
  AdminPanelSettings,
  Restaurant,
  AccountBalance,
  Dashboard as DashboardIcon,
  People,
  Assessment,
  Lock,
  MenuBook,
  CreditCard,
  Article,
} from "@mui/icons-material";
import { listCustomAndPublicIngredients } from "../../services/Ingredient.js";
import { listDishes } from "../../services/Dish.js";
import IngredientManagement from "../../components/admin/IngredientManagement.jsx";
import DishManagement from "../../components/admin/DishManagement.jsx";
import PermissionManagement from "../../components/admin/PermissionManagement.jsx";
import UserManagement from "../../components/admin/UserManagement.jsx";
import { getUserStats } from "../../services/AdminService.js";
import ExpertCertificateManagement from "../../components/admin/ExpertCertificateManagement.jsx";
import PaymentManagement from "../../components/admin/PaymentManagement.jsx";
import SubcriptionManagement from "../../components/admin/SubcriptionManagement.jsx";
import PostManagement from "../../components/admin/PostManagement.jsx";
import {getAllPayments} from "../../services/PaymentService.js";

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [quickStats, setQuickStats] = useState({
    totalIngredients: 0,
    totalDishes: 0,
    totalUsers: 0,
    pendingTransactions: 0,
  });
  const [loading, setLoading] = useState(true);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  useEffect(() => {
    fetchQuickStats();
  }, []);

  const fetchQuickStats = async () => {
    try {
      setLoading(true);

      const [ingredientsResponse, dishesResponse, userStatsResponse, transactionStatsResponse] =
        await Promise.all([
          listCustomAndPublicIngredients({ limit: 1000 }),
          listDishes({ limit: 1000 }),
          getUserStats(),
          getAllPayments() ,
        ]);

      setQuickStats({
        totalIngredients: ingredientsResponse.items?.length || 0,
        totalDishes: dishesResponse.total || 0,
        totalUsers: userStatsResponse.data?.totalUsers || 0,
          pendingTransactions: transactionStatsResponse.total || 0,
      });
    } catch (error) {
      console.error("Error fetching quick stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const tabContent = [
    {
      label: "Quản lý nguyên liệu",
      icon: <Restaurant />,
      component: <IngredientManagement />,
    },
      {
          label: 'Quản lý món ăn',
          icon: <MenuBook />,
          component: <DishManagement />,
      },
    {
      label: "Quản lý quyền",
      icon: <Lock />,
      component: <PermissionManagement />,
    },
    {
      label: "Quản lý giao dịch",
      icon: <AccountBalance />,
      component: <PaymentManagement />,
    },
    {
      label: "Quản lý người dùng",
      icon: <People />,
      component: <UserManagement />,
    },
    {
      label: "Quản lý chứng chỉ chuyên gia",
      icon: <Assessment />,
      component: <ExpertCertificateManagement />,
    },
    {
      label: "Quản lý các gói khuyến mãi ",
      icon: <CreditCard />,
      component: <SubcriptionManagement />,
    },
    {
      label: "Quản lý bài viết",
      icon: <Article />,
      component: <PostManagement />,
    },
  ];

  return (
    <Box sx={{ minHeight: "100vh", backgroundColor: "#fafafa" }}>
      <Container maxWidth="xl" sx={{ py: 5 }}>
        {/* Header */}
        <Box sx={{ mb: 5, textAlign: "center" }}>
          <Typography
            variant="h4"
            component="h1"
            gutterBottom
            sx={{ color: "#2E7D32", fontWeight: "bold" }}
          >
            <AdminPanelSettings sx={{ mr: 1, verticalAlign: "middle" }} />
            Bảng điều khiển Admin
          </Typography>
          <Typography variant="body1" sx={{ color: "#666" }}>
            Quản lý hệ thống HealthMate - Nguyên liệu, quyền, giao dịch và người
            dùng
          </Typography>
          <Divider sx={{ my: 3, borderColor: "#C8E6C9" }} />
        </Box>

        {/* Quick Stats Cards */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            mb: 5,
          }}
        >
          <Grid
            container
            spacing={3}
            justifyContent="center"
            sx={{ maxWidth: "1200px" }}
          >
            {/* Nguyên liệu */}
            <Grid item xs={12} sm={6} md={3}>
              <Card
                sx={{
                  backgroundColor: "#E8F5E9",
                  border: "2px solid #4CAF50",
                  borderRadius: 3,
                  boxShadow: 2,
                  transition: "all 0.25s ease",
                  "&:hover": { transform: "translateY(-5px)", boxShadow: 4 },
                }}
              >
                <CardContent>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      mb: 1,
                    }}
                  >
                    <Typography
                      variant="h6"
                      sx={{ fontWeight: 'bold', color: '#2E7D32' }}
                    >
                      Nguyên liệu
                    </Typography>
                    <Restaurant sx={{ fontSize: 36, color: "#2E7D32" }} />
                  </Box>
                  <Typography
                    variant="h4"
                    sx={{ color: "#2E7D32", fontWeight: "bold" }}
                  >
                    {loading ? (
                      <CircularProgress size={24} />
                    ) : (
                      quickStats.totalIngredients
                    )}
                  </Typography>
                  <Typography variant="body2" sx={{ color: "#666" }}>
                    Tổng số nguyên liệu
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card
                sx={{
                  backgroundColor: '#E1F5FE',
                  border: '2px solid #00BCD4',
                  borderRadius: 3,
                  boxShadow: 2,
                  transition: 'all 0.25s ease',
                  '&:hover': { transform: 'translateY(-5px)', boxShadow: 4 },
                }}
              >
                <CardContent>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      mb: 1,
                    }}
                  >
                    <Typography
                      variant="h6"
                      sx={{ fontWeight: 'bold', color: '#0097A7' }}
                    >
                      Món ăn
                    </Typography>
                    <MenuBook sx={{ fontSize: 36, color: '#0097A7' }} />
                  </Box>
                  <Typography
                    variant="h4"
                    sx={{ color: '#0097A7', fontWeight: 'bold' }}
                  >
                    {loading ? (
                      <CircularProgress size={24} />
                    ) : (
                      quickStats.totalDishes
                    )}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#666' }}>
                    Tổng số món ăn
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* Giao dịch */}
            <Grid item xs={12} sm={6} md={3}>
              <Card
                sx={{
                  backgroundColor: "#E3F2FD",
                  border: "2px solid #2196F3",
                  borderRadius: 3,
                  boxShadow: 2,
                  transition: "all 0.25s ease",
                  "&:hover": { transform: "translateY(-5px)", boxShadow: 4 },
                }}
              >
                <CardContent>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      mb: 1,
                    }}
                  >
                    <Typography
                      variant="h6"
                      sx={{ fontWeight: "bold", color: "#1976D2" }}
                    >
                      Giao dịch
                    </Typography>
                    <AccountBalance
                      sx={{ fontSize: 36, color: "#1976D2" }}
                    />
                  </Box>
                  <Typography
                    variant="h4"
                    sx={{ color: "#1976D2", fontWeight: "bold" }}
                  >
                    {loading ? (
                      <CircularProgress size={24} />
                    ) : (
                       quickStats.pendingTransactions
                    )}
                  </Typography>
                  <Typography variant="body2" sx={{ color: "#666" }}>
                    Giao dịch chờ xử lý
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* Người dùng */}
            <Grid item xs={12} sm={6} md={3}>
              <Card
                sx={{
                  backgroundColor: "#FFF3E0",
                  border: "2px solid #FF9800",
                  borderRadius: 3,
                  boxShadow: 2,
                  transition: "all 0.25s ease",
                  "&:hover": { transform: "translateY(-5px)", boxShadow: 4 },
                }}
              >
                <CardContent>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      mb: 1,
                    }}
                  >
                    <Typography
                      variant="h6"
                      sx={{ fontWeight: "bold", color: "#F57C00" }}
                    >
                      Người dùng
                    </Typography>
                    <People sx={{ fontSize: 36, color: "#F57C00" }} />
                  </Box>
                  <Typography
                    variant="h4"
                    sx={{ color: "#F57C00", fontWeight: "bold" }}
                  >
                    {loading ? (
                      <CircularProgress size={24} />
                    ) : (
                      quickStats.totalUsers
                    )}
                  </Typography>
                  <Typography variant="body2" sx={{ color: "#666" }}>
                    Tổng số người dùng
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>

        {/* Tabs */}
        <Paper
          sx={{
            width: "100%",
            borderRadius: 3,
            boxShadow: 3,
          }}
        >
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              borderBottom: 1,
              borderColor: "divider",
              "& .MuiTab-root": {
                minHeight: 60,
                textTransform: "none",
                fontSize: "1rem",
                fontWeight: "bold",
              },
            }}
          >
            {tabContent.map((tab, index) => (
              <Tab
                key={index}
                icon={tab.icon}
                label={tab.label}
                iconPosition="start"
                sx={{
                  color: activeTab === index ? "#2E7D32" : "#666",
                  "&.Mui-selected": {
                    color: "#2E7D32",
                    backgroundColor: "#E8F5E9",
                    borderRadius: 2,
                  },
                }}
              />
            ))}
          </Tabs>

          <Box sx={{ p: 4 }}>
            {tabContent[activeTab].component}
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default AdminDashboard;
