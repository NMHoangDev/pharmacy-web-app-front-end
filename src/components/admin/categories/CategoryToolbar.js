import React from "react";

const CategoryToolbar = ({
  onAdd,
  onExpandAll,
  onCollapseAll,
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  sortBy,
  onSortByChange,
  onRefresh,
  totalCount,
}) => {
  return (
    <div className="flex flex-col gap-4 mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-text-main dark:text-white">
            Quản lý danh mục
          </h2>
          <p className="text-sm text-text-secondary dark:text-slate-400">
            Tổ chức cấu trúc danh mục và trạng thái hiển thị trên cửa hàng.
          </p>
          {typeof totalCount === "number" && (
            <p className="text-xs text-text-secondary dark:text-slate-500 mt-1">
              Tổng {totalCount.toLocaleString("vi-VN")} danh mục
            </p>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onCollapseAll}
            className="inline-flex items-center gap-2 rounded-lg border border-border-light bg-white px-3 py-2 text-sm font-medium text-text-main shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-primary dark:border-border-dark dark:bg-surface-dark dark:text-white"
          >
            <span className="material-symbols-outlined text-[18px]">
              unfold_less
            </span>
            Thu gọn
          </button>
          <button
            type="button"
            onClick={onExpandAll}
            className="inline-flex items-center gap-2 rounded-lg border border-border-light bg-white px-3 py-2 text-sm font-medium text-text-main shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-primary dark:border-border-dark dark:bg-surface-dark dark:text-white"
          >
            <span className="material-symbols-outlined text-[18px]">
              unfold_more
            </span>
            Mở rộng
          </button>
          <button
            type="button"
            onClick={onRefresh}
            className="inline-flex items-center gap-2 rounded-lg border border-border-light bg-white px-3 py-2 text-sm font-medium text-text-main shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-primary dark:border-border-dark dark:bg-surface-dark dark:text-white"
          >
            <span className="material-symbols-outlined text-[18px]">
              refresh
            </span>
            Làm mới
          </button>
          <button
            type="button"
            onClick={onAdd}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-surface-dark"
          >
            <span className="material-symbols-outlined text-[20px]">add</span>
            Thêm danh mục
          </button>
        </div>
      </div>
      <div className="grid w-full grid-cols-1 gap-3 md:grid-cols-[minmax(0,1fr)_200px_200px]">
        <div className="relative">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            search
          </span>
          <input
            className="h-10 w-full rounded-lg border border-border-light bg-background-light pl-10 pr-3 text-sm text-text-main focus:border-primary focus:ring-primary dark:border-border-dark dark:bg-background-dark dark:text-white"
            placeholder="Tìm theo tên hoặc slug..."
            value={search}
            onChange={(e) => onSearchChange?.(e.target.value)}
          />
        </div>
        <select
          className="h-10 w-full appearance-none rounded-lg border border-border-light bg-background-light px-3 text-sm text-text-main focus:border-primary focus:ring-primary dark:border-border-dark dark:bg-background-dark dark:text-white"
          value={statusFilter}
          onChange={(e) => onStatusFilterChange?.(e.target.value)}
        >
          <option value="all">Tất cả trạng thái</option>
          <option value="active">Đang hiển thị</option>
          <option value="inactive">Đang ẩn</option>
        </select>
        <select
          className="h-10 w-full appearance-none rounded-lg border border-border-light bg-background-light px-3 text-sm text-text-main focus:border-primary focus:ring-primary dark:border-border-dark dark:bg-background-dark dark:text-white"
          value={sortBy}
          onChange={(e) => onSortByChange?.(e.target.value)}
        >
          <option value="name-asc">Tên A → Z</option>
          <option value="name-desc">Tên Z → A</option>
          <option value="order-asc">Thứ tự tăng dần</option>
          <option value="order-desc">Thứ tự giảm dần</option>
          <option value="created-desc">Mới nhất</option>
        </select>
      </div>
    </div>
  );
};

export default CategoryToolbar;
