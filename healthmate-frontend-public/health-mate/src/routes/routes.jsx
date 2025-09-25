import { createBrowserRouter, Outlet } from "react-router-dom";
import RegisterForm from "../components/authentication/Register.jsx";
import AuthProvider from "../context/AuthProvider.jsx";
import NotFoundPage from "../components/common/NotFound404.jsx";
import UnauthorizedPage from "../components/common/Unautorized401.jsx";
import MainLayout from "../components/common/MainLayout.jsx";
import DefaultRedirect from "../components/common/DefaultRedirect.jsx";
import HomePage from "../components/homepage/HomePage.jsx";
import GuestHomePage from "../components/homepage/GuestHomePage.jsx";

const AuthLayout = () => (
    <AuthProvider>
        <Outlet />
    </AuthProvider>
);
const router = createBrowserRouter([
    {
        path: "/register",
        element: <RegisterForm />,
    },
    {
        path: "/homepage",
        element: <GuestHomePage />,
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
        element: (<AuthProvider>
            <Outlet />
        </AuthProvider>),
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