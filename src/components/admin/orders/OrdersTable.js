import React from "react";

const statusBadge = (status) => {
  const map = {
    pending: { bg: "bg-yellow-100", text: "text-yellow-800", label: "Pending" },
    processing: {
      bg: "bg-blue-100",
      text: "text-blue-800",
      label: "Processing",
    },
    shipped: { bg: "bg-purple-100", text: "text-purple-800", label: "Shipped" },
    completed: {
      bg: "bg-green-100",
      text: "text-green-800",
      label: "Completed",
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
    paid: { bg: "bg-green-100", text: "text-green-800", label: "Paid" },
    unpaid: { bg: "bg-yellow-100", text: "text-yellow-800", label: "Unpaid" },
    refunded: { bg: "bg-slate-100", text: "text-slate-800", label: "Refunded" },
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

const OrdersTable = ({ orders, selectedId, onSelect }) => {
  return (
    <div className="flex-1 flex flex-col bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden h-full">
      <div className="overflow-auto flex-1 custom-scrollbar">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50 dark:bg-slate-700/50 sticky top-0 z-10 backdrop-blur-sm">
            <tr>
              <th className="p-4 text-xs font-semibold uppercase text-slate-500 dark:text-slate-400 tracking-wider">
                Mã đơn
              </th>
              <th className="p-4 text-xs font-semibold uppercase text-slate-500 dark:text-slate-400 tracking-wider">
                Khách hàng
              </th>
              <th className="p-4 text-xs font-semibold uppercase text-slate-500 dark:text-slate-400 tracking-wider hidden md:table-cell">
                Ngày đặt
              </th>
              <th className="p-4 text-xs font-semibold uppercase text-slate-500 dark:text-slate-400 tracking-wider text-right">
                Tổng tiền
              </th>
              <th className="p-4 text-xs font-semibold uppercase text-slate-500 dark:text-slate-400 tracking-wider text-center">
                Thanh toán
              </th>
              <th className="p-4 text-xs font-semibold uppercase text-slate-500 dark:text-slate-400 tracking-wider text-center">
                Trạng thái
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
            {orders.map((order) => {
              const isActive = order.id === selectedId;
              return (
                <tr
                  key={order.id}
                  onClick={() => onSelect(order.id)}
                  className={`cursor-pointer transition-colors border-l-4 ${
                    isActive
                      ? "bg-primary/5 dark:bg-primary/10 border-l-primary"
                      : "border-l-transparent hover:bg-slate-50 dark:hover:bg-slate-700/30"
                  }`}
                >
                  <td
                    className={`p-4 text-sm font-medium ${
                      isActive
                        ? "text-primary"
                        : "text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    {order.id}
                  </td>
                  <td className="p-4 text-sm text-slate-900 dark:text-white font-medium">
                    <div className="flex flex-col">
                      <span>{order.customer}</span>
                      <span className="text-xs text-slate-500 font-normal md:hidden">
                        {order.dateLabel}
                      </span>
                    </div>
                  </td>
                  <td className="p-4 text-sm text-slate-500 dark:text-slate-400 hidden md:table-cell">
                    {order.dateLabel}
                  </td>
                  <td className="p-4 text-sm font-semibold text-slate-900 dark:text-white text-right">
                    {order.totalLabel}
                  </td>
                  <td className="p-4 text-center">
                    {paymentBadge(order.payment)}
                  </td>
                  <td className="p-4 text-center">
                    {statusBadge(order.status)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="border-t border-slate-200 dark:border-slate-700 p-4 flex items-center justify-between bg-white dark:bg-slate-800">
        <span className="text-sm text-slate-500 dark:text-slate-400">
          Đang hiển thị {orders.length} đơn hàng
        </span>
      </div>
    </div>
  );
};

export default OrdersTable;
