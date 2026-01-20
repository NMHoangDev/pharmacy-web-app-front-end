import React, { useMemo, useState } from "react";
import AdminLayout from "../../../components/admin/AdminLayout";
import ReviewsStats from "../../../components/admin/reviews/ReviewsStats";
import ReviewsToolbar from "../../../components/admin/reviews/ReviewsToolbar";
import ReviewsTable from "../../../components/admin/reviews/ReviewsTable";

const seedReviews = [
  {
    id: "r-1",
    user: {
      name: "Nguyễn Văn A",
      email: "nguyena@gmail.com",
      avatar:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuBuEu7hZpNqtiO1YP6aHKrZOzt-je0zz5m18khazpaWnuUWD6hmkIwcss_VPmToTFGGOiI5EzYCb-kxK0auH80UhVp9a6zb5SegdL38Nukb6_lYu4-podDQAO4AWN7IMY1YHTlmipWirm5C15qMgZCVQTKAFeTUjB_wuk41PGajiGZUPAMWps84v6W9YCpLjWI-NIoKyq2jZotMl6QKR_eCopyeVPf0lNZzagvpHOEjzoZwSCASHgZaDRF-DQbolEhLSiHEg0ACmN7V",
    },
    product: {
      name: "Panadol Extra",
      variant: "Vỉ 12 viên",
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuAepn8kmJqNfKtyNXShybLFYBMIN6PSNBEGKzdgPEM8M3QLRkR5ZYRhHyWglu2KQdo1fW86l5KtCGquTWfSz_cRXXheMWNrppUZp8WOHWPwX1LoE0LmD-n3fgxK0fFC8mBiqEkf_rcVI3RTon-1mowxieMWQ56Sz-rcCe2cQzlq4FIciwjgn8yDUUGdAEKXHCTN-Fhe9NQNdd62a0iR_mvwgEy6tqoHDt9dPfxBtHGiNc8RfIbK3xWGbTZa-xhb-xv4GvZShcxPhmNr",
    },
    rating: 5,
    content:
      "Giao hàng rất nhanh, đóng gói cẩn thận. Thuốc chuẩn, hạn sử dụng còn dài.",
    date: "2 giờ trước",
    status: "visible",
  },
  {
    id: "r-2",
    user: {
      name: "Trần Thị B",
      email: "tranthib@gmail.com",
      avatar:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuB7SIhXx4615VJwEqm2_wfDRbzmsBTzJJpzbDkj9XNzD9yubMknPl-NVdsT3SGbDeC5IbKaQPqTCgNPCkGAK8auYetb32YJPnJ52bJFKnD-mNlrlKdzIYTZZglf1TyDkoizroPYJlW2fxHIEFM2u5NsvBBAQRbhJX2ehj8PRWsoUsVfsJZKDKkoGSnrQR46bi8ql6uG8TXidajm2ojuVIYpRKD0dduyAu3ypFSYu3pDyEM_kvTxko-xBmhghseJ9Wyi07elukUUVeWa",
    },
    product: {
      name: "Vitamin C 500mg",
      variant: "Hộp 100 viên",
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuB-q-ZenlODGeGFMDEDUFEqCTbzmhTyhOUFUj7LjJG_XESLQzxA94tlov5LPsGvbgByEMeNkVLTAXSykUrAg63SGgl0RGnl1SexxTRlb7GGbKvO0LlVITNWuQNMf46hQuIrUoNKAqtJhVqWyZqoF6Rg-lLv6SJ2-_SLc0nuoUJ3OEg6WXrl9BZRITzjSf33hm5i38x_eB4jNHF8vcGCk1wZ8VKr6EDHgLqfDv5jJyxMCtgrqVK4dTTLV4zjHv9EGc_-cPRSCpkcTkTK",
    },
    rating: 4,
    content: "Sản phẩm tốt nhưng giao hàng hơi chậm. Cần cải thiện vận chuyển.",
    date: "1 ngày trước",
    status: "responded",
  },
  {
    id: "r-3",
    user: {
      name: "Lê Văn C",
      email: "levanc@gmail.com",
      avatar:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuBVm2LGsCjsjkrDfhU6Xi5Cx_dz1H6RTyKXwHdNJe09j-uTkbP9R5Sw_EwyILNM46xOgkrOcm9XUmHRU9RN837iRY2AscEw6cUEyPFhMAn1UgrUwbFUQ4RWl71KymVE-_Ea0sy2J_8YLeO3GIda2sFyuZEzhUOvQci8xs79iEw_fySFbvwudjpBKgN37P_yg7n8BjjQ_mVyKJ2ssqac1Quw30apUF8JCXY9XejBJob7FkSHBg8AJtUyceyPGMOwpW-uXF_f8wlBhzd3",
    },
    product: {
      name: "Khẩu trang y tế 4 lớp",
      variant: "Hộp 50 cái",
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuBFYGUh9uOhyIEW5OzswwxnJIUc4qlv1ZZz2hc73rJzNZxu7jsTqn9Ku4VyhMEcnXZWljFiTsec_Gh_N8oIhjm1WgVCDPSxsSveQmrusptI8ycFPI6ZIUCVCZ4U_ezINDJUFw1hqqB8LV1HoQlqoOJA_Ayh4a-jJ5eSwtjEdMiRc2FwDKaOeUHxwaht2iJL0Jvff00_kDwueKd44DrqFLvdcxNhqxzUILRuC1ViUj8FW7JalVxDicm9goYNbyJ4AuxhJ9GpHYcrp7g_",
    },
    rating: 1,
    content: "Spam content hidden by admin.",
    date: "3 ngày trước",
    status: "hidden",
  },
  {
    id: "r-4",
    user: {
      name: "Phạm Thị D",
      email: "phamthid@gmail.com",
      avatar:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuAVzP8zW3XtIFS9m2ZqI9Zb11DLu19hxpv43o83BnC5w3XwzXS45ggczkLpCUOG1ggQ3WTv73LxmhuszlVer_AN7fxf7uwArS1qNCCq8Wtnj-sE2ize1BH4pQmxV_iGpDoncjA-aaP04tldKUHt-cAnnUtSoYL2prCazDqvvyX7t3ltxl53ebRZKVxt5dIr3D7y8bRehwsWsO_LRpKWBF-gljtCefTUBiyTvG3tozBT4gqwELGGjNw92QLDlVPXvl8pqm70oF5FhHVs",
    },
    product: {
      name: "Kem bôi da trị ngứa",
      variant: "Tuýp 15g",
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuCusl5Xw8TRy-kdNAeFz9TMZO5JOYH_NlWBMhpjopn9X8A-N8hJbbdZBmWBYojFtOHQmLElpwtLfq-p_WP9_Dvk-_-DFOsVmDHUG7olGq1WJbQGpuGmrJ_jp9zwsGpUTRwthKykmpbZ8BIVEM4WaLT4il21QyMv6_IXvmx6ygr6KZ8zYY04SfY_dIXNrebRvE8LKujIXJyyfxgaZCNDh_6kwcQ2M11cyRyRqsCKR3zqWAPopEcqv2oCHzuguqrsG8nkDHjRAfrG60mR",
    },
    rating: 5,
    content: "Hàng chính hãng, tư vấn nhiệt tình. 5 sao!",
    date: "4 ngày trước",
    status: "visible",
  },
];

