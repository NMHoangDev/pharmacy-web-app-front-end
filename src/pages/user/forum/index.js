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
import "../../../styles/storefront-premium.css";

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
        setError(err.message || "Không thể tải câu hỏi.");
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
      setPagination((prev) => ({ ...prev, page: 1 }));
      setRefreshTick((value) => value + 1);
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
    <PageTransition className="storefront-shell min-h-screen flex flex-col font-display text-slate-900">
      <Header />

      <main className="storefront-container mx-auto w-full max-w-7xl flex-grow px-4 py-6 sm:px-6 lg:px-8">
        <section className="storefront-hero storefront-fade-up rounded-[34px] border border-white/70 px-5 py-8 sm:px-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-400">
                Diễn đàn hỏi đáp
              </div>
              <h1 className="mt-3 text-4xl font-extrabold leading-tight text-slate-900">
                Cộng đồng hỏi đáp về thuốc và sức khỏe
              </h1>
              <p className="mt-3 max-w-3xl text-base text-slate-600">
                Đặt câu hỏi, tham khảo chia sẻ từ cộng đồng và nhận ý kiến tư
                vấn từ đội ngũ dược sĩ.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowForm((value) => !value)}
              className="rounded-2xl bg-slate-900 px-5 py-3 font-semibold text-white transition-colors hover:bg-primary"
            >
              Đặt câu hỏi mới
            </button>
          </div>
        </section>

        <div className="mt-8 flex flex-col gap-8 lg:flex-row">
          <aside className="w-full flex-shrink-0 space-y-6 lg:w-72">
            <div className="storefront-card rounded-[28px] p-5">
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-500">
                Phân loại
              </h3>
              <nav className="space-y-1">
                {[
                  { key: "all", label: "Tất cả câu hỏi", icon: "forum" },
                  {
                    key: "answered",
                    label: "Đã có câu trả lời",
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
                ].map((item) => {
                  const active = filter === item.key;
                  return (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => setFilter(item.key)}
                      className={
                        active
                          ? "flex w-full items-center gap-3 rounded-xl bg-primary/10 px-3 py-2 font-medium text-primary"
                          : "flex w-full items-center gap-3 rounded-xl px-3 py-2 text-slate-600 transition-colors hover:bg-slate-100"
                      }
                    >
                      <span className="material-symbols-outlined text-[20px]">
                        {item.icon}
                      </span>
                      {item.label}
                    </button>
                  );
                })}
              </nav>
            </div>

            <div className="storefront-soft-card rounded-[28px] p-5">
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-500">
                Nhóm thuốc phổ biến
              </h3>
              <div className="flex flex-wrap gap-2">
                {tags.map((tagItem) => (
                  <span
                    key={tagItem.id}
                    className="storefront-pill rounded-full px-3 py-1 text-xs font-medium"
                  >
                    {tagItem.name}
                  </span>
                ))}
              </div>
            </div>
          </aside>

          <div className="flex-1 space-y-6">
            {showForm ? (
              <section className="storefront-card rounded-[28px] p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold text-slate-900">
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
                    className="storefront-input w-full px-4 py-3 text-sm"
                    placeholder="Tiêu đề câu hỏi"
                  />
                  <textarea
                    rows={5}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="storefront-input w-full px-4 py-3 text-sm"
                    placeholder="Mô tả chi tiết câu hỏi của bạn..."
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tagItem) => {
                      const active = selectedTags.includes(tagItem.slug);
                      return (
                        <button
                          key={tagItem.id}
                          type="button"
                          onClick={() => toggleTag(tagItem.slug)}
                          className={
                            active
                              ? "rounded-full bg-primary px-3 py-1 text-xs font-semibold text-white"
                              : "storefront-pill rounded-full px-3 py-1 text-xs font-semibold"
                          }
                        >
                          {tagItem.name}
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
                      An danh
                    </label>
                    <select
                      value={urgency}
                      onChange={(e) => setUrgency(e.target.value)}
                      className="storefront-input h-11 px-3 text-sm"
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
                  <p className="text-sm text-emerald-600">{submitSuccess}</p>
                ) : null}

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handleSubmitQuestion}
                    disabled={submitting}
                    className="rounded-xl bg-primary px-5 py-2.5 font-semibold text-white hover:bg-primary/90 disabled:opacity-60"
                  >
                    {submitting ? "Đang gửi..." : "Gửi câu hỏi"}
                  </button>
                </div>
              </section>
            ) : null}

            <div className="storefront-panel flex flex-col gap-4 rounded-[28px] p-4 sm:flex-row sm:items-center sm:justify-between">
              <h1 className="text-2xl font-bold text-slate-900">
                Diễn đàn hỏi đáp
              </h1>
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-500">Sắp xếp:</span>
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  className="storefront-input h-11 px-3 text-sm font-medium"
                >
                  <option value="newest">Mới nhất</option>
                  <option value="popular">Quan tâm nhất</option>
                  <option value="urgent">Hoạt động gần đây</option>
                </select>
              </div>
            </div>

            <div className="space-y-4">
              {loading ? (
                <div className="py-10 text-center text-slate-500">
                  Đang tải câu hỏi...
                </div>
              ) : error ? (
                <div className="py-10 text-center text-rose-500">{error}</div>
              ) : (
                visible.map((question) => (
                  <button
                    key={question.id}
                    type="button"
                    onClick={() => openDetailDialog(question)}
                    className="storefront-card block w-full rounded-[26px] p-5 text-left transition-all hover:-translate-y-0.5 hover:border-primary/40"
                  >
                    <div className="mb-3 flex items-start justify-between">
                      <div className="flex flex-wrap items-center gap-2">
                        {question.hasPharmacistAnswer ? (
                          <span className="storefront-pill flex items-center gap-1 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider">
                            <span className="material-symbols-outlined text-[14px]">
                              verified
                            </span>
                            Dược sĩ đã trả lời
                          </span>
                        ) : null}
                        <span className="text-xs text-slate-400">
                          Đang bởi {question.asker?.displayName || "Ẩn danh"} •{" "}
                          {formatTime(question.createdAt)}
                        </span>
                      </div>
                    </div>

                    <h2 className="mb-2 text-lg font-bold text-slate-900 transition-colors hover:text-primary">
                      {question.title}
                    </h2>
                    <p className="mb-4 line-clamp-2 text-sm leading-relaxed text-slate-600">
                      {question.excerpt}
                    </p>

                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div className="flex flex-wrap gap-2">
                        {(question.tags || []).map((tagItem) => (
                          <span
                            key={tagItem.id}
                            className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium uppercase text-slate-500"
                          >
                            {tagItem.name}
                          </span>
                        ))}
                      </div>
                      <div className="flex items-center gap-6 text-sm text-slate-500">
                        <div className="flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-[18px]">
                            forum
                          </span>
                          {`${question.answerCount} cau tra loi`}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-[18px]">
                            schedule
                          </span>
                          {formatTime(question.lastActivityAt)}
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
                  className="rounded-lg p-2 text-slate-400 transition-all hover:bg-primary/10 hover:text-primary"
                  onClick={() =>
                    setPagination((prev) => ({
                      ...prev,
                      page: Math.max(1, prev.page - 1),
                    }))
                  }
                >
                  <span className="material-symbols-outlined">
                    chevron_left
                  </span>
                </button>
                <button
                  type="button"
                  className="h-10 w-10 rounded-lg bg-primary font-bold text-white shadow-md shadow-primary/20"
                >
                  {pagination.page}
                </button>
                <button
                  type="button"
                  className="rounded-lg p-2 text-slate-400 transition-all hover:bg-primary/10 hover:text-primary"
                  onClick={() =>
                    setPagination((prev) => ({
                      ...prev,
                      page: prev.page + 1,
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

          <aside className="hidden w-72 flex-shrink-0 space-y-6 xl:block">
            <div className="storefront-hero rounded-[28px] p-6 shadow-xl shadow-sky-500/10">
              <h3 className="mb-4 text-lg font-bold text-slate-900">
                Thống kê cộng đồng
              </h3>
              <div className="space-y-4">
                {[
                  { label: "Dược sĩ trực tuyến", value: 24 },
                  { label: "Câu hỏi hôm nay", value: 142 },
                  { label: "Tỷ lệ trả lời", value: "98%" },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center justify-between"
                  >
                    <span className="text-sm text-slate-600">{item.label}</span>
                    <span className="font-bold text-slate-900">
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="storefront-card rounded-[28px] p-5">
              <h3 className="mb-4 font-bold text-slate-900">Dược sĩ nổi bật</h3>
              <div className="space-y-4">
                {[
                  {
                    name: "DS. Nguyen Thi Minh",
                    count: "2.4k câu trả lời",
                  },
                  {
                    name: "DS. Tran Van Nam",
                    count: "1.8k câu trả lời",
                  },
                ].map((item) => (
                  <div key={item.name} className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-slate-200" />
                    <div>
                      <p className="text-sm font-bold text-slate-900">
                        {item.name}
                      </p>
                      <p className="text-[11px] text-slate-500">{item.count}</p>
                    </div>
                    <span className="material-symbols-outlined ml-auto text-[18px] text-primary">
                      verified
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="storefront-soft-card rounded-[28px] border border-yellow-500/20 p-4">
              <div className="mb-2 flex gap-2 text-yellow-600">
                <span className="material-symbols-outlined text-[18px]">
                  warning
                </span>
                <span className="text-xs font-bold uppercase">
                  Lưu ý quan trọng
                </span>
              </div>
              <p className="text-[11px] leading-normal text-slate-600">
                Mọi thông tin trên diễn đàn chỉ mang tính chất tham khảo. Trong
                trường hợp khẩn cấp, vui lòng liên hệ cơ sở y tế gần nhất.
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
        <DialogContent className="max-h-[85vh] max-w-4xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {detailDialog.question?.title || "Chi tiet cau hoi"}
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
            <div className="text-sm text-slate-600">
              {detailDialog.question?.content}
            </div>
            {detailDialog.error ? (
              <div className="text-sm text-rose-500">{detailDialog.error}</div>
            ) : null}
            <div className="space-y-3">
              {detailDialog.answers.length ? (
                detailDialog.answers.map((answer) => (
                  <div
                    key={answer.id}
                    className="rounded-xl border border-slate-200 bg-slate-50 p-3"
                  >
                    <div className="flex gap-3">
                      <div className="h-9 w-9 rounded-full bg-slate-200" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-slate-900">
                            {answer.author?.displayName || "An danh"}
                          </p>
                          <span className="text-xs text-slate-400">
                            {answer.createdAt
                              ? new Date(answer.createdAt).toLocaleString(
                                  "vi-VN",
                                )
                              : ""}
                          </span>
                        </div>
                        <p className="mt-1 text-sm text-slate-700">
                          {answer.content}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-500">Chua co cau tra loi.</p>
              )}
            </div>

            {detailDialog.pagination?.total > detailDialog.answers.length ? (
              <button
                type="button"
                onClick={loadMoreAnswers}
                disabled={detailDialog.loading}
                className="w-full rounded-lg py-2 text-sm font-semibold text-primary hover:bg-primary/10"
              >
                {detailDialog.loading ? "Đang tải..." : "Xem thêm"}
              </button>
            ) : null}

            <div className="pt-2">
              <textarea
                rows={3}
                value={detailAnswerText}
                onChange={(e) => setDetailAnswerText(e.target.value)}
                className="storefront-input w-full p-3 text-sm"
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
                  className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 font-semibold text-white hover:bg-primary/90 disabled:opacity-60"
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
