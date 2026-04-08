import React from "react";

const PharmacistsPagination = ({ total = 0, showing = 0 }) => {
  const from = total > 0 ? 1 : 0;
  const to = Math.min(showing, total || showing);

  return (
    <section className="mt-1 flex flex-col items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm sm:flex-row">
      <p className="text-sm text-slate-600">
        Hiển thị <span className="font-semibold text-slate-900">{from}</span> -{" "}
        <span className="font-semibold text-slate-900">{to}</span> trong số{" "}
        <span className="font-semibold text-slate-900">{total}</span> dược sĩ
      </p>
      <div className="flex items-center gap-2">
        <button
          className="grid h-8 w-8 place-items-center rounded-md border border-slate-200 text-slate-500 opacity-60"
          disabled
        >
          <span className="material-symbols-outlined text-sm">
            arrow_back_ios_new
          </span>
        </button>
        <button className="grid h-8 w-8 place-items-center rounded-md bg-blue-600 text-sm font-semibold text-white">
          1
        </button>
        <button className="grid h-8 w-8 place-items-center rounded-md border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
          2
        </button>
        <button className="grid h-8 w-8 place-items-center rounded-md border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
          3
        </button>
        <span className="grid h-8 w-8 place-items-center text-slate-400">
          ...
        </span>
        <button className="grid h-8 w-8 place-items-center rounded-md border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors">
          <span className="material-symbols-outlined text-sm">
            arrow_forward_ios
          </span>
        </button>
      </div>
    </section>
  );
};

export default PharmacistsPagination;
