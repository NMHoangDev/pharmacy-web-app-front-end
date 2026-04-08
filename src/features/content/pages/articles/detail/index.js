import React, { useEffect, useMemo, useState } from "react";
import { NavLink, useParams } from "react-router-dom";
import Header from "../../../../../shared/components/layout/Header";
import Footer from "../../../../../shared/components/layout/Footer";
import PageTransition from "../../../../../shared/components/ui/PageTransition";
import {
  getAdminPostBySlug,
  getPostBySlug,
  incrementPostView,
} from "../../../api/contentApi";
import { resolveHtmlImagesToDataUrls } from "../../../../../shared/utils/media";

const ArticleDetailPage = ({ adminPreview = false }) => {
  const { slug } = useParams();
  const [progress, setProgress] = useState(0);
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [renderHtml, setRenderHtml] = useState("");

  useEffect(() => {
    const onScroll = () => {
      const doc = document.documentElement;
      const scrollTop = doc.scrollTop || document.body.scrollTop || 0;
      const scrollHeight = doc.scrollHeight - doc.clientHeight;
      const pct = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
      setProgress(Math.max(0, Math.min(100, pct)));
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  useEffect(() => {
    const load = async () => {
      if (!slug) return;
      try {
        setLoading(true);
        setError("");
        const data = adminPreview
          ? await getAdminPostBySlug(slug)
          : await getPostBySlug(slug);
        setPost(data || null);
        if (data?.id) {
          incrementPostView(data.id).catch(() => {});
        }
      } catch (err) {
        setError(err.message || "Không thể tải bài viết");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [adminPreview, slug]);

  const formattedDate = useMemo(() => {
    if (!post?.publishedAt) return "";
    return new Date(post.publishedAt).toLocaleDateString("vi-VN");
  }, [post?.publishedAt]);

  useEffect(() => {
    let active = true;
    const html = post?.contentHtml || "";
    if (!html) {
      setRenderHtml("");
      return () => {
        active = false;
      };
    }
    const resolveHtml = async () => {
      try {
        const resolved = await resolveHtmlImagesToDataUrls(html);
        if (active) setRenderHtml(resolved || html);
      } catch (err) {
        if (active) setRenderHtml(html);
      }
    };
    resolveHtml();
    return () => {
      active = false;
    };
  }, [post?.contentHtml]);

  if (!slug) {
    return (
      <PageTransition className="bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100 min-h-screen flex flex-col">
        {adminPreview ? null : <Header />}
        <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 flex-grow">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8">
            <h1 className="text-2xl font-extrabold mb-2">
              Không tìm thấy bài viết
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              Bài viết này không tồn tại hoặc đã bị gỡ.
            </p>
            <NavLink
              to={adminPreview ? "/admin/content" : "/posts"}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white font-semibold"
            >
              <span className="material-symbols-outlined text-[18px]">
                arrow_back
              </span>
              Về trang bài viết
            </NavLink>
          </div>
        </main>
        {adminPreview ? null : <Footer />}
      </PageTransition>
    );
  }

  if (loading) {
    return (
      <PageTransition className="bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100 min-h-screen flex flex-col">
        <Header />
        <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 flex-grow">
          <div className="text-center text-slate-500">Đang tải bài viết...</div>
        </main>
        {adminPreview ? null : <Footer />}
      </PageTransition>
    );
  }

  if (!post || error) {
    return (
      <PageTransition className="bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100 min-h-screen flex flex-col">
        <Header />
        <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 flex-grow">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8">
            <h1 className="text-2xl font-extrabold mb-2">
              Không tìm thấy bài viết
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              {error || "Bài viết này không tồn tại hoặc đã bị gỡ."}
            </p>
            <NavLink
              to={adminPreview ? "/admin/content" : "/posts"}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white font-semibold"
            >
              <span className="material-symbols-outlined text-[18px]">
                arrow_back
              </span>
              Về trang bài viết
            </NavLink>
          </div>
        </main>
        {adminPreview ? null : <Footer />}
      </PageTransition>
    );
  }

  return (
    <PageTransition className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 font-display min-h-screen flex flex-col">
      <div className="fixed top-0 left-0 w-full z-50">
        <div className="bg-primary h-1" style={{ width: `${progress}%` }} />
      </div>

      <Header />

      <div className="bg-amber-50 dark:bg-amber-950/30 border-b border-amber-200 dark:border-amber-800/50 py-3">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-center gap-2 text-amber-800 dark:text-amber-200 text-sm font-medium">
          <span className="material-symbols-outlined text-[18px]">warning</span>
          <span>
            Nội dung chỉ mang tính chất tham khảo y khoa. Luôn hỏi ý kiến bác sĩ
            trước khi áp dụng.
          </span>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 py-8 w-full flex-grow">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <aside className="hidden lg:block lg:col-span-3">
            <div className="sticky top-24 space-y-6">
              <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">
                    format_list_bulleted
                  </span>
                  Mục lục bài viết
                </h3>
                <nav className="space-y-3 text-sm">
                  {(post.toc || []).length ? (
                    post.toc.map((item, idx) => (
                      <a
                        key={item.id || idx}
                        className="block text-slate-600 dark:text-slate-400 hover:text-primary transition-colors"
                        href={`#${item.id}`}
                        style={{
                          paddingLeft: `${Math.max(0, item.level - 1) * 12}px`,
                        }}
                      >
                        {item.text}
                      </a>
                    ))
                  ) : (
                    <span className="text-slate-500">Chưa có mục lục.</span>
                  )}
                </nav>
              </div>

              <div className="bg-primary text-white p-6 rounded-xl shadow-lg relative overflow-hidden group">
                <div className="absolute -right-4 -bottom-4 opacity-20 group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-[96px]">
                    support_agent
                  </span>
                </div>
                <h4 className="text-xl font-bold mb-2">Cần tư vấn ngay?</h4>
                <p className="text-sm mb-4 opacity-90 leading-relaxed">
                  Dược sĩ của chúng tôi luôn sẵn sàng hỗ trợ bạn 24/7 về liều
                  lượng và cách dùng.
                </p>
                <NavLink
                  to={adminPreview ? "/admin/content" : "/chatbot"}
                  className="bg-white text-primary w-full py-2.5 rounded-lg font-bold hover:bg-slate-100 transition-colors flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    chat
                  </span>
                  Hỏi Dược Sĩ Ngay
                </NavLink>
              </div>
            </div>
          </aside>

          <section className="lg:col-span-9 space-y-6">
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
              <div className="flex flex-wrap items-center gap-2 mb-4">
                {(post.tags || []).map((t) => (
                  <span
                    key={t.id}
                    className="px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-500 text-[11px] font-medium rounded uppercase"
                  >
                    {t.name}
                  </span>
                ))}
              </div>
              <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-2">
                {post.title}
              </h1>
              <p className="text-sm text-slate-500 mb-6">
                {post.author?.displayName || "Dược sĩ"} • {formattedDate} •{" "}
                {post.views} lượt xem
              </p>
              <div
                className="prose dark:prose-invert max-w-none post-content"
                dangerouslySetInnerHTML={{ __html: renderHtml || "" }}
              />
              {post.disclaimer ? (
                <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl text-sm text-slate-600 dark:text-slate-300">
                  {post.disclaimer}
                </div>
              ) : null}
            </div>

            {post.relatedPosts && post.relatedPosts.length ? (
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
                  Bài viết liên quan
                </h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  {post.relatedPosts.map((r) => (
                    <NavLink
                      key={r.id}
                      to={`/posts/${r.slug}`}
                      className="block p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl hover:border-primary/40 border border-transparent"
                    >
                      <p className="font-semibold text-slate-900 dark:text-white mb-1">
                        {r.title}
                      </p>
                      <p className="text-xs text-slate-500">{r.excerpt}</p>
                    </NavLink>
                  ))}
                </div>
              </div>
            ) : null}
          </section>
        </div>
      </main>

      {adminPreview ? null : <Footer />}
    </PageTransition>
  );
};

export default ArticleDetailPage;
