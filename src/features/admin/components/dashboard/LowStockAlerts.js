import React from "react";

const LowStockAlerts = ({ alerts = [], loading = false, onOpenInventory }) => (
  <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col">
    <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex items-center gap-2">
      <span className="material-symbols-outlined text-red-500">warning</span>
      <h3 className="text-lg font-bold text-slate-900 dark:text-white">
        Cảnh báo tồn kho
      </h3>
    </div>
    <div className="p-4 flex flex-col gap-3 overflow-y-auto max-h-[400px]">
      {loading ? (
        Array.from({ length: 5 }).map((_, idx) => (
          <div
            key={idx}
            className="flex items-center justify-between p-3 rounded-lg border border-slate-100 dark:border-slate-700"
          >
            <div className="flex flex-col gap-2 flex-1">
              <div className="h-4 w-3/4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
              <div className="h-3 w-1/2 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
            </div>
            <div className="h-8 w-20 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
          </div>
        ))
      ) : !alerts?.length ? (
        <div className="text-sm text-slate-500">Chưa có cảnh báo tồn kho</div>
      ) : (
        alerts.map((alert) => (
          <div
            key={alert.name}
            className={`flex items-center justify-between p-3 rounded-lg border ${alert.tone}`}
          >
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                {alert.name}
              </span>
              <span className={`text-xs font-medium ${alert.detailClass}`}>
                {alert.detail}
              </span>
            </div>
            <button
              type="button"
              onClick={onOpenInventory}
              className={`px-3 py-1.5 text-xs font-bold rounded shadow-sm transition-colors ${alert.actionClass}`}
            >
              {alert.action}
            </button>
          </div>
        ))
      )}
    </div>
    <div className="mt-auto p-4 border-t border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 rounded-b-xl">
      <a
        className="flex items-center justify-center gap-2 text-sm text-slate-500 hover:text-primary transition-colors"
        href="/admin/inventory"
        onClick={(e) => {
          if (typeof onOpenInventory === "function") {
            e.preventDefault();
            onOpenInventory();
          }
        }}
      >
        <span>Xem toàn bộ kho</span>
        <span className="material-symbols-outlined text-[16px]">
          arrow_forward
        </span>
      </a>
    </div>
  </div>
);

export default LowStockAlerts;
