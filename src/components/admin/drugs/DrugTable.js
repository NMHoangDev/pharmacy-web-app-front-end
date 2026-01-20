import React from "react";

const stockBadge = {
  in: "bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-400/10 dark:text-emerald-400 dark:ring-emerald-400/20",
  low: "bg-amber-50 text-amber-800 ring-amber-600/20 dark:bg-amber-400/10 dark:text-amber-300 dark:ring-amber-400/20",
  out: "bg-rose-50 text-rose-700 ring-rose-600/20 dark:bg-rose-400/10 dark:text-rose-300 dark:ring-rose-400/20",
};

const statusSwitch = (checked) =>
  checked
    ? "relative inline-flex h-5 w-9 cursor-pointer items-center rounded-full bg-primary transition-colors duration-200 ease-in-out"
    : "relative inline-flex h-5 w-9 cursor-pointer items-center rounded-full bg-slate-200 dark:bg-slate-600 transition-colors duration-200 ease-in-out";

const DrugTable = ({
  drugs,
  onToggleStatus,
  onEdit,
  onDelete,
  onViewReviews,
}) => {
  if (!drugs.length) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-8 text-center shadow-sm">
        <p className="text-lg font-semibold text-slate-900 dark:text-white">
          Không có thuốc nào phù hợp
        </p>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
          Thử thay đổi từ khóa hoặc bộ lọc.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-600 dark:text-slate-400">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500 dark:bg-slate-800/50 dark:text-slate-400">
            <tr>
              <th className="px-6 py-4 font-semibold">Sản phẩm</th>
              <th className="px-6 py-4 font-semibold">Danh mục</th>
              <th className="px-6 py-4 font-semibold">Giá bán</th>
              <th className="px-6 py-4 font-semibold">Kho</th>
              <th className="px-6 py-4 font-semibold text-center">Kê đơn?</th>
              <th className="px-6 py-4 font-semibold">Đánh giá</th>
              <th className="px-6 py-4 font-semibold">Trạng thái</th>
              <th className="px-6 py-4 font-semibold text-right">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {drugs.map((drug) => (
              <tr
                key={drug.id}
                className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors"
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-slate-100 border border-slate-200 dark:border-slate-600">
                      <img
                        className="h-full w-full object-cover"
                        src={drug.image}
                        alt={drug.name}
                      />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-semibold text-slate-900 dark:text-white">
                        {drug.name}
                      </span>
                      <span className="text-xs text-slate-500">
                        SKU: {drug.sku}
                      </span>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">{drug.category}</td>
                <td className="px-6 py-4 font-semibold text-slate-900 dark:text-white">
                  {drug.priceLabel}
                  <span className="text-xs font-normal text-slate-500 ml-1">
                    / {drug.unit}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-semibold ring-1 ring-inset ${
                      stockBadge[drug.stockStatus] || stockBadge.in
                    }`}
                  >
                    {drug.stockLabel}
                  </span>
                </td>
                <td className="px-6 py-4 text-center">
                  {drug.rx ? (
                    <div className="group/tooltip relative inline-flex justify-center">
                      <span className="material-symbols-outlined text-purple-600 text-[20px] cursor-help">
                        prescriptions
                      </span>
                      <div className="absolute bottom-full mb-2 hidden w-32 rounded bg-slate-900 px-2 py-1 text-center text-xs text-white group-hover/tooltip:block dark:bg-white dark:text-slate-900">
                        Cần đơn thuốc
                        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900 dark:border-t-white" />
                      </div>
                    </div>
                  ) : (
                    <span className="material-symbols-outlined text-slate-300 text-[20px]">
                      close
                    </span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col gap-1">
                    <span className="text-sm font-semibold text-slate-900 dark:text-white">
                      {(drug.reviewCount ?? 0).toLocaleString("vi-VN")} đánh giá
                    </span>
                    <button
                      type="button"
                      className="text-xs text-primary underline-offset-4 hover:underline"
                      onClick={() => onViewReviews?.(drug.id)}
                    >
                      Xem chi tiết
                    </button>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <button
                    type="button"
                    className={statusSwitch(drug.status === "ACTIVE")}
                    onClick={() => onToggleStatus(drug.id)}
                    aria-label={
                      drug.status === "ACTIVE"
                        ? "Tắt kinh doanh"
                        : "Bật kinh doanh"
                    }
                  >
                    <span
                      className={
                        drug.status === "ACTIVE"
                          ? "translate-x-4 pointer-events-none inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
                          : "translate-x-0 pointer-events-none inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
                      }
                    />
                  </button>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-primary dark:hover:bg-slate-800"
                      type="button"
                      onClick={() => onEdit(drug)}
                    >
                      <span className="material-symbols-outlined text-[18px]">
                        edit
                      </span>
                    </button>
                    <button
                      className="rounded-lg p-1.5 text-slate-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400"
                      type="button"
                      onClick={() => onDelete(drug.id)}
                    >
                      <span className="material-symbols-outlined text-[18px]">
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
    </div>
  );
};

export default DrugTable;
