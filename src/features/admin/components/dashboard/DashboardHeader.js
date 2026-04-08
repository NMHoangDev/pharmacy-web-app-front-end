import React, { useMemo } from "react";

const ranges = [
  { key: "today", label: "Hôm nay" },
  { key: "week", label: "7 Ngày" },
  { key: "month", label: "30 Ngày" },
];

const DashboardHeader = ({
  activeRange,
  onRangeChange,
  branches = [],
  branchId,
  onBranchChange,
}) => {
  const rangeLabel = useMemo(() => {
    const found = ranges.find((r) => r.key === activeRange);
    return found?.label || "";
  }, [activeRange]);

  const branchLabel = useMemo(() => {
    const found = (branches || []).find((b) => b.id === branchId);
    return found?.name || "Tất cả chi nhánh";
  }, [branches, branchId]);

  return (
    <div className="flex flex-col justify-between gap-4 rounded-3xl border border-slate-200 bg-white px-5 py-5 shadow-sm shadow-slate-900/5 dark:border-slate-700 dark:bg-slate-900/70 sm:flex-row sm:items-center md:px-6">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">
          Quản trị viên
        </p>
        <h1 className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
          Tổng quan
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          {rangeLabel ? `Báo cáo ${rangeLabel.toLowerCase()}` : "Báo cáo"}
          {branchId ? ` • ${branchLabel}` : ""}
        </p>
      </div>
      <div className="flex flex-col self-start gap-3 sm:flex-row sm:self-center sm:items-center">
        {typeof onBranchChange === "function" && branches?.length ? (
          <div className="relative">
            <select
              value={branchId || ""}
              onChange={(e) => onBranchChange(e.target.value)}
              className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            >
              {branches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>
        ) : null}

        <div className="inline-flex rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
          {ranges.map((item) => {
            const isActive = activeRange === item.key;
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => onRangeChange(item.key)}
                className={`rounded-lg px-4 py-1.5 text-sm font-medium transition-all ${
                  isActive
                    ? "bg-white text-primary shadow-sm dark:bg-slate-700 dark:text-white"
                    : "text-slate-600 dark:text-slate-300"
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

export default DashboardHeader;
