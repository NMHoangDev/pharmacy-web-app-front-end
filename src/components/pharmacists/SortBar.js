import React from "react";

const SortBar = ({ total = 0 }) => {
  return (
    <section className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-slate-600">
          <span className="font-semibold text-slate-900">{total}</span> dược sĩ
          phù hợp
        </p>

        <div className="flex items-center gap-2">
          <div className="relative">
            <select className="h-9 appearance-none rounded-md border border-slate-200 bg-white pl-3 pr-9 text-sm text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100">
              <option>Nổi bật nhất</option>
              <option>Đánh giá cao nhất</option>
              <option>Kinh nghiệm cao nhất</option>
              <option>Tư vấn nhiều nhất</option>
            </select>
            <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-slate-400">
              <span className="material-symbols-outlined text-base">
                expand_more
              </span>
            </span>
          </div>

          <div className="flex items-center rounded-md border border-slate-200 bg-white p-0.5">
            <button className="grid h-8 w-8 place-items-center rounded bg-slate-100 text-slate-700">
              <span className="material-symbols-outlined text-[18px]">
                grid_view
              </span>
            </button>
            <button className="grid h-8 w-8 place-items-center rounded text-slate-500 hover:bg-slate-50 transition-colors">
              <span className="material-symbols-outlined text-[18px]">
                view_list
              </span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SortBar;
