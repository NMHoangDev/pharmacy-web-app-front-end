import React from "react";
import NotificationItem from "./NotificationItem";

const NotificationPanel = ({
  notifications,
  loading,
  error,
  onOpenItem,
  onMarkRead,
  onDelete,
  onRefresh,
}) => {
  return (
    <div className="absolute right-0 top-[calc(100%+10px)] z-[90] w-[min(92vw,380px)] rounded-2xl border border-slate-200 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.16)] overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
        <h3 className="text-sm font-bold text-slate-900">Thông báo</h3>
        <button
          type="button"
          className="h-8 w-8 rounded-lg border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition grid place-items-center"
          aria-label="Tải lại thông báo"
          onClick={onRefresh}
        >
          <span className="material-symbols-outlined text-[18px]">refresh</span>
        </button>
      </div>

      <div className="max-h-[min(70vh,520px)] overflow-y-auto p-3">
        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="h-20 rounded-xl border border-slate-200 bg-slate-50 animate-pulse"
              />
            ))}
          </div>
        ) : error ? (
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-4 text-sm text-rose-700">
            <p className="font-semibold">Không thể tải thông báo</p>
            <p className="mt-1 text-xs">{error}</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-8 text-center text-sm text-slate-600">
            <span className="material-symbols-outlined text-2xl text-slate-400">
              notifications
            </span>
            <p className="mt-2">Bạn chưa có thông báo nào</p>
          </div>
        ) : (
          <ul className="space-y-2">
            {notifications.map((item) => (
              <NotificationItem
                key={item.id}
                item={item}
                onOpen={onOpenItem}
                onMarkRead={onMarkRead}
                onDelete={onDelete}
              />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default NotificationPanel;
