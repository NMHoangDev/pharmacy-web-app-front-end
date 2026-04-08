import React, { useMemo } from "react";
import {
  computeScopeSummary,
  formatCurrency,
  formatPercent,
  getStatusMeta,
} from "./discountHelpers";
import { DiscountType } from "./discountTypes";

const formatDayMonth = (value) => {
  if (!value) return "";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
  }).format(date);
};

const formatDateTime = (value) => {
  if (!value) return "";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

const cardClass = "rounded-xl border border-slate-200 bg-white p-4 shadow-sm";

const labelClass = "text-xs font-semibold text-slate-500";
const valueClass = "mt-1 text-sm font-semibold text-slate-900";

const Row = ({ label, value, highlight = false }) => {
  return (
    <div>
      <div className={labelClass}>{label}</div>
      <div className={highlight ? `${valueClass} text-primary` : valueClass}>
        {value || "—"}
      </div>
    </div>
  );
};

const toValueLabel = (discount) => {
  const type = String(discount?.type || "");
  const value = Number(discount?.value || 0);
  if (type === DiscountType.PERCENT) return formatPercent(value);
  if (type === DiscountType.FIXED) return formatCurrency(value);
  if (type === DiscountType.FREESHIP) return "Freeship";
  return String(discount?.value ?? "—");
};

const DiscountDetailDrawer = ({ open, discount, categoryMap, onClose }) => {
  const statusMeta = useMemo(
    () => getStatusMeta(discount?.status),
    [discount?.status],
  );

  const scopeSummary = useMemo(
    () => computeScopeSummary(discount, categoryMap),
    [discount, categoryMap],
  );

  if (!open || !discount) return null;

  const timeRange = `${formatDayMonth(discount.startDate)} → ${formatDayMonth(discount.endDate)}`;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end">
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
        onClick={onClose}
      />

      <aside className="relative h-full w-full max-w-xl overflow-y-auto border-l border-slate-200 bg-slate-50">
        <div className="sticky top-0 z-10 border-b border-slate-200 bg-white px-5 py-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs text-slate-500">Chi tiết khuyến mãi</p>
              <h3 className="mt-1 truncate text-lg font-bold text-slate-900">
                {discount.name}
              </h3>
              <p className="mt-1 text-sm text-slate-600">
                Mã: <span className="font-semibold">{discount.code}</span>
              </p>
            </div>
            <button
              type="button"
              className="rounded-full p-2 text-slate-600 hover:bg-slate-100"
              onClick={onClose}
              aria-label="Đóng"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
        </div>

        <div className="space-y-4 p-5">
          {discount.description ? (
            <div className={cardClass}>
              <div className={labelClass}>Mô tả</div>
              <div className="mt-1 text-sm text-slate-700 whitespace-pre-wrap">
                {discount.description}
              </div>
            </div>
          ) : null}

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className={cardClass}>
              <div className="text-sm font-bold text-slate-900">
                Thông tin giảm giá
              </div>
              <div className="mt-4 grid grid-cols-1 gap-4">
                <Row label="Giá trị" value={toValueLabel(discount)} highlight />
                <Row
                  label="Tối đa giảm"
                  value={
                    discount.maxDiscount != null &&
                    Number(discount.maxDiscount) > 0
                      ? formatCurrency(discount.maxDiscount)
                      : "—"
                  }
                />
              </div>
            </div>

            <div className={cardClass}>
              <div className="text-sm font-bold text-slate-900">Trạng thái</div>
              <div className="mt-4 grid grid-cols-1 gap-4">
                <Row label="Phạm vi" value={scopeSummary} />
                <div>
                  <div className={labelClass}>Trạng thái</div>
                  <div className="mt-1">
                    <span
                      className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-semibold ring-1 ring-inset ${statusMeta.badgeClass}`}
                    >
                      {statusMeta.label}
                    </span>
                  </div>
                </div>
                <Row label="Thời gian" value={timeRange} />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className={cardClass}>
              <div className="text-sm font-bold text-slate-900">Điều kiện</div>
              <div className="mt-4 grid grid-cols-1 gap-4">
                <Row
                  label="Đơn tối thiểu"
                  value={
                    discount.minOrderValue != null &&
                    Number(discount.minOrderValue) > 0
                      ? formatCurrency(discount.minOrderValue)
                      : "—"
                  }
                />
                <Row
                  label="Giới hạn sử dụng"
                  value={
                    discount.usageLimit != null
                      ? String(discount.usageLimit)
                      : "—"
                  }
                />
              </div>
            </div>

            <div className={cardClass}>
              <div className="text-sm font-bold text-slate-900">
                Thông tin khác
              </div>
              <div className="mt-4 grid grid-cols-1 gap-4">
                <Row
                  label="Số lần / người dùng"
                  value={
                    discount.usagePerUser != null
                      ? String(discount.usagePerUser)
                      : "—"
                  }
                />
                <Row
                  label="Ngày tạo"
                  value={formatDateTime(discount.createdAt)}
                />
              </div>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
};

export default DiscountDetailDrawer;
