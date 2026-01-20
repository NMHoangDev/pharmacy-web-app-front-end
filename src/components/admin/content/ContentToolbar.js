import React from "react";

const ContentToolbar = ({
  query,
  status,
  author,
  onQueryChange,
  onStatusChange,
  onAuthorChange,
}) => {
  return (
    <div className="p-4 md:p-6 flex flex-col md:flex-row gap-4 items-center justify-between bg-gray-50/50 dark:bg-gray-800/30 border-b border-slate-200 dark:border-slate-700">
      <div className="relative w-full md:w-96">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <span className="material-symbols-outlined text-text-secondary dark:text-gray-500">
            search
          </span>
        </div>
        <input
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          className="block w-full pl-10 pr-4 py-2.5 text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-text-main dark:text-white placeholder-text-secondary dark:placeholder-gray-500 transition-all shadow-sm"
          placeholder="Tìm kiếm theo tiêu đề, tác giả..."
          type="text"
        />
      </div>
      <div className="flex gap-3 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
        <select
          value={status}
          onChange={(e) => onStatusChange(e.target.value)}
          className="h-10 pl-3 pr-8 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-text-main dark:text-white text-sm rounded-lg focus:ring-primary focus:border-primary cursor-pointer shadow-sm"
        >
          <option value="all">Tất cả trạng thái</option>
          <option value="published">Đã xuất bản</option>
          <option value="draft">Bản nháp</option>
          <option value="scheduled">Đã lên lịch</option>
        </select>
        <select
          value={author}
          onChange={(e) => onAuthorChange(e.target.value)}
          className="h-10 pl-3 pr-8 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-text-main dark:text-white text-sm rounded-lg focus:ring-primary focus:border-primary cursor-pointer shadow-sm"
        >
          <option value="all">Tất cả tác giả</option>
          <option value="minh">Dr. Minh</option>
          <option value="lan">DS. Lan</option>
          <option value="admin">Admin</option>
          <option value="marketing">Marketing</option>
        </select>
        <button
          type="button"
          className="flex items-center justify-center size-10 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 text-text-secondary dark:text-gray-400 transition-colors shadow-sm flex-shrink-0"
          onClick={() => alert("Bộ lọc nâng cao đang phát triển")}
        >
          <span className="material-symbols-outlined">filter_list</span>
        </button>
      </div>
    </div>
  );
};

export default ContentToolbar;
