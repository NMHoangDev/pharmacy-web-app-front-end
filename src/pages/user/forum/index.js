import React, { useEffect, useMemo, useState } from "react";
import Header from "../../../components/Header";
import Footer from "../../../components/Footer";
import PageTransition from "../../../components/ui/PageTransition";
import {
  createAnswer,
  createQuestion,
  getQuestionBySlug,
  getQuestions,
  getTags,
} from "../../../api/contentApi";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../../../components/ui/dialog";

const ForumPage = () => {
  const [filter, setFilter] = useState("all");
  const [sort, setSort] = useState("newest");
  const [questions, setQuestions] = useState([]);
  const [tags, setTags] = useState([]);
  const [refreshTick, setRefreshTick] = useState(0);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    total: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [selectedTags, setSelectedTags] = useState([]);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [urgency, setUrgency] = useState("NORMAL");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState("");
  const [detailDialog, setDetailDialog] = useState({
    open: false,
    question: null,
    answers: [],
    pagination: { page: 1, pageSize: 10, total: 0 },
    loading: false,
    error: "",
  });
  const [detailAnswerText, setDetailAnswerText] = useState("");
  const [detailSubmitError, setDetailSubmitError] = useState("");
  const [detailSubmitting, setDetailSubmitting] = useState(false);

  useEffect(() => {
    const loadTags = async () => {
      try {
        const data = await getTags({ type: "THREAD" });
        setTags(data || []);
      } catch {
        setTags([]);
      }
    };
    loadTags();
  }, []);

  useEffect(() => {
    const loadQuestions = async () => {
      try {
        setLoading(true);
        setError("");
        const params = {
          page: pagination.page,
          pageSize: pagination.pageSize,
          sortBy:
            sort === "popular"
              ? "answerCount"
              : sort === "urgent"
                ? "lastActivityAt"
                : "createdAt",
          sortDir: "desc",
        };
        if (filter === "answered") params.hasPharmacistAnswer = true;
        if (filter === "unanswered") params.hasPharmacistAnswer = false;
        const data = await getQuestions(params);
        setQuestions(data.items || []);
        setPagination(data.pagination || { page: 1, pageSize: 10, total: 0 });
      } catch (err) {
        setError(err.message || "Không thể tải câu hỏi");
      } finally {
        setLoading(false);
      }
    };
    loadQuestions();
  }, [filter, sort, pagination.page, pagination.pageSize, refreshTick]);

  const toggleTag = (slug) => {
    setSelectedTags((prev) =>
      prev.includes(slug) ? prev.filter((t) => t !== slug) : [...prev, slug],
    );
  };

  const handleSubmitQuestion = async () => {
    if (!title.trim() || !content.trim()) {
      setSubmitError("Vui lòng nhập tiêu đề và nội dung câu hỏi.");
      return;
    }
    try {
      setSubmitting(true);
      setSubmitError("");
      setSubmitSuccess("");
      await createQuestion({
        title: title.trim(),
        content: content.trim(),
        isAnonymous,
        tags: selectedTags,
        context: {
          age: null,
          gender: null,
          isPregnant: null,
          isBreastfeeding: null,
          allergies: null,
          conditions: [],
          currentMedications: [],
          urgency,
        },
      });
      setTitle("");
      setContent("");
      setSelectedTags([]);
      setIsAnonymous(false);
      setUrgency("NORMAL");
      setPagination((p) => ({ ...p, page: 1 }));
      setRefreshTick((v) => v + 1);
      setSubmitSuccess("Đã gửi câu hỏi. Câu hỏi sẽ hiển thị sau khi duyệt.");
      setShowForm(false);
    } catch (err) {
      setSubmitError(err.message || "Không thể gửi câu hỏi.");
    } finally {
      setSubmitting(false);
    }
  };

  const visible = useMemo(() => questions, [questions]);

  const formatTime = (value) =>
    value ? new Date(value).toLocaleString("vi-VN") : "";

  const openDetailDialog = async (question) => {
    if (!question?.slug) return;
    setDetailDialog({
      open: true,
      question,
      answers: [],
      pagination: { page: 1, pageSize: 10, total: 0 },
      loading: true,
      error: "",
    });
    setDetailAnswerText("");
    setDetailSubmitError("");
    try {
      const data = await getQuestionBySlug(question.slug, {
        answerPage: 1,
        answerPageSize: 10,
        sortAnswersBy: "newest",
      });
      const pageData = data?.answers || { items: [], pagination: null };
      setDetailDialog((prev) => ({
        ...prev,
        question: data,
        answers: pageData.items || [],
        pagination: pageData.pagination || { page: 1, pageSize: 10, total: 0 },
        loading: false,
      }));
    } catch (err) {
      setDetailDialog((prev) => ({
        ...prev,
        loading: false,
        error: err.message || "Không thể tải câu hỏi",
      }));
    }
  };

  const handleSubmitDetailAnswer = async () => {
    if (!detailDialog.question?.id) return;
    if (!detailAnswerText.trim()) {
      setDetailSubmitError("Vui lòng nhập nội dung câu trả lời.");
      return;
    }
    try {
      setDetailSubmitting(true);
      setDetailSubmitError("");
      await createAnswer(detailDialog.question.id, {
        content: detailAnswerText.trim(),
      });
      setDetailAnswerText("");
      const refreshed = await getQuestionBySlug(detailDialog.question.slug, {
        answerPage: 1,
        answerPageSize: 10,
        sortAnswersBy: "newest",
      });
      const pageData = refreshed?.answers || { items: [], pagination: null };
      setDetailDialog((prev) => ({
        ...prev,
        question: refreshed,
        answers: pageData.items || [],
        pagination: pageData.pagination || prev.pagination,
        loading: false,
      }));
      setQuestions((prev) =>
        prev.map((q) =>
          q.id === detailDialog.question.id
            ? { ...q, answerCount: (q.answerCount || 0) + 1 }
            : q,
        ),
      );
    } catch (err) {
      setDetailSubmitError(err.message || "Không thể gửi câu trả lời.");
    } finally {
      setDetailSubmitting(false);
    }
  };

  const loadMoreAnswers = async () => {
    if (!detailDialog.question?.slug || detailDialog.loading) return;
    const nextPage = (detailDialog.pagination?.page || 1) + 1;
    setDetailDialog((prev) => ({ ...prev, loading: true }));
    try {
      const data = await getQuestionBySlug(detailDialog.question.slug, {
        answerPage: nextPage,
        answerPageSize: detailDialog.pagination?.pageSize || 10,
        sortAnswersBy: "newest",
      });
      const pageData = data?.answers || { items: [], pagination: null };
      setDetailDialog((prev) => ({
        ...prev,
        answers: [...prev.answers, ...(pageData.items || [])],
        pagination: pageData.pagination || prev.pagination,
        loading: false,
      }));
    } catch (err) {
      setDetailDialog((prev) => ({
        ...prev,
        loading: false,
        error: err.message || "Không thể tải thêm câu trả lời",
      }));
    }
  };

  return (
    <PageTransition className="bg-background-light dark:bg-background-dark text-slate-800 dark:text-slate-200 font-display min-h-screen flex flex-col">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-grow">
        <div className="flex flex-col lg:flex-row gap-8">
          <aside className="w-full lg:w-64 space-y-6 flex-shrink-0">
            <div>
              <button
                type="button"
                onClick={() => setShowForm((v) => !v)}
                className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-3 px-4 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-primary/20 transition-all active:scale-[0.98]"
              >
                <span className="material-symbols-outlined">add_circle</span>
                Đặt câu hỏi mới
              </button>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 px-2">
                Phân loại
              </h3>
              <nav className="space-y-1">
                {[
                  { key: "all", label: "Tất cả câu hỏi", icon: "forum" },
                  {
                    key: "answered",
                    label: "Dược sĩ đã trả lời",
                    icon: "verified",
                  },
                  {
                    key: "urgent",
                    label: "Hoạt động gần đây",
                    icon: "priority_high",
                  },
                  {
                    key: "unanswered",
                    label: "Chưa có câu trả lời",
                    icon: "pending_actions",
                  },
                ].map((x) => {
                  const active = filter === x.key;
                  return (
                    <button
                      key={x.key}
                      type="button"
                      onClick={() => setFilter(x.key)}
                      className={
                        active
                          ? "w-full flex items-center gap-3 px-3 py-2 rounded-lg bg-primary/10 text-primary font-medium"
                          : "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors"
                      }
                    >
                      <span className="material-symbols-outlined text-[20px]">
                        {x.icon}
                      </span>
                      {x.label}
                    </button>
                  );
                })}
              </nav>
            </div>

            <div className="pt-6 border-t border-slate-200 dark:border-slate-800">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 px-2 mb-4">
                Nhóm thuốc phổ biến
              </h3>
              <div className="flex flex-wrap gap-2 px-2">
                {tags.map((t) => (
                  <span
                    key={t.id}
                    className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-xs font-medium rounded-full cursor-pointer hover:bg-primary/20 hover:text-primary transition-colors"
                  >
                    {t.name}
                  </span>
                ))}
              </div>
            </div>
          </aside>

          <div className="flex-1 space-y-6">
            {showForm ? (
              <section className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                    Đặt câu hỏi mới
                  </h2>
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="text-slate-400 hover:text-primary"
                  >
                    <span className="material-symbols-outlined">close</span>
                  </button>
                </div>

                <div className="space-y-3">
                  <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                    placeholder="Tiêu đề câu hỏi"
                  />
                  <textarea
                    rows={5}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                    placeholder="Mô tả chi tiết câu hỏi của bạn..."
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    {tags.map((t) => {
                      const active = selectedTags.includes(t.slug);
                      return (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => toggleTag(t.slug)}
                          className={
                            active
                              ? "px-3 py-1 rounded-full text-xs font-semibold bg-primary text-white"
                              : "px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-500"
                          }
                        >
                          {t.name}
                        </button>
                      );
                    })}
                  </div>
                  <div className="flex flex-wrap items-center gap-4 text-sm">
                    <label className="inline-flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={isAnonymous}
                        onChange={(e) => setIsAnonymous(e.target.checked)}
                        className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary"
                      />
                      Ẩn danh
                    </label>
                    <select
                      value={urgency}
                      onChange={(e) => setUrgency(e.target.value)}
                      className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-sm"
                    >
                      <option value="NORMAL">Bình thường</option>
                      <option value="URGENT">Khẩn cấp</option>
                      <option value="LOW">Tham khảo</option>
                    </select>
                  </div>
                </div>

                {submitError ? (
                  <p className="text-sm text-rose-500">{submitError}</p>
                ) : null}
                {submitSuccess ? (
                  <p className="text-sm text-emerald-500">{submitSuccess}</p>
                ) : null}

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handleSubmitQuestion}
                    disabled={submitting}
                    className="bg-primary text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-primary/90 disabled:opacity-60"
                  >
                    {submitting ? "Đang gửi..." : "Gửi câu hỏi"}
                  </button>
                </div>
              </section>
            ) : null}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                Diễn đàn hỏi đáp
              </h1>
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-500 dark:text-slate-400">
                  Sắp xếp:
                </span>
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  className="bg-transparent border-none text-sm font-medium focus:ring-0 text-primary cursor-pointer"
                >
                  <option value="newest">Mới nhất</option>
                  <option value="popular">Quan tâm nhất</option>
                  <option value="urgent">Hoạt động gần đây</option>
                </select>
              </div>
            </div>

            <div className="space-y-4">
              {loading ? (
                <div className="text-center text-slate-500 py-10">
                  Đang tải câu hỏi...
                </div>
              ) : error ? (
                <div className="text-center text-rose-500 py-10">{error}</div>
              ) : (
                visible.map((q) => (
                  <button
                    key={q.id}
                    type="button"
                    onClick={() => openDetailDialog(q)}
                    className="group block text-left bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 hover:border-primary/50 dark:hover:border-primary/50 rounded-xl p-5 transition-all shadow-sm hover:shadow-md w-full"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        {q.hasPharmacistAnswer ? (
                          <span className="bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded flex items-center gap-1">
                            <span className="material-symbols-outlined text-[14px]">
                              verified
                            </span>
                            Dược sĩ đã trả lời
                          </span>
                        ) : null}

                        <span className="text-xs text-slate-400">
                          Đăng bởi{" "}
                          <span className="font-medium text-slate-600 dark:text-slate-300">
                            {q.asker?.displayName || "Ẩn danh"}
                          </span>{" "}
                          • {formatTime(q.createdAt)}
                        </span>
                      </div>

                      <button
                        type="button"
                        className="text-slate-400 hover:text-primary"
                        onClick={(e) => {
                          e.stopPropagation();
                        }}
                        aria-label="Bookmark"
                      >
                        <span className="material-symbols-outlined text-[20px]">
                          bookmark_border
                        </span>
                      </button>
                    </div>

                    <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2 group-hover:text-primary transition-colors">
                      {q.title}
                    </h2>
                    <p className="text-slate-600 dark:text-slate-400 text-sm line-clamp-2 mb-4 leading-relaxed">
                      {q.excerpt}
                    </p>

                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div className="flex flex-wrap gap-2">
                        {(q.tags || []).map((t) => (
                          <span
                            key={t.id}
                            className="px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-500 text-[11px] font-medium rounded uppercase"
                          >
                            {t.name}
                          </span>
                        ))}
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="flex items-center gap-1.5 text-slate-500 text-sm">
                          <span className="material-symbols-outlined text-[18px]">
                            forum
                          </span>
                          {`${q.answerCount} câu trả lời`}
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-500 text-sm">
                          <span className="material-symbols-outlined text-[18px]">
                            schedule
                          </span>
                          {formatTime(q.lastActivityAt)}
                        </div>
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>

            <div className="flex items-center justify-center pt-8">
              <nav className="flex items-center gap-1">
                <button
                  type="button"
                  className="p-2 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-all"
                  onClick={() =>
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
                  className="w-10 h-10 bg-primary text-white font-bold rounded-lg shadow-md shadow-primary/20"
                >
                  {pagination.page}
                </button>
                <button
                  type="button"
                  className="p-2 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-all"
                  onClick={() =>
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

          <aside className="hidden xl:block w-72 space-y-6 flex-shrink-0">
            <div className="bg-gradient-to-br from-primary to-blue-700 rounded-2xl p-6 text-white shadow-xl shadow-primary/20">
              <h3 className="font-bold text-lg mb-4">Thống kê cộng đồng</h3>
              <div className="space-y-4">
                {[
                  { label: "Dược sĩ trực tuyến", value: 24 },
                  { label: "Câu hỏi hôm nay", value: 142 },
                  { label: "Tỷ lệ trả lời", value: "98%" },
                ].map((x) => (
                  <div
                    key={x.label}
                    className="flex items-center justify-between"
                  >
                    <span className="text-blue-100 text-sm">{x.label}</span>
                    <span className="font-bold">{x.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl p-5">
              <h3 className="font-bold text-slate-900 dark:text-white mb-4">
                Dược sĩ nổi bật
              </h3>
              <div className="space-y-4">
                {[
                  {
                    name: "DS. Nguyễn Thị Minh",
                    count: "2.4k câu trả lời",
                  },
                  {
                    name: "DS. Trần Văn Nam",
                    count: "1.8k câu trả lời",
                  },
                ].map((x) => (
                  <div key={x.name} className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden" />
                    <div>
                      <p className="text-sm font-bold text-slate-900 dark:text-white">
                        {x.name}
                      </p>
                      <p className="text-[11px] text-slate-500">{x.count}</p>
                    </div>
                    <span className="ml-auto material-symbols-outlined text-primary text-[18px]">
                      verified
                    </span>
                  </div>
                ))}
              </div>
              <button
                type="button"
                className="w-full mt-4 py-2 text-xs font-semibold text-primary hover:bg-primary/10 rounded-lg transition-colors"
              >
                Xem tất cả chuyên gia
              </button>
            </div>

            <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
              <div className="flex gap-2 text-yellow-600 dark:text-yellow-400 mb-2">
                <span className="material-symbols-outlined text-[18px]">
                  warning
                </span>
                <span className="text-xs font-bold uppercase">
                  Lưu ý quan trọng
                </span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-normal">
                Mọi thông tin trên diễn đàn chỉ mang tính chất tham khảo. Trong
                trường hợp khẩn cấp, vui lòng liên hệ ngay cơ sở y tế gần nhất
                hoặc gọi 115.
              </p>
            </div>
          </aside>
        </div>
      </main>

      <Footer />

      <Dialog
        open={detailDialog.open}
        onOpenChange={(open) =>
          setDetailDialog((prev) => ({ ...prev, open, error: "" }))
        }
      >
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {detailDialog.question?.title || "Chi tiết câu hỏi"}
            </DialogTitle>
            <DialogDescription>
              {detailDialog.question?.createdAt
                ? new Date(detailDialog.question.createdAt).toLocaleString(
                    "vi-VN",
                  )
                : ""}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="text-sm text-slate-600 dark:text-slate-300">
              {detailDialog.question?.content}
            </div>
            {detailDialog.error ? (
              <div className="text-sm text-rose-500">{detailDialog.error}</div>
            ) : null}
            <div className="space-y-3">
              {detailDialog.answers.length ? (
                detailDialog.answers.map((a) => (
                  <div
                    key={a.id}
                    className="flex gap-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 p-3"
                  >
                    <div className="h-9 w-9 rounded-full bg-slate-200 dark:bg-slate-700" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">
                          {a.author?.displayName || "Ẩn danh"}
                        </p>
                        <span className="text-xs text-slate-400">
                          {a.createdAt
                            ? new Date(a.createdAt).toLocaleString("vi-VN")
                            : ""}
                        </span>
                      </div>
                      <p className="text-sm text-slate-700 dark:text-slate-300 mt-1">
                        {a.content}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-500">Chưa có câu trả lời.</p>
              )}
            </div>
            {detailDialog.pagination?.total > detailDialog.answers.length ? (
              <button
                type="button"
                onClick={loadMoreAnswers}
                disabled={detailDialog.loading}
                className="w-full py-2 text-sm font-semibold text-primary hover:bg-primary/10 rounded-lg"
              >
                {detailDialog.loading ? "Đang tải..." : "Xem thêm"}
              </button>
            ) : null}

            <div className="pt-2">
              <textarea
                rows={3}
                value={detailAnswerText}
                onChange={(e) => setDetailAnswerText(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                placeholder="Viết bình luận của bạn..."
              />
              {detailSubmitError ? (
                <p className="mt-2 text-sm text-rose-500">
                  {detailSubmitError}
                </p>
              ) : null}
              <div className="mt-3 flex items-center justify-end">
                <button
                  type="button"
                  onClick={handleSubmitDetailAnswer}
                  disabled={detailSubmitting}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90 disabled:opacity-60"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    send
                  </span>
                  {detailSubmitting ? "Đang gửi..." : "Gửi bình luận"}
                </button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </PageTransition>
  );
};

export default ForumPage;
