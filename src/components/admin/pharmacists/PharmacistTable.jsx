import React from "react";
import ActionButtons from "../../common/ActionButtons";
import AdminTableWrapper from "../../common/AdminTableWrapper";
import TableCellText from "../../common/TableCellText";
import { Skeleton } from "../../ui/Skeleton";

const ROLE_COLORS = {
  ADMIN: "red",
  PHARMACIST: "blue",
  STAFF: "green",
};

const ROLE_LABELS = {
  ADMIN: "Quản trị viên",
  PHARMACIST: "Dược sĩ",
  STAFF: "Nhân vien",
};

const resolveRole = (item) => {
  const raw = String(item.role || item.specialty || "")
    .trim()
    .toUpperCase();
  if (raw && ROLE_COLORS[raw]) return raw;
  return "PHARMACIST";
};

const isActiveStatus = (status) =>
  !["SUSPENDED", "INACTIVE", "OFFLINE"].includes(
    String(status || "").toUpperCase(),
  );

const getSubText = (row) =>
  row.licenseNumber || row.username || `ID: ${row.id}`;

const thBase =
  "px-3 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 sm:px-4";
const tdBase = "px-3 py-2.5 align-middle sm:px-4 sm:py-3";
const roleTagClass = {
  ADMIN: "border-red-200 bg-red-50 text-red-700",
  PHARMACIST: "border-blue-200 bg-blue-50 text-blue-700",
  STAFF: "border-emerald-200 bg-emerald-50 text-emerald-700",
};

const PharmacistTable = React.memo(function PharmacistTable({
  rows,
  loading,
  selectedRowIds,
  onSelectRow,
  onSelectAll,
  onOpenDrawer,
  onEdit,
  onDelete,
  onToggleStatus,
}) {
  if (loading) {
    return (
      <AdminTableWrapper padded={false} className="overflow-hidden">
        <div className="space-y-2 p-4">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-12 w-full" />
          ))}
        </div>
      </AdminTableWrapper>
    );
  }

  if (!rows.length) {
    return (
      <AdminTableWrapper className="p-8 text-center">
        <p className="text-sm font-medium text-slate-700">
          Không có dược sĩ phù hợp
        </p>
        <p className="mt-1 text-xs text-slate-500">
          Thử thay đổi bộ lọc hoặc từ khóa.
        </p>
      </AdminTableWrapper>
    );
  }

  const allChecked = rows.length > 0 && selectedRowIds.length === rows.length;

  return (
    <AdminTableWrapper padded={false} className="overflow-hidden">
      <div className="w-full overflow-hidden">
        <table className="w-full table-fixed text-left text-sm text-slate-600">
          <colgroup>
            <col style={{ width: "44px" }} />
            <col style={{ width: "200px" }} />
            <col style={{ width: "180px" }} />
            <col
              className="hidden md:table-column"
              style={{ width: "120px" }}
            />
            <col
              className="hidden md:table-column"
              style={{ width: "120px" }}
            />
            <col style={{ width: "100px" }} />
            <col style={{ width: "100px" }} />
          </colgroup>

          <thead className="bg-slate-50">
            <tr>
              <th className={thBase}>
                <input
                  type="checkbox"
                  className="h-4 w-4 cursor-pointer rounded border-slate-300 text-primary focus:ring-primary"
                  checked={allChecked}
                  onChange={(e) => onSelectAll(e.target.checked)}
                  aria-label="Chọn tất cả dược sĩ"
                />
              </th>
              <th className={thBase}>Dược sĩ</th>
              <th className={thBase}>Email</th>
              <th className={`${thBase} hidden md:table-cell`}>
                Số điện thoại
              </th>
              <th className={`${thBase} hidden md:table-cell`}>Vai trò</th>
              <th className={thBase}>Trạng thái</th>
              <th className={`${thBase} text-right`}>Hành động</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 bg-white">
            {rows.map((row) => {
              const role = resolveRole(row);
              const active = isActiveStatus(row.status);

              return (
                <tr
                  key={row.id}
                  className="group transition-colors hover:bg-[#fafafa]"
                >
                  <td className={tdBase}>
                    <input
                      type="checkbox"
                      className="h-4 w-4 cursor-pointer rounded border-slate-300 text-primary focus:ring-primary"
                      checked={selectedRowIds.includes(row.id)}
                      onChange={(e) => onSelectRow(row.id, e.target.checked)}
                      aria-label={`Chọn dược sĩ ${row.name || ""}`}
                    />
                  </td>

                  <td className={tdBase}>
                    <button
                      type="button"
                      className="flex w-full min-w-0 items-center gap-2 text-left"
                      onClick={() => onOpenDrawer(row)}
                      title={row.name || ""}
                    >
                      <div className="h-8 w-8 shrink-0 overflow-hidden rounded-full border border-slate-200 bg-slate-100">
                        {row.avatarUrl ? (
                          <img
                            src={row.avatarUrl}
                            alt={row.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-xs font-semibold uppercase text-slate-500">
                            {String(row.name || "P")
                              .trim()
                              .slice(0, 1)}
                          </div>
                        )}
                      </div>
                      <div className="flex min-w-0 flex-col gap-0.5">
                        <TableCellText
                          value={row.name || "-"}
                          className="text-sm font-semibold text-slate-900"
                        />
                        <TableCellText
                          value={getSubText(row)}
                          className="text-xs text-slate-400"
                        />
                      </div>
                    </button>
                  </td>

                  <td className={tdBase}>
                    <div className="flex min-w-0 items-center">
                      <TableCellText
                        value={row.email || "-"}
                        className="text-sm text-slate-700"
                      />
                    </div>
                  </td>

                  <td className={`${tdBase} hidden md:table-cell`}>
                    <div className="flex min-w-0 items-center">
                      <TableCellText
                        value={row.phone || "-"}
                        className="text-sm text-slate-700"
                      />
                    </div>
                  </td>

                  <td className={`${tdBase} hidden md:table-cell`}>
                    <span
                      title={ROLE_LABELS[role]}
                      className={`inline-flex max-w-full items-center overflow-hidden text-ellipsis whitespace-nowrap rounded-full border px-2.5 py-1 text-xs font-medium ${roleTagClass[role]}`}
                    >
                      {ROLE_LABELS[role]}
                    </span>
                  </td>

                  <td className={tdBase}>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={active}
                      onClick={() => onToggleStatus(row)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        active ? "bg-emerald-500" : "bg-slate-300"
                      }`}
                      aria-label={`Chuyển trạng thái ${row.name || "dược sĩ"}`}
                    >
                      <span
                        className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
                          active ? "translate-x-5" : "translate-x-1"
                        }`}
                      />
                    </button>
                  </td>

                  <td className={`${tdBase} text-right`}>
                    <ActionButtons
                      className="justify-end"
                      onEdit={() => onEdit(row)}
                      onDelete={() => onDelete(row)}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </AdminTableWrapper>
  );
});

export default PharmacistTable;
