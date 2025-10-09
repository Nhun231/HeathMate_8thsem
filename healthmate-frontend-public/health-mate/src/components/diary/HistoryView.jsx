"use client"

import { useState } from "react"
import { Box, Typography, IconButton, Card, CardContent, Divider } from "@mui/material"
import { ChevronLeft, ChevronRight } from "@mui/icons-material"
import { useDiary } from "../../context/DiaryContext"

function HistoryView({ onBack }) {
  const { selectedDate, setSelectedDate, getTotalCalories, getDiaryEntries } = useDiary()
  const [currentDate, setCurrentDate] = useState(new Date(selectedDate))

  const formatDate = (date) => {
    const d = new Date(date)
    const day = d.getDate()
    const month = d.getMonth() + 1
    const year = d.getFullYear()
    return `${day}/${month}/${year}`
  }

  const formatDateFull = (date) => {
    const d = new Date(date)
    const days = ["Chủ nhật", "Thứ hai", "Thứ ba", "Thứ tư", "Thứ năm", "Thứ sáu", "Thứ bảy"]
    const dayName = days[d.getDay()]
    return `${dayName}, ${formatDate(date)}`
  }

  const handlePrevDay = () => {
    const newDate = new Date(currentDate)
    newDate.setDate(newDate.getDate() - 1)
    setCurrentDate(newDate)
    setSelectedDate(newDate.toISOString().split("T")[0])
  }

  const handleNextDay = () => {
    const newDate = new Date(currentDate)
    newDate.setDate(newDate.getDate() + 1)
    setCurrentDate(newDate)
    setSelectedDate(newDate.toISOString().split("T")[0])
  }

  const currentDateStr = currentDate.toISOString().split("T")[0]
  const totalCalories = getTotalCalories(currentDateStr)
  const entries = getDiaryEntries()

  // Get all dates with entries
  const datesWithEntries = Object.keys(entries).sort((a, b) => new Date(b) - new Date(a))

  return (
    <Box>
      {/* Date Navigator */}
      <Card sx={{ mb: 3, boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
        <CardContent>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
            <IconButton onClick={handlePrevDay} sx={{ color: "#4CAF50" }}>
              <ChevronLeft />
            </IconButton>
            <Typography variant="h6" sx={{ fontWeight: 600, color: "#333" }}>
              {formatDateFull(currentDate)}
            </Typography>
            <IconButton onClick={handleNextDay} sx={{ color: "#4CAF50" }}>
              <ChevronRight />
            </IconButton>
          </Box>

          <Divider sx={{ my: 2 }} />

          {/* Total Calories for Selected Date */}
          <Box sx={{ textAlign: "center" }}>
            <Typography variant="body2" sx={{ color: "#666", mb: 1 }}>
              Tổng calories
            </Typography>
            <Typography variant="h4" sx={{ color: "#4CAF50", fontWeight: 600 }}>
              {totalCalories}
            </Typography>
          </Box>
        </CardContent>
      </Card>

      {/* History List */}
      <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: "#333" }}>
        Lịch sử ghi chép
      </Typography>

      {datesWithEntries.length > 0 ? (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {datesWithEntries.map((date) => {
            const dateCalories = getTotalCalories(date)
            const dateObj = new Date(date)

            return (
              <Card
                key={date}
                sx={{
                  boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                  cursor: "pointer",
                  transition: "all 0.2s",
                  "&:hover": {
                    boxShadow: "0 4px 8px rgba(0,0,0,0.15)",
                    transform: "translateY(-2px)",
                  },
                }}
                onClick={() => {
                  setCurrentDate(dateObj)
                  setSelectedDate(date)
                }}
              >
                <CardContent>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600, color: "#333" }}>
                        {formatDateFull(dateObj)}
                      </Typography>
                      <Typography variant="body2" sx={{ color: "#666", mt: 0.5 }}>
                        {Object.keys(entries[date] || {}).length} bữa ăn
                      </Typography>
                    </Box>
                    <Box sx={{ textAlign: "right" }}>
                      <Typography variant="h6" sx={{ color: "#4CAF50", fontWeight: 600 }}>
                        {dateCalories}
                      </Typography>
                      <Typography variant="caption" sx={{ color: "#999" }}>
                        calories
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            )
          })}
        </Box>
      ) : (
        <Box sx={{ textAlign: "center", py: 6 }}>
          <Typography variant="body1" sx={{ color: "#999" }}>
            Chưa có lịch sử ghi chép nào
          </Typography>
        </Box>
      )}
    </Box>
  )
}

export default HistoryView
