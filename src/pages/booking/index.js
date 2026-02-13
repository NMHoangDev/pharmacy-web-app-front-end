import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import BookingBreadcrumbs from "../../components/booking/BookingBreadcrumbs";
import BookingHeading from "../../components/booking/BookingHeading";
import PharmacistProfileCard from "../../components/booking/PharmacistProfileCard";
import BookingForm from "../../components/booking/BookingForm";
import "../../components/booking/scrollbar.css";

const BookingPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const pharmacistFromState = location.state?.pharmacist;
  const pharmacistIdFromState =
    pharmacistFromState?.id ?? pharmacistFromState?.pharmacistId;
  if (!pharmacistIdFromState) {
    // eslint-disable-next-line no-console
    console.warn(
      "BookingPage: pharmacist id not found in location.state.pharmacist",
    );
  }

  const pharmacist = pharmacistFromState
    ? {
        name: pharmacistFromState.name,
        image: pharmacistFromState.image,
        online: pharmacistFromState.status
          ? pharmacistFromState.status === "online"
          : pharmacistFromState.online,
        specialty: pharmacistFromState.specialty ?? pharmacistFromState.tag,
        verifiedText:
          pharmacistFromState.verifiedText ?? pharmacistFromState.badge,
        workingHours: pharmacistFromState.workingHours,
        workingDays: pharmacistFromState.workingDays,
        languages: pharmacistFromState.languages,
        education: pharmacistFromState.education,
      }
    : undefined;

  return (
    <div className="min-h-screen bg-[#f4f7fb] dark:bg-slate-950 flex flex-col">
      <Header />

      <main className="flex-1 py-8">
        <div className="px-4 md:px-10 lg:px-40 flex justify-center">
          <div className="flex flex-col max-w-[1200px] flex-1 gap-6">
            <BookingBreadcrumbs />

            <BookingHeading />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-4 flex flex-col gap-6">
                <PharmacistProfileCard pharmacist={pharmacist} />
              </div>
              <div className="lg:col-span-8">
                <BookingForm
                  onBackToPharmacists={() => navigate("/pharmacists")}
                  pharmacistId={pharmacistIdFromState}
                />
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default BookingPage;
