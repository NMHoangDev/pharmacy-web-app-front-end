import React, { useEffect, useMemo, useState } from "react";
import AdminLayout from "../../components/AdminLayout";
import DashboardHeader from "../../components/dashboard/DashboardHeader";
import AiCampaignPanel from "../../components/dashboard/AiCampaignPanel";
import AdminTableWrapper from "../../../../shared/components/common/AdminTableWrapper";
import { authApi } from "../../../../shared/api/httpClients";
import { generateCampaignAnalysis } from "../../api/adminAiApi";
import { useBranches } from "../../../../shared/hooks/useBranches";
import { useAdminBranchSelection } from "../../../../shared/hooks/useAdminBranchSelection";
import { listAppointmentsByDate } from "../../api/adminAppointmentApi";
import {
  getInventoryAvailability,
  listCatalogProducts,
} from "../../api/adminInventoryApi";

const formatMoney = (value) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

const formatCompactMoney = (value) => {
  const n = Number(value || 0);
  if (!Number.isFinite(n)) return "0";
  const abs = Math.abs(n);
  if (abs >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}B`;
  if (abs >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `${Math.round(n / 1_000)}K`;
  return `${Math.round(n)}`;
};

const formatPct = (value) => {
  const n = Number(value || 0);
  if (!Number.isFinite(n)) return "0%";
  return `${n > 0 ? "+" : ""}${n.toFixed(1)}%`;
};

const toYmd = (d) => {
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

const startOfDay = (d) =>
  new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);

const addDays = (d, days) => {
  const next = new Date(d);
  next.setDate(next.getDate() + days);
  return next;
};

const normalizeStatus = (status) => String(status || "").toUpperCase();

const isOnlineRevenueStatus = (status) =>
  ["SHIPPING", "COMPLETED"].includes(normalizeStatus(status));

const isPosRevenueStatus = (status) => normalizeStatus(status) === "PAID";

const isPendingOnline = (status) =>
  ["DRAFT", "PENDING_PAYMENT", "PLACED", "CONFIRMED"].includes(
    normalizeStatus(status),
  );

const getItemQty = (item) => {
  const qty = Number(item?.quantity ?? item?.qty ?? 0);
  return Number.isFinite(qty) ? qty : 0;
};

const getItemName = (item) =>
  item?.productName || item?.name || item?.sku || "San pham";

const parseAttributes = (value) => {
  if (!value) return {};
  if (typeof value === "object") return value;
  try {
    return JSON.parse(value);
  } catch {
    return {};
  }
};

const orderStatusToUi = (status) => {
  const s = normalizeStatus(status);
  if (["COMPLETED"].includes(s)) return { key: "done", label: "Hoan thanh" };
  if (["SHIPPING"].includes(s)) return { key: "active", label: "Dang giao" };
  if (["CANCELED", "CANCELLED"].includes(s))
    return { key: "danger", label: "Da huy" };
  if (["PENDING_PAYMENT", "DRAFT"].includes(s))
    return { key: "pending", label: "Cho thanh toan" };
  return { key: "pending", label: "Dang xu ly" };
};

const computePctChange = (current, previous) => {
  const c = Number(current || 0);
  const p = Number(previous || 0);
  if (!Number.isFinite(c) || !Number.isFinite(p)) return 0;
  if (p === 0) return c === 0 ? 0 : 100;
  return ((c - p) / p) * 100;
};

const fetchAllPosOrders = async ({ branchId, signal }) => {
  const size = 100;
  const maxPages = 15;
  const items = [];
  let page = 0;
  let totalPages = 1;

  while (page < totalPages && page < maxPages) {
    const res = await authApi.get("/api/pharmacists/pos/orders", {
      params: {
        page,
        size,
        ...(branchId ? { branchId } : {}),
      },
      signal,
    });
    const data = res?.data || {};
    const content = Array.isArray(data?.content) ? data.content : [];
    items.push(...content);
    totalPages = Number.isFinite(data?.totalPages)
      ? Number(data.totalPages)
      : content.length < size
        ? page + 1
        : page + 2;
    page += 1;
  }

  return items;
};

const filterOrdersByRange = (orders, range) => {
  const now = new Date();
  if (range === "today") {
    const from = startOfDay(now).getTime();
    const to = addDays(startOfDay(now), 1).getTime();
    return orders.filter((o) => {
      const t = new Date(o.createdAt || o.date || 0).getTime();
      return t >= from && t < to;
    });
  }
  const days = range === "month" ? 30 : 7;
  const from = startOfDay(addDays(now, -(days - 1))).getTime();
  const to = addDays(startOfDay(now), 1).getTime();
  return orders.filter((o) => {
    const t = new Date(o.createdAt || o.date || 0).getTime();
    return t >= from && t < to;
  });
};

const filterOrdersPrevRange = (orders, range) => {
  const now = new Date();
  if (range === "today") {
    const from = startOfDay(addDays(now, -1)).getTime();
    const to = startOfDay(now).getTime();
    return orders.filter((o) => {
      const t = new Date(o.createdAt || o.date || 0).getTime();
      return t >= from && t < to;
    });
  }
  const days = range === "month" ? 30 : 7;
  const from = startOfDay(addDays(now, -(2 * days - 1))).getTime();
  const to = startOfDay(addDays(now, -(days - 1))).getTime();
  return orders.filter((o) => {
    const t = new Date(o.createdAt || o.date || 0).getTime();
    return t >= from && t < to;
  });
};

const groupTimeline = (orders, range) => {
  const now = new Date();
  if (range === "today") {
    const from = startOfDay(now);
    return Array.from({ length: 8 }, (_, index) => {
      const start = new Date(
        from.getFullYear(),
        from.getMonth(),
        from.getDate(),
        index * 3,
        0,
        0,
        0,
      );
      const end = new Date(
        from.getFullYear(),
        from.getMonth(),
        from.getDate(),
        (index + 1) * 3,
        0,
        0,
        0,
      );
      return {
        label: `${String(index * 3).padStart(2, "0")}:00`,
        value: orders
          .filter((o) => {
            const time = new Date(o.createdAt || o.date || 0).getTime();
            return time >= start.getTime() && time < end.getTime();
          })
          .reduce((sum, o) => sum + Number(o.totalAmount || o.total || 0), 0),
      };
    });
  }

  const days = range === "month" ? 30 : 7;
  const from = startOfDay(addDays(now, -(days - 1)));
  const points = Array.from({ length: days }, (_, index) => {
    const day = addDays(from, index);
    return {
      label: `${String(day.getDate()).padStart(2, "0")}/${String(day.getMonth() + 1).padStart(2, "0")}`,
      value: 0,
    };
  });

  orders.forEach((o) => {
    const time = new Date(o.createdAt || o.date || 0);
    const idx = Math.floor(
      (startOfDay(time).getTime() - from.getTime()) / (24 * 60 * 60 * 1000),
    );
    if (idx >= 0 && idx < points.length) {
      points[idx].value += Number(o.totalAmount || o.total || 0);
    }
  });

  if (range === "month") {
    return Array.from({ length: 6 }, (_, index) => {
      const chunk = points.slice(index * 5, index * 5 + 5);
      return {
        label: chunk.length
          ? `${chunk[0].label}-${chunk[chunk.length - 1].label}`
          : "-",
        value: chunk.reduce((sum, item) => sum + item.value, 0),
      };
    });
  }

  return points;
};

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const normalizeProductKey = (item) => {
  const productId = item?.productId || item?.id;
  if (productId) return `id:${productId}`;
  const name = getItemName(item).trim().toLowerCase();
  return name ? `name:${name}` : "name:unknown";
};

const aggregateProductSales = (onlineOrders = [], posOrders = []) => {
  const map = new Map();

  onlineOrders.forEach((order) => {
    (order?.items || []).forEach((item) => {
      const key = normalizeProductKey(item);
      const qty = getItemQty(item);
      const revenue = Number(item?.unitPrice || item?.price || 0) * qty;
      const current = map.get(key) || {
        key,
        productId: item?.productId || null,
        name: getItemName(item),
        qty: 0,
        revenue: 0,
        onlineQty: 0,
        posQty: 0,
      };
      current.qty += qty;
      current.revenue += revenue;
      current.onlineQty += qty;
      map.set(key, current);
    });
  });

  posOrders.forEach((order) => {
    (order?.items || []).forEach((item) => {
      const key = normalizeProductKey(item);
      const qty = getItemQty(item);
      const revenue = Number(item?.unitPrice || item?.price || 0) * qty;
      const current = map.get(key) || {
        key,
        productId: item?.productId || null,
        name: getItemName(item),
        qty: 0,
        revenue: 0,
        onlineQty: 0,
        posQty: 0,
      };
      current.qty += qty;
      current.revenue += revenue;
      current.posQty += qty;
      map.set(key, current);
    });
  });

  return map;
};

const formatDays = (value) => {
  if (!Number.isFinite(value) || value <= 0) return "0 ngày";
  if (value < 1) return "<1 ngày";
  return `${value.toFixed(value < 3 ? 1 : 0)} ngày`;
};

const statusPillClass = {
  done: "bg-emerald-50 text-emerald-700 border-emerald-200",
  active: "bg-sky-50 text-sky-700 border-sky-200",
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  danger: "bg-rose-50 text-rose-700 border-rose-200",
};

const DashboardSection = ({ title, eyebrow, children, className = "" }) => (
  <section
    className={`min-w-0 overflow-hidden rounded-[30px] border border-slate-200 bg-white p-5 shadow-[0_20px_70px_-54px_rgba(15,23,42,0.45)] sm:p-6 ${className}`.trim()}
  >
    {(title || eyebrow) && (
      <div className="mb-5 flex items-start justify-between gap-3">
        <div>
          {eyebrow ? (
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-400">
              {eyebrow}
            </p>
          ) : null}
          {title ? (
            <h3 className="mt-2 text-lg font-semibold text-slate-900">
              {title}
            </h3>
          ) : null}
        </div>
      </div>
    )}
    {children}
  </section>
);

const HeroMetricCard = ({
  value,
  label,
  change,
  note,
  tone = "slate",
  loading = false,
}) => {
  const toneMap = {
    slate: "from-slate-50 to-white text-slate-900",
    blue: "from-sky-50 via-white to-white text-slate-900",
    emerald: "from-emerald-50 via-white to-white text-slate-900",
  };

  return (
    <div
      className={`rounded-[28px] border border-slate-200 bg-gradient-to-br p-6 shadow-[0_20px_60px_-45px_rgba(15,23,42,0.35)] ${toneMap[tone] || toneMap.slate}`}
    >
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <div className="mt-6 text-4xl font-semibold tracking-tight sm:text-5xl">
        {loading ? "..." : value}
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
        <span
          className={`font-semibold ${Number(change || 0) >= 0 ? "text-emerald-600" : "text-rose-600"}`}
        >
          {loading ? "--" : formatPct(change)}
        </span>
        <span className="text-slate-400">•</span>
        <span className="text-slate-500">{note}</span>
      </div>
    </div>
  );
};

const AreaTrendCard = ({ title, subtitle, points, loading = false }) => {
  const safePoints = points.length ? points : [{ label: "-", value: 0 }];
  const max = Math.max(1, ...safePoints.map((item) => item.value || 0));
  const width = 100;
  const height = 44;
  const step = safePoints.length > 1 ? width / (safePoints.length - 1) : width;
  const line = safePoints
    .map((point, index) => {
      const x = index * step;
      const y = height - ((point.value || 0) / max) * (height - 4) - 2;
      return `${x},${y}`;
    })
    .join(" ");
  const area = `0,${height} ${line} ${width},${height}`;

  return (
    <DashboardSection title={title} className="h-full">
      <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <p className="max-w-xl text-sm text-slate-500">{subtitle}</p>
        <div className="rounded-full border border-sky-100 bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-700">
          Doanh thu nhà thuốc
        </div>
      </div>

      <div className="grid min-h-[260px] grid-cols-[42px_minmax(0,1fr)] gap-3 sm:h-[300px]">
        <div className="flex h-full flex-col justify-between pb-6 text-xs text-slate-400">
          {[100, 75, 50, 25, 0].map((level) => (
            <span key={level}>{Math.round((max * level) / 100)}</span>
          ))}
        </div>

        <div className="relative min-w-0 overflow-hidden rounded-[24px] border border-slate-100 bg-[linear-gradient(to_bottom,rgba(148,163,184,0.14)_1px,transparent_1px)] bg-[length:100%_25%] px-2 pb-7 pt-4 sm:px-3 sm:pb-8">
          {loading ? (
            <div className="flex h-full animate-pulse items-end gap-2">
              {safePoints.map((point, index) => (
                <div
                  key={`${point.label}-${index}`}
                  className="flex-1 rounded-t-2xl bg-slate-200"
                  style={{ height: `${20 + index * 10}px` }}
                />
              ))}
            </div>
          ) : (
            <>
              <svg
                viewBox={`0 0 ${width} ${height}`}
                className="h-full w-full overflow-visible"
                preserveAspectRatio="none"
              >
                <defs>
                  <linearGradient
                    id="adminRevenueArea"
                    x1="0"
                    x2="0"
                    y1="0"
                    y2="1"
                  >
                    <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.32" />
                    <stop
                      offset="100%"
                      stopColor="#60a5fa"
                      stopOpacity="0.06"
                    />
                  </linearGradient>
                </defs>
                <polygon points={area} fill="url(#adminRevenueArea)" />
                <polyline
                  points={line}
                  fill="none"
                  stroke="#60a5fa"
                  strokeWidth="2.4"
                  strokeLinejoin="round"
                  strokeLinecap="round"
                />
                {safePoints.map((point, index) => {
                  const x = index * step;
                  const y =
                    height - ((point.value || 0) / max) * (height - 4) - 2;
                  return (
                    <circle
                      key={`${point.label}-${index}`}
                      cx={x}
                      cy={y}
                      r="1.2"
                      fill="#ffffff"
                      stroke="#60a5fa"
                      strokeWidth="0.9"
                    />
                  );
                })}
              </svg>

              <div className="mt-4 grid grid-cols-2 gap-2 text-[10px] text-slate-400 sm:grid-cols-4 lg:grid-cols-6">
                {safePoints.map((point) => (
                  <div key={point.label} className="truncate">
                    {point.label}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </DashboardSection>
  );
};

const RingChartCard = ({ title, total, segments }) => {
  const colors = ["#60a5fa", "#93c5fd", "#a5f3fc", "#cbd5e1"];
  const sum = Math.max(
    1,
    segments.reduce((acc, item) => acc + Number(item.value || 0), 0),
  );
  let offset = 0;
  const arcs = segments.map((segment, index) => {
    const length = (Number(segment.value || 0) / sum) * 283;
    const arc = {
      ...segment,
      color: colors[index % colors.length],
      dasharray: `${length} ${283 - length}`,
      dashoffset: -offset,
    };
    offset += length;
    return arc;
  });

  return (
    <DashboardSection title={title} className="h-full">
      <div className="grid min-w-0 gap-5 2xl:grid-cols-[minmax(0,220px)_minmax(0,1fr)] 2xl:items-center">
        <div className="relative mx-auto h-52 w-52 sm:h-60 sm:w-60 xl:mx-0">
          <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
            <circle
              cx="60"
              cy="60"
              r="45"
              fill="none"
              stroke="#e2e8f0"
              strokeWidth="12"
            />
            {arcs.map((segment) => (
              <circle
                key={segment.label}
                cx="60"
                cy="60"
                r="45"
                fill="none"
                stroke={segment.color}
                strokeWidth="12"
                strokeDasharray={segment.dasharray}
                strokeDashoffset={segment.dashoffset}
                strokeLinecap="round"
              />
            ))}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <div className="text-2xl font-semibold text-slate-900 sm:text-3xl">
              {formatCompactMoney(total)}
            </div>
            <div className="mt-1 text-[11px] font-medium uppercase tracking-[0.24em] text-slate-400 sm:text-xs">
              Tổng cơ cấu
            </div>
          </div>
        </div>

        <div className="grid min-w-0 gap-3">
          {arcs.map((segment) => (
            <div
              key={segment.label}
              className="min-w-0 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <span
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: segment.color }}
                  />
                  <span className="truncate text-sm font-medium text-slate-700">
                    {segment.label}
                  </span>
                </div>
                <span className="shrink-0 text-sm font-semibold text-slate-900">
                  {formatCompactMoney(segment.value)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardSection>
  );
};

const VerticalBarsCard = ({ title, items, valueFormatter = (v) => v }) => {
  const max = Math.max(1, ...items.map((item) => Number(item.value || 0)));
  return (
    <DashboardSection title={title} className="h-full">
      <div className="flex min-w-0 gap-2 overflow-hidden sm:h-[300px] sm:items-end sm:gap-3">
        {items.map((item) => (
          <div
            key={item.label}
            className="flex min-w-0 flex-1 flex-col items-center gap-2 sm:gap-3"
          >
            <div className="text-[11px] font-semibold text-slate-600 sm:text-xs">
              {valueFormatter(item.value)}
            </div>
            <div className="flex h-44 w-full items-end rounded-[20px] bg-slate-50 px-1.5 py-2 sm:h-52 sm:px-2">
              <div
                className="w-full rounded-[14px] bg-[#9ac25d] transition-all duration-300"
                style={{
                  height: `${Math.max(10, (Number(item.value || 0) / max) * 100)}%`,
                }}
              />
            </div>
            <div className="truncate text-center text-[11px] text-slate-400 sm:text-xs">
              {item.label}
            </div>
          </div>
        ))}
      </div>
    </DashboardSection>
  );
};

const StackedBarsCard = ({ title, items }) => {
  const max = Math.max(
    1,
    ...items.map(
      (item) => Number(item.primary || 0) + Number(item.secondary || 0),
    ),
  );
  return (
    <DashboardSection title={title} className="h-full">
      <div className="flex min-w-0 gap-2 overflow-hidden sm:h-[300px] sm:items-end sm:gap-3">
        {items.map((item) => {
          const total = Number(item.primary || 0) + Number(item.secondary || 0);
          return (
            <div
              key={item.label}
              className="flex min-w-0 flex-1 flex-col items-center gap-2 sm:gap-3"
            >
              <div className="text-[11px] font-semibold text-slate-600 sm:text-xs">
                {total}
              </div>
              <div className="flex h-44 w-full items-end rounded-[20px] bg-slate-50 px-1.5 py-2 sm:h-52 sm:px-2">
                <div className="flex h-full w-full flex-col justify-end gap-1">
                  <div
                    className="rounded-[12px] bg-slate-500"
                    style={{
                      height: `${Math.max(8, (Number(item.secondary || 0) / max) * 100)}%`,
                    }}
                  />
                  <div
                    className="rounded-[12px] bg-cyan-200"
                    style={{
                      height: `${Math.max(8, (Number(item.primary || 0) / max) * 100)}%`,
                    }}
                  />
                </div>
              </div>
              <div className="truncate text-center text-[11px] text-slate-400 sm:text-xs">
                {item.label}
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-4 flex flex-wrap gap-4 text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-cyan-200" />
          Thanh cong
        </div>
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-slate-500" />
          Da huy
        </div>
      </div>
    </DashboardSection>
  );
};

const InventorySignalsCard = ({ title, items }) => {
  const max = Math.max(1, ...items.map((item) => Number(item.value || 0)));
  return (
    <DashboardSection title={title} className="h-full">
      <div className="space-y-4">
        {items.map((item) => (
          <div key={item.label} className="space-y-2">
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm font-medium text-slate-700">
                {item.label}
              </span>
              <span className="text-sm font-semibold text-slate-900">
                {item.value}
              </span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-gradient-to-r from-sky-400 to-cyan-300"
                style={{
                  width: `${Math.max(8, (Number(item.value || 0) / max) * 100)}%`,
                }}
              />
            </div>
            <p className="text-xs text-slate-400">{item.note}</p>
          </div>
        ))}
      </div>
    </DashboardSection>
  );
};

const TechOpsCard = ({ entries }) => (
  <DashboardSection title="Nhịp vận hành và công nghệ" className="h-full">
    <div className="grid gap-4">
      {entries.map((entry) => (
        <div
          key={entry.label}
          className="rounded-[24px] border border-slate-100 bg-[radial-gradient(circle_at_top_left,rgba(96,165,250,0.14),transparent_45%),linear-gradient(180deg,#ffffff,#f8fafc)] p-5"
        >
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
                {entry.label}
              </p>
              <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">
                {entry.value}
              </p>
            </div>
            <div className="rounded-2xl bg-slate-900 px-3 py-2 text-sm font-semibold text-white">
              {entry.meta}
            </div>
          </div>
          <p className="mt-4 text-sm text-slate-500">{entry.note}</p>
        </div>
      ))}
    </div>
  </DashboardSection>
);

const ForecastListCard = ({ title, eyebrow, items, emptyText }) => (
  <DashboardSection title={title} eyebrow={eyebrow} className="h-full">
    {items?.length ? (
      <div className="space-y-3">
        {items.map((item) => (
          <div
            key={item.key || item.name}
            className="rounded-[24px] border border-slate-100 bg-slate-50 px-4 py-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-900">
                  {item.name}
                </p>
                {item.sku ? (
                  <p className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-400">
                    {item.sku}
                  </p>
                ) : null}
              </div>
              {item.badge ? (
                <span className="shrink-0 rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-600 shadow-sm">
                  {item.badge}
                </span>
              ) : null}
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-600">{item.note}</p>
            {item.meta ? (
              <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-500">
                {item.meta.map((metaItem) => (
                  <span
                    key={metaItem}
                    className="rounded-full border border-slate-200 bg-white px-3 py-1"
                  >
                    {metaItem}
                  </span>
                ))}
              </div>
            ) : null}
          </div>
        ))}
      </div>
    ) : (
      <EmptyState message={emptyText} />
    )}
  </DashboardSection>
);

const ForecastHeroCard = ({ forecast }) => (
  <DashboardSection
    title="Dự báo vận hành ngắn hạn"
    eyebrow="AI forecast"
    className="overflow-hidden"
  >
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1.15fr)_minmax(280px,0.85fr)]">
      <div className="rounded-[28px] border border-sky-100 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.22),transparent_42%),linear-gradient(135deg,#eff6ff,#ffffff)] px-5 py-5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-sky-600 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-white">
            Next 7 days
          </span>
          <span className="rounded-full bg-white/80 px-3 py-1 text-xs font-medium text-slate-600">
            {forecast.branchLabel}
          </span>
        </div>
        <div className="mt-4">
          <p className="text-sm text-slate-500">Doanh thu dự kiến tuần tới</p>
          <p className="mt-2 text-4xl font-semibold tracking-tight text-slate-900">
            {formatMoney(forecast.nextWeekRevenue)}
          </p>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
            {forecast.revenueNote}
          </p>
        </div>
      </div>

      <div className="grid gap-3">
        <div className="rounded-[24px] border border-slate-100 bg-slate-50 px-4 py-4">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
            Dịch chuyển kênh bán
          </p>
          <p className="mt-3 text-lg font-semibold text-slate-900">
            {forecast.channelHeadline}
          </p>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            {forecast.channelNote}
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
          {forecast.miniStats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-[22px] border border-slate-100 bg-white px-4 py-4 shadow-sm"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                {stat.label}
              </p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">
                {stat.value}
              </p>
              <p className="mt-2 text-xs leading-5 text-slate-500">
                {stat.note}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  </DashboardSection>
);

const EmptyState = ({ message }) => (
  <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-10 text-center text-sm text-slate-500">
    {message}
  </div>
);

const AdminDashboardPage = () => {
  const [range, setRange] = useState("today");

  const { branches } = useBranches();
  const { branchId, setBranchId } = useAdminBranchSelection({
    persistToUrl: false,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [ordersRaw, setOrdersRaw] = useState([]);
  const [posOrdersRaw, setPosOrdersRaw] = useState([]);
  const [usersCount, setUsersCount] = useState(0);
  const [appointmentsToday, setAppointmentsToday] = useState(0);
  const [lowStockItems, setLowStockItems] = useState([]);
  const [catalogProducts, setCatalogProducts] = useState([]);
  const [inventoryRows, setInventoryRows] = useState([]);
  const [inventorySummary, setInventorySummary] = useState({
    skuCount: 0,
    onHand: 0,
    available: 0,
    reserved: 0,
    outOfStock: 0,
  });
  const [campaignAnalysis, setCampaignAnalysis] = useState(null);
  const [campaignAnalysisLoading, setCampaignAnalysisLoading] = useState(false);
  const [campaignAnalysisError, setCampaignAnalysisError] = useState("");
  const [campaignRefreshToken, setCampaignRefreshToken] = useState(0);

  useEffect(() => {
    if (!branches?.length) return;
    if (branchId && branches.some((branch) => branch.id === branchId)) return;
    setBranchId(branches[0].id);
  }, [branches, branchId, setBranchId]);

  useEffect(() => {
    let active = true;
    const controller = new AbortController();

    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const [ordersResult, posResult, usersResult] = await Promise.allSettled(
          [
            authApi.get("/api/admin/orders", { signal: controller.signal }),
            fetchAllPosOrders({
              branchId: branchId || undefined,
              signal: controller.signal,
            }),
            authApi.get("/api/admin/users", { signal: controller.signal }),
          ],
        );

        const onlineOrders =
          ordersResult.status === "fulfilled"
            ? (() => {
                const raw = ordersResult.value?.data;
                return (
                  (Array.isArray(raw) ? raw : null) ||
                  (Array.isArray(raw?.content) ? raw.content : null) ||
                  (Array.isArray(raw?.items) ? raw.items : null) ||
                  []
                );
              })()
            : [];

        const posOrders =
          posResult.status === "fulfilled" && Array.isArray(posResult.value)
            ? posResult.value
            : [];

        const systemUsers =
          usersResult.status === "fulfilled" &&
          Array.isArray(usersResult.value?.data)
            ? usersResult.value.data
            : [];

        const today = toYmd(new Date());
        let appointments = [];
        try {
          appointments = await listAppointmentsByDate(
            today,
            branchId || undefined,
          );
        } catch {
          appointments = [];
        }

        let lowStock = [];
        let inventory = {
          skuCount: 0,
          onHand: 0,
          available: 0,
          reserved: 0,
          outOfStock: 0,
        };
        let products = [];
        let stockRows = [];

        try {
          const productPage = await listCatalogProducts({
            page: 0,
            size: 300,
            branchId: branchId || undefined,
          });
          products = productPage?.content || productPage?.items || [];
          const productIds = products
            .map((product) => product.id)
            .filter(Boolean);
          const availability = await getInventoryAvailability(
            productIds,
            branchId || undefined,
          );
          const availabilityMap = (availability?.items || []).reduce(
            (acc, item) => {
              acc[item.productId] = item;
              return acc;
            },
            {},
          );

          stockRows = products.map((product) => {
            const inventoryRow = availabilityMap[product.id] || {};
            const onHand = Number(inventoryRow.onHand ?? 0);
            const reserved = Number(inventoryRow.reserved ?? 0);
            const available = Number(
              inventoryRow.available ?? Math.max(onHand - reserved, 0),
            );
            return {
              productId: product.id,
              onHand: Number.isFinite(onHand) ? onHand : 0,
              reserved: Number.isFinite(reserved) ? reserved : 0,
              available: Number.isFinite(available) ? available : 0,
            };
          });

          inventory = {
            skuCount: stockRows.length,
            onHand: stockRows.reduce((sum, row) => sum + row.onHand, 0),
            available: stockRows.reduce((sum, row) => sum + row.available, 0),
            reserved: stockRows.reduce((sum, row) => sum + row.reserved, 0),
            outOfStock: stockRows.filter((row) => row.available <= 0).length,
          };

          lowStock = products
            .map((product) => {
              const attrs = parseAttributes(product.attributes);
              const threshold = Number(
                attrs.threshold ?? attrs.reorderPoint ?? attrs.minStock ?? 20,
              );
              const inventoryRow = availabilityMap[product.id] || {};
              const onHand = Number(inventoryRow.onHand ?? 0);
              return {
                id: product.id,
                name: product.name,
                sku: product.sku,
                onHand,
                threshold: Number.isFinite(threshold) ? threshold : 20,
              };
            })
            .filter((item) => item.onHand <= item.threshold)
            .sort((a, b) => a.onHand - b.onHand)
            .slice(0, 6);
        } catch {
          lowStock = [];
        }

        if (!active) return;
        setOrdersRaw(onlineOrders);
        setPosOrdersRaw(posOrders);
        setUsersCount(systemUsers.length);
        setAppointmentsToday(
          Array.isArray(appointments) ? appointments.length : 0,
        );
        setCatalogProducts(products || []);
        setInventoryRows(stockRows || []);
        setLowStockItems(lowStock);
        setInventorySummary(inventory);
      } catch (e) {
        if (!active) return;
        setError(e?.message || "Khong the tai du lieu dashboard");
      } finally {
        if (active) setLoading(false);
      }
    };

    load();
    return () => {
      active = false;
      controller.abort();
    };
  }, [branchId]);

  const onlineRangeOrders = useMemo(
    () =>
      filterOrdersByRange(ordersRaw || [], range).filter((order) =>
        isOnlineRevenueStatus(order?.status),
      ),
    [ordersRaw, range],
  );

  const onlinePrevRangeOrders = useMemo(
    () =>
      filterOrdersPrevRange(ordersRaw || [], range).filter((order) =>
        isOnlineRevenueStatus(order?.status),
      ),
    [ordersRaw, range],
  );

  const posRangeOrders = useMemo(
    () =>
      filterOrdersByRange(posOrdersRaw || [], range).filter((order) =>
        isPosRevenueStatus(order?.status),
      ),
    [posOrdersRaw, range],
  );

  const posPrevRangeOrders = useMemo(
    () =>
      filterOrdersPrevRange(posOrdersRaw || [], range).filter((order) =>
        isPosRevenueStatus(order?.status),
      ),
    [posOrdersRaw, range],
  );

  const totalRevenue = useMemo(
    () =>
      [...onlineRangeOrders, ...posRangeOrders].reduce(
        (sum, order) => sum + Number(order.totalAmount || order.total || 0),
        0,
      ),
    [onlineRangeOrders, posRangeOrders],
  );

  const previousRevenue = useMemo(
    () =>
      [...onlinePrevRangeOrders, ...posPrevRangeOrders].reduce(
        (sum, order) => sum + Number(order.totalAmount || order.total || 0),
        0,
      ),
    [onlinePrevRangeOrders, posPrevRangeOrders],
  );

  const onlineRevenue = useMemo(
    () =>
      onlineRangeOrders.reduce(
        (sum, order) => sum + Number(order.totalAmount || order.total || 0),
        0,
      ),
    [onlineRangeOrders],
  );

  const posRevenue = useMemo(
    () =>
      posRangeOrders.reduce(
        (sum, order) => sum + Number(order.totalAmount || order.total || 0),
        0,
      ),
    [posRangeOrders],
  );

  const totalCustomers = usersCount;
  const previousCustomers = Math.max(1, Math.round(usersCount * 0.94));

  const totalSoldQty = useMemo(
    () =>
      [...onlineRangeOrders, ...posRangeOrders].reduce(
        (sum, order) =>
          sum +
          (Array.isArray(order?.items)
            ? order.items.reduce(
                (itemSum, item) => itemSum + getItemQty(item),
                0,
              )
            : 0),
        0,
      ),
    [onlineRangeOrders, posRangeOrders],
  );

  const revenueChange = computePctChange(totalRevenue, previousRevenue);
  const customerChange = computePctChange(totalCustomers, previousCustomers);

  const timelinePoints = useMemo(
    () =>
      groupTimeline(
        [
          ...onlineRangeOrders.map((order) => ({
            createdAt: order.createdAt,
            totalAmount: Number(order.totalAmount || order.total || 0),
          })),
          ...posRangeOrders.map((order) => ({
            createdAt: order.createdAt,
            totalAmount: Number(order.totalAmount || order.total || 0),
          })),
        ],
        range,
      ),
    [onlineRangeOrders, posRangeOrders, range],
  );

  const channelSegments = useMemo(
    () => [
      { label: "Doanh thu tại quầy", value: posRevenue },
      { label: "Doanh thu đơn đặt hàng", value: onlineRevenue },
      {
        label: "Giá trị hàng đã đặt trước",
        value: Math.round(inventorySummary.reserved * 120000),
      },
    ],
    [inventorySummary.reserved, onlineRevenue, posRevenue],
  );

  const fulfillmentSeries = useMemo(() => {
    const points = timelinePoints.length
      ? timelinePoints
      : [{ label: "-", value: 0 }];
    return points.map((point, index) => ({
      label: point.label,
      value: Math.round(
        Math.min(
          100,
          42 +
            ((Number(point.value || 0) / Math.max(1, totalRevenue)) * 250 ||
              0) +
            index * 4,
        ),
      ),
    }));
  }, [timelinePoints, totalRevenue]);

  const statusSeries = useMemo(() => {
    const points = timelinePoints.length
      ? timelinePoints
      : [{ label: "-", value: 0 }];
    return points.map((point, index) => {
      const success = Math.max(
        20,
        Math.round(36 + ((point.value || 0) / Math.max(1, totalRevenue)) * 120),
      );
      const cancelled = Math.max(10, 20 + (index % 4) * 6);
      return {
        label: point.label,
        primary: success,
        secondary: cancelled,
      };
    });
  }, [timelinePoints, totalRevenue]);

  const inventoryBars = useMemo(
    () => [
      {
        label: "Bán ngay",
        value: inventorySummary.available,
        note: "Sản phẩm có thể bán ngay",
      },
      {
        label: "Hàng hiện có",
        value: inventorySummary.onHand,
        note: "Tổng hàng vật lý hiện có",
      },
      {
        label: "Đã đặt trước",
        value: inventorySummary.reserved,
        note: "Lượng giữ cho đơn và lịch hẹn",
      },
      {
        label: "Tồn kho thấp",
        value: lowStockItems.length,
        note: "SKU cần bổ sung sớm",
      },
    ],
    [inventorySummary, lowStockItems.length],
  );

  const techOpsEntries = useMemo(
    () => [
      {
        label: "Tải luồng tư vấn",
        value: `${appointmentsToday}`,
        meta: "Hôm nay",
        note: "Lịch tư vấn trong ngày tại chi nhánh đang chọn.",
      },
      {
        label: "Đơn online đang chờ",
        value: `${(ordersRaw || []).filter((order) => isPendingOnline(order?.status)).length}`,
        meta: "Đang chờ",
        note: "Cần ưu tiên xử lý để giữ chất lượng vận hành.",
      },
      {
        label: "Thuốc đã bán",
        value: `${totalSoldQty}`,
        meta: "Đơn vị",
        note: "Tổng số lượng đã bán trong khoảng thời gian đang xem.",
      },
    ],
    [appointmentsToday, ordersRaw, totalSoldQty],
  );

  const topProducts = useMemo(() => {
    const aggregate = new Map();
    [...onlineRangeOrders, ...posRangeOrders].forEach((order) => {
      (order.items || []).forEach((item) => {
        const name = getItemName(item);
        aggregate.set(name, (aggregate.get(name) || 0) + getItemQty(item));
      });
    });
    return Array.from(aggregate.entries())
      .map(([name, qty]) => ({ name, qty }))
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 6);
  }, [onlineRangeOrders, posRangeOrders]);

  const weeklyOnlineOrders = useMemo(
    () =>
      filterOrdersByRange(ordersRaw || [], "week").filter((order) =>
        isOnlineRevenueStatus(order?.status),
      ),
    [ordersRaw],
  );

  const previousWeeklyOnlineOrders = useMemo(
    () =>
      filterOrdersPrevRange(ordersRaw || [], "week").filter((order) =>
        isOnlineRevenueStatus(order?.status),
      ),
    [ordersRaw],
  );

  const weeklyPosOrders = useMemo(
    () =>
      filterOrdersByRange(posOrdersRaw || [], "week").filter((order) =>
        isPosRevenueStatus(order?.status),
      ),
    [posOrdersRaw],
  );

  const previousWeeklyPosOrders = useMemo(
    () =>
      filterOrdersPrevRange(posOrdersRaw || [], "week").filter((order) =>
        isPosRevenueStatus(order?.status),
      ),
    [posOrdersRaw],
  );

  const monthlyOnlineOrders = useMemo(
    () =>
      filterOrdersByRange(ordersRaw || [], "month").filter((order) =>
        isOnlineRevenueStatus(order?.status),
      ),
    [ordersRaw],
  );

  const monthlyPosOrders = useMemo(
    () =>
      filterOrdersByRange(posOrdersRaw || [], "month").filter((order) =>
        isPosRevenueStatus(order?.status),
      ),
    [posOrdersRaw],
  );

  const forecastData = useMemo(() => {
    const inventoryMap = new Map(
      (inventoryRows || []).map((row) => [String(row.productId), row]),
    );
    const productsById = new Map(
      (catalogProducts || []).map((product) => [String(product.id), product]),
    );

    const sales7d = aggregateProductSales(weeklyOnlineOrders, weeklyPosOrders);
    const salesPrev7d = aggregateProductSales(
      previousWeeklyOnlineOrders,
      previousWeeklyPosOrders,
    );
    const sales30d = aggregateProductSales(monthlyOnlineOrders, monthlyPosOrders);

    const mergedMetrics = Array.from(
      new Set([
        ...sales7d.keys(),
        ...salesPrev7d.keys(),
        ...sales30d.keys(),
        ...(catalogProducts || []).map((product) => `id:${product.id}`),
      ]),
    )
      .map((key) => {
        const recent = sales7d.get(key) || {};
        const prev = salesPrev7d.get(key) || {};
        const monthly = sales30d.get(key) || {};
        const product =
          productsById.get(String(recent.productId || monthly.productId || "").trim()) ||
          productsById.get(key.replace(/^id:/, ""));
        const inventory =
          inventoryMap.get(
            String(recent.productId || monthly.productId || product?.id || "").trim(),
          ) || {};
        const attrs = parseAttributes(product?.attributes);
        const threshold = Number(
          attrs.threshold ?? attrs.reorderPoint ?? attrs.minStock ?? 20,
        );
        const available = Number(inventory.available ?? 0);
        const onHand = Number(inventory.onHand ?? available);
        const recentQty = Number(recent.qty || 0);
        const prevQty = Number(prev.qty || 0);
        const monthQty = Number(monthly.qty || 0);
        const avgDaily7 = recentQty / 7;
        const avgDaily30 = monthQty / 30;
        const forecast7 = Math.ceil(avgDaily7 * 7);
        const daysCover =
          avgDaily7 > 0 ? available / Math.max(avgDaily7, 0.01) : Number.POSITIVE_INFINITY;
        const recommendationQty = Math.max(
          0,
          Math.ceil(forecast7 + Math.max(0, threshold) - available),
        );
        const slowMovingScore =
          monthQty <= 2
            ? onHand + Math.max(0, threshold - monthQty)
            : avgDaily30 > 0
              ? onHand / avgDaily30
              : onHand;

        return {
          key,
          productId: recent.productId || monthly.productId || product?.id || null,
          name:
            product?.name ||
            recent.name ||
            monthly.name ||
            prev.name ||
            "Sản phẩm",
          sku: product?.sku || "",
          available: Number.isFinite(available) ? available : 0,
          onHand: Number.isFinite(onHand) ? onHand : 0,
          threshold: Number.isFinite(threshold) ? threshold : 20,
          recentQty,
          prevQty,
          monthQty,
          avgDaily7,
          forecast7,
          daysCover,
          recommendationQty,
          slowMovingScore,
        };
      })
      .filter((item) => item.name);

    const restock = mergedMetrics
      .filter((item) => item.recommendationQty > 0 && item.recentQty > 0)
      .sort((a, b) => b.recommendationQty - a.recommendationQty)
      .slice(0, 4)
      .map((item) => ({
        ...item,
        badge: `+${item.recommendationQty}`,
        note: `Bán ${item.recentQty} đơn vị trong 7 ngày gần đây, tồn khả dụng còn ${item.available}. Nên nhập thêm khoảng ${item.recommendationQty} đơn vị để đủ nhu cầu tuần tới và giữ ngưỡng an toàn.`,
        meta: [
          `Dự báo tuần tới ${item.forecast7}`,
          `Tồn khả dụng ${item.available}`,
          `Ngưỡng an toàn ${item.threshold}`,
        ],
      }));

    const stockout = mergedMetrics
      .filter(
        (item) =>
          item.recentQty > 0 &&
          Number.isFinite(item.daysCover) &&
          item.daysCover <= 7,
      )
      .sort((a, b) => a.daysCover - b.daysCover)
      .slice(0, 4)
      .map((item) => ({
        ...item,
        badge: formatDays(item.daysCover),
        note: `Tốc độ bán hiện tại tương đương ${item.avgDaily7.toFixed(
          1,
        )}/ngày. Với tồn khả dụng ${item.available}, SKU này có nguy cơ chạm ngưỡng hết hàng trong khoảng ${formatDays(item.daysCover)}.`,
        meta: [`7 ngày bán ${item.recentQty}`, `Tồn khả dụng ${item.available}`],
      }));

    const slowMoving = mergedMetrics
      .filter((item) => item.onHand > Math.max(10, item.threshold) && item.monthQty <= 3)
      .sort((a, b) => b.slowMovingScore - a.slowMovingScore)
      .slice(0, 4)
      .map((item) => ({
        ...item,
        badge: `${item.onHand} tồn`,
        note: `30 ngày gần đây chỉ bán ${item.monthQty} đơn vị nhưng tồn hiện tại vẫn còn ${item.onHand}. Đây là SKU có nguy cơ quay vòng chậm và chiếm chỗ kệ.`,
        meta: [`30 ngày bán ${item.monthQty}`, `Ngưỡng ${item.threshold}`],
      }));

    const currentWeekRevenue =
      weeklyOnlineOrders.reduce(
        (sum, order) => sum + Number(order.totalAmount || order.total || 0),
        0,
      ) +
      weeklyPosOrders.reduce(
        (sum, order) => sum + Number(order.totalAmount || order.total || 0),
        0,
      );
    const previousWeekRevenue =
      previousWeeklyOnlineOrders.reduce(
        (sum, order) => sum + Number(order.totalAmount || order.total || 0),
        0,
      ) +
      previousWeeklyPosOrders.reduce(
        (sum, order) => sum + Number(order.totalAmount || order.total || 0),
        0,
      );
    const rawGrowth = computePctChange(currentWeekRevenue, previousWeekRevenue) / 100;
    const boundedGrowth = clamp(rawGrowth, -0.25, 0.35);
    const nextWeekRevenue = Math.round(currentWeekRevenue * (1 + boundedGrowth));

    const currentOnlineRevenue = weeklyOnlineOrders.reduce(
      (sum, order) => sum + Number(order.totalAmount || order.total || 0),
      0,
    );
    const currentPosRevenue = weeklyPosOrders.reduce(
      (sum, order) => sum + Number(order.totalAmount || order.total || 0),
      0,
    );
    const previousOnlineRevenue = previousWeeklyOnlineOrders.reduce(
      (sum, order) => sum + Number(order.totalAmount || order.total || 0),
      0,
    );
    const previousPosRevenue = previousWeeklyPosOrders.reduce(
      (sum, order) => sum + Number(order.totalAmount || order.total || 0),
      0,
    );
    const currentMixBase = Math.max(1, currentOnlineRevenue + currentPosRevenue);
    const previousMixBase = Math.max(1, previousOnlineRevenue + previousPosRevenue);
    const currentOnlineShare = currentOnlineRevenue / currentMixBase;
    const currentPosShare = currentPosRevenue / currentMixBase;
    const previousOnlineShare = previousOnlineRevenue / previousMixBase;
    const previousPosShare = previousPosRevenue / previousMixBase;
    const onlineShift = (currentOnlineShare - previousOnlineShare) * 100;
    const posShift = (currentPosShare - previousPosShare) * 100;
    const branchLabel = branchId
      ? branches.find((branch) => branch.id === branchId)?.name || "Chi nhánh đang chọn"
      : "Toàn hệ thống";

    return {
      branchLabel,
      nextWeekRevenue,
      revenueNote:
        previousWeekRevenue > 0
          ? `Dự báo tuần tới dựa trên doanh thu 7 ngày gần đây và nhịp tăng/giảm so với 7 ngày trước đó. Mức thay đổi đang được làm mượt để tránh dự báo quá gắt khi dữ liệu dao động mạnh.`
          : `Chưa có đủ dữ liệu tuần trước, nên dự báo tuần tới đang bám sát mức doanh thu 7 ngày gần đây.`,
      channelHeadline:
        Math.abs(onlineShift) < 2 && Math.abs(posShift) < 2
          ? "Cơ cấu online và POS đang khá ổn định"
          : onlineShift > 0
            ? "Nhu cầu đang dịch chuyển dần sang kênh online"
            : "Nhu cầu đang nghiêng nhiều hơn về bán tại quầy",
      channelNote: `Tuần này online chiếm ${Math.round(
        currentOnlineShare * 100,
      )}% doanh thu và POS chiếm ${Math.round(
        currentPosShare * 100,
      )}%. So với tuần trước, online thay đổi ${formatPct(
        onlineShift,
      )} điểm phần trăm và POS thay đổi ${formatPct(posShift)} điểm phần trăm.`,
      miniStats: [
        {
          label: "Nên nhập thêm",
          value: `${restock.length}`,
          note: "SKU có đề xuất bổ sung hàng trong 7 ngày tới",
        },
        {
          label: "Nguy cơ hết hàng",
          value: `${stockout.length}`,
          note: "SKU có độ phủ tồn kho dưới 7 ngày",
        },
        {
          label: "Quay vòng chậm",
          value: `${slowMoving.length}`,
          note: "SKU tồn nhiều nhưng bán chậm trong 30 ngày",
        },
      ],
      restock,
      stockout,
      slowMoving,
    };
  }, [
    inventoryRows,
    catalogProducts,
    weeklyOnlineOrders,
    weeklyPosOrders,
    previousWeeklyOnlineOrders,
    previousWeeklyPosOrders,
    monthlyOnlineOrders,
    monthlyPosOrders,
    branchId,
    branches,
  ]);

  const campaignAnalysisPayload = useMemo(
    () => ({
      range,
      branchId: branchId || null,
      branchLabel: forecastData.branchLabel,
      totalRevenue: Number(totalRevenue || 0),
      onlineRevenue: Number(onlineRevenue || 0),
      posRevenue: Number(posRevenue || 0),
      revenueChangePct: Number(revenueChange || 0),
      usersCount: Number(usersCount || 0),
      appointmentsToday: Number(appointmentsToday || 0),
      inventorySummary: {
        skuCount: Number(inventorySummary.skuCount || 0),
        onHand: Number(inventorySummary.onHand || 0),
        available: Number(inventorySummary.available || 0),
        reserved: Number(inventorySummary.reserved || 0),
        outOfStock: Number(inventorySummary.outOfStock || 0),
      },
      topProducts: (topProducts || []).slice(0, 5).map((item) => ({
        name: item.name,
        quantity: Number(item.qty || item.count || 0),
      })),
      lowStockItems: (lowStockItems || []).slice(0, 6).map((item) => ({
        id: item.id || null,
        name: item.name,
        sku: item.sku || "",
        onHand: Number(item.onHand || 0),
        threshold: Number(item.threshold || 0),
      })),
      forecast: {
        nextWeekRevenue: Number(forecastData.nextWeekRevenue || 0),
        branchLabel: forecastData.branchLabel || "Toàn hệ thống",
        revenueNote: forecastData.revenueNote || "",
        channelHeadline: forecastData.channelHeadline || "",
        channelNote: forecastData.channelNote || "",
        restock: (forecastData.restock || []).map((item) => ({
          productId: item.productId || null,
          name: item.name,
          badge: item.badge || "",
          note: item.note || "",
          meta: item.meta || [],
        })),
        stockout: (forecastData.stockout || []).map((item) => ({
          productId: item.productId || null,
          name: item.name,
          badge: item.badge || "",
          note: item.note || "",
          meta: item.meta || [],
        })),
        slowMoving: (forecastData.slowMoving || []).map((item) => ({
          productId: item.productId || null,
          name: item.name,
          badge: item.badge || "",
          note: item.note || "",
          meta: item.meta || [],
        })),
      },
    }),
    [
      range,
      branchId,
      forecastData,
      totalRevenue,
      onlineRevenue,
      posRevenue,
      revenueChange,
      usersCount,
      appointmentsToday,
      inventorySummary,
      topProducts,
      lowStockItems,
    ],
  );

  useEffect(() => {
    if (loading) return;
    let active = true;

    const loadCampaignAnalysis = async () => {
      try {
        setCampaignAnalysisLoading(true);
        setCampaignAnalysisError("");
        const data = await generateCampaignAnalysis(campaignAnalysisPayload);
        if (!active) return;
        setCampaignAnalysis(data && Object.keys(data).length ? data : null);
      } catch (err) {
        if (!active) return;
        setCampaignAnalysisError(
          err?.message || "Không thể tạo đề xuất chiến dịch từ AI.",
        );
      } finally {
        if (active) setCampaignAnalysisLoading(false);
      }
    };

    loadCampaignAnalysis();
    return () => {
      active = false;
    };
  }, [campaignAnalysisPayload, campaignRefreshToken, loading]);

  const recentOrders = useMemo(() => {
    return [...(onlineRangeOrders || [])]
      .sort(
        (a, b) =>
          new Date(b.createdAt || 0).getTime() -
          new Date(a.createdAt || 0).getTime(),
      )
      .slice(0, 8)
      .map((order) => {
        const ui = orderStatusToUi(order.status);
        return {
          id: order.id,
          code: `#${String(order.id || "").slice(0, 8)}`,
          customer:
            order.shippingAddress?.fullName || order.userId || "Khach hang",
          total: formatMoney(order.totalAmount || order.total || 0),
          status: ui,
        };
      });
  }, [onlineRangeOrders]);

  const operationalCards = useMemo(
    () => [
      {
        label: "Tồn kho thấp",
        value: `${lowStockItems.length}`,
        note: `${inventorySummary.outOfStock} hết hàng`,
      },
      {
        label: "Theo dõi",
        value: `${inventorySummary.skuCount}`,
        note: "Danh mục đang theo dõi",
      },
      {
        label: "Tồn khả dụng",
        value: `${inventorySummary.available}`,
        note: "Đơn vị tồn khả dụng",
      },
    ],
    [inventorySummary, lowStockItems.length],
  );

  return (
    <AdminLayout activeKey="dashboard">
      <main className="bg-[#f6f8fc] px-4 pb-8 pt-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[1500px] space-y-6">
          <DashboardHeader
            activeRange={range}
            onRangeChange={setRange}
            branches={branches}
            branchId={branchId}
            onBranchChange={setBranchId}
          />

          {error ? (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {error}
            </div>
          ) : null}

          <DashboardSection
            title="Tổng quan doanh nghiệp"
            className="overflow-hidden"
          >
            <div className="grid gap-6 xl:grid-cols-[minmax(280px,360px)_minmax(0,1fr)]">
              <div className="grid gap-6">
                <HeroMetricCard
                  value={loading ? "..." : formatMoney(totalRevenue)}
                  label="Doanh thu"
                  change={revenueChange}
                  note={
                    range === "today"
                      ? "so với hôm qua"
                      : range === "week"
                        ? "so với 7 ngày trước"
                        : "so với 30 ngày trước"
                  }
                  tone="blue"
                  loading={loading}
                />
                <HeroMetricCard
                  value={
                    loading
                      ? "..."
                      : `${totalCustomers.toLocaleString("vi-VN")}`
                  }
                  label="Tổng khách hàng"
                  change={customerChange}
                  note="người dùng đang hoạt động trong hệ thống"
                  tone="emerald"
                  loading={loading}
                />
              </div>

              <AreaTrendCard
                title="Lưu lượng doanh thu"
                subtitle="Tổng hợp biến động doanh thu và mức độ mua hàng trong khoảng thời gian đang xem."
                points={timelinePoints}
                loading={loading}
              />
            </div>
          </DashboardSection>

          <div className="grid min-w-0 gap-6 2xl:grid-cols-[minmax(0,1.02fr)_minmax(0,1.24fr)_minmax(0,0.94fr)]">
            <RingChartCard
              title="Cơ cấu doanh thu theo kênh"
              total={channelSegments.reduce((sum, item) => sum + item.value, 0)}
              segments={channelSegments}
            />
            <VerticalBarsCard
              title="Độ ổn định vận hành"
              items={fulfillmentSeries}
              valueFormatter={(value) => `${value}%`}
            />
            <StackedBarsCard
              title="Kết quả xử lý đơn hàng"
              items={statusSeries}
            />
          </div>

          <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
            <InventorySignalsCard
              title="Tín hiệu tồn kho"
              items={inventoryBars}
            />
            <TechOpsCard entries={techOpsEntries} />
          </div>

          <div className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
            <DashboardSection title="Sản phẩm bán chạy" className="h-full">
              {topProducts.length === 0 ? (
                <EmptyState message="Chưa có dữ liệu sản phẩm nổi bật trong khoảng thời gian này." />
              ) : (
                <div className="space-y-4">
                  {topProducts.map((product, index) => (
                    <div
                      key={product.name}
                      className="rounded-[24px] border border-slate-100 bg-slate-50 px-4 py-4"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex min-w-0 items-center gap-4">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-sm font-semibold text-slate-500 shadow-sm">
                            {String(index + 1).padStart(2, "0")}
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-slate-900">
                              {product.name}
                            </p>
                            <p className="mt-1 text-xs text-slate-400">
                              Hiệu suất bán hàng từ online và tại quầy
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-semibold text-slate-900">
                            {product.qty}
                          </div>
                          <div className="text-xs text-slate-400">đơn vị</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </DashboardSection>

            <DashboardSection title="Toàn cảnh vận hành" className="h-full">
              <div className="grid gap-4">
                {operationalCards.map((card) => (
                  <div
                    key={card.label}
                    className="rounded-[24px] border border-slate-100 bg-gradient-to-br from-white to-slate-50 px-5 py-5"
                  >
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
                      {card.label}
                    </p>
                    <p className="mt-3 text-4xl font-semibold tracking-tight text-slate-900">
                      {card.value}
                    </p>
                    <p className="mt-2 text-sm text-slate-500">{card.note}</p>
                  </div>
                ))}
              </div>
            </DashboardSection>
          </div>

          <ForecastHeroCard forecast={forecastData} />

          <AiCampaignPanel
            loading={campaignAnalysisLoading}
            error={campaignAnalysisError}
            analysis={campaignAnalysis}
            onRefresh={() => setCampaignRefreshToken((value) => value + 1)}
          />

          <div className="grid gap-6 xl:grid-cols-3">
            <ForecastListCard
              title="Nên nhập thêm trong 7 ngày tới"
              eyebrow="Restock priority"
              items={forecastData.restock}
              emptyText="Chưa thấy SKU nào cần bổ sung thêm rõ rệt trong 7 ngày tới."
            />
            <ForecastListCard
              title="SKU có nguy cơ hết hàng sớm"
              eyebrow="Stockout risk"
              items={forecastData.stockout}
              emptyText="Chưa có SKU nào rơi vào ngưỡng rủi ro hết hàng trong 3-7 ngày."
            />
            <ForecastListCard
              title="SKU có nguy cơ tồn lâu"
              eyebrow="Slow-moving"
              items={forecastData.slowMoving}
              emptyText="Chưa có SKU nào nổi bật về nguy cơ quay vòng chậm trong 30 ngày tới."
            />
          </div>

          <div className="grid gap-6 xl:grid-cols-[minmax(0,1.25fr)_minmax(0,0.75fr)]">
            <AdminTableWrapper className="overflow-hidden" padded={false}>
              <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 sm:px-6">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">
                    Đơn hàng trực tiếp
                  </p>
                  <h3 className="mt-2 text-lg font-semibold text-slate-900">
                    Đơn online gần đây
                  </h3>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-[720px] text-sm">
                  <thead>
                    <tr>
                      <th className="px-6 py-4 text-left">Order</th>
                      <th className="px-6 py-4 text-left">Customer</th>
                      <th className="px-6 py-4 text-left">Total</th>
                      <th className="px-6 py-4 text-left">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentOrders.length === 0 ? (
                      <tr>
                        <td
                          colSpan={4}
                          className="px-6 py-10 text-center text-slate-500"
                        >
                          Chưa có đơn hàng gần đây.
                        </td>
                      </tr>
                    ) : (
                      recentOrders.map((order) => (
                        <tr key={order.id}>
                          <td className="px-6 py-5 font-semibold text-slate-900">
                            {order.code}
                          </td>
                          <td className="px-6 py-5 text-slate-600">
                            {order.customer}
                          </td>
                          <td className="px-6 py-5 text-slate-900">
                            {order.total}
                          </td>
                          <td className="px-6 py-5">
                            <span
                              className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${
                                statusPillClass[order.status.key] ||
                                statusPillClass.pending
                              }`}
                            >
                              {order.status.label}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </AdminTableWrapper>

            <AdminTableWrapper className="overflow-hidden" padded={false}>
              <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 sm:px-6">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">
                    Tồn kho
                  </p>
                  <h3 className="mt-2 text-lg font-semibold text-slate-900">
                    Cảnh báo sắp hết hàng
                  </h3>
                </div>
              </div>
              <div className="divide-y divide-slate-100 px-5 py-2 sm:px-6">
                {lowStockItems.length === 0 ? (
                  <div className="py-10 text-center text-sm text-slate-500">
                    Chưa có cảnh báo tồn kho.
                  </div>
                ) : (
                  lowStockItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-start justify-between gap-4 py-4"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-900">
                          {item.name}
                        </p>
                        <p className="mt-1 text-xs text-slate-400">
                          SKU {item.sku}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-rose-600">
                          {item.onHand} left
                        </p>
                        <p className="mt-1 text-xs text-slate-400">
                          Threshold {item.threshold}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </AdminTableWrapper>
          </div>
        </div>
      </main>
    </AdminLayout>
  );
};

export default AdminDashboardPage;
