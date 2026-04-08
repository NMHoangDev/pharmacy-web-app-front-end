import React from "react";

const PosCartItem = ({ item, onIncrease, onDecrease, onRemove }) => {
  return (
    <div className="flex flex-col gap-2 rounded-lg border border-slate-100 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-700/30">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="truncate text-sm font-semibold text-slate-900 dark:text-white">
            {item.name}
          </h3>
          <p className="truncate text-xs text-slate-500">
            {Number(item.unitPrice || 0).toLocaleString("vi-VN")}đ / sản phẩm
          </p>
        </div>

        <span className="shrink-0 text-sm font-bold text-slate-900 dark:text-white">
          {Number(item.lineTotal || 0).toLocaleString("vi-VN")}đ
        </span>
      </div>

      <div className="mt-1 flex items-center justify-between">
        <div className="flex h-8 items-center rounded-md border border-slate-200 bg-white dark:border-slate-600 dark:bg-slate-800">
          <button
            type="button"
            className="flex h-full w-8 items-center justify-center rounded-l-md text-slate-500 hover:bg-slate-50 hover:text-primary dark:hover:bg-slate-700"
            onClick={onDecrease}
          >
            <span className="material-symbols-outlined text-sm">remove</span>
          </button>

          <input
            className="h-full w-10 border-none bg-transparent p-0 text-center text-sm font-semibold focus:ring-0"
            value={item.qty}
            readOnly
          />

          <button
            type="button"
            className="flex h-full w-8 items-center justify-center rounded-r-md text-slate-500 hover:bg-slate-50 hover:text-primary dark:hover:bg-slate-700"
            onClick={onIncrease}
          >
            <span className="material-symbols-outlined text-sm">add</span>
          </button>
        </div>

        <button
          type="button"
          className="text-slate-400 hover:text-red-500"
          onClick={onRemove}
          title="Xóa sản phẩm"
        >
          <span className="material-symbols-outlined text-lg">close</span>
        </button>
      </div>
    </div>
  );
};

export default PosCartItem;
