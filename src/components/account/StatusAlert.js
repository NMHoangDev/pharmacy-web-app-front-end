import React, { useState } from "react";

/**
 * StatusAlert Component
 * Displays friendly error/warning/success messages with optional dismiss and retry actions
 * Replaces raw error messages with user-friendly, professional error presentation
 */
const StatusAlert = ({
  type = "error", // 'error', 'warning', 'success', 'info'
  title,
  message,
  subtext,
  onRetry,
  onDismiss,
  showDetails = false,
  technicalDetails,
  className = "",
}) => {
  const [isOpen, setIsOpen] = useState(true);
  const [showTechnical, setShowTechnical] = useState(false);

  if (!isOpen) return null;

  const handleDismiss = () => {
    setIsOpen(false);
    onDismiss?.();
  };

  const typeConfig = {
    error: {
      icon: "error_outline",
      bgColor: "bg-red-50 dark:bg-red-950/20",
      borderColor: "border-red-200 dark:border-red-900/30",
      titleColor: "text-red-900 dark:text-red-200",
      textColor: "text-red-800 dark:text-red-300",
      buttonColor:
        "bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-900/50 text-red-700 dark:text-red-200",
      iconColor: "text-red-500 dark:text-red-400",
    },
    warning: {
      icon: "warning_outline",
      bgColor: "bg-amber-50 dark:bg-amber-950/20",
      borderColor: "border-amber-200 dark:border-amber-900/30",
      titleColor: "text-amber-900 dark:text-amber-200",
      textColor: "text-amber-800 dark:text-amber-300",
      buttonColor:
        "bg-amber-100 hover:bg-amber-200 dark:bg-amber-900/30 dark:hover:bg-amber-900/50 text-amber-700 dark:text-amber-200",
      iconColor: "text-amber-500 dark:text-amber-400",
    },
    success: {
      icon: "check_circle",
      bgColor: "bg-green-50 dark:bg-green-950/20",
      borderColor: "border-green-200 dark:border-green-900/30",
      titleColor: "text-green-900 dark:text-green-200",
      textColor: "text-green-800 dark:text-green-300",
      buttonColor:
        "bg-green-100 hover:bg-green-200 dark:bg-green-900/30 dark:hover:bg-green-900/50 text-green-700 dark:text-green-200",
      iconColor: "text-green-500 dark:text-green-400",
    },
    info: {
      icon: "info_outline",
      bgColor: "bg-blue-50 dark:bg-blue-950/20",
      borderColor: "border-blue-200 dark:border-blue-900/30",
      titleColor: "text-blue-900 dark:text-blue-200",
      textColor: "text-blue-800 dark:text-blue-300",
      buttonColor:
        "bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-200",
      iconColor: "text-blue-500 dark:text-blue-400",
    },
  };

  const config = typeConfig[type] || typeConfig.error;

  return (
    <div
      className={`${config.bgColor} ${config.borderColor} border rounded-xl px-4 py-3 sm:px-5 sm:py-4 ${className}`}
      role="alert"
      aria-live="polite"
    >
      <div className="flex gap-3">
        {/* Icon */}
        <div className="flex-shrink-0 flex items-start pt-0.5">
          <span
            className={`material-symbols-outlined ${config.iconColor} text-xl`}
          >
            {config.icon}
          </span>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-3 mb-1">
            <h3
              className={`font-semibold text-sm sm:text-base ${config.titleColor}`}
            >
              {title || getDefaultTitle(type)}
            </h3>
          </div>

          {message && (
            <p className={`text-sm ${config.textColor} mb-1`}>{message}</p>
          )}

          {subtext && (
            <p className={`text-xs ${config.textColor} opacity-75 mb-2`}>
              {subtext}
            </p>
          )}

          {/* Technical details toggle */}
          {showDetails && technicalDetails && (
            <div className="mt-2">
              <button
                type="button"
                onClick={() => setShowTechnical(!showTechnical)}
                className={`text-xs underline ${config.textColor} opacity-75 hover:opacity-100 transition-opacity`}
              >
                {showTechnical ? "Hide" : "Show"} technical details
              </button>
              {showTechnical && (
                <div
                  className={`mt-1 p-2 rounded text-xs font-mono ${config.bgColor} border ${config.borderColor} overflow-auto max-h-24`}
                >
                  {technicalDetails}
                </div>
              )}
            </div>
          )}

          {/* Action buttons */}
          {(onRetry || onDismiss) && (
            <div className="flex flex-wrap gap-2 mt-3">
              {onRetry && (
                <button
                  type="button"
                  onClick={onRetry}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${config.buttonColor}`}
                >
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">
                      refresh
                    </span>
                    Thử lại
                  </span>
                </button>
              )}
              {onDismiss && (
                <button
                  type="button"
                  onClick={handleDismiss}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${config.buttonColor}`}
                >
                  Đóng
                </button>
              )}
            </div>
          )}
        </div>

        {/* Close button */}
        {!onDismiss && (
          <div className="flex-shrink-0 pt-0.5">
            <button
              type="button"
              onClick={handleDismiss}
              className={`inline-flex text-gray-400 hover:${config.textColor} transition-colors`}
              aria-label="Close alert"
            >
              <span className="material-symbols-outlined text-xl">close</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * Default title translations based on error type
 */
function getDefaultTitle(type) {
  const titles = {
    error: "Đã xảy ra lỗi",
    warning: "Cảnh báo",
    success: "Thành công",
    info: "Thông tin",
  };
  return titles[type] || "Thông báo";
}

export default StatusAlert;
