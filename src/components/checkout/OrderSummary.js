import React from "react";

const OrderSummary = ({
  items,
  shippingFee,
  discount,
  subtotal,
  total,
  onApplyCoupon,
  onSubmit,
}) => {
  const formatCurrency = (value) =>
    value.toLocaleString("vi-VN", { style: "currency", currency: "VND" });

  return (
    <div className="sticky top-24 bg-white dark:bg-[#1A2633] rounded-xl shadow-sm border border-[#e7edf3] dark:border-gray-700 p-6">
      <h2 className="text-xl font-bold text-[#0d141b] dark:text-white mb-6">
        Đơn hàng của bạn
      </h2>

      <div className="space-y-4 mb-6 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
        {items.map((item) => (
          <div key={item.id} className="flex gap-4">
            <div className="w-16 h-16 shrink-0 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center overflow-hidden border border-[#e7edf3] dark:border-gray-700">
              <img
                src={item.image}
                alt={item.alt}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-[#0d141b] dark:text-white truncate">
                {item.name}
              </p>
              <p className="text-xs text-[#4c739a] dark:text-gray-400 mb-1">
                {item.subtitle}
              </p>
              <div className="flex justify-between items-center">
                <p className="text-sm font-medium text-[#0d141b] dark:text-white">
                  x{item.quantity}
                </p>
                <p className="text-sm font-bold text-primary">
                  {formatCurrency(item.price * item.quantity)}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-2 mb-6">
        <input
          type="text"
          className="form-input flex-1 rounded-lg border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-sm focus:border-primary focus:ring-primary"
          placeholder="Mã giảm giá"
        />
        <button
          type="button"
          className="bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-[#0d141b] dark:text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          onClick={onApplyCoupon}
        >
          Áp dụng
        </button>
      </div>

      <div className="space-y-3 py-4 border-t border-b border-[#e7edf3] dark:border-gray-700 mb-6 text-sm">
        <div className="flex justify-between">
          <span className="text-[#4c739a] dark:text-gray-400">Tạm tính</span>
          <span className="font-medium text-[#0d141b] dark:text-white">
            {formatCurrency(subtotal)}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-[#4c739a] dark:text-gray-400">
            Phí vận chuyển
          </span>
          <span className="font-medium text-[#0d141b] dark:text-white">
            {formatCurrency(shippingFee)}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-[#4c739a] dark:text-gray-400">Giảm giá</span>
          <span className="font-medium text-green-600">
            -{formatCurrency(discount)}
          </span>
        </div>
      </div>

      <div className="flex justify-between items-end mb-6">
        <span className="text-base font-bold text-[#0d141b] dark:text-white">
          Tổng cộng
        </span>
        <div className="text-right">
          <span className="block text-2xl font-black text-primary">
            {formatCurrency(total)}
          </span>
          <span className="text-xs text-[#4c739a] dark:text-gray-400">
            (Đã bao gồm VAT)
          </span>
        </div>
      </div>

      <button
        type="button"
        onClick={onSubmit}
        className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3.5 px-4 rounded-lg shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-2"
      >
        Xác nhận đặt hàng
        <span className="material-symbols-outlined text-sm">arrow_forward</span>
      </button>
      <p className="text-xs text-center text-[#4c739a] dark:text-gray-500 mt-4">
        Bằng việc tiến hành đặt hàng, bạn đồng ý với
        <span className="underline hover:text-primary">
          {" "}
          Điều khoản dịch vụ
        </span>
        .
      </p>
    </div>
  );
};

export default OrderSummary;
