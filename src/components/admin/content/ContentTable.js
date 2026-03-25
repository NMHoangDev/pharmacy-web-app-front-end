import React from "react";

const statusConfig = {
  published: {
    label: "Đã xuất bản",
    className:
      "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-800",
    dot: "bg-green-500",
  },
  draft: {
    label: "Bản nháp",
    className:
      "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600",
    dot: "bg-gray-500",
  },
  scheduled: {
    label: "Đã lên lịch",
    className:
      "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-800",
    icon: "schedule",
  },
  pending: {
    label: "Chờ duyệt",
    className:
      "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border border-amber-200 dark:border-amber-800",
    icon: "hourglass_empty",
  },
  rejected: {
    label: "Bị từ chối",
    className:
      "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400 border border-rose-200 dark:border-rose-800",
    icon: "block",
  },
  hidden: {
    label: "Đã ẩn",
    className:
      "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700",
    icon: "visibility_off",
  },
  archived: {
    label: "Lưu trữ",
    className:
      "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800",
    icon: "inventory_2",
  },
};

// Helper gộp class an toàn
const cx = (...classes) => classes.filter(Boolean).join(" ");

// Size variants cho badge status (giảm ~2 lần so với hiện tại)
const STATUS_SIZE = {
  // hiện tại bạn đang dùng: text-xs px-2.5 py-1 gap-1.5, dot 1.5, icon 14px
  // => giảm xuống:
  sm: {
    badge: "text-[10px] px-1.5 py-0.5 gap-1",
    dot: "w-1 h-1",
    icon: "text-[10px] leading-none",
  },
  // nếu sau này muốn giữ size cũ:
  md: {
    badge: "text-xs px-2.5 py-1 gap-1.5",
    dot: "w-1.5 h-1.5",
    icon: "text-[14px] leading-none",
  },
};

const ContentTable = ({
  articles,
  onPreview,
  onEdit,
  onDelete,
  onTogglePublish,
  // bạn có thể truyền size từ ngoài: "sm" | "md"
  statusSize = "sm",
}) => {
  const size = STATUS_SIZE[statusSize] || STATUS_SIZE.sm;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-gray-50/80 dark:bg-gray-800/80 border-y border-gray-200 dark:border-gray-700">
            <th className="py-4 px-6 text-xs font-semibold uppercase tracking-wider text-text-secondary dark:text-gray-400 w-16">
              <input
                className="rounded border-gray-300 text-primary focus:ring-primary h-4 w-4 bg-white dark:bg-gray-900 dark:border-gray-600"
                type="checkbox"
              />
            </th>
            <th className="py-4 px-6 text-xs font-semibold uppercase tracking-wider text-text-secondary dark:text-gray-400">
              Bài viết
            </th>
            <th className="py-4 px-6 text-xs font-semibold uppercase tracking-wider text-text-secondary dark:text-gray-400">
              Trạng thái
            </th>
            <th className="py-4 px-6 text-xs font-semibold uppercase tracking-wider text-text-secondary dark:text-gray-400">
              Tác giả
            </th>
            <th className="py-4 px-6 text-xs font-semibold uppercase tracking-wider text-text-secondary dark:text-gray-400 text-right">
              Ngày sửa
            </th>
            <th className="py-4 px-6 text-xs font-semibold uppercase tracking-wider text-text-secondary dark:text-gray-400 text-right">
              Hành động
            </th>
          </tr>
        </thead>

        <tbody className="divide-y divide-gray-100 dark:divide-gray-800 bg-surface-light dark:bg-surface-dark">
          {articles.map((item) => {
            const fallback = {
              label: item.status || "",
              className:
                "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600",
            };

            const status =
              statusConfig[item.status] || statusConfig.draft || fallback;

            return (
              <tr
                key={item.id}
                className="group hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
              >
                <td className="py-4 px-6">
                  <input
                    className="rounded border-gray-300 text-primary focus:ring-primary h-4 w-4 bg-white dark:bg-gray-900 dark:border-gray-600"
                    type="checkbox"
                  />
                </td>

                <td className="py-4 px-6">
                  <div className="flex items-center gap-4">
                    <div
                      className="w-16 h-12 rounded-lg bg-cover bg-center shrink-0 border border-gray-200 dark:border-gray-700"
                      style={{ backgroundImage: `url(${item.thumbnail})` }}
                      aria-label={item.title}
                    />
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-text-main dark:text-white truncate">
                        {item.title}
                      </p>
                      <p className="text-xs text-text-secondary dark:text-gray-400 mt-0.5 truncate">
                        {item.category} • {item.readTime}
                      </p>
                    </div>
                  </div>
                </td>

                <td className="py-4 px-6">
                  <span
                    className={cx(
                      "inline-flex items-center rounded-full font-medium border",
                      size.badge,
                      status.className,
                    )}
                  >
                    {status.dot && (
                      <span
                        className={cx("rounded-full", size.dot, status.dot)}
                      />
                    )}
                    {status.icon && (
                      <span
                        className={cx("material-symbols-outlined", size.icon)}
                        aria-hidden="true"
                      >
                        {status.icon}
                      </span>
                    )}
                    <span className="leading-none">{status.label}</span>
                  </span>
                </td>

                <td className="py-4 px-6">
                  <div className="flex items-center gap-2">
                    <div className="size-6 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-600">
                      {item.authorInitials}
                    </div>
                    <p className="text-sm text-text-main dark:text-gray-300">
                      {item.author}
                    </p>
                  </div>
                </td>

                <td className="py-4 px-6 text-right">
                  <p className="text-sm text-text-main dark:text-gray-300">
                    {item.updatedAt}
                  </p>
                </td>

                <td className="py-4 px-6 text-right">
                  <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    {onTogglePublish && (
                      <button
                        type="button"
                        className="p-1.5 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 rounded-md text-emerald-600"
                        title={
                          item.status === "published"
                            ? "Gỡ xuất bản"
                            : "Xuất bản"
                        }
                        onClick={() => onTogglePublish(item)}
                      >
                        <span className="material-symbols-outlined text-[20px]">
                          {item.status === "published"
                            ? "unpublished"
                            : "publish"}
                        </span>
                      </button>
                    )}

                    <button
                      type="button"
                      className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md text-gray-500 dark:text-gray-400"
                      title="Xem trước"
                      onClick={() => onPreview(item)}
                    >
                      <span className="material-symbols-outlined text-[20px]">
                        visibility
                      </span>
                    </button>

                    <button
                      type="button"
                      className="p-1.5 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-md text-primary"
                      title="Chỉnh sửa"
                      onClick={() => onEdit(item)}
                    >
                      <span className="material-symbols-outlined text-[20px]">
                        edit
                      </span>
                    </button>

                    <button
                      type="button"
                      className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-md text-red-500"
                      title="Xóa"
                      onClick={() => onDelete(item)}
                    >
                      <span className="material-symbols-outlined text-[20px]">
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
