import React from "react";

const PosProductTable = ({ products, onAddToCart }) => {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
      <div className="overflow-x-auto">
        <table className="min-w-[560px] w-full border-collapse text-left lg:min-w-0">
          <thead className="sticky top-0 z-10 bg-slate-50 dark:bg-slate-900/50">
            <tr>
              <th className="w-[48%] px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Sản phẩm
              </th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Tồn kho
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Đơn giá
              </th>
              <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Thao tác
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 text-sm dark:divide-slate-700">
            {products.map((item) => {
              const stockClass =
                Number(item.available || 0) <= 5
                  ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                  : "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";

              return (
                <tr
                  key={item.productId}
                  className="group transition-colors hover:bg-slate-50 dark:hover:bg-slate-700/50"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded bg-slate-100 text-slate-400 dark:bg-slate-700">
                        {item.imageUrl ? (
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <span className="material-symbols-outlined">
                            medication
                          </span>
                        )}
                      </div>

                      <div className="min-w-0">
                        <p className="truncate font-semibold text-slate-900 dark:text-white">
                          {item.name}
                        </p>
                        <p className="truncate text-xs text-slate-500">
                          Mã sản phẩm: {item.productId}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-medium ${stockClass}`}
                    >
                      {item.available}
                    </span>
                  </td>

                  <td className="px-4 py-3 text-right font-medium text-slate-900 dark:text-white">
                    {Number(item.unitPrice || 0).toLocaleString("vi-VN")}đ
                  </td>

                  <td className="px-4 py-3 text-center">
                    <button
                      type="button"
                      className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary transition-all hover:bg-primary hover:text-white group-hover:scale-110 disabled:cursor-not-allowed disabled:opacity-40"
                      onClick={() => onAddToCart(item)}
                      disabled={Number(item.available || 0) <= 0}
                      title="Thêm vào giỏ"
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
                <td colSpan={4} className="px-4 py-8 text-center text-slate-500">
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
