import React from "react";

const PosCartItem = ({ item, onIncrease, onDecrease, onRemove }) => {
  return (
    <div className="flex flex-col gap-2 p-3 rounded-lg border border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/30">
      <div className="flex justify-between items-start gap-2">
        <div className="min-w-0">
          <h3 className="font-semibold text-slate-900 dark:text-white text-sm truncate">
            {item.name}
          </h3>
          <p className="text-xs text-slate-500 truncate">
            {Number(item.unitPrice || 0).toLocaleString("vi-VN")}đ / unit
          </p>
        </div>
        <span className="font-bold text-slate-900 dark:text-white text-sm shrink-0">
          {Number(item.lineTotal || 0).toLocaleString("vi-VN")}đ
        </span>
      </div>

      <div className="flex items-center justify-between mt-1">
        <div className="flex items-center bg-white dark:bg-slate-800 rounded-md border border-slate-200 dark:border-slate-600 h-8">
          <button
            type="button"
            className="w-8 h-full flex items-center justify-center text-slate-500 hover:text-primary hover:bg-slate-50 dark:hover:bg-slate-700 rounded-l-md"
            onClick={onDecrease}
          >
            <span className="material-symbols-outlined text-sm">remove</span>
          </button>
          <input
            className="w-10 h-full text-center border-none p-0 text-sm font-semibold bg-transparent focus:ring-0"
            value={item.qty}
            readOnly
          />
          <button
            type="button"
            className="w-8 h-full flex items-center justify-center text-slate-500 hover:text-primary hover:bg-slate-50 dark:hover:bg-slate-700 rounded-r-md"
            onClick={onIncrease}
          >
            <span className="material-symbols-outlined text-sm">add</span>
          </button>
        </div>

        <button
          type="button"
          className="text-slate-400 hover:text-red-500"
          onClick={onRemove}
        >
          <span className="material-symbols-outlined text-lg">close</span>
        </button>
      </div>
    </div>
  );
};

export default PosCartItem;
