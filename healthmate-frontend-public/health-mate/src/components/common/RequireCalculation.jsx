import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthProvider";
import { useEffect, useState } from "react";
import { getAllCalculationsByUserId } from "../../services/Calculation";
import { CircularProgress, Box } from "@mui/material";

const RequireCalculation = ({ children }) => {
  const { user, loading: authLoading } = useAuth();
  const [hasCalculations, setHasCalculations] = useState(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkCalculations = async () => {
      // Only check for Customer role
      if (!authLoading && user) {
        const userRole = user?.roleId?.name || user?.role;
        
        // If not Customer, allow access
        if (userRole !== "Customer") {
          setHasCalculations(true);
          setChecking(false);
          return;
        }

        // If Customer, check if they have calculations
        try {
          const userId = user._id || user.id;
          if (!userId) {
            setHasCalculations(false);
            setChecking(false);
            return;
          }
          const calculations = await getAllCalculationsByUserId(userId);
          const hasData = calculations && Array.isArray(calculations) && calculations.length > 0;
          setHasCalculations(hasData);
        } catch (error) {
          console.error("Error checking calculations:", error);
          // On error, assume no calculations to be safe
          setHasCalculations(false);
        } finally {
          setChecking(false);
        }
      } else if (!authLoading && !user) {
        // Not logged in, redirect to login
        setChecking(false);
      }
    };

    checkCalculations();
  }, [user, authLoading]);

  // Show loading while checking auth or calculations
  if (authLoading || checking) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "50vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  // If not logged in, redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const userRole = user?.roleId?.name || user?.role;
  
  // If not Customer, allow access
  if (userRole !== "Customer") {
    return children;
  }

  // If Customer and no calculations, redirect to /calculate with alert message
  if (!hasCalculations) {
    return <Navigate to="/calculate" replace state={{ showAlert: true, alertMessage: "Bạn cần điền thông tin để tiếp tục" }} />;
  }

  // Customer has calculations, allow access
  return children;
};

export default RequireCalculation;

