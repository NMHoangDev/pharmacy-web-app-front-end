import React from "react";
import CommonFilterBar from "../../common/FilterBar";

const chips = [
  { key: "all", label: "Tất cả" },
  { key: "out", label: "Hết hàng" },
  { key: "low", label: "Sắp hết" },
  { key: "rx", label: "Thuốc kê đơn" },
];

const DrugFilters = ({
  search,
  onSearchChange,
  filter,
  onFilterChange,
  categories = [],
  categoryId,
  onCategoryChange,
  status,
  onStatusChange,
  sort,
  onSortChange,
  pageSize,
  onPageSizeChange,
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
          placeholder="Tìm kiếm theo tên thuốc, mã SKU..."
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      <select
        className="h-9 min-w-[140px] max-w-[220px] rounded-lg border border-slate-200 bg-slate-50 px-3 text-xs sm:h-10 sm:text-sm text-slate-600 focus:border-primary focus:ring-primary"
        value={categoryId || ""}
        onChange={(e) => onCategoryChange?.(e.target.value)}
      >
        <option value="">Tất cả danh mục</option>
        {categories.map((category) => (
          <option key={category.id} value={category.id}>
            {category.name}
          </option>
        ))}
      </select>

      <select
        className="h-9 min-w-[140px] max-w-[220px] rounded-lg border border-slate-200 bg-slate-50 px-3 text-xs sm:h-10 sm:text-sm text-slate-600 focus:border-primary focus:ring-primary"
        value={status}
        onChange={(e) => onStatusChange?.(e.target.value)}
      >
        <option value="ALL">Tất cả trạng thái</option>
        <option value="ACTIVE">Đang bán</option>
        <option value="INACTIVE">Ngừng bán</option>
      </select>

      <select
        className="h-9 min-w-[140px] max-w-[220px] rounded-lg border border-slate-200 bg-slate-50 px-3 text-xs sm:h-10 sm:text-sm text-slate-600 focus:border-primary focus:ring-primary"
        value={sort}
        onChange={(e) => onSortChange?.(e.target.value)}
      >
        <option value="name,asc">Tên A - Z</option>
        <option value="name,desc">Tên Z - A</option>
        <option value="salePrice,asc">Giá thấp - cao</option>
        <option value="salePrice,desc">Giá cao - thấp</option>
        <option value="createdAt,desc">Mới nhất</option>
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
      {chips.map((chip) => {
        const isActive = filter === chip.key;
        return (
          <button
            key={chip.key}
            className={
              isActive
                ? "whitespace-nowrap rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm"
                : "whitespace-nowrap rounded-md bg-slate-100 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-200 shadow-sm"
            }
            onClick={() => onFilterChange(chip.key)}
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

export default DrugFilters;
