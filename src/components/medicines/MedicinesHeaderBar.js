import React from "react";

const sortOptions = [
  { value: "best", label: "Bán chạy nhất" },
  { value: "price-asc", label: "Giá: Thấp đến Cao" },
  { value: "price-desc", label: "Giá: Cao đến Thấp" },
  { value: "newest", label: "Mới nhất" },
];

const MedicinesHeaderBar = () => {
  return (
    <div className="mb-6">
      <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
        Thuốc / Sản phẩm giảm đau
      </h1>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-surface-light dark:bg-surface-dark p-3 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
        <p className="text-sm text-slate-500 font-medium ml-1">
          Hiển thị{" "}
          <span className="font-semibold text-slate-700 dark:text-slate-200">
            1-9
          </span>{" "}
          trong{" "}
          <span className="font-semibold text-slate-700 dark:text-slate-200">
            48
          </span>{" "}
          sản phẩm
        </p>

        <div className="flex items-center gap-4 w-full sm:w-auto">
          <div className="flex items-center gap-2 flex-1 sm:flex-initial">
            <span className="text-sm text-slate-500 whitespace-nowrap hidden sm:block">
              Sắp xếp theo:
            </span>
            <div className="relative w-full sm:w-40">
              <select className="w-full appearance-none bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white text-sm rounded-lg focus:ring-primary focus:border-primary block p-2 pr-8 cursor-pointer">
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
                <span className="material-symbols-outlined text-[20px]">
                  expand_more
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center border-l border-slate-200 dark:border-slate-700 pl-4 gap-1">
            <button
              type="button"
              className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800"
              title="Dạng lưới"
            >
              <span className="material-symbols-outlined text-[20px]">
                grid_view
              </span>
            </button>
            <button
              type="button"
              className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800"
              title="Dạng danh sách"
            >
              <span className="material-symbols-outlined text-[20px]">
                view_list
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MedicinesHeaderBar;
