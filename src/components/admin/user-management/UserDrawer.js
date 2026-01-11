import React from "react";

const statusLabel = {
  active: { text: "Hoạt động", color: "bg-emerald-100 text-emerald-700" },
  pending: { text: "Đang xét duyệt", color: "bg-amber-100 text-amber-700" },
  suspended: { text: "Tạm khóa", color: "bg-rose-100 text-rose-700" },
};

const UserDrawer = ({ user, onClose, onChangeStatus }) => {
  if (!user) return null;

  const handleStatus = (status) => {
    onChangeStatus(status);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end">
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <aside className="relative w-full max-w-md h-full bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-700 shadow-2xl animate-[slideIn_0.2s_ease-out]">
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <p className="text-xs text-slate-500">Hồ sơ người dùng</p>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              {user.name}
            </h3>
          </div>
          <button
            type="button"
            className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
            onClick={onClose}
            aria-label="Đóng"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="p-4 flex items-center gap-3">
          <div
            className="size-16 rounded-full bg-slate-100 dark:bg-slate-800 bg-center bg-cover"
            style={{ backgroundImage: `url(${user.avatar})` }}
            aria-label={user.name}
          />
          <div className="flex-1">
            <p className="text-sm font-semibold text-slate-900 dark:text-white">
              {user.email}
            </p>
            <p className="text-sm text-slate-500">{user.phone}</p>
            <div className="mt-2 flex items-center gap-2">
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                  statusLabel[user.status].color
                }`}
              >
                <span className="material-symbols-outlined text-sm">
                  {user.status === "active"
                    ? "verified"
                    : user.status === "pending"
                    ? "schedule"
                    : "block"}
                </span>
                {statusLabel[user.status].text}
              </span>
              <span className="text-xs px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold">
                {user.role === "admin"
                  ? "Quản trị"
                  : user.role === "pharmacist"
                  ? "Dược sĩ"
                  : "Khách hàng"}
              </span>
            </div>
          </div>
        </div>

        <div className="px-4 pb-4 space-y-4 overflow-y-auto h-[calc(100%-170px)]">
          <section className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500">Tổng đơn hàng</p>
                <p className="text-xl font-bold text-slate-900 dark:text-white">
                  {user.orders}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Ngày tham gia</p>
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                  {user.joined}
                </p>
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-2">
              Hoạt động gần nhất: {user.lastActive}
            </p>
          </section>

          <section className="space-y-2">
            <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
              Ghi chú nội bộ
            </h4>
            <div className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-3 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              <p>
                {user.notes ||
                  "Không có ghi chú thêm. Hãy thêm ghi chú để đội CSKH có thể nắm được bối cảnh hỗ trợ."}
              </p>
            </div>
          </section>

          <section className="space-y-2">
            <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
              Gắn nhãn
            </h4>
            <div className="flex flex-wrap gap-2">
              {(user.tags || []).map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                >
                  {tag}
                </span>
              ))}
              {!user.tags?.length && (
                <span className="text-xs text-slate-500">Chưa có nhãn</span>
              )}
            </div>
          </section>
        </div>

        <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleStatus("active")}
              className="px-3 py-2 rounded-lg bg-emerald-100 text-emerald-700 text-sm font-semibold hover:bg-emerald-200"
            >
              Kích hoạt
            </button>
            <button
              type="button"
              onClick={() => handleStatus("suspended")}
              className="px-3 py-2 rounded-lg bg-rose-100 text-rose-700 text-sm font-semibold hover:bg-rose-200"
            >
              Khóa
            </button>
          </div>
          <button
            type="button"
            className="text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-primary"
            onClick={onClose}
          >
            Đóng
          </button>
        </div>
      </aside>
    </div>
  );
};

export default UserDrawer;
