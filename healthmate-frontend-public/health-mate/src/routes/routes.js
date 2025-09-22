import { createBrowserRouter, Outlet } from "react-router-dom";
import RegisterForm from "../components/authentication/Register.jsx";

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
        path: "/login",
        element: <Login />,
    },
    {
        path: "/changepassword/:token",
        element: <ChangePassword />,
    },

    {
        element: <AuthLayout />,
        children: [
            {
                element: <MainLayout />,
                children: [
                    {
                        path: "/oauth-callback",
                        element: <OAuthCallback />,
                    },
                    {
                        path: "/",
                        element: <DefaultRedirect />
                    },

                    {
                        path: "/homepage",
                        element: (
                            <HomePage />
                        )
                    },
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