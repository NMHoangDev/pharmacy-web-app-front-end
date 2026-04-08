import React, { useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Header from "../../../../shared/components/layout/Header";
import Footer from "../../../../shared/components/layout/Footer";
import BookingBreadcrumbs from "../../components/booking/BookingBreadcrumbs";
import BookingHeading from "../../components/booking/BookingHeading";
import PharmacistProfileCard from "../../components/booking/PharmacistProfileCard";
import BookingForm from "../../components/booking/BookingForm";
import { normalizeMediaUrl } from "../../../../shared/utils/media";
import "../../components/booking/scrollbar.css";

const normalizeListValue = (value, fallback) => {
  if (Array.isArray(value)) return value.join(", ");
  return value || fallback;
};

const BookingPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const pharmacistFromState = location.state?.pharmacist;

  const pharmacist = useMemo(() => {
    if (!pharmacistFromState) return undefined;

    const id = pharmacistFromState.id ?? pharmacistFromState.pharmacistId;

    return {
      id,
      name:
        pharmacistFromState.fullName ??
        pharmacistFromState.name ??
        pharmacistFromState.displayName ??
        "Dược sĩ",
      image: normalizeMediaUrl(
        pharmacistFromState.avatarUrl ?? pharmacistFromState.image ?? "",
      ),
      online: pharmacistFromState.status
        ? pharmacistFromState.status === "online"
        : Boolean(pharmacistFromState.online),
      specialty:
        pharmacistFromState.specialtyLabel ??
        pharmacistFromState.specialty ??
        pharmacistFromState.tag ??
        "Tư vấn dược",
      verified:
        Boolean(pharmacistFromState.verified) ||
        Boolean(pharmacistFromState.isVerified),
      verifiedText:
        pharmacistFromState.verifiedText ??
        pharmacistFromState.badge ??
        (pharmacistFromState.verified || pharmacistFromState.isVerified
          ? "Đã xác thực chuyên môn"
          : "Chưa xác thực"),
      workingHours: pharmacistFromState.workingHours ?? "08:00 - 17:00",
      workingDays: normalizeListValue(
        pharmacistFromState.workingDays,
        "Thứ 2 - Thứ 7",
      ),
      languages: normalizeListValue(
        pharmacistFromState.languages,
        "Tiếng Việt",
      ),
      education: pharmacistFromState.education ?? "Đang cập nhật",
      branchId: pharmacistFromState.branchId ?? "",
      branchName:
        pharmacistFromState.branchName ??
        pharmacistFromState.branch?.name ??
        "Chưa gắn chi nhánh",
    };
  }, [pharmacistFromState]);

  const pharmacistId = pharmacist?.id;

  if (!pharmacistId) {
    console.warn(
      "BookingPage: pharmacist id not found in location.state.pharmacist",
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col">
      <Header />

      <main className="flex-1 py-8">
        <div className="px-4 md:px-8 lg:px-16 xl:px-24 flex justify-center">
          <div className="flex flex-col max-w-[1200px] flex-1 gap-6">
            <BookingBreadcrumbs />

            <div className="flex items-center justify-between flex-wrap gap-3">
              <BookingHeading />
              <button
                type="button"
                onClick={() => navigate("/pharmacists")}
                className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">
                  arrow_back
                </span>
                Quay lại danh sách
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-4 h-fit lg:sticky lg:top-24">
                <PharmacistProfileCard pharmacist={pharmacist} />
              </div>

              <div className="lg:col-span-8">
                <BookingForm
                  onBackToPharmacists={() => navigate("/pharmacists")}
                  pharmacistId={pharmacistId}
                  branchId={undefined}
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
