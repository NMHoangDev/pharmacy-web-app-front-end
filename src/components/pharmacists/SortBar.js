import React from "react";

const SortBar = ({ total = 0 }) => {
  return (
    <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-2 border-b border-slate-200 dark:border-slate-700">
      <p className="text-sm text-slate-500 font-medium">
        <span className="text-slate-900 dark:text-white font-bold">
          {total}
        </span>{" "}
        dược sĩ phù hợp
      </p>
      <div className="flex items-center gap-3">
        <div className="relative">
          <select className="appearance-none bg-[#e7edf3] dark:bg-slate-800 border-none text-slate-900 dark:text-white text-sm font-medium rounded-lg py-2 pl-4 pr-10 focus:ring-2 focus:ring-primary cursor-pointer">
            <option>Nổi bật nhất</option>
            <option>Đánh giá cao nhất</option>
            <option>Kinh nghiệm cao nhất</option>
            <option>Tư vấn nhiều nhất</option>
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
            <span className="material-symbols-outlined text-lg">
              expand_more
            </span>
          </div>
        </div>
        <div className="flex bg-[#e7edf3] dark:bg-slate-800 rounded-lg p-1 gap-1">
          <button className="p-1.5 rounded bg-white dark:bg-slate-900 shadow-sm text-primary">
            <span className="material-symbols-outlined text-xl">grid_view</span>
          </button>
          <button className="p-1.5 rounded text-slate-500 hover:bg-white hover:text-slate-900 transition-all">
            <span className="material-symbols-outlined text-xl">view_list</span>
          </button>
        </div>
      </div>
    </section>
  );
};

export default SortBar;
