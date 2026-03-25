import React from "react";

const statusClasses = {
  completed:
    "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  processing:
    "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
  shipping: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
};

const RecentOrdersTable = ({ orders = [], loading = false }) => (
  <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
    <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
      <h3 className="text-lg font-bold text-slate-900 dark:text-white">
        Đơn hàng gần đây
      </h3>
      <a
        href="/admin/orders"
        className="text-primary text-sm font-medium hover:bg-primary/5 px-3 py-1.5 rounded transition-colors"
      >
        Xem tất cả
      </a>
    </div>
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left min-w-[640px]">
        <thead className="text-xs text-slate-500 uppercase bg-slate-50 dark:bg-slate-700/50 dark:text-slate-400">
          <tr>
            <th className="px-6 py-3 font-medium">Mã đơn</th>
            <th className="px-6 py-3 font-medium">Khách hàng</th>
            <th className="px-6 py-3 font-medium">Tổng tiền</th>
            <th className="px-6 py-3 font-medium">Trạng thái</th>
            <th className="px-6 py-3 font-medium text-right">Hành động</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
          {loading ? (
            Array.from({ length: 5 }).map((_, idx) => (
              <tr key={idx} className="bg-white dark:bg-slate-800">
                {Array.from({ length: 5 }).map((__, i) => (
                  <td key={i} className="px-6 py-4">
                    <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
                  </td>
                ))}
              </tr>
            ))
          ) : !orders?.length ? (
            <tr className="bg-white dark:bg-slate-800">
              <td className="px-6 py-8 text-sm text-slate-500" colSpan={5}>
                Chưa có đơn hàng trong khoảng thời gian này
              </td>
            </tr>
          ) : (
            orders.map((order) => (
              <tr
                key={order.code}
                className="bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
              >
                <td className="px-6 py-4 font-medium text-primary">
                  {order.code}
                </td>
                <td className="px-6 py-4 text-slate-700 dark:text-slate-300">
                  {order.customer}
                </td>
                <td className="px-6 py-4 text-slate-700 dark:text-slate-300">
                  {order.total}
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      statusClasses[order.status] || statusClasses.processing
                    }`}
                  >
                    {order.statusLabel}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <a
                    href="/admin/orders"
                    className="text-slate-400 hover:text-primary transition-colors"
                    aria-label="Xem đơn hàng"
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      visibility
                    </span>
                  </a>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  </div>
);

export default RecentOrdersTable;
