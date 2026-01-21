import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
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

const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/medicines" element={<MedicinesPage />} />
        <Route path="/medicines/:idOrSlug" element={<MedicineDetailPage />} />
        <Route path="/introduction" element={<IntroductionPage />} />
        <Route path="/pharmacists" element={<PharmacistsPage />} />
        <Route path="/booking" element={<BookingPage />} />
        <Route path="/chatbot" element={<ChatbotPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/account" element={<AccountPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
        <Route path="/admin/users" element={<AdminUsersPage />} />
        <Route path="/admin/drugs" element={<AdminDrugsPage />} />
        <Route path="/admin/categories" element={<AdminCategoriesPage />} />
        <Route path="/admin/orders" element={<AdminOrdersPage />} />
        <Route path="/admin/pharmacists" element={<AdminPharmacistsPage />} />
        <Route path="/admin/schedule" element={<AdminSchedulePage />} />
        <Route path="/admin/inventory" element={<AdminInventoryPage />} />
        <Route path="/admin/content" element={<AdminContentPage />} />
        <Route path="/admin/reviews" element={<AdminReviewsPage />} />
        <Route path="/admin/payments" element={<AdminPaymentsPage />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;
