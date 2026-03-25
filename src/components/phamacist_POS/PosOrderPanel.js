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
    <aside className="flex flex-col w-full xl:w-[390px] 2xl:w-[420px] bg-white dark:bg-slate-800 h-full min-h-0 shadow-sm z-10 border border-slate-200 dark:border-slate-700 rounded-xl overflow-y-auto">
      <div className="px-4 md:px-5 py-3 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800 sticky top-0 z-10">
        <div className="min-w-0">
          <h2 className="text-base md:text-lg font-bold text-slate-900 dark:text-white">
            Current Order
          </h2>
          <p className="text-xs text-slate-500 truncate">
            Transaction #{currentOrderCode || "new"}
          </p>
        </div>
        <button
          type="button"
          className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
          onClick={onClear}
          title="Clear order"
        >
          <span className="material-symbols-outlined">delete</span>
        </button>
      </div>

      <div className="px-4 md:px-5 py-3 space-y-2">
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
          <div className="text-sm text-slate-500 text-center py-8">
            Chưa có sản phẩm trong giỏ.
          </div>
        )}
      </div>

      <div className="bg-slate-50 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 p-4 md:p-5 space-y-3">
        <div className="space-y-1.5 text-sm">
          <div className="flex justify-between text-slate-500 dark:text-slate-400">
            <span>Subtotal</span>
            <span>{Number(subtotal).toLocaleString("vi-VN")}đ</span>
          </div>

          <div className="flex justify-between items-center text-slate-500 dark:text-slate-400">
            <span>Discount</span>
            <input
              className="w-24 rounded border border-dashed border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 h-8 px-2 text-right text-xs"
              type="number"
              min={0}
              value={discount}
              onChange={(e) => onDiscountChange(e.target.value)}
            />
          </div>

          <div className="flex justify-between items-center text-slate-500 dark:text-slate-400">
            <span>Tax/Fee</span>
            <input
              className="w-24 rounded border border-dashed border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 h-8 px-2 text-right text-xs"
              type="number"
              min={0}
              value={taxFee}
              onChange={(e) => onTaxFeeChange(e.target.value)}
            />
          </div>

          <div className="flex justify-between items-end pt-2 border-t border-slate-200 dark:border-slate-700">
            <div className="flex flex-col">
              <span className="text-slate-500 text-xs font-medium uppercase">
                Total Amount
              </span>
              <span className="text-xs text-slate-400">
                {cart.length} items
              </span>
            </div>
            <span className="text-2xl md:text-[32px] font-bold text-slate-900 dark:text-white tracking-tight">
              {Number(total).toLocaleString("vi-VN")}đ
            </span>
          </div>
        </div>

        <button
          type="button"
          className="w-full h-12 bg-primary hover:bg-blue-600 text-white rounded-xl flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
          onClick={onContinue}
          disabled={cart.length === 0}
        >
          <span className="font-bold text-base md:text-lg">Tiếp tục</span>
          <span className="material-symbols-outlined">arrow_forward</span>
        </button>
      </div>
    </aside>
  );
};

export default PosOrderPanel;
