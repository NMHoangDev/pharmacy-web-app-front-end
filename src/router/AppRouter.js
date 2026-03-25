import React from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
  useParams,
} from "react-router-dom";
import { AnimatePresence } from "framer-motion";

import HomePage from "../pages/user/home";
import MedicinesPage from "../pages/user/medicines";
import MedicineDetailPage from "../pages/user/medicines/detail";
import IntroductionPage from "../pages/user/introduction";
import PharmacistsPage from "../pages/user/pharmacists";
import ArticlesPage from "../pages/user/articles";
import ArticleDetailPage from "../pages/user/articles/detail";
import ForumPage from "../pages/user/forum";
import ForumDetailPage from "../pages/user/forum/detail";
import OrderDetailPage from "../pages/user/order-detail";
import BookingPage from "../pages/booking";
import ChatbotPage from "../pages/chatbot";
import CartPage from "../pages/cart";
import CheckoutPage from "../pages/checkout";
import AccountPage from "../pages/account";
import ConsultationRoomPage from "../pages/consultation/ConsultationRoomPage";

import AdminDashboardPage from "../pages/admin/dashboard";
import AdminUsersPage from "../pages/admin/users";
import AdminDrugsPage from "../pages/admin/drugs";
import AdminDiscountsPage from "../pages/admin/discounts";
import AdminCategoriesPage from "../pages/admin/categories";
import AdminOrdersPage from "../pages/admin/orders";
import AdminPharmacistsPage from "../pages/admin/pharmacists";
import AdminSchedulePage from "../pages/admin/schedule";
import AdminInventoryPage from "../pages/admin/inventory";
import AdminBranchesPage from "../pages/admin/branches";
import AdminContentPage from "../pages/admin/content";
import AdminReviewsPage from "../pages/admin/reviews";
import AdminPaymentsPage from "../pages/admin/payments";
import PharmacistPosPage from "../pages/pharmacist/pos";
import PosConfirmPaymentPage from "../pages/pharmacist/pos/confirm-payment";
import PosOrdersPage from "../pages/pharmacist/pos/orders";
import PharmacistAppointmentsPage from "../pages/pharmacist/appointments";
import ShipperDashboardPage from "../pages/shipper";
import ShipperProfilePage from "../pages/shipper/profile";
import ShipperEarningsPage from "../pages/shipper/earnings";
import LoginPage from "../pages/auth/login";
import SignupPage from "../pages/auth/signup";
import { useAppContext } from "../context/AppContext";

const RoleRoute = ({ children, requiredRoles }) => {
  const location = useLocation();
  const { isAuthenticated, roles, isAdmin } = useAppContext();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const hasRole =
    isAdmin || (requiredRoles && requiredRoles.some((r) => roles.includes(r)));

  if (!hasRole) {
    // Redirect to home if unauthorized
    return <Navigate to="/" replace />;
  }

  return children;
};

const RequireAuth = ({ children }) => (
  <RoleRoute requiredRoles={["USER", "PHARMACIST", "STAFF", "ADMIN"]}>
    {children}
  </RoleRoute>
);

const RequireAdmin = ({ children }) => (
  <RoleRoute requiredRoles={["ADMIN"]}>{children}</RoleRoute>
);

const RequirePharmacist = ({ children }) => (
  <RoleRoute requiredRoles={["PHARMACIST", "STAFF", "ADMIN"]}>
    {children}
  </RoleRoute>
);

const RequireShipper = ({ children }) => (
  <RoleRoute requiredRoles={["SHIPPER", "STAFF", "ADMIN"]}>
    {children}
  </RoleRoute>
);

