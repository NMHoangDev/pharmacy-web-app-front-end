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
    <tr className="group hover:bg-slate-50 dark:hover:bg-gray-800/50 transition-colors">
      <td className="px-4 py-4 align-middle">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={(e) => onSelect(item.id, e.target.checked)}
          className="h-5 w-5 rounded border-[#cfdbe7] border-2 bg-transparent text-primary focus:ring-primary focus:ring-offset-0 cursor-pointer"
        />
      </td>
      <td className="px-4 py-4 align-middle">
        <div className="flex items-center gap-3">
          <div
            className="bg-center bg-no-repeat bg-cover rounded-lg w-16 h-16 shrink-0 border border-gray-100 dark:border-gray-700"
            style={{ backgroundImage: `url(${item.image})` }}
            aria-label={item.alt}
          />
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-[#0d141b] dark:text-white text-sm font-semibold leading-normal">
                {item.name}
              </span>
              {item.badge && (
                <span className="hidden lg:inline-flex items-center rounded-full bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 text-xs font-medium text-blue-700 dark:text-blue-300 ring-1 ring-inset ring-blue-700/10">
                  {item.badge}
                </span>
              )}
            </div>
            <span className="text-[#4c739a] text-xs leading-normal">
              {item.subtitle}
            </span>
          </div>
        </div>
      </td>
      <td className="hidden sm:table-cell px-4 py-4 align-middle text-[#0d141b] dark:text-gray-300 text-sm font-medium">
        {formatCurrency(item.price)}
      </td>
      <td className="px-4 py-4 align-middle">
        <div className="flex items-center border border-[#cfdbe7] dark:border-gray-600 rounded-lg w-fit">
          <button
            type="button"
            className="px-2 py-1 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors"
            onClick={() =>
              onChangeQuantity(item.id, Math.max(1, item.quantity - 1))
            }
            aria-label="Giảm số lượng"
          >
            -
          </button>
          <span className="px-2 text-sm font-medium w-8 text-center text-[#0d141b] dark:text-white">
            {item.quantity}
          </span>
          <button
            type="button"
            className="px-2 py-1 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors"
            onClick={() => onChangeQuantity(item.id, item.quantity + 1)}
            aria-label="Tăng số lượng"
          >
            +
          </button>
        </div>
      </td>
      <td className="hidden md:table-cell px-4 py-4 align-middle text-primary text-sm font-bold">
        {formatCurrency(item.price * item.quantity)}
      </td>
      <td className="px-4 py-4 align-middle text-right">
        <button
          type="button"
          className="text-[#4c739a] hover:text-red-500 transition-colors p-2"
          onClick={() => onRemove(item.id)}
          aria-label="Xóa sản phẩm"
        >
          <span className="material-symbols-outlined text-[20px]">delete</span>
        </button>
      </td>
    </tr>
  );
};

export default CartItemRow;
