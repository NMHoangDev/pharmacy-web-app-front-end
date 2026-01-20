import React from "react";

const PaymentToolbar = ({
  search,
  onSearch,
  onRangeClick,
  onStatusClick,
  onMethodClick,
}) => (
  <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-4 flex flex-col lg:flex-row gap-4 justify-between items-center">
    <div className="relative w-full lg:w-96">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
        <span className="material-symbols-outlined">search</span>
      </div>
      <input
        value={search}
        onChange={(e) => onSearch(e.target.value)}
        className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg leading-5 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-primary/20 focus:border-primary sm:text-sm transition-shadow"
        placeholder="Tìm kiếm mã giao dịch, đơn hàng..."
        type="text"
      />
    </div>
    <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto justify-start lg:justify-end">
      <button
        type="button"
        className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-700 dark:text-slate-300 hover:border-primary hover:text-primary transition-colors"
        onClick={onRangeClick}
      >
        <span className="material-symbols-outlined text-[18px]">
          calendar_today
        </span>
        <span>7 ngày qua</span>
        <span className="material-symbols-outlined text-[18px] text-slate-400">
          arrow_drop_down
        </span>
      </button>
      <button
        type="button"
        className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-700 dark:text-slate-300 hover:border-primary hover:text-primary transition-colors"
        onClick={onStatusClick}
      >
        <span className="material-symbols-outlined text-[18px]">
          filter_list
        </span>
        <span>Trạng thái: Tất cả</span>
        <span className="material-symbols-outlined text-[18px] text-slate-400">
          arrow_drop_down
        </span>
      </button>
      <button
        type="button"
        className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-700 dark:text-slate-300 hover:border-primary hover:text-primary transition-colors"
        onClick={onMethodClick}
      >
        <span className="material-symbols-outlined text-[18px]">
          credit_card
        </span>
        <span>Phương thức</span>
        <span className="material-symbols-outlined text-[18px] text-slate-400">
          arrow_drop_down
        </span>
      </button>
    </div>
  </div>
);

export default PaymentToolbar;
