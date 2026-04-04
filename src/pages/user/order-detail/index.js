import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Header from "../../../components/Header";
import Footer from "../../../components/Footer";
import PageTransition from "../../../components/ui/PageTransition";
import { getOrderDetail } from "../../../api/orderApi";
import {
  getOrderStatusBadgeClasses,
  getPaymentStatusBadgeClasses,
  toOrderStatusLabel,
  toPaymentStatusLabel,
} from "../../../utils/orderStatus";

const FALLBACK_IMAGE = "https://placehold.co/120x120/e2e8f0/64748b?text=Thuoc";

const formatCurrency = (value) => {
  const amount = Number(value || 0);
  return `${amount.toLocaleString("vi-VN")} đ`;
};

const formatDateTime = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString("vi-VN");
};

const OrderDetailPage = () => {
  const navigate = useNavigate();
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!orderId) {
      setError("Không tìm thấy mã đơn hàng.");
      setLoading(false);
      return;
    }

    const loadOrder = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await getOrderDetail(orderId);
        setOrder(data && Object.keys(data).length ? data : null);
      } catch (err) {
        setError(err.message || "Không thể tải chi tiết đơn hàng.");
        setOrder(null);
      } finally {
        setLoading(false);
      }
    };

    loadOrder();
  }, [orderId]);

  const items = useMemo(
    () => (Array.isArray(order?.items) ? order.items : []),
    [order?.items],
  );

  const statusHistory = useMemo(
    () =>
      Array.isArray(order?.tracking?.statusHistory)
        ? order.tracking.statusHistory
        : [],
    [order?.tracking?.statusHistory],
  );

  return (
    <PageTransition className="flex min-h-screen flex-col bg-background-light font-display text-slate-900 dark:bg-background-dark dark:text-slate-100">
      <Header />

      <main className="mx-auto w-full max-w-[1200px] flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <nav className="mb-6 flex items-center gap-2 text-sm text-slate-500">
          <Link to="/" className="transition-colors hover:text-primary">
            Trang chủ
          </Link>
          <span className="material-symbols-outlined text-xs">
            chevron_right
          </span>
          <Link
            to="/account?tab=orders"
            className="transition-colors hover:text-primary"
          >
            Đơn hàng của tôi
          </Link>
          <span className="material-symbols-outlined text-xs">
            chevron_right
          </span>
          <span className="font-medium text-slate-900 dark:text-slate-100">
            Chi tiết đơn hàng {order?.orderCode || order?.id || ""}
          </span>
        </nav>

        {loading ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-500 dark:border-slate-800 dark:bg-slate-900">
            Đang tải chi tiết đơn hàng...
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-rose-200 bg-white p-8 text-center dark:bg-slate-900">
            <p className="text-rose-600 dark:text-rose-300">{error}</p>
            <button
              type="button"
              onClick={() =>
                navigate("/account", { state: { activeTab: "orders" } })
              }
              className="mt-4 rounded-xl border border-slate-300 px-4 py-2 transition hover:bg-slate-100 dark:border-slate-600 dark:hover:bg-slate-800"
            >
              Quay lại lịch sử đơn hàng
            </button>
          </div>
        ) : !order ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-500 dark:border-slate-800 dark:bg-slate-900">
            Không có dữ liệu đơn hàng.
          </div>
        ) : (
          <>
            <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
              <div>
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <h2 className="text-3xl font-extrabold tracking-tight">
                    Đơn hàng {order.orderCode || order.id}
                  </h2>
                  <span
                    className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${getOrderStatusBadgeClasses(
                      order.status,
                    )}`}
                  >
                    {toOrderStatusLabel(order.status)}
                  </span>
                  <span
                    className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${getPaymentStatusBadgeClasses(
                      order.paymentStatus,
                    )}`}
                  >
                    {toPaymentStatusLabel(order.paymentStatus)}
                  </span>
                </div>
                <p className="text-slate-500">
                  Ngày đặt: {formatDateTime(order.createdAt)} • {items.length}{" "}
                  sản phẩm
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  navigate("/account", { state: { activeTab: "orders" } })
                }
                className="flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold transition-colors hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
              >
                <span className="material-symbols-outlined text-sm">
                  arrow_back
                </span>
                Quay lại
              </button>
            </div>

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
              <div className="space-y-8 lg:col-span-2">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                    <h3 className="mb-4 flex items-center gap-2 text-lg font-bold">
                      <span className="material-symbols-outlined text-primary">
                        info
                      </span>
                      Thông tin chung
                    </h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between gap-3">
                        <span className="text-slate-500">Mã đơn hàng:</span>
                        <span className="font-semibold">
                          {order.orderCode || order.id}
                        </span>
                      </div>
                      <div className="flex justify-between gap-3">
                        <span className="text-slate-500">Trạng thái:</span>
                        <span className="font-semibold text-primary">
                          {toOrderStatusLabel(order.status)}
                        </span>
                      </div>
                      <div className="flex justify-between gap-3">
                        <span className="text-slate-500">Thanh toán:</span>
                        <span className="font-semibold text-emerald-600">
                          {order.paymentMethod || "-"} (
                          {toPaymentStatusLabel(order.paymentStatus)})
                        </span>
                      </div>
                      <div className="flex justify-between gap-4">
                        <span className="text-slate-500">Ghi chú:</span>
                        <span className="text-right font-semibold">
                          {order.note || "-"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                    <h3 className="mb-4 flex items-center gap-2 text-lg font-bold">
                      <span className="material-symbols-outlined text-primary">
                        location_on
                      </span>
                      Địa chỉ giao hàng
                    </h3>
                    <div className="space-y-2 text-sm">
                      <p className="font-bold">
                        {order.shippingAddress?.recipientName || "-"}
                      </p>
                      <p className="text-slate-600">
                        {order.shippingAddress?.phoneNumber || "-"}
                      </p>
                      <p className="text-slate-500">
                        {order.shippingAddress?.fullAddress || "-"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
                  <div className="border-b border-slate-100 p-6 dark:border-slate-800">
                    <h3 className="text-lg font-bold">Danh sách sản phẩm</h3>
                  </div>

                  <div className="divide-y divide-slate-100 dark:divide-slate-800">
                    {items.length === 0 ? (
                      <div className="px-6 py-6 text-center text-sm text-slate-500">
                        Đơn hàng chưa có sản phẩm.
                      </div>
                    ) : (
                      items.map((item) => (
                        <div
                          key={item.productId || item.id}
                          className="flex flex-col gap-4 px-6 py-5 sm:flex-row sm:items-center"
                        >
                          <img
                            src={item.imageUrl || FALLBACK_IMAGE}
                            alt={item.productName || "Thuốc"}
                            className="h-20 w-20 rounded-2xl border border-slate-200 object-cover"
                          />
                          <div className="min-w-0 flex-1">
                            <p className="text-base font-bold text-slate-900 dark:text-white">
                              {item.productName || "Sản phẩm"}
                            </p>
                            <p className="mt-1 text-sm text-slate-500">
                              {item.shortDescription ||
                                item.category ||
                                item.type ||
                                item.sku ||
                                ""}
                            </p>
                            <div className="mt-2 flex flex-wrap gap-3 text-xs text-slate-500">
                              {item.unit ? <span>Đơn vị: {item.unit}</span> : null}
                              <span>Số lượng: x{item.quantity}</span>
                              <span>Đơn giá: {formatCurrency(item.price)}</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-slate-500">Thành tiền</p>
                            <p className="text-lg font-bold text-primary">
                              {formatCurrency(item.lineTotal)}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-8">
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                  <h3 className="mb-6 text-lg font-bold">Tóm tắt thanh toán</h3>
                  <div className="space-y-4 text-sm">
                    <div className="flex justify-between text-slate-500">
                      <span>Tạm tính ({items.length} sản phẩm)</span>
                      <span>{formatCurrency(order.subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-slate-500">
                      <span>Phí vận chuyển</span>
                      <span>{formatCurrency(order.shippingFee)}</span>
                    </div>
                    <div className="flex justify-between text-green-600">
                      <span>Khuyến mãi</span>
                      <span>-{formatCurrency(order.discountAmount)}</span>
                    </div>
                    <div className="flex items-end justify-between border-t border-slate-100 pt-4 dark:border-slate-800">
                      <span className="text-base font-bold">Tổng cộng</span>
                      <span className="text-2xl font-black tracking-tight text-primary">
                        {formatCurrency(order.totalAmount)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                  <h3 className="mb-6 text-lg font-bold">Lịch sử đơn hàng</h3>
                  {statusHistory.length === 0 ? (
                    <p className="text-sm text-slate-500">
                      Trạng thái hiện tại:{" "}
                      {toOrderStatusLabel(
                        order.tracking?.currentStatus || order.status || "-",
                      )}
                    </p>
                  ) : (
                    <div className="space-y-6">
                      {statusHistory.map((history, index) => (
                        <div
                          key={`${history.status || "status"}-${history.changedAt || index}`}
                          className="relative pl-8"
                        >
                          {index < statusHistory.length - 1 ? (
                            <div className="absolute bottom-[-24px] left-[11px] top-2 w-0.5 bg-slate-100 dark:bg-slate-800" />
                          ) : null}
                          <div
                            className={[
                              "absolute left-0 top-1.5 flex h-6 w-6 items-center justify-center rounded-full border-2",
                              index === 0
                                ? "border-primary bg-primary/20"
                                : "border-slate-200 bg-slate-100 dark:border-slate-700 dark:bg-slate-800",
                            ].join(" ")}
                          >
                            <div
                              className={[
                                "h-2 w-2 rounded-full",
                                index === 0 ? "bg-primary animate-pulse" : "bg-slate-400",
                              ].join(" ")}
                            />
                          </div>
                          <div>
                            <p
                              className={
                                index === 0
                                  ? "text-sm font-bold"
                                  : "text-sm font-semibold"
                              }
                            >
                              {toOrderStatusLabel(history.status)}
                            </p>
                            <p className="mb-1 text-xs text-slate-500">
                              {formatDateTime(history.changedAt)}
                            </p>
                            {history.note ? (
                              <p className="text-xs text-slate-400">
                                {history.note}
                              </p>
                            ) : null}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </main>

      <Footer />
    </PageTransition>
  );
};

export default OrderDetailPage;
