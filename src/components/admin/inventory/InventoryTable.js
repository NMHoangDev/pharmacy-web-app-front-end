import React from "react";

const statusPill = (status) => {
  const map = {
    in: {
      bg: "bg-green-100",
      text: "text-green-800",
      dot: "bg-green-500",
      label: "Còn hàng",
    },
    low: {
      bg: "bg-yellow-100",
      text: "text-yellow-800",
      dot: "bg-yellow-500",
      label: "Sắp hết",
    },
    out: {
      bg: "bg-red-100",
      text: "text-red-800",
      dot: "bg-red-500",
      label: "Hết hàng",
    },
  };
  const cfg = map[status] || map.in;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${cfg.bg} ${cfg.text}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
};

const InventoryTable = ({ items, onChangeStock, onDelete }) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[900px] text-left text-sm">
        <thead className="bg-slate-50 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
          <tr>
            <th className="w-12 px-4 py-3 text-center">
              <input
                className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary dark:border-slate-600 dark:bg-slate-700"
                type="checkbox"
                disabled
              />
            </th>
            <th className="px-4 py-3 font-semibold">Thông tin thuốc</th>
            <th className="px-4 py-3 font-semibold">Danh mục</th>
            <th className="px-4 py-3 font-semibold text-center w-32">
              Tồn kho
            </th>
            <th className="px-4 py-3 font-semibold text-center w-32">
              Định mức báo
            </th>
            <th className="px-4 py-3 font-semibold text-right">Đơn giá</th>
            <th className="px-4 py-3 font-semibold">Trạng thái</th>
            <th className="px-4 py-3 font-semibold text-right w-24">Tác vụ</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
          {items.map((item) => (
            <tr
              key={item.id}
              className={`${
                item.status === "low"
                  ? "bg-yellow-50/50 dark:bg-yellow-900/5"
                  : item.status === "out"
                  ? "bg-red-50/50 dark:bg-red-900/5"
                  : ""
              } hover:bg-slate-50 dark:hover:bg-slate-800/50`}
            >
              <td className="px-4 py-3 text-center">
                <input
                  className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary dark:border-slate-600 dark:bg-slate-700"
                  type="checkbox"
                  disabled
                />
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <div
                    className="h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-white border border-slate-200 dark:border-slate-700 bg-cover bg-center"
                    style={{ backgroundImage: `url(${item.image})` }}
                    aria-label={item.name}
                  />
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white">
                      {item.name}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      SKU: {item.sku}
                    </p>
                  </div>
                </div>
              </td>
              <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                {item.categoryLabel}
              </td>
              <td className="px-4 py-3 text-center">
                <div className="relative inline-block w-20">
                  <input
                    className={`w-full rounded border ${
                      item.status === "out"
                        ? "border-red-300 text-red-600 dark:border-red-700 dark:text-red-500"
                        : item.status === "low"
                        ? "border-yellow-300 text-yellow-700 dark:border-yellow-700 dark:text-yellow-500"
                        : "border-slate-300 text-slate-900 dark:border-slate-600 dark:text-white"
                    } bg-white px-2 py-1 text-center text-sm focus:border-primary focus:ring-1 focus:ring-primary dark:bg-slate-800`}
                    title="Nhập tồn kho"
                    type="number"
                    value={item.stock}
                    onChange={(e) =>
                      onChangeStock(item.id, Number(e.target.value) || 0)
                    }
                  />
                </div>
              </td>
              <td className="px-4 py-3 text-center">
                <span className="text-slate-900 dark:text-white">
                  {item.threshold}
                </span>
              </td>
              <td className="px-4 py-3 text-right font-medium text-slate-900 dark:text-white">
                {item.priceLabel}
              </td>
              <td className="px-4 py-3">{statusPill(item.status)}</td>
              <td className="px-4 py-3 text-right">
                <div className="flex items-center justify-end gap-2">
                  <button
                    className="rounded p-1 text-slate-500 hover:bg-slate-200 hover:text-primary dark:text-slate-400 dark:hover:bg-slate-700"
                    onClick={() => alert("Chỉnh sửa sẽ được bổ sung")}
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      edit
                    </span>
                  </button>
                  <button
                    className="rounded p-1 text-slate-500 hover:bg-red-100 hover:text-red-600 dark:text-slate-400 dark:hover:bg-red-900/30 dark:hover:text-red-400"
                    onClick={() => onDelete(item.id)}
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      delete
                    </span>
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default InventoryTable;
