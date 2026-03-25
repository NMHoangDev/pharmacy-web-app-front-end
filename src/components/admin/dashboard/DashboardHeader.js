import React, { useMemo } from "react";

const DashboardHeader = ({
  activeRange,
  onRangeChange,
  branches = [],
  branchId,
  onBranchChange,
}) => {
  const ranges = [
    { key: "today", label: "Hôm nay" },
    { key: "week", label: "7 Ngày" },
    { key: "month", label: "30 Ngày" },
  ];

  const rangeLabel = useMemo(() => {
    const found = ranges.find((r) => r.key === activeRange);
    return found?.label || "";
  }, [activeRange]);

  const branchLabel = useMemo(() => {
    const found = (branches || []).find((b) => b.id === branchId);
    return found?.name || "Tất cả chi nhánh";
  }, [branches, branchId]);

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Tổng quan Admin
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
          {rangeLabel ? `Báo cáo ${rangeLabel.toLowerCase()}` : "Báo cáo"}
          {branchId ? ` • ${branchLabel}` : ""}
        </p>
      </div>
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center self-start sm:self-center">
        {typeof onBranchChange === "function" && branches?.length ? (
          <div className="relative">
            <select
              value={branchId || ""}
              onChange={(e) => onBranchChange(e.target.value)}
              className="h-9 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 text-sm text-slate-700 dark:text-slate-200"
            >
              {branches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>
        ) : null}

        <div className="bg-slate-200 dark:bg-slate-700/50 p-1 rounded-lg inline-flex">
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
    </div>
  );
};

export default DashboardHeader;
