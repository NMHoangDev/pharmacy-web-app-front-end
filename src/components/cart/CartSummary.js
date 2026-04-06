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
      await new Promise((resolve) => setTimeout(resolve, 700));
      alert("Mã giảm giá đã được áp dụng!");
    } finally {
      setApplying(false);
    }
  };

  return (
    <div className="storefront-card storefront-fade-up w-full rounded-[28px] p-6 lg:sticky lg:top-24">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-400">
            Giỏ hàng
          </div>
          <h3 className="mt-2 text-xl font-extrabold text-slate-900 lg:text-2xl">
            Tổng tiền giỏ hàng
          </h3>
        </div>
        <div className="storefront-pill rounded-full px-3 py-1 text-[11px] font-bold">
          Bảo mật 100%
        </div>
      </div>

      <div className="mb-5 rounded-[24px] border border-emerald-100 bg-gradient-to-r from-emerald-50 to-sky-50 px-4 py-4">
        <div className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
          Tổng quan đơn hàng
        </div>
        <div className="mt-2 flex items-end justify-between gap-3">
          <div>
            <div className="text-3xl font-black text-slate-900">
              {itemCount}
            </div>
            <div className="text-sm text-slate-500">
              sản phẩm đang được chọn
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-slate-500">tạm tính</div>
            <div className="text-lg font-bold text-slate-900">
              {formatVnd(subtotal)}
            </div>
          </div>
        </div>
      </div>

      <div className="mb-4 text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
        Mã ưu đãi
      </div>
      <div className="mb-5">
        <div className="flex gap-2">
          <input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Mã giảm giá"
            className="storefront-input h-12 min-w-0 flex-1 px-4 text-sm"
          />
          <button
            onClick={applyCoupon}
            disabled={applying || !code.trim()}
            className={`h-12 shrink-0 rounded-2xl bg-slate-900 px-4 text-sm font-semibold text-white transition-all ${
              applying
                ? "cursor-wait opacity-60"
                : "hover:-translate-y-0.5 hover:bg-primary"
            }`}
          >
            {applying ? "Đang áp dụng..." : "Áp dụng"}
          </button>
        </div>
        <p className="mt-2 text-sm text-slate-500">
          Thêm voucher khi đơn hàng của bạn có ưu đãi.
        </p>
      </div>

      <div className="flex flex-col gap-3 border-b border-slate-100 pb-5">
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-500">
            Tạm tính ({itemCount} sản phẩm)
          </span>
          <span className="text-sm font-medium text-slate-900">
            {formatVnd(subtotal)}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-500">Giảm giá</span>
          <span className="text-sm font-medium text-slate-900">
            {formatVnd(discount)}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-500">Thuế VAT (8%)</span>
          <span className="text-sm font-medium text-slate-900">
            {formatVnd(vatAmount)}
          </span>
        </div>
      </div>

      <div className="flex items-end justify-between py-5">
        <div>
          <div className="text-base font-semibold text-slate-900">
            Tổng cộng
          </div>
          <div className="text-sm text-slate-400">Đã bao gồm VAT 8%</div>
        </div>
        <div className="text-right">
          <div className="text-3xl font-extrabold text-primary">
            {formatVnd(total)}
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={onCheckout}
        className="mt-2 flex w-full items-center justify-center gap-2 rounded-[20px] bg-gradient-to-r from-primary to-sky-500 px-4 py-3.5 font-semibold text-white shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5 hover:shadow-xl"
      >
        Tiến hành thanh toán
        <span className="text-sm">→</span>
      </button>

      <div className="mt-4 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-center text-xs text-slate-500">
        Hỗ trợ đổi trả theo chính sách và thanh toán bảo mật 100%
      </div>
    </div>
  );
};

export default CartSummary;
