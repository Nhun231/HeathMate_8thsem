import React from "react";
import { Button } from "@mui/material";
import TodayIcon from "@mui/icons-material/Today";
import HistoryIcon from "@mui/icons-material/History";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import viLocale from "date-fns/locale/vi";
import { subDays } from "date-fns";

const WaterCalendar = ({ currentDate, setCurrentDate, setSelectedDate, todayIso }) => {
  const toIsoDate = (date) => {
    if (!date) return null;
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  return (
    <div className="my-card" style={{ flex: 1, maxHeight: "500px" }}>
      <div className="my-card-header">
        <div className="my-card-title">
          <span className="icon">
            <TodayIcon fontSize="small" />
          </span>
          <span style={{ marginLeft: 8 }}>Chọn ngày</span>
        </div>
      </div>
      <div className="card-content">
        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={viLocale}>
          <DateCalendar
            value={currentDate}
            maxDate={subDays(new Date(), 0)}
            onChange={(newDate) => {
              if (!newDate) return;
              setCurrentDate(newDate);
              setSelectedDate(toIsoDate(newDate));
            }}
            sx={{
              "& .MuiPickersDay-root": { borderRadius: "50%" },
              "& .MuiPickersCalendarHeader-root": { borderBottom: "1px solid #e0e0e0" },
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
  );
};

export default WaterCalendar;
