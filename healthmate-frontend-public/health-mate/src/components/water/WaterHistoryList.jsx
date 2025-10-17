import React from "react";
import { IconButton, Tooltip, Button } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import WaterDropIcon from "@mui/icons-material/WaterDrop";
import { differenceInCalendarDays } from "date-fns";

const WaterHistoryList = ({ waterData, editingId, editingAmount, setEditingAmount, handleStartEdit, handleCancelEdit, handleSaveEdit, handleDelete, setAlert }) => {
  return (
    <div className="my-card" style={{ marginTop: 20, backgroundColor: "rgb(241, 248, 244)" }}>
      <div className="my-card-header">
        <div className="my-card-title">
          <span className="icon">
            <WaterDropIcon fontSize="small" />
          </span>
          <span style={{ marginLeft: 8 }}>
            Lịch sử chi tiết — {waterData?.date}
          </span>
        </div>
      </div>

      <div className="card-content">
        <div className="water-history">
          {waterData?.history?.length > 0 ? (
            waterData.history.map((entry) => {
              const canEdit = differenceInCalendarDays(new Date(), new Date(waterData.date)) <= 6;
              const isEditing = editingId === entry._id;
              return (
                <div className="history-item" key={entry._id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: 8 }}>
                  <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                    <div className="history-time" style={{ minWidth: 70 }}>
                      {entry.time}
                    </div>
                    <div className="history-amount" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span className="droplet-icon" aria-hidden>
                        <WaterDropIcon fontSize="small" style={{ color: "var(--main-green)" }} />
                      </span>
                      {isEditing ? (
                        <>
                          <input className="form-control" type="number" min="1" value={editingAmount} onChange={(e) => setEditingAmount(e.target.value)} style={{ width: 120 }} />
                          <Button size="small" className="my-btn my-btn-primary" onClick={() => handleSaveEdit(entry)}>Lưu</Button>
                          <Button size="small" className="my-btn my-btn-outline" onClick={handleCancelEdit}>Huỷ</Button>
                        </>
                      ) : (
                        <span style={{ fontWeight: 600 }}>{entry.amount} {waterData.unit}</span>
                      )}
                    </div>
                  </div>
                  <div className="action-icons" style={{ display: "flex", gap: 6, alignItems: "center" }}>
                    <Tooltip title={canEdit ? "Sửa" : "Không thể sửa (quá 7 ngày)"}>
                      <span>
                        <IconButton size="small" onClick={() => {
                          if (!canEdit) {
                            setAlert({ show: true, message: "Bạn chỉ có thể chỉnh sửa hoặc xoá lịch sử trong vòng 7 ngày gần nhất để đảm bảo tính chính xác dữ liệu.", variant: "error" });
                            return;
                          }
                          handleStartEdit(entry);
                        }}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </span>
                    </Tooltip>
                    <Tooltip title={canEdit ? "Xoá" : "Không thể xoá (quá 7 ngày)"}>
                      <span>
                        <IconButton size="small" onClick={() => {
                          if (!canEdit) {
                            setAlert({ show: true, message: "Bạn chỉ có thể chỉnh sửa hoặc xoá lịch sử trong vòng 7 ngày gần nhất để đảm bảo tính chính xác dữ liệu.", variant: "error" });
                            return;
                          }
                          handleDelete(entry);
                        }}>
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
              <div className="text-center text-gray-500">Chưa có dữ liệu lịch sử cho ngày này.</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WaterHistoryList;
