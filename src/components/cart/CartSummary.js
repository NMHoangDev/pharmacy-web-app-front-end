import React, { useState } from "react";
import { formatVnd } from "../../utils/currency";

const CartSummary = ({
  subtotal = 0,
  discount = 0,
  vatAmount = 0,
  total = 0,
  itemCount = 0,
  onCheckout,
}) => {
  const [code, setCode] = useState("");
  const [applying, setApplying] = useState(false);

  const applyCoupon = async () => {
    setApplying(true);
    try {
      // placeholder: in future call parent prop to validate coupon
      await new Promise((r) => setTimeout(r, 700));
      // No coupon logic implemented: show inline message (could be enhanced)
      // eslint-disable-next-line no-alert
      alert("Mã giảm giá chưa được hỗ trợ trong demo");
    } catch (e) {
      // ignore
    } finally {
      setApplying(false);
    }
  };

  return (
    <div className="bg-white dark:bg-[#0f1720] rounded-2xl border border-slate-200 dark:border-gray-800 p-6 shadow-md w-full lg:sticky lg:top-24">
      <h3 className="text-slate-900 dark:text-white text-xl lg:text-2xl font-extrabold mb-4">
        Tổng tiền giỏ hàng
      </h3>

      <div className="mb-4">
        <div className="flex gap-2">
          <input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Mã giảm giá"
            className="flex-1 min-w-0 h-12 px-3 rounded-lg border border-slate-200 dark:border-gray-700 bg-slate-50 dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
          <button
            onClick={applyCoupon}
            disabled={applying || !code.trim()}
            className={`shrink-0 h-12 px-4 rounded-lg bg-primary text-white text-sm font-medium whitespace-nowrap ${
              applying ? "opacity-60 cursor-wait" : "hover:bg-primary/90"
            }`}
          >
            {applying ? "Đang áp dụng..." : "Áp dụng"}
          </button>
        </div>
        <p className="mt-2 text-xs text-slate-500">
          Nhập mã để giảm giá (nếu có)
        </p>
      </div>

      <div className="flex flex-col gap-3 pb-4 border-b border-slate-100 dark:border-gray-800">
        <div className="flex justify-between items-center">
          <span className="text-sm text-slate-500">
            Tạm tính ({itemCount} sản phẩm)
          </span>
          <span className="text-sm font-medium text-slate-900 dark:text-white">
            {formatVnd(subtotal)}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-slate-500">Giảm giá</span>
          <span className="text-sm font-medium text-slate-900 dark:text-white">
            {formatVnd(discount)}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-slate-500">Thuế VAT (8%)</span>
          <span className="text-sm font-medium text-slate-900 dark:text-white">
            {formatVnd(vatAmount)}
          </span>
        </div>
      </div>

      <div className="flex justify-between items-end py-4">
        <div>
          <div className="text-base text-slate-500">Tổng cộng</div>
          <div className="text-sm text-slate-400">Đã bao gồm VAT 8%</div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-extrabold text-primary">
            {formatVnd(total)}
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={onCheckout}
        className="w-full mt-2 bg-primary text-white font-semibold py-3 px-4 rounded-xl shadow-lg hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-primary/30 transition-all flex items-center justify-center gap-2"
      >
        Tiến hành thanh toán
        <span className="text-sm">→</span>
      </button>

      <div className="mt-3 text-xs text-slate-500 text-center">
        Thanh toán bảo mật 100%
      </div>
    </div>
  );
};

export default CartSummary;
