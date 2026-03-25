import React, { useEffect, useMemo, useState } from "react";
import { NavLink } from "react-router-dom";
import Header from "../../../components/Header";
import Footer from "../../../components/Footer";
import PageTransition from "../../../components/ui/PageTransition";
import { getPosts } from "../../../api/contentApi";

const ArticlesPage = () => {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [tag, setTag] = useState("all");
  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    total: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const id = window.setTimeout(() => {
      setDebouncedQuery(query.trim());
    }, 400);
    return () => window.clearTimeout(id);
  }, [query]);

  useEffect(() => {
    setPagination((p) => (p.page === 1 ? p : { ...p, page: 1 }));
  }, [debouncedQuery, tag]);

  const totalPages = useMemo(() => {
    const total = pagination.total || 0;
    return Math.max(1, Math.ceil(total / pagination.pageSize));
  }, [pagination.pageSize, pagination.total]);

  useEffect(() => {
    if (pagination.page > totalPages) {
      setPagination((p) => ({ ...p, page: totalPages }));
      return;
    }

    let active = true;
    const load = async () => {
      try {
        setLoading(true);
        setError("");
        const params = {
          page: pagination.page,
          pageSize: pagination.pageSize,
          sortBy: "publishedAt",
          sortDir: "desc",
        };
        if (debouncedQuery) {
          params.q = debouncedQuery;
        }
        if (tag !== "all") {
          params.tag = tag;
        }
        const data = await getPosts(params);
        if (!active) return;
        setItems(data.items || []);
        setPagination((p) => ({
          ...p,
          page: data.pagination?.page || p.page,
          pageSize: data.pagination?.pageSize || p.pageSize,
          total: data.pagination?.total || 0,
        }));
      } catch (err) {
        if (!active) return;
        setError(err.message || "Không thể tải bài viết");
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => {
      active = false;
    };
  }, [debouncedQuery, tag, pagination.page, pagination.pageSize, totalPages]);

  const availableTags = useMemo(() => {
    const tags = new Map();
    items.forEach((item) => {
      (item.tags || []).forEach((t) => {
        tags.set(t.slug, t.name);
      });
    });
    return [
      { key: "all", label: "Tất cả" },
      ...Array.from(tags.entries()).map(([slug, name]) => ({
        key: slug,
        label: name,
      })),
    ];
  }, [items]);

  const featured = items[0];
  const rest = items.slice(1);

  const canPrev = pagination.page > 1;
  const canNext = pagination.page < totalPages;

  return (
    <PageTransition className="bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100 min-h-screen flex flex-col antialiased">
      <Header />

      <header className="bg-white dark:bg-slate-900 pt-10 pb-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white mb-4 leading-tight">
              Bài viết sức khỏe
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-400">
              Cung cấp kiến thức y khoa chính thống, tin cậy và được kiểm duyệt
              bởi đội ngũ dược sĩ chuyên môn cao.
            </p>
          </div>

          <div className="mt-8 flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:w-1/3">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="material-symbols-outlined text-slate-400 text-[18px]">
                  search
                </span>
              </span>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                placeholder="Tìm kiếm bài viết, thuốc..."
                type="text"
              />
            </div>

            <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-2 no-scrollbar">
              {availableTags.map((c) => {
                const active = c.key === tag;
                return (
                  <button
                    key={c.key}
                    type="button"
                    onClick={() => setTag(c.key)}
                    className={
                      active
                        ? "bg-primary text-white px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap shadow-md shadow-primary/20"
                        : "bg-primary/10 text-primary dark:bg-primary/20 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap hover:bg-primary hover:text-white transition-colors"
                    }
                  >
                    {c.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-grow">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="lg:w-2/3">
            {loading ? (
              <div className="py-16 text-center text-slate-500">
                Đang tải bài viết...
              </div>
            ) : error ? (
              <div className="py-16 text-center text-rose-500">{error}</div>
            ) : featured ? (
              <section className="mb-12">
                <div className="group relative overflow-hidden bg-white dark:bg-slate-900 rounded-xl shadow-sm hover:shadow-xl transition-all border border-slate-100 dark:border-slate-800 flex flex-col md:flex-row">
                  <div className="md:w-1/2 overflow-hidden h-64 md:h-auto">
                    <img
                      alt="Featured Post"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      src={
                        featured.coverImageUrl || "https://placehold.co/600x400"
                      }
                    />
                  </div>
                  <div className="p-6 md:p-8 md:w-1/2 flex flex-col justify-center">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider px-2 py-1 rounded">
                        NỔI BẬT
                      </span>
                      <span className="flex items-center text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
                        <span className="material-symbols-outlined text-[16px] mr-1">
                          verified_user
                        </span>
                        Đã kiểm duyệt
                      </span>
                    </div>
                    <NavLink
                      to={`/posts/${featured.slug}`}
                      className="text-2xl font-bold text-slate-900 dark:text-white mb-4 hover:text-primary cursor-pointer transition-colors"
                    >
                      {featured.title}
                    </NavLink>
                    <p className="text-slate-600 dark:text-slate-400 mb-6 line-clamp-3">
                      {featured.excerpt}
                    </p>
                    <div className="flex items-center justify-between mt-auto">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                          {featured.author?.displayName?.[0] || "D"}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
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
                      <span className="text-xs text-slate-500 flex items-center">
                        <span className="material-symbols-outlined text-[16px] mr-1">
                          schedule
                        </span>
                        {featured.readingMinutes} phút đọc
                      </span>
                    </div>
                  </div>
                </div>
              </section>
            ) : null}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {rest.map((a) => (
                <div
                  key={a.id}
                  className="bg-white dark:bg-slate-900 rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all border border-slate-100 dark:border-slate-800 flex flex-col"
                >
                  <div className="relative h-48">
                    <img
                      alt={a.title}
                      className="w-full h-full object-cover"
                      src={a.coverImageUrl || "https://placehold.co/600x400"}
                    />
                    <span className="absolute top-4 left-4 bg-white/90 backdrop-blur px-2 py-1 rounded text-[10px] font-bold text-primary uppercase">
                      {(a.tags && a.tags[0]?.name) || "Bài viết"}
                    </span>
                  </div>
                  <div className="p-5 flex flex-col flex-grow">
                    <div className="flex items-center text-emerald-600 dark:text-emerald-400 text-[11px] font-bold mb-2">
                      <span className="material-symbols-outlined text-[16px] mr-1">
                        verified
                      </span>
                      DƯỢC SĨ KIỂM DUYỆT
                    </div>
                    <NavLink
                      to={`/posts/${a.slug}`}
                      className="text-lg font-bold text-slate-900 dark:text-white mb-2 leading-tight hover:text-primary transition-colors cursor-pointer"
                    >
                      {a.title}
                    </NavLink>
                    <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 mb-4">
                      {a.excerpt}
                    </p>
                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-50 dark:border-slate-800">
                      <span className="text-xs text-slate-500 font-medium">
                        {a.readingMinutes} phút đọc
                      </span>
                      <NavLink
                        to={`/posts/${a.slug}`}
                        className="text-primary text-xs font-bold flex items-center hover:translate-x-1 transition-transform"
                      >
                        CHI TIẾT
                        <span className="material-symbols-outlined text-[18px] ml-1">
                          chevron_right
                        </span>
                      </NavLink>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-12 flex justify-center">
              <nav className="inline-flex gap-2">
                <button
                  type="button"
                  disabled={!canPrev}
                  className="w-10 h-10 flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 disabled:opacity-50"
                  onClick={() =>
                    canPrev &&
                    setPagination((p) => ({
                      ...p,
                      page: Math.max(1, p.page - 1),
                    }))
                  }
                >
                  <span className="material-symbols-outlined">
                    chevron_left
                  </span>
                </button>
                <button
                  type="button"
                  className="w-10 h-10 flex items-center justify-center rounded-lg bg-primary text-white font-bold"
                >
                  {pagination.page}
                </button>
                <button
                  type="button"
                  disabled={!canNext}
                  className="w-10 h-10 flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 disabled:opacity-50"
                  onClick={() =>
                    canNext &&
                    setPagination((p) => ({
                      ...p,
                      page: p.page + 1,
                    }))
                  }
                >
                  <span className="material-symbols-outlined">
                    chevron_right
                  </span>
                </button>
              </nav>
            </div>
          </div>

          <aside className="lg:w-1/3 space-y-8">
            <div className="bg-gradient-to-br from-primary to-blue-700 rounded-2xl p-6 text-white shadow-xl shadow-primary/30 relative overflow-hidden group">
              <div className="absolute -right-4 -bottom-4 opacity-20 group-hover:scale-110 transition-transform duration-500">
                <span className="material-symbols-outlined text-[96px]">
                  chat_bubble
                </span>
              </div>
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur flex items-center justify-center">
                    <span className="material-symbols-outlined">
                      support_agent
                    </span>
                  </div>
                  <h3 className="text-xl font-bold">Hỏi ý kiến Dược sĩ</h3>
                </div>
                <p className="text-blue-50 mb-6 text-sm leading-relaxed">
                  Bạn cần tư vấn về thuốc hoặc tình trạng sức khỏe? Đội ngũ dược
                  sĩ của chúng tôi luôn sẵn sàng hỗ trợ bạn 24/7.
                </p>
                <NavLink
                  to="/chatbot"
                  className="w-full bg-white text-primary font-bold py-3 rounded-xl hover:bg-blue-50 transition-colors flex items-center justify-center gap-2"
                >
                  <span>Chat ngay bây giờ</span>
                  <span className="material-symbols-outlined text-[18px]">
                    send
                  </span>
                </NavLink>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">
                  trending_up
                </span>
                Bài viết xem nhiều
              </h3>
              <div className="space-y-6">
                {items.slice(0, 5).map((p) => (
                  <NavLink
                    key={p.id}
                    to={`/posts/${p.slug}`}
                    className="flex gap-4 group"
                  >
                    <img
                      alt={p.title}
                      className="w-16 h-16 rounded-lg object-cover"
                      src={p.coverImageUrl || "https://placehold.co/160x160"}
                    />
                    <div>
                      <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200 line-clamp-2 group-hover:text-primary transition-colors">
                        {p.title}
                      </h4>
                      <p className="text-[11px] text-slate-500 mt-1">
                        {p.views} lượt xem
                      </p>
                    </div>
                  </NavLink>
                ))}
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-6 border border-dashed border-slate-300 dark:border-slate-700">
              <h3 className="text-md font-bold text-slate-900 dark:text-white mb-2">
                Đăng ký nhận tin
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                Nhận cập nhật những bài viết mới nhất về y khoa, thuốc và sức
                khỏe.
              </p>
              <div className="flex flex-col gap-3">
                <input
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm"
                  placeholder="Email của bạn"
                  type="email"
                />
                <button
                  type="button"
                  className="w-full bg-primary text-white font-semibold py-2 rounded-lg hover:bg-primary/90"
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
