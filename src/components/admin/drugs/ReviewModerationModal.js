import React, { useEffect, useMemo, useState } from "react";

const statusStyles = {
  PUBLISHED: "bg-emerald-50 text-emerald-700",
  PENDING: "bg-amber-50 text-amber-700",
  REJECTED: "bg-rose-50 text-rose-700",
};

const ReviewModerationModal = ({
  open,
  onClose,
  product,
  statusFilter,
  onStatusFilterChange,
}) => {
  const [reviews, setReviews] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const canPrev = page > 0;
  const canNext = page + 1 < totalPages;

  const fetchReviews = async (signal) => {
    if (!product?.id) return;
    setLoading(true);
    setError("");

    try {
      const params = new URLSearchParams({
        page: String(page),
        size: "5",
      });
      if (statusFilter) {
        params.set("status", statusFilter);
      }

      const response = await fetch(
        `/api/reviews/internal/product/${product.id}?${params.toString()}`,
        { signal }
      );
      if (!response.ok) {
        throw new Error("Không thể tải đánh giá");
      }

      const payload = await response.json();
      setReviews(payload.content ?? []);
      setTotalPages(payload.totalPages ?? 1);
    } catch (err) {
      if (err.name !== "AbortError") {
        setError(err.message);
      }
    } finally {
      if (!signal?.aborted) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    if (!open) return;
    setPage(0);
  }, [open, product?.id, statusFilter]);

  useEffect(() => {
    if (!open) return;
    const controller = new AbortController();
    fetchReviews(controller.signal);
    return () => controller.abort();
  }, [open, product?.id, page, statusFilter]);

  const updateStatus = async (reviewId, nextStatus) => {
    try {
      const response = await fetch(`/api/reviews/internal/${reviewId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      if (!response.ok) {
        throw new Error("Không thể cập nhật trạng thái");
      }
      setReviews((prev) =>
        prev.map((item) =>
          item.id === reviewId ? { ...item, status: nextStatus } : item
        )
      );
    } catch (err) {
      alert(err.message);
    }
  };

  const summary = useMemo(() => {
    if (!product) return "";
    return `${product.name} • ${product.sku}`;
  }, [product]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
        onClick={onClose}
        role="presentation"
      />
      <div className="relative w-full max-w-3xl max-h-[90vh] overflow-hidden rounded-xl bg-white shadow-2xl dark:bg-slate-900 dark:border dark:border-slate-700">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 dark:border-slate-700">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Duyệt đánh giá
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {summary}
            </p>
          </div>
          <button
            className="flex items-center justify-center rounded-lg p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-white"
            type="button"
            onClick={onClose}
            aria-label="Đóng"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="flex flex-col gap-4 px-6 py-4">
          <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
            <select
              className="h-10 w-full sm:w-56 appearance-none rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-slate-600 focus:border-primary focus:ring-primary dark:border-slate-600 dark:bg-slate-800 dark:text-white"
              value={statusFilter}
              onChange={(e) => onStatusFilterChange?.(e.target.value)}
            >
              <option value="">Tất cả trạng thái</option>
              <option value="PUBLISHED">Đang hiển thị</option>
              <option value="PENDING">Chờ duyệt</option>
              <option value="REJECTED">Đã ẩn</option>
            </select>

            <div className="flex items-center gap-2 text-sm text-slate-500">
              <button
                type="button"
                className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 disabled:opacity-50"
                disabled={!canPrev}
                onClick={() => setPage((prev) => Math.max(prev - 1, 0))}
              >
                Trước
              </button>
              <span>
                Trang {page + 1} / {totalPages}
              </span>
              <button
                type="button"
                className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 disabled:opacity-50"
                disabled={!canNext}
                onClick={() => setPage((prev) => prev + 1)}
              >
                Sau
              </button>
            </div>
          </div>

          {error && (
            <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {error}
            </div>
          )}

          {loading ? (
            <div className="rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 shadow-sm dark:border-slate-700 dark:bg-slate-900">
              Đang tải đánh giá...
            </div>
          ) : reviews.length ? (
            <div className="space-y-4">
              {reviews.map((review) => (
                <div
                  key={review.id}
                  className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-semibold text-slate-900 dark:text-white">
                        {review.rating}/5
                      </span>
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-semibold ${
                          statusStyles[review.status] ||
                          "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {review.status}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {review.status !== "PUBLISHED" && (
                        <button
                          type="button"
                          className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700"
                          onClick={() => updateStatus(review.id, "PUBLISHED")}
                        >
                          Hiện
                        </button>
                      )}
                      {review.status !== "REJECTED" && (
                        <button
                          type="button"
                          className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700"
                          onClick={() => updateStatus(review.id, "REJECTED")}
                        >
                          Ẩn
                        </button>
                      )}
                    </div>
                  </div>
                  {review.title && (
                    <p className="mt-2 text-sm font-semibold text-slate-900 dark:text-white">
                      {review.title}
                    </p>
                  )}
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                    {review.content}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 shadow-sm dark:border-slate-700 dark:bg-slate-900">
              Chưa có đánh giá nào.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReviewModerationModal;