const AnimatedRoutes = () => {
  const location = useLocation();

  const ArticleLegacyRedirect = () => {
    const { id } = useParams();
    return <Navigate to={id ? `/posts/${id}` : "/posts"} replace />;
  };

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<HomePage />} />
        <Route path="/medicines" element={<MedicinesPage />} />
        <Route path="/medicines/:idOrSlug" element={<MedicineDetailPage />} />
        <Route path="/posts" element={<ArticlesPage />} />
        <Route path="/posts/:slug" element={<ArticleDetailPage />} />
        <Route path="/articles" element={<Navigate to="/posts" replace />} />
        <Route path="/articles/:id" element={<ArticleLegacyRedirect />} />
        <Route path="/forum" element={<ForumPage />} />
        <Route path="/forum/:slug" element={<ForumDetailPage />} />
        <Route path="/introduction" element={<IntroductionPage />} />
        <Route path="/pharmacists" element={<PharmacistsPage />} />
        <Route
          path="/booking"
          element={
            <RequireAuth>
              <BookingPage />
            </RequireAuth>
          }
        />
        <Route path="/chatbot" element={<ChatbotPage />} />
        <Route
          path="/cart"
          element={
            <RequireAuth>
              <CartPage />
            </RequireAuth>
          }
        />
        <Route
          path="/checkout"
          element={
            <RequireAuth>
              <CheckoutPage />
            </RequireAuth>
          }
        />
        <Route
          path="/account"
          element={
            <RequireAuth>
              <AccountPage />
            </RequireAuth>
          }
        />
        <Route
          path="/order-detail/:orderId"
          element={
            <RequireAuth>
              <OrderDetailPage />
            </RequireAuth>
          }
        />
        <Route
          path="/consultation/:appointmentId"
          element={
            <RequireAuth>
              <ConsultationRoomPage />
            </RequireAuth>
          }
        />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route
          path="/admin/dashboard"
          element={
            <RequireAdmin>
              <AdminDashboardPage />
            </RequireAdmin>
          }
        />
        <Route
          path="/admin/users"
          element={
            <RequireAdmin>
              <AdminUsersPage />
            </RequireAdmin>
          }
        />
        <Route
          path="/admin/drugs"
          element={
            <RequireAdmin>
              <AdminDrugsPage />
            </RequireAdmin>
          }
        />
        <Route
          path="/admin/discounts"
          element={
            <RequireAdmin>
              <AdminDiscountsPage />
            </RequireAdmin>
          }
        />
        <Route
          path="/admin/categories"
          element={
            <RequireAdmin>
              <AdminCategoriesPage />
            </RequireAdmin>
          }
        />
        <Route
          path="/admin/orders"
          element={
            <RequireAdmin>
              <AdminOrdersPage />
            </RequireAdmin>
          }
        />
        <Route
          path="/admin/pharmacists"
          element={
            <RequireAdmin>
              <AdminPharmacistsPage />
            </RequireAdmin>
          }
        />
        <Route
          path="/admin/schedule"
          element={
            <RequireAdmin>
              <AdminSchedulePage />
            </RequireAdmin>
          }
        />
        <Route
          path="/admin/inventory"
          element={
            <RequireAdmin>
              <AdminInventoryPage />
            </RequireAdmin>
          }
        />
        <Route
          path="/admin/branches"
          element={
            <RequireAdmin>
              <AdminBranchesPage />
            </RequireAdmin>
          }
        />
        <Route
          path="/admin/content"
          element={
            <RequireAdmin>
              <AdminContentPage />
            </RequireAdmin>
          }
        />
        <Route
          path="/admin/reviews"
          element={
            <RequireAdmin>
              <AdminReviewsPage />
            </RequireAdmin>
          }
        />
        <Route
          path="/admin/payments"
          element={
            <RequireAdmin>
              <AdminPaymentsPage />
            </RequireAdmin>
          }
        />
        <Route
          path="/pharmacist/pos"
          element={
            <RequirePharmacist>
              <PharmacistPosPage />
            </RequirePharmacist>
          }
        />
        <Route
          path="/pharmacist/pos/confirm-payment"
          element={
            <RequirePharmacist>
              <PosConfirmPaymentPage />
            </RequirePharmacist>
          }
        />
        <Route
          path="/pharmacist/pos/orders"
          element={
            <RequirePharmacist>
              <PosOrdersPage />
            </RequirePharmacist>
          }
        />
        <Route
          path="/pharmacist/appointments"
          element={
            <RequirePharmacist>
              <PharmacistAppointmentsPage />
            </RequirePharmacist>
          }
        />
        <Route
          path="/shipper/orders"
          element={
            <RequireShipper>
              <ShipperDashboardPage />
            </RequireShipper>
          }
        />
        <Route
          path="/shipper/profile"
          element={
            <RequireShipper>
              <ShipperProfilePage />
            </RequireShipper>
          }
        />
        <Route
          path="/shipper/earnings"
          element={
            <RequireShipper>
              <ShipperEarningsPage />
            </RequireShipper>
          }
        />
      </Routes>
    </AnimatePresence>
  );
};

const AppRouter = () => {
  return (
    <BrowserRouter>
      <AnimatedRoutes />
    </BrowserRouter>
  );
};

export default AppRouter;
