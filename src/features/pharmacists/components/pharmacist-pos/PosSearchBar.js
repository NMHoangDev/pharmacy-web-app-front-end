import React from "react";

const PosSearchBar = ({
  query,
  onQueryChange,
  onSearch,
  branchId,
  onBranchIdChange,
  branches,
  branchLoading,
  loading,
}) => {
  const branchOptions = Array.isArray(branches) ? branches : [];

  return (
    <div className="p-4 pb-2 md:p-6">
      <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
        <div className="grid grid-cols-1 items-end gap-3 lg:grid-cols-[minmax(0,1fr)_280px_140px]">
          <label className="block min-w-0">
            <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Tìm theo tên sản phẩm
            </span>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[20px] text-slate-400">
                search
              </span>
              <input
                className="h-11 w-full rounded-lg border border-slate-200 bg-slate-100 pl-11 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-transparent focus:ring-2 focus:ring-primary dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                placeholder="Nhập tên sản phẩm..."
                value={query}
                onChange={(e) => onQueryChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") onSearch();
                }}
              />
            </div>
          </label>

          <label className="block min-w-0">
            <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Chi nhánh
            </span>
            <select
              className="h-11 w-full rounded-lg border border-slate-200 bg-slate-100 px-3 text-sm text-slate-900 focus:border-transparent focus:ring-2 focus:ring-primary dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              value={branchId}
              onChange={(e) => onBranchIdChange(e.target.value)}
              disabled={branchLoading}
            >
              <option value="">
                {branchLoading ? "Đang tải chi nhánh..." : "Tất cả chi nhánh"}
              </option>
              {branchOptions.map((branch) => (
                <option key={branch.id} value={branch.id}>
                  {branch.name || branch.code || branch.id}
                </option>
              ))}
            </select>
          </label>

          <button
            type="button"
            className="h-11 rounded-lg bg-primary px-4 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
            onClick={onSearch}
            disabled={loading}
          >
            {loading ? "Đang tải..." : "Tìm kiếm"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PosSearchBar;
