import React from "react";

const PosProductTable = ({ products, onAddToCart }) => {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[680px] lg:min-w-0">
          <thead className="bg-slate-50 dark:bg-slate-900/50 sticky top-0 z-10">
            <tr>
              <th className="py-3 px-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider w-[35%]">
                Product
              </th>
              <th className="hidden md:table-cell py-3 px-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                SKU
              </th>
              <th className="py-3 px-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Stock
              </th>
              <th className="hidden lg:table-cell py-3 px-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Expiry/Lot
              </th>
              <th className="py-3 px-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">
                Price
              </th>
              <th className="py-3 px-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-center">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-700 text-sm">
            {products.map((item) => {
              const stockClass =
                item.available <= 5
                  ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                  : "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
              return (
                <tr
                  key={item.productId}
                  className="group hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                >
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-400 overflow-hidden">
                        {item.imageUrl ? (
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="material-symbols-outlined">
                            medication
                          </span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-slate-900 dark:text-white truncate">
                          {item.name}
                        </p>
                        <p className="text-xs text-slate-500 truncate">
                          {item.productId}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="hidden md:table-cell py-3 px-4 text-slate-600 dark:text-slate-300 font-mono text-xs">
                    {item.sku || "-"}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${stockClass}`}
                    >
                      {item.available}
                    </span>
                  </td>
                  <td className="hidden lg:table-cell py-3 px-4 text-slate-600 dark:text-slate-300 text-xs">
                    <div className="flex flex-col">
                      <span>{item.expiryDate || "N/A"}</span>
                      <span className="text-[11px] text-slate-400">
                        {item.lotNo || "-"}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right font-medium text-slate-900 dark:text-white">
                    {Number(item.unitPrice || 0).toLocaleString("vi-VN")}đ
                  </td>
                  <td className="py-3 px-4 text-center">
                    <button
                      type="button"
                      className="h-8 w-8 rounded-full bg-primary/10 hover:bg-primary text-primary hover:text-white flex items-center justify-center transition-all group-hover:scale-110 disabled:opacity-40 disabled:cursor-not-allowed"
                      onClick={() => onAddToCart(item)}
                      disabled={(item.available || 0) <= 0}
                    >
                      <span className="material-symbols-outlined text-lg">
                        add
                      </span>
                    </button>
                  </td>
                </tr>
              );
            })}
            {products.length === 0 && (
              <tr>
                <td
                  className="py-8 px-4 text-center text-slate-500"
                  colSpan={6}
                >
                  Không có sản phẩm phù hợp.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PosProductTable;
