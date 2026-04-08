import React, { useEffect, useMemo, useState } from "react";
import AdminLayout from "../../components/AdminLayout";
import OrdersToolbar from "../../components/orders/OrdersToolbar";
import OrdersTable from "../../components/orders/OrdersTable";
import OrderDetailPanel from "../../components/orders/OrderDetailPanel";
import AdminPageHeader from "../../components/shared/AdminPageHeader";
import StatsSection from "../../components/shared/StatsSection";
import AdminPageContainer from "../../../../shared/components/common/AdminPageContainer";
import AdminTableWrapper from "../../../../shared/components/common/AdminTableWrapper";
import { authApi } from "../../../../shared/api/httpClients";
import useOrderStats from "../../../../shared/hooks/queries/useOrderStats";
import {
  toApiOrderStatus,
  toOrderStatusLabel,
  toPaymentStatusLabel,
  toUiOrderStatus,
  toUiPaymentStatus,
} from "../../../../shared/utils/orderStatus";

const formatCurrency = (n) => `${Number(n || 0).toLocaleString("vi-VN")} đ`;

const normalizeOrder = (order) => {
  const dateObj = new Date(order.date || order.createdAt || Date.now());
  return {
    ...order,
    dateObj,
    dateLabel: `${dateObj.toLocaleDateString("vi-VN")} ${dateObj.toLocaleTimeString(
      "vi-VN",
      {
        hour: "2-digit",
        minute: "2-digit",
      },
    )}`,
    subtotalLabel: formatCurrency(
      order.subtotal ?? order.total - order.shipping,
    ),
    shippingLabel: formatCurrency(order.shipping ?? order.shippingFee ?? 0),
    totalLabel: formatCurrency(order.total ?? order.totalAmount),
  };
};

const mapApiOrder = (order) => {
  const shippingAddress = order.shippingAddress || {};
  const addressParts = [
    shippingAddress.addressLine,
    shippingAddress.wardName,
    shippingAddress.districtName,
    shippingAddress.provinceName,
  ].filter(Boolean);

  return normalizeOrder({
    id: order.id,
    orderCode: order.orderCode || "",
    userId: order.userId,
    fulfillmentBranchId: order.fulfillmentBranchId || null,
    fulfillmentAssignedAt: order.fulfillmentAssignedAt || null,
    fulfillmentAssignedBy: order.fulfillmentAssignedBy || null,
    fulfillmentStatus: order.fulfillmentStatus || null,
    inventoryReservationId: order.inventoryReservationId || null,
    customer: shippingAddress.fullName || order.userId || "Khách hàng",
    date: order.createdAt,
    total: order.totalAmount,
    payment: toUiPaymentStatus(order.paymentStatus),
    paymentLabel: toPaymentStatusLabel(order.paymentStatus),
    status: toUiOrderStatus(order.status),
    statusLabel: toOrderStatusLabel(order.status),
    phone: shippingAddress.phone || "",
    address: addressParts.join(", ") || "",
    customerNote: order.note || "",
    items: (order.items || []).map((item) => ({
      name: item.productName || "Sản phẩm",
      meta:
        item.shortDescription || item.category || item.sku || item.productId,
      qty: item.quantity,
      priceLabel: formatCurrency(item.unitPrice),
      image: item.imageUrl || "",
      sku: item.sku || "",
      unit: item.unit || "",
    })),
    shipping: order.shippingFee ?? 0,
    subtotal: order.subtotal,
    shippingFee: order.shippingFee,
    totalAmount: order.totalAmount,
    createdAt: order.createdAt,
  });
};

const pagerBtn =
  "rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50";

const AdminOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [filters, setFilters] = useState({
    query: "",
    status: "all",
    payment: "all",
    sort: "newest",
  });
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(0);
  const [selectedId, setSelectedId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { data: orderStatsData, isLoading: orderStatsLoading } = useOrderStats({
    range: "7d",
  });

  const filteredOrders = useMemo(() => {
    const q = filters.query.trim().toLowerCase();
    return orders
      .filter((order) => {
        const searchable =
          `${order.id} ${order.customer} ${order.userId || ""} ${order.phone || ""}`
            .toLowerCase()
            .trim();
        const matchesQuery = q ? searchable.includes(q) : true;
        const matchesStatus =
          filters.status === "all" || order.status === filters.status;
        const matchesPayment =
          filters.payment === "all" || order.payment === filters.payment;
        return matchesQuery && matchesStatus && matchesPayment;
      })
      .sort((a, b) =>
        filters.sort === "oldest"
          ? a.dateObj - b.dateObj
          : b.dateObj - a.dateObj,
      );
  }, [orders, filters]);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(filteredOrders.length / pageSize)),
    [filteredOrders.length, pageSize],
  );

  const pagedOrders = useMemo(() => {
    const start = page * pageSize;
    return filteredOrders.slice(start, start + pageSize);
  }, [filteredOrders, page, pageSize]);

  useEffect(() => {
    const controller = new AbortController();

    const loadOrders = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await authApi.get("/api/admin/orders", {
          signal: controller.signal,
        });
        const payload = response?.data;
        const items = Array.isArray(payload)
          ? payload
          : Array.isArray(payload?.items)
            ? payload.items
            : [];
        setOrders(items.map(mapApiOrder));
      } catch (err) {
        if (err && err.name === "AbortError") return;
        setError("Không tải được danh sách đơn hàng.");
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
    return () => controller.abort();
  }, []);

  useEffect(() => {
    setPage(0);
  }, [filters.query, filters.status, filters.payment, filters.sort, pageSize]);

  const handleUpdateStatus = async (status, idOverride) => {
    const targetId = idOverride || selectedId;
    if (!targetId) return;
    const apiStatus = toApiOrderStatus(status);
    try {
      const response = await authApi.post(
        `/api/admin/orders/${targetId}/status`,
        null,
        {
          params: { status: apiStatus },
        },
      );
      const updated = mapApiOrder(response.data);
      setOrders((prev) => prev.map((o) => (o.id === targetId ? updated : o)));
      setError("");
    } catch (err) {
      setError("Không cập nhật được trạng thái đơn hàng.");
    }
  };

  const handleAssignBranch = async (orderId, branchId) => {
    const targetId = orderId || selectedId;
    if (!targetId || !branchId) return null;
    try {
      const response = await authApi.post(
        `/api/admin/orders/${targetId}/assign-branch`,
        { branchId },
      );
      const updated = mapApiOrder(response.data);
      setOrders((prev) => prev.map((o) => (o.id === targetId ? updated : o)));
      setError("");
      return updated;
    } catch (err) {
      setError("Không thể gán chi nhánh cho đơn hàng.");
      return null;
    }
  };

  const selectedOrder = orders.find((o) => o.id === selectedId) || null;
  const orderMetrics = orderStatsData?.metrics || orderStatsData || {};

  const orderStatsCards = useMemo(
    () => [
      {
        key: "total",
        label: "Tổng đơn hàng",
        value: Number(orderMetrics.totalOrders ?? orders.length).toLocaleString(
          "vi-VN",
        ),
        description: "Tất cả đơn trong hệ thống",
        icon: "receipt_long",
      },
      {
        key: "waiting",
        label: "Chờ xác nhận",
        value: Number(
          orderMetrics.waitingConfirmationOrders ??
            orders.filter((o) => o.status === "pending").length,
        ).toLocaleString("vi-VN"),
        description: "Đơn mới tạo hoặc chưa hoàn tất xác nhận thanh toán",
        icon: "pending_actions",
      },
      {
        key: "processing",
        label: "Đang xử lý",
        value: Number(
          orderMetrics.processingOrders ??
            orders.filter((o) => o.status === "processing").length,
        ).toLocaleString("vi-VN"),
        description: "Đơn đã xác nhận và đang được chuẩn bị",
        icon: "inventory_2",
      },
      {
        key: "shipping",
        label: "Đang giao",
        value: Number(
          orderMetrics.shippingOrders ??
            orders.filter((o) => o.status === "shipped").length,
        ).toLocaleString("vi-VN"),
        description: "Đơn đang ở luồng vận chuyển",
        icon: "local_shipping",
      },
      {
        key: "completed",
        label: "Đã hoàn thành",
        value: Number(
          orderMetrics.completedOrders ??
            orders.filter((o) => o.status === "completed").length,
        ).toLocaleString("vi-VN"),
        description: "Đơn đã giao thành công và khép quy trình",
        icon: "task_alt",
        tone: "up",
      },
      {
        key: "revenueWeek",
        label: "Doanh thu tuần",
        value: `${Number(orderMetrics.revenueThisWeek ?? 0).toLocaleString("vi-VN")} đ`,
        description: `Hôm nay: ${Number(orderMetrics.revenueToday ?? 0).toLocaleString("vi-VN")} đ`,
        icon: "payments",
      },
    ],
    [orderMetrics, orders],
  );

  return (
    <AdminLayout activeKey="orders">
      <AdminPageContainer>
        <AdminPageHeader
          title="Quản lý đơn hàng"
          subtitle="Theo dõi trạng thái vận hành và doanh thu theo thời gian"
          actions={
            <div className="flex gap-3">
              <button
                type="button"
                className="flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50"
              >
                <span className="material-symbols-outlined text-[20px]">
                  file_download
                </span>
                Xuất dữ liệu
              </button>
              <button
                type="button"
                className="flex h-10 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-white shadow-sm hover:bg-primary/90"
                onClick={() => alert("Chức năng thêm đơn mới sẽ được bổ sung")}
              >
                <span className="material-symbols-outlined text-[20px]">
                  add
                </span>
                + Đơn mới
              </button>
            </div>
          }
        />

        <StatsSection
          items={orderStatsCards}
          loading={orderStatsLoading && !orders.length}
          emptyText="Chưa có dữ liệu tổng quan đơn hàng"
        />

        <OrdersToolbar
          search={filters.query}
          onSearchChange={(query) => setFilters({ ...filters, query })}
          status={filters.status}
          onStatusChange={(status) => setFilters({ ...filters, status })}
          payment={filters.payment}
          onPaymentChange={(payment) => setFilters({ ...filters, payment })}
          sort={filters.sort}
          onSortChange={(sort) => setFilters({ ...filters, sort })}
          pageSize={pageSize}
          onPageSizeChange={setPageSize}
          onReset={() => {
            setFilters({
              query: "",
              status: "all",
              payment: "all",
              sort: "newest",
            });
            setPageSize(10);
          }}
        />

        {loading ? (
          <AdminTableWrapper className="px-4 py-3 text-sm text-slate-600">
            Đang tải dữ liệu đơn hàng...
          </AdminTableWrapper>
        ) : null}

        <OrdersTable
          orders={pagedOrders}
          onView={(orderId) => setSelectedId(orderId)}
          onComplete={(orderId) => handleUpdateStatus("completed", orderId)}
          onCancel={(orderId) => handleUpdateStatus("cancelled", orderId)}
        />

        <AdminTableWrapper className="p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="text-sm text-slate-500">
              Đang hiển thị {pagedOrders.length} đơn hàng
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                className={pagerBtn}
                disabled={page <= 0}
                onClick={() => setPage((prev) => Math.max(0, prev - 1))}
              >
                Trước
              </button>
              <span className="text-sm text-slate-600">
                Trang {Math.max(1, page + 1)} / {Math.max(1, totalPages)}
              </span>
              <button
                type="button"
                className={pagerBtn}
                disabled={page >= Math.max(0, totalPages - 1)}
                onClick={() =>
                  setPage((prev) =>
                    Math.min(Math.max(0, totalPages - 1), prev + 1),
                  )
                }
              >
                Sau
              </button>
            </div>
          </div>
        </AdminTableWrapper>

        <OrderDetailPanel
          open={Boolean(selectedOrder)}
          order={selectedOrder}
          onClose={() => setSelectedId(null)}
          onUpdateStatus={handleUpdateStatus}
          onAssignBranch={handleAssignBranch}
        />
      </AdminPageContainer>
    </AdminLayout>
  );
};

export default AdminOrdersPage;
