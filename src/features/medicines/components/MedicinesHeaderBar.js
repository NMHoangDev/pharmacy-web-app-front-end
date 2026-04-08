import React from "react";

const sortOptions = [
  { value: "best", label: "Bán chạy nhất" },
  { value: "price-asc", label: "Giá: Thấp đến Cao" },
  { value: "price-desc", label: "Giá: Cao đến Thấp" },
  { value: "newest", label: "Mới nhất" },
  { value: "name-asc", label: "Tên A → Z" },
  { value: "name-desc", label: "Tên Z → A" },
];

const MedicinesHeaderBar = ({
  total = 0,
  showing = 0,
  query,
  onQueryChange,
  sort,
  onSortChange,
  onOpenFilters,
  filtersCount = 0,
}) => {
  return (
    <div className="mb-3">
      <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-2">
        Thuốc &amp; sản phẩm
      </h1>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 bg-surface-light dark:bg-surface-dark p-2 rounded-lg border border-slate-200 dark:border-slate-700">
        <p className="text-xs sm:text-sm text-slate-500 font-medium">
          Hiển thị{" "}
          <span className="font-semibold text-slate-700 dark:text-slate-200">
            {showing}
          </span>{" "}
          trong{" "}
          <span className="font-semibold text-slate-700 dark:text-slate-200">
            {total}
          </span>{" "}
          sản phẩm
        </p>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            type="button"
            onClick={onOpenFilters}
            className="lg:hidden inline-flex items-center gap-2 h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-sm font-semibold"
          >
            <span className="material-symbols-outlined text-[20px]">tune</span>
            Lọc
            {filtersCount > 0 ? (
              <span className="ml-1 text-[11px] font-bold text-primary bg-primary/10 ring-1 ring-primary/15 px-2 py-0.5 rounded-full">
                {filtersCount}
              </span>
            ) : null}
          </button>

          <div className="relative flex-1 sm:flex-initial sm:w-64">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">
              search
            </span>
            <input
              value={query}
              onChange={(event) => onQueryChange?.(event.target.value)}
              placeholder="Tìm thuốc, sản phẩm..."
              className="w-full rounded-lg border border-slate-200 bg-white dark:bg-slate-800 pl-10 pr-3 py-1.5 text-sm text-slate-700 dark:text-slate-200 focus:border-primary focus:ring-primary"
            />
          </div>
          <div className="flex items-center gap-2 flex-1 sm:flex-initial">
            <span className="text-sm text-slate-500 whitespace-nowrap hidden lg:block">
              Sắp xếp theo:
            </span>
            <div className="relative w-full sm:w-40">
              <select
                value={sort}
                onChange={(event) => onSortChange?.(event.target.value)}
                className="w-full appearance-none bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white text-sm rounded-lg focus:ring-primary focus:border-primary block p-1.5 pr-8 cursor-pointer"
              >
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
        </div>
      </div>
    </div>
  );
};

export default MedicinesHeaderBar;
