import { createBrowserRouter, Outlet } from "react-router-dom";
import RegisterForm from "../pages/authentication/Register.jsx";
import AuthProvider from "../context/AuthProvider.jsx";
import NotFoundPage from "../components/common/NotFound404.jsx";
import UnauthorizedPage from "../components/common/Unautorized401.jsx";
import MainLayout from "../components/common/MainLayout.jsx";
import DefaultRedirect from "../components/common/DefaultRedirect.jsx";
import { Component } from "react";
import LoginForm from "../pages/authentication/Login.jsx";
import ForgotPassword from "../pages/authentication/ForgotPassword.jsx";
import GuestHomePage from "../components/homepage/GuestHomePage.jsx";
import Calculate from "../components/calculate/Calculate.jsx";
import CustomerHomePage from "../components/homepage/CustomerHomePage.jsx";
import SetGoal from "../components/dietplan/SetGoal.jsx";
import DietPlan from "../components/dietplan/DietPlan.jsx"

class AuthLayout extends Component {
    render() {
        return (
            <AuthProvider>
                <Outlet />
            </AuthProvider>
        );
    }
}

const router = createBrowserRouter([
    {
        path: "/register",
        element: <RegisterForm />,
    },
    {
        path: "/login",
        element: <LoginForm />,
    },
    {
        path: "/forgot-password",
        element: <ForgotPassword />,
    },
    {
        path: "/guest-homepage",
        element: <GuestHomePage />,
    },
    {
        path: "/calculate",
        element: < Calculate />,
    },
    {
        path: "/customer",
        element: < CustomerHomePage />,
    },
     {
        path: "/set-goal",
        element: < SetGoal />,
    }, {
        path: "/dietplan",
        element: < DietPlan />,
    },

    // {
    //     path: "/login",
    //     element: <Login />,
    // },
    // {
    //     path: "/changepassword/:token",
    //     element: <ChangePassword />,
    // },

    {
        path: '/',
        element: <AuthLayout />,
        children: [
            {
                element: <MainLayout />,
                children: [
                    // {
                    //     path: "/oauth-callback",
                    //     element: <OAuthCallback />,
                    // },

                    {
                        path: "/",
                        element: <DefaultRedirect />
                    },

                    // {
                    //     path: "/homepage",
                    //     element: (
                    //         <HomePage />
                    //     )
                    // },
                    // {
                    //     path: "/add-dish",
                    //     element: (
                    //         <AddDishModal
                    //             isOpen={true}
                    //             onClose={() => console.log("closed")}
                    //         />
                    //     ),
                    // },
                    {
                        path: "/unauthorized",
                        element: <UnauthorizedPage />,
                    },
                    {
                        path: "*",
                        element: <NotFoundPage />,
                    }
                ],
            },
        ],
    },
]);

export default router;