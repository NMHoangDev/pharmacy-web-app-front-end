import React from "react";
import ActionButtons from "../../common/ActionButtons";
import AdminTableWrapper from "../../common/AdminTableWrapper";
import TableCellText from "../../common/TableCellText";

const stockBadge = {
  in: "bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-400/10 dark:text-emerald-400 dark:ring-emerald-400/20",
  low: "bg-amber-50 text-amber-800 ring-amber-600/20 dark:bg-amber-400/10 dark:text-amber-300 dark:ring-amber-400/20",
  out: "bg-rose-50 text-rose-700 ring-rose-600/20 dark:bg-rose-400/10 dark:text-rose-300 dark:ring-rose-400/20",
};

const statusSwitch = (checked) =>
  checked
    ? "relative inline-flex h-6 w-11 cursor-pointer items-center rounded-full bg-primary transition-colors duration-200 ease-in-out"
    : "relative inline-flex h-6 w-11 cursor-pointer items-center rounded-full bg-slate-300 transition-colors duration-200 ease-in-out";

const DrugTable = ({
  drugs,
  onToggleStatus,
  togglingProductId,
  onEdit,
  onDelete,
  onViewReviews,
}) => {
  if (!drugs.length) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <p className="text-lg font-semibold text-slate-900">
          Không có thuốc nào phù hợp
        </p>
        <p className="mt-2 text-sm text-slate-500">
          Thử thay đổi từ khóa hoặc bộ lọc.
        </p>
      </div>
    );
  }

  return (
    <AdminTableWrapper className="overflow-hidden" padded={false}>
      <div className="overflow-hidden">
        <table className="w-full table-fixed text-left text-sm text-slate-600">
          <colgroup>
            <col style={{ width: "200px" }} />
            <col
              className="hidden md:table-column"
              style={{ width: "180px" }}
            />
            <col style={{ width: "120px" }} />
            <col style={{ width: "120px" }} />
            <col style={{ width: "100px" }} />
            <col style={{ width: "100px" }} />
          </colgroup>
          <thead className="bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-3 py-3 font-semibold sm:px-4">Sản phẩm</th>
              <th className="hidden px-3 py-3 font-semibold md:table-cell sm:px-4">
                Danh mục
              </th>
              <th className="px-3 py-3 font-semibold sm:px-4">Giá bán</th>
              <th className="px-3 py-3 font-semibold sm:px-4">Đơn vị</th>
              <th className="px-3 py-3 font-semibold sm:px-4">Trạng thái</th>
              <th className="px-3 py-3 text-right font-semibold sm:px-4">
                Hành động
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {drugs.map((drug) => (
              <tr
                key={drug.id}
                className="group transition-colors hover:bg-[#fafafa]"
              >
                <td className="px-3 py-2.5 align-middle sm:px-4 sm:py-3">
                  <div className="flex min-w-0 items-center gap-2">
                    <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-slate-100 sm:h-11 sm:w-11">
                      <img
                        className="h-full w-full object-cover"
                        src={drug.image}
                        alt={drug.name}
                      />
                    </div>
                    <div className="flex min-w-0 flex-col gap-0.5">
                      <TableCellText
                        value={drug.name}
                        className="text-sm font-semibold text-slate-900"
                      />
                      <TableCellText
                        value={`SKU: ${drug.sku}`}
                        className="text-xs text-slate-500"
                      />
                    </div>
                  </div>
                </td>
                <td className="hidden px-3 py-2.5 align-middle md:table-cell sm:px-4 sm:py-3">
                  <div className="flex min-w-0 items-center">
                    <TableCellText
                      value={drug.category}
                      className="text-sm text-slate-700"
                    />
                  </div>
                </td>
                <td className="px-3 py-2.5 align-middle sm:px-4 sm:py-3">
                  <div className="flex min-w-0 items-center gap-1">
                    <TableCellText
                      value={drug.priceLabel}
                      className="text-sm font-semibold text-slate-900"
                    />
                    <TableCellText
                      value={`/${drug.unit}`}
                      className="text-xs text-slate-500"
                    />
                  </div>
                </td>
                <td className="px-3 py-2.5 align-middle sm:px-4 sm:py-3">
                  <div className="flex min-w-0 items-center">
                    <span
                      title={drug.stockLabel}
                      className={`inline-flex max-w-full items-center overflow-hidden text-ellipsis whitespace-nowrap rounded-md px-2 py-1 text-xs font-semibold ring-1 ring-inset ${
                        stockBadge[drug.stockStatus] || stockBadge.in
                      }`}
                    >
                      {drug.stockLabel}
                    </span>
                  </div>
                </td>
                <td className="px-3 py-2.5 align-middle sm:px-4 sm:py-3">
                  <div className="flex items-center">
                    {String(togglingProductId || "") === String(drug.id) ? (
                      <span className="material-symbols-outlined mr-2 animate-spin text-base text-slate-400">
                        progress_activity
                      </span>
                    ) : null}
                    <button
                      type="button"
                      className={statusSwitch(drug.status === "ACTIVE")}
                      onClick={() => onToggleStatus(drug.id)}
                      disabled={
                        String(togglingProductId || "") === String(drug.id)
                      }
                      aria-label={
                        drug.status === "ACTIVE"
                          ? "Tắt kinh doanh"
                          : "Bật kinh doanh"
                      }
                    >
                      <span
                        className={
                          drug.status === "ACTIVE"
                            ? "translate-x-5 pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow transition duration-200 ease-in-out"
                            : "translate-x-1 pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow transition duration-200 ease-in-out"
                        }
                      />
                    </button>
                  </div>
                </td>
                <td className="px-3 py-2.5 text-right align-middle sm:px-4 sm:py-3">
                  <ActionButtons
                    className="justify-end"
                    onEdit={() => onEdit(drug)}
                    onDelete={() => onDelete(drug.id)}
                  >
                    <button
                      type="button"
                      onClick={() => onViewReviews?.(drug.id)}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
                      aria-label="Xem đánh giá"
                      title={`${(drug.reviewCount ?? 0).toLocaleString("vi-VN")} đánh giá`}
                    >
                      <span className="material-symbols-outlined text-[18px]">
                        reviews
                      </span>
                    </button>
                  </ActionButtons>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminTableWrapper>
  );
};

export default DrugTable;
