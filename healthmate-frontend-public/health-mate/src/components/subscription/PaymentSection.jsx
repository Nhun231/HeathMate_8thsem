import React from "react";
import { Box, Typography, Divider, CircularProgress } from "@mui/material";

const PaymentSection = ({ order, qrUrl }) => {
  if (!order) return null;

  const receiverName = import.meta.env.VITE_RECEIVER_NAME;
  const receiverAccount = import.meta.env.VITE_RECEIVER_ACCOUNT;
  const receiverBank = import.meta.env.VITE_RECEIVER_BANK;

  return (
    <Box
      sx={{
        backgroundColor: "#fff",
        borderRadius: 3,
        boxShadow: 3,
        p: 4,
        maxWidth: 500,
        mx: "auto",
        mt: 4,
        textAlign: "center",
      }}
    >
      <Typography variant="h5" fontWeight={700} color="success.main" mb={2}>
        Thanh toán chuyển khoản
      </Typography>

      <Divider sx={{ my: 2 }} />

      <Box sx={{ textAlign: "left", mb: 3 }}>
        <Typography>
          <strong>Người nhận:</strong> {receiverName}
        </Typography>
        <Typography>
          <strong>Số tài khoản:</strong> {receiverAccount}
        </Typography>
        <Typography>
          <strong>Ngân hàng:</strong> {receiverBank}
        </Typography>
        <Typography>
          <strong>Số tiền:</strong> {order.subscription.price.toLocaleString()}{" "}
          VND
        </Typography>
        <Typography>
          <strong>Nội dung:</strong> HM{order._id}
        </Typography>
      </Box>

      {qrUrl ? (
        <Box>
          <img
            src={qrUrl}
            alt="QR Code"
            style={{
              width: 220,
              height: 220,
              borderRadius: 12,
              border: "1px solid #ccc",
            }}
          />
        </Box>
      ) : (
        <Typography color="error">Không thể tạo mã QR</Typography>
      )}

      <Typography variant="body2" sx={{ color: "text.secondary", mt: 2 }}>
        Vui lòng quét mã hoặc chuyển khoản chính xác nội dung để hệ thống tự
        động kích hoạt gói của bạn.
      </Typography>
    </Box>
  );
};

export default PaymentSection;
