import React, { useEffect, useRef, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  CircularProgress,
  ToggleButton,
  ToggleButtonGroup,
  Chip,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import {
  listSubscriptions,
  createOrder,
  generateQRCode,
  getOrder,
} from "../../services/SubscriptionService";
import PaymentSection from "./PaymentSection";
import { useNavigate } from "react-router-dom";

const ViewSubscriptions = () => {
  const navigate = useNavigate();
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSub, setSelectedSub] = useState(null);
  const [order, setOrder] = useState(null);
  const [qrUrl, setQrUrl] = useState(null);
  const [creatingOrder, setCreatingOrder] = useState(false);
  const [checkingPayment, setCheckingPayment] = useState(false);

  const pollingIntervalRef = useRef(null);

  const getDiscountLabel = (pkg) => {
    if (pkg.durationDays === 90) return "Giảm 10%";
    if (pkg.durationDays === 180) return "Giảm 15%";
    return null;
  };

  useEffect(() => {
    const fetchSubscriptions = async () => {
      try {
        const res = await listSubscriptions();
        const data = Array.isArray(res.data) ? res.data : [];
        const advPkgs = data
          .filter((pkg) => pkg.type === "ADVANCED")
          .sort((a, b) => a.durationDays - b.durationDays);
        setSubscriptions(advPkgs);
        if (advPkgs.length > 0) setSelectedSub(advPkgs[0]);
      } catch (err) {
        console.error("Lỗi khi lấy gói:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSubscriptions();
  }, []);

  useEffect(() => {
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, []);

  const startPaymentPolling = (orderId) => {
    setCheckingPayment(true);

    const checkPaymentStatus = async () => {
      try {
        const orderData = await getOrder(orderId);

        if (orderData.status === "SUCCESS") {
          if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
            pollingIntervalRef.current = null;
          }

          navigate(`/payment-success?orderId=${orderId}`);
        }
      } catch (err) {
        console.error("Lỗi khi kiểm tra trạng thái thanh toán:", err);
      }
    };

    pollingIntervalRef.current = setInterval(checkPaymentStatus, 3000);

    checkPaymentStatus();
  };

  const handleUpgrade = async () => {
    if (!selectedSub) return;
    try {
      setCreatingOrder(true);
      const orderRes = await createOrder(selectedSub._id);
      setOrder(orderRes);

      const qrRes = await generateQRCode({
        amount: orderRes.subscription.price,
        orderId: orderRes._id,
      });

      setQrUrl(qrRes.url);

      startPaymentPolling(orderRes._id);
    } catch (err) {
      console.error("Lỗi khi nâng cấp:", err);
      alert("Đã xảy ra lỗi khi tạo đơn hàng!");
    } finally {
      setCreatingOrder(false);
    }
  };

  const handleCancelPayment = () => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }

    setOrder(null);
    setQrUrl(null);
    setCheckingPayment(false);
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}>
        <CircularProgress color="success" />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        backgroundColor: "#f4fbea",
        py: 8,
        px: { xs: 2, sm: 6 },
        minHeight: "100vh",
      }}
    >
      <Box textAlign="center" sx={{ mb: 6 }}>
        <Typography
          variant="h4"
          sx={{ fontWeight: 700, color: "#1B5E20", mb: 1 }}
        >
          Gói Dịch Vụ Healthmate
        </Typography>
        <Typography variant="body1" sx={{ color: "text.secondary" }}>
          Chọn gói phù hợp với nhu cầu của bạn — từ cơ bản đến chuyên sâu.
        </Typography>
      </Box>

      <Grid container spacing={4} justifyContent="center">
        {/* GÓI MIỄN PHÍ */}
        <Grid item xs={12} sm={6} md={4}>
          <Card
            sx={{
              borderRadius: 4,
              boxShadow: 3,
              bgcolor: "#fff",
              height: "100%",
              transition: "0.3s",
              "&:hover": { boxShadow: 6, transform: "translateY(-5px)" },
            }}
          >
            <CardContent>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  color: "#1B5E20",
                  mb: 1,
                  textAlign: "center",
                }}
              >
                Gói Miễn Phí
              </Typography>
              <Typography
                variant="h5"
                sx={{ color: "#2E7D32", fontWeight: 700, textAlign: "center" }}
              >
                0 đ / vĩnh viễn
              </Typography>
              <Typography
                variant="body2"
                sx={{ textAlign: "center", mt: 1, color: "text.secondary" }}
              >
                Làm quen với hệ thống, phù hợp cho người mới bắt đầu.
              </Typography>

              <Divider sx={{ my: 2 }} />
              <Typography sx={{ fontWeight: 600, mb: 1 }}>
                Tính năng:
              </Typography>
              <List dense>
                {[
                  "Giới hạn nguyên liệu (tối đa 50)",
                  "Không có Chat AI",
                  "Không có tư vấn chuyên gia",
                ].map((item, i) => (
                  <ListItem key={i} disablePadding>
                    <ListItemIcon>
                      <CheckCircleIcon color="success" fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary={item} />
                  </ListItem>
                ))}
              </List>
              <Button
                fullWidth
                variant="outlined"
                sx={{
                  mt: 3,
                  borderColor: "#2E7D32",
                  color: "#2E7D32",
                  borderRadius: 2,
                  fontWeight: 600,
                }}
              >
                Đang sử dụng
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* GÓI NÂNG CAO */}
        {subscriptions.length > 0 && selectedSub && (
          <Grid item xs={12} sm={6} md={4}>
            <Card
              sx={{
                borderRadius: 4,
                boxShadow: 6,
                bgcolor: "#fff",
                height: "100%",
                position: "relative",
                border: "2px solid #4CAF50",
                transform: "scale(1.02)",
                transition: "0.3s",
                "&:hover": {
                  boxShadow: "0 6px 16px rgba(76, 175, 80, 0.3)",
                  transform: "scale(1.05)",
                },
              }}
            >
              {getDiscountLabel(selectedSub) && (
                <Chip
                  label={getDiscountLabel(selectedSub)}
                  color="error"
                  sx={{
                    position: "absolute",
                    top: 1,
                    right: 2,
                    fontWeight: 700,
                  }}
                />
              )}
              <CardContent>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 700,
                    color: "#1B5E20",
                    mb: 1,
                    textAlign: "center",
                  }}
                >
                  Gói Chuyên Sâu
                </Typography>

                <Typography
                  variant="h5"
                  sx={{
                    color: "#2E7D32",
                    fontWeight: 700,
                    textAlign: "center",
                    mb: 0.5,
                  }}
                >
                  {selectedSub.price.toLocaleString("vi-VN")} đ /{" "}
                  {selectedSub.durationDays / 30} tháng
                </Typography>

                <Typography
                  variant="body2"
                  sx={{
                    textAlign: "center",
                    mt: 1,
                    mb: 2,
                    color: "text.secondary",
                  }}
                >
                  Hỗ trợ chuyên sâu cùng chuyên gia và AI thông minh.
                </Typography>

                <Divider sx={{ my: 2 }} />
                <Typography sx={{ fontWeight: 600, mb: 1 }}>
                  Tính năng nổi bật:
                </Typography>
                <List dense>
                  {[
                    "Không giới hạn nguyên liệu",
                    "Chat AI thông minh",
                    "Tư vấn chuyên sâu cùng chuyên gia",
                    "Gợi ý món ăn & công thức tự động",
                  ].map((item, i) => (
                    <ListItem key={i} disablePadding>
                      <ListItemIcon>
                        <CheckCircleIcon color="success" fontSize="small" />
                      </ListItemIcon>
                      <ListItemText primary={item} />
                    </ListItem>
                  ))}
                </List>

                <Divider sx={{ my: 2 }} />
                <Typography sx={{ fontWeight: 600, mb: 1 }}>
                  Thời hạn gói:
                </Typography>
                <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
                  <ToggleButtonGroup
                    color="success"
                    value={selectedSub._id}
                    exclusive
                    onChange={(e, id) => {
                      const found = subscriptions.find((pkg) => pkg._id === id);
                      if (found) setSelectedSub(found);
                    }}
                  >
                    {subscriptions.map((pkg) => (
                      <ToggleButton key={pkg._id} value={pkg._id}>
                        {pkg.durationDays / 30} tháng
                      </ToggleButton>
                    ))}
                  </ToggleButtonGroup>
                </Box>

                <Button
                  fullWidth
                  variant="contained"
                  sx={{
                    borderRadius: 2,
                    py: 1.2,
                    bgcolor: "#2E7D32",
                    "&:hover": { bgcolor: "#1B5E20" },
                    fontWeight: 600,
                  }}
                  onClick={handleUpgrade}
                  disabled={creatingOrder}
                >
                  {creatingOrder ? "Đang tạo đơn..." : "Nâng cấp ngay"}
                </Button>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>

      {order && qrUrl && (
        <Box>
          <PaymentSection order={order} qrUrl={qrUrl} />

          {/* Payment status indicator */}
          {checkingPayment && (
            <Box
              sx={{
                backgroundColor: "#fff3cd",
                borderRadius: 2,
                p: 3,
                maxWidth: 500,
                mx: "auto",
                mt: 3,
                textAlign: "center",
                border: "1px solid #ffc107",
              }}
            >
              <CircularProgress size={24} sx={{ mb: 2 }} />
              <Typography variant="body1" sx={{ fontWeight: 600, mb: 1 }}>
                Đang chờ xác nhận thanh toán...
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Hệ thống đang tự động kiểm tra thanh toán của bạn. Vui lòng
                không đóng trang này.
              </Typography>
              <Button
                variant="outlined"
                color="warning"
                onClick={handleCancelPayment}
                sx={{ mt: 1 }}
              >
                Hủy và quay lại
              </Button>
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
};

export default ViewSubscriptions;
