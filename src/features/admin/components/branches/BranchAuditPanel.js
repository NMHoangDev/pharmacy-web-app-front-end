import React, { useState } from "react";

const AuditRow = ({ item }) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="px-4 py-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <div className="font-semibold text-slate-900 dark:text-white">
            {item.action} · {item.entity}
          </div>
          <div className="text-xs text-slate-500">
            {item.actor || "(unknown)"} ·{" "}
            {item.createdAt
              ? new Date(item.createdAt).toLocaleString("vi-VN")
              : ""}
          </div>
        </div>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
        >
          <span className="material-symbols-outlined text-base">
            {open ? "expand_less" : "expand_more"}
          </span>
          Chi tiết
        </button>
      </div>

      {open ? (
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <div className="text-xs font-semibold text-slate-500">
              beforeJson
            </div>
            <pre className="mt-1 whitespace-pre-wrap break-words text-xs font-mono p-3 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              {item.beforeJson || "(null)"}
            </pre>
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-500">
              afterJson
            </div>
            <pre className="mt-1 whitespace-pre-wrap break-words text-xs font-mono p-3 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              {item.afterJson || "(null)"}
            </pre>
          </div>
        </div>
      ) : null}

      <div className="mt-2 text-[11px] text-slate-400 font-mono truncate">
        {item.id}
      </div>
    </div>
  );
};

const BranchAuditPanel = ({ state }) => {
  const { loading, error, items } = state;

  if (loading) {
    return <div className="text-slate-500">Đang tải audit...</div>;
  }

  return (
    <div className="space-y-3">
      {error ? (
        <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-sm">
          {error}
        </div>
      ) : null}

      <div className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <h4 className="font-semibold text-slate-900 dark:text-white">
            Audit log
          </h4>
          <span className="text-xs text-slate-500">{items?.length || 0}</span>
        </div>

        {items?.length ? (
          <div className="divide-y divide-slate-200 dark:divide-slate-800">
            {items.map((item) => (
              <AuditRow key={item.id} item={item} />
            ))}
          </div>
        ) : (
          <div className="px-4 py-6 text-slate-500">Chưa có audit.</div>
        )}
      </div>
    </div>
  );
};

export default BranchAuditPanel;
