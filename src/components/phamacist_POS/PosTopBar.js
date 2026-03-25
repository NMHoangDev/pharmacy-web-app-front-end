import React from "react";

const PosTopBar = ({ userName, roleName, onClearCart, onToggleSidebar }) => {
  return (
    <header className="h-16 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between px-4 md:px-6 shrink-0 z-20">
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-700"
          onClick={onToggleSidebar}
          title="Mở điều hướng"
          aria-label="Mở điều hướng"
        >
          <span className="material-symbols-outlined">menu</span>
        </button>
        <div className="p-2 bg-primary/10 rounded-lg text-primary shrink-0">
          <span className="material-symbols-outlined text-2xl">
            local_pharmacy
          </span>
        </div>
        <h1 className="text-lg md:text-xl font-bold tracking-tight text-slate-900 dark:text-white truncate">
          Pharmacy POS
        </h1>
      </div>

      <div className="flex items-center gap-3 md:gap-6">
        <div className="hidden lg:flex items-center gap-2 text-xs md:text-sm text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 px-3 py-1.5 rounded-full">
          <span className="w-2 h-2 rounded-full bg-green-500" />
          <span>System Online</span>
        </div>

        <button
          type="button"
          className="p-2 text-slate-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
          onClick={onClearCart}
          title="Clear cart"
        >
          <span className="material-symbols-outlined">delete</span>
        </button>

        <div className="hidden sm:block text-right">
          <p className="text-sm font-semibold text-slate-900 dark:text-white truncate max-w-[180px]">
            {userName}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {roleName}
          </p>
        </div>
      </div>
    </header>
  );
};

export default PosTopBar;
