import React from "react";

const ReviewCard = ({ review, renderStars }) => {
  if (!review) return null;

  const displayUser = review.userId
    ? `UID: ${String(review.userId).slice(0, 8)}`
    : "Khách hàng";
  const displayDate = review.createdAt
    ? new Date(review.createdAt).toLocaleDateString("vi-VN")
    : "";

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            {renderStars ? renderStars(review.rating || 0) : null}
          </div>
          <span className="text-xs text-slate-500">{displayUser}</span>
        </div>
        <span className="text-xs text-slate-400">{displayDate}</span>
      </div>
      {review.title ? (
        <p className="mt-2 font-semibold text-slate-900 dark:text-white">
          {review.title}
        </p>
      ) : null}
      <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
        {review.content}
      </p>
      {Array.isArray(review.images) && review.images.length ? (
        <div className="mt-3 grid grid-cols-3 gap-2">
          {review.images.map((image, idx) => (
            <div
              key={`${image.url || idx}-${idx}`}
              className="h-20 w-full overflow-hidden rounded-lg border border-slate-200"
            >
              <img
                src={image.url}
                alt={image.key || "review image"}
                className="h-full w-full object-cover"
              />
            </div>
          ))}
        </div>
      ) : null}

      {review.replyContent ? (
        <div className="mt-4 ml-2 pl-4 border-l-2 border-primary/40 rounded-r-lg bg-blue-50/60 dark:bg-blue-900/10 p-3">
          <div className="flex items-center gap-1.5 mb-1">
            <span
              className="material-symbols-outlined text-[15px] text-primary"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              subdirectory_arrow_right
            </span>
            <span className="text-xs font-semibold text-primary">
              Phản hồi từ nhà thuốc
            </span>
            {review.repliedAt ? (
              <span className="ml-auto text-xs text-slate-400">
                {new Date(review.repliedAt).toLocaleDateString("vi-VN")}
              </span>
            ) : null}
          </div>
          <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
            {review.replyContent}
          </p>
        </div>
      ) : null}
    </div>
  );
};

export default ReviewCard;
