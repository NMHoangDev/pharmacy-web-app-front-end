import React from "react";

const DashboardHeader = ({ activeRange, onRangeChange }) => {
  const ranges = [
    { key: "today", label: "Hôm nay" },
    { key: "week", label: "7 Ngày" },
    { key: "month", label: "30 Ngày" },
    { key: "custom", label: "Tùy chỉnh" },
  ];

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Xin chào, Admin 👋
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
          Đây là báo cáo hoạt động của nhà thuốc hôm nay.
        </p>
      </div>
      <div className="bg-slate-200 dark:bg-slate-700/50 p-1 rounded-lg inline-flex self-start sm:self-center">
        {ranges.map((item) => {
          const isActive = activeRange === item.key;
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => onRangeChange(item.key)}
              className={`px-4 py-1.5 rounded text-sm font-medium transition-all ${
                isActive
                  ? "bg-white dark:bg-slate-600 text-primary dark:text-white shadow-sm"
                  : "text-slate-600 dark:text-slate-300"
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default DashboardHeader;
