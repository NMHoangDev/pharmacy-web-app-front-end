import React from "react";
import { useNavigate } from "react-router-dom";

/**
 * ConsultationEmptyState Component
 * Elegant empty state for consultation schedule page
 * Features: Icon illustration, supportive message, multiple CTA options
 */
const ConsultationEmptyState = ({
  onBookConsultation,
  showSecondaryAction = true,
  onExplorePharmacists,
}) => {
  const navigate = useNavigate();

  const handleBookConsultation = () => {
    if (onBookConsultation) {
      onBookConsultation();
    } else {
      // Default navigation to booking page
      navigate("/book-consultation");
    }
  };

  const handleExplore = () => {
    if (onExplorePharmacists) {
      onExplorePharmacists();
    } else {
      navigate("/pharmacists");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 sm:px-6">
      {/* Icon container - modern and friendly */}
      <div className="relative mb-6">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-blue-50 rounded-full blur-xl opacity-50"></div>
        <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gradient-to-br from-blue-50 to-white dark:from-blue-950/20 dark:to-slate-900 border-2 border-blue-100 dark:border-blue-900/30 flex items-center justify-center shadow-lg">
          <span className="material-symbols-outlined text-5xl sm:text-6xl text-blue-500 dark:text-blue-400">
            calendar_today
          </span>
        </div>
      </div>

      {/* Main message */}
      <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white text-center mb-2">
        Chưa có lịch hẹn nào
      </h3>

      {/* Supporting text */}
      <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 text-center max-w-sm mb-8">
        Bắt đầu cuộc tư vấn số với các dược sĩ chuyên môn của chúng tôi. Nhận
        lời khuyên y tế cá nhân và giải đáp mọi thắc mắc về sức khỏe.
      </p>

      {/* Primary CTA */}
      <button
        type="button"
        onClick={handleBookConsultation}
        className="inline-flex items-center gap-2 px-6 py-3 sm:px-8 sm:py-3.5 rounded-lg bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white font-semibold text-sm sm:text-base transition-colors shadow-md hover:shadow-lg mb-3"
      >
        <span className="material-symbols-outlined text-lg">add_circle</span>
        Đặt lịch tư vấn
      </button>

      {/* Secondary action */}
      {showSecondaryAction && (
        <button
          type="button"
          onClick={handleExplore}
          className="inline-flex items-center gap-2 px-6 py-2.5 sm:px-8 sm:py-3 rounded-lg border-2 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 font-semibold text-sm sm:text-base transition-colors"
        >
          <span className="material-symbols-outlined text-lg">group</span>
          Khám phá dược sĩ
        </button>
      )}

      {/* Helpful info */}
      <div className="mt-8 pt-8 border-t border-slate-200 dark:border-slate-700 max-w-md">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-center">
          <div>
            <p className="text-2xl sm:text-3xl font-bold text-blue-600 dark:text-blue-400">
              24/7
            </p>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
              Tư vấn liên tục
            </p>
          </div>
          <div>
            <p className="text-2xl sm:text-3xl font-bold text-blue-600 dark:text-blue-400">
              100+
            </p>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
              Dược sĩ chuyên môn
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConsultationEmptyState;
