import React from "react";

const WaterAddForm = ({ waterData, newIntake, setNewIntake, quickAddOptions, handleAdd, handleQuickAdd, isViewingToday }) => {
  return (
    <div className="water-form">
      <label className="form-label">Thêm lượng nước (ml)</label>
      <div className="water-input-group" style={{ display: "flex", gap: 8, marginTop: 8 }}>
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
        <div className="quick-add-buttons" style={{ display: "flex", gap: 8 }}>
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
  );
};

export default WaterAddForm;
