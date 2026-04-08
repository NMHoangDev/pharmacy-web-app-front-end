import React from "react";

const selectClassName =
  "h-11 rounded-2xl border border-slate-200 bg-white px-3 text-sm text-slate-700 shadow-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100";

const ContentToolbar = ({
  query,
  status,
  author,
  onQueryChange,
  onStatusChange,
  onAuthorChange,
}) => {
  return (
    <div className="flex flex-col gap-3 border-b border-slate-200 px-4 py-4 sm:px-5 lg:flex-row lg:items-center lg:justify-between">
      <div className="relative w-full lg:max-w-md">
        <span className="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
          search
        </span>
        <input
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          className="h-11 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm text-slate-700 shadow-sm outline-none transition focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100"
          placeholder="Tìm theo tiêu đề, slug hoặc tác giả"
          type="text"
        />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <select
          value={status}
          onChange={(e) => onStatusChange(e.target.value)}
          className={selectClassName}
        >
          <option value="all">Tất cả trạng thái</option>
          <option value="PUBLISHED">Đã xuất bản</option>
          <option value="DRAFT">Bản nháp</option>
          <option value="PENDING">Chờ duyệt</option>
          <option value="REJECTED">Bị từ chối</option>
          <option value="HIDDEN">Đã ẩn</option>
          <option value="ARCHIVED">Lưu trữ</option>
        </select>

        <select
          value={author}
          onChange={(e) => onAuthorChange(e.target.value)}
          className={selectClassName}
        >
          <option value="all">Tất cả tác giả</option>
          <option value="admin">Admin</option>
          <option value="marketing">Marketing</option>
          <option value="editor">Editor</option>
          <option value="system">Hệ thống</option>
        </select>
      </div>
    </div>
  );
};

export default ContentToolbar;
