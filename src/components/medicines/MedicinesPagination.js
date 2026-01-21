import React from "react";

const MedicinesPagination = ({
  page = 0,
  totalPages = 1,
  pageSize = 12,
  onPageChange,
  onPageSizeChange,
}) => {
  const pages = Array.from(
    { length: Math.min(totalPages, 5) },
    (_, idx) => idx,
  );
  return (
    <div className="mt-12 flex flex-col sm:flex-row justify-between items-center gap-4">
      <div className="text-sm text-slate-500 dark:text-slate-400">
        Hiển thị
        <select
          value={pageSize}
          onChange={(event) => onPageSizeChange?.(Number(event.target.value))}
          className="mx-2 rounded border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm focus:ring-primary focus:border-primary"
        >
          <option value={12}>12</option>
          <option value={24}>24</option>
          <option value={48}>48</option>
        </select>
        / trang
      </div>
      <nav className="flex items-center gap-1">
        <button
          className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50"
          disabled={page <= 0}
          onClick={() => onPageChange?.(Math.max(0, page - 1))}
        >
          <span className="material-symbols-outlined text-[20px]">
            chevron_left
          </span>
        </button>
        {pages.map((pageIndex) => (
          <button
            key={pageIndex}
            className={`size-9 rounded-lg border flex items-center justify-center transition-colors ${
              pageIndex === page
                ? "bg-primary text-white border-primary shadow-sm shadow-primary/30"
                : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
            }`}
            onClick={() => onPageChange?.(pageIndex)}
          >
            {pageIndex + 1}
          </button>
        ))}
        <button
          className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50"
          disabled={page >= totalPages - 1}
          onClick={() => onPageChange?.(Math.min(totalPages - 1, page + 1))}
        >
          <span className="material-symbols-outlined text-[20px]">
            chevron_right
          </span>
        </button>
      </nav>
    </div>
  );
};

export default MedicinesPagination;
