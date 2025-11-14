// src/pages/water/WaterTrackingPage.jsx //tach lai component sau
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Box,
  Grid,
  Button,
  IconButton,
  TextField,
  LinearProgress,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Alert,
  Link,
} from "@mui/material";

import WaterDropIcon from "@mui/icons-material/WaterDrop";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import HistoryIcon from "@mui/icons-material/History";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import TodayIcon from "@mui/icons-material/Today";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import LocalDrinkIcon from "@mui/icons-material/LocalDrink";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import viLocale from "date-fns/locale/vi";
import {
  subDays,
  differenceInCalendarDays,
  parse,
  differenceInMinutes,
  differenceInHours,
} from "date-fns";

import {
  addWaterIntake,
  getWaterData,
  deleteWaterHistory,
  updateWaterHistory,
} from "../../services/WaterService";

import CustomAlert from "../../components/common/Alert.jsx";
import Confetti from "react-confetti";

// helper convert Date -> yyyy-mm-dd
const toIsoDate = (date) => {
  if (!date) return null;
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

const todayIso = toIsoDate(new Date());
const CONFETTI_LOCALSTORAGE_PREFIX = "water_confetti_shown_"; // + yyyy-mm-dd

// Custom reusable confirm dialog component
const CustomConfirmDialog = ({
  open,
  title,
  message,
  icon,
  onCancel,
  onConfirm,
  confirmText = "Tiếp tục",
  cancelText = "Huỷ",
}) => {
  return (
    <Dialog open={open} onClose={onCancel} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        {icon}
        <Typography variant="h6">{title}</Typography>
      </DialogTitle>
      <DialogContent>
        <Typography variant="body2">{message}</Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel}>{cancelText}</Button>
        <Button variant="contained" onClick={onConfirm}>
          {confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const WaterTrackingPage = () => {
  // date state
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(todayIso); // yyyy-mm-dd

  // water data for that date
  const [waterData, setWaterData] = useState(null);
  const [loading, setLoading] = useState(false);

  // add form
  const [newIntake, setNewIntake] = useState("");
  const quickAddOptions = [100, 150, 200, 250];

  // alert (CustomAlert) usage via setAlert pattern
  const [alert, setAlert] = useState({
    show: false,
    message: "",
    variant: "info",
  });

  // inline edit state: id of editing entry and value
  const [editingId, setEditingId] = useState(null);
  const [editingAmount, setEditingAmount] = useState("");

  // confirm dialog state (general purpose)
  const [confirmOpen, setConfirmOpen] = useState(false);
  const confirmRef = useRef({
    title: "",
    message: "",
    icon: null,
    onConfirm: null,
    onCancel: null,
    confirmText: "Tiếp tục",
    cancelText: "Huỷ",
  });

  // confetti state
  const [showConfetti, setShowConfetti] = useState(false);
  const [confettiShownToday, setConfettiShownToday] = useState(false);

  // load data
  const reloadDate = async (iso = selectedDate) => {
    setLoading(true);
    try {
      // assumes getWaterData(date) returns { data: { ... } }
      const resp = await getWaterData(iso);
      setWaterData(resp.data);
    } catch (err) {
      console.error(err);
      setAlert({
        show: true,
        message: err?.response?.data?.message || "Có lỗi khi lấy dữ liệu",
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    reloadDate(selectedDate);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate]);

  // confetti persistence: check localStorage for today
  useEffect(() => {
    const key = CONFETTI_LOCALSTORAGE_PREFIX + todayIso;
    const shown = localStorage.getItem(key);
    if (shown === "true") {
      setConfettiShownToday(true);
    } else {
      setConfettiShownToday(false);
    }
  }, []);

  // show confetti once when reaching target
  useEffect(() => {
    if (!waterData) return;
    const consumed = waterData.consumed ?? waterData.current ?? 0;
    const target = waterData.target ?? waterData.goal ?? 0;
    if (consumed >= target && target > 0 && !confettiShownToday) {
      // show confetti once
      setShowConfetti(true);
      const key = CONFETTI_LOCALSTORAGE_PREFIX + todayIso;
      localStorage.setItem(key, "true");
      setConfettiShownToday(true);
      // auto hide confetti after 3s
      setTimeout(() => setShowConfetti(false), 3000);
    }
  }, [waterData, confettiShownToday]);

  const isViewingToday = useMemo(
    () => selectedDate === todayIso,
    [selectedDate]
  );

  // Helper: parse "HH:mm" time string (24h) into Date object on selectedDate
  const parseTimeOnDate = (timeStr, isoDate) => {
    if (!timeStr) return null;
    // timeStr like "HH:mm"
    const [hh, mm] = timeStr.split(":").map((t) => Number(t));
    const [y, m, d] = isoDate.split("-").map((t) => Number(t));
    return new Date(y, m - 1, d, hh, mm);
  };

  // Get most recent entry for selectedDate
  const getLatestEntry = (data) => {
    if (!data?.history || data.history.length === 0) return null;
    // assume history sorted ascending? To be safe, find max by time
    const sorted = [...data.history].sort((a, b) => (a.time < b.time ? 1 : -1));
    console.log(sorted);
    return sorted[0];
  };

  // general function to open confirm dialog with props
  const openConfirm = ({
    title,
    message,
    icon = null,
    onConfirm,
    onCancel,
    confirmText = "Tiếp tục",
    cancelText = "Huỷ",
  }) => {
    confirmRef.current = {
      title,
      message,
      icon,
      onConfirm,
      onCancel,
      confirmText,
      cancelText,
    };
    setConfirmOpen(true);
  };

  const handleConfirmCancel = () => {
    setConfirmOpen(false);
    confirmRef.current.onCancel && confirmRef.current.onCancel();
  };

  const handleConfirmOk = () => {
    setConfirmOpen(false);
    const onConfirm = confirmRef.current.onConfirm;
    if (onConfirm) {
      setTimeout(() => {
        onConfirm();
      }, 0);
    }
  };

  // Add flow with checks:
  // 1) if amount > 250 -> ask confirm
  // 2) if latest entry today exists and diffMinutes <= 10 -> ask confirm warning
  // We'll chain these checks: if >250 -> on confirm continue to next check; else directly next check.
  const performAdd = async (amount) => {
    try {
      setLoading(true);
      const resp = await addWaterIntake(amount);
      setWaterData(resp.data);
      setNewIntake("");
      setAlert({
        show: true,
        message: "Thêm nước thành công!",
        variant: "success",
      });
    } catch (err) {
      console.error(err);
      setAlert({
        show: true,
        message: err?.response?.data?.message || "Có lỗi khi thêm lượng nước",
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const prepareAdd = (amount) => {
    const amt = Number(amount);
    if (!amt || isNaN(amt) || amt < 10 || amt >1000) {
      setAlert({
        show: true,
        message: "Vui lòng nhập số lượng hợp lệ (tối thiểu 10ml, tối đa 1000ml)",
        variant: "error",
      });
      return;
    }
    if (!isViewingToday) {
      setAlert({
        show: true,
        message: "Chỉ có thể thêm lượng nước cho hôm nay.",
        variant: "error",
      });
      return;
    }

    const latest = getLatestEntry(waterData);
    const now = new Date();

    const afterOverLimit = () => {
      // after confirming >250, then check proximity
      if (latest) {
        const lastDate = parseTimeOnDate(
          latest.time,
          waterData.date || selectedDate
        );
        if (lastDate) {
          const minutesDiff = Math.max(
            0,
            Math.round(differenceInMinutes(now, lastDate))
          );
          if (minutesDiff <= 10) {
            // show proximity warning
            openConfirm({
              title: "Cảnh báo gần đây",
              message: `Lần uống này chỉ cách lần trước ${minutesDiff} phút. Bạn có chắc uống thêm không? Uống đều đặn từng chút sẽ tốt hơn.`,
              icon: <WarningAmberIcon color="warning" />,
              confirmText: "Tôi vẫn uống",
              cancelText: "Huỷ",
              onConfirm: () => performAdd(amt),
              onCancel: () => {},
            });
            return;
          }
        }
      }
      // no proximity issue, perform add
      performAdd(amt);
    };

    // check >250
    if (amt > 250) {
      openConfirm({
        title: "Lượng nước lớn",
        message: `Lần uống này là ${amt} ml. Một lần không nên quá 250ml. Bạn có muốn tiếp tục?`,
        icon: <WarningAmberIcon color="warning" />,
        confirmText: "Tiếp tục",
        cancelText: "Huỷ",
        onConfirm: afterOverLimit,
        onCancel: () => {},
      });
      return;
    }

    // not >250, check proximity
    if (latest) {
      const lastDate = parseTimeOnDate(
        latest.time,
        waterData.date || selectedDate
      );
      if (lastDate) {
        const minutesDiff = Math.max(
          0,
          Math.round(differenceInMinutes(now, lastDate))
        );
        if (minutesDiff <= 10) {
          openConfirm({
            title: "Cảnh báo gần đây",
            message: `Lần uống này chỉ cách lần trước ${minutesDiff} phút. Bạn có chắc uống thêm không? Uống đều đặn từng chút sẽ tốt hơn.`,
            icon: <WarningAmberIcon color="warning" />,
            confirmText: "Tôi vẫn uống",
            cancelText: "Huỷ",
            onConfirm: () => performAdd(amt),
            onCancel: () => {},
          });
          return;
        }
      }
    }
    // otherwise safe to add
    openConfirm({
      title: "Xác nhận uống nước",
      message: `Bạn sắp ghi nhận ${amt} ml. Xác nhận?`,
      icon: <LocalDrinkIcon color="primary" />,
      confirmText: "Uống",
      cancelText: "Huỷ",
      onConfirm: () => performAdd(amt),
      onCancel: () => {},
    });
  };

  // add handlers
  const handleAdd = async (e) => {
    e?.preventDefault();
    prepareAdd(newIntake);
  };

  const handleQuickAdd = async (amt) => {
    prepareAdd(amt);
  };

  // edit inline open
  const handleStartEdit = (entry) => {
    // check 7-day rule based on day's record date
    const daysDiff = differenceInCalendarDays(
      new Date(),
      new Date(waterData.date)
    );
    if (daysDiff > 6) {
      setAlert({
        show: true,
        message:
          "Bạn chỉ có thể chỉnh sửa hoặc xoá lịch sử trong vòng 7 ngày gần nhất để đảm bảo tính chính xác dữ liệu.",
        variant: "error",
      });
      return;
    }
    setEditingId(entry._id);
    setEditingAmount(String(entry.amount));
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingAmount("");
  };

  const handleSaveEdit = async (entry) => {
    const newAmt = Number(editingAmount);
    if (!newAmt || isNaN(newAmt) || newAmt < 10 || newAmt >1000) {
      setAlert({
        show: true,
        message: "Vui lòng nhập số lượng hợp lệ (tối thiểu 10ml, tối đa 1001ml) ",
        variant: "error",
      });
      return;
    }

    if (newAmt === entry.amount) {
      setAlert({
        show: true,
        message: "Lượng nước cập nhật phải khác ban đầu!",
        variant: "info",
      });
      return;
    }

    // Confirm update with dialog
    openConfirm({
      title: "Xác nhận cập nhật",
      message: `Xác nhận cập nhật từ ${entry.amount} → ${newAmt} ${
        waterData?.unit || "ml"
      }?`,
      icon: <WarningAmberIcon color="warning" />,
      confirmText: "Cập nhật",
      cancelText: "Huỷ",
      onConfirm: async () => {
        try {
          setLoading(true);
          await updateWaterHistory(entry._id, selectedDate, newAmt);
          await reloadDate(selectedDate);
          setAlert({
            show: true,
            message: "Cập nhật thành công",
            variant: "success",
          });
          setEditingId(null);
          setEditingAmount("");
        } catch (err) {
          console.error(err);
          setAlert({
            show: true,
            message: err?.response?.data?.message || "Có lỗi khi cập nhật",
            variant: "error",
          });
        } finally {
          setLoading(false);
        }
      },
      onCancel: () => {},
    });
  };

  const handleDelete = async (entry) => {
    const daysDiff = differenceInCalendarDays(
      new Date(),
      new Date(waterData.date)
    );
    if (daysDiff > 6) {
      setAlert({
        show: true,
        message:
          "Bạn chỉ có thể chỉnh sửa hoặc xoá lịch sử trong vòng 7 ngày gần nhất để đảm bảo tính chính xác dữ liệu.",
        variant: "error",
      });
      return;
    }

    openConfirm({
      title: "Xác nhận xoá",
      message: `Bạn có chắc muốn xoá bản ghi ${entry.time} — ${entry.amount} ${waterData.unit}? Lưu ý: Bạn sẽ không thể khôi phục lại dữ liệu của lần uống nước này sau khi xóa.`,
      icon: <WarningAmberIcon color="warning" />,
      confirmText: "Xoá",
      cancelText: "Huỷ",
      onConfirm: async () => {
        try {
          setLoading(true);
          await deleteWaterHistory(entry._id, selectedDate); // assumes service
          await reloadDate(selectedDate);
          setAlert({
            show: true,
            message: "Xoá thành công",
            variant: "success",
          });
        } catch (err) {
          console.error(err);
          setAlert({
            show: true,
            message: err?.response?.data?.message || "Có lỗi khi xoá",
            variant: "error",
          });
        } finally {
          setLoading(false);
        }
      },
      onCancel: () => {},
    });
  };

  const progressPercentage = useMemo(() => {
    if (!waterData) return 0;
    const consumed = waterData?.consumed ?? waterData?.current ?? 0;
    const target = waterData?.target ?? waterData?.goal ?? 0;
    if (!target || target === 0) return 0;
    const p = Math.min(Math.round((consumed / target) * 100), 100);
    return isNaN(p) ? 0 : p;
  }, [waterData]);

  const remaining = useMemo(() => {
    if (!waterData) return 0;
    const consumed = waterData?.consumed ?? waterData?.current ?? 0;
    const target = waterData?.target ?? waterData?.goal ?? 0;
    return Math.max(target - consumed, 0);
  }, [waterData]);

  // Banner: hours since last drink (use latest entry)
  const hoursSinceLastDrink = useMemo(() => {
    if (!waterData) return null;
    const latest = getLatestEntry(waterData);
    if (!latest) return null;
    const lastDate = parseTimeOnDate(
      latest.time,
      waterData.date || selectedDate
    );
    if (!lastDate) return null;
    const diff = Math.max(
      0,
      Math.round(differenceInHours(new Date(), lastDate))
    );
    return diff;
  }, [waterData, selectedDate]);

  return (
    <div className="container p-4">
      {/* CustomAlert controlled by setAlert */}
      {alert?.show && (
        <CustomAlert
          show={alert.show}
          message={alert.message}
          variant={alert.variant}
          onClose={() => setAlert({ ...alert, show: false })}
        />
      )}
      {/* Confirm dialog */}
      <CustomConfirmDialog
        open={confirmOpen}
        title={confirmRef.current.title}
        message={confirmRef.current.message}
        icon={confirmRef.current.icon}
        confirmText={confirmRef.current.confirmText}
        cancelText={confirmRef.current.cancelText}
        onCancel={handleConfirmCancel}
        onConfirm={handleConfirmOk}
      />
      {/* Confetti */}
      {showConfetti && (
        <Confetti
          width={window.innerWidth}
          height={window.innerHeight}
          recycle={false}
        />
      )}
      {/* Header */}
      <div className="flex flex-col mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold">Theo dõi lượng nước</h1>
          <p className="text-gray-600 mt-1">
            Giám sát lượng nước bạn đã uống mỗi ngày để giữ cơ thể đủ nước
          </p>
        </div>
      </div>
      {/* Top row: Calendar + Progress (with add form) */}
      <div className="flex gap-4">
        {/* Calendar card */}
        <div className="my-card" style={{ flex: 1, maxHeight: "500px" }}>
          <div className="my-card-header">
            <div className="my-card-title">
              <span className="icon">
                <TodayIcon fontSize="small" />
              </span>
              <span style={{ marginLeft: 8 }}>Chọn ngày</span>
            </div>
          </div>
          <div className="card-content" > 
            <LocalizationProvider
              dateAdapter={AdapterDateFns}
              adapterLocale={viLocale}
            >
              <DateCalendar
                value={currentDate}
                maxDate={subDays(new Date(), 0)} // allow selecting today and earlier
                onChange={(newDate) => {
                  if (!newDate) return;
                  setCurrentDate(newDate);
                  const iso = toIsoDate(newDate);
                  setSelectedDate(iso);
                }}
                // minimal inline style - rest from theme
                sx={{
                  "& .MuiPickersDay-root": { borderRadius: "50%" },
                  "& .MuiPickersCalendarHeader-root": {
                    borderBottom: "1px solid #e0e0e0",
                  },
                  backgroundColor: "rgb(241, 248, 244)",
                  borderRadius: 2
                }}
              />
            </LocalizationProvider>

            <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
              <Button
                size="small"
                className="my-btn my-btn-outline"
                onClick={() => {
                  setCurrentDate(new Date());
                  setSelectedDate(todayIso);
                }}
                startIcon={<HistoryIcon />}
              >
                Hôm nay
              </Button>
              <Button
                size="small"
                className="my-btn"
                onClick={() => {
                  const d = subDays(currentDate || new Date(), 1);
                  setCurrentDate(d);
                  setSelectedDate(toIsoDate(d));
                }}
              >
                ← Hôm qua
              </Button>
            </div>
          </div>
        </div>

        {/* Progress + Add card */}
        <div className="my-card" style={{ flex: 2 }}>
          <div className="my-card-header">
            <div className="my-card-title">
              <span className="icon">
                <WaterDropIcon fontSize="small" />
              </span>
              <span style={{ marginLeft: 8 }}>
                Lượng nước {isViewingToday ? "(Hôm nay)" : ""}
              </span>
            </div>
          </div>

          <div className="card-content">
            {/* Progress container */}
            <div className="water-progress-container">
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  marginBottom: "12",
                }}
              >
                <Box
                  sx={{
                    position: "relative",
                    width: 100,
                    height: 140,
                    border: "2px solid #00aaff",
                    borderRadius: "0 0 12px 12px",
                    overflow: "hidden",
                    background:
                      "linear-gradient(135deg, rgba(0, 170, 255, 0.05) 0%, rgba(0, 170, 255, 0.02) 100%)",
                    boxShadow:
                      "inset 0 2px 4px rgba(0, 170, 255, 0.1), 0 4px 12px rgba(0, 170, 255, 0.15)",
                    "&::before": {
                      content: '""',
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      height: "3px",
                      background:
                        "linear-gradient(90deg, transparent, #00aaff, transparent)",
                      borderRadius: "2px 2px 0 0",
                    },
                  }}
                >
                  {/* Liquid Fill */}
                  <Box
                    sx={{
                      position: "absolute",
                      bottom: 0,
                      width: "100%",
                      height: `${progressPercentage}%`,
                      background:
                        "linear-gradient(180deg, #00aaff 0%, #0088cc 50%, #005fa3 100%)",
                      transition: "height 0.3s ease-out",
                      boxShadow: "inset 0 2px 4px rgba(255, 255, 255, 0.3)",
                    }}
                  />

                  {/* Inner shine for depth */}
                  <Box
                    sx={{
                      position: "absolute",
                      top: 0,
                      left: "10%",
                      width: "15%",
                      height: "100%",
                      background:
                        "linear-gradient(90deg, rgba(255,255,255,0.1) 0%, transparent 100%)",
                      borderRadius: "0 0 8px 0",
                    }}
                  />

                  {/* Cup handle */}
                  <Box
                    sx={{
                      position: "absolute",
                      right: -20,
                      top: 20,
                      width: 20,
                      height: 50,
                      border: "2px solid #00aaff",
                      borderLeft: "none",
                      borderRadius: "0 12px 12px 0",
                      boxShadow: "0 2px 8px rgba(0, 170, 255, 0.2)",
                    }}
                  />
                </Box>

                {/* one-line UI under progress with icon-left */}
                <Box
                  sx={{ mt: 4, display: "flex", alignItems: "center", gap: 1 }}
                >
                  <WaterDropIcon
                    fontSize="small"
                    sx={{ color: "primary.main" }}
                  />
                  <Typography variant="body2" color="text.secondary">
                    {progressPercentage >= 100
                      ? "Yay! Bạn đã uống đủ nước!"
                      : `Còn ${remaining} ${
                          waterData?.unit ?? "ml"
                        } nữa để đạt mục tiêu`}
                  </Typography>
                </Box>
              </div>

              <div className="water-stats">
                <div>
                  <div className="water-percentage">{progressPercentage}%</div>
                  <div className="water-amounts">
                    <span className="consumed">
                      {waterData?.consumed ?? waterData?.current ?? 0}{" "}
                      {waterData?.unit ?? "ml"}
                    </span>
                    <span className="separator">/</span>
                    <span className="target">
                      {waterData?.target ?? waterData?.goal ?? "-"}{" "}
                      {waterData?.unit ?? "ml"}
                    </span>
                  </div>
                </div>

                {/* small subtitle + HCDC link */}
                <div style={{ marginTop: 8 }} className="text-sm text-gray-600">
                  Theo khuyến cáo từ bác sĩ, mỗi người nên uống đủ nước mỗi
                  ngày. Tuy nhiên tùy vào <strong>tình trạng sức khỏe</strong>{" "}
                  và <strong>cường độ vận động</strong>, lượng nước cần thiết có
                  thể ít hoặc nhiều hơn.
                </div>

                <Box
                  sx={{ mt: 1, display: "flex", alignItems: "center", gap: 1 }}
                >
                  <HelpOutlineIcon fontSize="small" />
                  <Typography variant="body2" color="text.secondary">
                    Bạn đã biết cách uống nước đúng cách chưa?{" "}
                    <Link
                      href="https://hcdc.vn/ban-da-uong-nuoc-dung-cach-chua-YO76QJ.html"
                      target="_blank"
                      rel="noopener"
                    >
                      Xem hướng dẫn HCDC
                    </Link>
                  </Typography>
                </Box>
              </div>
            </div>

            <hr
              style={{
                border: "none",
                borderTop: "1px solid #eee",
                margin: "16px 0",
              }}
            />

            {/* Banner: remind if not reached and >2 hours since last drink, or no data today */}
            {isViewingToday && (
              <>
                {waterData&&waterData.consumed > 0 ? (
                  (waterData.consumed ?? waterData.current ?? 0) <
                    (waterData.target ?? waterData.goal ?? Infinity) &&
                  hoursSinceLastDrink !== null &&
                  hoursSinceLastDrink >= 2 && (
                    <Alert
                      severity="warning"
                      sx={{
                        mb: 2,
                        display: "flex",
                        gap: 1,
                        alignItems: "center",
                      }}
                    >
                      <Box sx={{ flex: 1 }}>
                        <strong>
                          Đã {hoursSinceLastDrink} giờ bạn chưa uống nước rồi.
                        </strong>{" "}
                        Hãy uống một ít để duy trì độ ẩm cơ thể nhé!
                      </Box>
                    </Alert>
                  )
                ) : (
                  <Alert
                    severity="info"
                    sx={{
                      mb: 2,
                      display: "flex",
                      gap: 1,
                      alignItems: "center",
                    }}
                  >
                    <Box sx={{ flex: 1 }}>
                      <strong>Hôm nay bạn chưa uống nước.</strong> Hãy bổ sung
                      nước để cơ thể luôn đủ nước nhé!
                    </Box>
                  </Alert>
                )}
              </>
            )}

            {/* Add form (on top of history) */}
            <div className="water-form">
              <label className="form-label">Thêm lượng nước (ml)</label>
              <div
                className="water-input-group"
                style={{ display: "flex", gap: 8, marginTop: 8 }}
              >
                <input
                  className="form-control"
                  type="number"
                  min="1"
                  placeholder={`Nhập số lượng (${waterData?.unit ?? "ml"})`}
                  value={newIntake}
                  onChange={(e) => setNewIntake(e.target.value)}
                  disabled={!isViewingToday}
                  style={{ flex: 1 }}
                />
                <button
                  type="button"
                  className="my-btn my-btn-primary"
                  onClick={handleAdd}
                  disabled={!isViewingToday}
                >
                  Thêm
                </button>
              </div>

              <div className="quick-add-section" style={{ marginTop: 12 }}>
                <div className="text-sm text-gray-600 mb-2">Thêm nhanh:</div>
                <div
                  className="quick-add-buttons"
                  style={{ display: "flex", gap: 8 }}
                >
                  {quickAddOptions.map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      className="quick-add-btn"
                      onClick={() => handleQuickAdd(amt)}
                    >
                      +{amt} {waterData?.unit ?? "ml"}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            {/* History card below */}
            <div
              className="my-card"
              style={{ marginTop: 20, backgroundColor: "rgb(241, 248, 244)" }}
            >
              <div className="my-card-header">
                <div className="my-card-title">
                  <span className="icon">
                    <HistoryIcon fontSize="small" />
                  </span>
                  <span style={{ marginLeft: 8 }}>
                    Lịch sử chi tiết — {selectedDate}
                  </span>
                </div>
              </div>

              <div className="card-content">
                {loading && (
                  <div className="text-sm text-gray-600 mb-2">Đang tải...</div>
                )}

                <div className="water-history">
                  {waterData?.history?.length > 0 ? (
                    waterData.history.map((entry) => {
                      const canEdit =
                        differenceInCalendarDays(
                          new Date(),
                          new Date(waterData.date)
                        ) <= 6;
                      const isEditing = editingId === entry._id;

                      return (
                        <div
                          className="history-item"
                          key={entry._id}
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            padding: 8,
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              gap: 12,
                              alignItems: "center",
                            }}
                          >
                            <div
                              className="history-time"
                              style={{ minWidth: 70 }}
                            >
                              {entry.time}
                            </div>

                            {/* amount or inline edit */}
                            <div
                              className="history-amount"
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 8,
                              }}
                            >
                              <span className="droplet-icon" aria-hidden>
                                <WaterDropIcon
                                  fontSize="small"
                                  style={{ color: "var(--main-green)" }}
                                />
                              </span>

                              {isEditing ? (
                                <>
                                  <input
                                    className="form-control"
                                    type="number"
                                    min="1"
                                    value={editingAmount}
                                    onChange={(e) =>
                                      setEditingAmount(e.target.value)
                                    }
                                    style={{ width: 120 }}
                                  />
                                  <Button
                                    size="small"
                                    className="my-btn my-btn-primary"
                                    onClick={() => handleSaveEdit(entry)}
                                  >
                                    Lưu
                                  </Button>
                                  <Button
                                    size="small"
                                    className="my-btn my-btn-outline"
                                    onClick={handleCancelEdit}
                                  >
                                    Huỷ
                                  </Button>
                                </>
                              ) : (
                                <>
                                  <span style={{ fontWeight: 600 }}>
                                    {entry.amount} {waterData.unit}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>

                          {/* actions */}
                          <div
                            className="action-icons"
                            style={{
                              display: "flex",
                              gap: 6,
                              alignItems: "center",
                            }}
                          >
                            <Tooltip
                              title={
                                canEdit ? "Sửa" : "Không thể sửa (quá 7 ngày)"
                              }
                            >
                              <span>
                                <IconButton
                                  size="small"
                                  onClick={() => {
                                    if (!canEdit) {
                                      setAlert({
                                        show: true,
                                        message:
                                          "Bạn chỉ có thể chỉnh sửa hoặc xoá lịch sử trong vòng 7 ngày gần nhất để đảm bảo tính chính xác dữ liệu.",
                                        variant: "error",
                                      });
                                      return;
                                    }
                                    handleStartEdit(entry);
                                  }}
                                >
                                  <EditIcon fontSize="small" />
                                </IconButton>
                              </span>
                            </Tooltip>

                            <Tooltip
                              title={
                                canEdit ? "Xoá" : "Không thể xoá (quá 7 ngày)"
                              }
                            >
                              <span>
                                <IconButton
                                  size="small"
                                  onClick={() => {
                                    if (!canEdit) {
                                      setAlert({
                                        show: true,
                                        message:
                                          "Bạn chỉ có thể chỉnh sửa hoặc xoá lịch sử trong vòng 7 ngày gần nhất để đảm bảo tính chính xác dữ liệu.",
                                        variant: "error",
                                      });
                                      return;
                                    }
                                    handleDelete(entry);
                                  }}
                                >
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </span>
                            </Tooltip>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div style={{ padding: 12 }}>
                      <div className="text-center text-gray-500">
                        Chưa có dữ liệu lịch sử cho ngày này.
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>{" "}
      {/* end top row */}
    </div>
  );
};

export default WaterTrackingPage;
