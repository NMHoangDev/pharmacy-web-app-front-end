import React, { useCallback, useEffect, useMemo, useState } from "react";
import PharmacistSidebar from "../../../components/phamacist_POS/PharmacistSidebar";
import {
  getOfflinePosOrder,
  listOfflinePosOrders,
  refundOfflinePosOrder,
} from "../../../api/pharmacistPosApi";
import { useAppContext } from "../../../context/AppContext";

const STATUS_OPTIONS = [
  { value: "", label: "Tất cả trạng thái" },
  { value: "UNPAID", label: "Chưa thanh toán" },
  { value: "PAID", label: "Đã thanh toán" },
  { value: "REFUNDED", label: "Đã hoàn tiền" },
  { value: "CANCELLED", label: "Đã hủy" },
];

const RANGE_OPTIONS = [
  { value: "TODAY", label: "Hôm nay" },
  { value: "7D", label: "7 ngày" },
  { value: "30D", label: "30 ngày" },
  { value: "", label: "Tất cả" },
];

const toUuid = (value) => {
  if (!value || typeof value !== "string") return null;
  const v = value.trim();
  const re =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return re.test(v) ? v : null;
};

const formatMoney = (value) => `${Number(value || 0).toLocaleString("vi-VN")}₫`;

const formatDateTime = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const paymentLabel = (method) => {
  switch (method) {
    case "CASH":
      return "Tiền mặt";
    case "BANK_TRANSFER":
      return "Chuyển khoản";
    case "QR_COUNTER":
      return "QR";
    case "POS_CARD":
      return "Thẻ";
    default:
      return "-";
  }
};

const statusTagClass = (status) => {
  if (status === "PAID") {
    return "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/20";
  }
  if (status === "UNPAID") {
    return "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:border-amber-500/20";
  }
  if (status === "REFUNDED") {
    return "bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-500/10 dark:text-purple-300 dark:border-purple-500/20";
  }
  return "bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-300 dark:border-rose-500/20";
};

const statusLabel = (status) => {
  switch (status) {
    case "PAID":
      return "Đã thanh toán";
    case "UNPAID":
      return "Chưa thanh toán";
    case "REFUNDED":
      return "Đã hoàn tiền";
    case "CANCELLED":
      return "Đã hủy";
    default:
      return status || "-";
  }
};

