import React from "react";
import PosCartItem from "./PosCartItem";

const PosOrderPanel = ({
  cart,
  discount,
  taxFee,
  onDiscountChange,
  onTaxFeeChange,
  onDecreaseQty,
  onIncreaseQty,
  onRemoveItem,
  onContinue,
  onClear,
  subtotal,
  total,
  currentOrderCode,
}) => {
  return (
    <aside className="z-10 flex h-full min-h-0 w-full flex-col overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800 xl:w-[390px] 2xl:w-[420px]">
      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-slate-50/50 px-4 py-3 dark:border-slate-700 dark:bg-slate-800 md:px-5">
        <div className="min-w-0">
          <h2 className="text-base font-bold text-slate-900 dark:text-white md:text-lg">
            Đơn hàng hiện tại
          </h2>
          <p className="truncate text-xs text-slate-500">
            Mã giao dịch #{currentOrderCode || "mới"}
          </p>
        </div>
        <button
          type="button"
          className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20"
          onClick={onClear}
          title="Xóa đơn"
        >
          <span className="material-symbols-outlined">delete</span>
        </button>
      </div>

      <div className="space-y-2 px-4 py-3 md:px-5">
        {cart.length > 0 ? (
          cart.map((item) => (
            <PosCartItem
              key={item.productId}
              item={item}
              onIncrease={() => onIncreaseQty(item.productId)}
              onDecrease={() => onDecreaseQty(item.productId)}
              onRemove={() => onRemoveItem(item.productId)}
            />
          ))
        ) : (
          <div className="py-8 text-center text-sm text-slate-500">
            Chưa có sản phẩm trong giỏ.
          </div>
        )}
      </div>

      <div className="space-y-3 border-t border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800 md:p-5">
        <div className="space-y-1.5 text-sm">
          <div className="flex justify-between text-slate-500 dark:text-slate-400">
            <span>Tạm tính</span>
            <span>{Number(subtotal).toLocaleString("vi-VN")}đ</span>
          </div>

          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span>Giảm giá</span>
            <input
              className="h-8 w-24 rounded border border-dashed border-slate-300 bg-white px-2 text-right text-xs dark:border-slate-600 dark:bg-slate-700"
              type="number"
              min={0}
              value={discount}
              onChange={(e) => onDiscountChange(e.target.value)}
            />
          </div>

          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span>Phụ phí / thuế</span>
            <input
              className="h-8 w-24 rounded border border-dashed border-slate-300 bg-white px-2 text-right text-xs dark:border-slate-600 dark:bg-slate-700"
              type="number"
              min={0}
              value={taxFee}
              onChange={(e) => onTaxFeeChange(e.target.value)}
            />
          </div>

          <div className="flex items-end justify-between border-t border-slate-200 pt-2 dark:border-slate-700">
            <div className="flex flex-col">
              <span className="text-xs font-medium uppercase text-slate-500">
                Tổng thanh toán
              </span>
              <span className="text-xs text-slate-400">
                {cart.length} sản phẩm
              </span>
            </div>
            <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white md:text-[32px]">
              {Number(total).toLocaleString("vi-VN")}đ
            </span>
          </div>
        </div>

        <button
          type="button"
          className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary text-white transition-all active:scale-[0.98] hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-60"
          onClick={onContinue}
          disabled={cart.length === 0}
        >
          <span className="text-base font-bold md:text-lg">Tiếp tục</span>
          <span className="material-symbols-outlined">arrow_forward</span>
        </button>
      </div>
    </aside>
  );
};

export default PosOrderPanel;
