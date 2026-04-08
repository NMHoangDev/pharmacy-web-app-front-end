import React from "react";

const PosTopBar = ({ userName, roleName, onClearCart, onToggleSidebar }) => {
  return (
    <header className="z-20 flex h-16 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4 dark:border-slate-700 dark:bg-slate-800 md:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-700"
          onClick={onToggleSidebar}
          title="Mở điều hướng"
          aria-label="Mở điều hướng"
        >
          <span className="material-symbols-outlined">menu</span>
        </button>

        <div className="shrink-0 rounded-lg bg-primary/10 p-2 text-primary">
          <span className="material-symbols-outlined text-2xl">
            local_pharmacy
          </span>
        </div>

        <h1 className="truncate text-lg font-bold tracking-tight text-slate-900 dark:text-white md:text-xl">
          Bán hàng tại quầy
        </h1>
      </div>

      <div className="flex items-center gap-3 md:gap-6">
        <div className="hidden items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 text-xs text-slate-500 dark:bg-slate-700 dark:text-slate-400 lg:flex md:text-sm">
          <span className="h-2 w-2 rounded-full bg-green-500" />
          <span>Hệ thống đang hoạt động</span>
        </div>

        <button
          type="button"
          className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20"
          onClick={onClearCart}
          title="Xóa giỏ hàng"
          aria-label="Xóa giỏ hàng"
        >
          <span className="material-symbols-outlined">delete</span>
        </button>

        <div className="hidden text-right sm:block">
          <p className="max-w-[180px] truncate text-sm font-semibold text-slate-900 dark:text-white">
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
