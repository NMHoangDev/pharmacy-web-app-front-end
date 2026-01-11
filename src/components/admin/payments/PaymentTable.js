import React from "react";

const statusStyles = {
  success:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400",
  failed: "bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400",
  pending:
    "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",
  refunded: "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300",
};

const PaymentTable = ({ transactions }) => (
  <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-xs uppercase tracking-wider text-slate-500 font-semibold">
            <th className="px-6 py-4">Mã Giao Dịch</th>
            <th className="px-6 py-4">Đơn Hàng</th>
            <th className="px-6 py-4">Thời Gian</th>
            <th className="px-6 py-4">Phương Thức</th>
            <th className="px-6 py-4">Số Tiền</th>
            <th className="px-6 py-4">Trạng Thái</th>
            <th className="px-6 py-4 text-right">Hành Động</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
          {transactions.map((trx) => (
            <tr
              key={trx.id}
              className={`group hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer ${
                trx.status === "failed" ? "bg-red-50/40 dark:bg-red-500/5" : ""
              }`}
            >
              <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">
                <div className="flex items-center gap-2">
                  {trx.status === "failed" && (
                    <span className="material-symbols-outlined text-red-500 text-[18px]">
                      warning
                    </span>
                  )}
                  <span>{trx.id}</span>
                </div>
              </td>
              <td className="px-6 py-4 text-primary font-medium hover:underline">
                {trx.orderId}
              </td>
              <td className="px-6 py-4 text-slate-500">{trx.time}</td>
              <td className="px-6 py-4">
                <div className="flex items-center gap-2">
                  <div className="size-6 bg-white border border-slate-200 rounded flex items-center justify-center text-[10px] font-bold text-blue-600">
                    {trx.methodLabel}
                  </div>
                  <span>{trx.method}</span>
                </div>
              </td>
              <td
                className={`px-6 py-4 font-medium tabular-nums ${
                  trx.status === "refunded" ? "text-slate-500 line-through" : ""
                }`}
              >
                {trx.amount}
              </td>
              <td className="px-6 py-4">
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                    statusStyles[trx.status]
                  }`}
                >
                  {trx.label}
                </span>
              </td>
              <td className="px-6 py-4 text-right">
                <button
                  className="text-slate-400 hover:text-primary transition-colors p-1"
                  type="button"
                >
                  <span className="material-symbols-outlined">
                    navigate_next
                  </span>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
      <div className="text-sm text-slate-500">
        Hiển thị{" "}
        <span className="font-medium text-slate-900 dark:text-white">
          1-{transactions.length}
        </span>{" "}
        trong
        <span className="font-medium text-slate-900 dark:text-white">
          {" "}
          128
        </span>{" "}
        giao dịch
      </div>
      <div className="flex gap-1">
        <button
          className="px-3 py-1 rounded border border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 text-sm"
          type="button"
        >
          Trước
        </button>
        <button
          className="px-3 py-1 rounded bg-primary text-white text-sm font-medium"
          type="button"
        >
          1
        </button>
        <button
          className="px-3 py-1 rounded border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 text-sm"
          type="button"
        >
          2
        </button>
        <button
          className="px-3 py-1 rounded border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 text-sm"
          type="button"
        >
          3
        </button>
        <span className="px-2 py-1 text-slate-400">...</span>
        <button
          className="px-3 py-1 rounded border border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 text-sm"
          type="button"
        >
          Sau
        </button>
      </div>
    </div>
  </div>
);

export default PaymentTable;
