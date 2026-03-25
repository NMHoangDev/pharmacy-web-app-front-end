import React from "react";
import CommonFilterBar from "../../common/FilterBar";
import { ScopeFilter, SortKey } from "./discountTypes";

const tabChips = [
  { key: "ALL", label: "Tất cả" },
  { key: "ACTIVE", label: "Đang chạy" },
  { key: "SCHEDULED", label: "Sắp diễn ra" },
  { key: "EXPIRED", label: "Hết hạn" },
  { key: "DISABLED", label: "Đã tắt" },
];

const DiscountFilters = ({
  search,
  onSearchChange,
  scope,
  onScopeChange,
  status,
  onStatusChange,
  type,
  onTypeChange,
  sort,
  onSortChange,
  pageSize,
  onPageSizeChange,
  quickTab,
  onQuickTabChange,
  onReset,
}) => {
  const controls = (
    <>
      <div className="relative min-w-[220px] flex-1">
        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
          search
        </span>
        <input
          className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50 pl-10 pr-3 text-xs sm:h-10 sm:text-sm placeholder:text-slate-400 focus:border-primary focus:ring-primary"
          placeholder="Tìm kiếm theo tên chương trình, mã giảm giá"
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      <select
        className="h-9 min-w-[160px] max-w-[240px] rounded-lg border border-slate-200 bg-slate-50 px-3 text-xs sm:h-10 sm:text-sm text-slate-600 focus:border-primary focus:ring-primary"
        value={scope}
        onChange={(e) => onScopeChange?.(e.target.value)}
      >
        <option value={ScopeFilter.ALL}>Tất cả phạm vi</option>
        <option value={ScopeFilter.SYSTEM}>Toàn hệ thống</option>
        <option value={ScopeFilter.PRODUCT}>Theo sản phẩm</option>
        <option value={ScopeFilter.CATEGORY}>Theo danh mục</option>
      </select>

      <select
        className="h-9 min-w-[160px] max-w-[240px] rounded-lg border border-slate-200 bg-slate-50 px-3 text-xs sm:h-10 sm:text-sm text-slate-600 focus:border-primary focus:ring-primary"
        value={status}
        onChange={(e) => onStatusChange?.(e.target.value)}
      >
        <option value="ALL">Tất cả trạng thái</option>
        <option value="ACTIVE">Đang hoạt động</option>
        <option value="SCHEDULED">Sắp diễn ra</option>
        <option value="EXPIRED">Đã hết hạn</option>
        <option value="DISABLED">Đã tắt</option>
      </select>

      <select
        className="h-9 min-w-[160px] max-w-[240px] rounded-lg border border-slate-200 bg-slate-50 px-3 text-xs sm:h-10 sm:text-sm text-slate-600 focus:border-primary focus:ring-primary"
        value={type}
        onChange={(e) => onTypeChange?.(e.target.value)}
      >
        <option value="ALL">Tất cả loại</option>
        <option value="PERCENT">Phần trăm (%)</option>
        <option value="FIXED">Số tiền cố định</option>
        <option value="FREESHIP">Freeship</option>
      </select>

      <select
        className="h-9 min-w-[160px] max-w-[240px] rounded-lg border border-slate-200 bg-slate-50 px-3 text-xs sm:h-10 sm:text-sm text-slate-600 focus:border-primary focus:ring-primary"
        value={sort}
        onChange={(e) => onSortChange?.(e.target.value)}
      >
        <option value={SortKey.NEWEST}>Mới nhất</option>
        <option value={SortKey.EXPIRING_SOON}>Sắp hết hạn</option>
        <option value={SortKey.HIGHEST_VALUE}>Giá trị cao nhất</option>
      </select>
    </>
  );

  const trailing = (
    <>
      <select
        className="h-9 min-w-[140px] max-w-[220px] rounded-lg border border-slate-200 bg-slate-50 px-3 text-xs sm:h-10 sm:text-sm text-slate-600 focus:border-primary focus:ring-primary"
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
        className="h-9 min-w-[140px] max-w-[220px] rounded-lg border border-slate-200 bg-white px-4 text-xs font-medium text-slate-600 hover:bg-slate-50 sm:h-10 sm:text-sm"
      >
        Đặt lại
      </button>
    </>
  );

  const footer = (
    <div className="flex flex-wrap items-center gap-2">
      {tabChips.map((chip) => {
        const isActive = quickTab === chip.key;
        return (
          <button
            key={chip.key}
            className={
              isActive
                ? "whitespace-nowrap rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm"
                : "whitespace-nowrap rounded-md bg-slate-100 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-200 shadow-sm"
            }
            onClick={() => onQuickTabChange?.(chip.key)}
            type="button"
          >
            {chip.label}
          </button>
        );
      })}
    </div>
  );

  return (
    <CommonFilterBar controls={controls} trailing={trailing} footer={footer} />
  );
};

export default DiscountFilters;
