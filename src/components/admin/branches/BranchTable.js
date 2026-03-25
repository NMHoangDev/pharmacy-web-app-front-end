import React from "react";
import AdminTableWrapper from "../../common/AdminTableWrapper";

const StatusBadge = ({ status }) => {
  const normalized = String(status || "ACTIVE").toUpperCase();
  const cls =
    normalized === "ACTIVE"
      ? "bg-emerald-50 text-emerald-700 ring-emerald-600/20"
      : "bg-slate-100 text-slate-700 ring-slate-500/20";
  return (
    <span
      className={`inline-flex max-w-full items-center rounded-md px-2 py-1 text-xs font-semibold ring-1 ring-inset ${cls}`}
    >
      {normalized}
    </span>
  );
};

const formatPhone = (value) => {
  const raw = String(value || "").trim();
  if (!raw) return "-";
  const digits = raw.replace(/\D/g, "");
  if (digits.length === 10) {
    return `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7)}`;
  }
  if (digits.length === 11) {
    return `${digits.slice(0, 4)} ${digits.slice(4, 8)} ${digits.slice(8)}`;
  }
  return raw;
};

const BranchTable = ({
  items,
  loading,
  selectedId,
  onView,
  onEdit,
  onToggleStatus,
}) => {
  return (
    <AdminTableWrapper className="overflow-hidden" padded={false}>
      <table className="w-full table-fixed text-left text-sm text-slate-600">
        <colgroup>
          <col style={{ width: "220px" }} />
          <col style={{ width: "140px" }} />
          <col className="hidden sm:table-column" style={{ width: "160px" }} />
          <col className="hidden sm:table-column" style={{ width: "140px" }} />
          <col style={{ width: "120px" }} />
          <col style={{ width: "140px" }} />
        </colgroup>
        <thead className="bg-slate-50 text-xs uppercase text-slate-500">
          <tr>
            <th className="px-3 py-3 font-semibold sm:px-4">Chi nhánh</th>
            <th className="px-3 py-3 font-semibold sm:px-4">Mã</th>
            <th className="hidden px-3 py-3 font-semibold sm:table-cell sm:px-4">
              Thành phố
            </th>
            <th className="hidden px-3 py-3 font-semibold sm:table-cell sm:px-4">
              Điện thoại
            </th>
            <th className="px-3 py-3 font-semibold sm:px-4">Trạng thái</th>
            <th className="px-3 py-3 text-right font-semibold sm:px-4">
              Hành động
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {loading && (
            <tr>
              <td className="px-4 py-6 text-slate-500" colSpan={6}>
                Đang tải...
              </td>
            </tr>
          )}

          {!loading && (!items || items.length === 0) && (
            <tr>
              <td className="px-4 py-6 text-slate-500" colSpan={6}>
                Không có chi nhánh.
              </td>
            </tr>
          )}

          {!loading &&
            items?.map((b) => {
              const isActive = b.id === selectedId;
              const rowCls = isActive ? "bg-primary/5" : "hover:bg-[#fafafa]";
              return (
                <tr key={b.id} className={`group transition-colors ${rowCls}`}>
                  <td className="px-3 py-2.5 align-middle sm:px-4 sm:py-3">
                    <div className="min-w-0">
                      <p
                        className="line-clamp-2 text-sm font-semibold text-slate-900"
                        style={{
                          wordBreak: "break-word",
                          overflowWrap: "anywhere",
                        }}
                        title={b.name || "-"}
                      >
                        {b.name || "-"}
                      </p>
                      <p
                        className="mt-0.5 line-clamp-2 text-xs text-slate-500"
                        style={{
                          wordBreak: "break-word",
                          overflowWrap: "anywhere",
                        }}
                        title={b.addressLine || "-"}
                      >
                        {b.addressLine || "-"}
                      </p>
                    </div>
                  </td>
                  <td className="px-3 py-2.5 align-middle sm:px-4 sm:py-3">
                    <span
                      className="block line-clamp-2 font-mono text-xs text-slate-700"
                      style={{
                        wordBreak: "break-word",
                        overflowWrap: "anywhere",
                      }}
                      title={b.code || "-"}
                    >
                      {b.code || "-"}
                    </span>
                  </td>
                  <td className="hidden px-3 py-2.5 align-middle sm:table-cell sm:px-4 sm:py-3">
                    <span
                      className="block line-clamp-2 text-sm text-slate-700"
                      style={{
                        wordBreak: "break-word",
                        overflowWrap: "anywhere",
                      }}
                      title={b.city || "-"}
                    >
                      {b.city || "-"}
                    </span>
                  </td>
                  <td className="hidden px-3 py-2.5 align-middle sm:table-cell sm:px-4 sm:py-3">
                    <span
                      className="block line-clamp-2 text-sm text-slate-700"
                      style={{
                        wordBreak: "break-word",
                        overflowWrap: "anywhere",
                      }}
                      title={formatPhone(b.phone)}
                    >
                      {formatPhone(b.phone)}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 align-middle sm:px-4 sm:py-3">
                    <StatusBadge status={b.status} />
                  </td>
                  <td className="px-3 py-2.5 text-right align-middle sm:px-4 sm:py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => onView(b.id)}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
                        aria-label="Xem chi tiết"
                        title="Xem chi tiết"
                      >
                        <span className="material-symbols-outlined text-[18px]">
                          visibility
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={() => onEdit(b)}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
                        aria-label="Sửa"
                        title="Sửa"
                      >
                        <span className="material-symbols-outlined text-[18px]">
                          edit
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={() => onToggleStatus(b)}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-rose-500 transition-colors hover:bg-rose-50 hover:text-rose-600"
                        aria-label="Đổi trạng thái"
                        title={
                          b.status === "ACTIVE"
                            ? "Vô hiệu hóa chi nhánh"
                            : "Kích hoạt chi nhánh"
                        }
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
    </AdminTableWrapper>
  );
};

export default BranchTable;
