import React, { useEffect } from "react";
import { FiltersPanel } from "./MedicinesFilters";

const DrawerShell = ({ open, onClose, children }) => {
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e) => {
      if (e.key === "Escape") onClose?.();
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] lg:hidden">
      <button
        type="button"
        className="absolute inset-0 bg-black/40"
        aria-label="Close filters"
        onClick={onClose}
      />

      <div className="absolute inset-y-0 right-0 w-[88vw] max-w-sm bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-xl">
        {children}
      </div>
    </div>
  );
};

const MedicinesFiltersDrawer = ({
  open,
  onClose,
  onApply,
  onReset,
  ...panelProps
}) => {
  return (
    <DrawerShell open={open} onClose={onClose}>
      <div className="h-full flex flex-col">
        <div className="px-3 py-2 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="font-bold text-slate-900 dark:text-white text-sm">
            Bộ lọc
          </div>
          <button
            type="button"
            onClick={onClose}
            className="size-9 rounded-lg border border-slate-200 dark:border-slate-800 grid place-items-center text-slate-600 dark:text-slate-200"
            aria-label="Close"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-3">
          <FiltersPanel {...panelProps} />
        </div>

        <div className="p-3 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2">
          <button
            type="button"
            onClick={onReset}
            className="h-10 flex-1 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/30 text-slate-700 dark:text-slate-200 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-800/50"
          >
            Đặt lại
          </button>
          <button
            type="button"
            onClick={onApply}
            className="h-10 flex-1 rounded-lg bg-primary text-white text-sm font-bold hover:opacity-95"
          >
            Áp dụng
          </button>
        </div>
      </div>
    </DrawerShell>
  );
};

export default MedicinesFiltersDrawer;
