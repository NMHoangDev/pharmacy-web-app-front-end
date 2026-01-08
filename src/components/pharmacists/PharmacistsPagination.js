import React from "react";

const PharmacistsPagination = () => {
  return (
    <section className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
      <p className="text-sm text-slate-500">
        Hiển thị{" "}
        <span className="font-medium text-slate-900 dark:text-white">1</span>{" "}
        đến
        <span className="font-medium text-slate-900 dark:text-white"> 6 </span>
        trong số{" "}
        <span className="font-medium text-slate-900 dark:text-white">
          24
        </span>{" "}
        dược sĩ
      </p>
      <div className="flex items-center gap-2">
        <button className="flex items-center justify-center size-9 rounded-lg border border-[#e7edf3] text-slate-500 hover:bg-[#e7edf3] disabled:opacity-50">
          <span className="material-symbols-outlined text-sm">
            arrow_back_ios_new
          </span>
        </button>
        <button className="flex items-center justify-center size-9 rounded-lg bg-primary text-white font-bold text-sm">
          1
        </button>
        <button className="flex items-center justify-center size-9 rounded-lg border border-[#e7edf3] text-slate-900 font-medium text-sm hover:bg-[#e7edf3] transition-colors">
          2
        </button>
        <button className="flex items-center justify-center size-9 rounded-lg border border-[#e7edf3] text-slate-900 font-medium text-sm hover:bg-[#e7edf3] transition-colors">
          3
        </button>
        <span className="flex items-center justify-center size-9 text-slate-400">
          ...
        </span>
        <button className="flex items-center justify-center size-9 rounded-lg border border-[#e7edf3] text-slate-500 hover:bg-[#e7edf3]">
          <span className="material-symbols-outlined text-sm">
            arrow_forward_ios
          </span>
        </button>
      </div>
    </section>
  );
};

export default PharmacistsPagination;
