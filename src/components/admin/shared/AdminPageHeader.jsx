import React from "react";

const AdminPageHeader = ({ title, subtitle, actions }) => {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4 rounded-3xl border border-slate-200 bg-white px-5 py-5 shadow-sm shadow-slate-900/5 dark:border-slate-700 dark:bg-slate-900/70 md:px-6">
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">
          Admin
        </p>
        <h1 className="mt-2 text-xl font-bold text-slate-900 dark:text-white md:text-2xl">
          {title}
        </h1>
        {subtitle ? (
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {subtitle}
          </p>
        ) : null}
      </div>
      {actions ? (
        <div className="flex flex-wrap items-center gap-2">{actions}</div>
      ) : null}
    </div>
  );
};

export default AdminPageHeader;