const AdminReviewsPage = () => {
  const [reviews, setReviews] = useState(seedReviews);
  const [query, setQuery] = useState("");
  const [rating, setRating] = useState("all");
  const [status, setStatus] = useState("all");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return reviews.filter((r) => {
      const matchQuery =
        !q ||
        r.user.name.toLowerCase().includes(q) ||
        r.product.name.toLowerCase().includes(q) ||
        r.content.toLowerCase().includes(q);
      const matchRating = rating === "all" || r.rating === Number(rating);
      const matchStatus = status === "all" || r.status === status;
      return matchQuery && matchRating && matchStatus;
    });
  }, [reviews, query, rating, status]);

  const stats = useMemo(() => {
    const total = reviews.length;
    const average =
      reviews.reduce((sum, r) => sum + r.rating, 0) /
      Math.max(reviews.length, 1);
    const pending = reviews.filter(
      (r) => r.status === "pending" || r.status === "responded"
    ).length;
    return { total, average, pending };
  }, [reviews]);

  const handleToggle = (id) => {
    setReviews((prev) =>
      prev.map((r) =>
        r.id === id
          ? { ...r, status: r.status === "hidden" ? "visible" : "hidden" }
          : r
      )
    );
  };

  const handleReply = (item) => {
    if (item.status === "responded") return;
    alert(`Trả lời khách hàng ${item.user.name}`);
    setReviews((prev) =>
      prev.map((r) => (r.id === item.id ? { ...r, status: "responded" } : r))
    );
  };

  const handleDelete = (item) => {
    if (window.confirm(`Xóa đánh giá của ${item.user.name}?`)) {
      setReviews((prev) => prev.filter((r) => r.id !== item.id));
    }
  };

  return (
    <AdminLayout activeKey="reviews">
      <main className="flex-1 overflow-y-auto scrollbar-hide p-6 md:p-10 bg-background-light dark:bg-background-dark">
        <div className="max-w-[1100px] mx-auto flex flex-col gap-8">
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
                  onClick={() => alert("Xuất báo cáo (mock)")}
                >
                  <span className="material-symbols-outlined text-[20px]">
                    download
                  </span>
                  Xuất báo cáo
                </button>
              </div>
            </div>

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
              onQueryChange={setQuery}
              onRatingChange={setRating}
              onStatusChange={setStatus}
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
                      1
                    </span>{" "}
                    đến
                    <span className="font-medium text-[#0d141b] dark:text-white">
                      {" "}
                      {filtered.length}
                    </span>{" "}
                    trong số
                    <span className="font-medium text-[#0d141b] dark:text-white">
                      {" "}
                      {reviews.length}
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
                      type="button"
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm font-medium text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <span className="material-symbols-outlined text-[20px]">
                        chevron_left
                      </span>
                    </button>
                    <button
                      type="button"
                      className="z-10 bg-primary/10 border-primary text-primary relative inline-flex items-center px-4 py-2 border text-sm font-medium"
                    >
                      1
                    </button>
                    <button
                      type="button"
                      className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700 relative inline-flex items-center px-4 py-2 border text-sm font-medium"
                    >
                      2
                    </button>
                    <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm font-medium text-gray-700">
                      ...
                    </span>
                    <button
                      type="button"
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
