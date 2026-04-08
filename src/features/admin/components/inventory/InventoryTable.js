import React, { useEffect, useState } from "react";

const STATUS = {
  in: {
    label: "Còn hàng",
    dot: "bg-emerald-500",
    chip: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  },
  low: {
    label: "Sắp hết",
    dot: "bg-amber-500",
    chip: "bg-amber-500/10 text-amber-700 dark:text-amber-300",
  },
  out: {
    label: "Hết hàng",
    dot: "bg-rose-500",
    chip: "bg-rose-500/10 text-rose-700 dark:text-rose-300",
  },
};

const StatusPill = ({ status }) => {
  const s = STATUS[status] || STATUS.in;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[11px] font-semibold ${s.chip}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  );
};

const StockInput = ({ value, status, onCommit }) => {
  const [local, setLocal] = useState(String(value ?? 0));
  useEffect(() => setLocal(String(value ?? 0)), [value]);

  const commit = () => {
    const n = Number(local);
    onCommit?.(Number.isFinite(n) ? n : 0);
  };

  const border =
    status === "out"
      ? "border-rose-300"
      : status === "low"
        ? "border-amber-300"
        : "border-slate-200";

  return (
    <input
      type="number"
      value={local}
      onChange={(e) => setLocal(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
      className={`h-7 w-16 rounded-md border ${border} bg-white text-center text-xs font-semibold
            outline-none transition focus:border-primary/60 focus:ring-2 focus:ring-primary/10
            dark:border-slate-800 dark:bg-slate-950 dark:text-white`}
    />
  );
};

const InventoryTable = ({
  items = [],
  onChangeStock,
  onDelete,
  onEdit,
  onViewDetail,
}) => {
  const cellTextStyle = {
    wordBreak: "break-word",
    overflowWrap: "anywhere",
  };

  return (
    <div className="overflow-hidden">
      <table className="w-full table-fixed text-left text-sm text-slate-600">
        <colgroup>
          <col />
          <col style={{ width: "160px" }} />
          <col className="hidden md:table-column" style={{ width: "140px" }} />
          <col style={{ width: "140px" }} />
          <col style={{ width: "120px" }} />
        </colgroup>

        <thead className="bg-slate-50 text-xs uppercase text-slate-500">
          <tr>
            <th className="px-3 py-3 font-semibold sm:px-4">Sản phẩm</th>
            <th className="px-3 py-3 text-center font-semibold sm:px-4">
              Tồn kho
            </th>
            <th className="hidden px-3 py-3 text-center font-semibold md:table-cell sm:px-4">
              Đặt giữ
            </th>
            <th className="px-3 py-3 font-semibold sm:px-4">Trạng thái</th>
            <th className="px-3 py-3 text-right font-semibold sm:px-4">
              Hành động
            </th>
          </tr>
        </thead>

        <tbody className="divide-y divide-slate-100">
          {items.map((item, idx) => {
            const available =
              item.available ??
              Math.max((item.stock || 0) - (item.reserved || 0), 0);

            return (
              <tr
                key={item.id}
                className="group transition-colors hover:bg-[#fafafa]"
              >
                <td className="px-3 py-2.5 align-middle sm:px-4 sm:py-3">
                  <div className="flex min-w-0 items-center gap-2">
                    <div
                      className="h-10 w-10 shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-slate-100 sm:h-11 sm:w-11"
                      style={{
                        backgroundImage: `url(${item.image})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                      }}
                    />
                    <div
                      className="flex min-w-0 flex-col gap-0.5"
                      style={cellTextStyle}
                    >
                      <p
                        className="line-clamp-2 text-sm font-semibold text-slate-900"
                        style={cellTextStyle}
                        title={item.name || ""}
                      >
                        {item.name}
                      </p>
                      <p
                        className="line-clamp-2 text-xs text-slate-500"
                        style={cellTextStyle}
                        title={item.sku ? `SKU: ${item.sku}` : ""}
                      >
                        SKU: {item.sku}
                      </p>
                    </div>
                  </div>
                </td>

                <td className="px-3 py-2.5 align-middle text-center sm:px-4 sm:py-3">
                  <div
                    className="inline-flex max-w-full flex-col items-center"
                    style={cellTextStyle}
                  >
                    <StockInput
                      value={item.stock}
                      status={item.status}
                      onCommit={(v) => onChangeStock(item.id, v)}
                    />
                    <div
                      className="mt-1 line-clamp-2 text-[11px] text-slate-500"
                      style={cellTextStyle}
                      title={`Có thể bán: ${available} · Ngưỡng: ${item.threshold ?? 0}`}
                    >
                      Có thể bán: {available} · Ngưỡng: {item.threshold ?? 0}
                    </div>
                  </div>
                </td>

                <td className="hidden px-3 py-2.5 align-middle text-center md:table-cell sm:px-4 sm:py-3">
                  <div
                    className="flex flex-col items-center"
                    style={cellTextStyle}
                  >
                    <span className="text-sm font-semibold text-slate-900">
                      {Number(item.reserved || 0).toLocaleString("vi-VN")}
                    </span>
                    <span
                      className="mt-0.5 line-clamp-1 text-[11px] text-slate-500"
                      style={cellTextStyle}
                    >
                      Đang giữ
                    </span>
                  </div>
                </td>

                <td className="px-3 py-2.5 align-middle sm:px-4 sm:py-3">
                  <StatusPill status={item.status} />
                </td>

                <td className="px-3 py-2.5 text-right align-middle sm:px-4 sm:py-3">
                  <div className="inline-flex items-center justify-end gap-1">
                    <button
                      type="button"
                      onClick={() => onViewDetail?.(item)}
                      className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-200/70 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
                      title="Xem chi tiết"
                    >
                      <span className="material-symbols-outlined text-[18px]">
                        visibility
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onEdit?.(item)}
                      className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-200/70 hover:text-primary dark:text-slate-400 dark:hover:bg-slate-800"
                      title="Sửa"
                    >
                      <span className="material-symbols-outlined text-[18px]">
                        edit
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(item.id)}
                      className="rounded-lg p-1.5 text-slate-500 hover:bg-rose-100 hover:text-rose-600 dark:text-slate-400 dark:hover:bg-rose-900/30 dark:hover:text-rose-400"
                      title="Xóa"
                    >
                      <span className="material-symbols-outlined text-[18px]">
                        delete
                      </span>
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default InventoryTable;
