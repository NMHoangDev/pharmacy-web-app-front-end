import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Header from "../../../components/Header";
import Footer from "../../../components/Footer";
import BookingBreadcrumbs from "../../../components/booking/BookingBreadcrumbs";
import BookingHeading from "../../../components/booking/BookingHeading";
import PharmacistProfileCard from "../../../components/booking/PharmacistProfileCard";
import BookingForm from "../../../components/booking/BookingForm";

const BookingPage = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const pharmacist = state?.pharmacist;

  const handleBackToPharmacists = () => {
    navigate("/pharmacists");
  };

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 flex flex-col">
      <Header />

      <main className="flex-1 flex justify-center py-8 px-4 md:px-10 lg:px-14 xl:px-16">
        <div className="w-full max-w-5xl flex flex-col gap-6">
          <BookingBreadcrumbs />
          <BookingHeading />

          <section className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-4 flex flex-col gap-6">
              <PharmacistProfileCard pharmacist={pharmacist} />
            </div>
            <div className="lg:col-span-8">
              <BookingForm onBackToPharmacists={handleBackToPharmacists} />
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default BookingPage;
