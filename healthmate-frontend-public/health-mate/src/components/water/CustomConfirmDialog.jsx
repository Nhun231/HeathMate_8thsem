// src/components/common/CustomConfirmDialog.jsx
import React from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography } from "@mui/material";

const CustomConfirmDialog = ({
  open,
  title = "Xác nhận",
  message = "",
  icon = null,
  confirmText = "OK",
  cancelText = "Huỷ",
  onConfirm,
  onCancel,
}) => {
  return (
    <Dialog open={open} onClose={onCancel}>
      {title && <DialogTitle>{title}</DialogTitle>}
      <DialogContent style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
        {icon && <span>{icon}</span>}
        <Typography>{message}</Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel}>{cancelText}</Button>
        <Button onClick={onConfirm} variant="contained" color="primary">
          {confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CustomConfirmDialog;
