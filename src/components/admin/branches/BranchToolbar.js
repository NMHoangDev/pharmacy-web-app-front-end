import React from "react";

const BranchToolbar = ({
  query,
  onQueryChange,
  statusFilter,
  onStatusFilterChange,
  cityFilter,
  onCityFilterChange,
  cityOptions,
  pageSize,
  onPageSizeChange,
  onReset,
}) => {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3 sm:p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-3">
          <div className="relative min-w-[220px] flex-1">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
              search
            </span>
            <input
              value={query}
              onChange={(e) => onQueryChange(e.target.value)}
              className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50 pl-10 pr-3 text-xs sm:h-10 sm:text-sm placeholder:text-slate-400 focus:border-primary focus:ring-primary"
              placeholder="Tìm theo tên / thành phố / mã chi nhánh..."
              type="text"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => onStatusFilterChange(e.target.value)}
            className="h-9 min-w-[140px] max-w-[220px] rounded-lg border border-slate-200 bg-slate-50 px-3 text-xs sm:h-10 sm:text-sm text-slate-600 focus:border-primary focus:ring-primary"
          >
            <option value="ALL">Tất cả trạng thái</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </select>

          <select
            value={cityFilter}
            onChange={(e) => onCityFilterChange(e.target.value)}
            className="h-9 min-w-[140px] max-w-[220px] rounded-lg border border-slate-200 bg-slate-50 px-3 text-xs sm:h-10 sm:text-sm text-slate-600 focus:border-primary focus:ring-primary"
          >
            <option value="ALL">Tất cả thành phố</option>
            {(cityOptions || []).map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select
            className="h-9 min-w-[120px] rounded-lg border border-slate-200 bg-slate-50 px-3 text-xs sm:h-10 sm:text-sm text-slate-600 focus:border-primary focus:ring-primary"
            value={pageSize}
            onChange={(e) => onPageSizeChange?.(Number(e.target.value))}
          >
            <option value={10}>10 / trang</option>
            <option value={20}>20 / trang</option>
            <option value={50}>50 / trang</option>
          </select>
          <button
            type="button"
            onClick={onReset}
            className="h-9 min-w-[120px] rounded-lg border border-slate-200 bg-white px-4 text-xs font-medium text-slate-600 hover:bg-slate-50 sm:h-10 sm:text-sm"
          >
            Đặt lại
          </button>
        </div>
      </div>
    </div>
  );
};

export default BranchToolbar;
