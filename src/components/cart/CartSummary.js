import React from "react";

const CartSummary = ({
  subtotal,
  discount,
  vatRate,
  vatAmount,
  total,
  itemCount,
  onCheckout,
}) => {
  const formatCurrency = (value) =>
    value.toLocaleString("vi-VN", { style: "currency", currency: "VND" });

  return (
    <div className="bg-white dark:bg-[#1a2634] rounded-lg border border-[#cfdbe7] dark:border-gray-700 p-6 sticky top-24 shadow-sm">
      <h3 className="text-[#0d141b] dark:text-white text-lg font-bold mb-4">
        Tổng tiền giỏ hàng
      </h3>

      <div className="flex gap-2 mb-6">
        <input
          type="text"
          className="flex-1 rounded-lg border-[#cfdbe7] dark:border-gray-600 bg-slate-50 dark:bg-gray-900 text-sm px-3 py-2 focus:ring-primary focus:border-primary placeholder:text-gray-400 dark:text-white"
          placeholder="Mã giảm giá"
        />
        <button className="px-4 py-2 bg-[#e7edf3] dark:bg-gray-700 text-[#0d141b] dark:text-white text-sm font-semibold rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
          Áp dụng
        </button>
      </div>

      <div className="flex flex-col gap-3 pb-4 border-b border-[#cfdbe7] dark:border-gray-700">
        <div className="flex justify-between">
          <span className="text-[#4c739a] text-sm">
            Tạm tính ({itemCount} sản phẩm)
          </span>
          <span className="text-[#0d141b] dark:text-white text-sm font-medium">
            {formatCurrency(subtotal)}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-[#4c739a] text-sm">Giảm giá</span>
          <span className="text-[#0d141b] dark:text-white text-sm font-medium">
            {formatCurrency(discount)}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-[#4c739a] text-sm">
            Thuế VAT ({vatRate * 100}%)
          </span>
          <span className="text-[#0d141b] dark:text-white text-sm font-medium">
            {formatCurrency(vatAmount)}
          </span>
        </div>
      </div>

      <div className="flex justify-between py-4">
        <span className="text-[#0d141b] dark:text-white text-base font-bold">
          Tổng cộng
        </span>
        <span className="text-primary text-xl font-bold">
          {formatCurrency(total)}
        </span>
      </div>

      <button
        type="button"
        onClick={onCheckout}
        className="w-full bg-primary hover:bg-blue-600 text-white font-bold py-3 px-4 rounded-lg shadow-md hover:shadow-lg transition-all flex justify-center items-center gap-2"
      >
        Tiến hành thanh toán
        <span className="material-symbols-outlined text-sm">arrow_forward</span>
      </button>
      <div className="mt-4 flex items-center justify-center gap-2 text-[#4c739a] text-xs">
        <span className="material-symbols-outlined text-base">
          verified_user
        </span>
        <span>Thanh toán bảo mật 100%</span>
      </div>
    </div>
  );
};

export default CartSummary;
