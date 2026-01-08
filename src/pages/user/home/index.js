import React from "react";
import Header from "../../../components/Header";
import HeroSection from "../../../components/home/HeroSection";
import QuickCategories from "../../../components/home/QuickCategories";
import FeaturedProducts from "../../../components/home/FeaturedProducts";
import TrustSection from "../../../components/home/TrustSection";
import Footer from "../../../components/Footer";

const HomePage = () => {
  return (
    <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 min-h-screen flex flex-col font-display">
      <Header />
      <main className="flex-grow">
        <HeroSection />
        <QuickCategories />
        <FeaturedProducts />
        <TrustSection />
      </main>
      <Footer />
    </div>
  );
};

export default HomePage;
