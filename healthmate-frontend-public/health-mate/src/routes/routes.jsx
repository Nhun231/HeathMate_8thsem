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
import DietPlan from "../components/dietplan/DietPlan.jsx";
import DietPlanProgress from "../components/dietplan/DietPlanProgress.jsx";
import CustomerProgress from "../components/customerprogress/CustomerProgress.jsx";
import FoodDiary from "../components/diary/FoodDiary.jsx";
import { DiaryProvider } from "../context/DiaryContext.jsx";
import CustomerPage from "../components/homepage/CustomerPage.jsx";
import OAuth from "../pages/authentication/OAuth.jsx";
import ProfilePage from "../pages/ProfilePage.jsx";
import EditProfilePage from "../pages/EditProfilePage.jsx";
import WaterInformation from "../components/water/WaterInformation.jsx";
import UpdateNutrient from "../components/nutrients/UpdateNutrients.jsx";
import AdminDashboard from "../pages/admin/AdminDashboard.jsx";
import ExpertChatPage from "../pages/expert/ExpertChatPage.jsx";
import CustomerChatPage from "../pages/customer/CustomerChatPage.jsx";
import RequireRole from "../components/common/RequireRole.jsx";
import RequireCalculation from "../components/common/RequireCalculation.jsx";
import ExpertUpload from "../components/expert/UploadCertificate.jsx";
import RegisterExpert from "../components/expert/ExpertRegister.jsx";
import ViewSubscriptions from "../components/subscription/ViewSubscription.jsx";
import PaymentSuccess from "../components/subscription/PaymentSucess.jsx";
import BankInfo from "../components/bank/BankInfo.jsx";
import PostManagement from "../components/admin/PostManagement.jsx";
import PostForm from "../components/admin/PostForm.jsx";
import ListPost from "../components/post/ListPosts.jsx";
import PostDetail from "../components/post/PostDetail.jsx";
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
    path: "/oauth-google-callback",
    element: <OAuth />,
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
    path: "/register-expert",
    element: (
      <AuthProvider>
        <RegisterExpert />
      </AuthProvider>
    ),
  },
  // {
  //   path: "/expert-register",
  //   element: <ExpertUpload />,
  // },

  // {
  //     path: "/login",
  //     element: <Login />,
  // },
  // {
  //     path: "/changepassword/:token",
  //     element: <ChangePassword />,
  // },

  {
    path: "/",
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
            path: "/customer-chat",
            element: (
              <RequireCalculation>
                <CustomerChatPage />
              </RequireCalculation>
            ),
          },
          {
            path: "/expert-chat",
            element: <ExpertChatPage />,
          },
          {
            path: "/",
            element: <DefaultRedirect />,
          },
          {
            path: "/calculate",
            element: <Calculate />,
          },
          {
            path: "/customer-homepage",
            element: (
              <RequireCalculation>
                <CustomerPage />
              </RequireCalculation>
            ),
          },
          {
            path: "/set-goal",
            element: (
              <RequireCalculation>
                <SetGoal />
              </RequireCalculation>
            ),
          },
          {
            path: "/dietplan",
            element: (
              <RequireCalculation>
                <DietPlan />
              </RequireCalculation>
            ),
          },
          {
            path: "/dietplan/progress",
            element: (
              <RequireCalculation>
                <DietPlanProgress />
              </RequireCalculation>
            ),
          },
          {
            path: "/diary",
            element: (
              <RequireCalculation>
                <RequireRole allowedRoles={["Customer"]}>
                  <DiaryProvider>
                    <FoodDiary />
                  </DiaryProvider>
                </RequireRole>
              </RequireCalculation>
            ),
          },
          //admin
          {
            path: "/admin/dashboard",
            element: (
              <RequireRole allowedRoles={["Admin"]}>
                <AdminDashboard />
              </RequireRole>
            ),
          },
          {
            path: "/admin/posts",
            element: (
              <RequireRole allowedRoles={["Admin", "NutritionExpert"]}>
                <PostManagement />
              </RequireRole>
            ),
          },
          {
            path: "/admin/posts/add",
            element: (
              <RequireRole allowedRoles={["Admin", "NutritionExpert"]}>
                <PostForm />
              </RequireRole>
            ),
          },
          {
            path: "/admin/posts/edit/:postId",
            element: (
              <RequireRole allowedRoles={["Admin", "NutritionExpert"]}>
                <PostForm />
              </RequireRole>
            ),
          },
          {
            path: "list-post",
            element: <ListPost />,
          },
          {
            path: "detail-post/:postId",
            element: <PostDetail />,
          },
          {
            path: "/bankinfo",
            element: (<BankInfo />),
          },
          {
            path: "/unauthorized",
            element: <UnauthorizedPage />,
          },
          {
            path: "*",
            element: <NotFoundPage />,
          },
          {
            path: "/my-profile",
            element: <ProfilePage />,
          },
          {
            path: "/edit-profile",
            element: <EditProfilePage />,
          },
          {
            path: "/water-infor",
            element: (
              <RequireCalculation>
                <WaterInformation />
              </RequireCalculation>
            ),
          },
          {
            path: "/update-nutrient",
            element: (
              <RequireCalculation>
                <UpdateNutrient />
              </RequireCalculation>
            ),
          },
          {
            path: "/view-subscriptions",
            element: <ViewSubscriptions />,
          },
          {
            path: "/payment-success",
            element: <PaymentSuccess />,
          },
          {
            path: "/customer-progress/:userId",
            element: <CustomerProgress />,
          },
        ],
      },
    ],
  },
]);

export default router;
