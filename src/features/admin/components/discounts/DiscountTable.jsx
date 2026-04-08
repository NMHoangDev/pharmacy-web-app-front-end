import React from "react";
import ActionButtons from "../../../../shared/components/common/ActionButtons";
import AdminTableWrapper from "../../../../shared/components/common/AdminTableWrapper";
import TableCellText from "../../../../shared/components/common/TableCellText";
import {
  computeScopeSummary,
  getStatusMeta,
  statusSwitchClass,
} from "./discountHelpers";
import { DiscountStatus } from "./discountTypes";

const formatDayMonth = (value) => {
  if (!value) return "";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
  }).format(date);
};

const DiscountTable = ({
  discounts,
  categoryMap,
  onView,
  onEdit,
  onDelete,
  onToggleStatus,
}) => {
  if (!discounts.length) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <p className="text-lg font-semibold text-slate-900">
          Không có khuyến mãi nào phù hợp
        </p>
        <p className="mt-2 text-sm text-slate-500">
          Thử thay đổi từ khóa hoặc bộ lọc.
        </p>
      </div>
    );
  }

  return (
    <AdminTableWrapper className="overflow-hidden" padded={false}>
      <div className="overflow-x-auto">
        <table className="min-w-[870px] w-full table-fixed text-left text-sm text-slate-600">
          <colgroup>
            <col style={{ width: "300px" }} />
            <col style={{ width: "210px" }} />
            <col style={{ width: "180px" }} />
            <col style={{ width: "120px" }} />
            <col style={{ width: "120px" }} />
          </colgroup>
          <thead className="bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-3 py-3 font-semibold sm:px-4">Chương trình</th>
              <th className="px-3 py-3 font-semibold sm:px-4">Phạm vi</th>
              <th className="px-3 py-3 font-semibold sm:px-4">Thời gian</th>
              <th className="px-3 py-3 font-semibold sm:px-4">Trạng thái</th>
              <th className="sticky right-0 z-10 bg-slate-50 px-3 py-3 text-right font-semibold sm:px-4">
                Hành động
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {discounts.map((discount) => {
              const scopeSummary = computeScopeSummary(discount, categoryMap);
              const statusMeta = getStatusMeta(discount.status);
              const isExpired =
                String(discount.status) === DiscountStatus.EXPIRED;
              const toggleOn =
                String(discount.status) !== DiscountStatus.DISABLED;

              const timeRange = `${formatDayMonth(discount.startDate)} → ${formatDayMonth(discount.endDate)}`;

              return (
                <tr
                  key={discount.id}
                  className={`group transition-colors hover:bg-[#fafafa] ${isExpired ? "opacity-60" : ""}`}
                >
                  <td className="px-3 py-2 align-middle sm:px-4 sm:py-2.5">
                    <div className="flex min-w-0 flex-col gap-0.5">
                      <TableCellText
                        value={discount.name}
                        className="text-sm font-semibold text-slate-900"
                      />
                      <TableCellText
                        value={discount.code ? `Mã: ${discount.code}` : ""}
                        className="text-xs text-slate-500"
                      />
                      {discount.description ? (
                        <TableCellText
                          value={discount.description}
                          className="text-xs text-slate-400"
                        />
                      ) : null}
                    </div>
                  </td>

                  <td className="px-3 py-2 align-middle sm:px-4 sm:py-2.5">
                    <TableCellText
                      value={scopeSummary}
                      className="text-sm text-slate-700"
                    />
                  </td>

                  <td className="px-3 py-2 align-middle sm:px-4 sm:py-2.5">
                    <span
                      className="block min-w-0 overflow-hidden text-ellipsis whitespace-nowrap text-xs text-slate-700"
                      title={timeRange}
                    >
                      {timeRange}
                    </span>
                  </td>

                  <td className="px-3 py-2 align-middle sm:px-4 sm:py-2.5">
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        className={statusSwitchClass(toggleOn)}
                        onClick={() => onToggleStatus?.(discount)}
                        aria-label={
                          toggleOn ? "Tắt khuyến mãi" : "Bật khuyến mãi"
                        }
                      >
                        <span
                          className={
                            toggleOn
                              ? "translate-x-5 pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow transition duration-200 ease-in-out"
                              : "translate-x-1 pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow transition duration-200 ease-in-out"
                          }
                        />
                      </button>
                      <span
                        className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-semibold ring-1 ring-inset ${statusMeta.badgeClass}`}
                      >
                        {statusMeta.label}
                      </span>
                    </div>
                  </td>

                  <td className="sticky right-0 z-10 bg-white px-3 py-2 text-right align-middle group-hover:bg-[#fafafa] sm:px-4 sm:py-2.5">
                    <ActionButtons
                      className="justify-end gap-1"
                      onEdit={() => onEdit?.(discount)}
                      onDelete={() => onDelete?.(discount)}
                    >
                      <button
                        type="button"
                        onClick={() => onView?.(discount)}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
                        aria-label="Xem"
                        title="Xem"
                      >
                        <span className="material-symbols-outlined text-[18px]">
                          visibility
                        </span>
                      </button>
                    </ActionButtons>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </AdminTableWrapper>
  );
};

export default DiscountTable;
