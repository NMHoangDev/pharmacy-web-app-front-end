import React from "react";

const statusBadge = {
  visible: "bg-primary text-white",
  hidden: "bg-gray-200 text-gray-700 dark:bg-gray-600 dark:text-white",
  pending:
    "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",
  responded: "bg-blue-50 text-primary",
};

const ReviewsTable = ({ reviews, onToggle, onReply, onDelete }) => {
  const renderStars = (rating) => (
    <div className="flex text-yellow-400">
      {[1, 2, 3, 4, 5].map((i) => (
        <span
          key={i}
          className={`material-symbols-outlined text-[18px] ${
            i <= rating ? "" : "text-gray-300"
          }`}
          style={{
            fontVariationSettings: `'FILL' ${i <= rating ? 1 : 0}, 'wght' 400`,
          }}
        >
          star
        </span>
      ))}
    </div>
  );

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-slate-50 dark:bg-gray-900/50 border-b border-[#e7edf3] dark:border-gray-800 text-[#4c739a] text-xs font-semibold uppercase tracking-wider">
            <th className="p-4 w-[50px]">
              <input
                className="rounded border-gray-300 text-primary focus:ring-primary/20 size-4"
                type="checkbox"
              />
            </th>
            <th className="p-4 min-w-[140px]">Khách hàng</th>
            <th className="p-4 min-w-[150px]">Sản phẩm</th>
            <th className="p-4 w-[110px]">Đánh giá</th>
            <th className="p-4 min-w-[220px]">Nội dung</th>
            <th className="p-4 w-[120px]">Ngày</th>
            <th className="p-4 w-[100px]">Hiển thị</th>
            <th className="p-4 w-[100px] text-right">Hành động</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#e7edf3] dark:divide-gray-800">
          {reviews.map((item) => (
            <tr
              key={item.id}
              className={`group hover:bg-slate-50 dark:hover:bg-gray-800/50 transition-colors ${
                item.status === "responded"
                  ? "bg-blue-50/30 dark:bg-blue-900/10"
                  : item.status === "hidden"
                  ? "bg-gray-50 dark:bg-gray-900/30"
                  : ""
              }`}
            >
              <td className="p-4">
                <input
                  className="rounded border-gray-300 text-primary focus:ring-primary/20 size-4"
                  type="checkbox"
                />
              </td>
              <td className="p-4">
                <div className="flex items-center gap-3">
                  <div
                    className="bg-center bg-no-repeat bg-cover rounded-full size-9 shrink-0"
                    style={{ backgroundImage: `url(${item.user.avatar})` }}
                    aria-label={item.user.name}
                  />
                  <div className="flex flex-col min-w-0">
                    <p className="text-[#0d141b] dark:text-white font-medium text-sm">
                      {item.user.name}
                    </p>
                    <p className="text-[#4c739a] text-xs">{item.user.email}</p>
                  </div>
                </div>
              </td>
              <td className="p-4">
                <div className="flex items-center gap-3">
                  <div
                    className="bg-center bg-no-repeat bg-cover rounded-md size-10 shrink-0 border border-gray-100"
                    style={{ backgroundImage: `url(${item.product.image})` }}
                    aria-label={item.product.name}
                  />
                  <div className="flex flex-col min-w-0">
                    <p className="text-[#0d141b] dark:text-white font-medium text-sm truncate max-w-[120px]">
                      {item.product.name}
                    </p>
                    <p className="text-[#4c739a] text-xs">
                      {item.product.variant}
                    </p>
                  </div>
                </div>
              </td>
              <td className="p-4">{renderStars(item.rating)}</td>
              <td className="p-4">
                <div className="flex flex-col gap-1">
                  <p className="text-[#0d141b] dark:text-gray-300 text-sm line-clamp-2">
                    {item.content}
                  </p>
                  {item.status === "responded" && (
                    <div className="flex items-center gap-1 text-primary text-xs font-medium">
                      <span className="material-symbols-outlined text-[14px]">
                        subdirectory_arrow_right
                      </span>
                      Đã trả lời
                    </div>
                  )}
                  {item.status === "hidden" && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 mt-1">
                      Spam / Ẩn
                    </span>
                  )}
                </div>
              </td>
              <td className="p-4">
                <p className="text-[#4c739a] text-sm whitespace-nowrap">
                  {item.date}
                </p>
              </td>
              <td className="p-4">
                <button
                  type="button"
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 ${
                    item.status === "hidden"
                      ? "bg-gray-200 dark:bg-gray-600"
                      : "bg-primary"
                  }`}
                  onClick={() => onToggle(item.id)}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      item.status === "hidden"
                        ? "translate-x-1"
                        : "translate-x-6"
                    }`}
                  />
                </button>
              </td>
              <td className="p-4 text-right">
                <div className="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    className={`p-1.5 rounded-md transition-colors ${
                      item.status === "responded"
                        ? "text-primary/50"
                        : "text-primary"
                    } ${
                      item.status === "responded"
                        ? "cursor-not-allowed"
                        : "hover:bg-blue-50"
                    }`}
                    title="Trả lời"
                    onClick={() => onReply(item)}
                    disabled={item.status === "responded"}
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      {item.status === "responded" ? "check" : "reply"}
                    </span>
                  </button>
                  <button
                    type="button"
                    className="p-1.5 rounded-md hover:bg-red-50 text-red-500 transition-colors"
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
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ReviewsTable;
