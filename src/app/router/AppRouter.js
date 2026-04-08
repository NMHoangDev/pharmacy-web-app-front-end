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

import HomePage from "../../features/home/pages";
import MedicinesPage from "../../features/medicines/pages";
import MedicineDetailPage from "../../features/medicines/pages/detail";
import IntroductionPage from "../../features/introduction/pages";
import PharmacistsPage from "../../features/pharmacists/pages/pharmacists";
import ArticlesPage from "../../features/content/pages/articles";
import ArticleDetailPage from "../../features/content/pages/articles/detail";
import ForumPage from "../../features/content/pages/forum";
import ForumDetailPage from "../../features/content/pages/forum/detail";
import OrderDetailPage from "../../features/orders/pages/order-detail";
import BookingPage from "../../features/appointments/pages/booking";
import ChatbotPage from "../../features/content/pages/chatbot";
import CartPage from "../../features/cart/pages";
import CheckoutPage from "../../features/checkout/pages";
import AccountPage from "../../features/account/pages";
import ConsultationRoomPage from "../../features/appointments/pages/consultation/ConsultationRoomPage";

import AdminDashboardPage from "../../features/admin/pages/dashboard";
import AdminUsersPage from "../../features/admin/pages/users";
import AdminDrugsPage from "../../features/admin/pages/drugs";
import AdminDiscountsPage from "../../features/admin/pages/discounts";
import AdminCategoriesPage from "../../features/admin/pages/categories";
import AdminOrdersPage from "../../features/admin/pages/orders";
import AdminPharmacistsPage from "../../features/admin/pages/pharmacists";
import AdminSchedulePage from "../../features/admin/pages/schedule";
import AdminInventoryPage from "../../features/admin/pages/inventory";
import AdminBranchesPage from "../../features/admin/pages/branches";
import AdminContentPage from "../../features/admin/pages/content";
import AdminReviewsPage from "../../features/admin/pages/reviews";
import AdminPaymentsPage from "../../features/admin/pages/payments";
import PharmacistPosPage from "../../features/pharmacists/pages/pharmacist/pos";
import PosConfirmPaymentPage from "../../features/pharmacists/pages/pharmacist/pos/confirm-payment";
import PosOrdersPage from "../../features/pharmacists/pages/pharmacist/pos/orders";
import PharmacistAppointmentsPage from "../../features/pharmacists/pages/pharmacist/appointments";
import PharmacistProfilePage from "../../features/pharmacists/pages/pharmacist/profile";
import AdminPharmacistDetailPage from "../../features/admin/pages/pharmacists/detail";
import ShipperDashboardPage from "../../features/shipper/pages";
import ShipperProfilePage from "../../features/shipper/pages/profile";
import ShipperEarningsPage from "../../features/shipper/pages/earnings";
import LoginPage from "../../features/auth/pages/login";
import SignupPage from "../../features/auth/pages/signup";
import OauthCallbackPage from "../../features/auth/pages/oauth-callback";
import { useAppContext } from "../contexts/AppContext";
import { getDefaultPathForRoles } from "../../shared/auth/roleRedirect";

const RoleRoute = ({ children, requiredRoles }) => {
  const location = useLocation();
  const { isAuthenticated, roles, isAdmin, authLoading } = useAppContext();

  if (authLoading) {
    return null;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const hasRole =
    isAdmin || (requiredRoles && requiredRoles.some((r) => roles.includes(r)));

  if (!hasRole) {
    return <Navigate to={getDefaultPathForRoles(roles)} replace />;
  }

  return children;
};

const RequireAuth = ({ children }) => {
  const location = useLocation();
  const { isAuthenticated, authLoading } = useAppContext();

  if (authLoading) {
    return null;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

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
        <Route path="/auth/callback" element={<OauthCallbackPage />} />
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
          path="/admin/pharmacists/:id"
          element={
            <RequireAdmin>
              <AdminPharmacistDetailPage />
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
          path="/pharmacist/profile"
          element={
            <RequirePharmacist>
              <PharmacistProfilePage />
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
