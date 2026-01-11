import React from "react";

const AdminPharmacistFilters = ({ filters, onChange, onReset }) => {
  return (
    <div className="bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col lg:flex-row gap-4 items-center">
      <div className="relative w-full lg:flex-1 group">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <span className="material-symbols-outlined text-slate-400 group-focus-within:text-primary transition-colors">
            search
          </span>
        </div>
        <input
          value={filters.query}
          onChange={(e) => onChange({ ...filters, query: e.target.value })}
          className="block w-full pl-10 pr-3 py-2.5 border-none bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg focus:ring-2 focus:ring-primary placeholder:text-slate-400 sm:text-sm transition-all"
          placeholder="Tìm kiếm theo tên hoặc ID..."
          type="text"
        />
      </div>
      <div className="flex w-full lg:w-auto gap-3 overflow-x-auto pb-1 lg:pb-0">
        <div className="relative min-w-[160px]">
          <select
            value={filters.specialty}
            onChange={(e) =>
              onChange({ ...filters, specialty: e.target.value })
            }
            className="appearance-none w-full bg-slate-50 dark:bg-slate-800 border-none text-slate-700 dark:text-slate-300 py-2.5 pl-4 pr-10 rounded-lg focus:ring-2 focus:ring-primary text-sm cursor-pointer"
          >
            <option value="all">Tất cả chuyên khoa</option>
            <option value="clinical">Dược lâm sàng</option>
            <option value="retail">Dược bán lẻ</option>
            <option value="hospital">Dược bệnh viện</option>
            <option value="research">Nghiên cứu</option>
            <option value="online">Tư vấn trực tuyến</option>
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
            <span className="material-symbols-outlined text-lg">
              expand_more
            </span>
          </div>
        </div>
        <div className="relative min-w-[140px]">
          <select
            value={filters.status}
            onChange={(e) => onChange({ ...filters, status: e.target.value })}
            className="appearance-none w-full bg-slate-50 dark:bg-slate-800 border-none text-slate-700 dark:text-slate-300 py-2.5 pl-4 pr-10 rounded-lg focus:ring-2 focus:ring-primary text-sm cursor-pointer"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="online">Đang online</option>
            <option value="offline">Offline</option>
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
            <span className="material-symbols-outlined text-lg">
              expand_more
            </span>
          </div>
        </div>
        <div className="relative min-w-[140px]">
          <select
            value={filters.verification}
            onChange={(e) =>
              onChange({ ...filters, verification: e.target.value })
            }
            className="appearance-none w-full bg-slate-50 dark:bg-slate-800 border-none text-slate-700 dark:text-slate-300 py-2.5 pl-4 pr-10 rounded-lg focus:ring-2 focus:ring-primary text-sm cursor-pointer"
          >
            <option value="all">Xác thực</option>
            <option value="verified">Đã xác thực</option>
            <option value="pending">Chờ xác thực</option>
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
            <span className="material-symbols-outlined text-lg">
              expand_more
            </span>
          </div>
        </div>
        <button
          type="button"
          onClick={onReset}
          className="whitespace-nowrap px-4 py-2.5 text-sm font-medium text-slate-500 hover:text-primary transition-colors"
        >
          Xóa bộ lọc
        </button>
      </div>
    </div>
  );
};

export default AdminPharmacistFilters;
