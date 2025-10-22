import React from "react";
import { Box, Typography, Link, Alert } from "@mui/material";
import WaterDropIcon from "@mui/icons-material/WaterDrop";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";

const WaterProgressPanel = ({
  waterData,
  progressPercentage,
  remaining,
  hoursSinceLastDrink,
  isViewingToday,
}) => {
  return (
    <div className="water-progress-container">
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: "12" }}>
        <Box
          sx={{
            position: "relative",
            width: 100,
            height: 140,
            border: "2px solid #00aaff",
            borderRadius: "0 0 12px 12px",
            overflow: "hidden",
            background: "linear-gradient(135deg, rgba(0, 170, 255, 0.05) 0%, rgba(0, 170, 255, 0.02) 100%)",
            boxShadow: "inset 0 2px 4px rgba(0, 170, 255, 0.1), 0 4px 12px rgba(0, 170, 255, 0.15)",
            "&::before": {
              content: '""',
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: "3px",
              background: "linear-gradient(90deg, transparent, #00aaff, transparent)",
              borderRadius: "2px 2px 0 0",
            },
          }}
        >
          <Box
            sx={{
              position: "absolute",
              bottom: 0,
              width: "100%",
              height: `${progressPercentage}%`,
              background: "linear-gradient(180deg, #00aaff 0%, #0088cc 50%, #005fa3 100%)",
              transition: "height 0.3s ease-out",
              boxShadow: "inset 0 2px 4px rgba(255, 255, 255, 0.3)",
            }}
          />
          <Box
            sx={{
              position: "absolute",
              top: 0,
              left: "10%",
              width: "15%",
              height: "100%",
              background: "linear-gradient(90deg, rgba(255,255,255,0.1) 0%, transparent 100%)",
              borderRadius: "0 0 8px 0",
            }}
          />
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

        <Box sx={{ mt: 4, display: "flex", alignItems: "center", gap: 1 }}>
          <WaterDropIcon fontSize="small" sx={{ color: "primary.main" }} />
          <Typography variant="body2" color="text.secondary">
            {progressPercentage >= 100
              ? "Yay! Bạn đã uống đủ nước!"
              : `Còn ${remaining} ${waterData?.unit ?? "ml"} nữa để đạt mục tiêu`}
          </Typography>
        </Box>
      </div>

      <div className="water-stats">
        <div>
          <div className="water-percentage">{progressPercentage}%</div>
          <div className="water-amounts">
            <span className="consumed">
              {waterData?.consumed ?? waterData?.current ?? 0} {waterData?.unit ?? "ml"}
            </span>
            <span className="separator">/</span>
            <span className="target">
              {waterData?.target ?? waterData?.goal ?? "-"} {waterData?.unit ?? "ml"}
            </span>
          </div>
        </div>

        <div style={{ marginTop: 8 }} className="text-sm text-gray-600">
          Theo khuyến cáo từ bác sĩ, mỗi người nên uống đủ nước mỗi ngày. Tuy nhiên tùy vào <strong>tình trạng sức khỏe</strong> và <strong>cường độ vận động</strong>, lượng nước cần thiết có thể ít hoặc nhiều hơn.
        </div>

        <Box sx={{ mt: 1, display: "flex", alignItems: "center", gap: 1 }}>
          <HelpOutlineIcon fontSize="small" />
          <Typography variant="body2" color="text.secondary">
            Bạn đã biết cách uống nước đúng cách chưa?{" "}
            <Link href="https://hcdc.vn/ban-da-uong-nuoc-dung-cach-chua-YO76QJ.html" target="_blank" rel="noopener">
              Xem hướng dẫn HCDC
            </Link>
          </Typography>
        </Box>

        {isViewingToday && waterData && (waterData?.consumed ?? waterData?.current ?? 0) < (waterData?.target ?? waterData?.goal ?? Infinity) && hoursSinceLastDrink !== null && hoursSinceLastDrink >= 2 && (
          <Alert severity="warning" sx={{ mt: 2, alignItems: "center", display: "flex", gap: 1 }}>
            <strong>Đã {hoursSinceLastDrink} giờ bạn chưa uống nước rồi.</strong> Hãy uống một ít để duy trì độ ẩm cơ thể nhé!
          </Alert>
        )}
      </div>
    </div>
  );
};

export default WaterProgressPanel;
