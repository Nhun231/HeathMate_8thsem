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
} from "@mui/icons-material";
import { listCustomAndPublicIngredients } from "../../services/Ingredient.js";
import IngredientManagement from "../../components/admin/IngredientManagement.jsx";
import PermissionManagement from "../../components/admin/PermissionManagement.jsx";
// import IngredientManagement from '../components/admin/IngredientManagement';
// import TransactionManagement from '../components/admin/TransactionManagement';
import UserManagement from "../../components/admin/UserManagement.jsx";
// import AdminStats from '../components/admin/AdminStats';
// import { ingredientService } from '../services/ingredientService';
// import { userService } from '../services/userService';
// import { coinTransactionService } from '../services/coinTransactionService';
import { getUserStats } from "../../services/AdminService.js";

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [quickStats, setQuickStats] = useState({
    totalIngredients: 0,
    totalUsers: 0,
    pendingTransactions: 0,
    totalCoinsDistributed: 0
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

      const [ingredientsResponse, userStatsResponse, transactionStatsResponse] =
        await Promise.all([
          listCustomAndPublicIngredients(),
            getUserStats(),
          // coinTransactionService.getTransactionStats()
        ]);

      setQuickStats({
        totalIngredients: ingredientsResponse.data?.length || 0,
        totalUsers: userStatsResponse.data?.totalUsers || 0,
        // pendingTransactions:
        //   transactionStatsResponse.data?.stats?.find((s) => s._id === "pending")
        //     ?.count || 0,
        // totalCoinsDistributed:
        //   transactionStatsResponse.data?.totalCoinsDistributed || 0,
      });
    } catch (error) {
      console.error('Error fetching quick stats:', error);
      // Keep default values (0) on error
    } finally {
      setLoading(false);
    }
  };

  const tabContent = [
    {
      label: 'Tổng quan',
      icon: <DashboardIcon />,
     // component: <AdminStats />
    },
    {
      label: 'Quản lý nguyên liệu',
      icon: <Restaurant />,
      component: <IngredientManagement />,
    },
    {
      label: "Quản lý Quyền",
      icon: <Lock />,
      component: <PermissionManagement />,
    },
    {
      label: 'Giao dịch xu',
      icon: <AccountBalance />,
     // component: <TransactionManagement />
    },
    {
      label: "Quản lý người dùng",
      icon: <People />,
      component: <UserManagement />
    }
  ];

  return (
    <Box sx={{ minHeight: "100vh", backgroundColor: "#f5f5f5" }}>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Header */}
        <Box sx={{ mb: 5, textAlign: 'center' }}>
          <Typography
            variant="h4"
            component="h1"
            gutterBottom
            sx={{ color: '#2E7D32', fontWeight: 'bold' }}
          >
            <AdminPanelSettings sx={{ mr: 1, verticalAlign: 'middle' }} />
            Bảng điều khiển Admin
          </Typography>
          <Typography variant="body1" sx={{ color: '#666' }}>
            Quản lý hệ thống HealthMate - Nguyên liệu, giao dịch và người dùng
          </Typography>
          <Divider sx={{ my: 3, borderColor: '#C8E6C9' }} />
        </Box>

        {/* Quick Stats Cards */}
        {/* Quick Stats Cards */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            mb: 5,
          }}
        >
          <Grid
            container
            spacing={3}
            justifyContent="center"
            alignItems="stretch"
            sx={{
              maxWidth: '1200px',
            }}
          >
            <Grid item xs={12} sm={6} md={3}>
              <Card
                sx={{
                  backgroundColor: '#E8F5E9',
                  border: '2px solid #4CAF50',
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
                      sx={{ fontWeight: 'bold', color: '#2E7D32' }}
                    >
                      Nguyên liệu
                    </Typography>
                    <Restaurant sx={{ fontSize: 36, color: '#2E7D32' }} />
                  </Box>
                  <Typography
                    variant="h4"
                    sx={{ color: '#2E7D32', fontWeight: 'bold' }}
                  >
                    {loading ? (
                      <CircularProgress size={24} />
                    ) : (
                      quickStats.totalIngredients
                    )}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#666' }}>
                    Tổng số nguyên liệu
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card
                sx={{
                  backgroundColor: '#E3F2FD',
                  border: '2px solid #2196F3',
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
                      sx={{ fontWeight: 'bold', color: '#1976D2' }}
                    >
                      Giao dịch
                    </Typography>
                    <AccountBalance sx={{ fontSize: 36, color: '#1976D2' }} />
                  </Box>
                  <Typography
                    variant="h4"
                    sx={{ color: '#1976D2', fontWeight: 'bold' }}
                  >
                    {loading ? (
                      <CircularProgress size={24} />
                    ) : (
                      // quickStats.pendingTransactions
                        0
                    )}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#666' }}>
                    Giao dịch chờ xử lý
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card
                sx={{
                  backgroundColor: '#FFF3E0',
                  border: '2px solid #FF9800',
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
                      sx={{ fontWeight: 'bold', color: '#F57C00' }}
                    >
                      Người dùng
                    </Typography>
                    <People sx={{ fontSize: 36, color: '#F57C00' }} />
                  </Box>
                  <Typography
                    variant="h4"
                    sx={{ color: '#F57C00', fontWeight: 'bold' }}
                  >
                    {loading ? <CircularProgress size={24} /> : quickStats.totalUsers}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#666' }}>
                    Tổng số người dùng
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card
                sx={{
                  backgroundColor: '#F3E5F5',
                  border: '2px solid #9C27B0',
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
                      sx={{ fontWeight: 'bold', color: '#7B1FA2' }}
                    >
                      Doanh thu
                    </Typography>
                    <Assessment sx={{ fontSize: 36, color: '#7B1FA2' }} />
                  </Box>
                  <Typography
                    variant="h4"
                    sx={{ color: '#7B1FA2', fontWeight: 'bold' }}
                  >
                    {loading ? (
                      <CircularProgress size={24} />
                    ) : (
                     // quickStats.totalCoinsDistributed.toLocaleString('vi-VN')
                        0
                    )}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#666' }}>
                    Xu đã phân phối
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>

        {/* Main Content with Tabs */}
        <Paper
          sx={{
            width: '100%',
            borderRadius: 3,
            overflow: 'hidden',
            boxShadow: 3
          }}
        >
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              borderBottom: 1,
              borderColor: 'divider',
              '& .MuiTab-root': {
                minHeight: 60,
                textTransform: 'none',
                fontSize: '1rem',
                fontWeight: 'bold'
              }
            }}
          >
            {tabContent.map((tab, index) => (
              <Tab
                key={index}
                icon={tab.icon}
                label={tab.label}
                iconPosition="start"
                sx={{
                  color: activeTab === index ? '#2E7D32' : '#666',
                  '&.Mui-selected': {
                    color: '#2E7D32',
                    backgroundColor: '#E8F5E9',
                    borderRadius: 2
                  }
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
