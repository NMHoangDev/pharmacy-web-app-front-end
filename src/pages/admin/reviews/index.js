import React, { useCallback, useEffect, useMemo, useState } from "react";
import AdminLayout from "../../../components/admin/AdminLayout";
import ReviewsStats from "../../../components/admin/reviews/ReviewsStats";
import ReviewsToolbar from "../../../components/admin/reviews/ReviewsToolbar";
import ReviewsTable from "../../../components/admin/reviews/ReviewsTable";
import {
  deleteReview,
  exportReviews,
  getAdminReviewStats,
  listAdminReviews,
  replyReview,
  updateReviewStatus,
} from "../../../api/adminReviewApi";
import { getUser } from "../../../api/userApi";
import { getProductById } from "../../../api/productApi";

const AdminReviewsPage = () => {
  const [reviews, setReviews] = useState([]);
  const [query, setQuery] = useState("");
  const [rating, setRating] = useState("all");
  const [status, setStatus] = useState("all");
  const [stats, setStats] = useState({ total: 0, average: 0, pending: 0 });
  const [page, setPage] = useState(0);
  const [pageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState("");

  const resolveAvatar = useCallback((profile) => {
    if (!profile?.avatarBase64) return "";
    return profile.avatarBase64.startsWith("data:")
      ? profile.avatarBase64
      : `data:image/png;base64,${profile.avatarBase64}`;
  }, []);

  const deriveStatus = useCallback((review) => {
    if (review?.status === "REJECTED") return "hidden";
    if (review?.replyContent || review?.repliedAt) return "responded";
    return "pending";
  }, []);

  const resolveProductVariant = useCallback((product) => {
    if (!product) return "";
    if (product.attributes) {
      const raw = String(product.attributes).trim();
      try {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === "object") {
          if (parsed.unit) return String(parsed.unit);
          if (parsed.packaging) return String(parsed.packaging);
          if (parsed.size) return String(parsed.size);
        }
      } catch {
        // Fall back to raw text if it is not JSON.
      }
      if (!raw.startsWith("{") && !raw.startsWith("[")) return raw;
    }
    if (product.sku) return product.sku;
    return "";
  }, []);

  const buildPageNumbers = useCallback((totalPages, currentPage) => {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, idx) => idx + 1);
    }
    if (currentPage <= 2) {
      return [1, 2, 3, 4, 5];
    }
    if (currentPage >= totalPages - 3) {
      return Array.from({ length: 5 }, (_, idx) => totalPages - 4 + idx);
    }
    return [
      currentPage - 1,
      currentPage,
      currentPage + 1,
      currentPage + 2,
      currentPage + 3,
    ];
  }, []);

  const filtered = reviews;

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const pageNumbers = useMemo(
    () => buildPageNumbers(totalPages, page + 1),
    [buildPageNumbers, totalPages, page],
  );

  const fetchStats = useCallback(async () => {
    try {
      const data = await getAdminReviewStats();
      setStats({
        total: data?.total ?? 0,
        average: data?.average ?? 0,
        pending: data?.pending ?? 0,
      });
    } catch (err) {
      setError(err.message || "Không thể tải thống kê đánh giá");
    }
  }, []);

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = {
        page,
        size: pageSize,
        ...(rating !== "all" ? { rating: Number(rating) } : {}),
        ...(status !== "all" ? { status } : {}),
        ...(query.trim() ? { q: query.trim() } : {}),
      };
      const data = await listAdminReviews(params);
      const list = Array.isArray(data?.content) ? data.content : [];
      setTotal(data?.totalElements ?? list.length);

      const userIds = [
        ...new Set(list.map((item) => item.userId).filter(Boolean)),
      ];
      const productIds = [
        ...new Set(list.map((item) => item.productId).filter(Boolean)),
      ];

      const userEntries = await Promise.all(
        userIds.map(async (id) => {
          try {
            const profile = await getUser(id);
            return [id, profile];
          } catch {
            return [id, null];
          }
        }),
      );
      const productEntries = await Promise.all(
        productIds.map(async (id) => {
          try {
            const product = await getProductById(id);
            return [id, product];
          } catch {
            return [id, null];
          }
        }),
      );

      const userMap = new Map(userEntries);
      const productMap = new Map(productEntries);

      const mapped = list.map((item) => {
        const profile = userMap.get(item.userId) || {};
        const product = productMap.get(item.productId) || {};
        return {
          id: item.id,
          rating: item.rating,
          content: item.content,
          status: deriveStatus(item),
          date: item.createdAt
            ? new Date(item.createdAt).toLocaleString("vi-VN")
            : "",
          replyContent: item.replyContent || "",
          user: {
            name: profile.fullName || "Khách hàng",
            email: profile.email || "",
            avatar: resolveAvatar(profile),
          },
          product: {
            name: product.name || "Sản phẩm",
            variant: resolveProductVariant(product),
            image: product.imageUrl || "",
          },
        };
      });

      setReviews(mapped);
    } catch (err) {
      setError(err.message || "Không thể tải danh sách đánh giá");
    } finally {
      setLoading(false);
    }
  }, [
    deriveStatus,
    page,
    pageSize,
    query,
    rating,
    resolveAvatar,
    resolveProductVariant,
    status,
  ]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const handleToggle = async (id) => {
    const item = reviews.find((r) => r.id === id);
    if (!item) return;
    const nextStatus = item.status === "hidden" ? "PUBLISHED" : "REJECTED";
    try {
      const updated = await updateReviewStatus(id, nextStatus);
      setReviews((prev) =>
        prev.map((r) =>
          r.id === id ? { ...r, status: deriveStatus(updated) } : r,
        ),
      );
      fetchStats();
    } catch (err) {
      setError(err.message || "Không thể cập nhật trạng thái đánh giá");
    }
  };

  const handleReply = async (item) => {
    if (item.status === "responded") return;
    const content = window.prompt(
      `Trả lời khách hàng ${item.user.name}:`,
      item.replyContent || "",
    );
    if (!content || !content.trim()) return;
    try {
      const updated = await replyReview(item.id, content.trim());
      setReviews((prev) =>
        prev.map((r) =>
          r.id === item.id
            ? { ...r, status: deriveStatus(updated), replyContent: content }
            : r,
        ),
      );
      fetchStats();
    } catch (err) {
      setError(err.message || "Không thể trả lời đánh giá");
    }
  };

  const handleDelete = async (item) => {
    if (!window.confirm(`Xóa đánh giá của ${item.user.name}?`)) return;
    try {
      await deleteReview(item.id);
      setReviews((prev) => prev.filter((r) => r.id !== item.id));
      setTotal((prev) => Math.max(0, prev - 1));
      fetchStats();
    } catch (err) {
      setError(err.message || "Không thể xóa đánh giá");
    }
  };

  const resolveDownloadName = (contentDisposition) => {
    if (!contentDisposition) return "reviews-report.xlsx";
    const match = /filename\*?=(?:UTF-8'')?"?([^;"\n]+)"?/i.exec(
      contentDisposition,
    );
    if (!match) return "reviews-report.xlsx";
    try {
      return decodeURIComponent(match[1]);
    } catch {
      return match[1];
    }
  };

  const handleExport = async () => {
    setExporting(true);
    setError("");
    try {
      const params = {
        ...(rating !== "all" ? { rating: Number(rating) } : {}),
        ...(status !== "all" ? { status } : {}),
        ...(query.trim() ? { q: query.trim() } : {}),
      };
      const response = await exportReviews(params);
      const filename = resolveDownloadName(
        response?.headers?.["content-disposition"],
      );
      const blob = new Blob([response.data], {
        type:
          response?.headers?.["content-type"] ||
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(err.message || "Không thể xuất báo cáo");
    } finally {
      setExporting(false);
    }
  };

  return (
    <AdminLayout activeKey="reviews">
      <main className="flex-1 min-w-0 overflow-y-auto overflow-x-hidden scrollbar-hide p-4 sm:p-6 md:p-10 bg-background-light dark:bg-background-dark">
        <div className="w-full max-w-full mx-auto flex flex-col gap-8">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div className="flex flex-col gap-1">
                <h1 className="text-[#0d141b] dark:text-white text-3xl font-bold tracking-tight">
                  Quản lý đánh giá & phản hồi
                </h1>
                <p className="text-[#4c739a] text-base font-normal">
                  Theo dõi và phản hồi ý kiến khách hàng về sản phẩm
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  className="flex items-center gap-2 bg-white dark:bg-gray-800 border border-[#cfdbe7] dark:border-gray-700 text-[#0d141b] dark:text-white px-4 py-2 rounded-lg font-medium text-sm hover:bg-gray-50 dark:hover:bg-gray-700 shadow-sm transition-colors"
                  onClick={handleExport}
                  disabled={exporting}
                >
                  <span className="material-symbols-outlined text-[20px]">
                    download
                  </span>
                  {exporting ? "Đang xuất..." : "Xuất báo cáo"}
                </button>
              </div>
            </div>

            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}

            {loading && (
              <div className="text-sm text-[#4c739a]">Đang tải đánh giá...</div>
            )}

            <ReviewsStats
              total={stats.total}
              average={stats.average}
              pending={stats.pending}
            />
          </div>

          <div className="flex flex-col bg-white dark:bg-[#111a22] rounded-xl border border-[#cfdbe7] dark:border-gray-800 shadow-sm overflow-hidden">
            <ReviewsToolbar
              query={query}
              rating={rating}
              status={status}
              onQueryChange={(value) => {
                setQuery(value);
                setPage(0);
              }}
              onRatingChange={(value) => {
                setRating(value);
                setPage(0);
              }}
              onStatusChange={(value) => {
                setStatus(value);
                setPage(0);
              }}
            />
            <ReviewsTable
              reviews={filtered}
              onToggle={handleToggle}
              onReply={handleReply}
              onDelete={handleDelete}
            />

            <div className="px-4 py-3 border-t border-[#e7edf3] dark:border-gray-800 flex items-center justify-between">
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-[#4c739a]">
                    Hiển thị{" "}
                    <span className="font-medium text-[#0d141b] dark:text-white">
                      {total === 0 ? 0 : page * pageSize + 1}
                    </span>{" "}
                    đến
                    <span className="font-medium text-[#0d141b] dark:text-white">
                      {" "}
                      {Math.min((page + 1) * pageSize, total)}
                    </span>{" "}
                    trong số
                    <span className="font-medium text-[#0d141b] dark:text-white">
                      {" "}
                      {total}
                    </span>{" "}
                    kết quả
                  </p>
                </div>
                <div>
                  <nav
                    className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                    aria-label="Pagination"
                  >
                    <button
                      disabled={page === 0}
                      type="button"
                      onClick={() => setPage((prev) => Math.max(0, prev - 1))}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm font-medium text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <span className="material-symbols-outlined text-[20px]">
                        chevron_left
                      </span>
                    </button>
                    {pageNumbers.map((pageNumber) => (
                      <button
                        key={pageNumber}
                        type="button"
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          pageNumber === page + 1
                            ? "z-10 bg-primary/10 border-primary text-primary"
                            : "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700"
                        }`}
                        onClick={() => setPage(pageNumber - 1)}
                      >
                        {pageNumber}
                      </button>
                    ))}
                    <button
                      disabled={page + 1 >= totalPages}
                      type="button"
                      onClick={() =>
                        setPage((prev) => Math.min(totalPages - 1, prev + 1))
                      }
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm font-medium text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <span className="material-symbols-outlined text-[20px]">
                        chevron_right
                      </span>
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-center pb-6">
            <p className="text-[#4c739a] text-sm">
              © 2024 Pharmacy Admin Portal. All rights reserved.
            </p>
          </div>
        </div>
      </main>
    </AdminLayout>
  );
};

export default AdminReviewsPage;
