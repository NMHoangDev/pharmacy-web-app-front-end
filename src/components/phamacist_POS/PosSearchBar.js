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
    <div className="p-4 md:p-6 pb-2">
      <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_280px_140px] gap-3 items-end">
          <label className="block min-w-0">
            <span className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">
              Tìm theo tên sản phẩm
            </span>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">
                search
              </span>
              <input
                className="w-full h-11 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-primary focus:border-transparent pl-11 pr-3 text-sm"
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
            <span className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">
              Chi nhánh
            </span>
            <select
              className="w-full h-11 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white px-3 text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
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
            className="h-11 rounded-lg bg-primary text-white font-semibold text-sm px-4 hover:opacity-90 disabled:opacity-50"
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
