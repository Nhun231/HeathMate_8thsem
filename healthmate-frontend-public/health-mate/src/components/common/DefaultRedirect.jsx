import{ Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthProvider.jsx";

const DefaultRedirect = () => {
    const { user, loading } = useAuth();

    if (loading) return <div>Loading...</div>;

    if (!user) {
        return <Navigate to="/guest-homepage" replace />;
    }
    // if (user.roleId.name === "Admin") {
    //     return <Navigate to="/create-ingredient" replace />;
    // }

    if (user.roleId.name === "Customer") {
        return <Navigate to="/customer-homepage" replace />;
    }

    // Optional fallback
    return <Navigate to="/unauthorized" replace />;
};

export default DefaultRedirect;
