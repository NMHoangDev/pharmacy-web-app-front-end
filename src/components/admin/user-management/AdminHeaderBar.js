import React from "react";

const AdminHeaderBar = ({ search, onSearchChange, onAddUser, onInvite }) => {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-5 shadow-sm">
      <div>
        <p className="text-sm font-semibold text-primary uppercase tracking-wide">
          Bảng điều khiển
        </p>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
          Quản lý người dùng
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Giám sát hoạt động, trạng thái và phân quyền của người dùng trong hệ
          thống.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative w-full sm:w-64">
          <span className="material-symbols-outlined text-slate-400 absolute left-3 top-1/2 -translate-y-1/2">
            search
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Tìm theo tên, email hoặc số điện thoại"
            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg py-2.5 pl-10 pr-3 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <button
          type="button"
          onClick={onInvite}
          className="inline-flex items-center justify-center gap-2 px-3 py-2 text-sm font-semibold text-primary bg-primary/10 rounded-lg hover:bg-primary/15 transition-colors"
        >
          <span className="material-symbols-outlined text-base">mail</span>
          Gửi hướng dẫn
        </button>
        <button
          type="button"
          onClick={onAddUser}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-primary rounded-lg hover:bg-primary/90 shadow-sm transition-colors"
        >
          <span className="material-symbols-outlined text-base">add</span>
          Thêm người dùng
        </button>
      </div>
    </div>
  );
};

export default AdminHeaderBar;
