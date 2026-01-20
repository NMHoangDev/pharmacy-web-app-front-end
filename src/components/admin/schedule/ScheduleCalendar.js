import React, { useMemo } from "react";

const ScheduleCalendar = ({
  monthLabel,
  daysInMonth,
  summary,
  selectedDate,
  onSelectDate,
}) => {
  const days = useMemo(() => {
    return Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
      const dateKey = `${summary.year}-${summary.month}-${String(day).padStart(
        2,
        "0"
      )}`;
      const info = summary.map[dateKey] || {
        total: 0,
        pending: 0,
        confirmed: 0,
        cancelled: 0,
      };
      return { day, dateKey, info };
    });
  }, [daysInMonth, summary]);

  return (
    <div className="bg-surface-light dark:bg-surface-dark rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-4">
      <div className="flex items-center justify-between mb-4 px-2">
        <p className="text-text-main dark:text-white text-base font-bold leading-tight">
          {monthLabel}
        </p>
      </div>
      <div className="grid grid-cols-7 gap-y-2 mb-2">
        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
          <div
            key={d}
            className="text-[#4c739a] dark:text-slate-500 text-[11px] font-bold uppercase tracking-wider text-center h-8 flex items-center justify-center"
          >
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-y-2">
        <div className="h-9" />
        <div className="h-9" />
        <div className="h-9" />
        {days.map((day) => {
          const isSelected = selectedDate === day.dateKey;
          const hasAppointments = day.info.total > 0;
          const colorDot = day.info.cancelled
            ? "bg-red-500"
            : day.info.pending
            ? "bg-orange-500"
            : day.info.confirmed
            ? "bg-green-500"
            : "bg-white";
          return (
            <button
              key={day.dateKey}
              type="button"
              onClick={() => onSelectDate(day.dateKey)}
              className="h-9 w-full flex items-center justify-center"
            >
              <span
                className={`size-8 flex items-center justify-center rounded-full text-sm transition-colors relative ${
                  isSelected
                    ? "text-white bg-primary font-bold shadow-md shadow-blue-500/30"
                    : "text-[#0d141b] dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                }`}
              >
                {day.day}
                {hasAppointments && (
                  <span
                    className={`absolute bottom-1 w-1 h-1 rounded-full ${colorDot}`}
                  />
                )}
              </span>
            </button>
          );
        })}
      </div>
      <div className="mt-6 flex flex-col gap-2 border-t border-slate-100 dark:border-slate-700 pt-4">
        <h4 className="text-xs font-bold text-[#4c739a] dark:text-slate-400 uppercase tracking-wider mb-1">
          Ghi chú màu
        </h4>
        <div className="flex items-center gap-3 text-sm text-text-main dark:text-slate-300">
          <span className="w-2 h-2 rounded-full bg-green-500" /> Đã xác nhận
          <span className="w-2 h-2 rounded-full bg-orange-500" /> Đang chờ
          <span className="w-2 h-2 rounded-full bg-red-500" /> Đã hủy
        </div>
      </div>
    </div>
  );
};

export default ScheduleCalendar;
