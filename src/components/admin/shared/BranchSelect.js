import React, { useMemo } from "react";

const formatBranchOption = (branch) => {
  const name = branch?.name || "";
  const code = branch?.code ? ` · ${branch.code}` : "";
  return `${name}${code}`.trim() || branch?.id || "(Không tên)";
};

const BranchSelect = ({
  branches = [],
  value = "",
  onChange,
  loading = false,
  disabled = false,
  emptyLabel = "Tất cả chi nhánh",
  className = "",
}) => {
  const normalized = useMemo(
    () => (Array.isArray(branches) ? branches.filter(Boolean) : []),
    [branches],
  );

  return (
    <div className={`relative w-full min-w-0 ${className}`.trim()}>
      <select
        value={value}
        disabled={disabled || loading}
        onChange={(e) => onChange?.(e.target.value)}
        className="appearance-none h-10 w-full cursor-pointer rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 focus:border-primary focus:ring-1 focus:ring-primary disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
      >
        <option value="">
          {loading ? "Đang tải chi nhánh..." : emptyLabel}
        </option>
        {normalized.map((branch) => (
          <option key={branch.id} value={branch.id}>
            {formatBranchOption(branch)}
          </option>
        ))}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
        <span className="material-symbols-outlined text-lg">expand_more</span>
      </div>
    </div>
  );
};

export default BranchSelect;
