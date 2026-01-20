import React from "react";

const statuses = [
  { key: "all", label: "Tất cả" },
  { key: "pending", label: "Chờ xử lý" },
  { key: "processing", label: "Đang xử lý" },
  { key: "shipped", label: "Đã gửi" },
  { key: "completed", label: "Hoàn tất" },
  { key: "cancelled", label: "Hủy" },
];

const OrdersToolbar = ({ search, onSearchChange, status, onStatusChange }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mb-6">
      <div className="lg:col-span-4 relative group">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary transition-colors">
          <span className="material-symbols-outlined">search</span>
        </div>
        <input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg leading-5 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary sm:text-sm transition-all shadow-sm"
          placeholder="Tìm mã đơn, tên khách hàng..."
          type="text"
        />
      </div>
      <div className="lg:col-span-8 flex flex-wrap gap-3 items-center">
        <div className="flex gap-2 overflow-x-auto pb-1 sm:pb-0">
          {statuses.map((item) => {
            const isActive = status === item.key;
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => onStatusChange(item.key)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  isActive
                    ? "bg-primary text-white shadow-sm"
                    : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default OrdersToolbar;
