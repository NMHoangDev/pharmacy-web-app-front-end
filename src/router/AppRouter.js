import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "../pages/user/home";
import MedicinesPage from "../pages/user/medicines";
import IntroductionPage from "../pages/user/introduction";
import PharmacistsPage from "../pages/user/pharmacists";
import BookingPage from "../pages/booking";

const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/medicines" element={<MedicinesPage />} />
        <Route path="/introduction" element={<IntroductionPage />} />
        <Route path="/pharmacists" element={<PharmacistsPage />} />
        <Route path="/booking" element={<BookingPage />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;
