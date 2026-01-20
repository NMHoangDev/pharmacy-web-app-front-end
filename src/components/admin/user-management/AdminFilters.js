import React from "react";

const AdminFilters = ({ filters, onChange, onReset }) => {
  const handleChange = (key, value) => {
    onChange({ ...filters, [key]: value });
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-4 shadow-sm flex flex-col lg:flex-row lg:items-center gap-4">
      <div className="flex items-center gap-2 flex-1">
        <div className="relative w-full">
          <span className="material-symbols-outlined text-slate-400 absolute left-3 top-1/2 -translate-y-1/2">
            tune
          </span>
          <input
            type="text"
            value={filters.query || ""}
            onChange={(e) => handleChange("query", e.target.value)}
            placeholder="Lọc nhanh theo tên, email, số điện thoại..."
            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg py-2.5 pl-10 pr-3 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full lg:w-auto">
        <select
          value={filters.role}
          onChange={(e) => handleChange("role", e.target.value)}
          className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg py-2.5 px-3 text-sm text-slate-900 dark:text-white focus:outline-none"
        >
          <option value="all">Tất cả vai trò</option>
          <option value="customer">Khách hàng</option>
          <option value="pharmacist">Dược sĩ</option>
          <option value="admin">Quản trị</option>
        </select>

        <select
          value={filters.status}
          onChange={(e) => handleChange("status", e.target.value)}
          className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg py-2.5 px-3 text-sm text-slate-900 dark:text-white focus:outline-none"
        >
          <option value="all">Trạng thái</option>
          <option value="active">Hoạt động</option>
          <option value="pending">Đang xét duyệt</option>
          <option value="suspended">Tạm khóa</option>
        </select>

        <select
          value={filters.sort}
          onChange={(e) => handleChange("sort", e.target.value)}
          className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg py-2.5 px-3 text-sm text-slate-900 dark:text-white focus:outline-none"
        >
          <option value="recent">Mới nhất</option>
          <option value="orders">Đơn hàng cao nhất</option>
          <option value="name">Theo tên A-Z</option>
          <option value="activity">Hoạt động gần đây</option>
        </select>
      </div>

      <div className="flex items-center gap-3">
        <label className="inline-flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
          <input
            type="checkbox"
            className="rounded border-slate-300 text-primary focus:ring-primary"
            checked={filters.attentionOnly}
            onChange={(e) => handleChange("attentionOnly", e.target.checked)}
          />
          Cần chú ý
        </label>
        <button
          type="button"
          onClick={onReset}
          className="text-sm font-semibold text-primary hover:text-primary/80"
        >
          Đặt lại
        </button>
      </div>
    </div>
  );
};

export default AdminFilters;
