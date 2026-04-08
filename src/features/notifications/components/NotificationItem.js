import React, { useMemo } from "react";
import { formatNotificationTime } from "../../../shared/utils/notificationUtils";

const NotificationItem = ({
  item,
  onOpen,
  onMarkRead,
  onDelete,
  compact = false,
}) => {
  const isDiscount = String(item?.category || "").toUpperCase() === "DISCOUNT";
  const isSynthetic = Boolean(item?.synthetic);

  const createdLabel = useMemo(
    () => formatNotificationTime(item?.createdAt),
    [item?.createdAt],
  );

  return (
    <li className="group relative">
      <div
        className={[
          "relative rounded-xl border transition",
          isDiscount
            ? item?.read
              ? "border-amber-200 bg-amber-50/60 hover:bg-amber-50"
              : "border-amber-300 bg-amber-50 hover:bg-amber-100"
            : item?.read
              ? "border-slate-200 bg-white hover:bg-slate-50"
              : "border-primary/25 bg-primary/5 hover:bg-primary/10",
        ].join(" ")}
      >
        {!isSynthetic ? (
          <div className="absolute left-2 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity">
            {!item?.read ? (
              <button
                type="button"
                className="h-7 w-7 rounded-lg border border-slate-200 bg-white text-slate-600 hover:text-emerald-600 hover:border-emerald-300 transition grid place-items-center"
                aria-label="Đánh dấu đã đọc"
                onClick={(event) => {
                  event.stopPropagation();
                  onMarkRead?.(item);
                }}
              >
                <span className="material-symbols-outlined text-[16px]">
                  done
                </span>
              </button>
            ) : null}

            <button
              type="button"
              className="h-7 w-7 rounded-lg border border-slate-200 bg-white text-slate-600 hover:text-rose-600 hover:border-rose-300 transition grid place-items-center"
              aria-label="Xóa thông báo"
              onClick={(event) => {
                event.stopPropagation();
                onDelete?.(item);
              }}
            >
              <span className="material-symbols-outlined text-[16px]">
                delete
              </span>
            </button>
          </div>
        ) : null}

        <button
          type="button"
          className={[
            "w-full text-left py-3 pr-3 rounded-xl",
            compact ? "pl-3" : "pl-12",
          ].join(" ")}
          onClick={() => onOpen?.(item)}
        >
          <div className="flex items-start justify-between gap-3">
            <p
              className={[
                "text-sm font-semibold leading-5",
                item?.read ? "text-slate-700" : "text-slate-900",
              ].join(" ")}
            >
              {item?.title || "Thông báo"}
            </p>
            {!item?.read ? (
              <span
                className={[
                  "mt-1 h-2 w-2 shrink-0 rounded-full",
                  isDiscount ? "bg-amber-500" : "bg-primary",
                ].join(" ")}
              />
            ) : null}
          </div>

          <p className="mt-1 text-xs leading-5 text-slate-600 line-clamp-2">
            {item?.message || "Không có nội dung"}
          </p>

          <div className="mt-2 flex items-center justify-between gap-2">
            <span
              className={[
                "inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
                isDiscount
                  ? "border-amber-200 bg-amber-50 text-amber-700"
                  : "border-slate-200 text-slate-500",
              ].join(" ")}
            >
              {item?.category || "SYSTEM"}
            </span>
            <span className="text-[11px] text-slate-500">{createdLabel}</span>
          </div>
        </button>
      </div>
    </li>
  );
};

export default NotificationItem;
