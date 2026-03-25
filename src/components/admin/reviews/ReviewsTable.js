import React from "react";

const ReviewsTable = ({ reviews, onToggle, onReply, onDelete }) => {
  const renderStars = (rating) => (
    <div className="inline-flex items-center whitespace-nowrap leading-none">
      {[1, 2, 3, 4, 5].map((i) => (
        <span
          key={i}
          className={`material-symbols-outlined text-[16px] ${
            i <= rating ? "text-yellow-400" : "text-gray-300 dark:text-gray-600"
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

  const rowTone =
    "bg-white dark:bg-gray-950/40 border border-slate-200/70 dark:border-gray-800/70";

  const cellBase = "p-3 md:p-4 align-top whitespace-normal break-words";

  const colDivider =
    "md:[&>td]:border-r md:[&>td]:border-slate-100 md:dark:[&>td]:border-gray-800 md:[&>td:last-child]:border-r-0";

  return (
    <div className="overflow-x-hidden">
      <table
        className={[
          "w-full table-fixed text-left text-sm",
          "border-separate border-spacing-y-2", // tách row kiểu card
        ].join(" ")}
      >
        <thead className="sticky top-0 z-10">
          <tr className="bg-slate-50/90 dark:bg-gray-900/70 backdrop-blur border border-slate-200/70 dark:border-gray-800/70">
            <th className="p-3 md:p-4 w-[44px] rounded-l-lg">
              <input
                className="rounded border-gray-300 text-primary focus:ring-primary/20 size-4"
                type="checkbox"
              />
            </th>
            <th className="p-3 md:p-4 w-[200px]">Khách hàng</th>
            <th className="hidden md:table-cell p-3 md:p-4 w-[200px]">
              Sản phẩm
            </th>
            <th className="p-3 md:p-4 w-[90px]">Đánh giá</th>
            <th className="p-3 md:p-4 w-[240px]">Nội dung</th>
            <th className="hidden lg:table-cell p-3 md:p-4 w-[140px]">Ngày</th>
            <th className="hidden md:table-cell p-3 md:p-4 w-[90px]">
              Hiển thị
            </th>
            <th className="p-3 md:p-4 w-[90px] text-right rounded-r-lg">
              Hành động
            </th>
          </tr>
        </thead>

        <tbody className="text-slate-900 dark:text-gray-100">
          {reviews.map((item) => {
            const highlight =
              item.status === "responded"
                ? "ring-1 ring-blue-200/60 dark:ring-blue-900/40"
                : item.status === "hidden"
                  ? "opacity-[0.92]"
                  : "";

            return (
              <tr
                key={item.id}
                className={[
                  rowTone,
                  highlight,
                  colDivider,
                  "transition",
                  "hover:shadow-sm hover:border-slate-300/70 dark:hover:border-gray-700/70",
                ].join(" ")}
              >
                <td className={[cellBase, "w-[44px] rounded-l-lg"].join(" ")}>
                  <input
                    className="rounded border-gray-300 text-primary focus:ring-primary/20 size-4"
                    type="checkbox"
                  />
                </td>

                <td className={cellBase}>
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="bg-center bg-no-repeat bg-cover rounded-full size-9 shrink-0 ring-1 ring-slate-200 dark:ring-gray-800"
                      style={{ backgroundImage: `url(${item.user.avatar})` }}
                      aria-label={item.user.name}
                    />
                    <div className="flex flex-col min-w-0">
                      <p className="font-semibold text-sm truncate">
                        {item.user.name}
                      </p>
                      <p className="text-[#4c739a] dark:text-gray-400 text-xs truncate">
                        {item.user.email}
                      </p>
                    </div>
                  </div>
                </td>

                <td className={["hidden md:table-cell", cellBase].join(" ")}>
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="bg-center bg-no-repeat bg-cover rounded-md size-10 shrink-0 border border-gray-100 dark:border-gray-800"
                      style={{ backgroundImage: `url(${item.product.image})` }}
                      aria-label={item.product.name}
                    />
                    <div className="flex flex-col min-w-0">
                      <p className="font-semibold text-sm truncate">
                        {item.product.name}
                      </p>
                      <p className="text-[#4c739a] dark:text-gray-400 text-xs truncate">
                        {item.product.variant}
                      </p>
                    </div>
                  </div>
                </td>

                <td className="p-3 md:p-1 w-[90px] overflow-hidden whitespace-nowrap text-center align-middle">
                  {renderStars(item.rating)}
                </td>

                <td className={cellBase}>
                  <div className="flex flex-col gap-1">
                    <p className="text-sm line-clamp-2 break-words text-slate-900 dark:text-gray-200">
                      {item.content}
                    </p>

                    {item.replyContent && (
                      <div className="mt-1.5 pl-3 border-l-2 border-primary/40 bg-blue-50/60 dark:bg-blue-900/10 rounded-r py-1.5">
                        <div className="flex items-center gap-1 mb-0.5">
                          <span className="material-symbols-outlined text-[13px] text-primary">
                            subdirectory_arrow_right
                          </span>
                          <span className="text-[11px] font-semibold text-primary">
                            Phản hồi Admin
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2">
                          {item.replyContent}
                        </p>
                      </div>
                    )}

                    <div className="md:hidden text-xs text-[#4c739a] dark:text-gray-400 truncate">
                      {item.product.name}{" "}
                      {item.product.variant ? `• ${item.product.variant}` : ""}
                    </div>
                    <div className="lg:hidden text-xs text-[#4c739a] dark:text-gray-400">
                      {item.date}
                    </div>

                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      {item.status === "responded" && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300">
                          <span className="material-symbols-outlined text-[14px]">
                            subdirectory_arrow_right
                          </span>
                          Đã trả lời
                        </span>
                      )}
                      {item.status === "hidden" && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200">
                          Spam / Ẩn
                        </span>
                      )}
                    </div>
                  </div>
                </td>

                <td className={["hidden lg:table-cell", cellBase].join(" ")}>
                  <p className="text-[#4c739a] dark:text-gray-400 text-sm">
                    {item.date}
                  </p>
                </td>

                <td className={["hidden md:table-cell", cellBase].join(" ")}>
                  <button
                    type="button"
                    className={[
                      "relative inline-flex h-6 w-11 items-center rounded-full",
                      "transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2",
                      "focus:ring-offset-white dark:focus:ring-offset-gray-950",
                      item.status === "hidden"
                        ? "bg-gray-200 dark:bg-gray-700"
                        : "bg-primary",
                    ].join(" ")}
                    onClick={() => onToggle(item.id)}
                  >
                    <span
                      className={[
                        "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                        item.status === "hidden"
                          ? "translate-x-1"
                          : "translate-x-6",
                      ].join(" ")}
                    />
                  </button>
                </td>

                <td className={[cellBase, "text-right rounded-r-lg"].join(" ")}>
                  <div className="flex items-center justify-end gap-1.5">
                    <button
                      type="button"
                      className={[
                        "p-1.5 rounded-md transition",
                        "hover:bg-blue-50 dark:hover:bg-blue-500/10",
                        item.status === "responded"
                          ? "text-primary/50 cursor-not-allowed"
                          : "text-primary",
                      ].join(" ")}
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
                      className="p-1.5 rounded-md hover:bg-red-50 dark:hover:bg-red-500/10 text-red-500 transition"
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

export default ReviewsTable;
