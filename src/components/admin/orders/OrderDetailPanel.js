import React from "react";

const statusStyles = {
  pending: { label: "Pending", color: "bg-yellow-500" },
  processing: { label: "Processing", color: "bg-blue-500" },
  shipped: { label: "Shipped", color: "bg-purple-500" },
  completed: { label: "Completed", color: "bg-slate-500" },
  cancelled: { label: "Cancelled", color: "bg-red-500" },
};

const OrderDetailPanel = ({ order, onUpdateStatus }) => {
  if (!order) {
    return (
      <div className="w-[380px] shrink-0 hidden lg:flex flex-col bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm h-full items-center justify-center text-sm text-slate-500 dark:text-slate-400">
        Chọn một đơn hàng để xem chi tiết
      </div>
    );
  }

  const badge = statusStyles[order.status] || statusStyles.pending;

  return (
    <div className="w-full lg:w-[380px] shrink-0 flex flex-col bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xl lg:shadow-sm h-full">
      <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Đơn {order.id}
            </h3>
            <span className={`flex size-2 rounded-full ${badge.color}`} />
          </div>
          <p className="text-xs text-slate-500 mt-1">{order.dateLabel}</p>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-6">
        <div className="bg-slate-50 dark:bg-slate-700/30 rounded-lg p-4 border border-slate-100 dark:border-slate-700">
          <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
            <span className="material-symbols-outlined text-slate-400 text-sm">
              person
            </span>
            Thông tin khách hàng
          </h4>
          <div className="space-y-2 text-sm text-slate-700 dark:text-slate-200">
            <div className="flex items-start gap-2">
              <span className="material-symbols-outlined text-[18px] text-slate-400">
                account_circle
              </span>
              <div>
                <p className="font-semibold">{order.customer}</p>
                <p className="text-xs text-slate-500">{order.customerNote}</p>
              </div>
            </div>
            <div className="flex items-start gap-2 text-slate-600 dark:text-slate-300">
              <span className="material-symbols-outlined text-[18px] text-slate-400">
                call
              </span>
              <span>{order.phone}</span>
            </div>
            <div className="flex items-start gap-2 text-slate-600 dark:text-slate-300">
              <span className="material-symbols-outlined text-[18px] text-slate-400">
                location_on
              </span>
              <span>{order.address}</span>
            </div>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">
            Sản phẩm ({order.items.length})
          </h4>
          <div className="space-y-3">
            {order.items.map((item) => (
              <div key={item.name} className="flex gap-3 items-center">
                <div
                  className="size-12 rounded bg-slate-100 dark:bg-slate-700 bg-center bg-cover shrink-0"
                  style={{ backgroundImage: `url(${item.image})` }}
                  aria-label={item.name}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                    {item.name}
                  </p>
                  <p className="text-xs text-slate-500">{item.meta}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">
                    {item.priceLabel}
                  </p>
                  <p className="text-xs text-slate-500">x{item.qty}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-top border-slate-100 dark:border-slate-700 space-y-2">
            <div className="flex justify-between text-sm text-slate-600 dark:text-slate-400">
              <span>Tạm tính</span>
              <span>{order.subtotalLabel}</span>
            </div>
            <div className="flex justify-between text-sm text-slate-600 dark:text-slate-400">
              <span>Phí vận chuyển</span>
              <span>{order.shippingLabel}</span>
            </div>
            <div className="flex justify-between text-base font-bold text-slate-900 dark:text-white pt-2">
              <span>Tổng</span>
              <span className="text-primary">{order.totalLabel}</span>
            </div>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">
            Trạng thái
          </h4>
          <div className="flex flex-wrap gap-2">
            {Object.keys(statusStyles).map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => onUpdateStatus(key)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                  order.status === key
                    ? "bg-primary text-white border-primary"
                    : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-primary"
                }`}
              >
                {statusStyles[key].label}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="p-5 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 flex flex-col gap-3">
        <button
          type="button"
          onClick={() => onUpdateStatus("shipped")}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-primary text-white text-sm font-bold shadow-md shadow-primary/20 hover:bg-primary/90 transition-colors"
        >
          <span className="material-symbols-outlined text-[20px]">
            local_shipping
          </span>
          Đánh dấu đã gửi hàng
        </button>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => onUpdateStatus("completed")}
            className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">check</span>
            Hoàn tất
          </button>
          <button
            type="button"
            onClick={() => onUpdateStatus("cancelled")}
            className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-red-200 dark:border-red-900/30 bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 text-sm font-medium hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">block</span>
            Hủy đơn
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailPanel;
