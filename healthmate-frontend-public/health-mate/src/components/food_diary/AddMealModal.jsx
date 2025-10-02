import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  IconButton,
  Tabs,
  Tab,
  TextField,
  InputAdornment,
} from "@mui/material";
import {
  Close as CloseIcon,
  Search as SearchIcon,
  Add as AddIcon,
} from "@mui/icons-material";
import RestaurantIcon from "@mui/icons-material/Restaurant";
import EggIcon from "@mui/icons-material/Egg";
import AvailableDishes from "./AvailableDishes";
import CreateNewDish from "./CreateNewDish";
import IngredientsTab from "./IngredientsTab";

function AddMealModal({ open, onClose, mealType }) {
  const [activeTab, setActiveTab] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    setSearchQuery("");
  };

  const handleClose = () => {
    setActiveTab(0);
    setSearchQuery("");
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          maxHeight: "90vh",
        },
      }}
    >
      {/* Header */}
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          pb: 2,
          borderBottom: "1px solid #f0f0f0",
        }}
      >
        <Box
          sx={{
            width: 32,
            height: 32,
            borderRadius: "50%",
            bgcolor: "#4CAF50",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <AddIcon sx={{ color: "white", fontSize: 20 }} />
        </Box>
        <Box sx={{ flex: 1, color: "#4CAF50", fontWeight: 600, fontSize: 20 }}>
          Thêm món ăn mới
        </Box>
        <IconButton onClick={handleClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        {/* Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: "divider", px: 2, pt: 2 }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            sx={{
              "& .MuiTab-root": {
                textTransform: "none",
                minHeight: 48,
                fontWeight: 500,
              },
              "& .Mui-selected": {
                color: "#4CAF50",
              },
              "& .MuiTabs-indicator": {
                bgcolor: "#4CAF50",
              },
            }}
          >
            <Tab
              icon={<RestaurantIcon />}
              iconPosition="start"
              label="Món có sẵn"
              sx={{
                bgcolor: activeTab === 0 ? "#E8F5E9" : "transparent",
                borderRadius: "8px 8px 0 0",
                mr: 1,
              }}
            />
            <Tab
              icon={<AddIcon />}
              iconPosition="start"
              label="Tạo món mới"
              sx={{
                bgcolor: activeTab === 1 ? "#E8F5E9" : "transparent",
                borderRadius: "8px 8px 0 0",
                mr: 1,
              }}
            />
            <Tab
              icon={<EggIcon />}
              iconPosition="start"
              label="Nguyên liệu"
              sx={{
                bgcolor: activeTab === 2 ? "#E8F5E9" : "transparent",
                borderRadius: "8px 8px 0 0",
              }}
            />
          </Tabs>
        </Box>

        {/* Search Bar */}
        {(activeTab === 0 || activeTab === 2) && (
          <Box sx={{ p: 2, borderBottom: "1px solid #f0f0f0" }}>
            <TextField
              fullWidth
              placeholder={
                activeTab === 0
                  ? "Tìm kiếm món ăn..."
                  : "Tìm kiếm nguyên liệu..."
              }
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: "#999" }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                  bgcolor: "#f5f5f5",
                  "& fieldset": {
                    border: "none",
                  },
                },
              }}
            />
          </Box>
        )}

        {/* Tab Content */}
        <Box sx={{ p: 2, maxHeight: "50vh", overflowY: "auto" }}>
          {activeTab === 0 && (
            <AvailableDishes
              searchQuery={searchQuery}
              mealType={mealType}
              onClose={handleClose}
            />
          )}
          {activeTab === 1 && (
            <CreateNewDish mealType={mealType} onClose={handleClose} />
          )}
          {activeTab === 2 && (
            <IngredientsTab
              searchQuery={searchQuery}
              mealType={mealType}
              onClose={handleClose}
            />
          )}
        </Box>
      </DialogContent>
    </Dialog>
  );
}

export default AddMealModal;
