import React from "react";

const chips = [
  { key: "all", label: "Tất cả" },
  { key: "active", label: "Đang bán" },
  { key: "out", label: "Hết hàng" },
  { key: "rx", label: "Thuốc kê đơn" },
  { key: "low", label: "Sắp hết" },
];

const DrugFilters = ({ search, onSearchChange, filter, onFilterChange }) => {
  return (
    <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div className="relative w-full md:max-w-md">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            search
          </span>
          <input
            className="h-11 w-full rounded-lg border border-slate-200 bg-slate-50 pl-10 pr-3 text-sm placeholder:text-slate-400 focus:border-primary focus:ring-primary dark:border-slate-600 dark:bg-slate-800 dark:text-white"
            placeholder="Tìm kiếm theo tên thuốc, mã SKU..."
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>

        <div className="flex flex-1 w-full overflow-x-auto gap-2 pb-1 md:pb-0">
          {chips.map((chip) => {
            const isActive = filter === chip.key;
            return (
              <button
                key={chip.key}
                className={
                  isActive
                    ? "whitespace-nowrap rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white dark:bg-white dark:text-slate-900"
                    : "whitespace-nowrap rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
                }
                onClick={() => onFilterChange(chip.key)}
                type="button"
              >
                {chip.label}
              </button>
            );
          })}
        </div>

        <button
          className="flex shrink-0 items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
          type="button"
          onClick={() => alert("Bộ lọc nâng cao sẽ được bổ sung.")}
        >
          <span className="material-symbols-outlined text-[18px]">
            filter_list
          </span>
          Bộ lọc
        </button>
      </div>
    </div>
  );
};

export default DrugFilters;
