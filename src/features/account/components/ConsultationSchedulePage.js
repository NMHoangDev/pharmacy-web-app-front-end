import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import StatusAlert from "./StatusAlert";
import ConsultationEmptyState from "./ConsultationEmptyState";
import ConsultationCard from "./ConsultationCard";
import { Skeleton } from "../../../shared/components/ui/Skeleton";

/**
 * ConsultationSchedulePage Component
 * Main page for consultation schedule with improved UX/UI
 * Features:
 * - Better error handling with user-friendly messages
 * - Elegant loading states with skeleton screens
 * - Improved empty state with CTAs
 * - Professional appointment list display
 * - Responsive design for mobile/tablet/desktop
 */
const ConsultationSchedulePage = ({
  appointments = [],
  loading = false,
  error = null,
  onRetry,
  onBookConsultation,
  onExplorePharmacists,
}) => {
  const [dismissedError, setDismissedError] = useState(false);

  // User-friendly error message mapping
  const getErrorMessage = (errorText) => {
    if (!errorText) return null;

    const errorMappings = {
      "status code 500": {
        title: "Lỗi máy chủ",
        message: "Máy chủ tạm thời gặp sự cố.",
        subtext: "Vui lòng thử lại sau vài phút.",
      },
      "status code 401": {
        title: "Phiên hết hạn",
        message: "Phiên đăng nhập của bạn đã hết hạn.",
        subtext: "Vui lòng đăng nhập lại để tiếp tục.",
      },
      "status code 403": {
        title: "Quyền truy cập bị từ chối",
        message: "Bạn không có quyền truy cập tài nguyên này.",
        subtext: "Liên hệ với bộ phận hỗ trợ để được giúp đỡ.",
      },
      "status code 404": {
        title: "Không tìm thấy",
        message: "Dữ liệu bạn tìm kiếm không tồn tại.",
        subtext: "Vui lòng kiểm tra lại và thử lại.",
      },
      network: {
        title: "Lỗi kết nối",
        message: "Không thể kết nối đến máy chủ.",
        subtext: "Vui lòng kiểm tra kết nối internet của bạn.",
      },
    };

    // Match error text against known patterns
    for (const [key, config] of Object.entries(errorMappings)) {
      if (errorText.toLowerCase().includes(key)) {
        return config;
      }
    }

    // Default error message
    return {
      title: "Đã xảy ra lỗi",
      message: errorText || "Không thể tải dữ liệu lịch tư vấn.",
      subtext: "Vui lòng thử lại hoặc liên hệ với hỗ trợ.",
    };
  };

  const errorConfig = dismissedError ? null : getErrorMessage(error);

  const handleRetry = () => {
    setDismissedError(false);
    onRetry?.();
  };

  // Loading skeleton
  if (loading && appointments.length === 0) {
    return (
      <div className="space-y-4">
        {/* Header skeleton */}
        <div className="mb-6">
          <Skeleton className="h-8 w-40 rounded-lg mb-2" />
          <Skeleton className="h-4 w-60 rounded" />
        </div>

        {/* Card skeletons */}
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 space-y-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              <div className="md:col-span-4 space-y-3">
                <Skeleton className="h-3 w-24 rounded" />
                <Skeleton className="h-5 w-48 rounded-lg" />
                <Skeleton className="h-8 w-32 rounded-lg" />
              </div>
              <div className="md:col-span-3 space-y-3">
                <Skeleton className="h-3 w-20 rounded" />
                <Skeleton className="h-8 w-24 rounded-full" />
              </div>
              <div className="md:col-span-5 space-y-3">
                <Skeleton className="h-3 w-20 rounded" />
                <div className="flex gap-3">
                  <Skeleton className="w-12 h-12 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-32 rounded" />
                    <Skeleton className="h-3 w-24 rounded" />
                  </div>
                </div>
              </div>
            </div>
            <div className="flex gap-2 justify-end pt-4 border-t border-slate-200 dark:border-slate-700">
              <Skeleton className="h-9 w-20 rounded-lg" />
              <Skeleton className="h-9 w-24 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <span className="material-symbols-outlined text-blue-500 dark:text-blue-400">
            calendar_month
          </span>
          Lịch tư vấn
        </h1>
        <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base mt-1">
          Xem và quản lý các lịch hẹn tư vấn sức khỏe của bạn
        </p>
      </div>

      {/* Error Alert */}
      {errorConfig && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          <StatusAlert
            type="error"
            title={errorConfig.title}
            message={errorConfig.message}
            subtext={errorConfig.subtext}
            onRetry={handleRetry}
            onDismiss={() => setDismissedError(true)}
            showDetails={false}
            technicalDetails={error}
          />
        </motion.div>
      )}

      {/* Success message on retry */}
      {dismissedError && onRetry && !loading && appointments.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <StatusAlert
            type="success"
            title="Tải lại thành công"
            message="Dữ liệu của bạn đã được cập nhật."
            onDismiss={() => {}}
          />
        </motion.div>
      )}

      {/* Empty state */}
      {!loading && appointments.length === 0 && !error && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-md border border-slate-200 dark:border-slate-700 overflow-hidden">
          <ConsultationEmptyState
            onBookConsultation={onBookConsultation}
            showSecondaryAction={true}
            onExplorePharmacists={onExplorePharmacists}
          />
        </div>
      )}

      {/* Appointments list */}
      {!loading && appointments.length > 0 && (
        <motion.div
          className="space-y-4"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: {
                staggerChildren: 0.1,
                delayChildren: 0.1,
              },
            },
          }}
        >
          {/* Summary info */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-4 py-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/30 rounded-xl">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-blue-600 dark:text-blue-400">
                info
              </span>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Bạn có <span className="font-bold">{appointments.length}</span>{" "}
                lịch hẹn
              </p>
            </div>
            <p className="text-xs text-blue-600 dark:text-blue-400">
              Từ gần đến trước
            </p>
          </div>

          {/* Appointments */}
          {appointments.map((apt) => (
            <ConsultationCard key={apt.id} appointment={apt} />
          ))}
        </motion.div>
      )}

      {/* Loading indicator for pagination */}
      {loading && appointments.length > 0 && (
        <div className="flex items-center justify-center py-6">
          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
            <div
              className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
              style={{ animationDelay: "0.1s" }}
            ></div>
            <div
              className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
              style={{ animationDelay: "0.2s" }}
            ></div>
            <span className="text-sm ml-2">Đang tải...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConsultationSchedulePage;
