import React from "react";

const EmptyState = ({ title, subtitle, actionLabel, onAction }) => {
  return (
    <div className="w-full flex items-center justify-center py-12">
      <div className="max-w-md w-full text-center bg-white dark:bg-[#0f1720] border border-slate-200 dark:border-gray-800 rounded-xl p-8 shadow-sm">
        <div className="flex items-center justify-center mb-4">
          <span className="material-symbols-outlined text-[56px] text-gray-300">
            inventory_2
          </span>
        </div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">
          {title}
        </h3>
        {subtitle ? (
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-300">
            {subtitle}
          </p>
        ) : null}
        {actionLabel && onAction ? (
          <div className="mt-6">
            <button
              onClick={onAction}
              className="px-5 py-2 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90"
            >
              {actionLabel}
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default EmptyState;
