import React from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import HomePage from "../pages/user/home";
import MedicinesPage from "../pages/user/medicines";
import MedicineDetailPage from "../pages/user/medicines/detail";
import IntroductionPage from "../pages/user/introduction";
import PharmacistsPage from "../pages/user/pharmacists";
import BookingPage from "../pages/booking";
import ChatbotPage from "../pages/chatbot";
import CartPage from "../pages/cart";
import CheckoutPage from "../pages/checkout";
import AccountPage from "../pages/account";
import AdminDashboardPage from "../pages/admin/dashboard";
import AdminUsersPage from "../pages/admin/users";
import AdminDrugsPage from "../pages/admin/drugs";
import AdminCategoriesPage from "../pages/admin/categories";
import AdminOrdersPage from "../pages/admin/orders";
import AdminPharmacistsPage from "../pages/admin/pharmacists";
import AdminSchedulePage from "../pages/admin/schedule";
import AdminInventoryPage from "../pages/admin/inventory";
import AdminContentPage from "../pages/admin/content";
import AdminReviewsPage from "../pages/admin/reviews";
import AdminPaymentsPage from "../pages/admin/payments";
import LoginPage from "../pages/auth/login";
import SignupPage from "../pages/auth/signup";
import { useAppContext } from "../context/AppContext";

const RequireAuth = ({ children }) => {
  const location = useLocation();
  const { isAuthenticated, isUser } = useAppContext();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!isUser) {
    return <Navigate to="/" replace />;
  }

  return children;
};

const RequireAdmin = ({ children }) => {
  const location = useLocation();
  const { isAuthenticated, isAdmin } = useAppContext();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
};

const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/medicines" element={<MedicinesPage />} />
        <Route path="/medicines/:idOrSlug" element={<MedicineDetailPage />} />
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
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;
