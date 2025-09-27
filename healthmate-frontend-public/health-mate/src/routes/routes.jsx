import { createBrowserRouter, Outlet } from "react-router-dom";
import RegisterForm from "../pages/authentication/Register.jsx";
import AuthProvider from "../context/AuthProvider.jsx";
import NotFoundPage from "../components/common/NotFound404.jsx";
import UnauthorizedPage from "../components/common/Unautorized401.jsx";
import MainLayout from "../components/common/MainLayout.jsx";
import DefaultRedirect from "../components/common/DefaultRedirect.jsx";
import {Component} from "react";
import LoginForm from "../pages/authentication/Login.jsx";
import ForgotPassword from "../pages/authentication/ForgotPassword.jsx";
import HomePage from "../components/homepage/HomePage.jsx";
import GuestHomePage from "../components/homepage/GuestHomePage.jsx";

class AuthLayout extends Component {
    render() {
        return (
            <AuthProvider>
                <Outlet/>
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
        path: '/',
        element: <AuthLayout/>,
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