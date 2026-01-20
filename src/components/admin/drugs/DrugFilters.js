import React from "react";

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
  return (
    <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <div className="grid w-full grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_240px_220px_180px] items-center">
        <div className="relative w-full">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            search
          </span>
          <input
            className="h-11 w-full rounded-lg border border-slate-200 bg-slate-50 pl-10 pr-3 text-sm placeholder:text-slate-400 focus:border-primary focus:ring-primary dark:border-slate-600 dark:bg-slate-800 dark:text-white"
            placeholder="Tìm kiếm theo tên thuốc, mã SKU..."
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>

        <div className="w-full">
          <select
            className="h-11 w-full appearance-none rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-slate-600 focus:border-primary focus:ring-primary dark:border-slate-600 dark:bg-slate-800 dark:text-white"
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
        </div>

        <div className="w-full">
          <select
            className="h-11 w-full appearance-none rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-slate-600 focus:border-primary focus:ring-primary dark:border-slate-600 dark:bg-slate-800 dark:text-white"
            value={status}
            onChange={(e) => onStatusChange?.(e.target.value)}
          >
            <option value="ALL">Tất cả trạng thái</option>
            <option value="ACTIVE">Đang bán</option>
            <option value="INACTIVE">Ngừng bán</option>
          </select>
        </div>

        <div className="w-full">
          <select
            className="h-11 w-full appearance-none rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-slate-600 focus:border-primary focus:ring-primary dark:border-slate-600 dark:bg-slate-800 dark:text-white"
            value={sort}
            onChange={(e) => onSortChange?.(e.target.value)}
          >
            <option value="name,asc">Tên A → Z</option>
            <option value="name,desc">Tên Z → A</option>
            <option value="price,asc">Giá thấp → cao</option>
            <option value="price,desc">Giá cao → thấp</option>
            <option value="createdAt,desc">Mới nhất</option>
          </select>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {chips.map((chip) => {
          const isActive = filter === chip.key;
          return (
            <button
              key={chip.key}
              className={
                isActive
                  ? "whitespace-nowrap rounded-md bg-slate-900 px-6 py-3 text-base font-semibold text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-primary dark:bg-white dark:text-slate-900 shrink-0"
                  : "whitespace-nowrap rounded-md bg-slate-100 px-6 py-3 text-base font-medium text-slate-600 hover:bg-slate-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary dark:bg-slate-800 dark:text-slate-300 shrink-0"
              }
              onClick={() => onFilterChange(chip.key)}
              type="button"
            >
              {chip.label}
            </button>
          );
        })}

        <div className="ml-auto flex items-center gap-2">
          <select
            className="h-10 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-slate-600 focus:border-primary focus:ring-primary dark:border-slate-600 dark:bg-slate-800 dark:text-white"
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
            className="h-10 rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium text-slate-600 shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-primary dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
          >
            Đặt lại
          </button>
        </div>
      </div>
    </div>
  );
};

export default DrugFilters;
