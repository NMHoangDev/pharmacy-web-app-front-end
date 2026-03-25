import React, { useEffect, useMemo, useState } from "react";
import AdminLayout from "../../../components/admin/AdminLayout";
import DashboardHeader from "../../../components/admin/dashboard/DashboardHeader";
import StatsGrid from "../../../components/admin/dashboard/StatsGrid";
import RevenueChartCard from "../../../components/admin/dashboard/RevenueChartCard";
import TopProductsCard from "../../../components/admin/dashboard/TopProductsCard";
import RecentOrdersTable from "../../../components/admin/dashboard/RecentOrdersTable";
import LowStockAlerts from "../../../components/admin/dashboard/LowStockAlerts";
import { authApi } from "../../../api/httpClients";
import { useBranches } from "../../../hooks/useBranches";
import { useAdminBranchSelection } from "../../../hooks/useAdminBranchSelection";
import { listAppointmentsByDate } from "../../../api/adminAppointmentApi";
import {
  getInventoryAvailability,
  listCatalogProducts,
} from "../../../api/adminInventoryApi";

const formatVndCompact = (value) => {
  const n = Number(value || 0);
  if (!Number.isFinite(n)) return "0";
  const abs = Math.abs(n);
  if (abs >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}tỷ`;
  if (abs >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}tr`;
  if (abs >= 1_000) return `${Math.round(n / 1_000)}k`;
  return String(Math.round(n));
};

const formatVnd = (value) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

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
  item?.productName || item?.name || item?.sku || "Sản phẩm";

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
  const s = String(status || "").toUpperCase();
  if (["COMPLETED"].includes(s))
    return { key: "completed", label: "Hoàn thành" };
  if (["SHIPPING"].includes(s)) return { key: "shipping", label: "Đang giao" };
  if (["CANCELED", "CANCELLED"].includes(s))
    return { key: "processing", label: "Đã hủy" };
  if (["PENDING_PAYMENT", "DRAFT"].includes(s))
    return { key: "processing", label: "Chờ thanh toán" };
  return { key: "processing", label: "Đang xử lý" };
};

const computePctChange = (current, previous) => {
  const c = Number(current || 0);
  const p = Number(previous || 0);
  if (!Number.isFinite(c) || !Number.isFinite(p)) return null;
  if (p === 0) {
    if (c === 0) return 0;
    return 100;
  }
  return ((c - p) / p) * 100;
};

