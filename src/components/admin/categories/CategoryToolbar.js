import React from "react";

const CategoryToolbar = ({ onAdd, onExpandAll, onCollapseAll }) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-text-main dark:text-white">
          Quản lý danh mục
        </h2>
        <p className="text-sm text-text-secondary dark:text-slate-400">
          Tổ chức cấu trúc danh mục và trạng thái hiển thị trên cửa hàng.
        </p>
      </div>
      <div className="flex items-center gap-2">
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
          onClick={onAdd}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-surface-dark"
        >
          <span className="material-symbols-outlined text-[20px]">add</span>
          Thêm danh mục
        </button>
      </div>
    </div>
  );
};

export default CategoryToolbar;
