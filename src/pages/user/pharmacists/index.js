import React from "react";
import Header from "../../../components/Header";
import Footer from "../../../components/Footer";
import PharmacistsBreadcrumbs from "../../../components/pharmacists/PharmacistsBreadcrumbs";
import PharmacistsFilters from "../../../components/pharmacists/PharmacistsFilters";
import OnlineNowSection from "../../../components/pharmacists/OnlineNowSection";
import SortBar from "../../../components/pharmacists/SortBar";
import PharmacistsGrid from "../../../components/pharmacists/PharmacistsGrid";
import PharmacistsPagination from "../../../components/pharmacists/PharmacistsPagination";

const PharmacistsPage = () => {
  return (
    <div className="min-h-screen bg-[#f4f7fb] dark:bg-slate-950 flex flex-col">
      <Header />

      <main className="flex-1 pt-4 pb-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <PharmacistsBreadcrumbs />

          <section className="flex flex-col lg:flex-row gap-6 mt-2">
            <div className="w-full lg:w-1/4">
              <PharmacistsFilters />
            </div>
            <div className="w-full lg:w-3/4 flex flex-col gap-5">
              <OnlineNowSection />
              <SortBar />
              <PharmacistsGrid />
              <PharmacistsPagination />
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PharmacistsPage;
