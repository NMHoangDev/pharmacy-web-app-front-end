import React, { useEffect, useMemo, useState } from "react";
import AdminLayout from "../../../components/admin/AdminLayout";
import OrdersToolbar from "../../../components/admin/orders/OrdersToolbar";
import OrdersTable from "../../../components/admin/orders/OrdersTable";
import OrderDetailPanel from "../../../components/admin/orders/OrderDetailPanel";
import AdminPageContainer from "../../../components/common/AdminPageContainer";
import AdminTableWrapper from "../../../components/common/AdminTableWrapper";
import { authApi } from "../../../api/httpClients";

const formatCurrency = (n) => `$${Number(n || 0).toFixed(2)}`;

const statusMapFromApi = {
  DRAFT: "pending",
  PENDING_PAYMENT: "pending",
  PLACED: "processing",
  CONFIRMED: "processing",
  SHIPPING: "shipped",
  COMPLETED: "completed",
  CANCELED: "cancelled",
};

const statusMapToApi = {
  pending: "PENDING_PAYMENT",
  processing: "CONFIRMED",
  shipped: "SHIPPING",
  completed: "COMPLETED",
  cancelled: "CANCELED",
};

const placeholderImage =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuAcwAsgIceZ-i3iDrfCK8wU1cMATpaKU9tDMcAZabrpL6YgwzXlSUS1gM6T0HRblEH1yY9yilN4EfCNQaVGMfz9bzDLAzRYFvU484libnDtm6gDN20o3wwmpV4Cn7ul40y9MBaYRmpaTau4VTrOlWBV-o8fI8g4XRc-sCIuxemIGKLljYGtYP7fwWwCm29HG_Fh6e_L_UObXnFrmcDx1jnCC79BikwyowQmAJ5pcDUyMLWGIsPgY1fH-sqU9wFaMrDnoWWaiMEXDZ8k";

const normalizeOrder = (order) => {
  const dateObj = new Date(order.date || order.createdAt || Date.now());
  return {
    ...order,
    dateObj,
    dateLabel: `${dateObj.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })} ${dateObj.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
    })}`,
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
    userId: order.userId,
    fulfillmentBranchId: order.fulfillmentBranchId || null,
    fulfillmentAssignedAt: order.fulfillmentAssignedAt || null,
    fulfillmentAssignedBy: order.fulfillmentAssignedBy || null,
    fulfillmentStatus: order.fulfillmentStatus || null,
    inventoryReservationId: order.inventoryReservationId || null,
    customer: shippingAddress.fullName || order.userId || "Khách hàng",
    date: order.createdAt,
    total: order.totalAmount,
    payment: (order.paymentStatus || "unpaid").toLowerCase(),
    status: statusMapFromApi[order.status] || "pending",
    phone: shippingAddress.phone || "",
    address: addressParts.join(", ") || "",
    customerNote: order.note || "",
    items: (order.items || []).map((item) => ({
      name: item.productName || "Sản phẩm",
      meta: item.productId,
      qty: item.quantity,
      priceLabel: formatCurrency(item.unitPrice),
      image: placeholderImage,
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
        const items = Array.isArray(response?.data) ? response.data : [];
        setOrders(items.map(mapApiOrder));
        setError("");
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
    const apiStatus = statusMapToApi[status] || status.toUpperCase();
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

  return (
    <AdminLayout activeKey="orders">
      <AdminPageContainer>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-lg font-semibold text-slate-900">
              Quản lý đơn hàng
            </h1>
            <p className="mt-1 text-sm text-slate-400">
              Theo dõi và xử lý đơn hàng khách đặt
            </p>
          </div>
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
              <span className="material-symbols-outlined text-[20px]">add</span>
              + Đơn mới
            </button>
          </div>
        </div>

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

        {error && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        )}

        {loading && (
          <AdminTableWrapper className="px-4 py-3 text-sm text-slate-600">
            Đang tải dữ liệu đơn hàng...
          </AdminTableWrapper>
        )}

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
