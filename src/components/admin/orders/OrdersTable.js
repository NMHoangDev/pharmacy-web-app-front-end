import React from "react";
import AdminTableWrapper from "../../common/AdminTableWrapper";

const statusBadge = (status) => {
  const map = {
    pending: { bg: "bg-yellow-100", text: "text-yellow-800", label: "Pending" },
    processing: {
      bg: "bg-blue-100",
      text: "text-blue-800",
      label: "Đang xử lý",
    },
    shipped: { bg: "bg-blue-100", text: "text-blue-800", label: "Processing" },
    completed: {
      bg: "bg-green-100",
      text: "text-green-800",
      label: "Hoàn thành",
    },
    cancelled: { bg: "bg-red-100", text: "text-red-800", label: "Cancelled" },
  };
  const cfg = map[status] || map.pending;
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${cfg.bg} ${cfg.text}`}
    >
      {cfg.label}
    </span>
  );
};

const paymentBadge = (payment) => {
  const map = {
    paid: {
      bg: "bg-green-100",
      text: "text-green-800",
      label: "Đã thanh toán",
    },
    unpaid: {
      bg: "bg-yellow-100",
      text: "text-yellow-800",
      label: "Chưa thanh toán",
    },
    refunded: {
      bg: "bg-slate-100",
      text: "text-slate-800",
      label: "Đã hoàn tiền",
    },
  };
  const cfg = map[payment] || map.unpaid;
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${cfg.bg} ${cfg.text}`}
    >
      {cfg.label}
    </span>
  );
};

const clampStyle = (lines) => ({
  display: "-webkit-box",
  WebkitLineClamp: lines,
  WebkitBoxOrient: "vertical",
  overflow: "hidden",
  wordBreak: "break-word",
  overflowWrap: "anywhere",
});

const OrdersTable = ({ orders, onView, onComplete, onCancel }) => {
  return (
    <AdminTableWrapper className="overflow-hidden" padded={false}>
      <div className="overflow-hidden">
        <table className="w-full text-left border-collapse table-fixed">
          <colgroup>
            <col style={{ width: "160px" }} />
            <col style={{ width: "200px" }} />
            <col style={{ width: "140px" }} />
            <col style={{ width: "120px" }} />
            <col style={{ width: "120px" }} />
            <col style={{ width: "120px" }} />
            <col style={{ width: "100px" }} />
          </colgroup>
          <thead className="bg-slate-50 text-[11px] uppercase text-slate-500 sm:text-xs">
            <tr>
              <th className="px-2 py-2.5 font-semibold sm:px-3 sm:py-3">
                Mã đơn
              </th>
              <th className="px-2 py-2.5 font-semibold sm:px-3 sm:py-3">
                Khách hàng
              </th>
              <th className="px-2 py-2.5 font-semibold sm:px-3 sm:py-3">
                Ngày đặt
              </th>
              <th className="px-2 py-2.5 text-right font-semibold sm:px-3 sm:py-3">
                Tổng tiền
              </th>
              <th className="px-2 py-2.5 text-center font-semibold sm:px-3 sm:py-3">
                Thanh toán
              </th>
              <th className="px-2 py-2.5 text-center font-semibold sm:px-3 sm:py-3">
                Trạng thái
              </th>
              <th className="px-2 py-2.5 text-center font-semibold sm:px-3 sm:py-3">
                Hành động
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {orders.map((order) => {
              const dateObj =
                order.dateObj || new Date(order.createdAt || Date.now());
              const datePart = dateObj.toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              });
              const timePart = dateObj.toLocaleTimeString("en-GB", {
                hour: "2-digit",
                minute: "2-digit",
              });
              return (
                <tr
                  key={order.id}
                  className="group transition-colors hover:bg-[#fafafa]"
                >
                  <td className="px-2 py-2.5 align-middle sm:px-3 sm:py-3">
                    <div className="flex min-w-0 flex-col justify-center">
                      <span
                        className="text-[12px] font-semibold leading-5 text-slate-900 sm:text-sm"
                        style={clampStyle(2)}
                        title={String(order.id || "")}
                      >
                        {String(order.id || "")}
                      </span>
                    </div>
                  </td>

                  <td className="px-2 py-2.5 align-middle sm:px-3 sm:py-3">
                    <div className="flex min-w-0 flex-col justify-center gap-0.5">
                      <span
                        className="text-[12px] font-semibold leading-5 text-slate-900 sm:text-sm"
                        style={clampStyle(2)}
                        title={order.customer || "-"}
                      >
                        {order.customer || "-"}
                      </span>
                      <span
                        className="text-[11px] leading-4 text-slate-500 sm:text-xs"
                        style={clampStyle(2)}
                        title={order.userId || order.phone || "-"}
                      >
                        {order.userId || order.phone || "-"}
                      </span>
                    </div>
                  </td>

                  <td className="px-2 py-2.5 align-middle sm:px-3 sm:py-3">
                    <div className="flex min-w-0 flex-col justify-center gap-0.5">
                      <span
                        className="text-[12px] leading-5 text-slate-700 sm:text-sm"
                        style={clampStyle(1)}
                        title={datePart}
                      >
                        {datePart}
                      </span>
                      <span
                        className="text-[11px] leading-4 text-slate-500 sm:text-xs"
                        style={clampStyle(1)}
                        title={timePart}
                      >
                        {timePart}
                      </span>
                    </div>
                  </td>

                  <td className="px-2 py-2.5 text-right align-middle sm:px-3 sm:py-3">
                    <div className="flex min-w-0 flex-col justify-center">
                      <span
                        className="text-[12px] font-semibold leading-5 text-slate-900 sm:text-sm"
                        style={clampStyle(1)}
                        title={order.totalLabel}
                      >
                        {order.totalLabel}
                      </span>
                    </div>
                  </td>

                  <td className="px-2 py-2.5 text-center align-middle sm:px-3 sm:py-3">
                    {paymentBadge(order.payment)}
                  </td>

                  <td className="px-2 py-2.5 text-center align-middle sm:px-3 sm:py-3">
                    {statusBadge(order.status)}
                  </td>

                  <td className="px-2 py-2.5 text-center align-middle sm:px-3 sm:py-3">
                    <div className="flex items-center justify-center gap-1.5 whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => onView?.(order.id)}
                        className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700 sm:h-8 sm:w-8"
                        title="Xem chi tiết"
                        aria-label="Xem chi tiết"
                      >
                        <span className="material-symbols-outlined text-[17px] sm:text-[18px]">
                          visibility
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={() => onComplete?.(order.id)}
                        className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-emerald-50 hover:text-emerald-600 sm:h-8 sm:w-8"
                        title="Hoàn tất"
                        aria-label="Hoàn tất"
                      >
                        <span className="material-symbols-outlined text-[17px] sm:text-[18px]">
                          check_circle
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={() => onCancel?.(order.id)}
                        className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-rose-50 hover:text-rose-600 sm:h-8 sm:w-8"
                        title="Hủy đơn"
                        aria-label="Hủy đơn"
                      >
                        <span className="material-symbols-outlined text-[17px] sm:text-[18px]">
                          cancel
                        </span>
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {orders.length === 0 && (
          <div className="py-10 text-center text-sm text-slate-500 dark:text-slate-400">
            Chưa có đơn hàng nào.
          </div>
        )}
      </div>
    </AdminTableWrapper>
  );
};

export default OrdersTable;
