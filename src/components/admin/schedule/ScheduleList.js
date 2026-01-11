import React from "react";

const statusBadge = (status) => {
  const map = {
    pending: {
      label: "Pending",
      color: "bg-orange-100",
      text: "text-orange-700",
    },
    confirmed: {
      label: "Confirmed",
      color: "bg-green-100",
      text: "text-green-700",
    },
    cancelled: {
      label: "Cancelled",
      color: "bg-red-100",
      text: "text-red-700",
    },
    completed: {
      label: "Completed",
      color: "bg-slate-100",
      text: "text-slate-700",
    },
  };
  const cfg = map[status] || map.pending;
  return (
    <span
      className={`px-2 py-0.5 rounded-full text-xs font-bold border ${cfg.color} ${cfg.text} border-transparent`}
    >
      {cfg.label}
    </span>
  );
};

const ScheduleList = ({ appointments, onUpdateStatus }) => {
  return (
    <div className="flex flex-col gap-4">
      {appointments.length === 0 && (
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-6 bg-white dark:bg-surface-dark text-sm text-slate-500">
          Không có lịch hẹn trong ngày này.
        </div>
      )}
      {appointments.map((item) => (
        <div
          key={item.id}
          className={`group bg-surface-light dark:bg-surface-dark rounded-xl border border-[#e7edf3] dark:border-slate-700 shadow-sm hover:shadow-md transition-all p-5 flex flex-col gap-4 relative overflow-hidden ${
            item.status === "pending"
              ? "ring-1 ring-orange-200"
              : item.status === "cancelled"
              ? "opacity-80"
              : ""
          }`}
        >
          <div
            className={`absolute top-0 left-0 w-1 h-full ${
              item.status === "pending"
                ? "bg-orange-500"
                : item.status === "confirmed"
                ? "bg-green-500"
                : item.status === "cancelled"
                ? "bg-red-400"
                : "bg-slate-400"
            }`}
          />
          <div className="flex flex-col md:flex-row justify-between md:items-start gap-4">
            <div className="flex gap-4 md:gap-6 items-start">
              <div className="flex flex-col items-center min-w-[60px]">
                <span className="text-xl font-bold text-[#0d141b] dark:text-white">
                  {item.time}
                </span>
                <span className="text-xs font-medium text-[#4c739a] dark:text-slate-500 uppercase">
                  {item.period}
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-3">
                  <div
                    className="size-8 rounded-full bg-center bg-cover shadow-inner"
                    style={{ backgroundImage: `url(${item.customerAvatar})` }}
                    aria-label={item.customer}
                  />
                  <h4 className="font-bold text-[#0d141b] dark:text-white text-lg cursor-pointer hover:text-primary transition-colors">
                    {item.customer}
                  </h4>
                  <span className="hidden sm:flex">
                    {statusBadge(item.status)}
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 mt-1 text-sm">
                  <div className="flex items-center gap-1 text-[#4c739a] dark:text-slate-400">
                    <span className="material-symbols-outlined text-[16px]">
                      local_pharmacy
                    </span>
                    <span>DS: </span>
                    <span className="text-[#0d141b] dark:text-slate-200 font-medium">
                      {item.pharmacist}
                    </span>
                  </div>
                  <div className="hidden sm:block w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600" />
                  <div className="flex items-center gap-1 text-[#4c739a] dark:text-slate-400">
                    <span className="material-symbols-outlined text-[16px]">
                      pill
                    </span>
                    <span>{item.topic}</span>
                  </div>
                </div>
                <div className="sm:hidden mt-2">{statusBadge(item.status)}</div>
              </div>
            </div>
            <div className="flex items-center gap-2 md:self-center mt-2 md:mt-0 ml-[76px] md:ml-0">
              <button
                type="button"
                onClick={() => onUpdateStatus(item.id, "cancelled")}
                className="h-9 px-3 rounded-lg flex items-center justify-center gap-1 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/10 hover:bg-red-100 dark:hover:bg-red-900/30 border border-transparent hover:border-red-200 dark:hover:border-red-800 transition-colors text-sm font-medium"
              >
                <span className="material-symbols-outlined text-[18px]">
                  close
                </span>
                <span className="hidden sm:inline">Hủy</span>
              </button>
              <button
                type="button"
                onClick={() => onUpdateStatus(item.id, "confirmed")}
                className="h-9 px-4 rounded-lg flex items-center justify-center gap-1 text-white bg-primary hover:bg-blue-600 shadow-sm hover:shadow text-sm font-medium transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">
                  check
                </span>
                <span>Xác nhận</span>
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ScheduleList;