const toBars = (points) => {
  const max = Math.max(1, ...points.map((p) => Number(p.value || 0)));
  return points.map((p) => {
    const v = Number(p.value || 0);
    const height = Math.round((Math.max(0, v) / max) * 90 + 5); // keep visible
    return {
      label: p.label,
      height,
      value: formatVndCompact(v),
    };
  });
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

const bucketOrders = (orders, range) => {
  const now = new Date();

  if (range === "today") {
    const from = startOfDay(now);
    const buckets = Array.from({ length: 8 }, (_, i) => ({
      label: String(i * 3).padStart(2, "0"),
      from: new Date(
        from.getFullYear(),
        from.getMonth(),
        from.getDate(),
        i * 3,
        0,
        0,
        0,
      ),
      to: new Date(
        from.getFullYear(),
        from.getMonth(),
        from.getDate(),
        (i + 1) * 3,
        0,
        0,
        0,
      ),
      value: 0,
    }));

    for (const o of orders) {
      const t = new Date(o.createdAt || o.date || 0);
      if (t < from) continue;
      const hour = t.getHours();
      const idx = Math.min(7, Math.max(0, Math.floor(hour / 3)));
      buckets[idx].value += Number(o.totalAmount || o.total || 0);
    }
    return {
      title: "Biểu đồ Doanh thu",
      subtitle: "Theo dõi theo khung giờ hôm nay",
      bars: toBars(buckets),
    };
  }

  const days = range === "month" ? 30 : 7;
  const from = startOfDay(addDays(now, -(days - 1)));
  const points = [];
  for (let i = 0; i < days; i++) {
    const day = addDays(from, i);
    const label = `${String(day.getDate()).padStart(2, "0")}/${String(day.getMonth() + 1).padStart(2, "0")}`;
    points.push({
      label,
      from: startOfDay(day),
      to: startOfDay(addDays(day, 1)),
      value: 0,
    });
  }

  for (const o of orders) {
    const t = new Date(o.createdAt || o.date || 0);
    if (t < from) continue;
    const dayIdx = Math.floor(
      (startOfDay(t).getTime() - from.getTime()) / (24 * 60 * 60 * 1000),
    );
    if (dayIdx < 0 || dayIdx >= points.length) continue;
    points[dayIdx].value += Number(o.totalAmount || o.total || 0);
  }

  // For month: reduce to 6 buckets (5 days each) so the chart stays readable
  if (range === "month") {
    const reduced = [];
    for (let i = 0; i < 6; i++) {
      const start = i * 5;
      const chunk = points.slice(start, start + 5);
      const sum = chunk.reduce((acc, p) => acc + Number(p.value || 0), 0);
      const label = `${chunk[0]?.label || ""}-${chunk[chunk.length - 1]?.label || ""}`;
      reduced.push({ label, value: sum });
    }
    return {
      title: "Biểu đồ Doanh thu",
      subtitle: "Theo dõi 30 ngày qua (gom theo 5 ngày)",
      bars: toBars(reduced),
    };
  }

  return {
    title: "Biểu đồ Doanh thu",
    subtitle: "Theo dõi 7 ngày qua",
    bars: toBars(points),
  };
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
  const [inventorySummary, setInventorySummary] = useState({
    skuCount: 0,
    onHand: 0,
    available: 0,
    outOfStock: 0,
  });

  useEffect(() => {
    if (!branches?.length) return;
    if (branchId && branches.some((b) => b.id === branchId)) return;
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
            authApi.get("/api/admin/orders", {
              signal: controller.signal,
            }),
            fetchAllPosOrders({
              branchId: branchId || undefined,
              signal: controller.signal,
            }),
            authApi.get("/api/admin/users", {
              signal: controller.signal,
            }),
          ],
        );

        const onlineOrders =
          ordersResult.status === "fulfilled"
            ? (() => {
                const rawOrders = ordersResult.value?.data;
                return (
                  (Array.isArray(rawOrders) ? rawOrders : null) ||
                  (Array.isArray(rawOrders?.content)
                    ? rawOrders.content
                    : null) ||
                  (Array.isArray(rawOrders?.items) ? rawOrders.items : null) ||
                  []
                );
              })()
            : [];

        const posOrders =
          posResult.status === "fulfilled" && Array.isArray(posResult.value)
            ? posResult.value
            : [];

        const systemUsers =
          usersResult.status === "fulfilled"
            ? Array.isArray(usersResult.value?.data)
              ? usersResult.value.data
              : []
            : [];

        const today = toYmd(new Date());
        let appts = [];
        try {
          appts = await listAppointmentsByDate(today, branchId || undefined);
        } catch {
          // keep dashboard usable even if appointment-service is down
          appts = [];
        }

        // Inventory snapshot + low stock for selected branch.
        let lowStock = [];
        let inventory = {
          skuCount: 0,
          onHand: 0,
          available: 0,
          outOfStock: 0,
        };
        try {
          const productPage = await listCatalogProducts({
            page: 0,
            size: 300,
            branchId: branchId || undefined,
          });
          const products = productPage?.content || productPage?.items || [];
          const productIds = products.map((p) => p.id).filter(Boolean);
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

          const stockRows = products.map((p) => {
            const inv = availabilityMap[p.id] || {};
            const onHand = Number(inv.onHand ?? 0);
            const reserved = Number(inv.reserved ?? 0);
            const available = Number(
              inv.available ?? Math.max(onHand - reserved, 0),
            );
            return {
              productId: p.id,
              onHand: Number.isFinite(onHand) ? onHand : 0,
              reserved: Number.isFinite(reserved) ? reserved : 0,
              available: Number.isFinite(available) ? available : 0,
            };
          });

          inventory = {
            skuCount: stockRows.length,
            onHand: stockRows.reduce((acc, cur) => acc + cur.onHand, 0),
            available: stockRows.reduce((acc, cur) => acc + cur.available, 0),
            outOfStock: stockRows.filter((x) => x.available <= 0).length,
          };

          lowStock = products
            .map((p) => {
              const attrs = parseAttributes(p.attributes);
              const threshold = Number(
                attrs.threshold ?? attrs.reorderPoint ?? attrs.minStock ?? 20,
              );
              const inv = availabilityMap[p.id] || {};
              const onHand = inv.onHand ?? 0;
              const reserved = inv.reserved ?? 0;
              const available = inv.available ?? Math.max(onHand - reserved, 0);
              return {
                id: p.id,
                name: p.name,
                sku: p.sku,
                onHand,
                reserved,
                available,
                threshold: Number.isFinite(threshold) ? threshold : 20,
              };
            })
            .filter((x) => x.onHand <= x.threshold)
            .sort((a, b) => a.onHand - b.onHand)
            .slice(0, 6);
        } catch {
          lowStock = [];
        }

        if (!active) return;
        setOrdersRaw(onlineOrders);
        setPosOrdersRaw(posOrders);
        setUsersCount(systemUsers.length);
        setAppointmentsToday(Array.isArray(appts) ? appts.length : 0);
        setLowStockItems(lowStock);
        setInventorySummary(inventory);
      } catch (e) {
        if (!active) return;
        setError(e?.message || "Không thể tải dữ liệu tổng quan");
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
      filterOrdersByRange(ordersRaw || [], range).filter((o) =>
        isOnlineRevenueStatus(o?.status),
      ),
    [ordersRaw, range],
  );

  const onlinePrevRangeOrders = useMemo(
    () =>
      filterOrdersPrevRange(ordersRaw || [], range).filter((o) =>
        isOnlineRevenueStatus(o?.status),
      ),
    [ordersRaw, range],
  );

  const posRangeOrders = useMemo(
    () =>
      filterOrdersByRange(posOrdersRaw || [], range).filter((o) =>
        isPosRevenueStatus(o?.status),
      ),
    [posOrdersRaw, range],
  );

  const posPrevRangeOrders = useMemo(
    () =>
      filterOrdersPrevRange(posOrdersRaw || [], range).filter((o) =>
        isPosRevenueStatus(o?.status),
      ),
    [posOrdersRaw, range],
  );

  const onlineRevenue = useMemo(
    () =>
      onlineRangeOrders.reduce(
        (acc, o) => acc + Number(o.totalAmount || o.total || 0),
        0,
      ),
    [onlineRangeOrders],
  );

  const posRevenue = useMemo(
    () =>
      posRangeOrders.reduce(
        (acc, o) => acc + Number(o.totalAmount || o.total || 0),
        0,
      ),
    [posRangeOrders],
  );

  const totalRevenue = onlineRevenue + posRevenue;

  const revenuePrev = useMemo(
    () =>
      [...onlinePrevRangeOrders, ...posPrevRangeOrders].reduce(
        (acc, o) => acc + Number(o.totalAmount || o.total || 0),
        0,
      ),
    [onlinePrevRangeOrders, posPrevRangeOrders],
  );

  const onlineOrdersCount = onlineRangeOrders.length;
  const onlineOrdersCountPrev = onlinePrevRangeOrders.length;

  const onlineSoldQty = useMemo(
    () =>
      onlineRangeOrders.reduce(
        (acc, o) =>
          acc +
          (Array.isArray(o?.items)
            ? o.items.reduce((sum, item) => sum + getItemQty(item), 0)
            : 0),
        0,
      ),
    [onlineRangeOrders],
  );

  const posSoldQty = useMemo(
    () =>
      posRangeOrders.reduce(
        (acc, o) =>
          acc +
          (Array.isArray(o?.items)
            ? o.items.reduce((sum, item) => sum + getItemQty(item), 0)
            : 0),
        0,
      ),
    [posRangeOrders],
  );

  const totalSoldQty = onlineSoldQty + posSoldQty;

  const pendingOrders = useMemo(
    () => (ordersRaw || []).filter((o) => isPendingOnline(o?.status)).length,
    [ordersRaw],
  );

  const revenueChange = computePctChange(totalRevenue, revenuePrev);
  const ordersChange = computePctChange(
    onlineOrdersCount,
    onlineOrdersCountPrev,
  );

  const stats = useMemo(() => {
    const changeLabel = (pct) => {
      if (pct == null) return null;
      const rounded = Math.round(Math.abs(pct));
      return `${rounded}%`;
    };

    const noteLabel =
      range === "today"
        ? "so với hôm qua"
        : range === "week"
          ? "so với 7 ngày trước"
          : "so với 30 ngày trước";

    return [
      {
        key: "revenueTotal",
        title: "Tổng doanh thu",
        value: formatVndCompact(totalRevenue),
        suffix: "đ",
        change: revenueChange == null ? null : changeLabel(revenueChange),
        changeType: revenueChange != null && revenueChange >= 0 ? "up" : "down",
        note: revenueChange == null ? null : noteLabel,
        icon: "payments",
      },
      {
        key: "counterRevenue",
        title: "Doanh thu tại quầy",
        value: formatVndCompact(posRevenue),
        suffix: "đ",
        note: "nguồn pharmacist_pos",
        icon: "point_of_sale",
      },
      {
        key: "onlineRevenue",
        title: "Doanh thu đặt hàng",
        value: formatVndCompact(onlineRevenue),
        suffix: "đ",
        note: "nguồn order-service",
        icon: "local_shipping",
      },
      {
        key: "orders",
        title: "Đơn bán online",
        value: String(onlineOrdersCount),
        change: ordersChange == null ? null : changeLabel(ordersChange),
        changeType: ordersChange != null && ordersChange >= 0 ? "up" : "down",
        note: ordersChange == null ? null : noteLabel,
        icon: "shopping_cart",
      },
      {
        key: "soldQty",
        title: "Tổng thuốc đã bán",
        value: String(totalSoldQty),
        suffix: "sp",
        note: `${onlineSoldQty} online + ${posSoldQty} quầy`,
        icon: "medication",
      },
      {
        key: "users",
        title: "Số lượng người dùng",
        value: String(usersCount),
        note: "toàn hệ thống",
        icon: "group",
      },
      {
        key: "availableStock",
        title: "Tồn kho khả dụng",
        value: String(inventorySummary.available),
        suffix: "sp",
        note: `${inventorySummary.skuCount} SKU`,
        icon: "inventory_2",
      },
      {
        key: "stock",
        title: "Cảnh báo kho",
        value: String(lowStockItems.length),
        suffix: "mặt hàng",
        note: `${inventorySummary.outOfStock} hết hàng`,
        icon: "warning",
      },
      {
        key: "pending",
        title: "Đơn online chờ xử lý",
        value: String(pendingOrders),
        note: `Lịch tư vấn hôm nay: ${appointmentsToday}`,
        icon: "hourglass_empty",
      },
    ];
  }, [
    range,
    totalRevenue,
    revenueChange,
    posRevenue,
    onlineRevenue,
    onlineOrdersCount,
    ordersChange,
    totalSoldQty,
    onlineSoldQty,
    posSoldQty,
    usersCount,
    inventorySummary.available,
    inventorySummary.skuCount,
    inventorySummary.outOfStock,
    pendingOrders,
    lowStockItems.length,
    appointmentsToday,
  ]);

  const combinedRevenuePoints = useMemo(
    () =>
      [
        ...onlineRangeOrders.map((o) => ({
          createdAt: o?.createdAt,
          totalAmount: Number(o?.totalAmount || o?.total || 0),
        })),
        ...posRangeOrders.map((o) => ({
          createdAt: o?.createdAt,
          totalAmount: Number(o?.totalAmount || o?.total || 0),
        })),
      ].filter((x) => Number.isFinite(x.totalAmount)),
    [onlineRangeOrders, posRangeOrders],
  );

  const revenueChart = useMemo(() => {
    const chart = bucketOrders(combinedRevenuePoints, range);
    return {
      ...chart,
      title: "Biểu đồ tổng doanh thu",
      subtitle:
        "Gộp doanh thu online (order-service) và doanh thu tại quầy (pharmacist_pos)",
    };
  }, [combinedRevenuePoints, range]);

  const products = useMemo(() => {
    const agg = new Map();
    for (const o of onlineRangeOrders) {
      for (const it of o.items || []) {
        const name = getItemName(it);
        agg.set(name, (agg.get(name) || 0) + getItemQty(it));
      }
    }
    for (const o of posRangeOrders) {
      for (const it of o.items || []) {
        const name = getItemName(it);
        agg.set(name, (agg.get(name) || 0) + getItemQty(it));
      }
    }
    const list = Array.from(agg.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);
    const max = Math.max(1, ...list.map((x) => x.count));
    return list.map((x) => ({
      name: x.name,
      count: x.count,
      unit: "sp",
      progress: Math.round((x.count / max) * 100),
    }));
  }, [onlineRangeOrders, posRangeOrders]);

  const recentOrders = useMemo(() => {
    const sorted = [...(onlineRangeOrders || [])].sort((a, b) => {
      const ta = new Date(a.createdAt || 0).getTime();
      const tb = new Date(b.createdAt || 0).getTime();
      return tb - ta;
    });
    return sorted.slice(0, 8).map((o) => {
      const ui = orderStatusToUi(o.status);
      const customer = o.shippingAddress?.fullName || o.userId || "Khách hàng";
      return {
        code: `#${String(o.id || "").slice(0, 8)}`,
        customer,
        total: formatVnd(o.totalAmount || o.total || 0),
        status: ui.key,
        statusLabel: ui.label,
      };
    });
  }, [onlineRangeOrders]);

  const alerts = useMemo(
    () =>
      (lowStockItems || []).map((x) => {
        const critical = x.onHand <= Math.max(1, Math.floor(x.threshold * 0.5));
        return {
          name: x.name,
          detail: `Còn lại: ${x.onHand} (định mức ${x.threshold})`,
          tone: critical
            ? "bg-red-50 dark:bg-red-900/10 border-red-100 dark:border-red-900/20"
            : "bg-orange-50 dark:bg-orange-900/10 border-orange-100 dark:border-orange-900/20",
          detailClass: critical
            ? "text-red-600 dark:text-red-400"
            : "text-orange-600 dark:text-orange-400",
          action: "Mở kho",
          actionClass: critical
            ? "text-white bg-primary hover:bg-blue-600"
            : "text-slate-600 bg-white border border-slate-200 hover:bg-slate-50",
        };
      }),
    [lowStockItems],
  );

  return (
    <AdminLayout activeKey="dashboard">
      <main className="flex-1 overflow-y-auto p-6 md:p-10 bg-background-light dark:bg-background-dark">
        <div className="max-w-[1200px] mx-auto space-y-8">
          <DashboardHeader
            activeRange={range}
            onRangeChange={setRange}
            branches={branches}
            branchId={branchId}
            onBranchChange={setBranchId}
          />

          {error ? (
            <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {error}
            </div>
          ) : null}

          <StatsGrid
            stats={
              loading
                ? stats.map((s) => ({ ...s, value: "…", change: null }))
                : stats
            }
          />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <RevenueChartCard
              bars={revenueChart.bars}
              title={revenueChart.title}
              subtitle={revenueChart.subtitle}
              loading={loading}
              empty={
                !loading &&
                (!revenueChart.bars || revenueChart.bars.length === 0)
              }
            />
            <TopProductsCard products={products} loading={loading} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <RecentOrdersTable orders={recentOrders} loading={loading} />
            <LowStockAlerts
              alerts={alerts}
              loading={loading}
              onOpenInventory={() =>
                (window.location.href = "/admin/inventory")
              }
            />
          </div>
        </div>
      </main>
    </AdminLayout>
  );
};

export default AdminDashboardPage;
