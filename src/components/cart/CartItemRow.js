import React from "react";

const CartItemRow = ({
  item,
  isSelected,
  onSelect,
  onChangeQuantity,
  onRemove,
  formatCurrency,
}) => {
  return (
    <tr className="group transition-colors hover:bg-sky-50/70">
      <td className="px-4 py-5 align-middle">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={(e) => onSelect(item.id, e.target.checked)}
          className="h-5 w-5 cursor-pointer rounded border-slate-300 text-primary focus:ring-primary/30"
        />
      </td>
      <td className="px-4 py-5 align-middle">
        <div className="flex items-center gap-4">
          <div
            className="h-20 w-20 shrink-0 rounded-2xl border border-slate-100 bg-white bg-center bg-cover shadow-sm"
            style={{ backgroundImage: `url(${item.image})` }}
            aria-label={item.alt}
          />
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="line-clamp-2 text-sm font-semibold leading-6 text-slate-900">
                {item.name}
              </span>
              {item.badge ? (
                <span className="storefront-pill inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold">
                  {item.badge}
                </span>
              ) : null}
            </div>
            {item.subtitle ? (
              <span className="mt-1 block text-xs leading-5 text-slate-500">
                {item.subtitle}
              </span>
            ) : null}
          </div>
        </div>
      </td>
      <td className="hidden px-4 py-5 align-middle text-sm font-medium text-slate-700 sm:table-cell">
        {formatCurrency(item.price)}
      </td>
      <td className="px-4 py-5 align-middle">
        <div className="inline-flex items-center rounded-2xl border border-slate-200 bg-white p-1 shadow-sm">
          <button
            type="button"
            className="grid h-9 w-9 place-items-center rounded-xl text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900"
            onClick={() =>
              onChangeQuantity(item.id, Math.max(1, item.quantity - 1))
            }
            aria-label="Giảm số lượng"
          >
            <span className="material-symbols-outlined text-[18px]">
              remove
            </span>
          </button>
          <span className="w-10 text-center text-sm font-semibold text-slate-900">
            {item.quantity}
          </span>
          <button
            type="button"
            className="grid h-9 w-9 place-items-center rounded-xl text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900"
            onClick={() => onChangeQuantity(item.id, item.quantity + 1)}
            aria-label="Tăng số lượng"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
          </button>
        </div>
      </td>
      <td className="hidden px-4 py-5 align-middle text-sm font-bold text-primary md:table-cell">
        {formatCurrency(item.price * item.quantity)}
      </td>
      <td className="px-4 py-5 align-middle text-right">
        <button
          type="button"
          className="grid h-10 w-10 place-items-center rounded-xl text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600"
          onClick={() => onRemove(item.id)}
          aria-label="Xoa san pham"
        >
          <span className="material-symbols-outlined text-[20px]">delete</span>
        </button>
      </td>
    </tr>
  );
};

export default CartItemRow;
