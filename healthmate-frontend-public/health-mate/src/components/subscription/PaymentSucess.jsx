import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { getOrder } from "../../services/SubscriptionService";
import {
  Box,
  Typography,
  CircularProgress,
  Button,
  Card,
  CardContent,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const orderId = searchParams.get("orderId");

  const [loading, setLoading] = useState(true);
  const [orderData, setOrderData] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!orderId) {
      setError(true);
      setLoading(false);
      return;
    }

    const fetchOrderDetails = async () => {
      try {
        const res = await getOrder(orderId);

        if (res.status === "SUCCESS") {
          setOrderData(res);
        } else {
          setError(true);
        }
      } catch (err) {
        console.error("Error fetching order:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderId, navigate]);

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          bgcolor: "#f4fbea",
        }}
      >
        <CircularProgress color="success" size={50} />
      </Box>
    );
  }

  if (error || !orderData) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          bgcolor: "#f4fbea",
          px: 2,
        }}
      >
        <Card
          sx={{
            maxWidth: 500,
            borderRadius: 4,
            boxShadow: 3,
            textAlign: "center",
          }}
        >
          <CardContent sx={{ p: 5 }}>
            <ErrorOutlineIcon sx={{ fontSize: 80, color: "#f44336", mb: 2 }} />
            <Typography
              variant="h5"
              sx={{ fontWeight: 700, color: "#d32f2f", mb: 2 }}
            >
              Không tìm thấy đơn hàng
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Không thể xác nhận thông tin thanh toán. Vui lòng kiểm tra lại
              hoặc liên hệ hỗ trợ nếu bạn đã thanh toán.
            </Typography>
            <Button
              variant="contained"
              onClick={() => navigate("/view-subscriptions")}
              sx={{
                bgcolor: "#2E7D32",
                "&:hover": { bgcolor: "#1B5E20" },
                borderRadius: 2,
                px: 4,
                py: 1.2,
                fontWeight: 600,
              }}
            >
              Quay lại trang gói dịch vụ
            </Button>
          </CardContent>
        </Card>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        bgcolor: "#f4fbea",
        px: 2,
      }}
    >
      <Card
        sx={{
          maxWidth: 550,
          borderRadius: 4,
          boxShadow: 6,
          textAlign: "center",
          border: "2px solid #4CAF50",
        }}
      >
        <CardContent sx={{ p: 5 }}>
          <CheckCircleIcon sx={{ fontSize: 100, color: "#4CAF50", mb: 2 }} />
          <Typography
            variant="h4"
            sx={{ fontWeight: 700, color: "#2E7D32", mb: 2 }}
          >
            Thanh toán thành công! 🎉
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Cảm ơn bạn đã nâng cấp lên gói <strong>Chuyên Sâu</strong>. Tài
            khoản của bạn đã được kích hoạt.
          </Typography>

          <Box
            sx={{
              bgcolor: "#e8f5e9",
              borderRadius: 2,
              p: 2.5,
              mb: 3,
              textAlign: "left",
            }}
          >
            <Typography
              variant="subtitle2"
              sx={{ fontWeight: 600, color: "#1B5E20", mb: 1.5 }}
            >
              Thông tin gói đã mua:
            </Typography>
            <Box
              sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}
            >
              <Typography variant="body2" color="text.secondary">
                Gói dịch vụ:
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {orderData.subscription.name}
              </Typography>
            </Box>
            <Box
              sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}
            >
              <Typography variant="body2" color="text.secondary">
                Thời hạn:
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {orderData.subscription.durationDays} ngày
              </Typography>
            </Box>
            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Typography variant="body2" color="text.secondary">
                Số tiền:
              </Typography>
              <Typography
                variant="body2"
                sx={{ fontWeight: 700, color: "#2E7D32" }}
              >
                {orderData.subscription.price.toLocaleString("vi-VN")} đ
              </Typography>
            </Box>
          </Box>

          <Button
            fullWidth
            variant="contained"
            onClick={() => navigate("/customer-homepage")}
            sx={{
              bgcolor: "#2E7D32",
              "&:hover": { bgcolor: "#1B5E20" },
              borderRadius: 2,
              py: 1.3,
              fontWeight: 600,
            }}
          >
            Về trang chủ ngay
          </Button>
        </CardContent>
      </Card>
    </Box>
  );
}
