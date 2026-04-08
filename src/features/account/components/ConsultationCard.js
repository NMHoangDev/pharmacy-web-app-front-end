import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

/**
 * ConsultationCard Component - Redesigned
 * Modern appointment card with improved spacing, hierarchy, and actions
 */
const ConsultationCard = ({ appointment, onReminderSet }) => {
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState("");
  const [reminderSet, setReminderSet] = useState(false);

  // Join Button Logic
  const isJoinable = () => {
    if (!appointment.startAt) return false;
    const now = new Date();
    const start = new Date(appointment.startAt);
    const end = new Date(appointment.endAt);
    const tenMinBefore = new Date(start.getTime() - 10 * 60000);
    const tenMinAfter = new Date(end.getTime() + 10 * 60000);

    const validStatuses = ["APPROVED", "CONFIRMED", "IN_PROGRESS"];
    if (!validStatuses.includes(appointment.status)) return false;

    return now >= tenMinBefore && now <= tenMinAfter;
  };

  // Countdown timer
  useEffect(() => {
    if (!appointment.startAt) return;
    const interval = setInterval(() => {
      const now = new Date();
      const start = new Date(appointment.startAt);
      const diff = start - now;

      if (diff > 0 && diff < 60 * 60 * 1000) {
        const minutes = Math.floor(diff / 60000);
        const seconds = Math.floor((diff % 60000) / 1000);
        setTimeLeft(`${minutes}:${seconds < 10 ? "0" : ""}${seconds}`);
      } else {
        setTimeLeft("");
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [appointment.startAt]);

  // Reminder logic
  useEffect(() => {
    const saved = localStorage.getItem(`reminder:${appointment.id}`);
    if (saved) setReminderSet(true);
  }, [appointment.id]);

  const handleSetReminder = () => {
    localStorage.setItem(
      `reminder:${appointment.id}`,
      JSON.stringify({ at: new Date().toISOString() }),
    );
    setReminderSet(true);
    onReminderSet?.();
  };

  const handleJoin = () => {
    if (["CANCELLED", "REJECTED", "COMPLETED"].includes(appointment.status))
      return;
    navigate(`/consultation/${appointment.id}`, {
      state: {
        appointmentId: appointment.id,
        pharmacistId: appointment.pharmacistId,
        channel: appointment.channel,
      },
    });
  };

  // Status color mapping
  const statusConfig = {
    PENDING: { bg: "bg-slate-100", text: "text-slate-700", label: "Đang chờ" },
    APPROVED: { bg: "bg-blue-100", text: "text-blue-700", label: "Đã duyệt" },
    CONFIRMED: {
      bg: "bg-green-100",
      text: "text-green-700",
      label: "Đã xác nhận",
    },
    IN_PROGRESS: {
      bg: "bg-purple-100",
      text: "text-purple-700",
      label: "Đang tư vấn",
    },
    COMPLETED: {
      bg: "bg-slate-100",
      text: "text-slate-600",
      label: "Hoàn tất",
    },
    CANCELLED: { bg: "bg-red-100", text: "text-red-700", label: "Đã hủy" },
    REJECTED: { bg: "bg-red-100", text: "text-red-700", label: "Từ chối" },
  };

  const status = statusConfig[appointment.status] || statusConfig.PENDING;
  const canJoin = isJoinable();

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300 group"
    >
      {/* Main content */}
      <div className="p-5 sm:p-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          {/* Appointment time and details */}
          <div className="md:col-span-4 flex flex-col gap-2">
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Ngày & Giờ
            </label>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-blue-500 dark:text-blue-400 flex-shrink-0">
                event
              </span>
              <span className="font-bold text-slate-900 dark:text-white text-sm sm:text-base">
                {new Date(appointment.startAt).toLocaleDateString("vi-VN", {
                  weekday: "short",
                  day: "numeric",
                  month: "numeric",
                })}
              </span>
              <span className="text-slate-500 dark:text-slate-400 text-sm">
                {new Date(appointment.startAt).toLocaleTimeString("vi-VN", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>

            {/* Countdown timer */}
            {timeLeft && (
              <div className="mt-1 inline-flex items-center gap-1.5 px-2 py-1 bg-amber-50 dark:bg-amber-950/30 rounded-lg border border-amber-200 dark:border-amber-800/40 text-xs font-semibold text-amber-700 dark:text-amber-400 w-fit animate-pulse">
                <span className="material-symbols-outlined text-sm">
                  schedule
                </span>
                Bắt đầu sau: {timeLeft}
              </div>
            )}

            {/* Notes */}
            {appointment.notes && (
              <p className="text-xs text-slate-500 dark:text-slate-400 italic mt-1 line-clamp-2">
                "{appointment.notes}"
              </p>
            )}
          </div>

          {/* Status */}
          <div className="md:col-span-3 flex flex-col gap-2">
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Trạng thái
            </label>
            <div className="flex items-start gap-2">
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold text-xs ${status.bg} ${status.text} w-fit`}
              >
                <span className="material-symbols-outlined text-sm">
                  {appointment.status === "COMPLETED"
                    ? "check_circle"
                    : appointment.status === "CANCELLED" ||
                        appointment.status === "REJECTED"
                      ? "cancel"
                      : appointment.status === "IN_PROGRESS"
                        ? "videocam"
                        : "schedule"}
                </span>
                {status.label}
              </span>
            </div>
          </div>

          {/* Pharmacist info */}
          <div className="md:col-span-5 flex flex-col gap-2">
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Dược sĩ
            </label>
            {appointment.pharmacist ? (
              <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-blue-100 to-blue-50 dark:from-blue-950 dark:to-slate-800 ring-2 ring-white dark:ring-slate-700 overflow-hidden flex-shrink-0 flex items-center justify-center text-slate-600 dark:text-slate-400 font-bold uppercase text-sm shadow-md">
                  {appointment.pharmacist.image ? (
                    <img
                      src={appointment.pharmacist.image}
                      alt={appointment.pharmacist.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="material-symbols-outlined">person</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-slate-900 dark:text-white truncate">
                    {appointment.pharmacist.name}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                    {appointment.pharmacist.specialty || "Dược sĩ"}
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                <span className="material-symbols-outlined text-base">
                  hourglass
                </span>
                Đang phân công...
              </div>
            )}
          </div>
        </div>

        {/* Action buttons */}
        <div className="mt-5 pt-5 border-t border-slate-200 dark:border-slate-700 flex flex-wrap gap-2 justify-end">
          <button
            type="button"
            onClick={handleSetReminder}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg font-semibold text-xs sm:text-sm transition-colors ${
              reminderSet
                ? "bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/50"
                : "bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 border border-slate-200 dark:border-slate-600"
            }`}
          >
            <span className="material-symbols-outlined text-base">
              {reminderSet ? "notifications_active" : "notifications_none"}
            </span>
            {reminderSet ? "Đã đặt" : "Nhắc nhở"}
          </button>

          {canJoin && (
            <button
              type="button"
              onClick={handleJoin}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm transition-colors shadow-md hover:shadow-lg"
            >
              <span className="material-symbols-outlined text-base">
                videocam
              </span>
              Vào cuộc gọi
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ConsultationCard;
