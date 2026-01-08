import React from "react";

const MedicinesPagination = () => {
  return (
    <div className="mt-12 flex flex-col sm:flex-row justify-between items-center gap-4">
      <div className="text-sm text-slate-500 dark:text-slate-400">
        Hiển thị
        <select className="mx-2 rounded border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm focus:ring-primary focus:border-primary">
          <option>12</option>
          <option>24</option>
          <option>48</option>
        </select>
        / trang
      </div>
      <nav className="flex items-center gap-1">
        <button className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50">
          <span className="material-symbols-outlined text-[20px]">
            chevron_left
          </span>
        </button>
        <button className="size-9 rounded-lg bg-primary text-white font-medium flex items-center justify-center shadow-sm shadow-primary/30">
          1
        </button>
        <button className="size-9 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-center transition-colors">
          2
        </button>
        <button className="size-9 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-center transition-colors">
          3
        </button>
        <span className="px-2 text-slate-400">...</span>
        <button className="size-9 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-center transition-colors">
          8
        </button>
        <button className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800">
          <span className="material-symbols-outlined text-[20px]">
            chevron_right
          </span>
        </button>
      </nav>
    </div>
  );
};

export default MedicinesPagination;
