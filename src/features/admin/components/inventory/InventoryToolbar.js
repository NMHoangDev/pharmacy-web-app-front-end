import React, { useEffect, useMemo, useState } from "react";
import BranchSelect from "../shared/BranchSelect";
import FilterBar from "../../../../shared/components/common/FilterBar";

const useDebounce = (value, delay = 350) => {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return v;
};

const InventoryToolbar = ({
  filters,
  onChange,
  categories = [],
  branches = [],
  branchId = "",
  onBranchChange,
  branchLoading = false,
  branchEmptyLabel = "Chọn chi nhánh",
  pageSize = 20,
  onPageSizeChange,
  onReset,
  onAdd,
}) => {
  const merged = useMemo(
    () => ({
      query: "",
      category: "all",
      status: "all",
      ...(filters || {}),
    }),
    [filters],
  );

  const [q, setQ] = useState(merged.query || "");
  useEffect(() => setQ(merged.query || ""), [merged.query]);

  const dq = useDebounce(q, 300);
  useEffect(() => {
    if (dq !== merged.query) onChange?.({ ...merged, query: dq });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dq]);

  const tabs = [
    { key: "all", label: "Tất cả" },
    { key: "in", label: "Còn hàng" },
    { key: "low", label: "Sắp hết" },
    { key: "out", label: "Hết hàng" },
  ];

  const controls = (
    <>
      <div className="relative min-w-[220px] flex-1">
        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
          search
        </span>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Tìm theo tên sản phẩm hoặc SKU..."
          className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50 pl-10 pr-3 text-xs text-slate-900 outline-none transition
                   placeholder:text-slate-400 focus:border-primary focus:ring-primary sm:h-10 sm:text-sm"
        />
      </div>

      <div className="h-9 min-w-[200px] flex-1 sm:h-10">
        <BranchSelect
          branches={branches}
          value={branchId}
          onChange={onBranchChange}
          loading={branchLoading}
          emptyLabel={branchEmptyLabel}
          size="sm"
        />
      </div>

      <select
        className="h-9 min-w-[140px] max-w-[260px] rounded-lg border border-slate-200 bg-slate-50 px-3 text-xs text-slate-600 focus:border-primary focus:ring-primary sm:h-10 sm:text-sm"
        value={merged.category === "all" ? "" : merged.category}
        onChange={(e) =>
          onChange?.({ ...merged, category: e.target.value || "all" })
        }
      >
        <option value="">Tất cả danh mục</option>
        {categories.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>
    </>
  );

  const trailing = (
    <div className="flex flex-wrap items-center gap-3">
      <select
        className="h-9 min-w-[140px] max-w-[220px] rounded-lg border border-slate-200 bg-slate-50 px-3 text-xs text-slate-600 focus:border-primary focus:ring-primary sm:h-10 sm:text-sm"
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

      {onAdd ? (
        <button
          type="button"
          onClick={onAdd}
          className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-xs font-semibold text-white shadow-sm hover:bg-primary/90 sm:h-10 sm:text-sm"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          Thêm
        </button>
      ) : null}
    </div>
  );

  const footer = (
    <div className="flex flex-wrap items-center gap-2">
      {tabs.map((tab) => {
        const isActive = merged.status === tab.key;
        return (
          <button
            key={tab.key}
            type="button"
            onClick={() => onChange?.({ ...merged, status: tab.key })}
            className={
              isActive
                ? "whitespace-nowrap rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm"
                : "whitespace-nowrap rounded-md bg-slate-100 px-4 py-2 text-sm font-medium text-slate-600 shadow-sm hover:bg-slate-200"
            }
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );

  return <FilterBar controls={controls} trailing={trailing} footer={footer} />;
};

export default InventoryToolbar;