const PosOrdersPage = () => {
  const { authUser, userId } = useAppContext();

  const pharmacistId = useMemo(
    () => toUuid(userId) || toUuid(authUser?.id),
    [userId, authUser],
  );

  const [range, setRange] = useState("TODAY");
  const [status, setStatus] = useState("");
  const [query, setQuery] = useState("");
  const [orders, setOrders] = useState([]);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(0);
  const [size] = useState(10);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [detailOrder, setDetailOrder] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const [refundTarget, setRefundTarget] = useState(null);
  const [refundReason, setRefundReason] = useState("");
  const [refundLoading, setRefundLoading] = useState(false);
  const [refundError, setRefundError] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const filteredOrders = useMemo(() => {
    const key = query.trim().toLowerCase();
    const sorted = [...orders].sort(
      (a, b) => new Date(b?.createdAt || 0) - new Date(a?.createdAt || 0),
    );
    if (!key) return sorted;
    return sorted.filter((order) => {
      const code = String(order?.orderCode || "").toLowerCase();
      const customer = String(order?.customerName || "").toLowerCase();
      const phone = String(order?.customerPhone || "").toLowerCase();
      return (
        code.includes(key) || customer.includes(key) || phone.includes(key)
      );
    });
  }, [orders, query]);

  const loadOrders = useCallback(async () => {
    if (!pharmacistId) {
      setError("Không xác định được tài khoản dược sĩ.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const res = await listOfflinePosOrders({
        range: range || undefined,
        status: status || undefined,
        pharmacistId,
        page,
        size,
      });
      setOrders(Array.isArray(res?.content) ? res.content : []);
      setTotalElements(Number(res?.totalElements || 0));
      setTotalPages(Number(res?.totalPages || 0));
    } catch (err) {
      setOrders([]);
      setTotalElements(0);
      setTotalPages(0);
      setError(err.message || "Không thể tải danh sách đơn hàng.");
    } finally {
      setLoading(false);
    }
  }, [page, pharmacistId, range, size, status]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  useEffect(() => {
    setPage(0);
  }, [range, status]);

  const openDetail = async (orderId) => {
    setDetailLoading(true);
    setError("");
    try {
      const data = await getOfflinePosOrder(orderId);
      setDetailOrder(data || null);
    } catch (err) {
      setError(err.message || "Không thể tải chi tiết đơn hàng.");
    } finally {
      setDetailLoading(false);
    }
  };

  const openRefund = (order) => {
    setRefundTarget(order);
    setRefundReason("");
    setRefundError("");
  };

  const submitRefund = async () => {
    if (!refundTarget?.id || !pharmacistId) return;

    const reason = refundReason.trim();
    if (!reason) {
      setRefundError("Bắt buộc nhập lý do hoàn tiền.");
      return;
    }

    setRefundLoading(true);
    setRefundError("");
    try {
      await refundOfflinePosOrder(refundTarget.id, {
        pharmacistId,
        method: refundTarget.paymentMethod || "CASH",
        restock: true,
        note: reason,
      });

      setRefundTarget(null);
      setRefundReason("");
      await loadOrders();
      if (detailOrder?.id === refundTarget.id) {
        const refreshed = await getOfflinePosOrder(refundTarget.id);
        setDetailOrder(refreshed || null);
      }
    } catch (err) {
      setRefundError(err.message || "Hoàn tiền thất bại.");
    } finally {
      setRefundLoading(false);
    }
  };

  const start = totalElements === 0 ? 0 : page * size + 1;
  const end = Math.min((page + 1) * size, totalElements);

  return (
    <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 font-display min-h-screen">
      <PharmacistSidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <header className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 md:px-8 py-3 sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-700"
            aria-label="Mở điều hướng"
          >
            <span className="material-symbols-outlined">menu</span>
          </button>
          <div className="p-2 rounded-lg bg-primary/10 text-primary">
            <span className="material-symbols-outlined">receipt_long</span>
          </div>
          <div>
            <h1 className="text-lg md:text-xl font-bold">
              Quản lý đơn tại quầy
            </h1>
            <p className="text-xs text-slate-500">
              Theo dõi đơn hàng và hoàn tiền minh bạch
            </p>
          </div>
        </div>

        <span className="hidden md:inline text-xs text-slate-500">
          Xử lý hoàn tiền và theo dõi giao dịch tại quầy
        </span>
      </header>

      <main className="max-w-[1500px] mx-auto w-full p-4 md:p-8 space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-[260px_220px_1fr] gap-3">
          <select
            value={range}
            onChange={(e) => setRange(e.target.value)}
            className="h-10 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 text-sm"
          >
            {RANGE_OPTIONS.map((item) => (
              <option key={item.value || "ALL_RANGE"} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="h-10 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 text-sm"
          >
            {STATUS_OPTIONS.map((item) => (
              <option key={item.value || "ALL_STATUS"} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>

          <div className="h-10 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 flex items-center gap-2">
            <span className="material-symbols-outlined text-slate-400 text-[18px]">
              search
            </span>
            <input
              className="w-full bg-transparent border-none p-0 text-sm focus:ring-0"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Tìm theo mã đơn, khách hàng, SĐT"
            />
          </div>
        </div>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-600">
            {error}
          </div>
        )}

        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-700/40 border-b border-slate-200 dark:border-slate-700">
                  <th className="px-4 py-3 text-left">Mã đơn</th>
                  <th className="px-4 py-3 text-left">Thời gian</th>
                  <th className="px-4 py-3 text-left">Khách hàng</th>
                  <th className="px-4 py-3 text-right">Tổng tiền</th>
                  <th className="px-4 py-3 text-left">Thanh toán</th>
                  <th className="px-4 py-3 text-left">Trạng thái</th>
                  <th className="px-4 py-3 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-4 py-6 text-center text-slate-500"
                    >
                      Đang tải đơn hàng...
                    </td>
                  </tr>
                ) : filteredOrders.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-4 py-6 text-center text-slate-500"
                    >
                      Không có đơn hàng phù hợp.
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => (
                    <tr
                      key={order.id}
                      className="border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/20"
                    >
                      <td className="px-4 py-3 font-semibold">
                        {order.orderCode}
                      </td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                        {formatDateTime(order.createdAt)}
                      </td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                        {order.customerName || "Khách lẻ"}
                      </td>
                      <td className="px-4 py-3 text-right font-bold">
                        {formatMoney(order.totalAmount)}
                      </td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                        {paymentLabel(order.paymentMethod)}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${statusTagClass(order.status)}`}
                        >
                          {statusLabel(order.status)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => openDetail(order.id)}
                            className="h-8 w-8 rounded-lg border border-slate-200 dark:border-slate-600 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-700"
                            title="Xem chi tiết"
                          >
                            <span className="material-symbols-outlined text-[18px]">
                              visibility
                            </span>
                          </button>
                          {order.status === "PAID" && (
                            <button
                              type="button"
                              onClick={() => openRefund(order)}
                              className="h-8 px-3 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold"
                            >
                              Hoàn tiền
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="px-4 py-3 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between text-sm">
            <span className="text-slate-500">
              Hiển thị {start}-{end} / {totalElements} đơn
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="h-8 px-3 rounded border border-slate-300 dark:border-slate-600 disabled:opacity-50"
                disabled={page <= 0}
                onClick={() => setPage((prev) => Math.max(prev - 1, 0))}
              >
                Trước
              </button>
              <span className="min-w-[72px] text-center text-slate-500">
                {Math.min(page + 1, Math.max(totalPages, 1))}/
                {Math.max(totalPages, 1)}
              </span>
              <button
                type="button"
                className="h-8 px-3 rounded border border-slate-300 dark:border-slate-600 disabled:opacity-50"
                disabled={page + 1 >= totalPages}
                onClick={() => setPage((prev) => prev + 1)}
              >
                Sau
              </button>
            </div>
          </div>
        </div>
      </main>

      {detailOrder && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="w-full max-w-2xl rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <h3 className="text-lg font-bold">
                Chi tiết đơn {detailOrder.orderCode}
              </h3>
              <button
                type="button"
                className="text-slate-400 hover:text-slate-600"
                onClick={() => setDetailOrder(null)}
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="p-4 space-y-4 text-sm">
              {detailLoading ? (
                <p className="text-slate-500">Đang tải chi tiết...</p>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-slate-500">Khách hàng</p>
                      <p className="font-medium">
                        {detailOrder.customerName || "Khách lẻ"}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-500">SĐT</p>
                      <p className="font-medium">
                        {detailOrder.customerPhone || "-"}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-500">Thời gian tạo</p>
                      <p className="font-medium">
                        {formatDateTime(detailOrder.createdAt)}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-500">Trạng thái</p>
                      <p className="font-medium">
                        {statusLabel(detailOrder.status)}
                      </p>
                    </div>
                  </div>

                  <div className="rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-slate-50 dark:bg-slate-700/30">
                        <tr>
                          <th className="px-3 py-2 text-left">Sản phẩm</th>
                          <th className="px-3 py-2 text-right">SL</th>
                          <th className="px-3 py-2 text-right">Đơn giá</th>
                          <th className="px-3 py-2 text-right">Thành tiền</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(detailOrder.items || []).map((item) => (
                          <tr
                            key={item.id}
                            className="border-t border-slate-100 dark:border-slate-700"
                          >
                            <td className="px-3 py-2">
                              {item.productName || item.sku || item.productId}
                            </td>
                            <td className="px-3 py-2 text-right">{item.qty}</td>
                            <td className="px-3 py-2 text-right">
                              {formatMoney(item.unitPrice)}
                            </td>
                            <td className="px-3 py-2 text-right font-semibold">
                              {formatMoney(item.lineTotal)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {refundTarget && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <h3 className="text-lg font-bold">
                Hoàn tiền đơn {refundTarget.orderCode}
              </h3>
              <button
                type="button"
                className="text-slate-400 hover:text-slate-600"
                onClick={() => setRefundTarget(null)}
                disabled={refundLoading}
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="p-4 space-y-3">
              <div className="rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-sm px-3 py-2">
                Vui lòng nhập lý do hoàn tiền. Trường này bắt buộc để đảm bảo
                minh bạch giao dịch.
              </div>

              <label className="block text-sm font-medium">
                Lý do hoàn tiền <span className="text-rose-600">*</span>
              </label>
              <textarea
                rows={4}
                className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:border-primary resize-none"
                placeholder="Ví dụ: Khách mua nhầm sản phẩm..."
                value={refundReason}
                onChange={(e) => setRefundReason(e.target.value)}
                disabled={refundLoading}
              />

              {refundError && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
                  {refundError}
                </div>
              )}
            </div>

            <div className="p-4 border-t border-slate-200 dark:border-slate-700 flex justify-end gap-3">
              <button
                type="button"
                className="h-10 px-4 rounded-lg border border-slate-300 dark:border-slate-600"
                onClick={() => setRefundTarget(null)}
                disabled={refundLoading}
              >
                Hủy
              </button>
              <button
                type="button"
                className="h-10 px-4 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-semibold disabled:opacity-60"
                onClick={submitRefund}
                disabled={refundLoading}
              >
                {refundLoading ? "Đang hoàn tiền..." : "Xác nhận hoàn tiền"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PosOrdersPage;
