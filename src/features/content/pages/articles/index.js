import React, { useEffect, useMemo, useState } from "react";
import { NavLink } from "react-router-dom";
import Header from "../../../../shared/components/layout/Header";
import Footer from "../../../../shared/components/layout/Footer";
import PageTransition from "../../../../shared/components/ui/PageTransition";
import { usePosts } from "../../../../shared/hooks/queries/usePosts";
import { useTags } from "../../../../shared/hooks/queries/useTags"; // ✅ dùng hook riêng cho tags
import "../../../../app/styles/storefront-premium.css";

const ArticlesPage = () => {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [tag, setTag] = useState("all");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);

  useEffect(() => {
    const id = window.setTimeout(() => {
      setDebouncedQuery(query.trim());
    }, 400);
    return () => window.clearTimeout(id);
  }, [query]);

  useEffect(() => {
    setPage(1);
  }, [debouncedQuery, tag]);

  const queryParams = useMemo(() => {
    const params = {
      page,
      pageSize,
      sortBy: "publishedAt",
      sortDir: "desc",
    };
    const q = debouncedQuery.trim();
    if (q) params.q = q;
    if (tag !== "all") params.tag = tag;
    return params;
  }, [debouncedQuery, page, pageSize, tag]);

  const postsQuery = usePosts(queryParams);

  // ✅ Fix: gọi API tags riêng, không phụ thuộc vào items hiện tại
  const tagsQuery = useTags();

  const items = useMemo(
    () => postsQuery.data?.items || [],
    [postsQuery.data?.items],
  );
  const pagination = useMemo(
    () => postsQuery.data?.pagination || { page, pageSize, total: 0 },
    [page, pageSize, postsQuery.data?.pagination],
  );
  const loading = postsQuery.isLoading || postsQuery.isFetching;
  const error = postsQuery.error?.message || "";

  const totalPages = useMemo(() => {
    const total = pagination.total || 0;
    return Math.max(1, Math.ceil(total / (pagination.pageSize || pageSize)));
  }, [pagination.pageSize, pagination.total, pageSize]);

  // ✅ Fix: dùng currentPage nhất quán từ state, không lẫn với pagination.page
  const currentPage = pagination.page || page;

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  // ✅ Fix: tags lấy từ API, ổn định qua các trang
  const availableTags = useMemo(() => {
    const tagItems = tagsQuery.data || [];
    return [
      { key: "all", label: "Tất cả" },
      ...tagItems.map((t) => ({ key: t.slug, label: t.name })),
    ];
  }, [tagsQuery.data]);

  const featured = items[0];
  const rest = items.slice(1);
  const canPrev = currentPage > 1;
  const canNext = currentPage < totalPages;

  return (
    <PageTransition className="storefront-shell min-h-screen flex flex-col font-display text-slate-900 antialiased">
      <Header />

      <main className="storefront-container mx-auto w-full max-w-7xl flex-grow px-4 py-6 sm:px-6 lg:px-8">
        <section className="storefront-hero storefront-fade-up rounded-[34px] border border-white/70 px-5 py-8 sm:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <div className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-400">
              Kiến thức sức khỏe và bài viết y khoa
            </div>
            <h1 className="mt-3 text-4xl font-extrabold leading-tight text-slate-900">
              Bài viết sức khỏe và y khoa chính thống, được duyệt bởi dược sĩ
              chuyên môn
            </h1>
            <p className="mt-4 text-lg text-slate-600">
              Nội dung chính thống, dễ đọc và được trình bày đồng nhất với toàn
              bộ trải nghiệm
            </p>
          </div>

          <div className="mt-8 flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="relative w-full md:w-1/3">
              <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <span className="material-symbols-outlined text-[18px] text-slate-400">
                  search
                </span>
              </span>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="storefront-input block h-12 w-full pl-10 pr-3 text-sm"
                placeholder="Tìm kiếm bài viết, thuốc..."
                type="text"
              />
            </div>

            <div className="no-scrollbar flex w-full gap-2 overflow-x-auto pb-2 md:w-auto">
              {availableTags.map((category) => {
                const active = category.key === tag;
                return (
                  <button
                    key={category.key}
                    type="button"
                    onClick={() => setTag(category.key)}
                    className={
                      active
                        ? "rounded-full bg-slate-900 px-4 py-2 text-sm font-medium whitespace-nowrap text-white shadow-md"
                        : "storefront-pill rounded-full px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors hover:bg-primary hover:text-white"
                    }
                  >
                    {category.label}
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        <div className="mt-8 flex flex-col gap-8 lg:flex-row">
          <div className="lg:w-2/3">
            {loading ? (
              <div className="py-16 text-center text-slate-500">
                Đang tải bài viết...
              </div>
            ) : error ? (
              <div className="py-16 text-center text-rose-500">{error}</div>
            ) : !featured ? (
              // ✅ Fix: thêm empty state
              <div className="py-16 text-center text-slate-400">
                Không tìm thấy bài viết nào.
              </div>
            ) : (
              <section className="mb-12">
                <div className="storefront-card group relative flex flex-col overflow-hidden rounded-[30px] transition-all hover:-translate-y-1 md:flex-row">
                  <div className="h-64 overflow-hidden md:h-auto md:w-1/2">
                    <img
                      alt="Featured Post"
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      src={
                        featured.coverImageUrl || "https://placehold.co/600x400"
                      }
                    />
                  </div>
                  <div className="flex flex-col justify-center p-6 md:w-1/2 md:p-8">
                    <div className="mb-3 flex items-center gap-2">
                      <span className="storefront-pill rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider">
                        Nổi bật
                      </span>
                      <span className="flex items-center text-xs font-semibold text-emerald-600">
                        <span className="material-symbols-outlined mr-1 text-[16px]">
                          verified_user
                        </span>
                        Đã kiểm duyệt
                      </span>
                    </div>
                    <NavLink
                      to={`/posts/${featured.slug}`}
                      className="mb-4 text-2xl font-bold text-slate-900 transition-colors hover:text-primary"
                    >
                      {featured.title}
                    </NavLink>
                    <p className="mb-6 line-clamp-3 text-slate-600">
                      {featured.excerpt}
                    </p>
                    <div className="mt-auto flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 font-bold text-primary">
                          {featured.author?.displayName?.[0] || "D"}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-800">
                            {featured.author?.displayName || "Dược sĩ"}
                          </p>
                          <p className="text-xs text-slate-500">
                            {featured.publishedAt
                              ? new Date(
                                  featured.publishedAt,
                                ).toLocaleDateString("vi-VN")
                              : ""}
                          </p>
                        </div>
                      </div>
                      <span className="flex items-center text-xs text-slate-500">
                        <span className="material-symbols-outlined mr-1 text-[16px]">
                          schedule
                        </span>
                        {featured.readingMinutes} phút đọc
                      </span>
                    </div>
                  </div>
                </div>
              </section>
            )}

            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
              {rest.map((article) => (
                <div
                  key={article.id}
                  className="storefront-card flex flex-col overflow-hidden rounded-[26px] transition-all hover:-translate-y-1"
                >
                  <div className="relative h-48">
                    <img
                      alt={article.title}
                      className="h-full w-full object-cover"
                      src={
                        article.coverImageUrl || "https://placehold.co/600x400"
                      }
                    />
                    <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-[10px] font-bold uppercase text-primary backdrop-blur">
                      {article.tags?.[0]?.name || "Bài viết"}
                    </span>
                  </div>
                  <div className="flex flex-grow flex-col p-5">
                    <div className="mb-2 flex items-center text-[11px] font-bold text-emerald-600">
                      <span className="material-symbols-outlined mr-1 text-[16px]">
                        verified
                      </span>
                      DƯỢC SĨ KIỂM DUYỆT
                    </div>
                    <NavLink
                      to={`/posts/${article.slug}`}
                      className="mb-2 text-lg font-bold leading-tight text-slate-900 transition-colors hover:text-primary"
                    >
                      {article.title}
                    </NavLink>
                    <p className="mb-4 line-clamp-2 text-sm text-slate-600">
                      {article.excerpt}
                    </p>
                    <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-4">
                      <span className="text-xs font-medium text-slate-500">
                        {article.readingMinutes} phút đọc
                      </span>
                      <NavLink
                        to={`/posts/${article.slug}`}
                        className="flex items-center text-xs font-bold text-primary transition-transform hover:translate-x-1"
                      >
                        Chi tiết
                        <span className="material-symbols-outlined ml-1 text-[18px]">
                          chevron_right
                        </span>
                      </NavLink>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            <div className="mt-12 flex justify-center">
              <nav className="inline-flex gap-2">
                <button
                  type="button"
                  disabled={!canPrev}
                  className="grid h-10 w-10 place-items-center rounded-xl border border-slate-200 text-slate-600 transition-colors hover:bg-slate-50 disabled:opacity-50"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  <span className="material-symbols-outlined">
                    chevron_left
                  </span>
                </button>
                <button
                  type="button"
                  className="grid h-10 w-10 place-items-center rounded-xl bg-primary font-bold text-white"
                >
                  {currentPage}
                </button>
                <button
                  type="button"
                  disabled={!canNext}
                  className="grid h-10 w-10 place-items-center rounded-xl border border-slate-200 text-slate-600 transition-colors hover:bg-slate-50 disabled:opacity-50"
                  onClick={() => setPage((p) => p + 1)}
                >
                  <span className="material-symbols-outlined">
                    chevron_right
                  </span>
                </button>
              </nav>
            </div>
          </div>

          <aside className="space-y-8 lg:w-1/3">
            <div className="storefront-hero relative overflow-hidden rounded-[28px] p-6 shadow-xl shadow-sky-500/10">
              <div className="relative z-10">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/70 text-primary backdrop-blur">
                    <span className="material-symbols-outlined">
                      support_agent
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">
                    Hỏi ý kiến dược sĩ
                  </h3>
                </div>
                <p className="mb-6 text-sm leading-relaxed text-slate-600">
                  Nếu bạn cần tư vấn về thuốc hoặc tình trạng sức khỏe, đội ngũ
                  dược sĩ của chúng tôi luôn sẵn sàng hỗ trợ.
                </p>
                <NavLink
                  to="/chatbot"
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 py-3 font-bold text-white transition-colors hover:bg-primary"
                >
                  <span>Chat ngay bây giờ</span>
                  <span className="material-symbols-outlined text-[18px]">
                    send
                  </span>
                </NavLink>
              </div>
            </div>

            <div className="storefront-card rounded-[28px] p-6">
              <h3 className="mb-6 flex items-center gap-2 text-lg font-bold text-slate-900">
                <span className="material-symbols-outlined text-primary">
                  trending_up
                </span>
                Bài viết xem nhiều
              </h3>
              <div className="space-y-6">
                {items.slice(0, 5).map((post) => (
                  <NavLink
                    key={post.id}
                    to={`/posts/${post.slug}`}
                    className="flex gap-4 group"
                  >
                    <img
                      alt={post.title}
                      className="h-16 w-16 rounded-xl object-cover"
                      src={post.coverImageUrl || "https://placehold.co/160x160"}
                    />
                    <div>
                      <h4 className="line-clamp-2 text-sm font-semibold text-slate-800 transition-colors group-hover:text-primary">
                        {post.title}
                      </h4>
                      <p className="mt-1 text-[11px] text-slate-500">
                        {post.views} lượt xem
                      </p>
                    </div>
                  </NavLink>
                ))}
              </div>
            </div>

            <div className="storefront-soft-card rounded-[28px] border border-dashed border-slate-300 p-6">
              <h3 className="mb-2 text-md font-bold text-slate-900">
                Đăng ký nhận tin
              </h3>
              <p className="mb-4 text-sm text-slate-600">
                Nhận cập nhật những bài viết mới nhất về y khoa, thuốc và sức
                khỏe.
              </p>
              <div className="flex flex-col gap-3">
                <input
                  className="storefront-input h-11 w-full px-4 text-sm"
                  placeholder="Email của bạn"
                  type="email"
                />
                <button
                  type="button"
                  className="w-full rounded-xl bg-primary py-2.5 font-semibold text-white hover:bg-primary/90"
                >
                  Đăng ký
                </button>
              </div>
            </div>
          </aside>
        </div>
      </main>

      <Footer />
    </PageTransition>
  );
};

export default ArticlesPage;
