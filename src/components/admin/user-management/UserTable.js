import React from "react";

const statusClassMap = {
  active: "bg-emerald-100 text-emerald-700",
  pending: "bg-amber-100 text-amber-700",
  suspended: "bg-rose-100 text-rose-700",
};

const roleMap = {
  admin: "Quản trị",
  pharmacist: "Dược sĩ",
  customer: "Khách hàng",
};

const UserTable = ({
  users,
  selectedIds,
  onToggleSelect,
  onToggleSelectAll,
  onRowClick,
  onStatusChange,
  loading = false,
}) => {
  const allSelected = users.length > 0 && selectedIds.length === users.length;

  if (loading) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-8 text-center shadow-sm">
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Đang tải người dùng...
        </p>
      </div>
    );
  }

  if (!users.length) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-8 text-center shadow-sm">
        <p className="text-lg font-semibold text-slate-900 dark:text-white">
          Không tìm thấy người dùng nào
        </p>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
          Thử thay đổi bộ lọc, sắp xếp hoặc từ khóa tìm kiếm
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 dark:bg-slate-800 text-left text-slate-600 dark:text-slate-300">
            <tr>
              <th className="px-4 py-3 w-10">
                <input
                  type="checkbox"
                  className="rounded border-slate-300 text-primary focus:ring-primary"
                  checked={allSelected}
                  onChange={(e) => onToggleSelectAll(e.target.checked)}
                  aria-label="Chọn tất cả"
                />
              </th>
              <th className="px-4 py-3 font-semibold">Người dùng</th>
              <th className="px-4 py-3 font-semibold">Vai trò</th>
              <th className="px-4 py-3 font-semibold">Trạng thái</th>
              <th className="px-4 py-3 font-semibold text-right">Đơn hàng</th>
              <th className="px-4 py-3 font-semibold">Hoạt động gần nhất</th>
              <th className="px-4 py-3 font-semibold">Ngày tạo</th>
              <th className="px-4 py-3 font-semibold text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {users.map((user) => {
              const isSelected = selectedIds.includes(user.id);
              return (
                <tr
                  key={user.id}
                  className="hover:bg-slate-50 dark:hover:bg-slate-800/70 transition-colors cursor-pointer"
                  onClick={() => onRowClick(user)}
                >
                  <td
                    className="px-4 py-3"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <input
                      type="checkbox"
                      className="rounded border-slate-300 text-primary focus:ring-primary"
                      checked={isSelected}
                      onChange={() => onToggleSelect(user.id)}
                      aria-label={`Chọn ${user.name}`}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="size-10 rounded-full bg-slate-100 dark:bg-slate-800 bg-center bg-cover"
                        style={{ backgroundImage: `url(${user.avatar})` }}
                        aria-label={user.name}
                      />
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-white">
                          {user.name}
                          {user.attention && (
                            <span className="ml-2 inline-flex items-center gap-1 text-[11px] font-semibold text-amber-600 bg-amber-50 border border-amber-100 rounded-full px-2 py-0.5">
                              <span className="material-symbols-outlined text-xs">
                                warning
                              </span>
                              Cần chú ý
                            </span>
                          )}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {user.email}
                        </p>
                        <p className="text-[11px] text-slate-400">
                          {user.phone}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-700 dark:text-slate-300 font-semibold">
                    {roleMap[user.role]}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                        statusClassMap[user.status]
                      }`}
                    >
                      <span className="material-symbols-outlined text-sm">
                        {user.status === "active"
                          ? "verified"
                          : user.status === "pending"
                          ? "schedule"
                          : "block"}
                      </span>
                      {user.status === "active"
                        ? "Hoạt động"
                        : user.status === "pending"
                        ? "Đang xét duyệt"
                        : "Tạm khóa"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-slate-900 dark:text-white font-semibold">
                    {user.orders}
                    <span className="text-xs text-slate-500 ml-1">đơn</span>
                  </td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                    {user.lastActive}
                  </td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                    {user.joined}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div
                      className="flex items-center justify-end gap-2"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        type="button"
                        className="text-xs font-semibold text-primary hover:text-primary/80"
                        onClick={() => onRowClick(user)}
                      >
                        Xem
                      </button>
                      {user.status !== "active" ? (
                        <button
                          type="button"
                          className="text-xs font-semibold text-emerald-600 hover:text-emerald-500"
                          onClick={() => onStatusChange(user.id, "active")}
                        >
                          Kích hoạt
                        </button>
                      ) : (
                        <button
                          type="button"
                          className="text-xs font-semibold text-rose-600 hover:text-rose-500"
                          onClick={() => onStatusChange(user.id, "suspended")}
                        >
                          Khóa
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserTable;
