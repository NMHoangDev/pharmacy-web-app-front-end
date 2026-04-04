import React from "react";

const statusConfig = {
  published: {
    label: "Đã xuất bản",
    className: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  },
  draft: {
    label: "Bản nháp",
    className: "bg-slate-100 text-slate-700 ring-slate-200",
  },
  pending: {
    label: "Chờ duyệt",
    className: "bg-amber-50 text-amber-700 ring-amber-200",
  },
  rejected: {
    label: "Bị từ chối",
    className: "bg-rose-50 text-rose-700 ring-rose-200",
  },
  hidden: {
    label: "Đã ẩn",
    className: "bg-slate-100 text-slate-600 ring-slate-200",
  },
  archived: {
    label: "Lưu trữ",
    className: "bg-indigo-50 text-indigo-700 ring-indigo-200",
  },
};

const ContentTable = ({
  articles,
  onPreview,
  onEdit,
  onDelete,
  onTogglePublish,
}) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-slate-200">
        <thead className="bg-slate-50">
          <tr>
            <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              Bài viết
            </th>
            <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              Trạng thái
            </th>
            <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              Tác giả
            </th>
            <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              Cập nhật
            </th>
            <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              Hành động
            </th>
          </tr>
        </thead>

        <tbody className="divide-y divide-slate-200 bg-white">
          {articles.map((item) => {
            const status = statusConfig[item.status] || statusConfig.draft;
            return (
              <tr key={item.id} className="align-top transition hover:bg-slate-50/80">
                <td className="px-5 py-4">
                  <div className="flex items-start gap-4">
                    <div
                      className="h-16 w-20 shrink-0 rounded-2xl border border-slate-200 bg-cover bg-center bg-slate-100"
                      style={{ backgroundImage: `url(${item.thumbnail})` }}
                    />
                    <div className="min-w-0">
                      <p className="line-clamp-2 text-sm font-semibold text-slate-900">
                        {item.title}
                      </p>
                      <p className="mt-1 text-xs font-medium text-slate-500">
                        {item.category} • {item.readTime}
                      </p>
                      {item.excerpt ? (
                        <p className="mt-2 line-clamp-2 text-sm text-slate-600">
                          {item.excerpt}
                        </p>
                      ) : null}
                    </div>
                  </div>
                </td>

                <td className="px-5 py-4">
                  <span
                    className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset ${status.className}`}
                  >
                    {status.label}
                  </span>
                </td>

                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-50 text-xs font-bold text-blue-700">
                      {item.authorInitials}
                    </div>
                    <p className="text-sm font-medium text-slate-800">{item.author}</p>
                  </div>
                </td>

                <td className="px-5 py-4 text-right text-sm text-slate-600">
                  {item.updatedAt}
                </td>

                <td className="px-5 py-4">
                  <div className="flex items-center justify-end gap-2">
                    {onTogglePublish ? (
                      <button
                        type="button"
                        className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-600 transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700"
                        title={
                          item.status === "published"
                            ? "Gỡ xuất bản"
                            : "Xuất bản"
                        }
                        onClick={() => onTogglePublish(item)}
                      >
                        <span className="material-symbols-outlined text-[18px]">
                          {item.status === "published" ? "unpublished" : "publish"}
                        </span>
                      </button>
                    ) : null}

                    <button
                      type="button"
                      className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-600 transition hover:border-slate-300 hover:bg-slate-100"
                      title="Xem trước"
                      onClick={() => onPreview(item)}
                    >
                      <span className="material-symbols-outlined text-[18px]">
                        visibility
                      </span>
                    </button>

                    <button
                      type="button"
                      className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-blue-600 transition hover:border-blue-200 hover:bg-blue-50"
                      title="Chỉnh sửa"
                      onClick={() => onEdit(item)}
                    >
                      <span className="material-symbols-outlined text-[18px]">
                        edit
                      </span>
                    </button>

                    <button
                      type="button"
                      className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-rose-600 transition hover:border-rose-200 hover:bg-rose-50"
                      title="Xóa"
                      onClick={() => onDelete(item)}
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

export default ContentTable;
