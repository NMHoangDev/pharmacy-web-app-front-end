import React, { useEffect, useMemo, useState } from "react";
import { NavLink, useParams } from "react-router-dom";
import Header from "../../../../components/Header";
import Footer from "../../../../components/Footer";
import PageTransition from "../../../../components/ui/PageTransition";
import { createAnswer, getQuestionBySlug } from "../../../../api/contentApi";

const ForumDetailPage = () => {
  const { slug } = useParams();
  const [tab, setTab] = useState("discussion");
  const [detail, setDetail] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [answerPage, setAnswerPage] = useState(1);
  const [answerPagination, setAnswerPagination] = useState({
    page: 1,
    pageSize: 10,
    total: 0,
  });
  const [answerText, setAnswerText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const loadDetail = async () => {
      if (!slug) return;
      try {
        setLoading(true);
        setError("");
        const data = await getQuestionBySlug(slug, {
          answerPage,
          answerPageSize: 10,
          sortAnswersBy: "best",
        });
        setDetail(data || null);
        const pageData = data?.answers || { items: [], pagination: null };
        setAnswers(pageData.items || []);
        setAnswerPagination(
          pageData.pagination || { page: 1, pageSize: 10, total: 0 },
        );
      } catch (err) {
        setError(err.message || "Không thể tải câu hỏi");
      } finally {
        setLoading(false);
      }
    };
    loadDetail();
  }, [slug, answerPage]);

  const formattedCreatedAt = useMemo(() => {
    if (!detail?.createdAt) return "";
    return new Date(detail.createdAt).toLocaleString("vi-VN");
  }, [detail?.createdAt]);

  const handleSubmitAnswer = async () => {
    if (!detail?.id) return;
    if (!answerText.trim()) {
      setSubmitError("Vui lòng nhập nội dung câu trả lời.");
      return;
    }
    try {
      setSubmitting(true);
      setSubmitError("");
      await createAnswer(detail.id, { content: answerText.trim() });
      setAnswerText("");
      setAnswerPage(1);
      const refreshed = await getQuestionBySlug(slug, {
        answerPage: 1,
        answerPageSize: 10,
        sortAnswersBy: "best",
      });
      setDetail(refreshed || null);
      const pageData = refreshed?.answers || { items: [], pagination: null };
      setAnswers(pageData.items || []);
      setAnswerPagination(
        pageData.pagination || { page: 1, pageSize: 10, total: 0 },
      );
    } catch (err) {
      setSubmitError(err.message || "Không thể gửi câu trả lời.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!slug) {
    return (
      <PageTransition className="bg-background-light dark:bg-background-dark min-h-screen flex flex-col">
        <Header />
        <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full flex-grow">
          <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
            <p className="text-slate-600 dark:text-slate-400">
              Không tìm thấy bài viết.
            </p>
            <NavLink to="/forum" className="text-primary font-semibold">
              Quay lại diễn đàn
            </NavLink>
          </div>
        </main>
        <Footer />
      </PageTransition>
    );
  }

  if (loading) {
    return (
      <PageTransition className="bg-background-light dark:bg-background-dark min-h-screen flex flex-col">
        <Header />
        <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full flex-grow">
          <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
            <p className="text-slate-600 dark:text-slate-400">Đang tải...</p>
          </div>
        </main>
        <Footer />
      </PageTransition>
    );
  }

  if (error || !detail) {
    return (
      <PageTransition className="bg-background-light dark:bg-background-dark min-h-screen flex flex-col">
        <Header />
        <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full flex-grow">
          <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
            <p className="text-slate-600 dark:text-slate-400">
              {error || "Không tìm thấy bài viết."}
            </p>
            <NavLink to="/forum" className="text-primary font-semibold">
              Quay lại diễn đàn
            </NavLink>
          </div>
        </main>
        <Footer />
      </PageTransition>
    );
  }

  return (
    <PageTransition className="bg-background-light dark:bg-background-dark text-slate-800 dark:text-slate-200 font-display min-h-screen flex flex-col">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-grow">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1 space-y-6">
            <div className="flex items-center gap-3">
              <NavLink
                to="/forum"
                className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-primary"
              >
                <span className="material-symbols-outlined text-[18px]">
                  arrow_back
                </span>
                Quay lại
              </NavLink>
              <div className="ml-auto flex items-center gap-2">
                <button
                  type="button"
                  className="p-2 rounded-lg text-slate-500 hover:text-primary hover:bg-primary/10"
                  aria-label="Chia sẻ"
                >
                  <span className="material-symbols-outlined">share</span>
                </button>
                <button
                  type="button"
                  className="p-2 rounded-lg text-slate-500 hover:text-primary hover:bg-primary/10"
                  aria-label="Lưu"
                >
                  <span className="material-symbols-outlined">bookmark</span>
                </button>
              </div>
            </div>

            <section className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-slate-900 dark:text-white leading-snug">
                    {detail.title}
                  </h1>
                  <p className="text-sm text-slate-500 mt-2">
                    Đăng bởi{" "}
                    <span className="font-semibold text-slate-700 dark:text-slate-200">
                      {detail.asker?.displayName || "Ẩn danh"}
                    </span>{" "}
                    • {formattedCreatedAt}
                  </p>
                </div>
                <div className="hidden sm:flex items-center gap-2">
                  {(detail.tags || []).map((t) => (
                    <span
                      key={t.id}
                      className="px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-500 text-[11px] font-medium rounded uppercase"
                    >
                      {t.name}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-4 text-slate-700 dark:text-slate-300 leading-relaxed">
                {detail.content}
              </div>

              <div className="mt-5 flex flex-wrap items-center gap-3">
                <NavLink
                  to="/chatbot"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl font-semibold shadow-lg shadow-primary/20 hover:bg-primary/90"
                >
                  <span className="material-symbols-outlined">smart_toy</span>
                  Hỏi nhanh AI
                </NavLink>
                <button
                  type="button"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-xl font-semibold hover:bg-slate-200 dark:hover:bg-slate-700"
                >
                  <span className="material-symbols-outlined">flag</span>
                  Báo cáo
                </button>
              </div>
            </section>

            <section className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-4">
                {[
                  { key: "discussion", label: "Thảo luận", icon: "chat" },
                  { key: "related", label: "Câu hỏi liên quan", icon: "link" },
                ].map((t) => {
                  const active = tab === t.key;
                  return (
                    <button
                      key={t.key}
                      type="button"
                      onClick={() => setTab(t.key)}
                      className={
                        active
                          ? "inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-primary text-white text-sm font-semibold"
                          : "inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-sm font-semibold hover:bg-slate-200 dark:hover:bg-slate-700"
                      }
                    >
                      <span className="material-symbols-outlined text-[18px]">
                        {t.icon}
                      </span>
                      {t.label}
                    </button>
                  );
                })}
              </div>

              {tab === "discussion" ? (
                <div className="space-y-4">
                  {answers.length ? (
                    answers.map((c) => (
                      <div
                        key={c.id}
                        className="p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-sm font-bold text-slate-900 dark:text-white">
                              {c.author?.displayName || "Ẩn danh"}
                            </p>
                            <p className="text-xs text-slate-500">
                              {c.createdAt
                                ? new Date(c.createdAt).toLocaleString("vi-VN")
                                : ""}
                            </p>
                          </div>
                          {c.isBestAnswer ? (
                            <span className="text-xs font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                              Câu trả lời tốt nhất
                            </span>
                          ) : null}
                        </div>
                        <p className="mt-3 text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                          {c.content}
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className="text-sm text-slate-600 dark:text-slate-400">
                      Chưa có trả lời. Hãy là người đầu tiên thảo luận.
                    </div>
                  )}

                  <div className="flex items-center justify-center pt-2">
                    <nav className="flex items-center gap-1">
                      <button
                        type="button"
                        className="p-2 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-all"
                        onClick={() => setAnswerPage((p) => Math.max(1, p - 1))}
                      >
                        <span className="material-symbols-outlined">
                          chevron_left
                        </span>
                      </button>
                      <button
                        type="button"
                        className="w-10 h-10 bg-primary text-white font-bold rounded-lg shadow-md shadow-primary/20"
                      >
                        {answerPagination.page}
                      </button>
                      <button
                        type="button"
                        className="p-2 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-all"
                        onClick={() => setAnswerPage((p) => p + 1)}
                      >
                        <span className="material-symbols-outlined">
                          chevron_right
                        </span>
                      </button>
                    </nav>
                  </div>

                  <div className="pt-2">
                    <textarea
                      rows={4}
                      value={answerText}
                      onChange={(e) => setAnswerText(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                      placeholder="Viết câu trả lời của bạn..."
                    />
                    {submitError ? (
                      <p className="mt-2 text-sm text-rose-500">
                        {submitError}
                      </p>
                    ) : null}
                    <div className="mt-3 flex items-center justify-end">
                      <button
                        type="button"
                        onClick={handleSubmitAnswer}
                        disabled={submitting}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90 disabled:opacity-60"
                      >
                        <span className="material-symbols-outlined text-[18px]">
                          send
                        </span>
                        {submitting ? "Đang gửi..." : "Gửi câu trả lời"}
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-sm text-slate-600 dark:text-slate-400">
                  Chưa có câu hỏi liên quan.
                </div>
              )}
            </section>
          </div>

          <aside className="w-full lg:w-80 space-y-6 flex-shrink-0">
            <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl p-5">
              <h3 className="font-bold text-slate-900 dark:text-white mb-4">
                Hướng dẫn nhanh
              </h3>
              <div className="space-y-3 text-sm text-slate-600 dark:text-slate-400">
                {[
                  "Nêu rõ độ tuổi/cân nặng (nếu là trẻ em)",
                  "Liệt kê thuốc đang dùng + bệnh nền",
                  "Mô tả triệu chứng + thời điểm bắt đầu",
                  "Không chia sẻ thông tin cá nhân nhạy cảm",
                ].map((x) => (
                  <div key={x} className="flex items-start gap-2">
                    <span className="material-symbols-outlined text-primary text-[18px]">
                      check_circle
                    </span>
                    <span>{x}</span>
                  </div>
                ))}
              </div>
              <NavLink
                to="/chatbot"
                className="mt-5 inline-flex w-full items-center justify-center gap-2 px-4 py-2 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90"
              >
                <span className="material-symbols-outlined">smart_toy</span>
                Hỏi AI ngay
              </NavLink>
            </div>

            <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
              <div className="flex gap-2 text-yellow-600 dark:text-yellow-400 mb-2">
                <span className="material-symbols-outlined text-[18px]">
                  warning
                </span>
                <span className="text-xs font-bold uppercase">Khẩn cấp</span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-normal">
                Nếu có dấu hiệu nguy hiểm (khó thở, lơ mơ, co giật, đau
                ngực,...) hãy gọi 115 hoặc tới cơ sở y tế gần nhất.
              </p>
            </div>
          </aside>
        </div>
      </main>

      <Footer />
    </PageTransition>
  );
};

export default ForumDetailPage;
