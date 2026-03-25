import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Header from "../../../components/Header";
import Footer from "../../../components/Footer";
import PageTransition from "../../../components/ui/PageTransition";
import { getOrderDetail } from "../../../api/orderApi";

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

const buildAddressText = (address) => {
  if (!address) return "Chưa có thông tin địa chỉ giao hàng.";
  const parts = [
    address.addressLine,
    address.wardName,
    address.districtName,
    address.provinceName,
  ].filter(Boolean);
  return parts.length
    ? parts.join(", ")
    : "Chưa có thông tin địa chỉ giao hàng.";
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
        console.log("Order detail data:", data);
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

  const addressText = useMemo(
    () => buildAddressText(order?.shippingAddress),
    [order?.shippingAddress],
  );

  return (
    <PageTransition className="bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100 min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <nav className="flex items-center gap-2 text-sm text-slate-500 mb-6">
          <Link to="/" className="hover:text-primary transition-colors">
            Trang chủ
          </Link>
          <span className="material-symbols-outlined text-xs">
            chevron_right
          </span>
          <Link
            to="/account?tab=orders"
            className="hover:text-primary transition-colors"
          >
            Đơn hàng của tôi
          </Link>
          <span className="material-symbols-outlined text-xs">
            chevron_right
          </span>
          <span className="text-slate-900 dark:text-slate-100 font-medium">
            Chi tiết đơn hàng {order?.orderCode || order?.id || ""}
          </span>
        </nav>

        {loading ? (
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-8 text-center text-slate-500">
            Đang tải chi tiết đơn hàng...
          </div>
        ) : error ? (
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-rose-200 dark:border-rose-800 p-8 text-center">
            <p className="text-rose-600 dark:text-rose-300">{error}</p>
            <button
              type="button"
              onClick={() =>
                navigate("/account", { state: { activeTab: "orders" } })
              }
              className="mt-4 px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              Quay lại lịch sử đơn hàng
            </button>
          </div>
        ) : !order ? (
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-8 text-center text-slate-500">
            Không có dữ liệu đơn hàng.
          </div>
        ) : (
          <>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-3xl font-extrabold tracking-tight">
                    Đơn hàng {order.orderCode || order.id}
                  </h2>
                  <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider rounded-full">
                    {order.status || "-"}
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
                className="flex items-center gap-2 px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg font-semibold text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                <span className="material-symbols-outlined text-sm">
                  arrow_back
                </span>
                Quay lại
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary">
                        info
                      </span>
                      Thông tin chung
                    </h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Mã đơn hàng:</span>
                        <span className="font-semibold">
                          {order.orderCode || order.id}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Trạng thái:</span>
                        <span className="font-semibold text-primary">
                          {order.status || "-"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Thanh toán:</span>
                        <span className="font-semibold text-emerald-600">
                          {order.paymentMethod || "-"} (
                          {order.paymentStatus || "-"})
                        </span>
                      </div>
                      <div className="flex justify-between gap-4">
                        <span className="text-slate-500">Ghi chú:</span>
                        <span className="font-semibold text-right">
                          {order.note || "-"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary">
                        location_on
                      </span>
                      Địa chỉ giao hàng
                    </h3>
                    <div className="space-y-1 text-sm">
                      <p className="font-bold">
                        {order.shippingAddress?.fullAddress || "-"}
                      </p>
                      <p className="text-slate-500">
                        {order.shippingAddress?.phoneNumber || "-"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                  <div className="p-6 border-b border-slate-100 dark:border-slate-800">
                    <h3 className="font-bold text-lg">Danh sách sản phẩm</h3>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 text-xs font-bold uppercase tracking-wider">
                          <th className="px-6 py-4">Sản phẩm</th>
                          <th className="px-6 py-4 text-center">Đơn vị</th>
                          <th className="px-6 py-4 text-center">Số lượng</th>
                          <th className="px-6 py-4 text-right">Đơn giá</th>
                          <th className="px-6 py-4 text-right">Thành tiền</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {items.length === 0 ? (
                          <tr>
                            <td
                              colSpan={5}
                              className="px-6 py-6 text-center text-sm text-slate-500"
                            >
                              Đơn hàng chưa có sản phẩm.
                            </td>
                          </tr>
                        ) : (
                          items.map((item) => (
                            <tr key={item.productId || item.id}>
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-4">
                                  <div
                                    className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-lg flex-shrink-0 bg-center bg-cover border border-slate-200 dark:border-slate-700"
                                    style={{
                                      backgroundImage: `url('${item.imageUrl || FALLBACK_IMAGE}')`,
                                    }}
                                  />
                                  <div>
                                    <div className="flex items-center gap-2 mb-1">
                                      <p className="font-bold text-sm">
                                        {item.productName || "Sản phẩm"}
                                      </p>
                                    </div>
                                    <p className="text-xs text-slate-500">
                                      {item.shortDescription ||
                                        item.category ||
                                        item.type ||
                                        ""}
                                    </p>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 text-center text-slate-500">
                                {item.unit || "-"}
                              </td>
                              <td className="px-6 py-4 text-center font-medium">
                                x{item.quantity}
                              </td>
                              <td className="px-6 py-4 text-right text-slate-500">
                                {formatCurrency(item.unitPrice)}
                              </td>
                              <td className="px-6 py-4 text-right font-bold text-primary">
                                {formatCurrency(item.lineTotal)}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              <div className="space-y-8">
                <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                  <h3 className="font-bold text-lg mb-6">Tóm tắt thanh toán</h3>
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
                    <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-end">
                      <span className="font-bold text-base">Tổng cộng</span>
                      <span className="text-2xl font-black text-primary tracking-tight">
                        {formatCurrency(order.totalAmount)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                  <h3 className="font-bold text-lg mb-6">Lịch sử đơn hàng</h3>
                  {statusHistory.length === 0 ? (
                    <p className="text-sm text-slate-500">
                      Trạng thái hiện tại:{" "}
                      {order.tracking?.currentStatus || order.status || "-"}
                    </p>
                  ) : (
                    <div className="space-y-6">
                      {statusHistory.map((history, index) => (
                        <div
                          key={`${history.status || "status"}-${history.changedAt || index}`}
                          className="relative pl-8"
                        >
                          {index < statusHistory.length - 1 ? (
                            <div className="absolute left-[11px] top-2 bottom-[-24px] w-0.5 bg-slate-100 dark:bg-slate-800" />
                          ) : null}
                          <div
                            className={[
                              "absolute left-0 top-1.5 w-6 h-6 rounded-full border-2 flex items-center justify-center",
                              index === 0
                                ? "bg-primary/20 border-primary"
                                : "bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700",
                            ].join(" ")}
                          >
                            <div
                              className={[
                                "w-2 h-2 rounded-full",
                                index === 0
                                  ? "bg-primary animate-pulse"
                                  : "bg-slate-400",
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
                              {history.status || "-"}
                            </p>
                            <p className="text-xs text-slate-500 mb-1">
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
